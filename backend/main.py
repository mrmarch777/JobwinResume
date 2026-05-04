"""
JobwinResume — Main API Server
File: main.py
To run: uvicorn main:app --port 8000
"""

import os
import asyncio
from fastapi import FastAPI, HTTPException, Request as FastAPIRequest
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from job_search import search_jobs
from ai_engine import (
    summarise_job,
    calculate_ats_score,
    comprehensive_ats_analysis,
    tailor_resume,
    write_cover_letter,
    generate_interview_prep,
    client,
    MODEL,
    MODEL_ADVANCED,
)

load_dotenv()

app = FastAPI(title="JobwinResume API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",                    # local Next.js dev
        "https://jobwinresume.com",                 # production domain
        "https://www.jobwinresume.com",             # www variant
        "https://jobwinresume-api.onrender.com",    # Render backend itself
        "https://*.vercel.app",                     # Vercel preview URLs
        "https://*.onrender.com",                   # any Render preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Data Models ──────────────────────────────────────────────

class ATSRequest(BaseModel):
    resume_text: str
    job_description: str

class ATSBuilderRequest(BaseModel):
    """Accepts a full resume JSON object (from the resume builder) + a job description.
    Serializes the structured resume into rich text before running ATS analysis."""
    resume_json: dict
    job_description: str

class ResumeRequest(BaseModel):
    resume_text: str
    job_title: str
    job_company: str
    job_description: str
    job_salary: str = ""

class CoverLetterRequest(BaseModel):
    user_name: str
    user_experience: str
    user_skills: str
    job_title: str
    job_company: str
    job_description: str
    hr_name: str = "Hiring Manager"

class InterviewPrepRequest(BaseModel):
    job_title: str
    job_company: str
    job_description: str
    user_experience: str

class ResumeGenerateRequest(BaseModel):
    fullName: str
    email: str
    phone: str = ""
    city: str = ""
    linkedin: str = ""
    targetRole: str
    experience: str
    education: str = ""
    skills: str = ""
    achievements: str = ""

# ── Endpoints ────────────────────────────────────────────────

@app.get("/")
def home():
    return {
        "status": "✅ JobwinResume API is running!",
        "message": "Welcome to JobwinResume — India's smartest job platform",
        "endpoints": {
            "search jobs": "/jobs?role=Data Analyst&city=Mumbai",
            "ats score": "POST /ats-score",
            "tailor resume": "POST /tailor-resume",
            "cover letter": "POST /cover-letter",
            "interview prep": "POST /interview-prep",
            "generate resume": "POST /generate-resume",
        }
    }

@app.get("/jobs")
async def get_jobs(role: str, city: str, num_results: int = 20, plan: str = "free"):
    if not role or not city:
        raise HTTPException(status_code=400, detail="role and city are required")
    
    # Enforce limits on the backend for security
    limit_map = {"free": 10, "basic": 20, "standard": 50, "pro": 100}
    max_allowed = limit_map.get(plan.lower(), 10)
    
    # Use the smaller of requested vs allowed
    final_limit = min(num_results, max_allowed)
    
    print(f"🚀 API Request: {role} in {city} | Plan: {plan} | Limit: {final_limit}")
    
    jobs = search_jobs(role, city, final_limit)
    if not jobs:
        return {"count": 0, "jobs": [], "message": "No jobs found. Try different keywords."}
    
    # Parallelize AI summaries for massive speed boost!
    enriched_jobs = await asyncio.gather(*[summarise_job(job) for job in jobs])
    
    return {
        "count": len(enriched_jobs),
        "role": role,
        "city": city,
        "plan_applied": plan,
        "jobs": enriched_jobs
    }

@app.post("/ats-score")
async def get_ats_score(request: ATSRequest):
    return await calculate_ats_score(request.resume_text, request.job_description)

@app.post("/comprehensive-ats-analysis")
async def get_comprehensive_ats_analysis(request: ATSRequest):
    """
    Advanced ATS analysis endpoint with detailed breakdown including:
    - Overall match score and category scores
    - Skill gaps and missing keywords
    - Specific recommendations to improve score
    - Estimated interview chances
    """
    return await comprehensive_ats_analysis(request.resume_text, request.job_description)


def serialize_resume_to_text(r: dict) -> str:
    """Converts a structured resume JSON (from the resume builder) to rich text for ATS analysis."""
    lines = []

    # Header
    if r.get("name"): lines.append(r["name"])
    if r.get("title"): lines.append(r["title"])
    contact = " | ".join(filter(None, [r.get("email",""), r.get("phone",""), r.get("location",""), r.get("linkedin","")]))
    if contact: lines.append(contact)
    lines.append("")

    # Summary
    if r.get("summary"):
        lines.append("PROFESSIONAL SUMMARY")
        lines.append(r["summary"])
        lines.append("")

    # Experience
    if r.get("experience"):
        lines.append("WORK EXPERIENCE")
        for exp in r["experience"]:
            lines.append(f"{exp.get('role','')} — {exp.get('company','')} ({exp.get('from','')}–{exp.get('to','Present')})")
            for b in (exp.get("responsibilities") or []):
                if b: lines.append(f"  • {b}")
            for b in (exp.get("bullets") or []):
                if b: lines.append(f"  • {b}")
        lines.append("")

    # Skills
    if r.get("skills"):
        skill_names = [s.get("name","") for s in r["skills"] if s.get("name")]
        if skill_names:
            lines.append("SKILLS")
            lines.append(", ".join(skill_names))
            lines.append("")

    # Education
    if r.get("education"):
        lines.append("EDUCATION")
        for edu in r["education"]:
            lines.append(f"{edu.get('degree','')} {edu.get('field','')} — {edu.get('institution','')} ({edu.get('year','')})")
            if edu.get("grade"): lines.append(f"  Grade: {edu['grade']}")
        lines.append("")

    # Certifications
    if r.get("certifications"):
        lines.append("CERTIFICATIONS")
        for cert in r["certifications"]:
            lines.append(f"  • {cert.get('name','')} — {cert.get('issuer','')} ({cert.get('year','')})")
        lines.append("")

    # Projects
    if r.get("projects"):
        lines.append("PROJECTS")
        for proj in r["projects"]:
            lines.append(f"  {proj.get('name','')}: {proj.get('description','')} | Tech: {proj.get('tech','')}")
        lines.append("")

    # Achievements
    if r.get("achievements"):
        lines.append("ACHIEVEMENTS")
        for ach in r["achievements"]:
            lines.append(f"  • {ach.get('text','')}")
        lines.append("")

    return "\n".join(lines)


@app.post("/ats-score-from-resume-builder")
async def ats_score_from_resume_builder(request: ATSBuilderRequest):
    """
    ATS analysis endpoint that accepts a full resume JSON object from the resume builder.
    Serializes the structured resume data into rich text and runs comprehensive analysis.
    """
    if not request.resume_json:
        raise HTTPException(status_code=400, detail="resume_json is required")
    if not request.job_description or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required")

    resume_text = serialize_resume_to_text(request.resume_json)
    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume appears to be empty. Please fill in your resume details first.")

    print(f"🔄 Builder ATS: Serialized resume = {len(resume_text)} chars | JD = {len(request.job_description)} chars")
    return await comprehensive_ats_analysis(resume_text, request.job_description)

@app.post("/tailor-resume")
async def get_tailored_resume(request: ResumeRequest):
    job = {
        "title": request.job_title,
        "company": request.job_company,
        "description": request.job_description,
        "salary": request.job_salary,
    }
    return {"tailored_resume": await tailor_resume(request.resume_text, job)}

@app.post("/cover-letter")
async def get_cover_letter(request: CoverLetterRequest):
    user_profile = {
        "name": request.user_name,
        "experience_summary": request.user_experience,
        "skills": request.user_skills,
    }
    job = {
        "title": request.job_title,
        "company": request.job_company,
        "description": request.job_description,
        "hr_name": request.hr_name,
    }
    return {"cover_letter": await write_cover_letter(user_profile, job)}

@app.post("/interview-prep")
async def get_interview_prep(request: InterviewPrepRequest):
    job = {
        "title": request.job_title,
        "company": request.job_company,
        "description": request.job_description,
    }
    user_profile = {"experience_summary": request.user_experience}
    questions = await generate_interview_prep(job, user_profile)
    return {"count": len(questions), "questions": questions}

@app.post("/generate-resume")
async def generate_resume(request: ResumeGenerateRequest):
    prompt = f"""
You are a professional resume writer. Create a complete, ATS-friendly resume.

Personal Details:
- Name: {request.fullName}
- Email: {request.email}
- Phone: {request.phone}
- City: {request.city}
- LinkedIn: {request.linkedin}
- Target Role: {request.targetRole}

Work Experience:
{request.experience}

Education:
{request.education}

Skills:
{request.skills}

Key Achievements:
{request.achievements}

Write a complete professional resume with these sections:
1. Header (name, contact details)
2. Professional Summary (3-4 sentences tailored to {request.targetRole})
3. Work Experience (bullet points with quantified achievements)
4. Education
5. Skills
6. Achievements (if provided)

Make it ATS-friendly, professional, and impressive.
Use clean formatting with clear section headers.
"""
    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        return {"resume": response.content[0].text}
    except Exception as e:
        return {"resume": f"Error generating resume: {str(e)}"}

class ApplyRequest(BaseModel):
    hr_email: str
    hr_name: str = "Hiring Manager"
    applicant_name: str
    applicant_email: str
    job_title: str
    company: str
    cover_letter: str

@app.post("/apply")
def apply_to_job(request: ApplyRequest):
    from email_sender import send_application_email
    result = send_application_email(
        to_email=request.hr_email,
        hr_name=request.hr_name,
        applicant_name=request.applicant_name,
        applicant_email=request.applicant_email,
        job_title=request.job_title,
        company=request.company,
        cover_letter=request.cover_letter,
    )
    return result
import razorpay
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "mrmarch777@gmail.com")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
try:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
except Exception as e:
    print(f"⚠️ Supabase client failed to initialize: {e}")
    supabase_client = None

