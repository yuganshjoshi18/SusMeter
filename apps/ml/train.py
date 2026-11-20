"""Train and persist the SusMeter text-signal model.

Run from the repository root with: python -m apps.ml.train
"""

from __future__ import annotations

import json

from .app.config import METRICS_PATH, MODEL_PATH
from .app.model import train_model


def main() -> None:
    artifact = train_model(save=True)
    metadata = artifact["metadata"]
    print(f"SusMeter model version: {metadata['modelVersion']}")
    print(f"Examples used: {metadata['totalExamples']}")
    print(f"Artifact: {MODEL_PATH}")
    print(f"Metrics: {METRICS_PATH}")
    print(json.dumps(metadata["metrics"], indent=2))


if __name__ == "__main__":
    main()
