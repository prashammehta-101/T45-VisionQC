from app.decisions import classify

def test_classify_uses_review_band():
    assert classify(0.2, 0.35, 0.55) == "PASS"
    assert classify(0.35, 0.35, 0.55) == "REVIEW"
    assert classify(0.54, 0.35, 0.55) == "REVIEW"
    assert classify(0.55, 0.35, 0.55) == "FAIL"
    assert classify(None, 0.35, 0.55) == "REVIEW"

def test_decision_bands_have_no_confidence_semantics():
    # Values are raw scores; only boundaries and verdict labels are defined.
    assert classify(0.1, 0.35, 0.55) == "PASS"
    assert classify(0.9, 0.35, 0.55) == "FAIL"