@app.post("/payment-success")
async def payment_success(request):
    data = await request.json()
    payment_id = data.get("payment_id")
    plan = data.get("plan")
    email = data.get("email")
    amount = data.get("amount")

    plan_names = {"standard": "Standard", "pro": "Pro"}
    plan_name = plan_names.get(plan, plan.title())

    # Update user plan in Supabase
    try:
        if supabase_client:
            existing = supabase_client.table("user_plans").select("*").eq("email", email).execute()
            payload = {
                "plan": plan,
                "payment_id": payment_id,
                "amount": amount,
            }
            if existing.data and len(existing.data) > 0:
                supabase_client.table("user_plans").update(payload).eq("email", email).execute()
            else:
                payload["email"] = email
                supabase_client.table("user_plans").insert(payload).execute()
        else:
            print("Supabase client not initialized")
    except Exception as e:
        print(f"Supabase update error: {e}")

    # Send confirmation email via SendGrid
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=email,
            subject=f"JobwinResume {plan_name} Plan - Payment Confirmed!",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a1a; color: white;">
                <h1 style="color: #6C63FF; font-size: 28px; margin-bottom: 8px;">🚀 JobwinResume</h1>
                <h2 style="color: white; margin-bottom: 24px;">Payment Successful!</h2>
                <div style="background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <p style="color: rgba(255,255,255,0.7); margin: 0 0 8px;">Plan Activated: <strong style="color: white;">{plan_name}</strong></p>
                    <p style="color: rgba(255,255,255,0.7); margin: 0 0 8px;">Amount Paid: <strong style="color: #43D9A2;">₹{amount}</strong></p>
                    <p style="color: rgba(255,255,255,0.7); margin: 0 0 8px;">Payment ID: <strong style="color: white;">{payment_id}</strong></p>
                    <p style="color: rgba(255,255,255,0.7); margin: 0;">Email: <strong style="color: white;">{email}</strong></p>
                </div>
                <p style="color: rgba(255,255,255,0.6);">Your {plan_name} plan is now active! All features are unlocked immediately.</p>
                <p style="color: rgba(255,255,255,0.6);">Need help? Email us at mrmarch777@gmail.com or call +91 7700969639</p>
                <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 24px;">© 2026 JobwinResume. All rights reserved.</p>
            </div>
            """
        )
        sg.send(message)
    except Exception as e:
        print(f"Email error: {e}")

    return {"status": "success", "message": f"Payment confirmed! Welcome to JobwinResume {plan_name}!"}

@app.post("/process-contribution")
async def process_contribution(request):
    data = await request.json()
    raw_questions = data.get("questions_raw", "")
    company = data.get("company", "")
    role = data.get("role", "")
    
    prompt = f"""You are a professional interview question curator for a job platform.

