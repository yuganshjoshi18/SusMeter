from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, hamming_loss, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.preprocessing import MultiLabelBinarizer

from .config import (
    DATA_PATH,
    LABELS,
    METRICS_PATH,
    MODEL_PATH,
    MODEL_VERSION,
    MODELS_DIR,
)

_MODEL_CACHE: dict[str, Any] | None = None


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_examples(path: Path = DATA_PATH) -> tuple[list[str], list[list[str]]]:
    texts: list[str] = []
    label_sets: list[list[str]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            row = json.loads(line)
            labels = [label for label in row.get("labels", []) if label in LABELS]
            if not row.get("text") or not labels:
                raise ValueError(f"Invalid training row at line {line_number}")
            texts.append(row["text"])
            label_sets.append(labels)
    if not texts:
        raise ValueError("No training examples found")
    return texts, label_sets


def build_pipeline() -> Pipeline:
    features = FeatureUnion(
        [
            (
                "word",
                TfidfVectorizer(
                    lowercase=True,
                    strip_accents="unicode",
                    ngram_range=(1, 2),
                    min_df=1,
                    sublinear_tf=True,
                ),
            ),
            (
                "char",
                TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(3, 5),
                    min_df=2,
                    sublinear_tf=True,
                ),
            ),
        ],
        transformer_weights={"word": 1.0, "char": 0.6},
    )
    classifier = OneVsRestClassifier(
        LogisticRegression(
            C=3.0,
            class_weight="balanced",
            max_iter=2000,
            solver="liblinear",
            random_state=42,
        )
    )
    return Pipeline([("features", features), ("clf", classifier)])


def _ensure_label_coverage(
    label_sets: list[list[str]], train_idx: list[int], test_idx: list[int]
) -> tuple[list[int], list[int]]:
    """Make sure every label appears in the held-out split when the data allows it."""
    train_idx = list(train_idx)
    test_idx = list(test_idx)
    for label in LABELS:
        in_test = any(label in label_sets[i] for i in test_idx)
        if in_test:
            continue
        donor = next((i for i in train_idx if label in label_sets[i]), None)
        if donor is None:
            continue
        # Swap with a test row that has more than one label to preserve balance.
        swap_target = next(
            (i for i in test_idx if len(label_sets[i]) > 1), test_idx[0]
        )
        train_idx[train_idx.index(donor)] = swap_target
        test_idx[test_idx.index(swap_target)] = donor
    return train_idx, test_idx


def train_model(save: bool = True) -> dict[str, Any]:
    texts, label_sets = load_examples()
    binarizer = MultiLabelBinarizer(classes=LABELS)
    y = binarizer.fit_transform(label_sets)

    indices = list(range(len(texts)))
    train_idx, test_idx = train_test_split(
        indices, test_size=0.25, random_state=42, shuffle=True
    )
    train_idx, test_idx = _ensure_label_coverage(label_sets, train_idx, test_idx)

    pipeline = build_pipeline()
    pipeline.fit([texts[i] for i in train_idx], y[train_idx])

    predictions = pipeline.predict([texts[i] for i in test_idx])
    y_test = y[test_idx]
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, predictions, labels=range(len(LABELS)), zero_division=0
    )
    per_label = {
        label: {
            "precision": round(float(precision[index]), 3),
            "recall": round(float(recall[index]), 3),
            "f1": round(float(f1[index]), 3),
            "support": int(y_test[:, index].sum()),
        }
        for index, label in enumerate(LABELS)
    }
    metrics = {
        "trainingExamples": len(train_idx),
        "evaluationExamples": len(test_idx),
        "labelCounts": {
            label: int(sum(label in labels for labels in label_sets)) for label in LABELS
        },
        "hammingLoss": round(float(hamming_loss(y_test, predictions)), 3),
        "exactMatch": round(float(accuracy_score(y_test, predictions)), 3),
        "perLabel": per_label,
        "note": (
            "Metrics come from a small held-out split of the bundled examples. They "
            "describe this artifact only and are not a clinical or population-level "
            "validation."
        ),
    }

    metadata = {
        "modelVersion": MODEL_VERSION,
        "trainedAt": _utc_now(),
        "totalExamples": len(texts),
        "labels": LABELS,
        "metrics": metrics,
        "thresholdNote": (
            "Operating thresholds produce qualitative signals for readable feedback. "
            "They are not probabilities of harm, intent, or diagnosis."
        ),
    }
    artifact = {"pipeline": pipeline, "metadata": metadata}

    if save:
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(artifact, MODEL_PATH)
        METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    global _MODEL_CACHE
    _MODEL_CACHE = artifact
    return artifact


def load_model(*, auto_train: bool = True) -> dict[str, Any]:
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE
    if MODEL_PATH.exists():
        try:
            _MODEL_CACHE = joblib.load(MODEL_PATH)
            return _MODEL_CACHE
        except Exception:
            # A corrupt or incompatible artifact should be replaced by a real training run.
            pass
    if not auto_train:
        raise FileNotFoundError("No trained SusMeter text model is available")
    return train_model(save=True)


def predict_probabilities(texts: list[str], model: dict[str, Any] | None = None) -> list[dict[str, float]]:
    artifact = model or load_model()
    matrix = artifact["pipeline"].predict_proba(texts)
    return [
        {label: float(matrix[row, index]) for index, label in enumerate(LABELS)}
        for row in range(matrix.shape[0])
    ]


def top_terms_for_label(text: str, label: str, model: dict[str, Any] | None = None, limit: int = 4) -> list[str]:
    artifact = model or load_model()
    pipeline = artifact["pipeline"]
    feature_union = pipeline.named_steps["features"]
    classifier = pipeline.named_steps["clf"]
    label_index = LABELS.index(label)

    vector = feature_union.transform([text])
    active_indices = vector.nonzero()[1]
    if len(active_indices) == 0:
        return []

    word_vectorizer = feature_union.transformer_list[0][1]
    word_names = list(word_vectorizer.get_feature_names_out())
    word_count = len(word_names)
    coefficients = classifier.estimators_[label_index].coef_[0]

    candidates: list[tuple[float, str]] = []
    for index in active_indices:
        if index < word_count:
            term = word_names[index]
        else:
            continue
        if len(term) < 3:
            continue
        score = float(abs(coefficients[index]) * vector[0, index])
        candidates.append((score, term))

    candidates.sort(reverse=True)
    terms: list[str] = []
    for _, term in candidates:
        if term not in terms:
            terms.append(term)
        if len(terms) >= limit:
            break
    return terms
