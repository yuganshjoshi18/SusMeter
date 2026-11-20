from __future__ import annotations

import json

from apps.ml.app.analyzer import analyze_quiz, analyze_text, split_sentences
from apps.ml.app.config import QUESTIONS_PATH
from apps.ml.app.model import LABELS, load_examples, train_model


def test_bundled_dataset_covers_every_label() -> None:
    texts, label_sets = load_examples()
    assert len(texts) >= 50
    for label in LABELS:
        assert any(label in labels for labels in label_sets)


def test_training_produces_real_artifact_metadata() -> None:
    artifact = train_model(save=False)
    metadata = artifact["metadata"]
    assert metadata["totalExamples"] >= 50
    assert metadata["metrics"]["evaluationExamples"] > 0
    for label in LABELS:
        assert label in metadata["metrics"]["perLabel"]


def test_sentence_splitting_handles_punctuation() -> None:
    assert split_sentences("First line. Second line! Third?") == [
        "First line.",
        "Second line!",
        "Third?",
    ]


def test_text_analysis_finds_controlling_language_with_evidence() -> None:
    result = analyze_text(
        "You cannot go out with your friends. Give me your passwords or I will assume "
        "you are hiding something, and I need to know where you are every minute."
    )
    ids = [finding["id"] for finding in result["categories"]]
    assert "controlling" in ids
    finding = next(item for item in result["categories"] if item["id"] == "controlling")
    assert finding["evidence"]
    assert finding["evidence"][0]["text"]
    assert result["overallIndicator"] in {"yellow", "red"}
    assert result["safetyNote"]


def test_text_analysis_recognises_healthy_language() -> None:
    result = analyze_text(
        "I hear that you need tonight to yourself. Take the space you need. "
        "You can disagree with me and I will not punish you for having a different view."
    )
    ids = [finding["id"] for finding in result["categories"]]
    assert "healthy_communication" in ids
    healthy = next(item for item in result["categories"] if item["id"] == "healthy_communication")
    assert healthy["indicator"] == "green"


def test_short_text_is_rejected() -> None:
    try:
        analyze_text("ok")
    except ValueError as exc:
        assert "at least a sentence" in str(exc)
    else:
        raise AssertionError("Expected a validation error")


def test_quiz_analysis_uses_all_categories() -> None:
    bank = json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))
    answers = {
        question["id"]: "c" if index % 2 == 0 else "b"
        for index, question in enumerate(bank["questions"])
    }
    result = analyze_quiz(answers)
    assert len(result["categories"]) == 8
    assert result["meta"]["answeredQuestions"] == len(bank["questions"])
    assert result["overallIndicator"] in {"yellow", "red"}
    assert result["categories"][0]["evidence"]
    assert result["meta"]["engine"] == "structured-rubric-v1"
