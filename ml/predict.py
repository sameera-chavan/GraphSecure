from pathlib import Path
import joblib

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "models" / "baseline_model.joblib"

artifact = joblib.load(MODEL_PATH)
model = artifact["model"]


def predict_code(source_code):
    prediction = int(model.predict([source_code])[0])
    probabilities = model.predict_proba([source_code])[0]

    return {
        "prediction": (
            "Vulnerable" if prediction == 1 else "Safe"
        ),
        "label": prediction,
        "score": round(float(probabilities[prediction]), 4),
        "model": artifact["model_name"],
    }


if __name__ == "__main__":
    sample_code = """
    int add_numbers(int a, int b) {
        return a + b;
    }
    """

    result = predict_code(sample_code)

    print("GraphSecure ML Prediction")
    print("-------------------------")
    print("Prediction:", result["prediction"])
    print("Label:", result["label"])
    print("Model score:", result["score"])
    print("Model:", result["model"])
    print("\nExperimental baseline only.")