from pydantic import BaseModel
from typing import List

class CandidateProfile(BaseModel):
    name: str
    skills: List[str]
    projects: List[str]
    raw_text: str