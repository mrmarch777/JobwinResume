# JobwinResume Codebase Audit & Status Report

## 1. Architecture & Tech Stack Overview
* **Framework:** Next.js (Pages Router) + React 19
* **Database & Auth:** Supabase
* **AI Integration:** Google Generative AI (Gemini 1.5 Pro) via Next.js API routes
* **Styling Strategy:** Pure inline React styles (`style={{...}}`) combined with scoped `<style>` tags. Tailwind CSS is installed but not used in the core editor UI.
* **Export Strategy:** Client-side HTML-to-Canvas-to-PDF (`html2pdf.js`) and raw HTML Blob wrapped in MS Word XML for DOCX.

## 2. The Evolution of the Product
We currently have three distinct resume builder pages in the codebase, showing the evolution of the app:
1. `resume.js` (**Legacy**): A massive 466KB monolithic file. Contains old layouts and old logic.
2. `resume-create.js` (**Intermediate**): An older attempt at a multi-step builder with basic Supabase saving.
3. `resume-io.js` (**Flagship**): The modern, modular builder we have been actively working on. This is where the product shines.

## 3. Flagship Builder Status (`resume-io.js`) — What is Working
The new builder is highly modularized under `components/resume-io/` and is performing excellently:

* **State Management (`useResumeState.js`)**: Robust. It handles all sections, UI states, debounce-saves to `localStorage` (to prevent data loss), and has a proper Supabase `saveDraft` function.
* **Gallery & Dashboard**: The gallery successfully lists templates and dynamically loads previous drafts ("My Resumes") directly from Supabase.
* **Edit Panel (`SectionManager`)**: All 9 sections (Personal, Summary, Experience, Education, Skills, Projects, Certifications, Languages, Achievements) are fully functional. The AI "Improve Section" tool correctly hits `/api/improve-section`.
* **Data Normalization (`TemplateRenderer`)**: The app successfully normalizes data mismatches (e.g., when the editor calls a field `title` but the template expects `name`).
* **Upload & Parse (`ResumeUpload`)**: File uploading leverages Gemini 1.5 Pro (`/api/parse-resume`) to perfectly map uploaded PDFs/DOCXs into all 9 sections of the UI.
* **Exporting (`ExportPanel` & `LivePreview`)**: Fully functional. The recent fixes ensure that PDFs are captured at full A4 width (794px) by dynamically cloning the DOM, eliminating the "blank PDF" and clipping issues.

## 4. Technical Debt, Gaps, and Bugs Found

While the frontend is beautiful, there are a few "smoke and mirrors" features and technical debt items that need addressing:

### 🔴 High Priority: Missing Python Backend for AI Features
The **"AI Review"** and **"Tailor"** tabs look great, but they are currently **faking their results**.
* `AIReviewPanel.js` tries to fetch `http://localhost:8000/comprehensive-ats-analysis`.
* `TailorJobDetail.js` tries to fetch `http://localhost:8000/tailor-resume`.
* Because you do not have a Python backend running in production (Vercel), these requests fail. The code silently catches the error and displays **hardcoded mock data**. 
* *Recommendation:* We need to migrate these two endpoints into Next.js API routes (`/api/ats-analysis` and `/api/tailor-resume`) using Gemini, just like we did for the resume parser.

### 🟡 Medium Priority: Native Date Pickers
In `Experience.js` and `Education.js`, we use `<input type="month">`. While functional, the native browser month picker looks different across Chrome/Safari/Firefox, and looks slightly unpolished/outdated on desktop.
* *Recommendation:* Build a custom React dropdown (Month / Year) to match the crisp Resume-IO aesthetic.

### 🟢 Low Priority: Codebase Bloat
The `resume.js` file is nearly half a megabyte. If traffic is directed to `resume-io.js`, we should consider deprecating or removing `resume.js`, `resume-create.js`, and `resume-tailor.js` to speed up build times and clean up the repository.

## Summary Conclusion
The platform has a very strong foundation. The editor UI, template rendering engine, and the core Gemini Parsing/Improving loops are production-ready. 

To make this a fully complete product, the absolute next best step is to **migrate the Tailor and ATS Review logic into Next.js API routes** so they actually work with real data instead of placeholders.
