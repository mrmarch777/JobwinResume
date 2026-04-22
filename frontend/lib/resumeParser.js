/**
 * Resume Parser — Enterprise-grade text extraction + AI-powered analysis
 *
 * Flow:
 * 1. Extract text from PDF/DOCX using pdfjs-dist / mammoth (client-side)
 * 2. Try AI backend for intelligent parsing (if available)
 * 3. Fall back to comprehensive client-side regex parser (works fully offline)
 * 4. Validate and clean extracted data
 * 5. Calculate data completeness score
 * 6. Return structured resume with quality metrics
 */

// ── DATA VALIDATION & QUALITY ───────────────────────────────────────────────

export function validateAndCleanResume(resumeData) {
  /**
   * Professional-grade validation and cleaning of extracted resume data.
   * Returns { resume, quality, issues, warnings }
   */
  const issues = [];
  const warnings = [];
  let quality = { personal: 0, experience: 0, education: 0, skills: 0, overall: 0 };

  // ── Personal Details Validation ─────────────────────────────────────────────
  if (!resumeData.name || resumeData.name.trim().length < 2) {
    issues.push("⚠️ Name not found. Please add your name manually.");
    quality.personal = 20;
  } else {
    quality.personal = 100;
  }

  if (!resumeData.email) {
    warnings.push("💡 Email not found. Add it for better visibility.");
  }

  if (!resumeData.phone) {
    warnings.push("💡 Phone number not found. Add it to make contact easier.");
  }

  // ── Experience Validation ───────────────────────────────────────────────────
  if (resumeData.experience && resumeData.experience.length > 0) {
    const validExp = resumeData.experience.filter(e => e.company && e.role);
    const completeness = validExp.reduce((acc, exp) => {
      let score = 0;
      if (exp.company) score += 20;
      if (exp.role) score += 20;
      if (exp.from) score += 20;
      if (exp.responsibilities && exp.responsibilities.length > 0) score += 20;
      if (exp.bullets && exp.bullets.length > 0) score += 20;
      return acc + score;
    }, 0) / Math.max(validExp.length, 1);
    
    quality.experience = Math.round(completeness);
    
    if (validExp.length === 0) {
      warnings.push("💡 No work experience detected. Add your work history for a stronger resume.");
    } else if (validExp.length < resumeData.experience.length) {
      warnings.push(`⚠️ ${resumeData.experience.length - validExp.length} incomplete work experience entries found.`);
    }
  } else {
    quality.experience = 0;
    warnings.push("💡 No work experience detected. Add your work history for a stronger resume.");
  }

  // ── Education Validation ────────────────────────────────────────────────────
  if (resumeData.education && resumeData.education.length > 0) {
    const validEdu = resumeData.education.filter(e => e.institution || e.degree);
    const completeness = validEdu.reduce((acc, edu) => {
      let score = 0;
      if (edu.institution) score += 25;
      if (edu.degree) score += 25;
      if (edu.field) score += 25;
      if (edu.year) score += 25;
      return acc + score;
    }, 0) / Math.max(validEdu.length, 1);
    
    quality.education = Math.round(completeness);
  } else {
    quality.education = 0;
  }

  // ── Skills Validation ───────────────────────────────────────────────────────
  if (resumeData.skills && resumeData.skills.length > 0) {
    const validSkills = resumeData.skills.filter(s => s.name && s.name.length > 1);
    quality.skills = validSkills.length > 5 ? 100 : Math.round((validSkills.length / 5) * 100);
  } else {
    quality.skills = 0;
    warnings.push("💡 No skills detected. Add your technical and soft skills.");
  }

  // ── Calculate Overall Quality ───────────────────────────────────────────────
  const weights = { personal: 0.25, experience: 0.35, education: 0.2, skills: 0.2 };
  quality.overall = Math.round(
    quality.personal * weights.personal +
    quality.experience * weights.experience +
    quality.education * weights.education +
    quality.skills * weights.skills
  );

  // ── Clean up extracted data ─────────────────────────────────────────────────
  const cleaned = {
    ...resumeData,
    name: (resumeData.name || "").trim(),
    email: (resumeData.email || "").trim(),
    phone: (resumeData.phone || "").trim(),
    location: (resumeData.location || "").trim(),
    title: (resumeData.title || "").trim(),
    summary: (resumeData.summary || "").trim(),
    linkedin: (resumeData.linkedin || "").trim(),
    website: (resumeData.website || "").trim(),
    experience: (resumeData.experience || []).filter(e => e.company || e.role),
    education: (resumeData.education || []).filter(e => e.institution || e.degree),
    skills: (resumeData.skills || []).filter(s => s.name && s.name.length > 0),
    projects: (resumeData.projects || []).filter(p => p.name && p.name.length > 0),
    certifications: (resumeData.certifications || []).filter(c => c.name && c.name.length > 0),
    achievements: (resumeData.achievements || []).filter(a => a.text && a.text.length > 0),
  };

  return { resume: cleaned, quality, issues, warnings };
}

