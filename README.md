# SusMeter

**Trust your gut. Verify with AI.**

SusMeter is a consumer-style web app for examining reported relationship behaviours. It combines a structured behaviour quiz with a text analyzer that uses a real scikit-learn text classifier. Findings are presented as green / yellow / red behavioural indicators with the supporting wording attached.

SusMeter analyses **behaviour, evidence and context**. It does not determine personality, diagnose anyone, or claim to know whether an event happened. It is not a safety service. If someone feels unsafe, they should contact local emergency services or a trusted support service.

---

## What is in the repo

| Path | Stack | Purpose |
| --- | --- | --- |
| `apps/web` | React 19, TypeScript, Vite, Tailwind CSS | Landing page, auth, dashboard, quiz, analyzer, results, history, profile, privacy |
| `apps/api` | Node.js, Express, TypeScript, Prisma | Auth, persistence, reporting, settings, stats, ML proxy |
| `apps/ml` | Python, FastAPI, scikit-learn | Real multi-label text classifier + structured quiz analysis |
| `packages/shared` | TypeScript + JSON | Shared question bank and result types |

---

## Quick start with Docker

```bash
cp .env.example .env
# Set JWT_SECRET to a long random value.
docker compose up --build
```

- Web: http://localhost:5173
- API: http://localhost:4000/api/health
- ML: http://localhost:8000/health
- Postgres: `localhost:5432` (`susmeter` / `susmeter`)

The API container runs `prisma migrate deploy` before starting. The ML service trains its model on first start if no artifact exists.

---

## Local development

### Prerequisites

- Node.js 20+
- Python 3.11+ (3.12 recommended)
- PostgreSQL 14+

### 1. Install and configure

```bash
npm install
cp .env.example .env
python -m pip install -r apps/ml/requirements.txt
npm run prisma:generate
```

Update `.env` with a real `DATABASE_URL` and `JWT_SECRET`.

The Python requirements are mandatory for `npm run dev`. The root `dev:ml` script checks for
FastAPI, Uvicorn, scikit-learn, joblib and pydantic before starting the service; if any are
missing it exits with the exact install command instead of skipping the ML service.

### 2. Apply migrations

```bash
npm run prisma:migrate
```

### 3. Train the ML artifact (optional on first run)

```bash
npm run train:ml
```

The service also trains automatically at startup from the bundled dataset if the artifact is missing.

### 4. Run everything

```bash
npm run dev
```

This starts all three services concurrently:

- web on `http://localhost:5173` (Vite, `/api` proxied to Express)
- API on `http://localhost:4000` (Express, `ML_SERVICE_URL` defaults to `http://localhost:8000`)
- ML on `http://localhost:8000` (FastAPI via Python/Uvicorn, entry point `apps.ml.app.main:app`)

The ML service is Python only and is deliberately **not** an npm workspace. Run
`npm run dev:ml` to start just the ML service; it runs `scripts/dev_ml.py` from the repository
root and respects `ML_PORT` from the shell or root `.env`.

---

## Deployment

Two config files are included:

| File | Deploys |
| --- | --- |
| `render.yaml` | Postgres, Python FastAPI ML service (`susmeter-ml`), Express API (`susmeter-api`) |
| `netlify.toml` | React/Vite static frontend |

FastAPI is Python-only, so it stays on Render. The Express API proxies ML calls to `ML_SERVICE_URL`; Netlify serves only the built frontend.

### 1. Backend on Render

1. Push this repo to GitHub.
2. In Render, choose **Blueprints → New Blueprint Instance** and select the repo. Render reads `render.yaml` from the root.
3. When Render prompts for `WEB_ORIGIN`, enter your final Netlify URL, e.g. `https://susmeter.netlify.app`. This is the API's allowed CORS origin.
4. Render generates `JWT_SECRET`, wires `DATABASE_URL` from `susmeter-db`, and runs `prisma migrate deploy` before starting the API.
5. Note the API URL (normally `https://susmeter-api.onrender.com`) and check:

