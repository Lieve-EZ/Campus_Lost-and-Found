import base64
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import inspect, or_, select, text
from sqlalchemy.orm import Session

from .db import Base, SessionLocal, engine, get_db
from .models import Item, Match, User
from .schemas import ItemCreate, ItemOut, UserLogin, UserRegister, UserSessionOut, UserOut
from .storage import BACKEND, UPLOAD_DIR, create_upload, new_key, public_url, save_local

Base.metadata.create_all(bind=engine)


def migrate_sqlite_schema():
    inspector = inspect(engine)
    item_columns = {column["name"] for column in inspector.get_columns("items")}
    if "created_by" not in item_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE items ADD COLUMN created_by VARCHAR(36)"))
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    with engine.begin() as connection:
        if "email" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(254)"))
        if "phone" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(30)"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON users (email)"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone ON users (phone)"))


migrate_sqlite_schema()
app = FastAPI(title="Campus Lost & Found API", version="1.0.0")
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

APP_SECRET = os.getenv("APP_SECRET")
if not APP_SECRET:
    APP_SECRET = secrets.token_urlsafe(32) if os.getenv("ENVIRONMENT", "development") != "production" else None
if not APP_SECRET:
    raise RuntimeError("APP_SECRET must be set in production")
DEFAULT_ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt_bytes = base64.b64decode(salt) if salt else secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 100000)
    return base64.b64encode(digest).decode("utf-8"), base64.b64encode(salt_bytes).decode("utf-8")


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    actual_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(actual_hash, expected_hash)


def issue_token(user: User) -> str:
    payload = f"{user.id}:{user.role}:{int(datetime.now(timezone.utc).timestamp())}"
    digest = hmac.new(APP_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}.{digest}"


def verify_token(token: str) -> str | None:
    if not token or "." not in token:
        return None
    payload, signature = token.split(".", 1)
    expected = hmac.new(APP_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return None
    parts = payload.split(":")
    if len(parts) != 3:
        return None
    user_id, _, issued_at = parts
    try:
        if datetime.now(timezone.utc).timestamp() - int(issued_at) > 60 * 60 * 24:
            return None
    except ValueError:
        return None
    return user_id


def normalize_phone(value: str) -> str:
    return ''.join(character for character in value if character.isdigit())


def ensure_default_admin(db: Session):
    admin = db.scalar(select(User).where(User.username == DEFAULT_ADMIN_USERNAME))
    if admin is None:
        password_hash, password_salt = hash_password(DEFAULT_ADMIN_PASSWORD)
        admin = User(username=DEFAULT_ADMIN_USERNAME, password_hash=password_hash, password_salt=password_salt, role="admin")
        db.add(admin)
        db.commit()
        db.refresh(admin)


with SessionLocal() as session:
    ensure_default_admin(session)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = auth_header.replace("Bearer ", "", 1).strip()
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def score_items(left: Item, right: Item) -> float:
    left_words = set(f"{left.title} {left.description} {left.location or ''}".lower().split())
    right_words = set(f"{right.title} {right.description} {right.location or ''}".lower().split())
    ignored = {"the", "and", "with", "from", "this", "that", "was", "found", "lost"}
    shared = (left_words & right_words) - ignored
    union = (left_words | right_words) - ignored
    return round(len(shared) / len(union), 3) if union else 0.0


def cleanup_expired_items(db: Session):
    now = datetime.now(timezone.utc)
    expired_ids = set()
    all_items = list(db.scalars(select(Item).order_by(Item.created_at.desc())).unique())

    def as_utc(value: datetime) -> datetime:
        return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)

    for item in all_items:
        if now - as_utc(item.created_at) > timedelta(days=3):
            expired_ids.add(item.id)
    for left in all_items:
        for right in all_items:
            if left.id == right.id or left.kind == right.kind:
                continue
            latest_created_at = max(as_utc(left.created_at), as_utc(right.created_at))
            if score_items(left, right) >= 1.0 and now - latest_created_at >= timedelta(days=1):
                expired_ids.add(left.id)
                expired_ids.add(right.id)
    for item_id in sorted(expired_ids):
        item = db.get(Item, item_id)
        if item is not None:
            db.delete(item)
    if expired_ids:
        db.commit()


