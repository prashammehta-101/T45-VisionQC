from threading import Event, Thread
from io import BytesIO
import time

import pytest
from fastapi.testclient import TestClient
from app import main
from PIL import Image


@pytest.fixture
def training_workspace(tmp_path, monkeypatch):
    references = tmp_path / "references"
    models = tmp_path / "models"
    items = []
    for index, split in enumerate(["train"] * 20 + ["validation", "test"]):
        folder = references / str(index)
        folder.mkdir(parents=True)
        (folder / "image.jpg").write_bytes(b"test image")
        items.append({"id": str(index), "split": split, "approved": True})
    monkeypatch.setattr(main, "REFERENCE_DIR", references)
    monkeypatch.setattr(main, "MODEL_DIR", models)
    monkeypatch.setattr(main, "list_references", lambda: items)
    monkeypatch.setattr(main, "training_state", {"status": "idle", "error": None})
    return models


def wait_for_completion(client):
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        state = client.get("/api/train").json()
        if state["status"] != "running":
            return state
        time.sleep(0.01)
    pytest.fail("Training worker did not finish")


def test_training_returns_before_fit_finishes_and_rejects_duplicates(training_workspace, monkeypatch):
    entered, release = Event(), Event()

    def fit(root, output):
        assert len(list((root / "train" / "good").glob("*"))) == 20
        entered.set()
        assert release.wait(5)
        return {"ready": True}

    monkeypatch.setattr(main, "train_patchcore", fit)
    with TestClient(main.app) as client:
        try:
            response = client.post("/api/train")
            assert response.status_code == 202
            assert response.json()["status"] == "running"
            assert entered.wait(2)
            assert client.get("/api/train").json()["status"] == "running"
            assert client.post("/api/train").status_code == 409
        finally:
            release.set()
            state = wait_for_completion(client)
        assert state == {"status": "completed", "error": None}


def test_failed_training_exposes_error_and_can_be_retried(training_workspace, monkeypatch):
    def fail(root, output):
        raise RuntimeError("checkpoint save failed")

    monkeypatch.setattr(main, "train_patchcore", fail)
    with TestClient(main.app) as client:
        assert client.post("/api/train").status_code == 202
        state = wait_for_completion(client)
        assert state["status"] == "failed"
        assert "checkpoint save failed" in state["error"]
        monkeypatch.setattr(main, "train_patchcore", lambda *args: {"ready": True})
        assert client.post("/api/train").status_code == 202
        assert wait_for_completion(client)["status"] == "completed"


def test_invalid_dataset_does_not_start_job(training_workspace, monkeypatch):
    monkeypatch.setattr(main, "list_references", lambda: [])
    with TestClient(main.app) as client:
        assert client.post("/api/train").status_code == 400
        assert client.get("/api/train").json()["status"] == "idle"


def test_inspection_does_not_block_training_status(training_workspace, monkeypatch):
    entered, release = Event(), Event()
    monkeypatch.setattr(main, "model_status", lambda: {"ready": True})

    def predict(path):
        entered.set()
        assert release.wait(5)
        raise RuntimeError("test inference stopped")

    monkeypatch.setattr(main, "predict", predict)
    image = BytesIO()
    Image.new("RGB", (2, 2)).save(image, format="PNG")
    with TestClient(main.app) as client:
        # Use an isolated database so the check cannot add a real inspection.
        import sqlite3
        from contextlib import contextmanager

        @contextmanager
        def database():
            with sqlite3.connect(":memory:") as db:
                db.execute("CREATE TABLE inspections (id INTEGER PRIMARY KEY, created_at, filename, verdict, anomaly_score, threshold, model_ready, interpretation)")
                yield db

        monkeypatch.setattr(main, "connect", database)
        responses = []
        worker = Thread(target=lambda: responses.append(client.post("/api/inspect", files={"file": ("test.png", image.getvalue(), "image/png")})))
        worker.start()
        try:
            assert entered.wait(2)
            assert client.get("/api/train").status_code == 200
            assert not release.is_set()
        finally:
            release.set()
            worker.join(5)
        assert responses[0].status_code == 200
