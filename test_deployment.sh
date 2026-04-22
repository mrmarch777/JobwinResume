#!/bin/bash

echo "🔍 JOBWIN DEPLOYMENT DIAGNOSTIC TEST"
echo "======================================"
echo ""

# Get the API URL from environment or ask user
if [ -z "$API_URL" ]; then
    echo "Enter your Render API URL (e.g., https://jobwin-api.onrender.com):"
    read API_URL
fi

echo "Testing API: $API_URL"
echo ""

# Test 1: Basic connectivity
echo "1️⃣  Testing basic API connectivity..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health" 2>/dev/null || echo "error\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "404" ]; then
    echo "✅ API is reachable (HTTP $HTTP_CODE)"
else
    echo "❌ API not responding (HTTP $HTTP_CODE)"
    echo "   Check if Render service is running"
fi
echo ""

# Test 2: ATS Score endpoint
echo "2️⃣  Testing ATS Score endpoint..."
ATS_RESPONSE=$(curl -s -X POST "$API_URL/ats-score" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Python developer with 5 years experience",
    "job_description": "Looking for Python developer with Django experience"
  }' 2>/dev/null)

if echo "$ATS_RESPONSE" | grep -q "score"; then
    echo "✅ ATS Score endpoint working"
    echo "   Response: $(echo $ATS_RESPONSE | head -c 100)..."
else
    echo "❌ ATS Score endpoint failed"
    echo "   Response: $ATS_RESPONSE"
fi
echo ""

# Test 3: Cover Letter endpoint
echo "3️⃣  Testing Cover Letter endpoint..."
COVER_RESPONSE=$(curl -s -X POST "$API_URL/cover-letter" \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "John Doe",
    "user_experience": "5 years Python development",
    "user_skills": "Python, Django, FastAPI",
    "job_title": "Senior Python Developer",
    "job_company": "Tech Company",
    "job_description": "We need a Python expert",
    "hr_name": "Hiring Manager"
  }' 2>/dev/null)

if echo "$COVER_RESPONSE" | grep -q "cover_letter\|letter"; then
    echo "✅ Cover Letter endpoint working"
else
    echo "❌ Cover Letter endpoint failed or no response"
    echo "   Response: $(echo $COVER_RESPONSE | head -c 100)..."
fi
echo ""

# Test 4: Job Search endpoint
echo "4️⃣  Testing Job Search endpoint..."
JOB_RESPONSE=$(curl -s -X POST "$API_URL/get-jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Python Developer",
    "city": "Remote",
    "num_results": 5
  }' 2>/dev/null)

if echo "$JOB_RESPONSE" | grep -q "jobs\|title"; then
    echo "✅ Job Search endpoint working"
else
    echo "⚠️  Job Search might need SERPAPI_KEY configured"
    echo "   Response: $(echo $JOB_RESPONSE | head -c 100)..."
fi
echo ""

echo "======================================"
echo "✅ Diagnostic complete!"
echo ""
echo "If all tests passed: Your deployment is working correctly!"
echo "If any failed: Check Render logs for errors"
