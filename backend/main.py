from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional
from uuid import uuid4
import os
import shutil

import httpx
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from pymongo.server_api import ServerApi

from auth import (
    create_token,
    get_current_user,
    hash_password,
    require_candidate,
    require_recruiter,
    verify_password,
)
from models import (
    ApplicationStatusUpdate,
    CareerChatRequest,
    CareerChatResponse,
    JDGenerateRequest,
    JDGenerateResponse,
    JobModel,
    JobStatusUpdateModel,
    LoginModel,
    SignupModel,
)

load_dotenv()

app = FastAPI(
    title="Job Portal Application",
    description="A full stack job portal built with FastAPI",
    version="1.0.0",
)

# -----------------------------
# Config
# -----------------------------
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:8000")
MONGO_URI = os.getenv("MONGO_URI")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")

if not MONGO_URI:
    raise ValueError("MONGO_URI is missing in .env")

mongo_client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
db = mongo_client["job_portal"]

users_collection = db["users"]
jobs_collection = db["jobs"]
applications_collection = db["applications"]

JOB_STATUSES = {"pending", "approved", "rejected"}
APPLICATION_STATUSES = {"pending", "approved", "rejected"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# -----------------------------
# Helpers
# -----------------------------
def utc_now():
    return datetime.now(timezone.utc)


def serialize_doc(document: Optional[dict]) -> Optional[dict]:
    if not document:
        return None

    serialized = {}
    for key, value in document.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        else:
            serialized[key] = value
    return serialized


def parse_object_id(id_value: str, label: str = "ID") -> ObjectId:
    try:
        return ObjectId(id_value)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {label}")


def build_resume_url(filename: str) -> str:
    return f"{BACKEND_BASE_URL}/uploads/{filename}"


def safe_filename(original_name: str) -> str:
    extension = Path(original_name).suffix.lower() or ".pdf"
    return f"{uuid4().hex}{extension}"


def fallback_career_reply(message: str, user_profile: Optional[Dict[str, str]] = None) -> str:
    text = message.lower()

    target_role = "Full Stack Developer"
    if user_profile and user_profile.get("target_role"):
        target_role = user_profile["target_role"]

    if "resume" in text or "cv" in text:
        return f"""Here is a cleaner resume plan for a fresher {target_role}:

1. Add a strong headline
   Example: {target_role} | Next.js | FastAPI | MongoDB

2. Write a short summary
   Mention your skills, strongest projects, and what role you are targeting.

3. Improve project descriptions
   For each project include:
   - problem solved
   - tech stack
   - key features
   - your contribution
   - live link / GitHub link

4. Add a focused skills section
   Group skills into frontend, backend, database, and tools.

5. Keep the format clean
   Use short bullet points and good spacing.
"""

    if "interview" in text:
        return f"""Here are some interview areas to prepare for {target_role}:

- self introduction
- project explanation
- HTML, CSS, JavaScript
- React / Next.js basics
- API and backend basics
- authentication and database questions

Sample questions:
1. Tell me about yourself.
2. Explain your best project.
3. Why did you choose this tech stack?
4. What is server-side rendering?
5. How does frontend connect with backend?
"""

    if "roadmap" in text or "skill" in text:
        return f"""Here is a simple roadmap for {target_role}:

1. HTML, CSS, JavaScript
2. React fundamentals
3. Next.js routing and layouts
4. Tailwind CSS
5. Backend with FastAPI or Node.js
6. MongoDB or SQL
7. Authentication
8. Deployment and GitHub
9. Interview preparation
10. 2 to 3 strong portfolio projects
"""

    if "project" in text:
        return """Strong project ideas:
- AI Job Portal
- Resume Analyzer
- Interview Practice App
- Typing Test App
- Task Manager with auth
- Student Progress Tracker
"""

    return """I can help with:
- resume improvement
- interview preparation
- skill roadmap
- project ideas
- cover letter help
- fresher career guidance
"""


async def ask_ollama(
    user_message: str,
    history: list[dict],
    user_profile: Optional[Dict[str, str]] = None,
) -> str:
    system_prompt = f"""
You are a professional AI Career Assistant for a job portal website.

You help with:
- resume improvement
- interview questions
- skill roadmaps
- project ideas
- fresher guidance
- cover letter help

Rules:
- keep answers practical and structured
- guide beginners clearly
- do not overpromise
- prefer concise, useful responses
- if relevant, suggest next steps

User profile:
{user_profile or {}}
""".strip()

    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "keep_alive": "10m",
        "messages": [
            {"role": "system", "content": system_prompt},
            *history[-8:],
            {"role": "user", "content": user_message},
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            data = response.json()

        reply = data.get("message", {}).get("content", "").strip()
        if reply:
            return reply

        return fallback_career_reply(user_message, user_profile)

    except Exception:
        return fallback_career_reply(user_message, user_profile)


# -----------------------------
# Base Routes
# -----------------------------
@app.get("/")
async def home():
    return {"message": "Server running!"}


@app.get("/test-db")
def test_db():
    try:
        db.command("ping")
        return {"message": "MongoDB connected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# Auth Routes
# -----------------------------
@app.post("/signup")
def signup(user: SignupModel):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user.role not in ["candidate", "recruiter", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be candidate, recruiter, or admin",
        )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
        "created_at": utc_now(),
    }

    users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}


@app.post("/login")
def login(user: LoginModel):
    existing_user = users_collection.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_token(
        {
            "name": existing_user["name"],
            "email": existing_user["email"],
            "role": existing_user["role"],
        }
    )

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "name": existing_user["name"],
            "email": existing_user["email"],
            "role": existing_user["role"],
        },
    }


