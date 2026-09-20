# Campus Lost & Found API

## Local

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

The local API stores data in `lost_found.db` and images in `backend/uploads`. Set the frontend `VITE_API_URL=http://localhost:8000`.

The Vite development server proxies `/api` to `http://localhost:8000`, so `npm run dev` works when both services run on the same machine. A production build or a frontend opened from another machine does not use that proxy. Set `VITE_API_URL` to the reachable API URL before building, for example `https://campus-lost-found-api.onrender.com`, and set the API's `CORS_ORIGINS` to the exact frontend origin, for example `https://campus-lost-found.example.com`.

For a local network setup, start the API on `0.0.0.0`, set `VITE_API_URL=http://<backend-lan-ip>:8000`, and set `CORS_ORIGINS=http://<frontend-lan-ip>:5173`. Do not use `localhost` for a different machine: in the browser, it always means the machine running the browser.

To share the app with someone on another Wi-Fi network, install `cloudflared`, make sure the frontend uses `VITE_API_URL=/api`, and run `npm run share` from the project root. The command starts both local services and prints a public `trycloudflare.com` URL. Send that URL to your friend. Keep the command running while they use the site.

## Hosted deployment

Use `render.yaml` as a starting point for Render. Provision a managed Postgres database and an S3 bucket (AWS S3, Cloudflare R2, or another S3-compatible provider), then set the S3 variables from `.env.example`. The hosted filesystem is ephemeral, so use S3 for production image storage.

The API exposes `GET /health`, `GET /items`, `POST /items`, and `GET /upload-url`. Interactive documentation is available at `/docs`.
