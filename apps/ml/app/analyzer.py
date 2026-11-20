from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

from .config import (
    CONTEXT_NOTE,
    EVIDENCE_THRESHOLD,
    LABEL_THRESHOLDS,
    MAX_TEXT_LENGTH,
    QUESTIONS_PATH,
    SAFETY_NOTE,
)
from .labels import LABEL_META, is_healthy, label_label
from .model import load_model, predict_probabilities, top_terms_for_label

POSITIVE_LABELS = [label for label in LABEL_THRESHOLDS if is_healthy(label)]
RISK_LABELS = [label for label in LABEL_THRESHOLDS if not is_healthy(label)]

TEXT_LIMITATIONS = [
    "The model reads wording, not intent, tone of voice, or whether events are accurate.",
    "A short, one-sided, or heavily edited sample can distort the signal.",
    "Sarcasm, quoted messages, and third-person descriptions can be misread.",
    "Indicators describe language patterns. They do not describe a person's character.",
]

QUIZ_LIMITATIONS = [
    "Quiz answers are self-reported perceptions, not verified events.",
    "A single answer is a weak signal. Patterns across categories matter more.",
    "This rubric cannot identify intent, diagnose anyone, or assess safety on its own.",
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _signal(score: float) -> str:
    if score >= 0.72:
        return "strong"
    if score >= 0.5:
        return "moderate"
    return "low"


def _risk_indicator(score: float, threshold: float) -> str:
    if score >= max(threshold + 0.22, 0.68):
        return "red"
    return "yellow"


def _overall(findings: list[dict[str, Any]]) -> str:
    indicators = [finding["indicator"] for finding in findings]
    if "red" in indicators:
        return "red"
    if "yellow" in indicators:
        return "yellow"
    return "green"


def split_sentences(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text).strip()
    if not normalized:
        return []
    parts = re.split(r"(?<=[.!?])\s+|\n+", normalized)
    return [part.strip() for part in parts if len(part.strip()) > 1][:80]


def analyze_text(text: str, context: str | None = None) -> dict[str, Any]:
    cleaned = (text or "").strip()
    if len(cleaned) < 12:
        raise ValueError("Please add at least a sentence or two before running a check.")
    if len(cleaned) > MAX_TEXT_LENGTH:
        raise ValueError(f"Text must be {MAX_TEXT_LENGTH} characters or fewer.")

    model = load_model()
    sentences = split_sentences(cleaned)
    document_probabilities = predict_probabilities([cleaned], model)[0]
    sentence_probabilities = (
        predict_probabilities(sentences, model) if sentences else []
    )

    findings: list[dict[str, Any]] = []
    for label, threshold in LABEL_THRESHOLDS.items():
        sentence_scores = [row[label] for row in sentence_probabilities]
        score = max([document_probabilities[label], *sentence_scores]) if sentence_scores else document_probabilities[label]
        if score < threshold:
            continue

        meta = LABEL_META[label]
        evidence: list[dict[str, Any]] = []
        for sentence, probabilities in zip(sentences, sentence_probabilities):
            if probabilities[label] < EVIDENCE_THRESHOLD:
                continue
            terms = top_terms_for_label(sentence, label, model)
            evidence.append(
                {
                    "id": f"{label}-{len(evidence) + 1}",
                    "text": sentence[:400],
                    "label": meta["label"],
                    "signal": _signal(probabilities[label]),
                    "note": (
                        "Wording contributing to this signal: " + ", ".join(terms)
                        if terms
                        else "Wording pattern associated with this category."
                    ),
                    "source": "Pasted text",
                }
            )
        evidence.sort(key=lambda item: 1 if item["signal"] == "strong" else 0, reverse=True)
        evidence = evidence[:3]

        if not evidence:
            excerpt = cleaned[:240] + ("…" if len(cleaned) > 240 else "")
            evidence = [
                {
                    "id": f"{label}-1",
                    "text": excerpt,
                    "label": meta["label"],
                    "signal": _signal(score),
                    "note": "The overall passage contributed more than any single sentence.",
                    "source": "Pasted text",
                }
            ]

        healthy = is_healthy(label)
        indicator = "green" if healthy else _risk_indicator(score, threshold)
        summary = (
            f"{meta['watchFor']} This passage contains language consistent with that pattern."
            if not healthy
            else f"{meta['watchFor']} This passage contains language consistent with that pattern."
        )
        findings.append(
            {
                "id": label,
                "label": meta["label"],
                "indicator": indicator,
                "summary": summary,
                "detail": meta["description"],
                "evidence": evidence,
                "limitations": TEXT_LIMITATIONS[:2],
                "_score": round(score, 4),
            }
        )

    if not findings:
        findings.append(
            {
                "id": "no-clear-signal",
                "label": "No clear pattern detected",
                "indicator": "green",
                "summary": "The model did not find a strong match for the categories it checks.",
                "detail": "That is not a clean bill of health. It means this sample did not contain a clear signal above the operating thresholds.",
                "evidence": [
                    {
                        "id": "no-clear-signal-1",
                        "text": cleaned[:240] + ("…" if len(cleaned) > 240 else ""),
                        "label": "Reviewed passage",
                        "signal": "low",
                        "note": "No category crossed the reporting threshold.",
                        "source": "Pasted text",
                    }
                ],
                "limitations": TEXT_LIMITATIONS[:2],
                "_score": 0,
            }
        )

    for finding in findings:
        finding.pop("_score", None)

    strengths = [finding["label"] for finding in findings if is_healthy(finding["id"])]
    watchpoints = [finding["label"] for finding in findings if not is_healthy(finding["id"])]
    limitations = list(TEXT_LIMITATIONS)
    if context and context.strip():
        limitations.append(
            "Context you supplied is shown for human review and was not used to change the model output."
        )

    length = len(cleaned)
    uncertainty_level = "high" if length < 240 or len(sentences) < 2 else "moderate"
    uncertainty_explanation = (
        "This sample is brief, so a single phrase may carry too much weight. Add more context for a steadier read."
        if uncertainty_level == "high"
        else "Results reflect this passage only. Changing the wording or adding context may change the output."
    )

    return {
        "kind": "text",
        "title": "Conversation check",
        "headline": "Your results are ready.",
        "summary": (
            f"Not every red flag is a dealbreaker. {CONTEXT_NOTE} "
            f"We found {len(findings)} area{'s' if len(findings) != 1 else ''} worth reviewing."
        ),
        "overallIndicator": _overall(findings),
        "categories": findings,
        "strengths": strengths,
        "watchpoints": watchpoints,
        "limitations": limitations,
        "uncertainty": {
            "level": uncertainty_level,
            "explanation": uncertainty_explanation,
        },
        "meta": {
            "engine": "text-signals-1.0.0",
            "modelVersion": load_model()["metadata"]["modelVersion"],
            "analyzedCharacters": length,
            "generatedAt": _now(),
            "context": context.strip()[:1000] if context else None,
        },
        "safetyNote": SAFETY_NOTE,
    }


def _load_question_bank() -> dict[str, Any]:
    return json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))


