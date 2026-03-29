import os
import jwt
from jwt import PyJWTError
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi import HTTPException, Header

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)

def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(days=1)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization.split(" ")[1]
    return verify_token(token)

def require_recruiter(authorization: str = Header(None)):
    user = get_current_user(authorization)

    if user.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Recruiter access only")

    return user

def require_candidate(authorization: str = Header(None)):
    user = get_current_user(authorization)

    if user.get("role") != "candidate":
        raise HTTPException(status_code=403, detail="Candidate access only")

    return user