def serialize(item: Item) -> dict:
    matches = [match for match in item.matches if match.score >= 0.12]
    return {
        "id": item.id,
        "kind": item.kind,
        "title": item.title,
        "description": item.description,
        "location": item.location,
        "reporter": item.reporter,
        "contact": item.contact,
        "photo_key": item.photo_key,
        "photo_url": public_url(item.photo_key),
        "created_by": item.created_by,
        "posted_by": item.user.username if item.user else (item.reporter or "Anonymous"),
        "created_at": item.created_at,
        "matches": [{"item_id": next_item.matched_item_id, "score": next_item.score} for next_item in matches],
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/login", response_model=UserSessionOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    normalized_name = payload.username.strip()
    normalized_phone = normalize_phone(normalized_name)
    user = db.scalar(select(User).where(or_(User.username == normalized_name, User.email == normalized_name.lower(), User.phone == normalized_phone)))
    if user is None:
        raise HTTPException(status_code=404, detail="Account not found. Please create an account first.")
    if not verify_password(payload.password, user.password_salt, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    return {"token": issue_token(user), "user": {"id": user.id, "username": user.username, "role": user.role}}


@app.post("/auth/register", response_model=UserSessionOut, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.username == payload.username)):
        raise HTTPException(status_code=409, detail="That username is already registered. Please choose another.")
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=409, detail="That email is already registered. Please log in instead.")
    normalized_phone = normalize_phone(payload.phone)
    if db.scalar(select(User).where(User.phone == normalized_phone)):
        raise HTTPException(status_code=409, detail="That phone number is already registered. Please log in instead.")
    password_hash, password_salt = hash_password(payload.password)
    user = User(username=payload.username, email=payload.email, phone=normalized_phone, password_hash=password_hash, password_salt=password_salt, role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": issue_token(user), "user": {"id": user.id, "username": user.username, "role": user.role}}


@app.post("/auth/admin-login", response_model=UserSessionOut)
def admin_login(payload: UserLogin, db: Session = Depends(get_db)):
    if payload.username.strip() != DEFAULT_ADMIN_USERNAME or payload.password != DEFAULT_ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Admin credentials are invalid")
    user = db.scalar(select(User).where(User.username == DEFAULT_ADMIN_USERNAME))
    if user is None:
        password_hash, password_salt = hash_password(DEFAULT_ADMIN_PASSWORD)
        user = User(username=DEFAULT_ADMIN_USERNAME, password_hash=password_hash, password_salt=password_salt, role="admin")
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"token": issue_token(user), "user": {"id": user.id, "username": user.username, "role": user.role}}


@app.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username, "role": current_user.role}


@app.get("/items")
def list_items(kind: str = Query(default="", pattern="^(|lost|found)$"), q: str = "", db: Session = Depends(get_db)):
    cleanup_expired_items(db)
    statement = select(Item).order_by(Item.created_at.desc())
    if kind:
        statement = statement.where(Item.kind == kind)
    if q:
        pattern = f"%{q}%"
        statement = statement.where(or_(Item.title.ilike(pattern), Item.description.ilike(pattern), Item.location.ilike(pattern)))
    items = list(db.scalars(statement).unique())
    for item in items:
        for other in items:
            if item.id != other.id and item.kind != other.kind:
                score = score_items(item, other)
                existing = next((match for match in item.matches if match.matched_item_id == other.id), None)
                if score >= 0.12 and not existing:
                    item.matches.append(Match(matched_item_id=other.id, score=score))
    db.commit()
    return {"items": [serialize(item) for item in items]}


@app.post("/items", response_model=ItemOut)
def create_item(payload: ItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = Item(
        kind=payload.kind,
        title=payload.title.strip(),
        description=payload.desc.strip(),
        location=payload.location,
        reporter=payload.reporter or current_user.username,
        contact=payload.contact,
        photo_key=payload.photo_key,
        created_by=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize(item)


@app.get("/me/items")
def my_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = list(db.scalars(select(Item).where(Item.created_by == current_user.id).order_by(Item.created_at.desc())).unique())
    return {"items": [serialize(item) for item in items]}


@app.patch("/items/{item_id}", response_model=ItemOut)
def update_item(item_id: str, payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    if current_user.role != "admin" and item.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own item")

    if payload.get("kind") is not None:
        item.kind = payload["kind"]
    if payload.get("title") is not None:
        item.title = payload["title"].strip()
    if payload.get("desc") is not None:
        item.description = payload["desc"].strip()
    if payload.get("location") is not None:
        item.location = payload["location"]
    if payload.get("reporter") is not None:
        item.reporter = payload["reporter"] or current_user.username
    if payload.get("contact") is not None:
        item.contact = payload["contact"]

    db.commit()
    db.refresh(item)
    return serialize(item)


@app.delete("/items/{item_id}")
def delete_item(item_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    if current_user.role != "admin" and item.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own item")
    db.delete(item)
    db.commit()
    return {"status": "deleted", "id": item_id}


@app.get("/admin/items")
def admin_items(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    cleanup_expired_items(db)
    items = list(db.scalars(select(Item).order_by(Item.created_at.desc())).unique())
    return {"items": [serialize(item) for item in items]}


@app.post("/admin/items", response_model=ItemOut)
def admin_create_item(payload: ItemCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    item = Item(
        kind=payload.kind,
        title=payload.title.strip(),
        description=payload.desc.strip(),
        location=payload.location,
        reporter=payload.reporter or "Admin",
        contact=payload.contact,
        photo_key=payload.photo_key,
        created_by=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize(item)


@app.delete("/admin/items/{item_id}")
def admin_delete_item(item_id: str, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"status": "deleted", "id": item_id}


@app.get("/upload-url")
def upload_url(contentType: str = Query(..., pattern=r"^image/(jpeg|jpg|png|webp|gif|bmp|avif|svg\+xml|heic|heif)$"), current_user: User = Depends(get_current_user)):
    key = new_key(contentType)
    return {"upload_url": create_upload(key, contentType), "photo_key": key, "requires_auth": BACKEND == "local"}


if BACKEND == "local":
    @app.put("/uploads/{key:path}")
    async def upload_local(key: str, request: Request, current_user: User = Depends(get_current_user)):
        content = await request.body()
        if not content:
            raise HTTPException(status_code=400, detail="Upload body is required")
        if len(content) > 8 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Images must be 8 MB or smaller")
        save_local(key, content)
        return {"photo_key": key}

    @app.get("/uploads/{key:path}")
    def read_upload(key: str):
        path = UPLOAD_DIR / key
        if not path.is_file():
            raise HTTPException(status_code=404, detail="Image not found")
        return FileResponse(path)
