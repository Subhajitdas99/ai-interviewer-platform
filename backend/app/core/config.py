import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_NAME = os.getenv(
    "OPENROUTER_MODEL",
    "meta-llama/llama-3.1-8b-instruct",
)

CHROMA_PATH = Path(
    os.getenv(
        "CHROMA_PATH",
        str(BASE_DIR / "chroma_db"),
    )
)

UPLOAD_DIR = Path(
    os.getenv(
        "UPLOAD_DIR",
        str(BASE_DIR / "uploads"),
    )
)

KNOWLEDGE_BASE_DIR = Path(
    os.getenv(
        "KNOWLEDGE_BASE_DIR",
        str(BASE_DIR / "knowledge_base"),
    )
)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

CORS_ORIGIN_REGEX = os.getenv(
    "CORS_ORIGIN_REGEX",
    r"^https://ai-interviewer-platform(?:-[a-z0-9]+)*\.vercel\.app$",
)
