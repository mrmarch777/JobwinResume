import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const THEMES = {
  nocturnal: { bg: "#09090f", card: "#13131a", border: "#2a2a3a", text: "#f0f0ff", sub: "#8888aa", accent: "#7c6ff7", accentB: "#ff6eb4" },
  pristine:  { bg: "#f4f4ff", card: "#ffffff", border: "#ddddf0", text: "#111122", sub: "#5555aa", accent: "#5c55e8", accentB: "#e8559a" },
  midnight:  { bg: "#010108", card: "#0d0d18", border: "#1e1e30", text: "#e8e8ff", sub: "#7070a0", accent: "#6358f5", accentB: "#f558b0" },
  emerald:   { bg: "#030f0a", card: "#081a10", border: "#0f3020", text: "#e0fff0", sub: "#60a080", accent: "#2ecc8a", accentB: "#cc2e8a" },
};

const STEPS = [
  { id: "personal",       label: "Personal Info",   icon: "👤" },
  { id: "summary",        label: "Summary",         icon: "📝" },
  { id: "experience",     label: "Experience",      icon: "💼" },
  { id: "education",      label: "Education",       icon: "🎓" },
  { id: "skills",         label: "Skills",          icon: "⚡" },
  { id: "projects",       label: "Projects",        icon: "🚀" },
  { id: "certifications", label: "Certifications",  icon: "🏆" },
  { id: "achievements",   label: "Achievements",    icon: "🌟" },
  { id: "extras",         label: "Other Info",      icon: "➕" },
];

const P_FIELDS = [
  { key: "name",     label: "Full Name",           hint: "e.g. Arjun Sharma",                   req: true  },
  { key: "title",    label: "Target Job Title",    hint: "e.g. Senior Data Analyst",             req: true  },
  { key: "email",    label: "Email Address",       hint: "arjun@gmail.com",                      req: true  },
  { key: "phone",    label: "Phone Number",        hint: "+91 98765 43210",                      req: true  },
  { key: "location", label: "City / Location",     hint: "Mumbai, Maharashtra",                  req: true  },
  { key: "dob",      label: "Date of Birth",       hint: "e.g. 15 Jan 1995 (optional)",          req: false },
  { key: "address",  label: "Full Address",        hint: "Flat 201, XYZ Apts, Andheri, Mumbai (optional)", req: false },
  { key: "linkedin", label: "LinkedIn URL",        hint: "linkedin.com/in/yourname (optional)",  req: false },
  { key: "website",  label: "Portfolio / Website", hint: "yourname.dev (optional)",              req: false },
];

const emptyResume = () => ({
  name: "", title: "", email: "", phone: "", location: "",
  dob: "", address: "", linkedin: "", website: "",
  summary: "",
  experience: [],
  education: [],
  skills: "",
  projects: [],
  certifications: [],
  achievements: [],
  languages: "",
  interests: "",
  other: "",
});

const mkId   = () => Date.now() + Math.random();
const mkExp  = () => ({ id: mkId(), company: "", role: "", location: "", from: "", to: "", current: false, responsibilities: [], bullets: [] });
const mkEdu  = () => ({ id: mkId(), institution: "", degree: "", field: "", year: "", grade: "" });
const mkProj = () => ({ id: mkId(), name: "", description: "", tech: "", link: "" });
const mkCert = () => ({ id: mkId(), name: "", issuer: "", year: "" });
const mkAch  = (text) => ({ id: mkId(), text });