// ── TEXT EXTRACTION ──────────────────────────────────────────────────────────

export async function extractTextFromPDF(file) {
  try {
    const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
    
    // Configure PDF.js worker - MUST be set before loading PDFs
    try {
      // Try multiple CDN sources for worker
      const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch (e) {
      console.warn("Could not set PDF worker from CDN, trying fallback:", e.message);
      // Fallback: try unpkg with min version
      try {
        const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      } catch (e2) {
        console.error("Failed to set PDF worker:", e2.message);
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("File is empty");
    }

    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (docErr) {
      // If standard loading fails, try alternative approach
      console.warn("Standard PDF loading failed, trying alternative method:", docErr.message);
      try {
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;
      } catch (altErr) {
        throw new Error(`Could not load PDF: ${docErr.message}. This PDF might be corrupted or encrypted.`);
      }
    }
    
    if (!pdf || pdf.numPages === 0) {
      throw new Error("PDF has no pages or is invalid");
    }

    let fullText = "";
    const maxPages = Math.min(pdf.numPages, 50); // Limit to 50 pages
    
    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        if (!content || !content.items) continue;
        
        // Sort by Y position (top to bottom), then X (left to right)
        const items = content.items.slice().sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 5) return yDiff;
          return a.transform[4] - b.transform[4];
        });
        
        let lastY = null;
        for (const item of items) {
          if (!item.str) continue;
          const y = Math.round(item.transform[5]);
          if (lastY !== null && Math.abs(y - lastY) > 5) fullText += "\n";
          else if (lastY !== null) fullText += " ";
          fullText += item.str;
          lastY = y;
        }
        fullText += "\n\n";
      } catch (pageErr) {
        console.warn(`Warning: Could not read page ${i}:`, pageErr.message);
        continue;
      }
    }
    
    if (!fullText || fullText.trim().length === 0) {
      throw new Error("No text could be extracted from PDF. Try a different PDF file.");
    }
    
    return fullText.trim();
  } catch (err) {
    console.error("PDF extraction error:", err);
    throw new Error(`PDF reading failed: ${err.message}`);
  }
}

export async function extractTextFromDOCX(file) {
  try {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("File is empty");
    }

    // convertToHtml preserves heading tags and list items — far better section detection
    try {
      const html = await mammoth.convertToHtml({ arrayBuffer });
      if (!html.value) {
        throw new Error("No content in document");
      }
      
      // Strip HTML tags but preserve newlines for h1/h2/h3/p/li
      const text = html.value
        .replace(/<h[1-3][^>]*>/gi, "\n\n")
        .replace(/<\/h[1-3]>/gi, "\n")
        .replace(/<p[^>]*>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<li[^>]*>/gi, "\n• ")
        .replace(/<\/li>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      
      if (!text || text.length === 0) {
        throw new Error("Document appears to be empty");
      }
      
      return text;
    } catch (htmlErr) {
      // Fallback: raw text extraction
      console.warn("HTML conversion failed, trying raw text extraction");
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (!result.value) {
        throw new Error("Could not extract text from document");
      }
      return result.value;
    }
  } catch (err) {
    console.error("DOCX extraction error:", err);
    throw new Error(`Document reading failed: ${err.message}`);
  }
}