A user submitted these raw interview questions from their experience at {company} for a {role} role:

{raw_questions}

Your tasks:
1. FILTER: Remove any inappropriate, offensive, unethical, or irrelevant content
2. RESTRUCTURE: Rewrite each question in clear, professional English
3. CATEGORIZE: Tag each as Behavioral, Technical, HR Round, Situational, or Company Fit
4. DEDUPLICATE: Remove duplicate or very similar questions
5. VALIDATE: Only keep genuine interview questions (remove comments, filler text etc)

Return ONLY a JSON array like this (no other text):
[
  {{"question": "Tell me about yourself and your experience.", "category": "Behavioral", "difficulty": "Easy"}},
  {{"question": "Describe a challenging technical problem you solved.", "category": "Technical", "difficulty": "Hard"}}
]

If the submission contains inappropriate content, return an empty array: []
"""
    
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        result = json.loads(message.content[0].text)
        return {"processed": result, "count": len(result), "status": "success"}
    except Exception as e:
        return {"processed": [], "count": 0, "status": "error", "error": str(e)}

@app.post("/generate-resume-ai")
async def generate_resume_ai(request: FastAPIRequest):
    data = await request.json()
    user_input = data.get("user_input", "")
    section = data.get("section", "all")
    prompt = f"""You are a professional resume writer with 15 years experience.
