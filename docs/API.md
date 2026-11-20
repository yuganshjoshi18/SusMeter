# SusMeter API documentation

Base URL (local): `http://localhost:4000/api`

The Express API accepts JSON and uses an httpOnly cookie named `susmeter_session`. A `Bearer` token in the `Authorization` header is also accepted. Assessment endpoints work for guests; results are not persisted without a signed-in user.

Errors follow this shape:

```json
{ "error": "A readable message" }
```

Validation errors add an `issues` array with `path` and `message` fields.

---

## Health

### `GET /api/health`

```json
{ "status": "ok", "service": "susmeter-api", "timestamp": "..." }
```

### `GET /api/model/info`

Proxies the ML service metadata, including the real training example count and held-out metrics.

---

## Auth

### `POST /api/auth/register`

```json
{ "name": "Alex", "email": "alex@example.com", "password": "at-least-8-chars" }
```

Returns `201` and `{ "user": { "id", "email", "name", "createdAt" } }`.

### `POST /api/auth/login`

```json
{ "email": "alex@example.com", "password": "..." }
```

### `POST /api/auth/logout`

Clears the session cookie.

### `GET /api/auth/me`

Requires auth. Returns the current user.

### `PATCH /api/auth/me`

Requires auth.

```json
{ "name": "Alex Morgan" }
```

---

## Assessments

### `POST /api/assessments/quiz`

```json
{
  "answers": { "q-comms-1": "a", "q-comms-2": "b" },
  "context": "Optional human context; not fed to the model"
}
```

Returns:

```json
{
  "id": "assessment-id-or-null",
  "saved": true,
  "result": { "...": "AssessmentResult" }
}
```

### `POST /api/assessments/text`

```json
{
  "text": "Paste a conversation or describe a situation here.",
  "context": "Optional context"
}
```

The text must be 12–12,000 characters.

### `GET /api/assessments?limit=10&type=quiz`

Requires auth. Returns recent assessments with `id`, `type`, `title`, `createdAt`, `summary` and `indicator`.

### `GET /api/assessments/:id`

Requires auth. Returns the full assessment, input, result and report.

### `DELETE /api/assessments/:id`

Requires auth. Removes the assessment and its report.

---

## Reports

### `GET /api/reports`

Requires auth. Returns saved report summaries with their assessment metadata.

### `GET /api/reports/:id`

Requires auth. Returns a single report.

---

## Statistics

### `GET /api/stats`

Requires auth.

```json
{
  "totalAssessments": 4,
  "totalReports": 4,
  "quizCount": 2,
  "textCount": 2,
  "indicatorCounts": { "green": 1, "yellow": 2, "red": 1 },
  "mostCheckedCategory": "boundaries",
  "lastAssessmentAt": "...",
  "memberSince": "..."
}
```

---

## Privacy settings

### `GET /api/settings`

Requires auth. Returns the three stored preferences.

### `PATCH /api/settings`

Requires auth.

```json
{
  "storeAssessments": false,
  "allowAnalytics": false,
  "emailNotifications": true
}
```

### `DELETE /api/settings/data`

Requires auth. Deletes all saved assessments and reports for the user, keeps the account.

---

## Question bank

### `GET /api/questions`

Returns the canonical 16-question, eight-category question bank used by the quiz.

---

## ML service (port 8000)

| Route | Method | Description |
| --- | --- | --- |
| `/health` | GET | Service health and model version |
| `/model/info` | GET | Real dataset counts, labels and held-out metrics |
| `/questions` | GET | Canonical question bank |
| `/analyze/text` | POST | Multi-label text signal analysis |
| `/analyze/quiz` | POST | Rubric-based quiz analysis |

No endpoint returns a scientific confidence score or a claim about a person's character. Qualitative signal levels (`low`, `moderate`, `strong`) describe how strongly wording matched a pattern in the model.
