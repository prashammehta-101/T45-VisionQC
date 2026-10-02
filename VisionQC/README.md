# VisionQC integration

The existing Start Inspection links open /inspection, which redirects to /visionqc/. The original workspace remains at /inspection/legacy. The imported dashboard lives in Frontend/visionqc and uses its original CSS in a separate HTML page.

## Start the imported API

From the repository root, run in PowerShell:

```powershell
cd VisionQC
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Start the existing frontend with npm run dev from Frontend. No additional frontend dependencies are needed. The dashboard requests /visionqc-api/*; Vite forwards these to port 8000 as /api/*. The original /api proxy still targets the existing backend on port 3000. Keep that backend running for the landing page and legacy workspace.

The imported API uses its own data/ and models/ folders inside VisionQC. Training requires approved reference photos and separate validation and test images. Camera access requires localhost or HTTPS. Optional OpenRouter credentials belong in VisionQC/.env.

For production hosting, serve Frontend/dist/visionqc/index.html at /visionqc/ before the main SPA fallback, and configure the same /visionqc-api/* to http://127.0.0.1:8000/api/* proxy. Vite's proxy works in dev and preview only.

Backend tests: from VisionQC, run .\.venv\Scripts\python.exe -m pytest backend/tests.
