import mimetypes
import os
from pathlib import Path
from uuid import uuid4
import boto3

BACKEND = os.getenv("STORAGE_BACKEND", "local").lower()
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
PUBLIC_MEDIA_URL = os.getenv("PUBLIC_MEDIA_URL", "").rstrip("/")


def create_upload(key: str, content_type: str) -> str:
    if BACKEND == "s3":
        client = boto3.client("s3", region_name=os.getenv("S3_REGION"), endpoint_url=os.getenv("S3_ENDPOINT_URL") or None)
        return client.generate_presigned_url("put_object", Params={"Bucket": os.environ["S3_BUCKET"], "Key": key, "ContentType": content_type}, ExpiresIn=900, HttpMethod="PUT")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    public_base = os.getenv('API_PUBLIC_URL', '').rstrip('/')
    return f"{public_base}/uploads/{key}" if public_base else f"/uploads/{key}"


def public_url(key: str | None) -> str | None:
    if not key:
        return None
    if BACKEND == "s3":
        if PUBLIC_MEDIA_URL:
            return f"{PUBLIC_MEDIA_URL}/{key}"
        return f"https://{os.environ['S3_BUCKET']}.s3.{os.getenv('S3_REGION', 'us-east-1')}.amazonaws.com/{key}"
    public_base = os.getenv('API_PUBLIC_URL', '').rstrip('/')
    return f"{public_base}/uploads/{key}" if public_base else f"/uploads/{key}"


def new_key(content_type: str) -> str:
    extension = mimetypes.guess_extension(content_type) or ".bin"
    return f"items/{uuid4()}{extension}"


def save_local(key: str, content: bytes) -> None:
    path = UPLOAD_DIR / key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
