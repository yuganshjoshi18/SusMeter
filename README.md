# SusMeter

**Trust your gut. Verify with AI.**

**[Access SusMeter →](https://sus-meter.netlify.app/)**

SusMeter is a consumer-style web application for examining reported relationship behaviours. It combines a structured behaviour quiz with a text analyzer powered by a real scikit-learn classifier. Findings are presented as green / yellow / red behavioural indicators, each with the supporting wording attached so you can review the reasoning yourself.

SusMeter analyses **behaviour, evidence and context**. It does not determine personality, diagnose anyone, or claim to know whether an event happened. It is not a safety service. If someone feels unsafe, they should contact local emergency services or a trusted support service.

---

## Contents

- [Live application](#live-application)
- [Architecture](#architecture)
- [Features](#features)
- [Quick start with Docker](#quick-start-with-docker)
- [Local development](#local-development)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Machine learning](#machine-learning)
- [API reference](#api-reference)
- [Privacy and data](#privacy-and-data)
- [Design language](#design-language)
- [Production notes](#production-notes)

---

## Live application

| Environment | URL |
| --- | --- |
| Web app (production) | **[https://sus-meter.netlify.app/](https://sus-meter.netlify.app/)** |
| Express API | `https://susmeter-api.onrender.com` |
| Python ML service | `https://susmeter.onrender.com` |
| Database | Supabase Postgres (session pooler) |

The frontend is served by Netlify. The API and ML service are independent Render deployments, and the database is managed by Supabase. See [Deployment](#deployment) for the full setup.

---

## Architecture

| Path | Stack | Purpose |
| --- | --- | --- |
| `apps/web` | React 19, TypeScript, Vite, Tailwind CSS | Landing page, auth, dashboard, quiz, analyzer, results, history, profile, privacy |
| `apps/api` | Node.js, Express, TypeScript, Prisma | Auth, persistence, reporting, settings, stats, ML proxy |
| `apps/ml` | Python, FastAPI, scikit-learn | Real multi-label text classifier + structured quiz analysis |
| `packages/shared` | TypeScript + JSON | Shared question bank and result types |

Each runtime is deployed independently:

```text
Browser → Netlify (React/Vite) → Render API (Express) → Render ML (FastAPI)
                                        │
                                        └──────────────→ Supabase Postgres
```

The API calls the ML service server-to-server using `ML_SERVICE_URL`. Netlify hosts only the built frontend.

---

## Features

- **Guided behaviour quiz** built on a canonical question bank in `packages/shared/src/questions.json`.
- **Text analysis** using TF-IDF features and logistic regression, with matched sentences and influential terms surfaced as evidence.
- **Qualitative indicators** (green / yellow / red) instead of numeric scores or claimed scientific confidence.
- **Accounts and saved history** with bcrypt password hashing and httpOnly cookie sessions.
- **Privacy controls** to disable future saving, export preferences, and permanently delete stored assessments and reports.
- **Personal dashboard** with assessment statistics and recent activity.
- **Guest checks** that run without an account and are not stored server-side.

---

## Quick start with Docker

```bash
cp .env.example .env
# Set JWT_SECRET to a long random value.
docker compose up --build
```

| Service | URL |
| --- | --- |
| Web | <http://localhost:5173> |
| API health | <http://localhost:4000/api/health> |
| ML health | <http://localhost:8000/health> |
| Postgres | `localhost:5432` (`susmeter` / `susmeter`) |

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

The Python requirements are mandatory for `npm run dev`. The `dev:ml` script checks for FastAPI, Uvicorn, scikit-learn, joblib and pydantic before starting the service. If any are missing, it exits with the exact install command rather than silently skipping the ML service.

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

| Service | URL | Notes |
| --- | --- | --- |
| Web | <http://localhost:5173> | Vite proxies `/api` to Express |
| API | <http://localhost:4000> | `ML_SERVICE_URL` defaults to `http://localhost:8000` |
| ML | <http://localhost:8000> | FastAPI via Python/Uvicorn, entry point `apps.ml.app.main:app` |

The ML service is Python only and is deliberately **not** an npm workspace. Run `npm run dev:ml` to start it alone; the script runs `scripts/dev_ml.py` from the repository root and respects `ML_PORT` from the shell or root `.env`.

---

## Deployment

The three runtimes are hosted independently. Each has its own configuration file:

| File / service | Role |
| --- | --- |
| Supabase project | Managed Postgres database |
| `render.ml.yaml` | Python FastAPI ML service (`susmeter`) |
| `render.api.yaml` | Express API (`susmeter-api`) |
| `netlify.toml` | React/Vite static frontend |

The API and ML service have separate URLs. The API reaches ML through `ML_SERVICE_URL`; Netlify serves only the built frontend. The production frontend is available at **[https://sus-meter.netlify.app/](https://sus-meter.netlify.app/)**.

### 1. Supabase database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → Database → Connection strings** and copy the **Session pooler** string (port `5432`):

```text
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

3. For production, create a dedicated Prisma database role instead of using the `postgres` superuser. Follow the [Supabase Prisma guide](https://supabase.com/docs/guides/database/prisma) and use that role in the connection string.
4. Percent-encode special characters in the password (for example `@` → `%40`). Keep the string secret.

The session pooler supports prepared statements, so the same URL works for both Prisma Client at runtime and `prisma migrate deploy` at startup. Supabase's transaction pooler (port `6543`) is an alternative for heavier traffic, but it needs `?pgbouncer=true` plus a separate direct URL for migrations.

### 2. ML service on Render

1. Push this repository to GitHub.
2. In Render, choose **Blueprints → New Blueprint Instance**, select the repository, and pick `render.ml.yaml` as the Blueprint file.
3. The Blueprint builds `apps/ml/Dockerfile` with the repository root as context. The service listens on Render's injected `PORT`, falling back to `8000` locally.
4. Set the environment variables:

```dotenv
CORS_ORIGINS=*
PYTHONUNBUFFERED=1
```

Do not set `PORT` manually — Render injects it.

5. With the included service name, the URL is `https://susmeter.onrender.com`. Verify it:

```bash
curl https://susmeter.onrender.com/health
curl https://susmeter.onrender.com/model/info
```

If an existing manual service already uses the name `susmeter`, reconfigure or delete it first — Render does not allow duplicate service names.

### 3. API service on Render

1. Create a **second** Blueprint instance from the same repository, this time selecting `render.api.yaml`.
2. When Render prompts for variables, provide:

```dotenv
NODE_ENV=production
DATABASE_URL=<Supabase session pooler string>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
WEB_ORIGIN=https://sus-meter.netlify.app
ML_SERVICE_URL=https://susmeter.onrender.com
```

`JWT_SECRET` is generated automatically by the Blueprint if you leave it to Render. `WEB_ORIGIN` also accepts comma-separated origins.

3. The container runs `prisma migrate deploy` before starting, applying the existing migration to Supabase on first deploy.
4. The URL is normally `https://susmeter-api.onrender.com`. Verify it:

```bash
curl https://susmeter-api.onrender.com/api/health
curl https://susmeter-api.onrender.com/api/model/info
```

The second call proxies the ML service, so a successful response confirms API → ML connectivity. If you change the ML host later, update `ML_SERVICE_URL` on the API service and redeploy.

### 4. Frontend on Netlify

1. In Netlify, choose **Add new site → Import an existing project** and select the same repository. `netlify.toml` supplies the build command, Node version, publish directory and SPA fallback.
2. Add the public build-time variable (UI or CLI). It must include `/api` and point at the **API**, not the ML service:

```bash
netlify env:set VITE_API_URL https://susmeter-api.onrender.com/api
```

3. Trigger a deploy. `VITE_` variables are inlined at build time, so changing the value requires a rebuild.
4. Keep `WEB_ORIGIN` on the API service in sync with your Netlify origin. The deployed site is **[https://sus-meter.netlify.app/](https://sus-meter.netlify.app/)**.

> Never put secrets in `VITE_API_URL` — it is baked into the public client bundle. Leave it empty only for local development, where Vite proxies `/api` to `http://localhost:4000`.

### 5. Free-plan caveat

Render's free web services sleep when idle, and the API's ML call times out after 25 seconds. A cold ML start can exceed that. If users see "The analysis service is unavailable", upgrade both services to a paid always-on plan in `render.api.yaml` and `render.ml.yaml`.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start web, API and ML together |
| `npm run dev:web` | Start the Vite frontend only |
| `npm run dev:api` | Start the Express API only |
| `npm run dev:ml` | Start the Python ML service with dependency preflight |
| `npm run build` | Build shared package, web and API |
| `npm test` | Run shared, web and API test suites |
| `npm run test:ml` | Run Python ML tests |
| `npm run train:ml` | Train and persist the scikit-learn model |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create/apply a development migration |

---

## Machine learning

The text analyzer uses a real `TfidfVectorizer` (word and character n-grams) and a `OneVsRestClassifier` wrapping logistic regression. It is trained on the hand-written examples in `apps/ml/data/text_examples.jsonl`.

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

## API reference

See [`docs/API.md`](docs/API.md) for routes, request bodies and response shapes.

Quick smoke checks against local services:

```bash
curl http://localhost:4000/api/health
curl http://localhost:8000/health
curl http://localhost:8000/model/info
```

Production equivalents:

```bash
curl https://susmeter-api.onrender.com/api/health
curl https://susmeter.onrender.com/health
```

---

## Privacy and data

- Guest checks run without an account and are not stored server-side.
- Signed-in users can turn future saving off in Privacy settings.
- Saved assessments contain the input and result; reports contain generated summaries.
- Privacy settings can export preferences and permanently delete saved assessments and reports.
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
- Keep `WEB_ORIGIN` on the API in sync with the Netlify origin.
- Set `VITE_API_URL` to the API base including `/api`, then rebuild the frontend.
- Run `npm run build` and both test suites in CI.

---

**Access the live app: [https://sus-meter.netlify.app/](https://sus-meter.netlify.app/)**
