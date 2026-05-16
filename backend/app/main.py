from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS

# Route Imports
from app.api.routes.upload import (
    router as upload_router
)

from app.api.routes.interview import (
    router as interview_router
)

from app.api.routes.evaluation import (
    router as evaluation_router
)

# FastAPI App
app = FastAPI(
    title="AI Interviewer API",
    description=(
        "AI-Powered Candidate Screening "
        "and Technical Interview Platform"
    ),
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routes
app.include_router(
    upload_router,
    tags=["Resume Upload"]
)

app.include_router(
    interview_router,
    tags=["Interview Generation"]
)

app.include_router(
    evaluation_router,
    tags=["Answer Evaluation"]
)

# Root Health Check
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Backend Running",
        "status": "success",
        "service": "AI Interviewer API"
    }

# Health Endpoint
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "healthy": True
    }
