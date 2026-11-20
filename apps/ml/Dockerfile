FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY apps/ml/requirements.txt ./apps/ml/requirements.txt
RUN pip install --no-cache-dir -r ./apps/ml/requirements.txt

COPY apps ./apps
COPY packages ./packages

EXPOSE 8000

CMD ["uvicorn", "apps.ml.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