Based on this input, generate professional resume content.
User Input: {user_input}
Section: {section}
Return ONLY JSON like:
{{"summary": "...", "skills": "Python, SQL...", "suggestions": ["tip1", "tip2"]}}"""
    try:
        import anthropic, json
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        msg = client.messages.create(model="claude-sonnet-4-20250514", max_tokens=2000, messages=[{"role":"user","content":prompt}])
        return {"status":"success","data":json.loads(msg.content[0].text)}
    except Exception as e:
        return {"status":"error","error":str(e)}

@app.post("/improve-section")
async def improve_section(request: FastAPIRequest):
    data = await request.json()
    content = data.get("content", "")
    section_type = data.get("section_type", "")
    job_title = data.get("job_title", "Professional")

    if not content or not content.strip():
        return {"status": "error", "error": "Content is empty"}

    prompt = f"""You are a world-class professional resume writer with 20 years of experience helping candidates land top jobs.

Improve this "{section_type}" section for a "{job_title}" role.

Requirements:
- Use strong, active action verbs (e.g., Led, Delivered, Architected, Increased, Optimised)
- Make it ATS-friendly with relevant keywords for the role
- Add quantified results where possible (%, $, numbers, timeframes)
- Keep it concise and impactful — no fluff or filler words
- Professional, confident tone
- Do NOT add placeholder text like [Your Company] or [X%] — only use real content
- Return ONLY the improved text with no explanation, no preamble, no quotes

ORIGINAL TEXT:
{content}

IMPROVED VERSION:"""

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        msg = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        return {"status": "success", "improved": msg.content[0].text.strip()}
    except Exception as e:
        return {"status": "error", "error": str(e)}




class ResumeParseRequest(BaseModel):
    resume_text: str
    job_description: str = ""   # optional — used for smart tailoring hints


@app.post("/parse-resume")
async def parse_resume(request: ResumeParseRequest):
    """
    AI-powered resume parser.
    Accepts raw text extracted from PDF/DOCX + optional job description.
    Returns structured JSON + a capture_summary so the frontend
    can show exactly what was captured vs what is missing.
    """
    resume_text = request.resume_text.strip()
    job_description = request.job_description.strip()

    if not resume_text or len(resume_text) < 30:
        raise HTTPException(status_code=400, detail="Resume text is too short or empty.")

    # Truncate gracefully to keep within token limits
    MAX_CHARS = 8000
    truncated = resume_text[:MAX_CHARS]
    if len(resume_text) > MAX_CHARS:
        truncated += "\n[... document truncated for processing ...]"

    jd_block = f"\n\nJOB DESCRIPTION (use this to prioritise keywords and tailor skill ratings):\n---\n{job_description[:2000]}\n---" if job_description else ""

    prompt = f"""You are an expert ATS resume parser with 20 years experience. Your job is to EXTRACT EVERY PIECE OF DATA from the resume text below and return it as valid JSON.

STRICT RULES:
1. EXTRACT THE ACTUAL PERSON'S NAME — never "resume", never a filename, never "John Doe" as a placeholder.
2. Extract EVERY work experience entry — even internships, part-time, freelance.
3. Extract EVERY education entry — degrees, diplomas, courses, certifications.
4. For experience bullets: put day-to-day duties in "responsibilities", put achievements/metrics in "bullets".
5. Dates: use "YYYY-MM" format. If only year is available use "YYYY". If currently employed set "current": true and "to": "".
6. Skills: extract ALL skills mentioned anywhere in the resume. Assign "rating" 1-5 based on context (years of experience, listed as expert/proficient, etc. Default = 3).
7. NEVER invent data. If a field is not in the resume, use "" or [].
8. Return ONLY valid JSON — no markdown, no code fences, no explanation.{jd_block}

RESUME TEXT TO PARSE:
---
{truncated}
---

