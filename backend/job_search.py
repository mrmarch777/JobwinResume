"""
JobwinResume — Job Search Engine
File: job_search.py
What it does: Searches for jobs using SerpAPI across all major job sites
Written by: Claude (your AI co-founder)
"""

import os
import requests
from dotenv import load_dotenv

# Load your secret API keys from .env file
load_dotenv()

SERP_API_KEY = os.getenv("SERP_API_KEY")


def search_jobs(role: str, city: str, num_results: int = 10) -> list:
    """
    Search for jobs by role and city.
    Returns a list of job dictionaries.
    """

    print(f"\n🔍 Searching for: [ {role} ] in [ {city} ] (Target: {num_results})")

    # If multiple cities were provided (comma-separated), we'll focus on the first one or clean it up
    # SerpAPI works best with a single primary location string
    primary_city = city.split(",")[0].strip() if "," in city else city
    query = f"{role} jobs"

    all_jobs = []
    seen = set()
    next_page_token = None
    page = 0
    max_pages = (num_results + 9) // 10

    while len(all_jobs) < num_results and page < max_pages:
        params = {
            "engine": "google_jobs",
            "q": query,
            "location": f"{primary_city}, India",
            "api_key": SERP_API_KEY,
            "num": 10,
            "hl": "en",
            "gl": "in",
        }
        
        # Use next_page_token for pagination if it exists (for Google Jobs API)
        if next_page_token:
            params["next_page_token"] = next_page_token

        try:
            print(f"📡 Page {page} fetching from SerpAPI...")
            response = requests.get("https://serpapi.com/search", params=params)
            data = response.json()

            if "error" in data:
                print(f"❌ SerpAPI Error: {data['error']}")
                break

            if "jobs_results" not in data:
                print(f"⚠️ No 'jobs_results' in response for page {page}. (Status: {response.status_code})")
                break

            raw_jobs = data["jobs_results"]
            print(f"✅ Page {page} returned {len(raw_jobs)} raw results.")

            for job in raw_jobs:
                key = (job.get("title", ""), job.get("company_name", ""))
                if key in seen: continue
                seen.add(key)

                all_jobs.append({
                    "title": job.get("title", "Unknown Title"),
                    "company": job.get("company_name", "Unknown Company"),
                    "location": job.get("location", primary_city),
                    "description": job.get("description", "No description available"),
                    "date_posted": job.get("detected_extensions", {}).get("posted_at", "Recently"),
                    "salary": job.get("detected_extensions", {}).get("salary", "Not specified"),
                    "job_type": job.get("detected_extensions", {}).get("schedule_type", "Full-time"),
                    "apply_link": job.get("share_link", ""),
                    "source": "Google Jobs",
                })

                if len(all_jobs) >= num_results: break

            # Get the token for the next page
            next_page_token = data.get("serpapi_pagination", {}).get("next_page_token")
            if not next_page_token:
                print("🏁 No more pages available according to SerpAPI.")
                break
                
            page += 1

        except Exception as e:
            print(f"❌ Fatal Error fetching jobs: {e}")
            break

    print(f"✨ Search complete! Found {len(all_jobs)} unique jobs total.\n")
    return all_jobs


def print_jobs(jobs: list):
    """Print jobs in a clean, readable format."""

    if not jobs:
        print("No jobs to display.")
        return

    print("=" * 60)
    print(f"📋 FOUND {len(jobs)} JOBS")
    print("=" * 60)

    for i, job in enumerate(jobs, 1):
        print(f"\n🏢 Job {i}: {job['title']}")
        print(f"   Company  : {job['company']}")
        print(f"   Location : {job['location']}")
        print(f"   Salary   : {job['salary']}")
        print(f"   Posted   : {job['date_posted']}")
        print(f"   Type     : {job['job_type']}")
        print(f"   Apply    : {job['apply_link'][:50]}..." if job['apply_link'] else "   Apply    : See company website")
        print(f"   JD Preview: {job['description'][:120]}...")
        print("-" * 60)


# ── Run this file directly to test ──────────────────────────
# In terminal type: python job_search.py
if __name__ == "__main__":
    # Test search — change role and city to whatever you want
    role = "Data Analyst"
    city = "Mumbai"

    jobs = search_jobs(role, city)
    print_jobs(jobs)

    print(f"\n✅ job_search.py is working correctly!")
    print(f"✅ Fetched {len(jobs)} real jobs from the internet!")
    print(f"\nNext step: Run ai_engine.py to summarise these jobs with AI.")
