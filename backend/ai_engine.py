"""
JobwinResume — AI Engine
File: ai_engine.py
"""

import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-haiku-4-5-20251001"


async def summarise_job(job: dict) -> dict:
    prompt = f"""
You are a job search assistant. Read this job description and extract key information.

Job Title: {job['title']}
Company: {job['company']}
Description: {job['description']}

Return EXACTLY this format (nothing else):
SUMMARY: [2-3 sentence plain English summary of the role]
SKILLS: [comma-separated list of key technical skills required]
EXPERIENCE: [years of experience needed, or "Fresher" if 0]
SALARY_HINT: [salary if mentioned, or "Not mentioned"]
DIFFICULTY: [Easy / Medium / Competitive]
"""
    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.content[0].text
        lines = raw.strip().split("\n")
        result = {}
        for line in lines:
            if ":" in line:
                key, value = line.split(":", 1)
                result[key.strip()] = value.strip()

        job["ai_summary"] = result.get("SUMMARY", "Summary not available")
        job["key_skills"] = result.get("SKILLS", "Not specified")
        job["experience_needed"] = result.get("EXPERIENCE", "Not specified")
        job["salary_hint"] = result.get("SALARY_HINT", "Not mentioned")
        job["difficulty"] = result.get("DIFFICULTY", "Medium")
        return job

    except Exception as e:
        print(f"❌ AI error for {job['title']}: {e}")
        job["ai_summary"] = "Could not generate summary."
        return job


async def calculate_ats_score(resume_text: str, job_description: str) -> dict:
    prompt = f"""
You are an ATS expert. Compare this resume against the job description and score the match.

RESUME:
{resume_text[:2000]}

JOB DESCRIPTION:
{job_description[:1500]}

Return EXACTLY this format:
SCORE: [number 0-100]
MISSING_KEYWORDS: [comma-separated list of important keywords missing from resume]
STRENGTHS: [what matches well, 1-2 sentences]
TOP_FIX: [the single most important thing to add or change]
"""
    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.content[0].text
        lines = raw.strip().split("\n")
        result = {}
        for line in lines:
            if ":" in line:
                key, value = line.split(":", 1)
                result[key.strip()] = value.strip()

        return {
            "score": int(result.get("SCORE", 50)),
            "missing_keywords": result.get("MISSING_KEYWORDS", "").split(", "),
            "strengths": result.get("STRENGTHS", ""),
            "top_fix": result.get("TOP_FIX", ""),
        }

    except Exception as e:
        print(f"❌ ATS score error: {e}")
        return {"score": 0, "missing_keywords": [], "strengths": "", "top_fix": ""}


async def tailor_resume(resume_text: str, job: dict) -> str:
    prompt = f"""
You are a professional resume writer. Rewrite this resume to better match the job below.

Instructions:
- Keep all facts true — do NOT invent experience
- Reorder bullet points to highlight relevant experience first
- Add missing keywords from the job description naturally
- Keep same structure but improve wording
- Make it ATS-friendly

ORIGINAL RESUME:
{resume_text[:2000]}

TARGET JOB:
Title: {job['title']}
Company: {job['company']}
Description: {job['description'][:1000]}

Write the complete tailored resume now:
"""
    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        print(f"❌ Resume tailoring error: {e}")
        return resume_text


async def write_cover_letter(user_profile: dict, job: dict) -> str:
    prompt = f"""
Write a short, professional cover letter for this job application.

Applicant:
- Name: {user_profile.get('name', 'the applicant')}
- Experience: {user_profile.get('experience_summary', 'experienced professional')}
- Skills: {user_profile.get('skills', 'relevant skills')}

Job:
- Title: {job['title']}
- Company: {job['company']}
- HR Name: {job.get('hr_name', 'Hiring Manager')}
- Key Requirements: {job['description'][:500]}

Rules:
- Under 200 words
- Mention 2-3 specific things from the job description
- End with a clear call to action
- Professional but warm tone

Write the cover letter now:
"""
    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        print(f"❌ Cover letter error: {e}")
        return "Could not generate cover letter."


async def generate_interview_prep(job: dict, user_profile: dict) -> list:
    prompt = f"""
Generate the top 10 interview questions for this specific role and company.
Include a model answer for each based on the applicant's background.

Job: {job['title']} at {job['company']}
Job Requirements: {job['description'][:800]}
Applicant Background: {user_profile.get('experience_summary', 'relevant experience')}

Format each question EXACTLY like this:
Q: [question]
A: [2-3 sentence model answer]

Generate all 10 now:
"""
    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.content[0].text
        qa_pairs = []
        lines = raw.strip().split("\n")
        current_q = ""
        current_a = ""

        for line in lines:
            line = line.strip()
            if not line:
                continue
            if line.startswith("Q:"):
                if current_q and current_a:
                    qa_pairs.append({"question": current_q, "answer": current_a.strip()})
                current_q = line[2:].strip()
                current_a = ""
            elif line.startswith("A:"):
                current_a = line[2:].strip()
            elif current_a:
                current_a += " " + line

        if current_q and current_a:
            qa_pairs.append({"question": current_q, "answer": current_a.strip()})

        return qa_pairs

    except Exception as e:
        print(f"❌ Interview prep error: {e}")
        return []


if __name__ == "__main__":
    print("🤖 Testing JobwinResume AI Engine...")
    sample_job = {
        "title": "Data Analyst",
        "company": "Infosys",
        "location": "Mumbai",
        "description": "Looking for Data Analyst with Python, SQL, Power BI skills. 2-4 years experience.",
        "salary": "8-12 LPA",
    }
    print("📄 Summarising job with AI...")
    job_with_summary = summarise_job(sample_job)
    print(f"Summary: {job_with_summary['ai_summary']}")
    print("✅ AI Engine working!")
