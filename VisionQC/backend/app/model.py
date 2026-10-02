"""PatchCore lifecycle. Anomalib is imported lazily so API/logging work without weights."""
from pathlib import Path
from functools import wraps
from threading import Lock
import json
import numpy as np
from PIL import Image

from .config import MODEL_DIR, ROOT

METADATA = MODEL_DIR / "active.json"
model_operation_lock = Lock()


def serialized_model_operation(operation):
    """Lightning training and prediction share process-wide runtime state."""
    @wraps(operation)
    def run(*args, **kwargs):
        with model_operation_lock:
            return operation(*args, **kwargs)
    return run

def configure_model_caches() -> None:
    """Keep pretrained-weight downloads in the writable project workspace."""
    import os
    cache_root = ROOT / "work" / "model-cache"
    hf_home = cache_root / "huggingface"
    hub_cache = hf_home / "hub"
    torch_cache = cache_root / "torch"
    for directory in (hub_cache, torch_cache):
        directory.mkdir(parents=True, exist_ok=True)
    os.environ["HF_HOME"] = str(hf_home)
    os.environ["HF_HUB_CACHE"] = str(hub_cache)
    os.environ["TORCH_HOME"] = str(torch_cache)
    # These constants are cached when huggingface_hub is first imported. Training
    # can follow a failed attempt in the same running API process, so update them too.
    try:
        import huggingface_hub.constants as hf_constants
        hf_constants.HF_HOME = hf_home
        hf_constants.HF_HUB_CACHE = hub_cache
    except ImportError:
        pass
    try:
        import torch
        torch.hub.set_dir(torch_cache)
    except ImportError:
        pass

def model_status() -> dict:
    return json.loads(METADATA.read_text()) if METADATA.exists() else {"ready": False}

@serialized_model_operation
def train_patchcore(dataset_root: Path, output_dir: Path) -> dict:
    """Fit PatchCore on explicitly assigned normal training photos; keep holdouts distinct."""
    configure_model_caches()
    from anomalib.data import Folder
    from anomalib.engine import Engine
    from anomalib.models import Patchcore
    from anomalib.data.utils import TestSplitMode, ValSplitMode

    # Folder uses train/good for the memory bank and validation/good for validation.
    # test/good remains fully held out for final evaluation after model selection.
    data = Folder(
        name="visionqc", root=str(dataset_root), normal_dir="train/good",
        normal_test_dir="validation/good", normal_split_ratio=0,
        test_split_mode=TestSplitMode.FROM_DIR,
        val_split_mode=ValSplitMode.FROM_TEST,
    )
    data.setup()
    model = Patchcore()
    engine = Engine(default_root_dir=str(output_dir), max_epochs=1, logger=False, enable_checkpointing=True)
    engine.fit(model=model, datamodule=data)
    checkpoints = sorted(output_dir.rglob("*.ckpt"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not checkpoints:
        raise RuntimeError("Anomalib completed without producing a checkpoint")
    metadata = {"ready": True, "checkpoint": str(checkpoints[0]), "trained_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(), "train_count": len(list((dataset_root / "train" / "good").glob("*"))), "validation_count": len(list((dataset_root / "validation" / "good").glob("*"))), "test_count": len(list((dataset_root / "test" / "good").glob("*"))), "validation_note": "Held-out validation and test sets are kept separate from the PatchCore memory bank; calibration is a separate operator decision."}
    pending_metadata = METADATA.with_suffix(".tmp")
    pending_metadata.write_text(json.dumps(metadata, indent=2))
    pending_metadata.replace(METADATA)
    return metadata

@serialized_model_operation
def predict(image_path: Path) -> tuple[float, np.ndarray]:
    """Load the latest checkpoint and run Anomalib inference for one image."""
    configure_model_caches()
    from anomalib.models import Patchcore
    from anomalib.engine import Engine
    from anomalib.data import PredictDataset
    state = model_status()
    if not state.get("ready"):
        raise RuntimeError("No trained model is available")
    model = Patchcore()
    engine = Engine(logger=False)
    dataset = PredictDataset(path=image_path, image_size=(256, 256))
    preds = engine.predict(model=model, dataset=dataset, ckpt_path=state["checkpoint"])
    if not preds:
        raise RuntimeError("Model did not return a prediction")
    item = preds[0]
    score = float(item.pred_score.flatten()[0].item())
    amap = item.anomaly_map.squeeze().detach().cpu().numpy()
    return score, amap

def heatmap_data_url(image_path: Path, anomaly_map: np.ndarray) -> str:
    import base64, io
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    image = Image.open(image_path).convert("RGB")
    fig, ax = plt.subplots(figsize=(6, 4))
    width, height = image.size
    ax.imshow(image)
    # Predictions are generated at the model input size (256 × 256), while a
    # capture can be any native camera resolution. Give the heatmap the image
    # coordinates so the overlay covers the complete captured frame.
    ax.imshow(anomaly_map, cmap="jet", alpha=0.45, interpolation="bilinear", extent=(0, width, height, 0))
    ax.axis("off")
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight", pad_inches=0)
    plt.close(fig)
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
