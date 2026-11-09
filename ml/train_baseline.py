
from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_ROOT / "data" / "training_data.csv"
MODEL_PATH = PROJECT_ROOT / "models" / "baseline_model.joblib"

# Load labeled training data
data = pd.read_csv(DATA_PATH)

required_columns = {"code", "label"}
if not required_columns.issubset(data.columns):
    raise ValueError("CSV must contain 'code' and 'label' columns.")

data = data.dropna(subset=["code", "label"])
data["label"] = data["label"].astype(int)

if set(data["label"].unique()) != {0, 1}:
    raise ValueError("Labels must contain both 0 (safe) and 1 (vulnerable).")

if data["label"].value_counts().min() < 2:
    raise ValueError("Need at least two examples of each class.")

X_train, X_test, y_train, y_test = train_test_split(
    data["code"],
    data["label"],
    test_size=0.25,
    random_state=42,
    stratify=data["label"],
)

# TF-IDF + Logistic Regression baseline
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        analyzer="char",
        ngram_range=(2, 5),
        max_features=20000,
    )),
    ("classifier", LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42,
    )),
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("Evaluation on held-out examples:")
print(classification_report(
    y_test,
    predictions,
    target_names=["Safe", "Vulnerable"],
    zero_division=0,
))

MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(model, MODEL_PATH)

print(f"Model saved to: {MODEL_PATH}")
print(f"Training examples: {len(X_train)}")
print(f"Testing examples: {len(X_test)}")
