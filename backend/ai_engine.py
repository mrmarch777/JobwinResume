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
MODEL_ADVANCED = "claude-sonnet-4-20250514"  # Used for ATS analysis — needs higher accuracy


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
    """
    Analyzes ATS match between resume and job description.
    FIXED: Uses full context (6000/4000 chars), JD-first keyword extraction,
    and per-skill semantic matching so every unique JD produces unique results.

    Returns: {score, missing_keywords, matched_keywords, strengths, top_fix, success, error (optional)}
    """
    # Input validation
    if not resume_text or not resume_text.strip():
        return {
            "error": "Resume text is empty. Please provide a valid resume.",
            "score": 0, "missing_keywords": [], "matched_keywords": [],
            "strengths": "", "top_fix": "", "success": False
        }

    if not job_description or not job_description.strip():
        return {
            "error": "Job description is empty. Please provide a valid job description.",
            "score": 0, "missing_keywords": [], "matched_keywords": [],
            "strengths": "", "top_fix": "", "success": False
        }

    if len(resume_text.strip()) < 50:
        return {
            "error": "Resume is too short (minimum 50 characters).",
            "score": 0, "missing_keywords": [], "matched_keywords": [],
            "strengths": "", "top_fix": "", "success": False
        }

    if len(job_description.strip()) < 30:
        return {
            "error": "Job description is too short. Please provide more details.",
            "score": 0, "missing_keywords": [], "matched_keywords": [],
            "strengths": "", "top_fix": "", "success": False
        }

    # Use maximum context — this is the ROOT CAUSE fix for identical scores
    resume_chunk = resume_text[:6000]
    jd_chunk = job_description[:4000]

    prompt = f"""You are a senior ATS (Applicant Tracking System) expert and recruiter with 15 years experience.

Your task is to evaluate how well this resume matches this SPECIFIC job description.

IMPORTANT: Your analysis must be entirely based on THIS specific JD. Different JDs must produce different results.

═══════════════════════════════════════════
STEP 1 — EXTRACT JD REQUIREMENTS (read JD first):
Extract from the Job Description below:
- Required technical skills (hard requirements)
- Preferred technical skills (nice to have)
- Required soft skills / competencies
- Required qualifications (degree, certifications)
- Required experience level (years / seniority)
- Key industry keywords and phrases from THIS JD

═══════════════════════════════════════════
STEP 2 — CHECK RESUME AGAINST EACH REQUIREMENT:
For EACH requirement you extracted, check if the resume explicitly mentions it or demonstrates it.
Give a pass (✓) or fail (✗) for each one.

═══════════════════════════════════════════
STEP 3 — CALCULATE SCORE:
Score 0–100 based on:
- Hard skills match: 40% weight
- Keywords & industry terms match: 25% weight  
- Experience level match: 20% weight
- Education/qualifications match: 15% weight

Be STRICT and ACCURATE. Do not round up — a resume with 5/10 required skills scores 45–55, not 75.

═══════════════════════════════════════════
JOB DESCRIPTION (analyze this):
---
{jd_chunk}
---

RESUME (check against JD above):
---
{resume_chunk}
---

Respond with ONLY valid JSON (no markdown, no explanation, no code fences):
{{
  "score": <integer 0-100>,
  "missing_keywords": [<5-8 specific keywords/skills from THIS JD that are NOT in the resume>],
  "matched_keywords": [<4-6 keywords from THIS JD that ARE found in the resume>],
  "strengths": "<2-3 specific sentences about what matches THIS JD — name actual skills/qualifications>",
  "top_fix": "<The single most impactful change for THIS specific role — be specific, not generic>"
}}
"""
    try:
        print(f"🔄 ATS Score: Resume {len(resume_text)} chars | JD {len(job_description)} chars")

        response = await client.messages.create(
            model=MODEL_ADVANCED,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.content[0].text.strip()
        print(f"✅ Claude ATS response: {raw[:120]}...")

        import json
        json_start = raw.find('{')
        json_end = raw.rfind('}') + 1

        if json_start < 0 or json_end <= json_start:
            print(f"❌ No JSON in ATS response: {raw}")
            return {
                "error": "Invalid response format from AI. Please try again.",
                "score": 0, "missing_keywords": [], "matched_keywords": [],
                "strengths": "", "top_fix": "", "success": False
            }

        data = json.loads(raw[json_start:json_end])

        try:
            score = int(data.get("score", 50))
        except (ValueError, TypeError):
            score = 50
        score = max(0, min(100, score))

        def clean_list(lst, limit=10):
            if isinstance(lst, str):
                return [k.strip() for k in lst.split(",") if k.strip()][:limit]
            if not isinstance(lst, list):
                return []
            return [str(k).strip() for k in lst if k][:limit]

        missing = clean_list(data.get("missing_keywords", []))
        matched = clean_list(data.get("matched_keywords", []))
        strengths = str(data.get("strengths", ""))[:600].strip()
        top_fix = str(data.get("top_fix", ""))[:600].strip()

        print(f"✅ ATS Score: {score}% | Missing: {len(missing)} | Matched: {len(matched)}")

        return {
            "score": score,
            "missing_keywords": missing,
            "matched_keywords": matched,
            "strengths": strengths,
            "top_fix": top_fix,
            "success": True
        }

    except Exception as e:
        print(f"❌ ATS score error: {e}")
        error_msg = str(e)
        if "429" in error_msg:
            msg = "Rate limit reached. Please wait a moment and try again."
        elif "401" in error_msg or "unauthorized" in error_msg.lower():
            msg = "Authentication error with AI service. Please contact support."
        elif "timeout" in error_msg.lower():
            msg = "Analysis took too long. Please try with a shorter resume."
        else:
            msg = f"Analysis failed: {error_msg[:100]}"
        return {
            "error": msg, "score": 0, "missing_keywords": [], "matched_keywords": [],
            "strengths": "", "top_fix": "", "success": False
        }


async def comprehensive_ats_analysis(resume_text: str, job_description: str) -> dict:
    """
    Advanced ATS analysis — completely rewritten to produce JD-specific results.
    Every field in the output is anchored to requirements extracted FROM THIS SPECIFIC JD.
    """
    if not resume_text or not resume_text.strip():
        return {"error": "Resume text is empty", "overall_score": 0}

    if not job_description or not job_description.strip():
        return {"error": "Job description is empty", "overall_score": 0}

    resume_chunk = resume_text[:6000]
    jd_chunk = job_description[:4000]

    prompt = f"""You are a world-class ATS analyst and senior recruiter. Perform a deep, JD-specific resume analysis.

CRITICAL: Every score, keyword, skill gap, and recommendation MUST be derived from THIS specific job description.
Two different JDs MUST produce meaningfully different analysis results.

═══════════════════════════════════════════
JOB DESCRIPTION TO MATCH AGAINST:
---
{jd_chunk}
---

CANDIDATE RESUME:
---
{resume_chunk}
---

Follow this 5-step analysis process:

STEP 1 — JD DECOMPOSITION: Extract from the JD:
  - Must-have technical skills
  - Nice-to-have technical skills
  - Required soft skills
  - Required qualifications (degree, certifications, etc.)
  - Required experience level
  - Industry-specific keywords and jargon

STEP 2 — SKILL-BY-SKILL AUDIT: For each must-have skill, determine if it's:
  - "Present" (explicitly stated in resume)
  - "Implied" (demonstrated through related work but not stated)
  - "Missing" (no evidence)

STEP 3 — SCORE EACH CATEGORY (0-100):
  - Skills match: % of required skills found
  - Keywords match: % of JD-specific terms found in resume
  - Experience match: Does candidate's level/years match JD requirements?
  - Education match: Does their degree/certs match JD requirements?
  - Formatting: ATS-friendliness of the resume structure

STEP 4 — CALCULATE OVERALL SCORE: Weighted average (skills 40%, keywords 25%, experience 20%, education 15%)

STEP 5 — GENERATE JD-SPECIFIC RECOMMENDATIONS: Top 3 improvements directly tied to THIS JD's requirements.

Return ONLY valid JSON (no markdown, no code fences):
{{
  "overall_score": <0-100>,
  "skills_match_score": <0-100>,
  "experience_match_score": <0-100>,
  "keywords_match_score": <0-100>,
  "education_match_score": <0-100>,
  "formatting_score": <0-100>,
  "missing_hard_skills": [<3-5 must-have technical skills from THIS JD missing in resume>],
  "missing_soft_skills": [<2-3 soft skills from THIS JD missing in resume>],
  "missing_keywords": [<5-7 JD-specific keywords/phrases not in resume>],
  "matched_keywords": [<4-6 JD keywords found in resume>],
  "skill_gaps": [
    {{"skill": "<exact skill from JD>", "resume_level": "Present/Implied/Missing", "jd_requirement": "Required/Preferred/Critical", "recommendation": "<specific actionable fix>"}}
  ],
  "strengths": "<2-3 sentences naming SPECIFIC skills/experience that match THIS JD>",
  "weaknesses": "<2-3 sentences about the BIGGEST gaps relative to THIS JD's requirements>",
  "top_3_improvements": [
    {{"priority": 1, "action": "<specific action tied to THIS JD>", "impact": "<estimated score increase X%>"}},
    {{"priority": 2, "action": "<second specific action>", "impact": "<estimated score increase X%>"}},
    {{"priority": 3, "action": "<third specific action>", "impact": "<estimated score increase X%>"}}
  ],
  "ats_friendly_assessment": {{
    "formatting": "Good/Needs improvement",
    "keyword_density": "Good/Low/Too high",
    "readability_for_ats": "Good/Fair/Poor",
    "formatting_recommendations": [<2-3 specific formatting tips>]
  }},
  "estimated_interview_chance": "<X%>",
  "time_to_improve": "<X hours>",
  "next_steps": [<3-4 prioritised actionable next steps specific to THIS JD>]
}}
"""
    try:
        response = await client.messages.create(
            model=MODEL_ADVANCED,
            max_tokens=2500,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.content[0].text.strip()

        import json
        json_start = raw.find('{')
        json_end = raw.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            data = json.loads(raw[json_start:json_end])
            return data
        else:
            return {"error": "Invalid response format from AI", "overall_score": 0}

    except Exception as e:
        print(f"❌ Comprehensive ATS error: {e}")
        return {"error": f"Analysis failed: {str(e)[:100]}", "overall_score": 0}


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
    print("✅ AI Engine loaded!")
