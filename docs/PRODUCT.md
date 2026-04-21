# 📦 JobwinResume — Product Specification

## 5 Modules — 17 Features

---

### Module 1 — Smart Job Search ($1 / ₹99)

| Feature              | Description                                                    |
|----------------------|----------------------------------------------------------------|
| Multi-source search  | Searches Naukri, LinkedIn, Indeed, Google Jobs simultaneously  |
| Rich job details     | Company, title, location, date posted, apply link             |
| AI job summary       | Claude AI summarises long JD into 3 simple lines              |
| Salary insights      | Extracted from JD or estimated from market data               |
| Smart filters        | Role, city, salary range, experience, remote/hybrid/onsite    |

---

### Module 2 — Resume Builder ($3 / ₹199)

| Feature              | Description                                                    |
|----------------------|----------------------------------------------------------------|
| AI resume tailoring  | Claude rewrites your resume to match any specific JD          |
| ATS score checker    | Score 0-100% — how well your resume matches the job           |
| Resume templates     | 10+ professional templates, filled automatically by AI        |
| HR contacts          | Recruiter name + email for each job posting                   |

---

### Module 3 — One-Click Apply ($5 / ₹499)

| Feature                  | Description                                                |
|--------------------------|------------------------------------------------------------|
| Bulk job selection       | Tick multiple jobs, apply to all at once                   |
| AI cover letter          | Unique personalised cover letter per job, per company      |
| Preview before sending   | Review all emails before anything goes out                 |
| Direct email to HR       | Professional email sent directly to recruiter's inbox      |
| Gmail integration        | Send from your own Gmail account (Premium)                 |
| Application tracker      | See who opened your email, track all applications          |
| Email open tracking      | Know exactly when HR reads your email                      |
| Follow-up reminders      | Auto-drafted follow-up if no reply after 5 days            |
| Interview prep           | Top 10 likely questions + model answers per job            |
| LinkedIn msg generator   | Personalised LinkedIn message to HR or hiring manager      |

---

## User Journey (Complete Flow)

```
1. Sign up → fill profile once (name, email, phone, upload resume)
2. Search jobs → "Data Analyst, Mumbai, ₹8-12 LPA"
3. See 20 jobs → ATS score shown for each
4. Tick 5 interesting jobs
5. Click "Apply to All"
6. AI builds: tailored resume + cover letter + email per job
7. Preview screen → review all 5 → click Send
8. Emails go to HR inbox directly
9. Track dashboard → see opens, replies
10. Get shortlisted → click Interview Prep
11. Walk in confident → get the job 🎉
12. Tell 5 friends → they sign up → viral loop
```

---

## Pricing Plans

```
FREE     → 3 searches/day, basic info only
BASIC    → ₹99/$1  — Full Module 1 (job search)
STANDARD → ₹199/$3 — Module 1 + 2 (+ resume + HR contacts)
PRO      → ₹499/$5 — All 3 modules (full platform)
```

---

## Tech Stack

| Layer      | Technology     | Purpose                              |
|------------|----------------|--------------------------------------|
| Frontend   | Next.js        | Website users see and use            |
| Styling    | Tailwind CSS   | Makes website look professional      |
| Backend    | FastAPI        | Server that handles all requests     |
| Language   | Python         | Main coding language                 |
| Database   | Supabase       | Stores jobs, users, applications     |
| Cache      | Supabase       | Saves repeat searches                |
| Job data   | SerpAPI        | Fetches jobs from all job sites      |
| AI         | Claude API     | Summaries, resume, cover letter      |
| HR data    | Apollo.io      | HR contact name + email              |
| Email      | SendGrid       | Sends application emails             |
| Auth       | Supabase Auth  | User login and signup                |
| Payment IN | Razorpay       | INR payments (₹99/199/499)           |
| Payment USD| Stripe         | USD payments ($1/$3/$5)              |
| Hosting FE | Vercel         | Frontend website hosting (free)      |
| Hosting BE | Render.com     | Backend server hosting (free)        |

---

## Revenue Target

| Month | Users | Revenue/month |
|-------|-------|---------------|
| 1-2   | 30    | ~$60          |
| 3     | 100   | ~$240         |
| 5     | 400   | ~$1,000       |
| 8     | 850   | ~$2,200       |
| 10    | 1,000 | ~$2,800       |

Annual Year 1 total: ~$12,000 (~₹10 Lakh)
