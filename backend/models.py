from pydantic import BaseModel, EmailStr
from typing import Optional

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