@app.get("/users")
def get_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    users = [
        serialize_doc(user)
        for user in users_collection.find({}, {"password": 0})
    ]
    return {"users": users}


# -----------------------------
# Job Routes
# -----------------------------
@app.post("/jobs")
def create_job(job: JobModel, current_user: dict = Depends(require_recruiter)):
    if job.recruiter_email != current_user["email"]:
        raise HTTPException(
            status_code=403,
            detail="You can only post jobs from your own account",
        )

    new_job = {
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "salary": job.salary,
        "job_type": job.job_type,
        "recruiter_email": job.recruiter_email,
        "status": "pending",
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }

    result = jobs_collection.insert_one(new_job)

    return {
        "message": "Job submitted for admin approval",
        "job_id": str(result.inserted_id),
    }


@app.get("/jobs")
def get_jobs():
    jobs = [
        serialize_doc(job)
        for job in jobs_collection.find({"status": "approved"}).sort("created_at", -1)
    ]
    return {"jobs": jobs}


@app.get("/jobs/{job_id}")
def get_single_job(job_id: str):
    object_id = parse_object_id(job_id, "job ID")
    job = jobs_collection.find_one({"_id": object_id, "status": "approved"})

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {"job": serialize_doc(job)}


# -----------------------------
# Application Routes
# -----------------------------
@app.post("/apply")
async def apply_job(
    current_user: dict = Depends(require_candidate),
    job_id: str = Form(...),
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    recruiter_email: str = Form(...),
    resume: UploadFile = File(...),
):
    if candidate_email != current_user["email"]:
        raise HTTPException(
            status_code=403,
            detail="You can only apply from your own account",
        )

    if candidate_name != current_user["name"]:
        raise HTTPException(status_code=403, detail="Invalid candidate name")

    object_id = parse_object_id(job_id, "job ID")
    job = jobs_collection.find_one({"_id": object_id, "status": "approved"})
    if not job:
        raise HTTPException(status_code=404, detail="Approved job not found")

    if recruiter_email != job["recruiter_email"]:
        raise HTTPException(status_code=400, detail="Recruiter email does not match job")

    existing_application = applications_collection.find_one(
        {"job_id": job_id, "candidate_email": candidate_email}
    )
    if existing_application:
        raise HTTPException(status_code=400, detail="You already applied for this job")

    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    filename = safe_filename(resume.filename or "resume.pdf")
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    new_application = {
        "job_id": job_id,
        "job_title": job["title"],
        "company": job["company"],
        "candidate_name": candidate_name,
        "candidate_email": candidate_email,
        "recruiter_email": recruiter_email,
        "resume_file": filename,
        "resume_url": build_resume_url(filename),
        "status": "pending",
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }

    result = applications_collection.insert_one(new_application)

    return {
        "message": "Application submitted successfully",
        "application_id": str(result.inserted_id),
        "resume_url": build_resume_url(filename),
    }


