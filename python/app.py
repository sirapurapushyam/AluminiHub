from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re, requests, logging
from io import BytesIO
import PyPDF2
import docx2txt
from urllib.parse import urlparse
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = "alumni"
COLLECTION = "users"

 

client = MongoClient(MONGO_URI)
users_coll = client[DB_NAME][COLLECTION]

model = SentenceTransformer("all-MiniLM-L6-v2")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_text(text: str):
    return re.sub(r"\s+", " ", text).strip()

def extract_text_from_pdf(file_bytes: bytes):
    try:
        reader = PyPDF2.PdfReader(BytesIO(file_bytes))
        return " ".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        logger.warning(f"PDF extract failed: {e}")
        return ""

def extract_text_from_docx(file_bytes: bytes):
    try:
        return docx2txt.process(BytesIO(file_bytes))
    except Exception as e:
        logger.warning(f"DOCX extract failed: {e}")
        return ""

def download_resume_text(url: str):
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        content_type = r.headers.get("Content-Type", "").lower()
        data = r.content

        if "pdf" in content_type or data.startswith(b"%PDF"):
            return clean_text(extract_text_from_pdf(data))
        if "word" in content_type or "docx" in content_type or data[:2] == b"PK":
            return clean_text(extract_text_from_docx(data))

        return ""
    except Exception as e:
        logger.warning(f"Download failed {url}: {e}")
        return ""


def build_profile_vector(skills, interests):
    return " ".join(skills + interests).strip()


class MatchRequest(BaseModel):
    job_desc: str
    job_domain: str

class MatchStudentRequest(MatchRequest):
    student_id: str


@app.post("/ats_match_all")
def match_mongo(request: MatchRequest):
    job_desc = request.job_desc.strip()
    job_domain = request.job_domain.strip()
    if not job_desc or not job_domain:
        raise HTTPException(status_code=400, detail="Missing job_desc or job_domain")

    students = list(users_coll.find({"role": "student", "profile.resume": {"$exists": True, "$ne": None}}))
    if not students:
        return []

    job_embedding = model.encode(job_desc, convert_to_tensor=True)
    resume_texts, student_data = [], []

    for s in students:
        resume_url = s.get("profile", {}).get("resume")
        text = download_resume_text(resume_url) if resume_url else ""
        resume_texts.append(text)
        student_data.append({
            "name": f"{s.get('firstName','')} {s.get('lastName','')}".strip(),
            "email": s.get("email"),
            "skills": s.get("profile", {}).get("skills", [])
        })

    resume_embeddings = model.encode(resume_texts, convert_to_tensor=True)
    scores = util.cos_sim(job_embedding, resume_embeddings)[0].cpu().tolist()
    ranked = sorted(zip(student_data, scores), key=lambda x: x[1], reverse=True)

    results = [{
        "name": sd["name"],
        "email": sd["email"],
        "skills": sd["skills"],
        "ats_score": round(score * 100, 2)
    } for sd, score in ranked]

    return results

@app.post("/ats_match_student")
def match_single_student(request: MatchStudentRequest):
    student_id = request.student_id.strip()
    job_desc = request.job_desc.strip()
    job_domain = request.job_domain.strip()
    print("student_id", student_id)
    if not student_id or not job_desc or not job_domain:
        raise HTTPException(status_code=400, detail="Missing student_id, job_desc, or job_domain")

    try:
        object_id = ObjectId(student_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid student_id")

    student = users_coll.find_one({
        "_id": object_id,
        "role": "student",
        "profile.resume": {"$exists": True, "$ne": None}
    })
    print("student3", student)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found or no resume available")
    print("student1", student)
    resume_url = student.get("profile", {}).get("resume")
    resume_text = download_resume_text(resume_url) if resume_url else ""
    print("resume_text", resume_text)

    job_embedding = model.encode(job_desc, convert_to_tensor=True)
    resume_embedding = model.encode([resume_text], convert_to_tensor=True)
    score = util.cos_sim(job_embedding, resume_embedding)[0][0].cpu().item()

    return {
        "name": f"{student.get('firstName','')} {student.get('lastName','')}".strip(),
        "email": student.get("email"),
        "skills": student.get("profile", {}).get("skills", []),
        "ats_score": round(score * 100, 2)
    }

@app.get("/recommend")
def recommend(studentId: str):
    try:
        oid = ObjectId(studentId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid studentId format")

    student = users_coll.find_one({"_id": oid, "role": "student"})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    stu_profile = build_profile_vector(
        student.get("profile", {}).get("skills", []),
        student.get("profile", {}).get("interests", [])
    )

    alumni = list(users_coll.find({"role": "alumni", "approvalStatus": "approved"}))
    alumni_docs, valid_alumni = [], []
    for a in alumni:
        doc = build_profile_vector(a.get("profile", {}).get("skills", []), a.get("profile", {}).get("interests", []))
        if doc:
            alumni_docs.append(doc)
            valid_alumni.append(a)

    if not stu_profile or not alumni_docs:
        return {"sameCollege": [], "otherCollege": []}

    tfidf = TfidfVectorizer()
    matrix = tfidf.fit_transform([stu_profile] + alumni_docs)
    sims = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    scored = []
    for a, s in zip(valid_alumni, sims):
        if s > 0.4:
            scored.append({
                "id": str(a["_id"]),
                "name": f"{a.get('firstName', '')} {a.get('lastName', '')}".strip(),
                "collegeCode": a.get("collegeCode", ""),
                "skills": a.get("profile", {}).get("skills", []),
                "interests": a.get("profile", {}).get("interests", []),
                "score": round(float(s), 3)
            })

    same_college = sorted(
        [a for a in scored if a["collegeCode"] == student.get("collegeCode", "")],
        key=lambda x: x["score"],
        reverse=True
    )
    other_college = sorted(
        [a for a in scored if a["collegeCode"] != student.get("collegeCode", "")],
        key=lambda x: x["score"],
        reverse=True
    )

    return {"sameCollege": same_college[:10], "otherCollege": other_college[:10]}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True}
