import requests
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("SERP_API_KEY")
print(f"API Key: {api_key[:10]}...")

params = {
    "engine": "google_jobs",
    "q": "Data Analyst jobs in Mumbai",
    "hl": "en",
    "gl": "in",
    "api_key": api_key
}

try:
    response = requests.get("https://serpapi.com/search", params=params)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    if "jobs_results" in data:
        print(f"Success! Found {len(data['jobs_results'])} jobs.")
    else:
        print("No jobs found in response.")
        print("Full response:", data)
except Exception as e:
    print(f"Error: {e}")
