from pydantic import BaseModel, EmailStr
from typing import Optional, Literal, List


class SignupModel(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class LoginModel(BaseModel):
    email: EmailStr
    password: str


class JobModel(BaseModel):
    title: str
    company: str
    location: str
    description: str
    salary: Optional[str] = None
    job_type: Optional[str] = None
    recruiter_email: str


class JobStatusUpdateModel(BaseModel):
    status: Literal["approved", "rejected"]


class AdminCreateModel(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["admin"] = "admin"


class JDGenerateRequest(BaseModel):
    title: str
    company: str
    location: str
    experience_level: Optional[str] = None
    employment_type: Optional[str] = None
    salary: Optional[str] = None
    skills: List[str] = []
    industry: Optional[str] = None
    tone: Optional[str] = "professional"
    extra_instructions: Optional[str] = None


class JDGenerateResponse(BaseModel):
    job_summary: str
    responsibilities: List[str]
    requirements: List[str]
    preferred_skills: List[str]
    benefits: List[str]

class ApplicationStatusUpdate(BaseModel):
    status: str