def classify(score: float | None, pass_below: float, fail_at_or_above: float) -> str:
    """A score is a model distance, not a probability. The middle band is review."""
    if score is None:
        return "REVIEW"
    if score < pass_below:
        return "PASS"
    if score >= fail_at_or_above:
        return "FAIL"
    return "REVIEW"