def analyze_quiz(answers: dict[str, str]) -> dict[str, Any]:
    if not isinstance(answers, dict) or not answers:
        raise ValueError("No answers were provided.")

    bank = _load_question_bank()
    questions = bank["questions"]
    categories = {category["id"]: category for category in bank["categories"]}
    questions_by_id = {question["id"]: question for question in questions}

    unknown = [key for key in answers if key not in questions_by_id]
    if unknown:
        raise ValueError(f"Unknown question id: {unknown[0]}")

    weights: dict[str, list[int]] = defaultdict(list)
    evidence: dict[str, list[dict[str, Any]]] = defaultdict(list)
    answered = 0

    for question in questions:
        option_id = answers.get(question["id"])
        if not option_id:
            continue
        option = next((item for item in question["options"] if item["id"] == option_id), None)
        if option is None:
            raise ValueError(f"Invalid option for question {question['id']}")
        answered += 1
        category = question["category"]
        weights[category].append(int(option["weight"]))
        if option["weight"] > 0 or option["weight"] == 0:
            evidence[category].append(
                {
                    "id": f"{question['id']}-{option['id']}",
                    "text": option["label"],
                    "label": categories[category]["label"],
                    "signal": "strong" if option["weight"] >= 3 else "moderate" if option["weight"] == 2 else "low",
                    "note": option["note"],
                    "source": question["prompt"],
                }
            )

    if answered == 0:
        raise ValueError("Answer at least one question before checking results.")

    findings: list[dict[str, Any]] = []
    for category_id, values in weights.items():
        meta = categories[category_id]
        average = sum(values) / len(values)
        indicator = "green" if average < 1.2 else "yellow" if average < 2.2 else "red"
        supporting = evidence[category_id]
        supporting.sort(key=lambda item: {"strong": 3, "moderate": 2, "low": 1}[item["signal"]], reverse=True)
        supporting = supporting[:3]

        if indicator == "green":
            summary = meta["healthySignal"]
        elif indicator == "yellow":
            summary = f"Mixed signals. {meta['watchSignal']}"
        else:
            summary = meta["watchSignal"]

        findings.append(
            {
                "id": category_id,
                "label": meta["label"],
                "indicator": indicator,
                "summary": summary,
                "detail": (
                    f"Based on {len(values)} reported example{'s' if len(values) != 1 else ''}. "
                    f"{meta['description']}"
                ),
                "evidence": supporting,
                "limitations": QUIZ_LIMITATIONS[:1],
            }
        )

    order = [category["id"] for category in bank["categories"]]
    findings.sort(key=lambda finding: order.index(finding["id"]))

    red_count = sum(1 for finding in findings if finding["indicator"] == "red")
    yellow_count = sum(1 for finding in findings if finding["indicator"] == "yellow")
    if red_count >= 2:
        overall = "red"
    elif red_count == 1 or yellow_count >= 3:
        overall = "yellow"
    else:
        overall = "green"

    strengths = [
        finding["label"] for finding in findings if finding["indicator"] == "green"
    ]
    watchpoints = [
        finding["label"] for finding in findings if finding["indicator"] != "green"
    ]
    complete = answered == len(questions)
    uncertainty_level = "moderate" if complete else "high"
    uncertainty_explanation = (
        "All questions were answered, but self-reports still reflect perception rather than verified events."
        if complete
        else "Some questions were skipped, so the picture is incomplete. Add more answers for a fuller read."
    )

    return {
        "kind": "quiz",
        "title": "Behaviour check",
        "headline": "Your results are ready.",
        "summary": (
            f"Not every red flag is a dealbreaker. {CONTEXT_NOTE} "
            f"This check reviewed {answered} of {len(questions)} questions across {len(findings)} areas."
        ),
        "overallIndicator": overall,
        "categories": findings,
        "strengths": strengths,
        "watchpoints": watchpoints,
        "limitations": QUIZ_LIMITATIONS,
        "uncertainty": {
            "level": uncertainty_level,
            "explanation": uncertainty_explanation,
        },
        "meta": {
            "engine": "structured-rubric-v1",
            "answeredQuestions": answered,
            "totalQuestions": len(questions),
            "generatedAt": _now(),
        },
        "safetyNote": SAFETY_NOTE,
    }
