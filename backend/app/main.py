
import os
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="GraphSecure API",
    description="Source code vulnerability detection research backend",
    version="1.1.0"
)

# Project root directory
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Trained model location
MODEL_PATH = (
    PROJECT_ROOT / "ml" / "models" / "baseline_model.joblib"
)

# Cache the loaded model
_model_artifact = None


def get_model():
    global _model_artifact

    if _model_artifact is None:
        if not MODEL_PATH.exists():
            return None

        _model_artifact = joblib.load(MODEL_PATH)

    return _model_artifact


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.getenv(
            "FRONTEND_ORIGIN",
            "http://localhost:5173"
        ),
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisRequest(BaseModel):
    filename: str = Field(
        default="pasted_code.c",
        max_length=255
    )
    source_code: str = Field(
        min_length=1,
        max_length=100000
    )


@app.get("/")
def home():
    return {
        "message": "GraphSecure API is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    artifact = get_model()

    return {
        "status": "healthy",
        "backend": "FastAPI",
        "model_status": (
            "connected" if artifact is not None
            else "not_connected"
        )
    }


@app.post("/analyze")
def analyze_code(request: AnalysisRequest):

    source_code = request.source_code.strip()

    if not source_code:
        raise HTTPException(
            status_code=400,
            detail="Source code cannot be empty."
        )

    artifact = get_model()

    if artifact is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "The trained GraphSecure model is not available. "
                "Please configure the model artifact."
            )
        )

    try:
        model = artifact["model"]

        prediction = int(
            model.predict([source_code])[0]
        )

        probabilities = model.predict_proba(
            [source_code]
        )[0]

        prediction_name = (
            "Vulnerable" if prediction == 1 else "Safe"
        )

        score = float(probabilities[prediction])

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Model prediction failed: {str(error)}"
        )

    return {
        "filename": request.filename,
        "input_received": True,
        "characters": len(request.source_code),
        "lines": len(request.source_code.splitlines()),

        "analysis_status": "completed",
        "model_status": "connected",

        "prediction": prediction_name,
        "prediction_label": prediction,
        "model_score": round(score, 4),

        "model_name": artifact.get(
            "model_name",
            "Unknown model"
        ),

        "message": (
            "Experimental baseline prediction completed. "
            "This result is not a confirmed security verdict."
        )
    }
