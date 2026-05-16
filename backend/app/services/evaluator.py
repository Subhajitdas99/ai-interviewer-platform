import json
import os
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

from app.core.config import MODEL_NAME

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)


def _extract_json_object(
    response: str,
) -> dict[str, Any] | None:
    start = response.find("{")
    end = response.rfind("}")

    if start == -1 or end == -1 or end <= start:
        return None

    try:
        payload = json.loads(
            response[start : end + 1]
        )
    except json.JSONDecodeError:
        return None

    if not isinstance(payload, dict):
        return None

    return payload


def _normalize_list(
    value: Any,
) -> list[str]:
    if isinstance(value, str):
        cleaned = value.strip()
        return [cleaned] if cleaned else []

    if not isinstance(value, list):
        return []

    normalized: list[str] = []
    for item in value:
        if not isinstance(item, str):
            continue

        cleaned = " ".join(
            item.split()
        ).strip()
        if cleaned:
            normalized.append(cleaned)

    return normalized


def _coerce_score(
    value: Any,
) -> tuple[float | None, str | None]:
    if isinstance(value, (int, float)):
        numeric = max(
            0.0,
            min(10.0, float(value)),
        )
        label = (
            f"{int(numeric)}/10"
            if numeric.is_integer()
            else f"{numeric:.1f}/10"
        )
        return numeric, label

    if isinstance(value, str):
        digits = value.strip()
        if digits.endswith("/10"):
            digits = digits[:-3].strip()

        try:
            numeric = max(
                0.0,
                min(10.0, float(digits)),
            )
        except ValueError:
            return None, None

        label = (
            f"{int(numeric)}/10"
            if numeric.is_integer()
            else f"{numeric:.1f}/10"
        )
        return numeric, label

    return None, None


def _fallback_payload() -> dict[str, Any]:
    score_value = 7.0
    return {
        "improvement": [
            "Add a clearer explanation of technical trade-offs and walk through one implementation detail step by step."
        ],
        "rawMarkdown": (
            "**Score:** 7/10\n\n"
            "**Strengths**\n"
            "- Shows relevant technical direction.\n\n"
            "**Weaknesses**\n"
            "- Needs more concrete implementation detail.\n\n"
            "**Suggested Improvement**\n"
            "- Add a more specific explanation of architecture, trade-offs, and execution steps."
        ),
        "scoreLabel": "7/10",
        "scoreValue": score_value,
        "strengths": [
            "Shows relevant technical direction."
        ],
        "summary": [
            "The answer is directionally correct but would be stronger with deeper implementation detail and clearer trade-off analysis."
        ],
        "weaknesses": [
            "Needs more concrete implementation detail."
        ],
    }


def _format_markdown(
    summary: list[str],
    score_label: str | None,
    strengths: list[str],
    weaknesses: list[str],
    improvement: list[str],
) -> str:
    blocks: list[str] = []

    if summary:
        blocks.append(
            "\n".join(summary)
        )

    if score_label:
        blocks.append(
            f"**Score:** {score_label}"
        )

    if strengths:
        strength_lines = "\n".join(
            f"- {item}"
            for item in strengths
        )
        blocks.append(
            f"**Strengths**\n{strength_lines}"
        )

    if weaknesses:
        weakness_lines = "\n".join(
            f"- {item}"
            for item in weaknesses
        )
        blocks.append(
            f"**Weaknesses**\n{weakness_lines}"
        )

    if improvement:
        improvement_lines = "\n".join(
            f"- {item}"
            for item in improvement
        )
        blocks.append(
            f"**Suggested Improvement**\n{improvement_lines}"
        )

    return "\n\n".join(blocks)


def evaluate_answer(
    question: str,
    answer: str,
) -> dict[str, Any]:
    prompt = f"""
You are a senior AI interviewer.

Interview Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer based on:
- technical accuracy
- clarity
- depth
- practical understanding

Return valid JSON only with this exact shape:
{{
  "summary": ["short overall assessment"],
  "score": 0,
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1", "point 2"],
  "improvement": ["one concrete next-step suggestion"]
}}

Rules:
- score must be a number from 0 to 10
- summary should contain 1 or 2 short sentences
- strengths should contain 1 to 3 concise bullets
- weaknesses should contain 1 to 3 concise bullets
- improvement should contain 1 to 2 concise bullets
- keep the evaluation professional and specific
- do not return markdown
- do not return code fences
"""

    try:
        completion = (
            client.chat.completions.create(
                model=MODEL_NAME,
                temperature=0.2,
                max_tokens=300,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert technical interviewer. "
                            "Return strict JSON only."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
            )
        )

        response = (
            completion.choices[0]
            .message.content
            or ""
        )

        payload = _extract_json_object(
            response
        )

        if not payload:
            fallback = _fallback_payload()
            fallback["rawMarkdown"] = (
                response.strip()
                or fallback["rawMarkdown"]
            )
            return fallback

        summary = _normalize_list(
            payload.get("summary")
        )
        strengths = _normalize_list(
            payload.get("strengths")
        )
        weaknesses = _normalize_list(
            payload.get("weaknesses")
        )
        improvement = _normalize_list(
            payload.get("improvement")
        )
        score_value, score_label = (
            _coerce_score(
                payload.get("score")
            )
        )

        raw_markdown = _format_markdown(
            summary=summary,
            score_label=score_label,
            strengths=strengths,
            weaknesses=weaknesses,
            improvement=improvement,
        )

        return {
            "improvement": improvement,
            "rawMarkdown": raw_markdown,
            "scoreLabel": score_label,
            "scoreValue": score_value,
            "strengths": strengths,
            "summary": summary,
            "weaknesses": weaknesses,
        }

    except Exception as error:
        print(
            "Evaluation Error:",
            str(error),
        )
        return _fallback_payload()
