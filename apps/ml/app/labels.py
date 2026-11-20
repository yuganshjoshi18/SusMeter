from typing import Literal

from .config import LABELS

Polarity = Literal["risk", "healthy"]

LABEL_META: dict[str, dict[str, str]] = {
    "controlling": {
        "label": "Controlling behaviour",
        "polarity": "risk",
        "description": "Language that sets rules about ordinary choices, monitors whereabouts, or narrows someone's independence.",
        "watchFor": "Rules, surveillance, or decisions made on another person's behalf.",
    },
    "boundary_violation": {
        "label": "Boundary violations",
        "polarity": "risk",
        "description": "Described actions that push past stated limits around privacy, space, time, body, or belongings.",
        "watchFor": "A stated no being ignored, tested, or treated as negotiable.",
    },
    "disrespect": {
        "label": "Disrespectful communication",
        "polarity": "risk",
        "description": "Name-calling, mocking, dismissiveness, or language that treats another person's feelings as unimportant.",
        "watchFor": "Insults, minimising, or contempt disguised as a joke.",
    },
    "accountability": {
        "label": "Accountability",
        "polarity": "healthy",
        "description": "Clear ownership of impact, specific apology language, and signs of changed behaviour.",
        "watchFor": "Ownership that stays specific and is followed by a different action.",
    },
    "coercive": {
        "label": "Coercive language",
        "polarity": "risk",
        "description": "Pressure, threats, guilt, ultimatums, or consequences used to secure compliance.",
        "watchFor": "If/then threats, loyalty tests, or threats to share private information.",
    },
    "healthy_communication": {
        "label": "Healthy communication",
        "polarity": "healthy",
        "description": "Direct, respectful, curious language that makes room for limits, repair, and different views.",
        "watchFor": "Clear requests, respected no's, and space for another perspective.",
    },
}

POLARITY: dict[str, Polarity] = {
    label: LABEL_META[label]["polarity"] for label in LABELS
}


def label_label(label: str) -> str:
    return LABEL_META.get(label, {}).get("label", label.replace("_", " ").title())


def is_healthy(label: str) -> bool:
    return POLARITY.get(label) == "healthy"
