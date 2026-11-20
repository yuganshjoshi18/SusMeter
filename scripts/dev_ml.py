"""Start the SusMeter FastAPI service with a Python dependency preflight.

This script is intentionally dependency-free so it can print actionable
instructions even when the ML requirements have not been installed yet.
"""

from __future__ import annotations

import importlib.util
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_MODULES = {
    "fastapi": "fastapi",
    "uvicorn": "uvicorn",
    "scikit-learn": "sklearn",
    "joblib": "joblib",
    "pydantic": "pydantic",
}
INSTALL_COMMAND = "python -m pip install -r apps/ml/requirements.txt"


def read_setting(key: str) -> str | None:
    """Read an exported variable first, then a simple KEY=VALUE root .env file."""
    if key in os.environ:
        return os.environ[key]

    env_path = ROOT / ".env"
    if not env_path.exists():
        return None

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        if name.strip() == key:
            return value.strip().strip('"').strip("'")
    return None


def ensure_dependencies() -> None:
    missing = [
        package
        for package, module in REQUIRED_MODULES.items()
        if importlib.util.find_spec(module) is None
    ]
    if not missing:
        return

    print(
        "SusMeter ML service cannot start. Missing Python packages: "
        + ", ".join(missing)
        + f"\n\nInstall them from the repository root:\n  {INSTALL_COMMAND}\n\n"
        "Then run 'npm run dev' again.",
        file=sys.stderr,
        flush=True,
    )
    raise SystemExit(1)


def resolve_port() -> int:
    raw_port = read_setting("ML_PORT") or "8000"
    try:
        port = int(raw_port)
    except ValueError:
        print(
            f"Invalid ML_PORT value {raw_port!r}. Use a port number such as 8000.",
            file=sys.stderr,
            flush=True,
        )
        raise SystemExit(1) from None

    if not 1 <= port <= 65535:
        print(
            f"Invalid ML_PORT value {port}. Use a port between 1 and 65535.",
            file=sys.stderr,
            flush=True,
        )
        raise SystemExit(1)
    return port


def main() -> None:
    ensure_dependencies()
    port = resolve_port()

    # Make `apps.ml.app.main:app` importable regardless of the caller's cwd,
    # including uvicorn's reload subprocess.
    os.environ["PYTHONPATH"] = os.pathsep.join(
        [str(ROOT), os.environ.get("PYTHONPATH", "")]
    ).rstrip(os.pathsep)
    sys.path.insert(0, str(ROOT))

    from uvicorn import run

    print(
        f"[susmeter-ml] starting http://localhost:{port} -> apps.ml.app.main:app",
        flush=True,
    )
    run(
        "apps.ml.app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        reload_dirs=[str(ROOT / "apps" / "ml"), str(ROOT / "packages" / "shared")],
    )


if __name__ == "__main__":
    main()