// ── AI-POWERED PARSING (PRIMARY — requires backend) ───────────────────────────

async function parseWithAI(rawText, jobDescription = "") {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const response = await fetch(`${apiUrl}/parse-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_text: rawText, job_description: jobDescription }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const result = await response.json();
    if (result.status === "error") throw new Error(result.error || "AI parsing failed");

    return result.data; // includes _captureSummary
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function uid() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

// Section header keywords to detect boundaries
const SECTION_HEADERS = [
  "work experience", "experience", "employment history", "professional experience", "career history",
  "education", "academic background", "qualifications",
  "skills", "technical skills", "core skills", "key skills", "competencies",
  "projects", "personal projects", "academic projects", "key projects",
  "certifications", "certifications & courses", "licenses", "credentials",
  "achievements", "awards", "honors", "accomplishments",
  "summary", "profile", "objective", "professional summary", "career objective", "about me",
  "languages", "hobbies", "interests", "activities", "extras", "other",
  "publications", "volunteer", "references",
];

function detectSectionBoundaries(lines) {
  const sections = {};
  let currentSection = "header";
  sections[currentSection] = [];

  for (const line of lines) {
    const lower = line.toLowerCase().trim().replace(/[:\-–|]/g, "").trim();
    const matched = SECTION_HEADERS.find(
      (h) => lower === h || lower === h.toUpperCase() || (lower.length < 40 && lower.includes(h))
    );
    if (matched && line.trim().length < 60) {
      // Normalise matched section name
      if (/experience|employment|career|professional exp/.test(matched)) currentSection = "experience";
      else if (/education|academic|qualification/.test(matched)) currentSection = "education";
      else if (/skill|competenc|technical/.test(matched)) currentSection = "skills";
      else if (/project/.test(matched)) currentSection = "projects";
      else if (/cert|license|credential/.test(matched)) currentSection = "certifications";
      else if (/achieve|award|honor|accomplish/.test(matched)) currentSection = "achievements";
      else if (/summary|profile|objective|about/.test(matched)) currentSection = "summary";
      else if (/language/.test(matched)) currentSection = "languages";
      else if (/hobby|interest|activit|extra/.test(matched)) currentSection = "hobbies";
      else currentSection = matched.replace(/\s+/g, "_");

      if (!sections[currentSection]) sections[currentSection] = [];
    } else {
      sections[currentSection] = sections[currentSection] || [];
      sections[currentSection].push(line);
    }
  }
  return sections;
}

// ── COMPREHENSIVE OFFLINE PARSER ──────────────────────────────────────────────

export function comprehensiveParse(rawText) {
  const lines = rawText.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim());

  // ── Contact info extraction (search across full text) ──────────────────────
  const fullText = rawText;

  const emailMatch = fullText.match(/[\w.+%-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  const phoneMatch = fullText.match(
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{2,5}[\s.-]?\d{2,5}[\s.-]?\d{2,5}/
  );
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  const linkedinMatch = fullText.match(/linkedin\.com\/in\/[\w-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  const websiteMatch = fullText.match(
    /(?:https?:\/\/)?(?:www\.)?(?!linkedin)[\w-]+\.(?:com|io|dev|me|in|co)\/?[\w/.-]*/i
  );
  const website = websiteMatch && !websiteMatch[0].includes("linkedin") ? websiteMatch[0] : "";

  // ── Name: best-effort from first few non-contact lines ─────────────────────
  let name = "";
  // Try to find a proper name in the first 15 lines
  for (const line of lines.slice(0, 15)) {
    const clean = line.replace(/[|·•,@\d\+\-_:]/g, " ").trim();
    
    // Skip common header text
    if (/^(resume|cv|curriculum|vitae|profile|summary|objective|linkedin|email|phone|date|experience|education|skills|projects|certifications|achievement|language|interest|hobby|reference)/i.test(clean)) {
      continue;
    }
    
    // Check if it looks like a name
    if (
      clean.length >= 4 &&
      clean.length <= 60 &&
      /^[A-Za-zÀ-ÿ\s.'"-]{4,}$/.test(clean) &&
      clean.split(/\s+/).length >= 1 &&
      clean.split(/\s+/).length <= 5 &&
      !email.includes(clean.toLowerCase()) &&
      !/http|www|linkedin|github|@|\.com|\.io|\.dev/.test(clean.toLowerCase())
    ) {
      name = clean.trim();
      break;
    }
  }

  // ── Title: line after name that looks like a job title ─────────────────────
  let title = "";
  const titleKeywords = /engineer|developer|analyst|manager|designer|director|consultant|lead|specialist|scientist|architect|officer|executive|intern|head|associate/i;
  const nameIdx = lines.findIndex((l) => l.includes(name));
  for (const line of lines.slice(nameIdx + 1, nameIdx + 6)) {
    const clean = line.trim();
    if (clean.length > 3 && clean.length < 80 && titleKeywords.test(clean) && !clean.includes("@")) {
      title = clean;
      break;
    }
  }

  // ── Location: City, State or City | Country ─────────────────────────────────
  const locationLines = lines.slice(0, 20).join(" ");
  const locationMatch = locationLines.match(
    /(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+)?))|(?:\b(?:Mumbai|Delhi|Bangalore|Bengaluru|Chennai|Hyderabad|Pune|Kolkata|Noida|Gurgaon|Gurugram|Ahmedabad|Jaipur|Lucknow|Surat|Indore|Bhopal|Coimbatore|Navi Mumbai|Thane)\b)/i
  );
  const location = locationMatch ? locationMatch[0] : "";

  // ── Section detection ───────────────────────────────────────────────────────
  const sections = detectSectionBoundaries(lines);

  // ── Summary ────────────────────────────────────────────────────────────────
  const summaryLines = (sections.summary || []).filter((l) => l.trim().length > 10);
  const summary = summaryLines.join(" ").trim();

  // ── Skills ─────────────────────────────────────────────────────────────────
  const skillsRaw = (sections.skills || []).join(" ");
  // Split on common delimiters: commas, pipes, bullets, newlines, semicolons
  const skillTokens = skillsRaw
    .split(/[,|•·\n;\/\\]+/)
    .map((s) => s.replace(/^\s*[-–*►▪▸►✓✔→]\s*/, "").trim())
    .filter(
      (s) =>
        s.length > 1 &&
        s.length < 50 &&
        !/^\d+$/.test(s) &&
        !/^(and|or|the|a|an|in|of|to|for|with|on|at|by|from)$/i.test(s)
    );

  const skills = [...new Set(skillTokens)].slice(0, 30).map((name) => ({
    id: uid(),
    name,
    rating: 3,
  }));

  // ── Experience ─────────────────────────────────────────────────────────────
  const expLines = sections.experience || [];
  const experience = parseExperience(expLines);

  // ── Education ──────────────────────────────────────────────────────────────
  const eduLines = sections.education || [];
  const education = parseEducation(eduLines);

  // ── Projects ───────────────────────────────────────────────────────────────
  const projLines = sections.projects || [];
  const projects = parseProjects(projLines);

  // ── Certifications ─────────────────────────────────────────────────────────
  const certLines = sections.certifications || [];
  const certifications = certLines
    .filter((l) => l.trim().length > 3)
    .map((l) => ({
      id: uid(),
      name: l.replace(/^[-•►*▪]\s*/, "").trim(),
      issuer: "",
      year: (l.match(/\b(20\d{2})\b/) || [""])[0],
    }))
    .filter((c) => c.name.length > 3)
    .slice(0, 10);

  // ── Achievements ──────────────────────────────────────────────────────────
  const achLines = sections.achievements || [];
  const achievements = achLines
    .filter((l) => l.trim().length > 5)
    .map((l) => ({
      id: uid(),
      text: l.replace(/^[-•►*▪]\s*/, "").trim(),
    }))
    .filter((a) => a.text.length > 5)
    .slice(0, 10);

  // ── Languages ─────────────────────────────────────────────────────────────
  const langRaw = (sections.languages || []).join(", ").trim();
  const languages = langRaw || "";

  // ── Interests / Hobbies ───────────────────────────────────────────────────
  const hobbyRaw = [...(sections.hobbies || []), ...(sections.interests || [])];
  const interests = hobbyRaw.join(", ").trim();

  return {
    name,
    title,
    email,
    phone,
    location,
    linkedin,
    website,
    photo: "",
    dob: "",
    address: "",
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    languages,
    interests,
    other: "",
    hobbies: [],
    strengths: [],
    sectionLayout: {},
  };
}

// ── EXPERIENCE PARSER ─────────────────────────────────────────────────────────

function parseExperience(lines) {
  const results = [];
  if (!lines.length) return results;

  // Date patterns
  const datePat = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{2,4}|\d{4}[-/]\d{2}|\d{4}/i;
  const rangePat = new RegExp(
    `(${datePat.source})\\s*[-–—to]+\\s*(${datePat.source}|present|current|now|till date)`,
    "i"
  );

  let currentExp = null;

  const flush = () => {
    if (currentExp && (currentExp.company || currentExp.role)) {
      results.push({
        id: uid(),
        company: currentExp.company || "",
        role: currentExp.role || "",
        location: currentExp.location || "",
        from: currentExp.from || "",
        to: currentExp.to || "",
        current: currentExp.current || false,
        responsibilities: currentExp.bullets.filter((b) => b.length > 5),
        bullets: [],
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const rangeMatch = trimmed.match(rangePat);
    const yearMatch = !rangeMatch && trimmed.match(/\b(20\d{2}|19\d{2})\b/);

    // New experience entry heuristic: contains a date range
    if (rangeMatch) {
      flush();
      currentExp = {
        company: trimmed.replace(rangePat, "").replace(/[|\-–,]+/g, " ").trim(),
        role: "",
        location: "",
        from: normaliseDate(rangeMatch[1]),
        to: /present|current|now|till|date/i.test(rangeMatch[2]) ? "" : normaliseDate(rangeMatch[2]),
        current: /present|current|now|till|date/i.test(rangeMatch[2]),
        bullets: [],
      };
    } else if (currentExp) {
      if (!currentExp.role && trimmed.length < 80 && !/^\d/.test(trimmed)) {
        // Likely the role line
        if (!currentExp.company && trimmed.length < 80) {
          currentExp.company = trimmed;
        } else if (!currentExp.role) {
          currentExp.role = trimmed;
        } else {
          currentExp.bullets.push(trimmed.replace(/^[-•►*▪✓→]\s*/, ""));
        }
      } else {
        currentExp.bullets.push(trimmed.replace(/^[-•►*▪✓→]\s*/, ""));
      }
    } else {
      // No current exp yet — try to detect company/role lines
      if (!currentExp && trimmed.length < 80 && !trimmed.includes("@")) {
        flush();
        currentExp = {
          company: trimmed,
          role: "",
          location: "",
          from: yearMatch ? yearMatch[0] : "",
          to: "",
          current: false,
          bullets: [],
        };
      }
    }
  }
  flush();
  return results;
}

function normaliseDate(str) {
  if (!str) return "";
  const monthMap = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
  const m = str.trim().match(/([a-zA-Z]{3})[a-z]*[\s,]*(\d{2,4})/i);
  if (m) {
    const month = monthMap[m[1].toLowerCase()] || "01";
    const year = m[2].length === 2 ? "20" + m[2] : m[2];
    return `${year}-${month}`;
  }
  const y = str.match(/\d{4}/);
  return y ? y[0] : str;
}

// ── EDUCATION PARSER ──────────────────────────────────────────────────────────

function parseEducation(lines) {
  const results = [];
  if (!lines.length) return results;

  const degreeKeywords = /\b(B\.?Tech|B\.?E|B\.?Sc|B\.?Com|B\.?A|M\.?Tech|M\.?E|M\.?Sc|M\.?Com|M\.?A|MBA|MCA|BCA|PhD|Ph\.D|Diploma|Higher Secondary|HSC|SSC|SSLC|10th|12th|Class X|Class XII|Bachelor|Master|Doctorate|Degree|Engineering)\b/i;

  let currentEdu = null;
  const flush = () => {
    if (currentEdu && currentEdu.institution) {
      results.push({
        id: uid(),
        degree: currentEdu.degree || "",
        field: currentEdu.field || "",
        institution: currentEdu.institution || "",
        year: currentEdu.year || "",
        grade: currentEdu.grade || "",
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
    const degreeMatch = trimmed.match(degreeKeywords);
    const gradeMatch = trimmed.match(/(\d+\.?\d*\s*%|\d+\.?\d*\s*(?:CGPA|GPA|grade|marks)|\bfirst\s+class\b|\bdistinction\b)/i);

    if (degreeMatch) {
      flush();
      currentEdu = {
        degree: degreeMatch[0],
        field: trimmed.replace(degreeMatch[0], "").replace(/^[\s,in]+/, "").replace(/[|,•]+$/, "").trim(),
        institution: "",
        year: yearMatch ? yearMatch[0] : "",
        grade: gradeMatch ? gradeMatch[0] : "",
      };
    } else if (currentEdu) {
      if (!currentEdu.institution && trimmed.length > 3) {
        currentEdu.institution = trimmed.replace(/[|•]+$/, "").trim();
      } else {
        if (yearMatch && !currentEdu.year) currentEdu.year = yearMatch[0];
        if (gradeMatch && !currentEdu.grade) currentEdu.grade = gradeMatch[0];
      }
    }
  }
  flush();
  return results;
}

// ── PROJECTS PARSER ───────────────────────────────────────────────────────────

function parseProjects(lines) {
  const results = [];
  if (!lines.length) return results;

  let currentProj = null;
  const flush = () => {
    if (currentProj && currentProj.name) {
      results.push({
        id: uid(),
        name: currentProj.name,
        description: currentProj.desc.join(" ").trim(),
        tech: currentProj.tech,
        link: "",
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect tech/stack line
    const isTechLine = /\b(React|Angular|Vue|Node|Python|Java|SQL|MongoDB|Django|Flask|AWS|Azure|GCP|Spring|Docker|Kubernetes|TypeScript|JavaScript|HTML|CSS|Express|FastAPI|TensorFlow|PyTorch|C\+\+|C#|Ruby|Go|Golang|Swift|Kotlin)\b/i.test(trimmed);

    if (trimmed.length < 80 && !trimmed.startsWith("-") && !trimmed.startsWith("•") && !isTechLine) {
      flush();
      currentProj = { name: trimmed, desc: [], tech: "" };
    } else if (currentProj) {
      if (isTechLine && !currentProj.tech) {
        currentProj.tech = trimmed.replace(/^[-•*►]\s*/, "");
      } else {
        currentProj.desc.push(trimmed.replace(/^[-•*►✓]\s*/, ""));
      }
    }
  }
  flush();
  return results.slice(0, 8);
}

// ── AI-POWERED PARSING (PRIMARY) ─────────────────────────────────────────────

// ── MAIN ENTRY POINT ─────────────────────────────────────────────────────────

export async function processResumeFile(file, onProgress = null, jobDescription = "") {
  /**
   * Professional-grade resume file processing with detailed progress tracking.
   * 
   * @param {File} file - PDF/DOCX file to parse
   * @param {Function} onProgress - Callback for progress updates: onProgress({ stage, status, progress })
   * @param {string} jobDescription - Optional job description for AI-powered tailoring
   * @returns {Object} - { resume, quality, issues, warnings, _captureSummary }
   */
  
  const updateProgress = (stage, status, progress = 0) => {
    if (onProgress) onProgress({ stage, status, progress });
    console.log(`[${stage}] ${status} (${progress}%)`);
  };

  const ext = file.name.toLowerCase().split(".").pop();

  // ── Stage 1: Validate file ──────────────────────────────────────────────────
  updateProgress("validation", "Checking file...", 5);
  
  const supportedFormats = ["pdf", "docx", "doc"];
  if (!supportedFormats.includes(ext)) {
    throw new Error(
      `❌ Unsupported file format (.${ext}). Please upload a PDF or Word document.`
    );
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error("❌ File is too large. Maximum size is 50MB.");
  }

  // ── Stage 2: Extract text ──────────────────────────────────────────────────
  updateProgress("extraction", "Extracting text from document...", 15);
  
  let rawText = "";
  try {
    if (ext === "pdf") {
      rawText = await extractTextFromPDF(file);
    } else if (ext === "docx" || ext === "doc") {
      rawText = await extractTextFromDOCX(file);
    }
  } catch (err) {
    throw new Error(
      `❌ Could not read the file: ${err.message}. The file may be corrupted or password-protected.`
    );
  }

  if (!rawText || rawText.trim().length < 20) {
    throw new Error(
      "❌ Could not extract text from the file. It may be image-based, encrypted, or corrupted. Try converting it to a text-based PDF."
    );
  }

  updateProgress("extraction", `Extracted ${Math.round(rawText.length / 100)} words`, 30);

  // ── Stage 3: Parse resume ──────────────────────────────────────────────────
  updateProgress("parsing", "Analyzing resume structure...", 40);
  
  let parsed = null;

  // Try AI backend first for best quality
  try {
    updateProgress("parsing", "Using AI for intelligent parsing...", 50);
    parsed = await parseWithAI(rawText, jobDescription);
    
    if (parsed && parsed.name) {
      if (!parsed.hobbies) parsed.hobbies = [];
      if (!parsed.strengths) parsed.strengths = [];
      if (!parsed.sectionLayout) parsed.sectionLayout = {};
      updateProgress("parsing", "AI parsing completed successfully", 70);
    } else {
      throw new Error("AI returned incomplete result");
    }
  } catch (aiError) {
    updateProgress("parsing", `AI unavailable (${aiError.message}), using client-side parser...`, 55);
    parsed = comprehensiveParse(rawText);
    updateProgress("parsing", "Client-side parsing completed", 70);
  }

  // ── Stage 4: Validate & clean data ─────────────────────────────────────────
  updateProgress("validation", "Validating extracted data...", 75);
  
  const { resume, quality, issues, warnings } = validateAndCleanResume(parsed);

  updateProgress("validation", `Data quality: ${quality.overall}%`, 85);

  // ── Stage 5: Add metadata ───────────────────────────────────────────────────
  updateProgress("finalizing", "Preparing for import...", 90);
  
  const result = {
    ...resume,
    _importMetadata: {
      importedFrom: file.name,
      importedAt: new Date().toISOString(),
      quality,
      issues,
      warnings,
    },
  };

  updateProgress("finalizing", "Ready to import!", 100);

  return result;
}
