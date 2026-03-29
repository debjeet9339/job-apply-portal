from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
import shutil
import os
from bson import ObjectId
from models import LoginModel, SignupModel, JobModel
from auth import (
    hash_password,
    verify_password,
    create_token,
    get_current_user,
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

uri = os.getenv("MONGO_URI")
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["job_portal"]
collection = db["users"]
jobs_collection = db["jobs"]
applications_collection = db["applications"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def home():
    return {"message": "Server running!"}


@app.get("/test-db")
def test_db():
    try:
        db.command("ping")
        return {"message": "MongoDB connected successfully"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/signup")
def signup(user: SignupModel):
    existing_user = collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user.role not in ["candidate", "recruiter"]:
        raise HTTPException(
            status_code=400, detail="Role must be candidate or recruiter"
        )

    hashed_pw = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "role": user.role,
    }

    collection.insert_one(new_user)

    return {"message": "User registered successfully"}


@app.post("/login")
def login(user: LoginModel):
    existing_user = collection.find_one({"email": user.email})

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
async def get_user():
    users = []
    for user in collection.find({}, {"password": 0}):
        user["_id"] = str(user["_id"])
        users.append(user)
    return {"users": users}


@app.post("/jobs")
def create_job(job: JobModel, current_user: dict = Depends(require_recruiter)):
    if job.recruiter_email != current_user["email"]:
        raise HTTPException(
            status_code=403, detail="You can only post jobs from your own account"
        )
    new_job = {
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "salary": job.salary,
        "job_type": job.job_type,
        "recruiter_email": job.recruiter_email,
    }

    result = jobs_collection.insert_one(new_job)

    return {"message": "Job posted successfully", "job_id": str(result.inserted_id)}


@app.get("/jobs")
def get_jobs():
    jobs = []

    for job in jobs_collection.find():
        job["_id"] = str(job["_id"])
        jobs.append(job)

    return {"jobs": jobs}


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
            status_code=403, detail="You can only apply from your own account"
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

    filename = f"{candidate_email.replace('@', '_at_')}_{job_id}_{resume.filename}"
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
    recruiter_email: str, current_user: dict = Depends(require_recruiter)
):
    if recruiter_email != current_user["email"]:
        raise HTTPException(
            status_code=403, detail="You can only view your own applications"
        )

    applications = []

    for application in applications_collection.find(
        {"recruiter_email": recruiter_email}
    ):
        application["_id"] = str(application["_id"])
        applications.append(application)

    return {"applications": applications}


@app.get("/jobs/{job_id}")
def get_single_job(job_id: str):
    job = jobs_collection.find_one({"_id": ObjectId(job_id)})

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job["_id"] = str(job["_id"])
    return {"job": job}
