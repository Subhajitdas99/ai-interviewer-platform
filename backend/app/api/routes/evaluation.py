from fastapi import APIRouter

from pydantic import BaseModel

from app.services.evaluator import (
    evaluate_answer
)

router = APIRouter(prefix="/api")


class EvaluationRequest(BaseModel):
    question: str
    answer: str


@router.post("/evaluate")
async def evaluate(
    data: EvaluationRequest
):
    result = evaluate_answer(
        question=data.question,
        answer=data.answer
    )

    return {
        "evaluation":
            result["rawMarkdown"],
        "parsed_evaluation":
            result,
    }
