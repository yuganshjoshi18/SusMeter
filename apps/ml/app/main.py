from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .analyzer import analyze_quiz, analyze_text
from .config import CONTEXT_NOTE, MAX_TEXT_LENGTH, QUESTIONS_PATH, SAFETY_NOTE
from .labels import LABEL_META
from .model import load_model


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_model(auto_train=True)
    yield


app = FastAPI(
    title="SusMeter ML Service",
    description="Behavioural signal analysis for pasted text and structured quiz responses.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(ValueError)
async def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"error": str(exc)})


class TextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)
    context: str | None = Field(default=None, max_length=2000)


class QuizRequest(BaseModel):
    answers: dict[str, str] = Field(default_factory=dict)


@app.get("/health")
def health() -> dict[str, object]:
    artifact = load_model()
    return {
        "status": "ok",
        "service": "susmeter-ml",
        "modelLoaded": True,
        "modelVersion": artifact["metadata"]["modelVersion"],
        "trainingExamples": artifact["metadata"]["totalExamples"],
    }


@app.get("/model/info")
def model_info() -> dict[str, object]:
    artifact = load_model()
    return {
        **artifact["metadata"],
        "labels": LABEL_META,
        "contextNote": CONTEXT_NOTE,
        "safetyNote": SAFETY_NOTE,
    }


@app.get("/questions")
def questions() -> dict[str, object]:
    return json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))


@app.post("/analyze/text")
def text_analysis(payload: TextRequest) -> dict[str, object]:
    return analyze_text(payload.text, payload.context)


@app.post("/analyze/quiz")
def quiz_analysis(payload: QuizRequest) -> dict[str, object]:
    return analyze_quiz(payload.answers)
