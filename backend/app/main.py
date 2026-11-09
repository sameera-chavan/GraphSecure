
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="GraphSecure API",
    description="Source code vulnerability detection research backend",
    version="1.0.0"
)

# Allow the local React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    filename: str = Field(default="pasted_code.c", max_length=255)
    source_code: str = Field(min_length=1, max_length=100000)


@app.get("/")
def home():
    return {
        "message": "GraphSecure API is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "FastAPI"
    }


@app.post("/analyze")
def analyze_code(request: AnalysisRequest):
    if not request.source_code.strip():
        raise HTTPException(
            status_code=400,
            detail="Source code cannot be empty."
        )

    return {
        "filename": request.filename,
        "input_received": True,
        "characters": len(request.source_code),
        "lines": len(request.source_code.splitlines()),
        "analysis_status": "received",
        "model_status": "not_connected",
        "message": (
            "Source code received successfully. "
            "The vulnerability detection model is not connected yet."
        )
    }