```bash
curl https://susmeter-api.onrender.com/api/health
curl https://susmeter-api.onrender.com/api/model/info
```

If Render assigns a different hostname for the ML service, update `ML_SERVICE_URL` in the API service's environment and redeploy.

### 2. Frontend on Netlify

1. In Netlify, choose **Add new site → Import an existing project** and select the same repo. `netlify.toml` supplies the build command, Node version, publish directory and SPA fallback.
2. Set the API base URL (it must include the `/api` suffix):

```bash
netlify env:set VITE_API_URL https://susmeter-api.onrender.com/api
```

3. Trigger a deploy. Update `WEB_ORIGIN` on Render if your Netlify URL differs from the one entered in step 3 above.

> `VITE_API_URL` is a public build-time variable baked into the client bundle; never put secrets in it. Leave it empty only for local development, where Vite proxies `/api` to `http://localhost:4000`.

### 3. Free-plan caveat

Render's free web services sleep when idle and the API's ML call times out after 25 seconds. A cold ML start can exceed that. If users see "The analysis service is unavailable", upgrade `susmeter-ml` and `susmeter-api` to a paid always-on plan in `render.yaml`.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start all three services |
| `npm run build` | Build shared package, web and API |
| `npm test` | Run shared, web and API test suites |
| `npm run test:ml` | Run Python ML tests |
| `npm run train:ml` | Train and persist the scikit-learn model |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create/apply a development migration |

---

## Machine learning

The text analyzer uses a real `TfidfVectorizer` (word + character n-grams) and a `OneVsRestClassifier` wrapping logistic regression. It is trained on the hand-written examples in `apps/ml/data/text_examples.jsonl`.

- Model version: `text-signals-1.0.0`
- Bundled examples: **84** (the exact count is recomputed by `GET /model/info`)
- Labels: controlling behaviour, boundary violations, disrespectful communication, accountability, coercive language, healthy communication
- Held-out metrics are generated by `python -m apps.ml.train` and written to `apps/ml/models/metrics.json`

Those metrics describe the small bundled artifact only. They are **not** a population-level or clinical validation, and the UI never presents an accuracy figure or a scientific confidence score.

Quiz analysis is a transparent, documented rubric over the canonical question bank in `packages/shared/src/questions.json`. It does not pretend to be a second classifier.

### Evidence extraction

For each detected label, the analyzer:

1. splits the passage into sentences,
2. scores the full passage and each sentence,
3. selects sentences above the evidence threshold,
4. surfaces the most influential word features for that label from the trained coefficients.

Every result includes limitations and an uncertainty explanation.

---

## API

See [`docs/API.md`](docs/API.md) for routes, request bodies and response shapes.

Quick smoke checks:

```bash
curl http://localhost:4000/api/health
curl http://localhost:8000/health
curl http://localhost:8000/model/info
```

---

## Privacy and data

- Guest checks run without an account and are not stored server-side.
- Signed-in users can turn future saving off in Privacy settings.
- Saved assessments contain the input and result; reports contain generated summaries.
- Privacy settings can export preferences and permanently delete saved assessments/reports.
- Passwords are hashed with bcrypt. Sessions use httpOnly cookies signed with `JWT_SECRET`.

---

## Design language

- Background `#09090B`, surfaces `#111113`
- Accent `#EF4444`, secondary `#F97316`
- Indicators `#22C55E`, `#EAB308`, `#EF4444`
- Space Grotesk for display, Inter for body
- Solid surfaces, hairline borders, restrained motion, no decorative glass stacks

---

## Production notes

- Set a strong `JWT_SECRET` and `NODE_ENV=production`.
- Put the API and ML service behind HTTPS.
- Replace the default Docker Postgres password.
- Restrict `CORS_ORIGINS` on the ML service to your real web origin.
- Run `npm run build` and both test suites in CI.
