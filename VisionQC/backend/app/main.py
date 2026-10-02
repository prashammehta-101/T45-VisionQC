from datetime import datetime, timezone
from pathlib import Path
import io, json, shutil, uuid
import re
import logging
from threading import Lock, Thread
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from PIL import Image, UnidentifiedImageError
from .config import ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES, MODEL_DIR, REFERENCE_DIR
from .database import connect
from .decisions import classify
from .model import heatmap_data_url, model_status, predict, train_patchcore
from .schemas import InspectionResult, ReferenceImage, Stats, Thresholds

app = FastAPI(title="VisionQC", version="0.1.0", description="Image anomaly inspection API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
THRESHOLDS_FILE = MODEL_DIR / "thresholds.json"
training_lock = Lock()
training_state = {"status": "idle", "error": None}


@app.get("/api/train")
def training_status():
    with training_lock:
        return dict(training_state)


def run_training(items):
    try:
        root = MODEL_DIR / "dataset"
        if root.exists(): shutil.rmtree(root)
        for split in ("train", "validation", "test"):
            (root / split / "good").mkdir(parents=True, exist_ok=True)
        for item in items:
            if item["split"] == "train" and not item["approved"]: continue
            image = next((REFERENCE_DIR / item["id"]).glob("image.*"))
            shutil.copy2(image, root / item["split"] / "good" / f"{item['id']}{image.suffix}")
        train_patchcore(root, MODEL_DIR / "training")
        with training_lock:
            training_state.update(status="completed", error=None)
    except Exception as exc:
        logging.exception("Background training failed")
        with training_lock:
            training_state.update(status="failed", error=f"Training failed: {exc}")

def valid_reference_id(image_id: str) -> bool:
    return re.fullmatch(r"[a-f0-9]{32}", image_id) is not None

def thresholds():
    return json.loads(THRESHOLDS_FILE.read_text()) if THRESHOLDS_FILE.exists() else {"pass_below": 0.35, "fail_at_or_above": 0.55}

def checked_image(data: bytes, filename: str):
    if Path(filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(415, "Use a JPG, PNG, WEBP, or BMP image.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image exceeds the 15 MB limit.")
    try:
        image = Image.open(io.BytesIO(data)); image.verify()
        return Image.open(io.BytesIO(data)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(415, "The uploaded file is not a readable image.")

@app.get("/api/health")
def health():
    openrouter_model = __import__("os").getenv("OPENROUTER_MODEL", "typesafe/jev-router")
    return {"status": "ok", "model": model_status(), "thresholds": thresholds(), "openrouter_configured": bool(__import__("os").getenv("OPENROUTER_API_KEY")), "openrouter_model": openrouter_model}

@app.get("/api/references", response_model=list[ReferenceImage])
def list_references():
    return sorted([json.loads(p.read_text()) for p in REFERENCE_DIR.glob("*/metadata.json")], key=lambda x: x["created_at"], reverse=True)

@app.post("/api/references", response_model=list[ReferenceImage])
async def upload_references(files: list[UploadFile] = File(...), split: str = Form("train"), approved: bool = Form(True)):
    if split not in {"train", "validation", "test"}: raise HTTPException(400, "Split must be train, validation, or test.")
    if not files or len(files) > 100: raise HTTPException(400, "Upload between 1 and 100 reference images at a time.")
    added = []
    for upload in files:
        data = await upload.read(MAX_UPLOAD_BYTES + 1)
        image = checked_image(data, upload.filename or "image")
        image_id = uuid.uuid4().hex
        item_dir = REFERENCE_DIR / image_id; item_dir.mkdir(parents=True)
        filename = Path(upload.filename or "reference.jpg").name
        image.save(item_dir / f"image{Path(filename).suffix.lower()}")
        item = {"id": image_id, "filename": filename, "split": split, "approved": approved, "created_at": datetime.now(timezone.utc).isoformat()}
        (item_dir / "metadata.json").write_text(json.dumps(item, indent=2)); added.append(item)
    return added

@app.patch("/api/references/{image_id}", response_model=ReferenceImage)
def update_reference(image_id: str, split: str | None = None, approved: bool | None = None):
    if not valid_reference_id(image_id): raise HTTPException(404, "Reference image not found.")
    path = REFERENCE_DIR / image_id / "metadata.json"
    if not path.exists(): raise HTTPException(404, "Reference image not found.")
    item = json.loads(path.read_text())
    if split is not None:
        if split not in {"train", "validation", "test"}: raise HTTPException(400, "Invalid split.")
        item["split"] = split
    if approved is not None: item["approved"] = approved
    path.write_text(json.dumps(item, indent=2)); return item

@app.get("/api/references/{image_id}/image")
def reference_image(image_id: str):
    if not valid_reference_id(image_id): raise HTTPException(404, "Reference image not found.")
    folder = REFERENCE_DIR / image_id
    if not folder.exists(): raise HTTPException(404, "Reference image not found.")
    image = next(folder.glob("image.*"), None)
    if image is None: raise HTTPException(404, "Reference image not found.")
    return FileResponse(image)

@app.delete("/api/references/{image_id}")
def delete_reference(image_id: str):
    if not valid_reference_id(image_id): raise HTTPException(404, "Reference image not found.")
    folder = REFERENCE_DIR / image_id
    if not folder.exists(): raise HTTPException(404, "Reference image not found.")
    shutil.rmtree(folder); return {"deleted": True}

@app.post("/api/train", status_code=202)
def train():
    items = list_references()
    chosen = [x for x in items if x["split"] == "train" and x["approved"]]
    if not 20 <= len(chosen) <= 30: raise HTTPException(400, f"Training requires 20–30 approved training photos; found {len(chosen)}.")
    if not any(x["split"] == "validation" for x in items) or not any(x["split"] == "test" for x in items): raise HTTPException(400, "Add separate validation and test images before training.")
    with training_lock:
        if training_state["status"] == "running":
            raise HTTPException(409, "Training is already running.")
        training_state.update(status="running", error=None)
        try:
            Thread(target=run_training, args=(items,), daemon=True).start()
        except Exception as exc:
            training_state.update(status="failed", error=str(exc))
            raise HTTPException(500, "Could not start training.") from exc
        return dict(training_state)

@app.put("/api/thresholds", response_model=Thresholds)
def set_thresholds(value: Thresholds):
    if value.pass_below >= value.fail_at_or_above: raise HTTPException(400, "PASS threshold must be lower than FAIL threshold.")
    THRESHOLDS_FILE.write_text(value.model_dump_json(indent=2)); return value

@app.post("/api/inspect", response_model=InspectionResult)
async def inspect(file: UploadFile = File(...), interpret: bool = Form(False)):
    data = await file.read(MAX_UPLOAD_BYTES + 1); image = checked_image(data, file.filename or "inspection.jpg")
    temp_path = REFERENCE_DIR / f"inspect-{uuid.uuid4().hex}{Path(file.filename or 'image.jpg').suffix.lower()}"; image.save(temp_path)
    state = model_status(); score = None; heatmap = None; note = "Model is not trained yet. Result requires human review."
    if state.get("ready"):
        try:
            score, anomaly_map = await run_in_threadpool(predict, temp_path)
            heatmap = await run_in_threadpool(heatmap_data_url, temp_path, anomaly_map)
            note = "Anomaly score is a PatchCore distance and is not a calibrated confidence or probability."
        except Exception as exc: note = f"Inference unavailable; result requires human review ({exc})."
    limits = thresholds(); verdict = classify(score, limits["pass_below"], limits["fail_at_or_above"]); interpretation = None
    if interpret:
        from .interpretation import interpret_image
        interpretation = await interpret_image(data, file.content_type or "image/jpeg")
    with connect() as db:
        cur = db.execute("INSERT INTO inspections (created_at,filename,verdict,anomaly_score,threshold,model_ready,interpretation) VALUES (?,?,?,?,?,?,?)", (datetime.now(timezone.utc).isoformat(), Path(file.filename or "image").name, verdict, score, limits["fail_at_or_above"], int(bool(state.get("ready"))), interpretation)); record_id = cur.lastrowid
    temp_path.unlink(missing_ok=True)
    return InspectionResult(id=record_id, verdict=verdict, anomaly_score=score, threshold=limits["fail_at_or_above"], heatmap_data_url=heatmap, interpretation=interpretation, model_ready=bool(state.get("ready")), note=note)

@app.get("/api/stats", response_model=Stats)
def stats():
    with connect() as db: rows = db.execute("SELECT verdict, COUNT(*) AS count FROM inspections GROUP BY verdict").fetchall()
    counts = {r["verdict"]: r["count"] for r in rows}; total = sum(counts.values()); fail = counts.get("FAIL", 0)
    return Stats(total=total, pass_count=counts.get("PASS", 0), fail_count=fail, review_count=counts.get("REVIEW", 0), rejection_rate=round(fail / total, 4) if total else 0.0)

@app.get("/api/inspections")
def inspections(limit: int = 50):
    with connect() as db: return [dict(r) for r in db.execute("SELECT * FROM inspections ORDER BY id DESC LIMIT ?", (max(1, min(limit, 200)),)).fetchall()]
