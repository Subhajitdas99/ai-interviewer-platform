from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import (
    CORS_ORIGIN_REGEX,
    CORS_ORIGINS,
)

# Route Imports
from app.api.routes.upload import (
    router as upload_router,
)

from app.api.routes.interview import (
    router as interview_router,
)

from app.api.routes.evaluation import (
    router as evaluation_router,
)

# FastAPI App
app = FastAPI(
    title="AI Interviewer API",
    description=(
        "AI-Powered Candidate Screening "
        "and Technical Interview Platform"
    ),
    version="1.0.0",
)

# Production + Local CORS
origins = [
    "http://localhost:3000",
    "https://ai-interviewer-platform-delta.vercel.app",
]

# Add custom origins from config if available
if CORS_ORIGINS:
    origins.extend(CORS_ORIGINS)

# Remove duplicates
origins = list(set(origins))

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routes
app.include_router(
    upload_router,
    tags=["Resume Upload"],
)

app.include_router(
    interview_router,
    tags=["Interview Generation"],
)

app.include_router(
    evaluation_router,
    tags=["Answer Evaluation"],
)

# Root Endpoint
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Backend Running",
        "status": "success",
        "service": "AI Interviewer API",
    }

# Health Check Endpoint
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "healthy": True,
        "service": "AI Interviewer API",
    }
