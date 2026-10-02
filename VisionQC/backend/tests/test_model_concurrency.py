from threading import Event, Thread

from app.model import serialized_model_operation


def test_model_operations_wait_for_each_other():
    training_started, release_training, prediction_started = Event(), Event(), Event()

    @serialized_model_operation
    def train():
        training_started.set()
        release_training.wait(5)

    @serialized_model_operation
    def predict():
        prediction_started.set()

    training = Thread(target=train)
    prediction = Thread(target=predict)
    training.start()
    try:
        assert training_started.wait(2)
        prediction.start()
        assert not prediction_started.wait(0.1)
    finally:
        release_training.set()
        training.join(5)
        if prediction.ident is not None:
            prediction.join(5)
    assert prediction_started.is_set()
