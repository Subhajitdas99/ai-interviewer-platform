from fastapi import APIRouter

from pydantic import BaseModel

from app.services.question_generator import (
    generate_interview_question
)

router = APIRouter(prefix="/api")


class InterviewRequest(BaseModel):
    role: str
    skills: list[str]
    projects: list[str] = []
    raw_text: str = ""


@router.post("/generate-questions")
async def generate_questions(
    data: InterviewRequest
):
    questions = generate_interview_question(
        role=data.role,
        skills=data.skills,
        projects=data.projects,
        raw_text=data.raw_text,
    )

    return {
        "questions": questions
    }
