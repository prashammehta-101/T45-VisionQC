from typing import Literal
from pydantic import BaseModel

Split = Literal["train", "validation", "test"]

class ReferenceImage(BaseModel):
    id: str
    filename: str
    split: Split
    approved: bool
    created_at: str

class Thresholds(BaseModel):
    pass_below: float
    fail_at_or_above: float

class InspectionResult(BaseModel):
    id: int
    verdict: Literal["PASS", "FAIL", "REVIEW"]
    anomaly_score: float | None
    threshold: float | None
    heatmap_data_url: str | None
    interpretation: str | None = None
    model_ready: bool
    note: str

class Stats(BaseModel):
    total: int
    pass_count: int
    fail_count: int
    review_count: int
    rejection_rate: float
