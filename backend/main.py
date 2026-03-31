from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from bson import ObjectId
import shutil
import os
from pydantic import BaseModel

from models import (
    ApplicationStatusUpdate,
    JDGenerateRequest,
    JDGenerateResponse,
    JobStatusUpdateModel,
    LoginModel,
    SignupModel,
    JobModel,
)
from auth import (
    get_current_user,
    hash_password,
    verify_password,
    create_token,
    require_recruiter,
    require_candidate,
)

load_dotenv()

app = FastAPI(
    title="Job Portal application",
    description="A simple full stack job portal application made by FastAPI",
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is missing in .env")

mongo_client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
db = mongo_client["job_portal"]

users_collection = db["users"]
jobs_collection = db["jobs"]
applications_collection = db["applications"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_doc(document):
    if not document:
        return None
    document["_id"] = str(document["_id"])
    return document


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

    hashed_pw = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "role": user.role,
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

    users = []
    for user in users_collection.find({}, {"password": 0}):
        users.append(serialize_doc(user))
    return {"users": users}


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
    }

    result = jobs_collection.insert_one(new_job)

    return {
        "message": "Job submitted for admin approval",
        "job_id": str(result.inserted_id),
    }


@app.get("/jobs")
def get_jobs():
    jobs = []
    for job in jobs_collection.find({"status": "approved"}):
        jobs.append(serialize_doc(job))
    return {"jobs": jobs}


@app.get("/jobs/{job_id}")
def get_single_job(job_id: str):
    try:
        job = jobs_collection.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {"job": serialize_doc(job)}


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

    existing_application = applications_collection.find_one(
        {"job_id": job_id, "candidate_email": candidate_email}
    )

    if existing_application:
        raise HTTPException(status_code=400, detail="You already applied for this job")

    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    safe_email = candidate_email.replace("@", "_at_")
    filename = f"{safe_email}_{job_id}_{resume.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    new_application = {
        "job_id": job_id,
        "candidate_name": candidate_name,
        "candidate_email": candidate_email,
        "recruiter_email": recruiter_email,
        "resume_file": filename,
        "resume_url": f"http://127.0.0.1:8000/uploads/{filename}",
    }

    result = applications_collection.insert_one(new_application)

    return {
        "message": "Application submitted successfully",
        "application_id": str(result.inserted_id),
        "resume_url": f"http://127.0.0.1:8000/uploads/{filename}",
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

    applications = []
    for application in applications_collection.find({"recruiter_email": recruiter_email}):
        applications.append(serialize_doc(application))

    return {"applications": applications}

@app.patch("/applications/{application_id}/status")
async def update_application_status(application_id: str, payload: ApplicationStatusUpdate):
    if payload.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": payload.status}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    return {"message": f"Application {payload.status} successfully"}


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


@app.get("/admin/jobs")
def get_all_jobs_for_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    jobs = []
    for job in jobs_collection.find():
        jobs.append(serialize_doc(job))

    return {"jobs": jobs}


@app.put("/admin/jobs/{job_id}/status")
def update_job_status(
    job_id: str,
    data: JobStatusUpdateModel,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    try:
        job = jobs_collection.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": data.status}},
    )

    return {"message": f"Job {data.status} successfully"}