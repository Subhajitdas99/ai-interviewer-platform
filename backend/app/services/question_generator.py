from typing import Literal


Track = Literal[
    "computer_vision",
    "genai",
    "backend_ml",
    "general_ml",
]


def _normalize(text: str) -> str:
    return " ".join(text.lower().split())


def _profile_text(
    role: str,
    skills: list[str],
    projects: list[str],
    raw_text: str,
) -> str:
    return _normalize(
        " ".join(
            [role, *skills, *projects, raw_text[:2500]]
        )
    )


def _has_any(
    text: str,
    keywords: list[str],
) -> bool:
    return any(
        keyword in text
        for keyword in keywords
    )


def _detect_track(
    role: str,
    skills: list[str],
    projects: list[str],
    raw_text: str,
) -> Track:
    text = _profile_text(
        role=role,
        skills=skills,
        projects=projects,
        raw_text=raw_text,
    )

    if _has_any(
        text,
        [
            "cctv",
            "object detection",
            "tracking",
            "computer vision",
            "video analytics",
            "image classification",
            "opencv",
            "yolo",
        ],
    ):
        return "computer_vision"

    if _has_any(
        text,
        [
            "langchain",
            "rag",
            "retrieval augmented",
            "llm",
            "prompt engineering",
            "vector database",
            "generative ai",
            "chroma",
        ],
    ):
        return "genai"

    if _has_any(
        text,
        [
            "fastapi",
            "docker",
            "api",
            "deployment",
            "backend",
            "microservice",
        ],
    ):
        return "backend_ml"

    return "general_ml"


def _project_context(
    projects: list[str],
) -> str:
    if projects:
        return projects[0].strip()
    return "a production AI application"


def _computer_vision_questions(
    projects: list[str],
) -> list[str]:
    project = _project_context(projects)
    return [
        (
            f"For {project}, how would you balance precision, recall, "
            "and latency when building an object detection and tracking pipeline?"
        ),
        (
            "Write a Python or TensorFlow-based inference workflow for a "
            "real-time video pipeline that handles frame preprocessing, "
            "object detection, and structured tracking output."
        ),
        (
            "How would you design a Dockerized FastAPI service to serve a "
            "real-time CCTV analytics model, including failure handling, "
            "throughput limits, and scaling strategy?"
        ),
    ]


def _genai_questions(
    projects: list[str],
) -> list[str]:
    project = _project_context(projects)
    return [
        (
            f"How would you decide when a RAG pipeline is a better fit than "
            f"plain prompting for {project} or a similar AI application?"
        ),
        (
            "How would you build a LangChain pipeline in Python that retrieves "
            "resume context, generates grounded interview questions, and avoids hallucinations?"
        ),
        (
            "How would you design a FastAPI and Docker deployment for a RAG-based "
            "interview system that must handle prompt size limits, retrieval latency, "
            "and consistent output formatting?"
        ),
    ]


def _backend_ml_questions(
    projects: list[str],
) -> list[str]:
    project = _project_context(projects)
    return [
        (
            f"For {project}, what boundaries would you keep between the model "
            "logic, API layer, and storage layer to keep the system maintainable?"
        ),
        (
            "Write a Python function that validates model input payloads, "
            "normalizes request data, and prepares the data for downstream inference."
        ),
        (
            "How would you design a FastAPI service in Docker for machine learning inference, "
            "including request validation, observability, and horizontal scaling?"
        ),
    ]


def _general_ml_questions(
    projects: list[str],
) -> list[str]:
    project = _project_context(projects)
    return [
        (
            f"For {project}, how would you choose the right evaluation metrics "
            "and validation approach before shipping a machine learning model?"
        ),
        (
            "Write a Python workflow to preprocess input data, run model inference, "
            "and return a structured prediction response."
        ),
        (
            "How would you design an end-to-end backend workflow for model inference, "
            "covering input parsing, prediction serving, and failure recovery?"
        ),
    ]


def generate_interview_question(
    role: str,
    skills: list[str],
    projects: list[str] | None = None,
    raw_text: str = "",
) -> list[str]:
    """
    Generate coherent interview questions
    by choosing the strongest technical track
    from the candidate profile.
    """

    projects = projects or []

    track = _detect_track(
        role=role,
        skills=skills,
        projects=projects,
        raw_text=raw_text,
    )

    if track == "computer_vision":
        return _computer_vision_questions(
            projects
        )

    if track == "genai":
        return _genai_questions(
            projects
        )

    if track == "backend_ml":
        return _backend_ml_questions(
            projects
        )

    return _general_ml_questions(
        projects
    )
