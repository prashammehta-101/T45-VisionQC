from pathlib import Path
import os
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")
DATA_DIR = Path(os.getenv("VISIONQC_DATA_DIR", ROOT / "data"))
REFERENCE_DIR = DATA_DIR / "references"
MODEL_DIR = Path(os.getenv("VISIONQC_MODEL_DIR", ROOT / "models"))
DB_PATH = DATA_DIR / "visionqc.sqlite3"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
for directory in (DATA_DIR, REFERENCE_DIR, MODEL_DIR):
    directory.mkdir(parents=True, exist_ok=True)