Return this EXACT JSON structure (fill every field you find):
{{
  "name": "Full Name From Resume",
  "title": "Current Job Title or Target Role",
  "email": "email@example.com",
  "phone": "+91-XXXXXXXXXX",
  "location": "City, State/Country",
  "linkedin": "linkedin.com/in/username",
  "website": "portfolio.com",
  "dob": "DD Month YYYY or empty",
  "address": "Full postal address if mentioned",
  "summary": "Complete professional summary paragraph exactly as written",
  "experience": [
    {{
      "company": "Exact Company Name",
      "role": "Exact Job Title",
      "location": "City",
      "from": "2022-06",
      "to": "",
      "current": true,
      "responsibilities": ["Day-to-day duty 1", "Day-to-day duty 2"],
      "bullets": ["Quantified achievement with metrics", "Key accomplishment"]
    }}
  ],
  "education": [
    {{
      "degree": "B.Tech / MBA / etc",
      "field": "Computer Science / Finance / etc",
      "institution": "University or College Name",
      "year": "2020",
      "grade": "8.5 CGPA / 85% / First Class"
    }}
  ],
  "skills": [
    {{"name": "Python", "rating": 5}},
    {{"name": "SQL", "rating": 4}}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "What it does and the impact",
      "tech": "Technologies used",
      "link": "github.com/link or empty"
    }}
  ],
  "certifications": [
    {{
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "year": "2023"
    }}
  ],
  "achievements": [
    {{"text": "Specific achievement or award with context"}}
  ],
  "languages": "English (Fluent), Hindi (Native)",
  "interests": "Reading, Coding, Chess",
  "other": "Any other relevant info not captured above"
}}"""

    try:
        import anthropic, json
        ai_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        msg = ai_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = msg.content[0].text.strip()

        # Strip markdown code fences if Claude wrapped in them
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()
        if raw.startswith("json"):
            raw = raw[4:].strip()

        parsed = json.loads(raw)

        # Add unique IDs to every array entry (frontend requirement)
        import time, random
        def uid(offset=0):
            return int(time.time() * 1000) + offset + random.randint(1, 9999)

        for i, exp in enumerate(parsed.get("experience", [])):
            exp["id"] = uid(i)
            exp.setdefault("responsibilities", [])
            exp.setdefault("bullets", [])
            exp.setdefault("current", False)
            # Merge empty responsibilities into bullets if needed
            if not exp["responsibilities"] and exp["bullets"]:
                exp["responsibilities"] = exp["bullets"]
                exp["bullets"] = []

        for i, edu in enumerate(parsed.get("education", [])):
            edu["id"] = uid(100 + i)
            edu.setdefault("field", "")
            edu.setdefault("grade", "")

        for i, skill in enumerate(parsed.get("skills", [])):
            skill["id"] = uid(200 + i)
            skill.setdefault("rating", 3)
            # Clamp rating 1-5
            skill["rating"] = max(1, min(5, int(skill.get("rating", 3))))

        for i, proj in enumerate(parsed.get("projects", [])):
            proj["id"] = uid(300 + i)
            proj.setdefault("link", "")

        for i, cert in enumerate(parsed.get("certifications", [])):
            cert["id"] = uid(400 + i)
            cert.setdefault("issuer", "")
            cert.setdefault("year", "")

        for i, ach in enumerate(parsed.get("achievements", [])):
            ach["id"] = uid(500 + i)

        # Ensure every top-level key exists
        defaults = {
            "name": "", "title": "", "email": "", "phone": "", "location": "",
            "linkedin": "", "website": "", "photo": "", "dob": "", "address": "",
            "summary": "", "experience": [], "education": [], "skills": [],
            "projects": [], "certifications": [], "achievements": [],
            "languages": "", "interests": "", "other": "",
            "hobbies": [], "strengths": [], "sectionLayout": {},
        }
        for key, default_val in defaults.items():
            if key not in parsed:
                parsed[key] = default_val

        # ── Build capture summary for frontend display ──────────────────────
        captured = []
        missing  = []

        def chk(label, val):
            if val and (isinstance(val, str) and val.strip() or isinstance(val, list) and len(val) > 0):
                captured.append(label)
            else:
                missing.append(label)

        chk("Full Name",          parsed["name"])
        chk("Job Title",          parsed["title"])
        chk("Email Address",      parsed["email"])
        chk("Phone Number",       parsed["phone"])
        chk("Location / City",    parsed["location"])
        chk("LinkedIn Profile",   parsed["linkedin"])
        chk("Website / Portfolio",parsed["website"])
        chk("Date of Birth",      parsed["dob"])
        chk("Professional Summary",parsed["summary"])
        chk(f"Work Experience ({len(parsed['experience'])} entries)",   parsed["experience"])
        chk(f"Education ({len(parsed['education'])} entries)",           parsed["education"])
        chk(f"Skills ({len(parsed['skills'])} found)",                   parsed["skills"])
        chk(f"Projects ({len(parsed['projects'])} entries)",             parsed["projects"])
        chk(f"Certifications ({len(parsed['certifications'])} entries)", parsed["certifications"])
        chk(f"Achievements ({len(parsed['achievements'])} entries)",     parsed["achievements"])
        chk("Languages",          parsed["languages"])
        chk("Interests / Hobbies",parsed["interests"])

        parsed["_captureSummary"] = {
            "captured": captured,
            "missing":  missing,
            "captureRate": round(len(captured) / (len(captured) + len(missing)) * 100) if (captured or missing) else 0,
        }

        return {"status": "success", "data": parsed}

    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}\nRaw: {raw[:600]}")
        return {"status": "error", "error": "AI returned invalid JSON. Please try again."}
    except Exception as e:
        print(f"❌ Resume parse error: {e}")
        return {"status": "error", "error": str(e)}


class ResumeParseTextRequest(BaseModel):
    text: str
    job_description: str = ""


@app.post("/parse-resume-text")
async def parse_resume_text(request: ResumeParseTextRequest):
    """
    Parses plain text pasted directly by the user (from ChatGPT, Google Docs, etc).
    Reuses the same AI parsing prompt as /parse-resume.
    """
    # Reuse the ResumeParseRequest model + parse_resume logic by creating an equivalent object
    parse_req = ResumeParseRequest(
        resume_text=request.text,
        job_description=request.job_description,
    )
    result = await parse_resume(parse_req)
    return result.get("data", result) if isinstance(result, dict) and "data" in result else result


# ── NEW: Generate summary from user context (when summary is empty) ──────────
class SummaryContextRequest(BaseModel):
    job_title: str = ""
    name: str = ""
    interests: str = ""
    job_description: str = ""
    experience_summary: str = ""

@app.post("/generate-summary-from-context")
async def generate_summary_from_context(request: SummaryContextRequest):
    """
    Generates a professional resume summary from scratch using context the user provides.
    Called when the user has no existing summary but wants AI to write one.
    """
    parts = []
    if request.job_title:
        parts.append(f"Target Role: {request.job_title}")
    if request.name:
        parts.append(f"Candidate Name: {request.name}")
    if request.experience_summary:
        parts.append(f"Experience Background: {request.experience_summary}")
    if request.interests:
        parts.append(f"Areas of Interest / Specialization: {request.interests}")
    if request.job_description:
        parts.append(f"Job Description (tailor to this): {request.job_description[:1500]}")

    if not parts:
        return {"status": "error", "error": "Please provide at least a job title or some context."}

    context_block = "\n".join(parts)

    prompt = f"""You are a world-class professional resume writer.

