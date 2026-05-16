import fitz
import re

TECH_SKILLS = [
    "Python",
    "FastAPI",
    "TensorFlow",
    "PyTorch",
    "Docker",
    "Kubernetes",
    "SQL",
    "MongoDB",
    "React",
    "Next.js",
    "TypeScript",
    "Machine Learning",
    "Deep Learning",
    "LangChain",
    "OpenAI",
]

def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""

    doc = fitz.open(pdf_path)

    for page in doc:
        text += page.get_text()

    return text


def extract_skills(text: str):
    found_skills = []

    for skill in TECH_SKILLS:
        if skill.lower() in text.lower():
            found_skills.append(skill)

    return list(set(found_skills))


def extract_projects(text: str):
    project_patterns = re.findall(
        r"(?i)(project[s]?[:\-\s]*)(.*)",
        text
    )

    projects = []

    for _, match in project_patterns:
        projects.append(match.strip())

    return projects


def parse_resume(pdf_path: str):
    text = extract_text_from_pdf(pdf_path)

    skills = extract_skills(text)

    projects = extract_projects(text)

    return {
        "skills": skills,
        "projects": projects,
        "raw_text": text[:5000]
    }