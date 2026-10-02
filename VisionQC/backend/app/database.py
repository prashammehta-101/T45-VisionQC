import sqlite3
from contextlib import contextmanager
from .config import DB_PATH

@contextmanager
def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    try:
        db.execute("""CREATE TABLE IF NOT EXISTS inspections (
            id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL,
            filename TEXT NOT NULL, verdict TEXT NOT NULL,
            anomaly_score REAL, threshold REAL, model_ready INTEGER NOT NULL,
            interpretation TEXT
        )""")
        db.commit()
        yield db
    finally:
        db.close()