Write a compelling, ATS-friendly professional summary for a resume based on the following context:

{context_block}

Requirements:
- 3–4 concise, impactful sentences
- Use strong, active language (results-driven, passionate, specialising in…)
- Include relevant keywords for the target role
- Do NOT include placeholder text like [X years] — only use what is provided
- Do NOT add a heading like "Summary:" — return ONLY the paragraph text
- Sound confident and professional, not generic

Write the summary now:"""

    try:
        import anthropic
        ai_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        msg = ai_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )
        summary = msg.content[0].text.strip()
        return {"status": "success", "summary": summary}
    except Exception as e:
        return {"status": "error", "error": str(e)}


# ── NEW: Spell & Grammar checker for entire resume ───────────────────────────
class SpellCheckRequest(BaseModel):
    resume_json: str  # Full JSON-stringified resume object

@app.post("/check-spelling-grammar")
async def check_spelling_grammar(request: SpellCheckRequest):
    """
    Checks spelling and grammar across all resume text fields.
    Returns a structured list of corrections with field names.
    """
    import json as _json

    try:
        resume = _json.loads(request.resume_json)
    except Exception:
        return {"status": "error", "error": "Invalid resume JSON"}

    # Build a readable text representation of all fields to check
    fields_to_check = {}
    if resume.get("name", "").strip():
        fields_to_check["name"] = ("Candidate Name", resume["name"])
    if resume.get("title", "").strip():
        fields_to_check["title"] = ("Job Title", resume["title"])
    if resume.get("summary", "").strip():
        fields_to_check["summary"] = ("Professional Summary", resume["summary"])
    if resume.get("languages", "").strip():
        fields_to_check["languages"] = ("Languages", resume["languages"])
    if resume.get("interests", "").strip():
        fields_to_check["interests"] = ("Interests", resume["interests"])
    if resume.get("other", "").strip():
        fields_to_check["other"] = ("Other Info", resume["other"])

    # Add experience responsibilities and bullets
    for i, exp in enumerate(resume.get("experience", [])):
        all_bullets = (exp.get("responsibilities") or []) + (exp.get("bullets") or [])
        combined = " | ".join([b for b in all_bullets if b and b.strip()])
        if combined:
            label = f"Experience — {exp.get('role', '')} at {exp.get('company', '')}".strip(" at ")
            fields_to_check[f"experience_{i}"] = (label, combined)

    # Add projects
    for i, proj in enumerate(resume.get("projects", [])):
        desc = proj.get("description", "").strip()
        if desc:
            fields_to_check[f"project_{i}"] = (f"Project — {proj.get('name','')}", desc)

    if not fields_to_check:
        return {
            "status": "success",
            "corrections": [],
            "total": 0,
            "message": "No text content found to check."
        }

    # Build the prompt
    fields_text = "\n\n".join([
        f'Field ID: "{fid}"\nLabel: "{label}"\nContent: "{content}"'
        for fid, (label, content) in fields_to_check.items()
    ])

    prompt = f"""You are an expert proofreader specialising in professional resume content.
