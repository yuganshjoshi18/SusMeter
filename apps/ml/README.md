# SusMeter ML service

FastAPI + scikit-learn service for behavioural signal analysis.

## Run

```bash
# From the repository root
python -m pip install -r apps/ml/requirements.txt

# Preferred: preflight check + Uvicorn from the repo root
npm run dev:ml

# Equivalent manual command
python -m uvicorn apps.ml.app.main:app --reload --host 0.0.0.0 --port 8000
```

`npm run dev` also starts this service on port 8000. `scripts/dev_ml.py` prints the install
command and exits with a non-zero status if the Python dependencies are missing.

## Train

```bash
python -m apps.ml.train
```

The training script reads `data/text_examples.jsonl`, fits a word + character TF-IDF FeatureUnion with a one-vs-rest logistic regression classifier, writes `models/text_model.joblib`, and records real held-out metrics in `models/metrics.json`.

No dataset size, accuracy number or model capability is hardcoded in the UI. The API reads the artifact metadata.

## Design notes

- Text analysis is multi-label and returns evidence sentences with contributing word features.
- Quiz analysis is a transparent rubric over the shared question bank; it is not presented as an ML classifier.
- All responses include uncertainty and limitations.
- Qualitative signal levels are operating thresholds, not probabilities of harm or intent.