@app.get("/applications/{recruiter_email}")
def get_applications(
    recruiter_email: str,
    current_user: dict = Depends(require_recruiter),
):
    if recruiter_email != current_user["email"]:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own applications",
        )

    applications = [
        serialize_doc(application)
        for application in applications_collection.find(
            {"recruiter_email": recruiter_email}
        ).sort("created_at", -1)
    ]

    return {"applications": applications}


@app.patch("/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    current_user: dict = Depends(require_recruiter),
):
    if payload.status not in APPLICATION_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    object_id = parse_object_id(application_id, "application ID")
    application = applications_collection.find_one({"_id": object_id})

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application["recruiter_email"] != current_user["email"]:
        raise HTTPException(
            status_code=403,
            detail="You can only update applications for your own jobs",
        )

    applications_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": payload.status,
                "updated_at": utc_now(),
            }
        },
    )

    return {"message": f"Application {payload.status} successfully"}


# -----------------------------
# AI / JD Routes
# -----------------------------
@app.post("/generate-job-description", response_model=JDGenerateResponse)
async def generate_job_description(
    data: JDGenerateRequest,
    current_user: dict = Depends(require_recruiter),
):
    title = data.title
    company = data.company
    location = data.location
    experience_level = data.experience_level or "relevant"
    employment_type = data.employment_type or "Full-time"
    salary = data.salary or "Negotiable"
    industry = data.industry or "the industry"
    tone = data.tone or "professional"
    skills = data.skills if data.skills else [
        "Communication",
        "Teamwork",
        "Problem-solving",
    ]

    job_summary = (
        f"{company} is looking for a {title} to join our team in {location}. "
        f"This is a {employment_type} opportunity for candidates with {experience_level} experience. "
        f"The ideal candidate should be motivated, detail-oriented, and ready to contribute to high-quality work in {industry}. "
        f"This role offers a {tone} work environment with salary: {salary}."
    )

    responsibilities = [
        f"Perform the core responsibilities of the {title} role effectively and professionally.",
        "Collaborate with internal teams to achieve project and business goals.",
        "Maintain high standards of quality, productivity, and communication.",
        "Identify problems and contribute practical solutions in daily work.",
        "Support planning, reporting, and execution of assigned tasks.",
        "Follow company processes, deadlines, and performance expectations.",
    ]

    requirements = [
        f"Relevant experience for a {title} role.",
        "Good communication and interpersonal skills.",
        "Ability to work independently and in a team environment.",
        "Strong problem-solving and organizational abilities.",
        "Willingness to learn new tools, systems, and workflows.",
    ]

    preferred_skills = skills[:5]

    benefits = [
        "Competitive salary package",
        "Career growth opportunities",
        "Supportive team environment",
        "Learning and development opportunities",
    ]

    return JDGenerateResponse(
        job_summary=job_summary,
        responsibilities=responsibilities,
        requirements=requirements,
        preferred_skills=preferred_skills,
        benefits=benefits,
    )


@app.post("/career-chat", response_model=CareerChatResponse)
async def career_chat(payload: CareerChatRequest):
    reply = await ask_ollama(
        user_message=payload.message,
        history=[{"role": m.role, "content": m.content} for m in payload.history],
        user_profile=payload.user_profile,
    )

    return CareerChatResponse(
        reply=reply,
        suggestions=[
            "Improve my resume",
            "Give me interview questions",
            "Create a skill roadmap",
            "Suggest portfolio projects",
        ],
    )


# -----------------------------
# Admin Routes
# -----------------------------
@app.get("/admin/jobs")
def get_all_jobs_for_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    jobs = [
        serialize_doc(job)
        for job in jobs_collection.find().sort("created_at", -1)
    ]
    return {"jobs": jobs}


@app.put("/admin/jobs/{job_id}/status")
def update_job_status(
    job_id: str,
    data: JobStatusUpdateModel,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    if data.status not in JOB_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid job status")

    object_id = parse_object_id(job_id, "job ID")
    job = jobs_collection.find_one({"_id": object_id})

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    jobs_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": data.status,
                "updated_at": utc_now(),
            }
        },
    )

    return {"message": f"Job {data.status} successfully"}