Your ONLY job is to find and fix SPELLING MISTAKES and GRAMMAR ERRORS — character-level typos, wrong word forms, missing articles, subject-verb disagreements, etc.

CRITICAL RULES:
1. Check EVERY individual word for spelling mistakes. A misspelled word is any word that is not a real English word (e.g. "commernce" → "commerce", "managment" → "management", "recieve" → "receive").
2. Fix grammar errors: wrong tense, missing/extra articles (a/an/the), subject-verb disagreement, punctuation mistakes.
3. Do NOT suggest content rewrites, style changes, or improvements — ONLY fix actual spelling/grammar errors.
4. If a field has errors, return the ENTIRE corrected field text (not just the word that changed).
5. Be thorough — scan every single word individually before deciding a field is error-free.

FIELDS TO CHECK:
{fields_text}

Return ONLY a valid JSON array (no markdown, no explanation). Each item must have:
- "field": the exact field ID string from above
- "field_label": the human-readable label
- "original": the full original field text (as provided above)
- "corrected": the corrected version of the full field text

If a field has NO errors, do NOT include it in the array.
If there are NO errors at all, return an empty array: []

JSON array only:"""

    try:
        import anthropic, json as _json2
        ai_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        msg = ai_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = msg.content[0].text.strip()
        # Strip markdown fences if Claude wrapped in them
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()
        if raw.startswith("json"):
            raw = raw[4:].strip()
        corrections = _json2.loads(raw)
        return {
            "status": "success",
            "corrections": corrections,
            "total": len(corrections)
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


# ── Build Resume from AI Wizard ─────────────────────────────────────────────

class BuildResumeAIRequest(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    website: str = ""
    title: str = ""
    job_description: str = ""
    summary_hint: str = ""
    experience_raw: list = []
    education_raw: list = []
    skills_raw: str = ""
    certifications_raw: str = ""
    projects_raw: list = []
    achievements_raw: str = ""
    languages: str = ""
    hobbies: str = ""

@app.post("/build-resume-from-ai")
async def build_resume_from_ai(req: BuildResumeAIRequest):
    import json as _json3

    exp_text = ""
    for i, e in enumerate(req.experience_raw):
        from_date = e.get("from", "")
        to_date = "Present" if e.get("current") else e.get("to", "")
        exp_text += f"\n\n[Role {i+1}]\n  Title: {e.get('role','')}\n  Company: {e.get('company','')}\n  Location: {e.get('location','')}\n  Period: {from_date} to {to_date}"
        if e.get("notes", "").strip():
            exp_text += f"\n  Notes: {e['notes']}"

    edu_text = "\n".join(
        f"  * {e.get('degree','')} in {e.get('field','')} — {e.get('institution','')} ({e.get('year','')}) | Grade: {e.get('grade','')}"
        for e in req.education_raw
    )

    proj_text = "\n".join(
        f"  * {p.get('name','')}: {p.get('description','')} | Tech: {p.get('tech','')}"
        for p in req.projects_raw
    )

    jd_section = f"TARGET JOB DESCRIPTION:\n{req.job_description}" if req.job_description.strip() else "No JD provided — build a strong general professional resume."

    prompt = f"""You are a world-class resume writer. Create a professional resume from this candidate data.

