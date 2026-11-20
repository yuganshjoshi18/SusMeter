from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BASE_DIR.parents[1]

DATA_PATH = BASE_DIR / "data" / "text_examples.jsonl"
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "text_model.joblib"
METRICS_PATH = MODELS_DIR / "metrics.json"
QUESTIONS_PATH = ROOT_DIR / "packages" / "shared" / "src" / "questions.json"

MODEL_VERSION = "text-signals-1.0.0"

LABELS = [
    "controlling",
    "boundary_violation",
    "disrespect",
    "accountability",
    "coercive",
    "healthy_communication",
]

# Operating thresholds chosen for readable qualitative output, not clinical validation.
LABEL_THRESHOLDS = {
    "controlling": 0.46,
    "boundary_violation": 0.46,
    "disrespect": 0.46,
    "coercive": 0.48,
    "accountability": 0.52,
    "healthy_communication": 0.52,
}

EVIDENCE_THRESHOLD = 0.34
MAX_TEXT_LENGTH = 12_000

SAFETY_NOTE = (
    "This tool examines reported behaviour, not character or intent. It cannot verify "
    "what happened, diagnose anyone, or replace safety planning. If you feel unsafe, "
    "contact local emergency services or a trusted support service."
)
CONTEXT_NOTE = "Context matters. Always."