export default function ResumeAI() {
  const router = useRouter();
  const [theme, setTheme] = useState("nocturnal");
  const T = THEMES[theme];

  const [screen, setScreen]     = useState("intro");
  const [rd, setRd]             = useState(emptyResume());
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [stepIdx, setStepIdx]   = useState(0);
  const [phase, setPhase]       = useState("");
  const [pFieldIdx, setPFieldIdx] = useState(0);
  const [tempExp, setTempExp]   = useState(null);
  const [tempEdu, setTempEdu]   = useState(null);
  const [tempProj, setTempProj] = useState(null);
  const [tempCert, setTempCert] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("resumeora_theme");
    if (saved && THEMES[saved]) setTheme(saved);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, loading]);

  const switchTheme = (t) => { setTheme(t); localStorage.setItem("resumeora_theme", t); };
  const addAI   = (text, extra) => setMsgs(prev => [...prev, { role: "ai", text, ...(extra || {}) }]);
  const addUser = (text)        => setMsgs(prev => [...prev, { role: "user", text }]);
  const upd     = (patch)       => setRd(prev => ({ ...prev, ...patch }));
  const wait    = (ms)          => new Promise(r => setTimeout(r, ms));

  // ── SKIP DETECTION: never saves the word "skip" as a value ─────────────────
  const isSk = (v) => {
    const l = (v || "").toLowerCase().trim();
    return l === "" || l === "skip" || l === "s" || l === "none" || l === "na" || l === "n/a" || l === "-";
  };
  const isNo = (v) => {
    const l = (v || "").toLowerCase().trim();
    return l === "no" || l === "n" || l === "nope" || isSk(v);
  };
  const isYes = (v) => {
    const l = (v || "").toLowerCase().trim();
    return l === "yes" || l === "y" || l === "yeah" || l === "yep" || l === "sure" || l === "ok" || l === "yup";
  };
  // Clean value — returns "" if skip word, otherwise the actual value
  const clean = (v) => isSk(v) ? "" : v.trim();

  // ── START ──────────────────────────────────────────────────────────────────
  const handleStart = () => {
    setScreen("chat");
    setStepIdx(0);
    setTimeout(() => {
      const f = P_FIELDS[0];
      addAI("👋 Hi! I'm your AI Resume Builder. I'll guide you through each section step by step.\n\nLet's start! 🔴 **Required** — " + f.label + "\n_" + f.hint + "_");
      setPhase("p_field");
      setPFieldIdx(0);
    }, 200);
  };

  // ── SEND ───────────────────────────────────────────────────────────────────
  const handleSend = async (overrideVal) => {
    const val = (overrideVal !== undefined ? overrideVal : input).trim();
    if (loading) return;
    if (overrideVal === undefined) setInput("");
    // Show user message — but show "(skipped)" for skip words
    addUser(isSk(val) ? "(skipped)" : val);
    setLoading(true);
    try { await dispatch(val); }
    catch (e) { console.error(e); addAI("Something went wrong. Please try again."); }
    setLoading(false);
  };
  const handleSkip = () => handleSend("skip");

  // ── DISPATCH ───────────────────────────────────────────────────────────────
  const dispatch = async (val) => {
    if (phase === "p_field")         return await doPersonalField(val);
    if (phase === "summary")         return await doSummary(val);
    if (phase === "exp_company")     return doExpCompany(val);
    if (phase === "exp_role")        return doExpRole(val);
    if (phase === "exp_dates")       return doExpDates(val);
    if (phase === "exp_location")    return doExpLocation(val);
    if (phase === "exp_resp")        return doExpResp(val);
    if (phase === "exp_achiev")      return doExpAchiev(val);
    if (phase === "exp_more")        return doExpMore(val);
    if (phase === "edu_institution") return doEduInstitution(val);
    if (phase === "edu_degree")      return doEduDegree(val);
    if (phase === "edu_field")       return doEduField(val);
    if (phase === "edu_year")        return doEduYear(val);
    if (phase === "edu_grade")       return doEduGrade(val);
    if (phase === "edu_more")        return doEduMore(val);
    if (phase === "skills")          return doSkills(val);
    if (phase === "proj_prompt")     return doProjPrompt(val);
    if (phase === "proj_name")       return doProjName(val);
    if (phase === "proj_desc")       return doProjDesc(val);
    if (phase === "proj_tech")       return doProjTech(val);
    if (phase === "proj_link")       return doProjLink(val);
    if (phase === "proj_more")       return doProjMore(val);
    if (phase === "cert_prompt")     return doCertPrompt(val);
    if (phase === "cert_name")       return doCertName(val);
    if (phase === "cert_issuer")     return doCertIssuer(val);
    if (phase === "cert_year")       return doCertYear(val);
    if (phase === "cert_more")       return doCertMore(val);
    if (phase === "ach_prompt")      return doAchPrompt(val);
    if (phase === "ach_entry")       return doAchEntry(val);
    if (phase === "extras")          return doExtras(val);
  };

  // ── PERSONAL ───────────────────────────────────────────────────────────────
  const doPersonalField = async (val) => {
    const f = P_FIELDS[pFieldIdx];
    const cleaned = clean(val);

    // Required field validation
    if (f.req && !cleaned) {
      addAI("⚠️ **" + f.label + " is required.** Please enter a valid value.\n_" + f.hint + "_");
      return;
    }

    // Only save if not empty (never save "skip" or "" into required fields)
    if (cleaned) upd({ [f.key]: cleaned });

    const next = pFieldIdx + 1;
    if (next < P_FIELDS.length) {
      setPFieldIdx(next);
      await wait(300);
      const nf = P_FIELDS[next];
      addAI((nf.req ? "🔴 **Required**" : "⚪ Optional") + " — " + nf.label + "\n_" + nf.hint + "_");
    } else {
      await wait(300);
      addAI("✅ Personal details saved!");
      beginStep(1);
    }
  };

  // ── SUMMARY ────────────────────────────────────────────────────────────────
  const doSummary = async (val) => {
    if (isSk(val)) {
      addAI("⏳ Generating your professional summary with AI...");
      const improved = await callImprove(
        "Name: " + rd.name + ", Role: " + rd.title + ", Skills: " + (rd.skills || "various skills"),
        "professional summary", rd.title
      );
      upd({ summary: improved || "Motivated " + rd.title + " with a strong track record of delivering results." });
      addAI("✅ Summary generated!");
    } else {
      upd({ summary: val.trim() });
      addAI("✅ Summary saved!");
    }
    beginStep(2);
  };

  // ── EXPERIENCE ─────────────────────────────────────────────────────────────
  const startExp = () => {
    setTempExp(mkExp());
    setPhase("exp_company");
    addAI("💼 **Work Experience**\n\nI'll collect each job one field at a time for accuracy.\n\n🏢 **Company name?**\ne.g. _Tata Consultancy Services, Infosys, Google_");
  };

  const doExpCompany = (val) => {
    if (isSk(val)) { beginStep(3); return; }
    const cleaned = val.trim();
    if (cleaned.length < 2) {
      addAI("⚠️ Please enter a valid **company name** (at least 2 characters).");
      return;
    }
    setTempExp(prev => ({ ...prev, company: cleaned }));
    setPhase("exp_role");
    addAI("👔 **Job title / Role** at " + cleaned + "?\ne.g. _Data Analyst, Software Engineer, Marketing Manager_");
  };

  const doExpRole = (val) => {
    const cleaned = val.trim();
    if (!cleaned || cleaned.length < 2) {
      addAI("⚠️ Please enter a valid **job title**.\ne.g. _Data Analyst, Software Engineer_");
      return;
    }
    setTempExp(prev => ({ ...prev, role: cleaned }));
    setPhase("exp_dates");
    addAI("📅 **Employment duration?**\ne.g. _Jan 2022 – Mar 2024_ or _Jun 2023 – Present_\n\nFormat: Month Year – Month Year");
  };

  const doExpDates = (val) => {
    const cleaned = val.trim();
    // Validate: must look like a date range
    const hasYear = /\d{4}/.test(cleaned);
    if (!hasYear && !isSk(cleaned)) {
      addAI("⚠️ Please enter a valid **duration** with a year.\ne.g. _Jan 2022 – Mar 2024_ or _Jun 2023 – Present_");
      return;
    }
    const isCurrent = /present|current|now/i.test(cleaned);
    const parts = cleaned.split(/\s*[–\-—]+\s*/);
    setTempExp(prev => ({
      ...prev,
      from: parts[0] ? parts[0].trim() : cleaned,
      to: isCurrent ? "Present" : (parts[1] ? parts[1].trim() : ""),
      current: isCurrent,
    }));
    setPhase("exp_location");
    addAI("📍 **Work location?**\ne.g. _Mumbai_, _Remote_, _Bangalore_ — or press **Skip**");
  };

  const doExpLocation = (val) => {
    setTempExp(prev => ({ ...prev, location: clean(val) }));
    setPhase("exp_resp");
    addAI("📋 **Key responsibilities** in this role?\n\nList each on a new line or separate with commas.\ne.g.\n• Analyzed sales data using SQL and Power BI\n• Created weekly reports for management\n• Led a team of 5 analysts\n\n_(At least 1 responsibility helps make your resume stronger)_");
  };

  const doExpResp = (val) => {
    const cleaned = clean(val);
    let resp = [];
    if (cleaned) {
      resp = cleaned.split(/\n|,(?!\s*\d)/).map(r => r.replace(/^[•\-*]\s*/, "").trim()).filter(r => r.length > 2);
    }
    if (resp.length === 0) {
      addAI("⚠️ Please add **at least one responsibility**. This is important for your resume.\ne.g. _Managed financial data, Developed dashboards, Led team meetings_");
      return;
    }
    setTempExp(prev => ({ ...prev, responsibilities: resp }));
    setPhase("exp_achiev");
    addAI("🏅 **Key achievements** in this role? _(optional but highly recommended)_\n\nUse numbers where possible!\ne.g.\n• Reduced processing time by 40%\n• Increased sales by ₹50L\n• Led team of 8 analysts\n\nOr press **Skip**");
  };

  const doExpAchiev = (val) => {
    const cleaned = clean(val);
    const bullets = cleaned
      ? cleaned.split(/\n|,(?!\s*\d)/).map(b => b.replace(/^[•\-*]\s*/, "").trim()).filter(b => b.length > 2)
      : [];
    setTempExp(prev => {
      const entry = { ...prev, bullets };
      setRd(rd2 => ({ ...rd2, experience: [...rd2.experience, entry] }));
      return entry;
    });
    setPhase("exp_more");
    addAI("✅ **Work experience added!**\nWould you like to add **another job**? (yes / no)");
  };

  const doExpMore = (val) => {
    if (isYes(val)) {
      setTempExp(mkExp());
      setPhase("exp_company");
      addAI("🏢 **Next company name?**");
    } else {
      beginStep(3);
    }
  };

  // ── EDUCATION ──────────────────────────────────────────────────────────────
  const startEdu = () => {
    setTempEdu(mkEdu());
    setPhase("edu_institution");
    addAI("🎓 **Education**\n\n**Institution / University name?**\ne.g. _Mumbai University, IIT Bombay, Pune Institute_");
  };

  const doEduInstitution = (val) => {
    if (isSk(val)) { beginStep(4); return; }
    const cleaned = val.trim();
    if (cleaned.length < 3) {
      addAI("⚠️ Please enter a valid **institution name**.");
      return;
    }
    setTempEdu(prev => ({ ...prev, institution: cleaned }));
    setPhase("edu_degree");
    addAI("📜 **Degree / Qualification?**\ne.g. _B.Tech, B.Com, MBA, B.Sc, 12th HSC, Diploma_");
  };

  const doEduDegree = (val) => {
    const cleaned = val.trim();
    if (!cleaned || cleaned.length < 2) {
      addAI("⚠️ Please enter your **degree** (e.g. B.Tech, MBA, B.Com)");
      return;
    }
    setTempEdu(prev => ({ ...prev, degree: cleaned }));
    setPhase("edu_field");
    addAI("📚 **Field / Specialization?**\ne.g. _Computer Science, Finance, Marketing_ — or **Skip**");
  };

  const doEduField = (val) => {
    setTempEdu(prev => ({ ...prev, field: clean(val) }));
    setPhase("edu_year");
    addAI("📅 **Year of completion?**\ne.g. _2021_ or _2019-2023_");
  };

  const doEduYear = (val) => {
    const cleaned = clean(val);
    setTempEdu(prev => ({ ...prev, year: cleaned }));
    setPhase("edu_grade");
    addAI("🎯 **Grade / CGPA / Percentage?**\ne.g. _8.5 CGPA_, _78%_ — or **Skip**");
  };

  const doEduGrade = (val) => {
    setTempEdu(prev => {
      const entry = { ...prev, grade: clean(val) };
      setRd(rd2 => ({ ...rd2, education: [...rd2.education, entry] }));
      return entry;
    });
    setPhase("edu_more");
    addAI("✅ Education added!\n\nAdd **another education** entry? (yes / no)");
  };

  const doEduMore = (val) => {
    if (isYes(val)) {
      setTempEdu(mkEdu());
      setPhase("edu_institution");
      addAI("🎓 **Next institution name?**");
    } else {
      beginStep(4);
    }
  };

  // ── SKILLS ─────────────────────────────────────────────────────────────────
  const doSkills = (val) => {
    const cleaned = clean(val);
    if (!cleaned) {
      addAI("⚠️ Skills are important for ATS! Please enter at least a few skills.\ne.g. _Python, SQL, Excel, Data Analysis, Communication_");
      return;
    }
    upd({ skills: cleaned });
    addAI("✅ Skills saved!");
    beginStep(5);
  };

  // ── PROJECTS ───────────────────────────────────────────────────────────────
  const doProjPrompt = (val) => {
    if (isNo(val)) { beginStep(6); return; }
    if (!isYes(val)) {
      addAI("Please reply **yes** or **no** — do you have any projects to add?");
      return;
    }
    setTempProj(mkProj());
    setPhase("proj_name");
    addAI("🔖 **Project name?**\ne.g. _Sales Dashboard, Portfolio Website, Data Pipeline_");
  };

  const doProjName = (val) => {
    const cleaned = val.trim();
    if (!cleaned || cleaned.length < 2) {
      addAI("⚠️ Please enter a valid **project name**.");
      return;
    }
    setTempProj(prev => ({ ...prev, name: cleaned }));
    setPhase("proj_desc");
    addAI("📄 **Brief description** of " + cleaned + "?\nWhat does it do? What problem does it solve?");
  };

  const doProjDesc = (val) => {
    const cleaned = clean(val);
    setTempProj(prev => ({ ...prev, description: cleaned }));
    setPhase("proj_tech");
    addAI("🛠️ **Technologies used?**\ne.g. _Python, React, SQL, Power BI_ — or **Skip**");
  };

  const doProjTech = (val) => {
    setTempProj(prev => ({ ...prev, tech: clean(val) }));
    setPhase("proj_link");
    addAI("🔗 **Project link / GitHub URL?** — or **Skip**");
  };

  const doProjLink = (val) => {
    setTempProj(prev => {
      const entry = { ...prev, link: clean(val) };
      setRd(rd2 => ({ ...rd2, projects: [...rd2.projects, entry] }));
      return entry;
    });
    setPhase("proj_more");
    addAI("✅ Project added!\n\nAdd **another project**? (yes / no)");
  };

  const doProjMore = (val) => {
    if (isYes(val)) {
      setTempProj(mkProj());
      setPhase("proj_name");
      addAI("🔖 **Next project name?**");
    } else {
      beginStep(6);
    }
  };

  // ── CERTIFICATIONS ─────────────────────────────────────────────────────────
  const doCertPrompt = (val) => {
    if (isNo(val)) { beginStep(7); return; }
    if (!isYes(val)) {
      addAI("Please reply **yes** or **no** — do you have any certifications?");
      return;
    }
    setTempCert(mkCert());
    setPhase("cert_name");
    addAI("🏅 **Certification name?**\ne.g. _Microsoft Excel Advanced_, _AWS Cloud Practitioner_, _Power BI Certification_");
  };

  const doCertName = (val) => {
    const cleaned = val.trim();
    if (!cleaned || cleaned.length < 3) {
      addAI("⚠️ Please enter a valid **certification name**.");
      return;
    }
    setTempCert(prev => ({ ...prev, name: cleaned }));
    setPhase("cert_issuer");
    addAI("🏛️ **Issuing organization?**\ne.g. _Coursera, Microsoft, Google, Udemy_ — or **Skip**");
  };

  const doCertIssuer = (val) => {
    setTempCert(prev => ({ ...prev, issuer: clean(val) }));
    setPhase("cert_year");
    addAI("📅 **Year obtained?** e.g. _2023_ — or **Skip**");
  };

  const doCertYear = (val) => {
    setTempCert(prev => {
      const entry = { ...prev, year: clean(val) };
      setRd(rd2 => ({ ...rd2, certifications: [...rd2.certifications, entry] }));
      return entry;
    });
    setPhase("cert_more");
    addAI("✅ Certification added!\n\nAdd **another certification**? (yes / no)");
  };

  const doCertMore = (val) => {
    if (isYes(val)) {
      setTempCert(mkCert());
      setPhase("cert_name");
      addAI("🏅 **Next certification name?**");
    } else {
      beginStep(7);
    }
  };

  // ── ACHIEVEMENTS ───────────────────────────────────────────────────────────
  const doAchPrompt = (val) => {
    if (isNo(val)) { beginStep(8); return; }
    if (!isYes(val)) {
      addAI("Please reply **yes** or **no** — do you have any achievements?");
      return;
    }
    setPhase("ach_entry");
    addAI("🌟 **List your achievements** (one per line or comma-separated):\n\ne.g.\n• Employee of Month - TCS (March 2023)\n• Reduced processing time by 40%\n• Promoted to Senior Analyst within 1 year\n• Led cross-functional team of 12");
  };

  const doAchEntry = (val) => {
    const cleaned = clean(val);
    if (cleaned) {
      const list = cleaned.split(/\n|,(?!\s*\d)/).map(a => a.replace(/^[•\-*]\s*/, "").trim()).filter(a => a.length > 3);
      if (list.length === 0) {
        addAI("⚠️ Please enter at least one achievement (min 4 characters).");
        return;
      }
      setRd(prev => ({ ...prev, achievements: [...prev.achievements, ...list.map(mkAch)] }));
      addAI("✅ " + list.length + " achievement(s) saved!");
    }
    beginStep(8);
  };

  // ── EXTRAS ─────────────────────────────────────────────────────────────────
  const doExtras = (val) => {
    const cleaned = clean(val);
    if (cleaned) {
      const langMatch = cleaned.match(/language[s]?\s*[:\-–]?\s*([^.|,\n]+)/i);
      const intMatch  = cleaned.match(/interest[s]?\s*[:\-–]?\s*([^.|,\n]+)/i);
      upd({
        languages: langMatch ? langMatch[1].trim() : "",
        interests:  intMatch  ? intMatch[1].trim()  : "",
        other: cleaned,
      });
    }
    finishAll();
  };

  // ── BEGIN STEP ─────────────────────────────────────────────────────────────
  const beginStep = (idx) => {
    setStepIdx(idx);
    const step = STEPS[idx];
    if (!step) { finishAll(); return; }

    if (step.id === "summary") {
      setPhase("summary");
      addAI("📝 **Professional Summary**\n\nWrite 2–4 sentences about your background, strengths and career goal.\n\nOr press **Skip** and I'll generate one using AI.");
    } else if (step.id === "experience") {
      startExp();
    } else if (step.id === "education") {
      startEdu();
    } else if (step.id === "skills") {
      setPhase("skills");
      addAI("⚡ **Skills**\n\nList all your skills separated by commas — technical and soft.\ne.g. _Python, SQL, Power BI, Excel, Data Analysis, Team Leadership, Problem Solving_");
    } else if (step.id === "projects") {
      setPhase("proj_prompt");
      addAI("🚀 **Projects**\n\nDo you have any notable projects to add? (yes / no)");
    } else if (step.id === "certifications") {
      setPhase("cert_prompt");
      addAI("🏆 **Certifications**\n\nDo you have any certifications or courses? (yes / no)");
    } else if (step.id === "achievements") {
      setPhase("ach_prompt");
      addAI("🌟 **Achievements**\n\nAny professional achievements, awards or recognitions? (yes / no)");
    } else if (step.id === "extras") {
      setPhase("extras");
      addAI("➕ **Other Info** _(optional)_\n\nAnything else to add?\ne.g. _Languages: English, Hindi. Interests: Chess, Photography._\n\nOr press **Skip** to finish.");
    }
  };

  // ── FINISH ─────────────────────────────────────────────────────────────────
  const finishAll = async () => {
    setLoading(true);
    let finalRd = { ...rd };

    // Auto-generate summary if missing
    if (!finalRd.summary && finalRd.name) {
      const ctx = [
        "Name: " + finalRd.name,
        "Role: " + finalRd.title,
        finalRd.skills ? "Skills: " + finalRd.skills : "",
        finalRd.experience.length > 0 ? "Experience: " + finalRd.experience.map(e => e.role + " at " + e.company).join(", ") : "",
      ].filter(Boolean).join(". ");
      const improved = await callImprove(ctx, "professional summary", finalRd.title);
      if (improved) finalRd = { ...finalRd, summary: improved };
    }

    setRd(finalRd);

    // Save in exact format resume.js expects: {id, name, resume, template, updatedAt}
    try {
      const entry = {
        id: Date.now().toString(),
        name: finalRd.name ? finalRd.name + "'s Resume" : "My AI Resume",
        resume: finalRd,
        template: "modernist",
        updatedAt: new Date().toLocaleString(),
      };
      const existing = JSON.parse(localStorage.getItem("resumeora_resumes") || "[]");
      localStorage.setItem("resumeora_resumes", JSON.stringify([entry, ...existing]));
      localStorage.setItem("resumeora_current_resume", JSON.stringify(entry));
    } catch (e) {}

    setLoading(false);
    setScreen("done");

    const expC  = finalRd.experience.length;
    const eduC  = finalRd.education.length;
    const projC = finalRd.projects.length;
    const certC = finalRd.certifications.length;
    const achC  = finalRd.achievements.length;

    addAI(
      "🎉 **Your resume is complete!**\n\n" +
      "✅ Personal Info — " + finalRd.name + "\n" +
      "✅ Professional Summary\n" +
      "✅ " + expC + " Work Experience" + (expC !== 1 ? "s" : "") + "\n" +
      "✅ " + eduC + " Education " + (eduC !== 1 ? "Entries" : "Entry") + "\n" +
      "✅ Skills\n" +
      "✅ " + projC + " Project" + (projC !== 1 ? "s" : "") + "\n" +
      "✅ " + certC + " Certification" + (certC !== 1 ? "s" : "") + "\n" +
      "✅ " + achC + " Achievement" + (achC !== 1 ? "s" : "") + "\n\n" +
      "Click the button below to view, edit and download your resume!",
      { isDone: true }
    );
  };

  const callImprove = async (content, sectionType, jobTitle) => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/improve-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, section_type: sectionType, job_title: jobTitle || "Professional" }),
      });
      const d = await res.json();
      return d.improved || "";
    } catch { return ""; }
  };

  const goToResume = () => router.push("/resume?from=ai");
  const progress = screen === "done" ? 100 : Math.round((stepIdx / STEPS.length) * 100);

  const s = {
    page:       { minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column" },
    topbar:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: "1px solid " + T.border, background: T.card, position: "sticky", top: 0, zIndex: 10 },
    logo:       { fontSize: 19, fontWeight: 800, fontFamily: "'Noto Serif',serif", color: T.text },
    backBtn:    { background: "none", border: "1px solid " + T.border, color: T.sub, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
    themeRow:   { display: "flex", gap: 6, alignItems: "center" },
    dot:        (t) => ({ width: 18, height: 18, borderRadius: "50%", cursor: "pointer", background: THEMES[t].accent, border: theme === t ? "2px solid " + T.text : "2px solid transparent" }),
    introWrap:  { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", textAlign: "center" },
    introIcon:  { fontSize: 72, marginBottom: 20 },
    introTitle: { fontSize: 34, fontWeight: 800, fontFamily: "'Noto Serif',serif", marginBottom: 12 },
    introSub:   { fontSize: 15, color: T.sub, marginBottom: 36, maxWidth: 500, lineHeight: 1.7 },
    grid:       { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 560, width: "100%", marginBottom: 36 },
    gridCard:   { background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "14px 8px", textAlign: "center" },
    gridIcon:   { fontSize: 24, marginBottom: 5 },
    gridLabel:  { fontSize: 11, color: T.sub },
    startBtn:   { background: "linear-gradient(135deg," + T.accent + "," + T.accentB + ")", color: "#fff", border: "none", borderRadius: 14, padding: "16px 44px", fontSize: 16, fontWeight: 700, cursor: "pointer" },
    chatWrap:   { flex: 1, display: "flex", flexDirection: "column", maxWidth: 780, width: "100%", margin: "0 auto", padding: "0 16px 16px" },
    progWrap:   { padding: "16px 0 8px" },
    progTop:    { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: T.sub },
    bar:        { height: 5, background: T.border, borderRadius: 4, overflow: "hidden" },
    barFill:    { height: "100%", background: "linear-gradient(90deg," + T.accent + "," + T.accentB + ")", width: progress + "%", borderRadius: 4, transition: "width 0.4s ease" },
    pills:      { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" },
    pill:       (i) => ({ flexShrink: 0, padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: (i < stepIdx || screen === "done") ? T.accent + "22" : i === stepIdx ? T.accent + "44" : T.card, border: "1px solid " + ((i <= stepIdx || screen === "done") ? T.accent : T.border), color: (i <= stepIdx || screen === "done") ? T.accent : T.sub }),
    messages:   { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 },
    aiRow:      { display: "flex", gap: 10, alignItems: "flex-start" },
    aiAvatar:   { width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg," + T.accent + "," + T.accentB + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
    aiBubble:   { background: T.card, border: "1px solid " + T.border, borderRadius: "4px 16px 16px 16px", padding: "12px 16px", maxWidth: "80%", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" },
    userRow:    { display: "flex", justifyContent: "flex-end" },
    userBubble: { background: "linear-gradient(135deg," + T.accent + "cc," + T.accentB + "cc)", color: "#fff", borderRadius: "16px 4px 16px 16px", padding: "10px 16px", maxWidth: "75%", fontSize: 14, lineHeight: 1.6 },
    typingWrap: { display: "flex", gap: 5, padding: "12px 16px", background: T.card, border: "1px solid " + T.border, borderRadius: "4px 16px 16px 16px", width: "fit-content" },
    typingDot:  { width: 7, height: 7, borderRadius: "50%", background: T.sub },
    inputRow:   { display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid " + T.border },
    input:      { flex: 1, background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif" },
    skipBtn:    { background: "none", border: "1px solid " + T.border, color: T.sub, borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" },
    sendBtn:    { background: "linear-gradient(135deg," + T.accent + "," + T.accentB + ")", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", cursor: "pointer", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" },
    ctaStrip:   { position: "sticky", bottom: 0, background: T.card, borderTop: "1px solid " + T.border, padding: "16px 20px", textAlign: "center" },
    ctaBtn:     { background: "linear-gradient(135deg," + T.accent + "," + T.accentB + ")", color: "#fff", border: "none", borderRadius: 14, padding: "16px 52px", fontSize: 17, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3, boxShadow: "0 6px 28px " + T.accent + "55" },
  };

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("_") && p.endsWith("_"))   return <em key={i}>{p.slice(1, -1)}</em>;
      return <span key={i}>{p}</span>;
    });
  };

  const Topbar = () => (
    <div style={s.topbar}>
      <span style={s.logo}>🤖 AI Resume Builder</span>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={s.themeRow}>
          {Object.keys(THEMES).map(t => <div key={t} style={s.dot(t)} onClick={() => switchTheme(t)} title={t} />)}
        </div>
        <button style={s.backBtn} onClick={() => router.push("/resume")}>← Back</button>
      </div>
    </div>
  );

  if (screen === "intro") {
    return (
      <div style={s.page}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />
        <Topbar />
        <div style={s.introWrap}>
          <div style={s.introIcon}>🤖</div>
          <h1 style={s.introTitle}>AI Resume Builder</h1>
          <p style={s.introSub}>Answer my questions step-by-step and I'll build your complete professional resume — experience, education, projects, certifications and more.</p>
          <div style={s.grid}>
            {STEPS.map(st => (
              <div key={st.id} style={s.gridCard}>
                <div style={s.gridIcon}>{st.icon}</div>
                <div style={s.gridLabel}>{st.label}</div>
              </div>
            ))}
          </div>
          <button style={s.startBtn} onClick={handleStart}>🚀 Start Building My Resume</button>
        </div>
        <style>{`body{margin:0}`}</style>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />
      <Topbar />
      <div style={s.chatWrap}>
        <div style={s.progWrap}>
          <div style={s.progTop}>
            <span>{screen === "done" ? "✅ Resume Complete!" : "Step " + (Math.min(stepIdx + 1, STEPS.length)) + " of " + STEPS.length + " — " + (STEPS[stepIdx] ? STEPS[stepIdx].label : "")}</span>
            <span style={{ fontWeight: 700, color: T.accent }}>{progress}%</span>
          </div>
          <div style={s.bar}><div style={s.barFill} /></div>
        </div>
        <div style={s.pills}>
          {STEPS.map((st, i) => <div key={st.id} style={s.pill(i)}>{st.icon} {st.label}</div>)}
        </div>
        <div style={s.messages} ref={chatRef}>
          {msgs.map((m, i) => (
            <div key={i}>
              {m.role === "ai" ? (
                <div style={s.aiRow}>
                  <div style={s.aiAvatar}>🤖</div>
                  <div>
                    <div style={s.aiBubble}>{renderText(m.text)}</div>
                    {m.isDone && (
                      <button style={{ ...s.ctaBtn, display: "block", marginTop: 14 }} onClick={goToResume}>
                        📄 View &amp; Download My Resume →
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={s.userRow}>
                  <div style={s.userBubble}>{m.text}</div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={s.aiRow}>
              <div style={s.aiAvatar}>🤖</div>
              <div style={s.typingWrap}>
                {[0, 1, 2].map(i => <div key={i} style={{ ...s.typingDot, animation: "bob 1.2s " + (i * 0.2) + "s infinite" }} />)}
              </div>
            </div>
          )}
        </div>
        {screen !== "done" && (
          <div style={s.inputRow}>
            <input
              style={s.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your answer..."
              disabled={loading}
              autoFocus
            />
            <button style={s.skipBtn} onClick={handleSkip} disabled={loading}>Skip</button>
            <button style={s.sendBtn} onClick={() => handleSend()} disabled={loading || !input.trim()}>Send →</button>
          </div>
        )}
      </div>
      {screen === "done" && (
        <div style={s.ctaStrip}>
          <button style={s.ctaBtn} onClick={goToResume}>📄 View &amp; Download My Resume →</button>
        </div>
      )}
      <style>{`
        body{margin:0}
        @keyframes bob{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
        input::placeholder{color:${T.sub}}
      `}</style>
    </div>
  );
}