CANDIDATE:
Name: {req.name}
Email: {req.email} | Phone: {req.phone} | Location: {req.location}
LinkedIn: {req.linkedin} | Website: {req.website}
Target Title: {req.title}
About: {req.summary_hint or "Not provided"}

EXPERIENCE:{exp_text if exp_text.strip() else " None provided"}

EDUCATION:{chr(10) + edu_text if edu_text.strip() else " Not provided"}

SKILLS (raw): {req.skills_raw or "Not provided"}
CERTIFICATIONS: {req.certifications_raw or "None"}
PROJECTS:{chr(10) + proj_text if proj_text.strip() else " None"}
ACHIEVEMENTS: {req.achievements_raw or "None"}
LANGUAGES: {req.languages or "Not specified"}
HOBBIES: {req.hobbies or "Not specified"}

{jd_section}

INSTRUCTIONS:
1. SUMMARY: 2-3 compelling sentences tailored to role/JD. Fix all spelling/grammar. Start with years of experience + domain, add key strength, end with clear value proposition.
2. EXPERIENCE: 4-5 bullets per role. responsibilities[] = 3-4 key duties (action verb + what you did). bullets[] = 3-4 quantified achievements (action verb + metric/outcome). Remove vague filler. Add numbers where logical.
3. SKILLS: 8-15 skills ordered by JD relevance. Remove duplicates. Rating 2-5 (5=Expert). MUST be an array of objects [{{"id":200,"name":"Skill","rating":4}}] — NEVER a string.
4. CERTIFICATIONS: Array of objects [{{"id":400,"name":"...","issuer":"...","year":"..."}}] — NEVER a string.
5. ACHIEVEMENTS: Array of objects [{{"id":500,"text":"..."}}] — NEVER a string.
6. HOBBIES: Array of objects [{{"id":600,"name":"...","icon":"🎯"}}] — NEVER a string. Use relevant emojis.
7. Fix ALL spelling mistakes and grammar errors in every field.
8. Remove irrelevant or redundant information. Keep only what strengthens the resume.
9. Keep personal details (name, email, phone, location, linkedin) EXACTLY as provided — do not change them.
10. Return ONLY valid JSON — no markdown, no code fences, no explanation. Start with {{ and end with }}.

JSON STRUCTURE:
{{
  "name": "{req.name}", "title": "{req.title}", "email": "{req.email}",
  "phone": "{req.phone}", "location": "{req.location}", "linkedin": "{req.linkedin}",
  "website": "{req.website}", "dob": "", "address": "", "photo": "",
  "summary": "2-3 sentence professional summary tailored to role",
  "experience": [
    {{"id": 1, "role": "title", "company": "company", "location": "city",
      "from": "YYYY-MM", "to": "YYYY-MM or empty", "current": false,
      "responsibilities": ["duty 1", "duty 2", "duty 3"],
      "bullets": ["achievement with metric 1", "achievement 2", "achievement 3"]}}
  ],
  "education": [
    {{"id": 100, "degree": "B.Tech", "field": "Computer Science",
      "institution": "University Name", "year": "2018-2022", "grade": "8.5 CGPA"}}
  ],
  "skills": [{{"id": 200, "name": "Skill", "rating": 4}}],
  "projects": [{{"id": 300, "name": "Project", "description": "desc", "tech": "tech stack", "link": ""}}],
  "certifications": [{{"id": 400, "name": "Cert", "issuer": "Org", "year": "2023"}}],
  "achievements": [{{"id": 500, "text": "Achievement"}}],
  "languages": "English (Native), Hindi (Fluent)",
  "interests": "", "other": "",
  "hobbies": [{{"id": 600, "name": "Hobby", "icon": "🎯"}}],
  "strengths": [],
  "sectionLayout": {{
    "skills": "sidebar", "languages": "sidebar", "interests": "sidebar",
    "hobbies": "sidebar", "strengths": "sidebar", "certifications": "sidebar",
    "achievements": "main"
  }}
}}"""

    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.content[0].text.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
        raw = raw.strip()
        resume_data = _json3.loads(raw)
        return {"resume": resume_data, "status": "success"}
    except _json3.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"AI returned malformed JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Build failed: {str(e)}")
