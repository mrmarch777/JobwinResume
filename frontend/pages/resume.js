import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme, THEMES, usePlan, PLAN_LIMITS } from "../lib/contexts";
import Sidebar from "../components/Sidebar";
import { processResumeFile, extractTextFromPDF, extractTextFromDOCX } from "../lib/resumeParser";
import { Template6, Template7, Template11, Template12, Template13, Template15, Template16 } from "../lib/claudeTemplates";

// ── Centralised API URL \u2014 set NEXT_PUBLIC_API_URL in your environment.
// Local dev: http://localhost:8000   Production: your deployed backend URL
const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TEMPLATES = [
  // ── ATS FRIENDLY ──────────────────────────────────────────────────────────
  { id: "ats_clean",         name: "ATS Classic",      accent: "#1a1a2e",  tag: "ATS ✓",     layout: "ats",             category: "ATS Friendly" },
  { id: "ats_pro",           name: "ATS Pro",           accent: "#2c3e50",  tag: "ATS ✓",     layout: "ats_pro",        category: "ATS Friendly" },
  { id: "minimal",           name: "Minimal",           accent: "#111111",  tag: "Minimal",   layout: "minimal",        category: "ATS Friendly" },
  { id: "claude_ats1",       name: "ATS Classic+",      accent: "#2c5282",  tag: "Claude",    layout: "claude_ats1",    category: "ATS Friendly" },
  { id: "claude_ats2",       name: "ATS Structured",    accent: "#1b3a5c",  tag: "Claude",    layout: "claude_ats2",    category: "ATS Friendly" },
  { id: "claude_ats3",       name: "ATS Blue",          accent: "#1a7abf",  tag: "Claude",    layout: "claude_ats3",    category: "ATS Friendly" },
  { id: "blueprint",         name: "Blueprint",         accent: "#1565C0",  tag: "Technical", layout: "blueprint",      category: "ATS Friendly" },
  { id: "vintage_parchment", name: "Parchment",         accent: "#7B5E3A",  tag: "Vintage",   layout: "vintage",        category: "ATS Friendly" },
  { id: "vintage_typewriter",name: "Typewriter",        accent: "#3D2B1F",  tag: "Vintage",   layout: "typewriter",     category: "ATS Friendly" },
  { id: "vintage_gazette",   name: "Gazette",           accent: "#4A3728",  tag: "Vintage",   layout: "gazette",        category: "ATS Friendly" },

  // ── FUTURISTIC ────────────────────────────────────────────────────────────
  { id: "neon",              name: "Neon",              accent: "#00D4FF",  tag: "Futuristic",layout: "neon",           category: "Futuristic" },
  { id: "obsidian",          name: "Obsidian",          accent: "#A78BFA",  tag: "Dark",      layout: "obsidian",       category: "Futuristic" },
  { id: "prism",             name: "Prism",             accent: "#7C3AED",  tag: "Bold",      layout: "prism",          category: "Futuristic" },
  { id: "lumina",            name: "Lumina",            accent: "#F59E0B",  tag: "Premium",   layout: "lumina",         category: "Futuristic" },
  { id: "tokyo",             name: "Tokyo",             accent: "#E63946",  tag: "Modern",    layout: "tokyo",          category: "Futuristic" },
  { id: "modernist",         name: "Modernist",         accent: "#6C63FF",  tag: "Modern",    layout: "modernist",      category: "Futuristic" },
  { id: "claude_marketing",  name: "Marketing Pro",     accent: "#e94560",  tag: "Claude",    layout: "claude_marketing",category: "Futuristic" },
  { id: "claude_graduate",   name: "Graduate Fresh",    accent: "#00b4d8",  tag: "Claude",    layout: "claude_graduate",category: "Futuristic" },

  // ── WITH PHOTO ────────────────────────────────────────────────────────────
  { id: "photo_modern",      name: "Photo Modern",      accent: "#6C63FF",  tag: "Photo",     layout: "photo_modern",   category: "With Photo" },
  { id: "photo_sidebar",     name: "Photo Sidebar",     accent: "#2c3e50",  tag: "Photo",     layout: "photo_sidebar",  category: "With Photo" },
  { id: "photo_german",      name: "German CV",         accent: "#e2cbc0",  tag: "Photo",     layout: "photo_german",   category: "With Photo" },
  { id: "photo_bold",        name: "Photo Bold",        accent: "#D32F2F",  tag: "Photo",     layout: "photo_bold",     category: "With Photo" },
  { id: "photo_minimal",     name: "Photo Minimal",     accent: "#444444",  tag: "Photo",     layout: "photo_minimal",  category: "With Photo" },
  { id: "claude_photo1",     name: "Executive Pro",     accent: "#b8922e",  tag: "Claude",    layout: "claude_photo1",  category: "With Photo" },
  { id: "claude_photo2",     name: "Modern Header",     accent: "#e94560",  tag: "Claude",    layout: "claude_photo2",  category: "With Photo" },
  { id: "creative",          name: "Creative",          accent: "#FF6584",  tag: "Creative",  layout: "creative",       category: "With Photo" },

  // ── EXECUTIVE SUITE ───────────────────────────────────────────────────────
  { id: "executive",         name: "Executive",         accent: "#0A4A6B",  tag: "Executive", layout: "executive",      category: "Executive Suite" },
  { id: "stitch_editorial",  name: "Editorial",         accent: "#3D52A0",  tag: "Premium",   layout: "editorial",      category: "Executive Suite" },
  { id: "stitch_verdant",    name: "Verdant",           accent: "#1B3A6B",  tag: "Premium",   layout: "verdant",        category: "Executive Suite" },
  { id: "slate",             name: "Slate",             accent: "#34495E",  tag: "Modern",    layout: "slate",          category: "Executive Suite" },
  { id: "coral",             name: "Coral",             accent: "#FF6B6B",  tag: "Warm",      layout: "coral",          category: "Executive Suite" },
  { id: "sage",              name: "Sage",              accent: "#2D6A4F",  tag: "Nature",    layout: "sage",           category: "Executive Suite" },
];

// Layouts that have a left sidebar — section placement toggle applies to these
const SIDEBAR_LAYOUTS = ["creative","ats_pro","editorial","verdant","executive","slate",
  "prism","coral","sage","blueprint","lumina","obsidian",
  "photo_german","photo_modern","photo_sidebar","photo_bold",
  "claude_marketing","claude_photo1"];

// ── Normalise whatever Claude returns into the shape the editor needs ────────
function normalizeAIResume(raw) {
  if (!raw || typeof raw !== "object") return {};

  // Helper: ensure value is always an array
  const toArr = (v) => {
    if (Array.isArray(v)) return v;
    if (!v || v === "") return [];
    if (typeof v === "string") return v.split(",").map(s => s.trim()).filter(Boolean);
    return [];
  };

  // Skills: [{name,rating}] | ["str"] | "str,str" → [{id,name,rating}]
  const skills = toArr(raw.skills).map((s, i) => {
    if (typeof s === "string") return { id: 200 + i, name: s.trim(), rating: 3 };
    return { id: s.id ?? 200 + i, name: s.name || s.skill || "", rating: s.rating ?? 3 };
  }).filter(s => s.name);

  // Hobbies: [{name,icon}] | ["str"] | "str,str" → [{id,name,icon}]
  const HOBBY_MAP = { reading: "📚", chess: "♟️", football: "⚽", cricket: "🏏", music: "🎵", coding: "💻", gaming: "🎮", travel: "✈️", cooking: "🍳", photography: "📷" };
  const hobbies = toArr(raw.hobbies).map((h, i) => {
    if (typeof h === "string") { const k = h.toLowerCase().trim(); return { id: 600 + i, name: h.trim(), icon: HOBBY_MAP[k] || "🎯" }; }
    return { id: h.id ?? 600 + i, name: h.name || "", icon: h.icon || "🎯" };
  }).filter(h => h.name);

  // Certifications: [{name,issuer,year}] | ["str"] → [{id,name,issuer,year}]
  const certifications = toArr(raw.certifications).map((c, i) => {
    if (typeof c === "string") return { id: 400 + i, name: c.trim(), issuer: "", year: "" };
    return { id: c.id ?? 400 + i, name: c.name || "", issuer: c.issuer || "", year: c.year || "" };
  }).filter(c => c.name);

  // Achievements: [{text}] | ["str"] | "str" → [{id,text}]
  const achievements = toArr(raw.achievements).map((a, i) => {
    if (typeof a === "string") return { id: 500 + i, text: a.trim() };
    return { id: a.id ?? 500 + i, text: a.text || a.name || String(a) };
  }).filter(a => a.text);

  // Experience: ensure bullets & responsibilities are always arrays
  const experience = toArr(raw.experience).map((e, i) => ({
    id: e.id ?? i + 1,
    role: e.role || e.title || e.position || "",
    company: e.company || e.organization || "",
    location: e.location || "",
    from: e.from || e.startDate || "",
    to: e.current ? "" : (e.to || e.endDate || ""),
    current: !!e.current,
    responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : toArr(e.responsibilities),
    bullets: Array.isArray(e.bullets) ? e.bullets : toArr(e.bullets),
  }));

  // Education: ensure proper field names
  const education = toArr(raw.education).map((e, i) => ({
    id: e.id ?? 100 + i,
    degree: e.degree || "",
    field: e.field || e.major || e.specialization || "",
    institution: e.institution || e.school || e.university || "",
    year: e.year || e.duration || "",
    grade: e.grade || e.gpa || e.cgpa || "",
  }));

  // Projects: ensure proper structure
  const projects = toArr(raw.projects).map((p, i) => ({
    id: p.id ?? 300 + i,
    name: p.name || p.title || "",
    description: p.description || "",
    tech: p.tech || p.technologies || p.stack || "",
    link: p.link || p.url || p.github || "",
  })).filter(p => p.name);

  // Strengths: [{name}] | ["str"]
  const strengths = toArr(raw.strengths).map((s, i) => {
    if (typeof s === "string") return { id: 700 + i, name: s.trim() };
    return { id: s.id ?? 700 + i, name: s.name || "" };
  }).filter(s => s.name);

  // Languages: ensure it's a string
  const languages = typeof raw.languages === "string" ? raw.languages
    : Array.isArray(raw.languages) ? raw.languages.join(", ") : "";

  return {
    ...raw,
    skills,
    hobbies,
    certifications,
    achievements,
    experience,
    education,
    projects,
    strengths,
    languages,
    sectionLayout: raw.sectionLayout || {
      skills: "sidebar", languages: "sidebar", interests: "sidebar",
      hobbies: "sidebar", strengths: "sidebar", certifications: "sidebar", achievements: "main",
    },
  };
}

const EMPTY_RESUME = {
  name: "", title: "", email: "", phone: "", location: "", dob: "", address: "", linkedin: "", website: "", photo: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: "",
  interests: "",
  other: "",
  hobbies: [],
  strengths: [],
  sectionLayout: {
    skills: "sidebar",
    languages: "sidebar",
    interests: "sidebar",
    hobbies: "sidebar",
    strengths: "sidebar",
    certifications: "sidebar",
    achievements: "main",
  },
};

const HOBBY_EMOJIS = [
  { icon: "🏏", label: "Cricket" },
  { icon: "⚽", label: "Football" },
  { icon: "🏋️", label: "Fitness" },
  { icon: "🎾", label: "Tennis" },
  { icon: "🏊", label: "Swimming" },
  { icon: "🚵", label: "Cycling" },
  { icon: "🎯", label: "Archery" },
  { icon: "🏸", label: "Badminton" },
  { icon: "🎨", label: "Art" },
  { icon: "🎵", label: "Music" },
  { icon: "📚", label: "Reading" },
  { icon: "📷", label: "Photography" },
  { icon: "✈️", label: "Travel" },
  { icon: "🍳", label: "Cooking" },
  { icon: "🎮", label: "Gaming" },
  { icon: "🌱", label: "Gardening" },
  { icon: "🎭", label: "Theatre" },
  { icon: "💻", label: "Coding" },
  { icon: "🎬", label: "Movies" },
  { icon: "♟️", label: "Chess" },
  { icon: "🏔️", label: "Trekking" },
  { icon: "🧘", label: "Yoga" },
  { icon: "🎸", label: "Guitar" },
  { icon: "🏄", label: "Surfing" },
  { icon: "🎤", label: "Singing" },
  { icon: "🧩", label: "Puzzles" },
  { icon: "🌍", label: "Exploring" },
  { icon: "🎲", label: "Board Games" },
  { icon: "🤿", label: "Diving" },
  { icon: "🧵", label: "Crafts" },
  { icon: "📝", label: "Writing" },
  { icon: "🦁", label: "Wildlife" },
  { icon: "🏡", label: "DIY" },
  { icon: "🍜", label: "Foodie" },
  { icon: "🎊", label: "Events" },
  { icon: "🏇", label: "Horse Riding" },
  { icon: "🚀", label: "Space" },
  { icon: "🎻", label: "Violin" },
  { icon: "📖", label: "Learning" },
  { icon: "🌿", label: "Nature" },
];

const SAMPLE_RESUME = {
  name: "Priya Sharma", title: "Senior Data Analyst", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
  email: "priya.sharma@gmail.com", phone: "+91 98765 43210",
  location: "Mumbai, Maharashtra", dob: "12 March 1996",
  address: "Flat 402, Lotus Heights, Andheri West, Mumbai 400053",
  linkedin: "linkedin.com/in/priyasharma-data", website: "priyasharma.dev",
  summary: "Results-driven Senior Data Analyst with 4+ years of experience transforming complex datasets into actionable business insights. Proficient in SQL, Python, and Power BI with a strong track record of reducing operational costs and driving revenue growth. Passionate about using data to solve real-world problems.",
  experience: [
    { id: 1, company: "Infosys Limited", role: "Senior Data Analyst", location: "Mumbai", from: "2022-06", to: "", current: true,
      responsibilities: ["Led end-to-end data pipeline development for 3 enterprise clients", "Designed Power BI dashboards used by 200+ stakeholders", "Mentored a team of 4 junior analysts"],
      bullets: ["Reduced monthly reporting time by 40% through automation", "Identified ₹1.2 Cr cost-saving opportunity via supply chain analysis"] },
    { id: 2, company: "Tata Consultancy Services", role: "Data Analyst", location: "Pune", from: "2020-07", to: "2022-05", current: false,
      responsibilities: ["Wrote complex SQL queries for financial reconciliation across 5 databases", "Built Python scripts for automated data cleaning and ETL processes"],
      bullets: ["Improved data accuracy from 87% to 99.2%", "Delivered 15+ ad-hoc analyses for C-suite decisions"] },
  ],
  education: [
    { id: 3, degree: "B.Tech", field: "Computer Science", institution: "University of Mumbai", year: "2016–2020", grade: "8.7 CGPA" }
  ],
  skills: [
    { id: 101, name: "Python", rating: 5 },
    { id: 102, name: "SQL", rating: 5 },
    { id: 103, name: "Power BI", rating: 4 },
    { id: 104, name: "Tableau", rating: 4 },
    { id: 105, name: "Excel", rating: 5 },
    { id: 106, name: "Machine Learning", rating: 3 },
    { id: 107, name: "Data Visualisation", rating: 4 },
    { id: 108, name: "ETL Pipelines", rating: 3 },
    { id: 109, name: "Leadership", rating: 4 },
    { id: 110, name: "Communication", rating: 5 },
  ],
  projects: [
    { id: 4, name: "Sales Forecasting Dashboard", description: "ML-powered tool that predicts monthly sales with 94% accuracy using LSTM neural networks.", tech: "Python, TensorFlow, Power BI", link: "" },
    { id: 5, name: "Customer Churn Predictor", description: "Classification model to identify high-risk customers — reduced churn by 18%.", tech: "Python, Scikit-learn, SQL", link: "" },
  ],
  certifications: [
    { id: 6, name: "Microsoft Power BI Data Analyst Associate", issuer: "Microsoft", year: "2023" },
    { id: 7, name: "Google Data Analytics Professional Certificate", issuer: "Coursera", year: "2022" },
  ],
  achievements: [
    { id: 8, text: "Employee of the Quarter — Infosys Q3 2023" },
    { id: 9, text: "Winner, Internal Hackathon 'DataSpark 2022'" },
    { id: 10, text: "Published IEEE research paper on predictive analytics (2021)" },
  ],
  languages: "English (Fluent), Hindi (Native), Marathi (Native)",
  interests: "Data Science, Chess, Trekking, Photography, Open Source",
  other: "Active Kaggle contributor (top 8% globally). IEEE Student Member.",
  hobbies: [
    { id: 201, name: "Trekking", icon: "🏔️" },
    { id: 202, name: "Chess", icon: "♟️" },
    { id: 203, name: "Photography", icon: "📷" },
    { id: 204, name: "Reading", icon: "📚" },
  ],
  strengths: [
    { id: 301, text: "Strong analytical and problem-solving mindset" },
    { id: 302, text: "Excellent communicator — able to simplify complex data for all audiences" },
    { id: 303, text: "Self-driven with a track record of meeting tight deadlines" },
    { id: 304, text: "Collaborative team player with leadership experience" },
  ],
  sectionLayout: {
    skills: "sidebar",
    languages: "sidebar",
    interests: "sidebar",
    hobbies: "sidebar",
    strengths: "sidebar",
    certifications: "sidebar",
    achievements: "main",
  },
};


// AI conversation flow
const AI_FLOW = [
  { id: "intro", q: "👋 Hi! I'm your AI Resume Builder. Let's start with your personal details.\n\nWhat is your **full name** and the **job title** you're applying for?\n\nExample: *Harry Green, Data Analyst*", field: "personal_intro" },
  { id: "contact", q: "Great! Now your contact details:\n\n📧 Email, 📞 Phone, 📍 City/Location\n\nExample: *harry@gmail.com, 9876543210, Mumbai*", field: "contact" },
  { id: "dob_address", q: "Optional but useful:\n\n🎂 Date of Birth and 🏠 Full Address?\n\nExample: *15 Jan 1995, Flat 201, XYZ Apartments, Andheri West, Mumbai 400053*\n\n(Type 'skip' to skip this)", field: "dob_address" },
  { id: "summary", q: "Tell me about yourself professionally in 2-3 sentences.\n\nWhat's your background, key strengths, and career goal?\n\nExample: *I am a Data Analyst with 3 years of experience in SQL and Power BI. I specialize in financial reconciliation and data transformation. I'm looking to grow into a senior analytics role.*", field: "summary" },
  { id: "experience", q: "💼 Let's add your work experience.\n\nTell me about your **most recent job**:\n\n- Company name\n- Job title\n- Duration (e.g. Jan 2022 – Present)\n- Location\n- Key responsibilities\n- Key achievements (with numbers if possible)", field: "experience_new" },
  { id: "more_exp", q: "Do you want to add **another work experience**?\n\nType your next job details OR type **'done'** to move on.", field: "experience_more" },
  { id: "education", q: "🎓 What is your educational background?\n\nInclude:\n- Degree & Field\n- University/Institution\n- Year\n- Grade/GPA\n\nExample: *B.Tech Computer Science, Mumbai University, 2020, 8.5 CGPA*", field: "education" },
  { id: "skills", q: "⚡ What are your key skills?\n\nList both technical and soft skills separated by commas.\n\nExample: *Python, SQL, Excel, Power BI, Tableau, Financial Analysis, Team Leadership, Problem Solving*", field: "skills" },
  { id: "projects", q: "🚀 Do you have any notable **projects**?\n\nFor each project tell me:\n- Project name\n- What it does\n- Technologies used\n\nType **'skip'** if no projects to add.", field: "projects" },
  { id: "certifications", q: "📜 Any **certifications or courses**?\n\nExample:\n- Microsoft Excel Advanced (Coursera)\n- Power BI Certification (Udemy)\n- AWS Cloud Practitioner\n\nType **'skip'** if none.", field: "certifications" },
  { id: "achievements", q: "🏆 Any **professional achievements or awards**?\n\nExample:\n- Employee of the Month - TCS (March 2023)\n- Reduced reconciliation time by 40%\n- Led team of 8 analysts\n\nType **'skip'** if none.", field: "achievements" },
  { id: "extras", q: "🌟 Any additional information?\n\nLanguages you speak, interests, or anything else you'd like on your resume?\n\nExample: *Languages: English, Hindi, Marathi. Interests: Data Science, Chess, Photography.*\n\nType **'skip'** to finish.", field: "extras" },
];

export default function Resume() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const { theme: t, themeName, setTheme } = useTheme();
  const themes = THEMES;

  const [resumes, setResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [resume, setResume] = useState({ ...EMPTY_RESUME });
  const [resumeName, setResumeName] = useState("My Resume");
  const [activeView, setActiveView] = useState("dashboard");
  const [activeTemplate, setActiveTemplate] = useState("modernist");
  const [activeSection, setActiveSection] = useState("personal");
  const [templateFilter, setTemplateFilter] = useState("All");
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [maxTemplates, setMaxTemplates] = useState(10);
  useEffect(() => {
    const handleResize = () => setMaxTemplates(window.innerWidth <= 768 ? 4 : 10);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [autoSaved, setAutoSaved] = useState(null);
  const { plan, limits } = usePlan();

  // AI Builder state
  const [aiStep, setAiStep] = useState(0);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [expCount, setExpCount] = useState(0);

  // ATS
  const [showAts, setShowAts] = useState(false);
  // ATS Optimizer standalone view
  const [atsOptFile, setAtsOptFile] = useState(null);
  const [atsOptJD, setAtsOptJD] = useState("");
  const [atsOptLoading, setAtsOptLoading] = useState(false);
  const [atsOptResult, setAtsOptResult] = useState(null);
  const [atsOptError, setAtsOptError] = useState("");
  const [atsOptResumeText, setAtsOptResumeText] = useState("");
  const [atsTextPreview, setAtsTextPreview] = useState(false);
  const atsOptFileRef = useRef(null);
  const [jobDesc, setJobDesc] = useState("");
  const [atsScore, setAtsScore] = useState(null);

  // Bulk Delete State
  const [selectedResumes, setSelectedResumes] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [improving, setImproving] = useState({});
  const autoSaveTimer = useRef(null);
  const chatEndRef = useRef(null);

  // ── Delete confirmation modal (replaces window.confirm) ──
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, bulk: false, count: 0 });

  // ── Spell & Grammar checker ──
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarPanel, setGrammarPanel] = useState(false);
  const [grammarResults, setGrammarResults] = useState([]);
  const [grammarIndex, setGrammarIndex] = useState(0);
  const [grammarDone, setGrammarDone] = useState(false);

  // ── Smart AI Summary context panel (when summary is empty) ──
  const [showSummaryCtx, setShowSummaryCtx] = useState(false);
  const [summaryCtx, setSummaryCtx] = useState({ interests: "", jobDescription: "", experienceSummary: "" });
  const [summaryCtxLoading, setSummaryCtxLoading] = useState(false);

  // ── AI Builder review step ──
  const [aiReviewStep, setAiReviewStep] = useState("chat"); // "chat" | "review" | "spellcheck"
  const [aiReviewExtra, setAiReviewExtra] = useState("");
  const [aiSpellResults, setAiSpellResults] = useState(null);
  const [aiSpellLoading, setAiSpellLoading] = useState(false);

  // ── AI Wizard state (4-step form → Claude builds complete resume) ──
  const WIZARD_EMPTY = {
    name: "", email: "", phone: "", location: "", linkedin: "", website: "", title: "",
    jobDescription: "", summaryHint: "",
    experiences: [{ id: 1, role: "", company: "", location: "", from: "", to: "", current: false, notes: "" }],
    education: [{ id: 1, degree: "", field: "", institution: "", year: "", grade: "" }],
    skills: "", certifications: "",
    projects: [{ id: 1, name: "", description: "", tech: "" }],
    achievements: "", languages: "", hobbies: "",
  };
  const [aiWizardStep, setAiWizardStep] = useState(0);
  const [aiWizardData, setAiWizardData] = useState({ name: "", email: "", phone: "", location: "", linkedin: "", website: "", title: "", jobDescription: "", summaryHint: "", experiences: [{ id: 1, role: "", company: "", location: "", from: "", to: "", current: false, notes: "" }], education: [{ id: 1, degree: "", field: "", institution: "", year: "", grade: "" }], skills: "", certifications: "", projects: [{ id: 1, name: "", description: "", tech: "" }], achievements: "", languages: "", hobbies: "" });
  const [aiBuilding, setAiBuilding] = useState(false);
  const [aiBuiltResume, setAiBuiltResume] = useState(null);
  const [aiWizardError, setAiWizardError] = useState("");
  const navItems = [
    { id: "home", icon: "⊞", label: "Home", href: "/dashboard" },
    { id: "jobs", icon: "🔍", label: "Find Job", href: "/find-job" },
    { id: "resume", icon: "📄", label: "Resume Builder", href: "/resume" },
    { id: "apply", icon: "📧", label: "One-Click Apply", href: "/apply" },
    { id: "tracker", icon: "📊", label: "Track Application", href: "/tracker" },
    { id: "interview", icon: "🎯", label: "Interview Prep", href: "/interview" },
    { id: "pricing", icon: "⚡", label: "Upgrade", href: "/pricing" },
  ];

  const sections = [
    { id: "personal", icon: "👤", label: "Personal" },
    { id: "summary", icon: "📝", label: "Summary" },
    { id: "experience", icon: "💼", label: "Experience" },
    { id: "education", icon: "🎓", label: "Education" },
    { id: "skills", icon: "⚡", label: "Skills" },
    { id: "projects", icon: "🚀", label: "Projects" },
    { id: "certs", icon: "📜", label: "Certifications" },
    { id: "achievements", icon: "🏆", label: "Achievements" },
    { id: "strengths", icon: "💪", label: "Strengths" },
    { id: "extras", icon: "🌟", label: "Extras" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      const saved = localStorage.getItem("jobwin_resumes");
      if (saved) setResumes(JSON.parse(saved));
    });
  }, []);

  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (activeView === "editor") saveCurrentResume(true);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [activeView, resume, resumeName]);

  useEffect(() => {
    if (activeView === "editor") {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        saveCurrentResume(false);
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }, 1500);
    }
    return () => clearTimeout(autoSaveTimer.current);
  }, [resume, resumeName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const saveCurrentResume = (showAlert = false) => {
    const id = activeResumeId || Date.now().toString();
    const data = { id, name: resumeName, resume, template: activeTemplate, updatedAt: new Date().toLocaleString() };
    const existing = JSON.parse(localStorage.getItem("jobwin_resumes") || "[]");
    const updated = existing.find(r => r.id === id) ? existing.map(r => r.id === id ? data : r) : [data, ...existing];
    localStorage.setItem("jobwin_resumes", JSON.stringify(updated));
    setResumes(updated);
    setActiveResumeId(id);
    if (showAlert) alert("✅ Resume saved!");
  };

  const createNewResume = () => {
    setResume({ ...EMPTY_RESUME, experience: [], education: [], projects: [], certifications: [], achievements: [] });
    setResumeName("New Resume");
    setActiveResumeId(null);
    setActiveTemplate("modernist");
    setActiveSection("personal");
    setActiveView("editor");
  };

  const previewSample = () => {
    setResume({ ...SAMPLE_RESUME });
    setResumeName("Sample Resume – Priya Sharma");
    setActiveResumeId(null);
    setActiveTemplate("modernist");
    setActiveSection("personal");
    setActiveView("editor");
  };

  const openResume = (r) => {
    setResume(r.resume);
    setResumeName(r.name);
    setActiveResumeId(r.id);
    setActiveTemplate(r.template || "modernist");
    setActiveView("editor");
  };

  const duplicateResume = (r) => {
    const copy = { ...r, id: Date.now().toString(), name: r.name + " (Copy)", updatedAt: new Date().toLocaleString() };
    const updated = [copy, ...resumes];
    localStorage.setItem("jobwin_resumes", JSON.stringify(updated));
    setResumes(updated);
  };

  // ── Delete handlers — use custom React modal, NOT window.confirm ──
  const deleteResume = (id, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setDeleteModal({ open: true, id, bulk: false, count: 1 });
  };

  const confirmDelete = () => {
    if (deleteModal.bulk) {
      const updated = resumes.filter(r => !selectedResumes.has(r.id));
      localStorage.setItem("jobwin_resumes", JSON.stringify(updated));
      setResumes(updated);
      setSelectedResumes(new Set());
      setIsSelectMode(false);
    } else {
      const updated = resumes.filter(r => r.id !== deleteModal.id);
      localStorage.setItem("jobwin_resumes", JSON.stringify(updated));
      setResumes(updated);
    }
    setDeleteModal({ open: false, id: null, bulk: false, count: 0 });
  };

  const updateResume = (key, value) => setResume(prev => ({ ...prev, [key]: value }));

  // Bulk Delete Handlers
  const toggleResumeSelection = (id) => {
    const newSelected = new Set(selectedResumes);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedResumes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedResumes.size === resumes.length && resumes.length > 0) {
      setSelectedResumes(new Set());
    } else {
      setSelectedResumes(new Set(resumes.map(r => r.id)));
    }
  };

  const handleBulkDelete = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (selectedResumes.size === 0) return;
    setDeleteModal({ open: true, id: null, bulk: true, count: selectedResumes.size });
  };

  // Experience handlers
  const addExp = () => setResume(prev => ({ ...prev, experience: [...prev.experience, { id: Date.now(), company: "", role: "", location: "", from: "", to: "", current: false, responsibilities: [""], bullets: [""] }] }));
  const removeExp = (id) => setResume(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  const updateExp = (id, key, val) => setResume(prev => ({ ...prev, experience: prev.experience.map(e => e.id === id ? { ...e, [key]: val } : e) }));
  const updateExpArr = (id, field, idx, val) => setResume(prev => ({ ...prev, experience: prev.experience.map(e => { if (e.id !== id) return e; const arr = [...(e[field] || [""])]; arr[idx] = val; return { ...e, [field]: arr }; }) }));

  // Education handlers
  const addEdu = () => setResume(prev => ({ ...prev, education: [...prev.education, { id: Date.now(), institution: "", degree: "", field: "", year: "", grade: "" }] }));
  const removeEdu = (id) => setResume(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  const updateEdu = (id, key, val) => setResume(prev => ({ ...prev, education: prev.education.map(e => e.id === id ? { ...e, [key]: val } : e) }));

  // Project handlers
  const addProject = () => setResume(prev => ({ ...prev, projects: [...(prev.projects || []), { id: Date.now(), name: "", description: "", tech: "", link: "" }] }));
  const removeProject = (id) => setResume(prev => ({ ...prev, projects: (prev.projects || []).filter(p => p.id !== id) }));
  const updateProject = (id, key, val) => setResume(prev => ({ ...prev, projects: (prev.projects || []).map(p => p.id === id ? { ...p, [key]: val } : p) }));

  // Cert/achievement handlers
  const addCert = () => setResume(prev => ({ ...prev, certifications: [...(prev.certifications || []), { id: Date.now(), name: "", issuer: "", year: "" }] }));
  const removeCert = (id) => setResume(prev => ({ ...prev, certifications: (prev.certifications || []).filter(c => c.id !== id) }));
  const updateCert = (id, key, val) => setResume(prev => ({ ...prev, certifications: (prev.certifications || []).map(c => c.id === id ? { ...c, [key]: val } : c) }));
  const addAchievement = () => setResume(prev => ({ ...prev, achievements: [...(prev.achievements || []), { id: Date.now(), text: "" }] }));
  const removeAchievement = (id) => setResume(prev => ({ ...prev, achievements: (prev.achievements || []).filter(a => a.id !== id) }));
  const updateAchievement = (id, val) => setResume(prev => ({ ...prev, achievements: (prev.achievements || []).map(a => a.id === id ? { ...a, text: val } : a) }));

  // Skill handlers (rated chips)
  const addSkill = () => setResume(prev => ({ ...prev, skills: [...(prev.skills || []), { id: Date.now(), name: "", rating: 3 }] }));
  const updateSkillName = (id, val) => setResume(prev => ({ ...prev, skills: (prev.skills || []).map(s => s.id === id ? { ...s, name: val } : s) }));
  const updateSkillRating = (id, val) => setResume(prev => ({ ...prev, skills: (prev.skills || []).map(s => s.id === id ? { ...s, rating: val } : s) }));
  const removeSkill = (id) => setResume(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s.id !== id) }));

  // Hobby handlers
  const addHobby = () => setResume(prev => ({ ...prev, hobbies: [...(prev.hobbies || []), { id: Date.now(), name: "", icon: "" }] }));
  const updateHobby = (id, key, val) => setResume(prev => ({ ...prev, hobbies: (prev.hobbies || []).map(h => h.id === id ? { ...h, [key]: val } : h) }));
  const removeHobby = (id) => setResume(prev => ({ ...prev, hobbies: (prev.hobbies || []).filter(h => h.id !== id) }));

  // Strength handlers
  const addStrength = () => setResume(prev => ({ ...prev, strengths: [...(prev.strengths || []), { id: Date.now(), text: "" }] }));
  const updateStrength = (id, val) => setResume(prev => ({ ...prev, strengths: (prev.strengths || []).map(s => s.id === id ? { ...s, text: val } : s) }));
  const removeStrength = (id) => setResume(prev => ({ ...prev, strengths: (prev.strengths || []).filter(s => s.id !== id) }));

  // Section layout (sidebar vs main) handler
  const updateSectionLayout = (section, placement) =>
    setResume(prev => ({ ...prev, sectionLayout: { ...(prev.sectionLayout || {}), [section]: placement } }));

  // ── Smart AI Improve Summary: if empty → open context panel; if filled → improve existing ──
  const improveSection = async (section, content) => {
    if (section === "summary" && !content?.trim()) {
      // No summary yet — open context panel to gather info before generating
      setShowSummaryCtx(true);
      return;
    }
    if (!content?.trim()) {
      alert("Please write some content first before using AI Improve.");
      return;
    }
    const apiUrl = getApiUrl();
    setImproving(prev => ({ ...prev, [section]: true }));
    try {
      const res = await fetch(`${apiUrl}/improve-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_type: section,
          content,
          job_title: resume.title || "Professional",
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.status === "error") throw new Error(data.error || "AI improvement failed");
      if (data.improved) {
        updateResume(section, data.improved);
        setImproving(prev => ({ ...prev, [`${section}_done`]: true }));
        setTimeout(() => setImproving(prev => ({ ...prev, [`${section}_done`]: false })), 2500);
      } else {
        throw new Error("No improvement returned from AI");
      }
    } catch (e) {
      console.error("AI Improve error:", e);
      alert(`⚠️ AI Improve failed: ${e.message}.\n\nMake sure the backend server is running at ${apiUrl}.`);
    }
    setImproving(prev => ({ ...prev, [section]: false }));
  };

  // ── Generate summary from context (called when summary is empty) ──
  const generateSummaryFromContext = async () => {
    setSummaryCtxLoading(true);
    const apiUrl = getApiUrl();
    try {
      const res = await fetch(`${apiUrl}/generate-summary-from-context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resume.name || "",
          job_title: resume.title || "",
          interests: summaryCtx.interests,
          job_description: summaryCtx.jobDescription,
          experience_summary: summaryCtx.experienceSummary,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.status === "error") throw new Error(data.error);
      updateResume("summary", data.summary);
      setShowSummaryCtx(false);
      setSummaryCtx({ interests: "", jobDescription: "", experienceSummary: "" });
    } catch (e) {
      alert(`⚠️ Summary generation failed: ${e.message}`);
    }
    setSummaryCtxLoading(false);
  };

  // ── Grammar & Spell Checker ──
  const runGrammarCheck = async () => {
    const apiUrl = getApiUrl();
    setGrammarLoading(true);
    try {
      const res = await fetch(`${apiUrl}/check-spelling-grammar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_json: JSON.stringify(resume) }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.status === "error") throw new Error(data.error);
      setGrammarResults(data.corrections || []);
      setGrammarIndex(0);
      setGrammarDone(false);
      setGrammarPanel(true);
    } catch (e) {
      alert(`⚠️ Grammar check failed: ${e.message}\n\nMake sure the backend is running.`);
    }
    setGrammarLoading(false);
  };

  const applyGrammarCorrection = (correction) => {
    const field = correction.field;
    if (field === "name" || field === "summary" || field === "title" || field === "languages" || field === "interests" || field === "other") {
      updateResume(field, correction.corrected);
    } else if (field.startsWith("experience_")) {
      const idx = parseInt(field.replace("experience_", ""));
      const exp = resume.experience?.[idx];
      if (exp) {
        // Rebuild responsibilities from corrected text
        const bullets = correction.corrected.split(" | ").filter(Boolean);
        const half = Math.ceil(bullets.length / 2);
        setResume(prev => ({
          ...prev,
          experience: prev.experience.map((e, i) => i === idx ? { ...e, responsibilities: bullets.slice(0, half), bullets: bullets.slice(half) } : e)
        }));
      }
    } else if (field.startsWith("project_")) {
      const idx = parseInt(field.replace("project_", ""));
      setResume(prev => ({
        ...prev,
        projects: prev.projects.map((p, i) => i === idx ? { ...p, description: correction.corrected } : p)
      }));
    }
  };

  const acceptGrammarChange = () => {
    applyGrammarCorrection(grammarResults[grammarIndex]);
    const next = grammarIndex + 1;
    if (next >= grammarResults.length) setGrammarDone(true);
    else setGrammarIndex(next);
  };

  const ignoreGrammarChange = () => {
    const next = grammarIndex + 1;
    if (next >= grammarResults.length) setGrammarDone(true);
    else setGrammarIndex(next);
  };

  const applyAllGrammarChanges = () => {
    grammarResults.forEach(c => applyGrammarCorrection(c));
    setGrammarPanel(false);
    setGrammarDone(false);
    setGrammarResults([]);
  };


  const checkAts = async () => {
    if (!jobDesc.trim() || jobDesc.trim().length < 30) {
      alert("Please paste a job description (at least 30 characters) to check ATS match.");
      return;
    }
    setAtsLoading(true);
    setAtsScore(null);
    try {
      const apiUrl = getApiUrl();
      // Use the resume builder endpoint — sends full structured resume JSON for accurate analysis
      const res = await fetch(`${apiUrl}/ats-score-from-resume-builder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_json: resume, job_description: jobDesc }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAtsScore(data);
    } catch (e) {
      setAtsScore({ error: e.message || "Could not connect to AI. Make sure the backend is running.", overall_score: 0 });
    }
    setAtsLoading(false);
  };

  // ── AI BUILDER LOGIC ──────────────────────────────────
  const startAiBuilder = () => {
    // Launch 4-step wizard instead of old chat-based flow
    setAiWizardStep(0);
    setAiBuiltResume(null);
    setAiWizardError("");
    setAiWizardData({ name: "", email: "", phone: "", location: "", linkedin: "", website: "", title: "", jobDescription: "", summaryHint: "", experiences: [{ id: Date.now(), role: "", company: "", location: "", from: "", to: "", current: false, notes: "" }], education: [{ id: Date.now()+1, degree: "", field: "", institution: "", year: "", grade: "" }], skills: "", certifications: "", projects: [{ id: Date.now()+2, name: "", description: "", tech: "" }], achievements: "", languages: "", hobbies: "" });
    setActiveView("ai-builder");
  };

  const processAiAnswer = (step, answer) => {
    const flow = AI_FLOW[step];
    const lower = answer.toLowerCase().trim();
    const isSkip = lower === "skip" || lower === "none" || lower === "no" || lower === "n/a";

    if (flow.field === "personal_intro") {
      const commaIdx = answer.indexOf(",");
      if (commaIdx > -1) {
        setResume(prev => ({ ...prev, name: answer.substring(0, commaIdx).trim(), title: answer.substring(commaIdx + 1).trim() }));
      } else {
        setResume(prev => ({ ...prev, name: answer.trim() }));
      }
    } else if (flow.field === "contact") {
      const parts = answer.split(",").map(p => p.trim());
      setResume(prev => ({ ...prev, email: parts[0] || "", phone: parts[1] || "", location: parts[2] || "" }));
    } else if (flow.field === "dob_address") {
      if (!isSkip) {
        const commaIdx = answer.indexOf(",");
        if (commaIdx > -1) {
          setResume(prev => ({ ...prev, dob: answer.substring(0, commaIdx).trim(), address: answer.substring(commaIdx + 1).trim() }));
        } else {
          setResume(prev => ({ ...prev, dob: answer.trim() }));
        }
      }
    } else if (flow.field === "summary") {
      setResume(prev => ({ ...prev, summary: answer }));
    } else if (flow.field === "experience_new" || flow.field === "experience_more") {
      if (!isSkip && lower !== "done") {
        // Handle case where user provided multiple jobs in one block "Then at Amazon..."
        const expBlocks = answer.split(/(?:\.|\n|\b)(?=\s*(?:Then|Currently|After that|Next|Later|Also|And then)\b)/ig).map(s => s.trim().replace(/^\./, "").trim()).filter(Boolean);
        
        const newExps = expBlocks.map((expStr, idx) => {
          const newExp = { id: Date.now() + idx, company: "", role: "", location: "", from: "", to: "", current: expStr.toLowerCase().includes("present") || expStr.toLowerCase().includes("current") || expStr.toLowerCase().includes("since"), responsibilities: [], bullets: [], raw: expStr };
          const lines = expStr.split("\n").filter(Boolean);
          lines.forEach(line => {
            const l = line.toLowerCase();
            if (l.includes("company:") || l.includes("organisation:") || l.includes("organization:")) newExp.company = line.split(":")[1]?.trim() || "";
            else if (l.includes("role:") || l.includes("title:") || l.includes("position:")) newExp.role = line.split(":")[1]?.trim() || "";
            else if (l.includes("location:") || l.includes("place:")) newExp.location = line.split(":")[1]?.trim() || "";
            else if (l.includes("duration:") || l.includes("period:") || l.includes("from:") || l.includes("jan") || l.includes("feb") || l.includes("20")) { newExp.from = line.split(":")[1]?.trim() || line.trim(); }
            else if (l.includes("responsibilit")) newExp.responsibilities.push(line.replace(/^[•\-*]\s*responsibilit[a-z]*:?\s*/i, "").trim());
            else if (l.includes("achievement") || l.includes("accomplish")) newExp.bullets.push(line.replace(/^[•\-*]\s*achievement[s]?:?\s*/i, "").trim());
            else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
              const clean = line.replace(/^[•\-*]\s*/, "").trim();
              if (clean) newExp.responsibilities.push(clean);
            }
          });
          if (newExp.responsibilities.length === 0 && newExp.bullets.length === 0) {
            newExp.responsibilities = [expStr];
          }
          
          if (!newExp.company) {
            const atMatch = expStr.match(/at\s+([A-Z][a-zA-Z0-9]*)/);
            newExp.company = atMatch ? atMatch[1] : (lines[0] || "Company");
          }
          if (!newExp.role) {
            const asMatch = expStr.match(/as\s+([A-Z][a-zA-Z0-9\s]+?)\s+(?:from|since|in|at|for|\.)/i);
            newExp.role = asMatch ? asMatch[1].trim() : (lines[1] || resume.title || "Role");
          }
          
          return newExp;
        });

        setResume(prev => ({ ...prev, experience: [...prev.experience, ...newExps] }));
        setExpCount(prev => prev + newExps.length);
      }
    } else if (flow.field === "education") {
      const parts = answer.split(",").map(p => p.trim());
      const newEdu = { id: Date.now(), degree: parts[0] || "", institution: parts[1] || "", year: parts[2] || "", grade: parts[3] || "", field: "" };
      setResume(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    } else if (flow.field === "skills") {
      setResume(prev => ({ ...prev, skills: answer.split(",").map((s, i) => ({ id: Date.now() + i, name: s.trim(), rating: 3 })).filter(s => s.name) }));
    } else if (flow.field === "projects") {
      if (!isSkip) {
        const lines = answer.split("\n").filter(Boolean);
        const proj = { id: Date.now(), name: lines[0] || "Project", description: lines.slice(1).join(" ") || answer, tech: "", link: "" };
        setResume(prev => ({ ...prev, projects: [...(prev.projects || []), proj] }));
      }
    } else if (flow.field === "certifications") {
      if (!isSkip) {
        const certs = answer.split("\n").filter(Boolean).map(c => ({ id: Date.now() + Math.random(), name: c.replace(/^[•\-*]\s*/, "").trim(), issuer: "", year: "" }));
        setResume(prev => ({ ...prev, certifications: [...(prev.certifications || []), ...certs] }));
      }
    } else if (flow.field === "achievements") {
      if (!isSkip) {
        const achs = answer.split("\n").filter(Boolean).map(a => ({ id: Date.now() + Math.random(), text: a.replace(/^[•\-*]\s*/, "").trim() }));
        setResume(prev => ({ ...prev, achievements: [...(prev.achievements || []), ...achs] }));
      }
    } else if (flow.field === "extras") {
      if (!isSkip) {
        setResume(prev => ({ ...prev, languages: answer.includes("Language") ? answer : prev.languages, interests: answer.includes("Interest") ? answer : prev.interests, other: answer }));
      }
    }
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const currentStep = aiStep;
    const answer = aiInput.trim();
    const lower = answer.toLowerCase();

    const userMsg = { role: "user", text: answer };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput("");
    setAiLoading(true);

    // Process the answer
    processAiAnswer(currentStep, answer);

    // Determine next step
    const currentFlow = AI_FLOW[currentStep];
    let nextStep = currentStep + 1;

    // Special handling for "more experience" step
    if (currentFlow.field === "experience_more") {
      if (lower === "done" || lower.includes("done") || lower.includes("no more") || lower.includes("next")) {
        nextStep = AI_FLOW.findIndex(f => f.field === "education");
      } else {
        // Stay on experience_more step
        nextStep = currentStep;
        setTimeout(() => {
          setAiMessages(prev => [...prev, { role: "ai", text: `✅ Added! Do you have more work experience to add? Type details or type **'done'** to continue.` }]);
          setAiLoading(false);
        }, 500);
        return;
      }
    }

    // After first experience, ask if more
    if (currentFlow.field === "experience_new") {
      nextStep = AI_FLOW.findIndex(f => f.field === "experience_more");
    }

    if (nextStep >= AI_FLOW.length) {
      // All done — move to review step
      setAiDone(true);
      setAiReviewStep("review");
      setAiMessages(prev => [...prev, { role: "ai", text: "🎉 **All done!** Let me show you what I've collected before we build your resume..." }]);
      setAiLoading(false);
      return;
    }

    setTimeout(() => {
      setAiStep(nextStep);
      setAiMessages(prev => [...prev, { role: "ai", text: "✅ Got it!\n\n" + AI_FLOW[nextStep].q }]);
      setAiLoading(false);
    }, 600);
  };

  const viewBuiltResume = (name) => {
    setResumeName(name || resume.name || "AI Built Resume");
    setActiveView("editor");
    saveCurrentResume(false);
    setAiReviewStep("chat");
    setAiDone(false);
  };

  const runAiSpellCheck = async () => {
    setAiSpellLoading(true);
    const apiUrl = getApiUrl();
    try {
      const res = await fetch(`${apiUrl}/check-spelling-grammar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_json: JSON.stringify(resume) }),
      });
      const data = await res.json();
      setAiSpellResults(data.corrections || []);
      setAiReviewStep("spellcheck");
    } catch {
      setAiSpellResults([]);
      setAiReviewStep("spellcheck");
    }
    setAiSpellLoading(false);
  };

  // ── AI Wizard: form data updaters ───────────────────────────────────
  const updateWizard = (key, val) => setAiWizardData(prev => ({ ...prev, [key]: val }));
  const updateWizardExp = (i, key, val) => setAiWizardData(prev => { const a = [...prev.experiences]; a[i] = { ...a[i], [key]: val }; return { ...prev, experiences: a }; });
  const addWizardExp = () => setAiWizardData(prev => ({ ...prev, experiences: [...prev.experiences, { id: Date.now(), role: "", company: "", location: "", from: "", to: "", current: false, notes: "" }] }));
  const removeWizardExp = (i) => setAiWizardData(prev => ({ ...prev, experiences: prev.experiences.filter((_, idx) => idx !== i) }));
  const updateWizardEdu = (i, key, val) => setAiWizardData(prev => { const a = [...prev.education]; a[i] = { ...a[i], [key]: val }; return { ...prev, education: a }; });
  const addWizardEdu = () => setAiWizardData(prev => ({ ...prev, education: [...prev.education, { id: Date.now(), degree: "", field: "", institution: "", year: "", grade: "" }] }));
  const removeWizardEdu = (i) => setAiWizardData(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
  const updateWizardProject = (i, key, val) => setAiWizardData(prev => { const a = [...prev.projects]; a[i] = { ...a[i], [key]: val }; return { ...prev, projects: a }; });
  const addWizardProject = () => setAiWizardData(prev => ({ ...prev, projects: [...prev.projects, { id: Date.now(), name: "", description: "", tech: "" }] }));
  const removeWizardProject = (i) => setAiWizardData(prev => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }));

  // ── AI Wizard: call backend to build resume ─────────────────────────────
  const buildResumeWithAI = async () => {
    setAiBuilding(true);
    setAiWizardError("");
    setAiWizardStep(3); // loading step
    try {
      const apiUrl = getApiUrl();
      const body = {
        name: aiWizardData.name, email: aiWizardData.email, phone: aiWizardData.phone,
        location: aiWizardData.location, linkedin: aiWizardData.linkedin,
        website: aiWizardData.website, title: aiWizardData.title,
        job_description: aiWizardData.jobDescription, summary_hint: aiWizardData.summaryHint,
        experience_raw: aiWizardData.experiences.filter(e => e.role.trim() || e.company.trim()),
        education_raw: aiWizardData.education.filter(e => e.degree.trim() || e.institution.trim()),
        skills_raw: aiWizardData.skills, certifications_raw: aiWizardData.certifications,
        projects_raw: aiWizardData.projects.filter(p => p.name.trim()),
        achievements_raw: aiWizardData.achievements,
        languages: aiWizardData.languages, hobbies: aiWizardData.hobbies,
      };
      const resp = await fetch(`${apiUrl}/build-resume-from-ai`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({})); throw new Error(err.detail || `Server error ${resp.status}. Is the backend running?`); }
      const data = await resp.json();
      if (data.resume) { setAiBuiltResume(data.resume); setAiWizardStep(4); }
      else throw new Error(data.detail || "AI did not return resume data.");
    } catch (err) {
      setAiWizardError(err.message || "Failed to connect to AI.");
      setAiWizardStep(2);
    } finally { setAiBuilding(false); }
  };

  // ── AI Wizard: confirm and open built resume in editor ─────────────────────
  const confirmAiBuiltResume = () => {
    if (!aiBuiltResume) return;
    const newId = Date.now().toString();
    // Normalize AI output → safe structured resume the editor can handle
    const normalized = normalizeAIResume(aiBuiltResume);
    const builtResume = { ...EMPTY_RESUME, ...normalized };
    const entryName = `${builtResume.name || "AI"}'s Resume`;
    const entry = { id: newId, name: entryName, resume: builtResume, template: "modernist", updatedAt: new Date().toLocaleString() };
    const existing = JSON.parse(localStorage.getItem("jobwin_resumes") || "[]");
    const updated = [entry, ...existing];
    localStorage.setItem("jobwin_resumes", JSON.stringify(updated));
    setResumes(updated);
    setActiveResumeId(newId);
    setResume(builtResume);
    setResumeName(entryName);
    setActiveTemplate("modernist");
    setActiveView("editor");
  };

  const handleTheme = (name) => setTheme(name);
  const handleNav = (item) => router.push(item.href);
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };
  const [pdfLoading, setPdfLoading] = useState(false);
  const [uploadParsing, setUploadParsing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ stage: "", status: "", progress: 0 });
  const [uploadError, setUploadError] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [uploadJobDesc, setUploadJobDesc] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [openEmojiPickerId, setOpenEmojiPickerId] = useState(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const uploadInputRef = useRef(null);

  const uploadResumeFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadError("");
    setUploadParsing(true);
    setImportSuccess(false);
    setUploadProgress({ stage: "", status: "", progress: 0 });
    
    try {
      const parsed = await processResumeFile(file, (progress) => {
        setUploadProgress(progress);
      }, uploadJobDesc);
      
      // Show preview modal before importing
      setImportPreview(parsed);
    } catch (err) {
      console.error("Resume parsing failed:", err);
      setUploadError(err.message || "Failed to parse the resume. Please try another file.");
    } finally {
      setUploadParsing(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    
    const { _importMetadata, _captureSummary, ...resumeData } = importPreview;
    
    // Ensure all required fields are populated from parsed data
    const completeResume = {
      name: resumeData.name || "",
      email: resumeData.email || "",
      phone: resumeData.phone || "",
      location: resumeData.location || "",
      title: resumeData.title || "",
      linkedin: resumeData.linkedin || "",
      website: resumeData.website || "",
      photo: resumeData.photo || "",
      dob: resumeData.dob || "",
      address: resumeData.address || "",
      summary: resumeData.summary || "",
      experience: resumeData.experience || [],
      education: resumeData.education || [],
      skills: resumeData.skills || [],
      projects: resumeData.projects || [],
      certifications: resumeData.certifications || [],
      achievements: resumeData.achievements || [],
      languages: resumeData.languages || "",
      interests: resumeData.interests || "",
      other: resumeData.other || "",
      hobbies: resumeData.hobbies || [],
      strengths: resumeData.strengths || [],
      sectionLayout: resumeData.sectionLayout || {},
    };
    
    setResume(completeResume);
    setResumeName(resumeData.name || importPreview._importMetadata?.importedFrom?.replace(/\.[^.]+$/, "") || "Imported Resume");
    setActiveResumeId(null);
    setActiveTemplate("modernist");
    setActiveSection("personal");
    setActiveView("editor");
    setImportPreview(null);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 4000);
  };

  const dismissImport = () => {
    setImportPreview(null);
    setUploadError("");
  };

  const exportPDF = async () => {
    const el = document.getElementById("resume-preview");
    if (!el) {
      alert("Resume preview not found — make sure the Live Preview is visible and a template is selected.");
      return;
    }
    setPdfLoading(true);
    let container = null;
    try {
      // Dynamically import both libraries
      const [html2canvasMod, jsPDFMod] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasMod.default || html2canvasMod;
      const jsPDF = jsPDFMod.jsPDF || jsPDFMod.default?.jsPDF || jsPDFMod.default;

      const personName = (resume.name || "").replace(/\s+/g, "_") || (resumeName || "").replace(/\s+/g, "_") || "Resume";
      const filename = `Resume_${personName}.pdf`;

      // Detect background color from the element
      const computedBg = window.getComputedStyle(el).backgroundColor;
      const bgColor = (computedBg && computedBg !== "rgba(0, 0, 0, 0)" && computedBg !== "transparent")
        ? computedBg : "#ffffff";

      // Build off-screen container — must be in the DOM for html2canvas to measure correctly
      container = document.createElement("div");
      container.style.cssText = [
        "position:fixed",
        "top:-99999px",
        "left:-99999px",
        "width:794px",
        "height:auto",
        "overflow:visible",
        "z-index:-9999",
        "background:" + bgColor,
      ].join(";");

      const clone = el.cloneNode(true);
      // Remove #resume-preview id so the CSS min-height rule doesn't force extra blank space
      clone.id = "resume-pdf-export";
      clone.style.transform = "none";
      clone.style.boxShadow = "none";
      clone.style.borderRadius = "0";
      clone.style.position = "relative";
      clone.style.margin = "0";
      clone.style.width = "794px";
      clone.style.minWidth = "794px";
      clone.style.maxWidth = "794px";
      // Let content dictate height — no forced min-height so no blank second page for short resumes
      clone.style.minHeight = "1123px";
      clone.style.height = "auto";
      clone.style.overflow = "visible";

      // Ensure flex-children in two-column layouts fill full height
      Array.from(clone.children).forEach(child => {
        if (child.style && (child.style.flexShrink === "0" || child.style.width)) {
          child.style.minHeight = "1123px";
          child.style.alignSelf = "stretch";
        }
      });

      container.appendChild(clone);
      document.body.appendChild(container);

      // Wait for layout reflow + font rendering
      await new Promise(r => setTimeout(r, 900));

      // ── Canvas-slice approach: capture entire resume as ONE tall canvas ──
      // Then slice it into A4 pages. This way every page retains full template
      // background, sidebar colours, margins — NO blank/unstyled continuation pages.
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: bgColor,
        width: 794,
        windowWidth: 794,
        imageTimeout: 0,
      });

      // A4 dimensions at 72dpi in jsPDF default unit (mm)
      const A4_W_MM = 210;
      const A4_H_MM = 297;

      // Scale factor: canvas px → mm on A4 width
      const pxToMm = A4_W_MM / canvas.width;
      const totalHeightMm = canvas.height * pxToMm;
      const totalPages = Math.ceil(totalHeightMm / A4_H_MM);

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // Source slice in canvas pixels
        const srcY   = Math.round((page * A4_H_MM) / pxToMm);
        const srcH   = Math.round(Math.min(A4_H_MM / pxToMm, canvas.height - srcY));
        if (srcH <= 0) break;

        // Draw the slice onto a temp canvas
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width  = canvas.width;
        pageCanvas.height = srcH;
        const ctx = pageCanvas.getContext("2d");

        // Fill page background (important for dark/coloured templates)
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.97);
        const sliceHeightMm = srcH * pxToMm;
        pdf.addImage(imgData, "JPEG", 0, 0, A4_W_MM, sliceHeightMm);
      }

      // Download
      pdf.save(filename);

    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF download failed: " + (err.message || "Unknown error") + "\n\nTip: Make sure the live preview is fully loaded.");
    } finally {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setPdfLoading(false);
    }
  };


  const exportWord = () => {
    const el = document.getElementById("resume-preview");
    if (!el) { alert("Resume preview not found — make sure a template is selected and the live preview is visible."); return; }
    const personName = (resume.name || "").replace(/\s+/g, "_") || (resumeName || "").replace(/\s+/g, "_") || "Resume";
    const filename = `Resume_${personName}.doc`;
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${resume.name || "Resume"}</title><style>body{font-family:Arial,sans-serif;font-size:10pt;} table{border-collapse:collapse;} p{margin:2pt 0;}</style></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
  };

  const template = TEMPLATES.find(tmpl => tmpl.id === activeTemplate);
  const firstName = user?.email?.split("@")[0] || "";
  const initials = firstName.slice(0, 2).toUpperCase();
  const inpStyle = { width: "100%", padding: "9px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "12px", color: t.text, outline: "none", fontFamily: "'DM Sans',sans-serif" };

  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans',Arial,sans-serif", transition: "all 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.3); border-radius:4px; }
        .nav-item:hover { background:rgba(108,99,255,0.1) !important; }
        .resume-card:hover { transform:translateY(-4px) !important; border-color:rgba(108,99,255,0.3) !important; }
        .template-card:hover { transform:translateY(-6px) !important; border-color:rgba(108,99,255,0.5) !important; }
        .action-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(108,99,255,0.35) !important; }
        .theme-btn:hover { background:rgba(108,99,255,0.2) !important; }
        .section-btn:hover { background:rgba(108,99,255,0.08) !important; }
        input::placeholder, textarea::placeholder { color:${t.muted}; }
        input, textarea, select { color:${t.text}; }
        select option { background:#1a1a2e; color:white; }

        /* ── A4 Resume Preview (enforced dimensions for pixel-perfect PDF export) ── */
        #resume-preview {
          width: 794px !important;
          min-width: 794px !important;
          max-width: 794px !important;
          min-height: 1123px !important;
          max-height: none !important;
          box-sizing: border-box !important;
          overflow: visible;
          position: relative;
        }
        /* ── Fix 5: Hide scrollbar on section tabs (all 10 tabs always reachable) ── */
        .section-tabs-bar::-webkit-scrollbar { display: none; }
        .section-tabs-bar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Ensure sidebar columns in flex/grid templates fill full A4 height */
        #resume-preview > div[style*="flex-shrink: 0"],
        #resume-preview > div[style*="flexShrink: 0"] {
          align-self: stretch;
          min-height: 1123px;
        }
        /* Also cover grid-based two-column layouts (col 1 / col 2) */
        #resume-preview > div:first-child,
        #resume-preview > div:last-child {
          min-height: inherit;
        }
        /* Page-break control for multi-section resumes */
        .exp-item  { page-break-inside: avoid; break-inside: avoid; }
        .edu-item  { page-break-inside: avoid; break-inside: avoid; }
        .page-break-before { page-break-before: always; break-before: page; }
        .page-break-after  { page-break-after: always;  break-after: page; }

        @media (min-width: 900px) {
          .desktop-split { flex-direction: row !important; align-items: flex-start; }
          .desktop-split > div:first-child { flex: 1; min-width: 0; }
          .desktop-split > div:last-child { flex: 1; position: sticky; top: 70px; min-width: 0; }
          .mobile-grid-4 { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important; }
        }
        @media (max-width: 899px) {
          .desktop-split { flex-direction: column !important; }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          @page { size: A4 portrait; margin: 0; }
          #resume-preview {
            box-shadow: none !important;
            border-radius: 0 !important;
            transform: none !important;
            width: 794px !important;
            min-height: 1123px !important;
          }
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className="no-print">
        <Sidebar activeId="resume" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      </div>

      {/* MAIN */}
      <main className="no-print mobile-main" style={{ flex: 1, marginLeft: collapsed ? "72px" : "240px", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column", background: t.bg }}>
        <header style={{ height: "56px", background: t.sidebar, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => setActiveView("dashboard")} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.muted, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
              {activeView === "dashboard" ? "← Dashboard" : "← My Resumes"}
            </button>
            {activeView === "editor" && <input value={resumeName} onChange={e => setResumeName(e.target.value)} style={{ background: "transparent", border: "none", color: t.text, fontSize: "13px", fontWeight: "500", outline: "none", width: "180px" }} />}
          </div>
          {activeView === "editor" && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {autoSaved && <span style={{ color: "#43D9A2", fontSize: "11px" }}>✓ Auto-saved</span>}
              <button onClick={() => setShowAts(!showAts)} style={{ padding: "6px 14px", background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>📊 ATS</button>
              <button onClick={runGrammarCheck} disabled={grammarLoading} style={{ padding: "6px 14px", background: grammarLoading ? t.card : "rgba(67,217,162,0.1)", color: grammarLoading ? t.muted : "#43D9A2", border: "1px solid rgba(67,217,162,0.3)", borderRadius: "8px", fontSize: "12px", cursor: grammarLoading ? "not-allowed" : "pointer", fontWeight: "600", transition: "all 0.2s" }}>{grammarLoading ? "⏳ Checking..." : "🔤 Check Grammar"}</button>
              <button onClick={() => saveCurrentResume(true)} style={{ padding: "6px 14px", background: t.card, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>💾 Save</button>
              {/* Download split button */}
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "none" }}>
                  <button className="action-btn" onClick={exportPDF} disabled={pdfLoading} style={{ padding: "6px 14px", background: pdfLoading ? "#555" : "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", fontSize: "12px", fontWeight: "600", cursor: pdfLoading ? "not-allowed" : "pointer", transition: "all 0.3s", borderRadius: "8px 0 0 8px" }}>{pdfLoading ? "⏳ Generating..." : "📥 PDF"}</button>
                  <button onClick={() => setShowDownloadMenu(v => !v)} style={{ padding: "6px 10px", background: "linear-gradient(135deg,#5a53d4,#d95471)", color: "white", border: "none", borderLeft: "1px solid rgba(255,255,255,0.2)", fontSize: "12px", cursor: "pointer", borderRadius: "0 8px 8px 0" }}>▾</button>
                </div>
                {showDownloadMenu && (
                  <div style={{ position: "absolute", top: "38px", right: 0, zIndex: 300, background: t.sidebar, border: `1px solid ${t.border}`, borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", minWidth: "180px", overflow: "hidden" }}>
                    <button onClick={() => { exportPDF(); setShowDownloadMenu(false); }} style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", color: t.text, fontSize: "12px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "8px" }}>📄 <span><strong>PDF</strong> <span style={{ color: t.muted, fontSize: "10px" }}>— Best quality</span></span></button>
                    <div style={{ height: "1px", background: t.border }} />
                    <button onClick={() => { exportWord(); setShowDownloadMenu(false); }} style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", color: t.text, fontSize: "12px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "8px" }}>📝 <span><strong>Word (.doc)</strong> <span style={{ color: t.muted, fontSize: "10px" }}>— Editable</span></span></button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <div style={{ padding: "24px 28px", flex: 1, overflowY: "visible", background: t.bg }}>

          {/* ── DASHBOARD ── */}
          {activeView === "dashboard" && (
            <div style={{ maxWidth: "960px", margin: "0 auto" }}>
              <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "28px" }}>✨</div>
                  <p style={{ color: t.accent, fontSize: "12px", fontWeight: "700", letterSpacing: "2.5px", textTransform: "uppercase", margin: 0 }}>Professional Resume Crafting</p>
                </div>
                <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(26px,4vw,44px)", fontWeight: "700", color: t.text, marginBottom: "8px", margin: "0 0 8px 0" }}>Craft Your <span style={{ background: "linear-gradient(135deg, #6C63FF, #FF6584)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Legacy</span></h1>
                <p style={{ color: t.muted, fontSize: "15px", lineHeight: "1.7", margin: 0 }}>Build stunning, ATS-optimized resumes with AI-powered assistance. No limits, no restrictions—just pure professional excellence.</p>
              </div>

              {/* Find Job Button */}
              <div style={{ marginBottom: "32px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <button onClick={() => router.push("/find-job")} className="action-btn"
                  style={{ padding: "16px 32px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 6px 24px rgba(108,99,255,0.35)", display: "flex", alignItems: "center", gap: "10px" }}>
                  🔍 Find Job Opportunities
                </button>
                <button onClick={() => setActiveView("ats-optimizer")} style={{ padding: "16px 32px", background: "rgba(108,99,255,0.1)", border: `2px solid ${t.accent}`, color: t.accent, borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", gap: "10px" }}>
                  📊 ATS Optimizer
                </button>
              </div>

              <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px", alignItems: "stretch" }}>
                {/* Upload Resume Card */}
                <div onClick={() => !uploadParsing && uploadInputRef.current?.click()} style={{ background: uploadParsing ? `linear-gradient(135deg,rgba(108,99,255,0.15),rgba(108,99,255,0.05))` : "linear-gradient(135deg,rgba(255,179,71,0.15),rgba(255,179,71,0.05))", border: uploadParsing ? `2px solid rgba(108,99,255,0.4)` : "2px solid rgba(255,179,71,0.4)", borderRadius: "18px", padding: "48px 36px", cursor: uploadParsing ? "wait" : "pointer", transition: "all 0.3s", position: "relative", boxShadow: uploadParsing ? "0 4px 20px rgba(108,99,255,0.08)" : "0 4px 20px rgba(255,179,71,0.08)" }}
                  onMouseOver={e => !uploadParsing && (e.currentTarget.style.transform = "translateY(-6px)")}
                  onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <input ref={uploadInputRef} type="file" accept=".pdf,.docx,.doc" onChange={uploadResumeFile} style={{ display: "none" }} />
                  <div style={{ fontSize: "56px", marginBottom: "18px" }}>{uploadParsing ? "⏳" : "📤"}</div>
                  <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "700", color: uploadParsing ? "#A29BFE" : "#FFB347", marginBottom: "12px", margin: "0 0 12px 0" }}>{uploadParsing ? `${uploadProgress.stage || "Parsing"}...` : "Import Resume"}</h3>
                  <p style={{ color: t.muted, fontSize: "14px", lineHeight: "1.7", marginBottom: "16px", margin: "0 0 16px 0" }}>
                    {uploadParsing 
                      ? uploadProgress.status || "Processing your resume..." 
                      : "Upload an existing resume and let AI extract all your details instantly."}
                  </p>
                  {uploadParsing && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ background: t.inputBg, height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
                        <div style={{ background: "linear-gradient(90deg, #6C63FF, #FF6584)", height: "100%", width: `${uploadProgress.progress}%`, transition: "width 0.3s" }} />
                      </div>
                      <p style={{ fontSize: "11px", color: t.muted, margin: 0, textAlign: "center" }}>{uploadProgress.progress}% — {uploadProgress.stage}</p>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {(uploadParsing ? ["Processing", "AI Powered", "Auto-Parse"] : ["PDF", "Word", "Auto-Parse", "1 Click"]).map(tag => (
                      <span key={tag} style={{ background: uploadParsing ? "rgba(108,99,255,0.2)" : "rgba(255,179,71,0.2)", color: uploadParsing ? "#A29BFE" : "#FFB347", padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", border: uploadParsing ? "1px solid rgba(108,99,255,0.3)" : "1px solid rgba(255,179,71,0.3)" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div onClick={startAiBuilder} style={{ background: "linear-gradient(135deg,rgba(108,99,255,0.15),rgba(108,99,255,0.05))", border: "2px solid rgba(108,99,255,0.4)", borderRadius: "18px", padding: "48px 36px", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 20px rgba(108,99,255,0.08)" }}
                  onMouseOver={e => e.currentTarget.style.transform = "translateY(-6px)"}
                  onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: "56px", marginBottom: "18px" }}>🤖</div>
                  <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "700", color: "#A29BFE", marginBottom: "12px", margin: "0 0 12px 0" }}>AI Resume Builder</h3>
                  <p style={{ color: t.muted, fontSize: "14px", lineHeight: "1.7", marginBottom: "16px", margin: "0 0 16px 0" }}>Answer guided questions and let Claude AI build your complete resume with optimized content.</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["Guided Questions", "Claude AI", "Optimized", "Fast"].map(tag => (
                      <span key={tag} style={{ background: "rgba(108,99,255,0.2)", color: "#A29BFE", padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div onClick={createNewResume} style={{ background: "linear-gradient(135deg,rgba(108,99,255,0.08),rgba(255,101,132,0.05))", border: `2px solid ${t.accent}40`, borderRadius: "18px", padding: "48px 36px", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 20px rgba(108,99,255,0.08)" }}
                  onMouseOver={e => e.currentTarget.style.transform = "translateY(-6px)"}
                  onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: "56px", marginBottom: "18px" }}>✏️</div>
                  <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "700", color: t.text, marginBottom: "12px", margin: "0 0 12px 0" }}>Manual Editor</h3>
                  <p style={{ color: t.muted, fontSize: "14px", lineHeight: "1.7", marginBottom: "16px", margin: "0 0 16px 0" }}>Full control over every section with real-time preview and AI-powered suggestions.</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["Full Control", "Live Preview", "AI Tips", "Advanced"].map(tag => (
                      <span key={tag} style={{ background: t.inputBg, color: t.muted, padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", border: `1px solid ${t.border}` }}>{tag}</span>
                    ))}
                  </div>
                </div>
                {/* Preview Sample Card */}
                <div onClick={previewSample} style={{ background: "linear-gradient(135deg,rgba(67,217,162,0.15),rgba(67,217,162,0.05))", border: "2px solid rgba(67,217,162,0.4)", borderRadius: "18px", padding: "48px 36px", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 20px rgba(67,217,162,0.08)" }}
                  onMouseOver={e => e.currentTarget.style.transform = "translateY(-6px)"}
                  onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: "56px", marginBottom: "18px" }}>👁️</div>
                  <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "700", color: "#43D9A2", marginBottom: "12px", margin: "0 0 12px 0" }}>Template Showcase</h3>
                  <p style={{ color: t.muted, fontSize: "14px", lineHeight: "1.7", marginBottom: "16px", margin: "0 0 16px 0" }}>Preview all 25 premium templates with sample data. See exactly how your resume will look.</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["25 Templates", "Sample Data", "Live Preview", "100% Free"].map(tag => (
                      <span key={tag} style={{ background: "rgba(67,217,162,0.2)", color: "#43D9A2", padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", border: "1px solid rgba(67,217,162,0.3)" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {resumes.length > 0 && (
                <div style={{ marginTop: "40px", paddingTop: "40px", borderTop: `2px solid ${t.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                      <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "700", color: t.text, marginBottom: "2px", margin: "0 0 2px 0" }}>Your Resumes</h2>
                      <p style={{ color: t.muted, fontSize: "13px", margin: 0 }}>You have <strong style={{ color: t.accent }}>{resumes.length}</strong> saved resume{resumes.length !== 1 ? "s" : ""}</p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {isSelectMode ? (
                        <>
                          <button onClick={toggleSelectAll} style={{ padding: "6px 14px", background: t.card, color: t.text, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                            {selectedResumes.size === resumes.length ? "Deselect All" : "Select All"}
                          </button>
                          <button onClick={(e) => handleBulkDelete(e)} disabled={selectedResumes.size === 0} style={{ padding: "6px 14px", background: selectedResumes.size === 0 ? t.border : "rgba(255,101,132,0.1)", color: selectedResumes.size === 0 ? t.muted : "#FF6584", border: `1px solid ${selectedResumes.size === 0 ? "transparent" : "rgba(255,101,132,0.2)"}`, borderRadius: "8px", fontSize: "12px", cursor: selectedResumes.size === 0 ? "not-allowed" : "pointer", fontWeight: "600" }}>
                            🗑️ Delete Selected ({selectedResumes.size})
                          </button>
                          <button onClick={() => { setIsSelectMode(false); setSelectedResumes(new Set()); }} style={{ padding: "6px 14px", background: "none", color: t.muted, border: "none", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setIsSelectMode(true)} style={{ padding: "6px 14px", background: t.card, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>⚙️ Manage</button>
                      )}
                    </div>
                  </div>
                  <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
                    {resumes.map(r => (
                      <div key={r.id} className="resume-card" style={{ background: t.card, border: `1px solid ${selectedResumes.has(r.id) ? t.accent : t.border}`, borderRadius: "14px", overflow: "hidden", transition: "all 0.3s", position: "relative", transform: selectedResumes.has(r.id) ? "scale(1.02)" : "none", boxShadow: selectedResumes.has(r.id) ? `0 0 0 2px ${t.accent}` : "none" }}>
                        {isSelectMode && (
                          <div onClick={() => toggleResumeSelection(r.id)} style={{ position: "absolute", top: "12px", left: "12px", zIndex: 10, width: "24px", height: "24px", background: selectedResumes.has(r.id) ? t.accent : "rgba(255,255,255,0.8)", border: `2px solid ${selectedResumes.has(r.id) ? "white" : "#ddd"}`, borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                            {selectedResumes.has(r.id) && <span style={{ color: "white", fontSize: "14px", fontWeight: "bold" }}>✓</span>}
                          </div>
                        )}
                        <div onClick={() => isSelectMode ? toggleResumeSelection(r.id) : openResume(r)} style={{ height: "110px", background: (TEMPLATES.find(tt => tt.id === r.template)?.accent || "#6C63FF") + "18", cursor: "pointer", padding: "14px", position: "relative" }}>
                          <div style={{ height: "7px", width: "65%", background: TEMPLATES.find(tt => tt.id === r.template)?.accent || "#6C63FF", borderRadius: "3px", marginBottom: "7px" }} />
                          {[55, 80, 65, 85].map((w, i) => <div key={i} style={{ height: "3px", width: `${w}%`, background: t.muted, borderRadius: "2px", marginBottom: "4px", opacity: 0.15 }} />)}
                          <div style={{ position: "absolute", top: "8px", right: "8px", background: TEMPLATES.find(tt => tt.id === r.template)?.accent || "#6C63FF", color: "white", padding: "2px 7px", borderRadius: "3px", fontSize: "8px", fontWeight: "700", textTransform: "uppercase" }}>
                            {r.template || "Modernist"}
                          </div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          <h4 style={{ fontWeight: "600", fontSize: "13px", color: t.text, marginBottom: "3px" }}>{r.name}</h4>
                          <p style={{ color: t.muted, fontSize: "10px", marginBottom: "10px" }}>Updated {r.updatedAt}</p>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button onClick={() => openResume(r)} style={{ flex: 1, padding: "7px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "7px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>Edit</button>
                            <button onClick={() => duplicateResume(r)} style={{ padding: "7px 10px", background: t.inputBg, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "7px", fontSize: "11px", cursor: "pointer" }} title="Duplicate">⧉</button>
                            <button type="button" onClick={(e) => deleteResume(r.id, e)} style={{ padding: "7px 10px", background: "rgba(255,101,132,0.1)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "7px", fontSize: "11px", cursor: "pointer" }} title="Delete">✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ── AI RESUME WIZARD ── */}
          {activeView === "ai-builder" && (() => {
            const wInp = { width:"100%", padding:"9px 12px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"8px", fontSize:"12px", color:t.text, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" };
            const wLabel = { fontSize:"10px", color:t.muted, fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:"5px" };
            const wCard = { background:t.card, border:`1px solid ${t.border}`, borderRadius:"16px", padding:"24px", marginBottom:"0" };
            const btnPrimary = { padding:"14px", background:"linear-gradient(135deg,#6C63FF,#FF6584)", color:"white", border:"none", borderRadius:"12px", fontSize:"14px", fontWeight:"700", cursor:"pointer", width:"100%", transition:"all 0.3s" };
            const btnSecondary = { padding:"12px 20px", background:t.card, color:t.muted, border:`1px solid ${t.border}`, borderRadius:"10px", fontSize:"13px", cursor:"pointer", fontWeight:"600" };
            return (
              <div style={{ maxWidth:"780px", margin:"0 auto", paddingBottom:"40px" }}>
                {/* Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px" }}>
                  <div>
                    <h2 style={{ fontFamily:"'Noto Serif',serif", fontSize:"22px", fontWeight:"700", color:t.text, marginBottom:"4px" }}>🤖 AI Resume Builder</h2>
                    <p style={{ color:t.muted, fontSize:"13px" }}>
                      {aiWizardStep === 0 && "Fill your details — AI will craft your professional resume"}
                      {aiWizardStep === 1 && "Add your work experience and education"}
                      {aiWizardStep === 2 && "Skills, certifications & extra details"}
                      {aiWizardStep === 3 && "Claude AI is building your resume..."}
                      {aiWizardStep === 4 && "Review your AI-built resume before opening in editor"}
                    </p>
                  </div>
                  {aiWizardStep !== 3 && <button onClick={() => setActiveView("dashboard")} style={{ padding:"6px 14px", background:t.card, color:t.muted, border:`1px solid ${t.border}`, borderRadius:"8px", fontSize:"11px", cursor:"pointer" }}>← Dashboard</button>}
                </div>

                {/* Step pills */}
                {aiWizardStep < 3 && (
                  <div style={{ display:"flex", gap:"8px", marginBottom:"28px", alignItems:"center" }}>
                    {[["👤","Personal & JD"],["💼","Experience"],["⚡","Skills & Extras"]].map(([icon, label], i) => (
                      <React.Fragment key={i}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", cursor: i < aiWizardStep ? "pointer":"default" }} onClick={() => i < aiWizardStep && setAiWizardStep(i)}>
                          <div style={{ width:"32px", height:"32px", borderRadius:"50%", background: aiWizardStep > i ? "linear-gradient(135deg,#43D9A2,#00b894)" : aiWizardStep === i ? "linear-gradient(135deg,#6C63FF,#FF6584)" : t.card, border:`2px solid ${aiWizardStep > i ? "#43D9A2" : aiWizardStep === i ? "#6C63FF" : t.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", color: aiWizardStep >= i ? "white" : t.muted, transition:"all 0.3s" }}>
                            {aiWizardStep > i ? "✓" : (i+1)}
                          </div>
                          <span style={{ fontSize:"10px", color: aiWizardStep >= i ? t.text : t.muted, whiteSpace:"nowrap", fontWeight: aiWizardStep === i ? "700":"400" }}>{icon} {label}</span>
                        </div>
                        {i < 2 && <div style={{ flex:1, height:"2px", background: aiWizardStep > i ? "#43D9A2" : t.border, marginTop:"-14px", borderRadius:"4px", transition:"all 0.5s" }} />}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* ── STEP 0: Personal Info + Job Description ── */}
                {aiWizardStep === 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                    <div style={wCard}>
                      <p style={{ color:t.accent, fontWeight:"700", fontSize:"13px", marginBottom:"16px" }}>👤 Personal Details</p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                        {[["Full Name *","name","Priya Sharma"],["Target Job Title *","title","e.g. Senior Data Analyst"],["Email Address","email","priya@gmail.com"],["Phone Number","phone","+91 98765 43210"],["City / Location","location","Mumbai, Maharashtra"],["LinkedIn URL","linkedin","linkedin.com/in/priyasharma"],["Website (optional)","website","priyasharma.dev"]].map(([label, field, ph]) => (
                          <div key={field}>
                            <label style={wLabel}>{label}</label>
                            <input value={aiWizardData[field]} onChange={e => updateWizard(field, e.target.value)} placeholder={ph} style={wInp} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={wCard}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                        <p style={{ color:t.text, fontWeight:"700", fontSize:"13px" }}>💡 About You</p>
                        <span style={{ fontSize:"11px", color:t.accent, background:`${t.accent}15`, padding:"2px 8px", borderRadius:"10px" }}>Optional</span>
                      </div>
                      <p style={{ color:t.muted, fontSize:"12px", marginBottom:"8px" }}>Briefly describe your background — AI will use this to write your professional summary</p>
                      <textarea value={aiWizardData.summaryHint} onChange={e => updateWizard("summaryHint", e.target.value)} placeholder="e.g. I'm a Data Analyst with 4+ years in SQL and Power BI. I enjoy transforming raw data into business insights..." rows={3} style={{ ...wInp, resize:"vertical", lineHeight:"1.6" }} />
                    </div>

                    <div style={{ ...wCard, border:`1px solid ${t.accent}44`, boxShadow:`0 0 0 1px ${t.accent}15` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                        <p style={{ color:t.text, fontWeight:"700", fontSize:"13px" }}>📋 Target Job Description</p>
                        <span style={{ fontSize:"11px", color:"#43D9A2", background:"rgba(67,217,162,0.1)", padding:"2px 8px", borderRadius:"10px", fontWeight:"600" }}>Highly Recommended</span>
                      </div>
                      <p style={{ color:t.muted, fontSize:"12px", marginBottom:"8px" }}>Paste the job description — AI will tailor every bullet point and skill to match the role</p>
                      <textarea value={aiWizardData.jobDescription} onChange={e => updateWizard("jobDescription", e.target.value)} placeholder={"Paste the full job description here...\n\ne.g. We are looking for a Senior Data Analyst with 3+ years of experience in SQL, Python, and Power BI to join our analytics team..."} rows={8} style={{ ...wInp, resize:"vertical", lineHeight:"1.6" }} />
                    </div>

                    {!aiWizardData.name.trim() && <p style={{ color:"#FF6584", fontSize:"12px", textAlign:"center" }}>⚠️ Please enter your full name to continue</p>}
                    <button onClick={() => { if (aiWizardData.name.trim()) setAiWizardStep(1); }} disabled={!aiWizardData.name.trim()} style={{ ...btnPrimary, opacity: aiWizardData.name.trim() ? 1 : 0.5, cursor: aiWizardData.name.trim() ? "pointer":"not-allowed" }}>
                      Continue → Add Experience &amp; Education
                    </button>
                  </div>
                )}

                {/* ── STEP 1: Experience + Education ── */}
                {aiWizardStep === 1 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                    <div style={wCard}>
                      <p style={{ color:t.accent, fontWeight:"700", fontSize:"13px", marginBottom:"16px" }}>💼 Work Experience</p>
                      {aiWizardData.experiences.map((exp, i) => (
                        <div key={exp.id} style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"12px", padding:"16px", marginBottom:"12px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                            <span style={{ fontSize:"12px", fontWeight:"700", color:t.accent }}>Role {i+1}</span>
                            {aiWizardData.experiences.length > 1 && <button onClick={() => removeWizardExp(i)} style={{ padding:"3px 10px", background:"rgba(255,101,132,0.1)", color:"#FF6584", border:"1px solid rgba(255,101,132,0.3)", borderRadius:"6px", fontSize:"11px", cursor:"pointer" }}>✕ Remove</button>}
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"10px" }}>
                            {[["Job Title","role","Senior Data Analyst"],["Company","company","Infosys Limited"],["Location","location","Mumbai"]].map(([lbl, fld, ph]) => (
                              <div key={fld}>
                                <label style={wLabel}>{lbl}</label>
                                <input value={exp[fld]} onChange={e => updateWizardExp(i, fld, e.target.value)} placeholder={ph} style={{ ...wInp, background:t.card }} />
                              </div>
                            ))}
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"10px", marginBottom:"10px", alignItems:"end" }}>
                            <div>
                              <label style={wLabel}>From (YYYY-MM)</label>
                              <input value={exp.from} onChange={e => updateWizardExp(i,"from",e.target.value)} placeholder="2022-06" style={{ ...wInp, background:t.card }} />
                            </div>
                            <div>
                              <label style={wLabel}>To (YYYY-MM)</label>
                              <input value={exp.to} onChange={e => updateWizardExp(i,"to",e.target.value)} placeholder="2024-03" disabled={exp.current} style={{ ...wInp, background: exp.current ? "rgba(108,99,255,0.05)" : t.card, color: exp.current ? t.muted : t.text }} />
                            </div>
                            <label style={{ display:"flex", alignItems:"center", gap:"6px", cursor:"pointer", paddingBottom:"4px" }}>
                              <input type="checkbox" checked={exp.current} onChange={e => updateWizardExp(i,"current",e.target.checked)} style={{ width:"14px", height:"14px", accentColor:t.accent, cursor:"pointer" }} />
                              <span style={{ fontSize:"12px", color:t.text, whiteSpace:"nowrap" }}>Currently here</span>
                            </label>
                          </div>
                          <label style={wLabel}>Key Responsibilities &amp; Achievements</label>
                          <textarea value={exp.notes} onChange={e => updateWizardExp(i,"notes",e.target.value)} placeholder={"• Led a team of 5 analysts\n• Reduced reporting time by 40% using Power BI automation\n• Built end-to-end SQL pipelines for 3 enterprise clients\n• Achieved 99.2% data accuracy in financial reconciliation"} rows={4} style={{ ...wInp, background:t.card, resize:"vertical", lineHeight:"1.7" }} />
                          <p style={{ fontSize:"10px", color:t.muted, marginTop:"5px" }}>💡 Be specific — AI will polish these into strong, action-verb led bullets tailored to the JD</p>
                        </div>
                      ))}
                      <button onClick={addWizardExp} style={{ width:"100%", padding:"10px", background:"transparent", border:`2px dashed ${t.border}`, borderRadius:"10px", color:t.muted, fontSize:"12px", cursor:"pointer", fontWeight:"600" }}>+ Add Another Work Experience</button>
                    </div>

                    <div style={wCard}>
                      <p style={{ color:t.accent, fontWeight:"700", fontSize:"13px", marginBottom:"16px" }}>🎓 Education</p>
                      {aiWizardData.education.map((edu, i) => (
                        <div key={edu.id} style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"12px", padding:"16px", marginBottom:"12px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                            <span style={{ fontSize:"12px", fontWeight:"700", color:t.accent }}>Education {i+1}</span>
                            {aiWizardData.education.length > 1 && <button onClick={() => removeWizardEdu(i)} style={{ padding:"3px 10px", background:"rgba(255,101,132,0.1)", color:"#FF6584", border:"1px solid rgba(255,101,132,0.3)", borderRadius:"6px", fontSize:"11px", cursor:"pointer" }}>✕ Remove</button>}
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                            {[["Degree","degree","e.g. B.Tech, MBA"],["Field / Major","field","e.g. Computer Science"],["University / Institution","institution","e.g. University of Mumbai"],["Year","year","e.g. 2018-2022"],["Grade / GPA","grade","e.g. 8.7 CGPA"]].map(([lbl, fld, ph]) => (
                              <div key={fld} style={(fld === "institution") ? { gridColumn:"span 2" } : {}}>
                                <label style={wLabel}>{lbl}</label>
                                <input value={edu[fld]} onChange={e => updateWizardEdu(i, fld, e.target.value)} placeholder={ph} style={{ ...wInp, background:t.card }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button onClick={addWizardEdu} style={{ width:"100%", padding:"10px", background:"transparent", border:`2px dashed ${t.border}`, borderRadius:"10px", color:t.muted, fontSize:"12px", cursor:"pointer", fontWeight:"600" }}>+ Add Education Entry</button>
                    </div>

                    <div style={{ display:"flex", gap:"12px" }}>
                      <button onClick={() => setAiWizardStep(0)} style={btnSecondary}>← Back</button>
                      <button onClick={() => setAiWizardStep(2)} style={{ ...btnPrimary, flex:1, width:"auto" }}>Continue → Skills &amp; Extras</button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Skills + Extras ── */}
                {aiWizardStep === 2 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                    <div style={wCard}>
                      <p style={{ color:t.accent, fontWeight:"700", fontSize:"13px", marginBottom:"8px" }}>⚡ Skills</p>
                      <p style={{ color:t.muted, fontSize:"12px", marginBottom:"8px" }}>Comma-separated — AI will rank by JD relevance and add proficiency ratings</p>
                      <textarea value={aiWizardData.skills} onChange={e => updateWizard("skills", e.target.value)} placeholder="Python, SQL, Power BI, Tableau, Excel, Machine Learning, Data Visualization, ETL Pipelines, Leadership, Communication..." rows={3} style={{ ...wInp, resize:"vertical", lineHeight:"1.6" }} />
                    </div>

                    <div style={wCard}>
                      <p style={{ color:t.accent, fontWeight:"700", fontSize:"13px", marginBottom:"8px" }}>📜 Certifications <span style={{ color:t.muted, fontWeight:"400", fontSize:"11px" }}>— Optional</span></p>
                      <textarea value={aiWizardData.certifications} onChange={e => updateWizard("certifications", e.target.value)} placeholder={"Microsoft Power BI Data Analyst Associate – Microsoft\nGoogle Data Analytics Professional Certificate – Coursera\nAWS Cloud Practitioner – Amazon"} rows={3} style={{ ...wInp, resize:"vertical", lineHeight:"1.7" }} />
                    </div>

                    <div style={wCard}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                        <p style={{ color:t.accent, fontWeight:"700", fontSize:"13px" }}>🚀 Projects <span style={{ color:t.muted, fontWeight:"400", fontSize:"11px" }}>— Optional</span></p>
                      </div>
                      {aiWizardData.projects.map((proj, i) => (
                        <div key={proj.id} style={{ background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"10px", padding:"14px", marginBottom:"10px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                            <span style={{ fontSize:"11px", color:t.accent, fontWeight:"700" }}>Project {i+1}</span>
                            {aiWizardData.projects.length > 1 && <button onClick={() => removeWizardProject(i)} style={{ padding:"2px 8px", background:"rgba(255,101,132,0.1)", color:"#FF6584", border:"none", borderRadius:"4px", fontSize:"10px", cursor:"pointer" }}>✕</button>}
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                            {[["Project Name","name","e.g. Sales Forecasting Dashboard"],["Technologies Used","tech","e.g. Python, TensorFlow, Power BI"]].map(([lbl, fld, ph]) => (
                              <div key={fld}>
                                <label style={wLabel}>{lbl}</label>
                                <input value={proj[fld]} onChange={e => updateWizardProject(i, fld, e.target.value)} placeholder={ph} style={{ ...wInp, background:t.card }} />
                              </div>
                            ))}
                            <div>
                              <label style={wLabel}>Description &amp; Impact</label>
                              <textarea value={proj.description} onChange={e => updateWizardProject(i,"description",e.target.value)} placeholder="What does it do? What problem does it solve? What's the measurable impact?" rows={2} style={{ ...wInp, background:t.card, resize:"none", lineHeight:"1.6" }} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button onClick={addWizardProject} style={{ width:"100%", padding:"9px", background:"transparent", border:`2px dashed ${t.border}`, borderRadius:"8px", color:t.muted, fontSize:"12px", cursor:"pointer", fontWeight:"600" }}>+ Add Project</button>
                    </div>

                    <div style={wCard}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                        {[["🏆 Achievements","achievements","Employee of the Month – TCS (March 2023)\nReduced data processing time by 60% via automation"],["🌍 Languages","languages","English (Native), Hindi (Fluent), Marathi (Basic)"]].map(([lbl, fld, ph]) => (
                          <div key={fld}>
                            <p style={{ color:t.text, fontWeight:"700", fontSize:"12px", marginBottom:"8px" }}>{lbl}</p>
                            <textarea value={aiWizardData[fld]} onChange={e => updateWizard(fld, e.target.value)} placeholder={ph} rows={3} style={{ ...wInp, resize:"none", lineHeight:"1.6" }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop:"14px" }}>
                        <p style={{ color:t.text, fontWeight:"700", fontSize:"12px", marginBottom:"8px" }}>❤️ Hobbies <span style={{ color:t.muted, fontWeight:"400", fontSize:"11px" }}>— Optional</span></p>
                        <input value={aiWizardData.hobbies} onChange={e => updateWizard("hobbies", e.target.value)} placeholder="Reading, Chess, Travel, Photography, Coding..." style={wInp} />
                      </div>
                    </div>

                    {aiWizardError && (
                      <div style={{ background:"rgba(255,101,132,0.08)", border:"1px solid rgba(255,101,132,0.35)", borderRadius:"10px", padding:"14px 16px" }}>
                        <p style={{ color:"#FF6584", fontSize:"13px", fontWeight:"600", marginBottom:"4px" }}>⚠️ Build Failed</p>
                        <p style={{ color:t.muted, fontSize:"12px" }}>{aiWizardError}</p>
                        <p style={{ color:t.muted, fontSize:"11px", marginTop:"6px" }}>Make sure the backend is running: <code style={{ background:t.inputBg, padding:"2px 6px", borderRadius:"4px" }}>uvicorn main:app --port 8001</code></p>
                      </div>
                    )}

                    <div style={{ display:"flex", gap:"12px" }}>
                      <button onClick={() => setAiWizardStep(1)} style={btnSecondary}>← Back</button>
                      <button onClick={buildResumeWithAI} style={{ ...btnPrimary, flex:1, width:"auto" }}>🤖 Build My Resume with AI →</button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: AI Building Loader ── */}
                {aiWizardStep === 3 && (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"24px", padding:"40px 20px", textAlign:"center" }}>
                    <div style={{ width:"80px", height:"80px", borderRadius:"50%", background:"linear-gradient(135deg,#6C63FF,#FF6584)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px", boxShadow:"0 8px 32px rgba(108,99,255,0.5)", animation:"wiz-pulse 1.8s ease-in-out infinite" }}>🤖</div>
                    <div>
                      <h3 style={{ fontSize:"20px", fontWeight:"700", color:t.text, marginBottom:"6px" }}>Building Your Resume...</h3>
                      <p style={{ color:t.muted, fontSize:"13px" }}>Claude AI is crafting every section for you</p>
                    </div>
                    <div style={{ width:"100%", maxWidth:"420px", background:t.card, border:`1px solid ${t.border}`, borderRadius:"14px", padding:"20px 24px" }}>
                      {[
                        ["✅","Analyzing your details"],
                        [aiWizardData.jobDescription ? "✅":"⏭️", aiWizardData.jobDescription ? "Reading the job description":"No JD — building general resume"],
                        ["⏳","Writing professional summary..."],
                        ["⏳","Crafting JD-tailored experience bullets..."],
                        ["⏳","Ranking skills by relevance..."],
                        ["⏳","Structuring & finalizing resume..."],
                      ].map(([ico, txt], i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"9px 0", borderBottom: i < 5 ? `1px solid ${t.border}58` : "none" }}>
                          <span style={{ fontSize:"14px", minWidth:"20px" }}>{ico}</span>
                          <span style={{ fontSize:"12px", color: ico === "⏳" ? t.muted : t.text }}>{txt}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ color:t.muted, fontSize:"12px" }}>⏱️ Usually takes 15–25 seconds</p>
                    <style>{`@keyframes wiz-pulse { 0%,100%{transform:scale(1);box-shadow:0 8px 32px rgba(108,99,255,0.5);} 50%{transform:scale(1.06);box-shadow:0 12px 48px rgba(108,99,255,0.75);} }`}</style>
                  </div>
                )}

                {/* ── STEP 4: Review & Confirm ── */}
                {aiWizardStep === 4 && aiBuiltResume && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                    <div style={{ background:"linear-gradient(135deg,rgba(67,217,162,0.1),rgba(108,99,255,0.08))", border:"1px solid rgba(67,217,162,0.35)", borderRadius:"16px", padding:"20px 24px", display:"flex", alignItems:"center", gap:"16px" }}>
                      <span style={{ fontSize:"32px" }}>🎉</span>
                      <div>
                        <h3 style={{ fontSize:"16px", fontWeight:"700", color:"#43D9A2", marginBottom:"3px" }}>Your Resume is Ready!</h3>
                        <p style={{ color:t.muted, fontSize:"12px" }}>Review below and click "Open in Editor" to customize further, change template, download PDF etc.</p>
                      </div>
                    </div>

                    {aiBuiltResume.summary && (
                      <div style={{ background:t.card, border:`1px solid ${t.accent}33`, borderRadius:"14px", padding:"20px" }}>
                        <p style={{ color:t.accent, fontWeight:"700", fontSize:"12px", marginBottom:"10px" }}>✨ AI-Generated Professional Summary</p>
                        <p style={{ color:t.text, fontSize:"13px", lineHeight:"1.8", background:t.inputBg, padding:"14px 16px", borderRadius:"10px", borderLeft:`3px solid ${t.accent}` }}>{aiBuiltResume.summary}</p>
                      </div>
                    )}

                    <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"14px", padding:"20px" }}>
                      <p style={{ color:t.text, fontWeight:"700", fontSize:"13px", marginBottom:"14px" }}>📋 What's in Your Resume</p>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"8px" }}>
                        {[["👤 Name",aiBuiltResume.name],["💼 Title",aiBuiltResume.title],["📧 Email",aiBuiltResume.email],["📞 Phone",aiBuiltResume.phone],["📍 Location",aiBuiltResume.location],["🏢 Experience",`${(aiBuiltResume.experience||[]).length} roles`],["🎓 Education",`${(aiBuiltResume.education||[]).length} entries`],["⚡ Skills",`${(aiBuiltResume.skills||[]).length} skills`],["📜 Certifications",`${(aiBuiltResume.certifications||[]).length} certs`],["🚀 Projects",`${(aiBuiltResume.projects||[]).length} projects`],["🏆 Achievements",`${(aiBuiltResume.achievements||[]).length} items`]].filter(([,v]) => v && v !== "0 roles" && v !== "0 entries" && v !== "0 skills" && v !== "0 certs" && v !== "0 projects" && v !== "0 items").map(([lbl, val]) => (
                          <div key={lbl} style={{ background:"rgba(67,217,162,0.06)", border:"1px solid rgba(67,217,162,0.2)", borderRadius:"8px", padding:"8px 12px" }}>
                            <div style={{ fontSize:"10px", color:t.muted, marginBottom:"2px" }}>{lbl}</div>
                            <div style={{ fontSize:"12px", fontWeight:"700", color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:"12px" }}>
                      <button onClick={() => setAiWizardStep(0)} style={btnSecondary}>✏️ Edit Details</button>
                      <button onClick={confirmAiBuiltResume} style={{ ...btnPrimary, flex:1, width:"auto" }}>✅ Open in Editor &amp; Customize →</button>
                    </div>
                    <button onClick={() => setActiveView("dashboard")} style={{ width:"100%", padding:"10px", background:"transparent", color:t.muted, border:`1px solid ${t.border}`, borderRadius:"8px", fontSize:"12px", cursor:"pointer" }}>← Back to Dashboard</button>
                  </div>
                )}
              </div>
            );
          })()}



          {/* ── ATS OPTIMIZER VIEW ── */}
          {activeView === "ats-optimizer" && (() => {

            const runAtsOptimizer = async () => {
              // Validate inputs
              if (!atsOptFile && !atsOptResumeText) { setAtsOptError("Please upload your resume or use your current resume."); return; }
              if (!atsOptJD.trim() || atsOptJD.trim().length < 50) { setAtsOptError("Please paste a detailed job description (at least 50 characters)."); return; }
              if (atsOptFile && atsOptFile.size > 10 * 1024 * 1024) { setAtsOptError("File too large. Max 10MB."); return; }

              setAtsOptError("");
              setAtsOptLoading(true);
              setAtsOptResult(null);

              try {
                let resumeText = atsOptResumeText;

                // Extract text from uploaded file
                if (atsOptFile && !resumeText) {
                  try {
                    const ext = atsOptFile.name.toLowerCase().split(".").pop();
                    console.log(`🔄 [ATS] Extracting ${ext} file...`);
                    if (ext === "pdf") {
                      resumeText = await extractTextFromPDF(atsOptFile);
                    } else if (ext === "docx" || ext === "doc") {
                      resumeText = await extractTextFromDOCX(atsOptFile);
                    } else if (ext === "txt") {
                      resumeText = await atsOptFile.text();
                    } else {
                      throw new Error(`Unsupported file type: .${ext}. Please use PDF, DOCX, or TXT.`);
                    }
                    console.log(`✅ [ATS] Extracted: ${resumeText.length} chars`);
                  } catch (extractErr) {
                    throw new Error(`File reading failed: ${extractErr.message || "Unknown error"}`);
                  }

                  if (!resumeText || resumeText.trim().length < 50) {
                    throw new Error("Resume appears empty or too short. Try a different file format or paste the text manually.");
                  }
                  setAtsOptResumeText(resumeText);
                }

                const apiUrl = getApiUrl();
                console.log(`🔄 [ATS] Sending to ${apiUrl}/comprehensive-ats-analysis | Resume: ${resumeText.length} chars | JD: ${atsOptJD.length} chars`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000);

                // Use comprehensive analysis — NO truncation on frontend, backend handles limits
                const res = await fetch(`${apiUrl}/comprehensive-ats-analysis`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    resume_text: resumeText,  // Full text — no truncation
                    job_description: atsOptJD  // Full JD — no truncation
                  }),
                  signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!res.ok) {
                  const errData = await res.json().catch(() => ({}));
                  throw new Error(errData.detail || errData.error || `HTTP ${res.status}`);
                }

                const data = await res.json();
                console.log(`✅ [ATS] Response:`, data);

                if (data.error) throw new Error(data.error);

                // comprehensive endpoint uses overall_score
                if (data.overall_score === undefined && data.overall_score !== 0) {
                  throw new Error("Incomplete analysis response. Please try again.");
                }

                console.log(`🎉 [ATS] Score: ${data.overall_score}%`);
                setAtsOptResult(data);

              } catch (err) {
                if (err.name === "AbortError") {
                  setAtsOptError("Analysis timed out. Please try again with a shorter resume.");
                } else {
                  setAtsOptError(err.message || "Analysis failed. Please try again.");
                }
                setAtsOptResult(null);
              } finally {
                setAtsOptLoading(false);
              }
            };

            const score = atsOptResult?.overall_score ?? 0;
            const scoreColor = !atsOptResult ? t.accent : score >= 80 ? "#43D9A2" : score >= 60 ? "#FFB347" : "#FF6584";


            return (
              <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px" }}>
                {/* Header */}
                <div style={{ marginBottom: "28px" }}>
                  <button onClick={() => { setActiveView("dashboard"); setAtsOptResult(null); setAtsOptError(""); }} style={{ background: "none", border: `1px solid ${t.border}`, color: t.muted, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", marginBottom: "18px" }}>← Back</button>
                  <p style={{ color: t.accent, fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>ATS OPTIMIZER</p>
                  <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: "700", color: t.text, marginBottom: "8px" }}>Check Your <span style={{ fontStyle: "italic", color: "#6C63FF" }}>ATS Score</span></h1>
                  <p style={{ color: t.muted, fontSize: "14px", lineHeight: "1.7" }}>Upload your resume and paste the job description — our AI will score your match and tell you exactly how to improve it.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <div style={{ background: t.card, border: `2px dashed ${(atsOptFile || atsOptResumeText) ? t.accent : t.border}`, borderRadius: "16px", padding: "24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => atsOptFileRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setAtsOptFile(f); setAtsOptResumeText(""); setAtsOptResult(null); } }}>
                      <input ref={atsOptFileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files[0]; if (f) { setAtsOptFile(f); setAtsOptResumeText(""); setAtsOptResult(null); } }} />
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>{(atsOptFile || atsOptResumeText) ? "✅" : "📄"}</div>
                      <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "15px", fontWeight: "600", color: (atsOptFile || atsOptResumeText) ? t.accent : t.text, marginBottom: "5px" }}>
                        {atsOptFile ? atsOptFile.name : atsOptResumeText ? "Resume text ready" : "Upload Resume"}
                      </h3>
                      <p style={{ color: t.muted, fontSize: "11px", marginBottom: "8px" }}>{(atsOptFile || atsOptResumeText) ? "Click to change file" : "Drag & drop or click — PDF, DOCX, TXT"}</p>
                      {!atsOptFile && !atsOptResumeText && <div style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap" }}>
                        {["PDF", "DOCX", "TXT"].map(f => <span key={f} style={{ background: t.inputBg, color: t.muted, padding: "2px 8px", borderRadius: "4px", fontSize: "10px" }}>{f}</span>)}
                      </div>}
                    </div>
                    {resume?.name && !atsOptFile && !atsOptResumeText && (
                      <button onClick={() => {
                        const r = resume;
                        const lines = [];
                        if (r.name) lines.push(r.name);
                        if (r.title) lines.push(r.title);
                        const contact = [r.email, r.phone, r.location, r.linkedin].filter(Boolean).join(" | ");
                        if (contact) lines.push(contact);
                        if (r.summary) { lines.push(""); lines.push("PROFESSIONAL SUMMARY"); lines.push(r.summary); }
                        if (r.experience?.length) {
                          lines.push(""); lines.push("WORK EXPERIENCE");
                          r.experience.forEach(exp => {
                            lines.push(`${exp.role||""} — ${exp.company||""} (${exp.from||""}-${exp.to||"Present"})`);
                            (exp.responsibilities||[]).forEach(b => b && lines.push(`  • ${b}`));
                            (exp.bullets||[]).forEach(b => b && lines.push(`  • ${b}`));
                          });
                        }
                        if (r.skills?.length) { lines.push(""); lines.push("SKILLS"); lines.push(r.skills.map(s=>s.name).filter(Boolean).join(", ")); }
                        if (r.education?.length) { lines.push(""); lines.push("EDUCATION"); r.education.forEach(edu => lines.push(`${edu.degree||""} ${edu.field||""} — ${edu.institution||""} (${edu.year||""})`)); }
                        if (r.certifications?.length) { lines.push(""); lines.push("CERTIFICATIONS"); r.certifications.forEach(c => c.name && lines.push(`  • ${c.name}`)); }
                        setAtsOptResumeText(lines.join("\n"));
                        setAtsOptFile(null);
                        setAtsOptResult(null);
                      }}
                        style={{ width: "100%", marginTop: "10px", padding: "10px", background: `${t.accent}12`, color: t.accent, border: `1px solid ${t.accent}30`, borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}>
                        ⚡ Use My Current Resume ({resume.name})
                      </button>
                    )}
                  </div>

                  {/* Job Description */}
                  <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <label style={{ color: t.muted, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>📋 Job Description</label>
                      {aiWizardData?.jobDescription?.trim() && !atsOptJD.trim() && (
                        <button onClick={() => setAtsOptJD(aiWizardData.jobDescription)}
                          style={{ fontSize: "10px", padding: "3px 8px", background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}40`, borderRadius: "5px", cursor: "pointer", fontWeight: "700" }}>
                          📋 Use from Wizard
                        </button>
                      )}
                    </div>
                    <textarea
                      value={atsOptJD}
                      onChange={e => { setAtsOptJD(e.target.value); setAtsOptResult(null); }}
                      placeholder={"Paste the full job description here...\n\nInclude required skills, responsibilities, qualifications — the more detail, the better the analysis."}
                      style={{ flex: 1, width: "100%", padding: "12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "12px", color: t.text, outline: "none", resize: "none", fontFamily: "'DM Sans',sans-serif", lineHeight: "1.6", minHeight: "160px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Error */}
                {atsOptError && (
                  <div style={{ background: "rgba(255,101,132,0.08)", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#FF6584", fontSize: "13px" }}>
                    ⚠️ {atsOptError}
                  </div>
                )}

                {/* Analyse Button */}
                <button onClick={runAtsOptimizer} disabled={atsOptLoading || (!atsOptFile && !atsOptResumeText)}
                  style={{ width: "100%", padding: "16px", background: atsOptLoading ? t.border : "linear-gradient(135deg,#6C63FF,#FF6584)", color: atsOptLoading ? t.muted : "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: atsOptLoading ? "not-allowed" : "pointer", marginBottom: "28px", transition: "all 0.3s", boxShadow: atsOptLoading ? "none" : "0 6px 24px rgba(108,99,255,0.35)" }}>
                  {atsOptLoading ? "🔍 Analysing with AI..." : "📊 Analyse ATS Score"}
                </button>

                {/* Results */}
                {atsOptResult && (
                  <div style={{ animation: "fadeIn 0.4s ease" }}>
                    {/* Score Hero */}
                    <div style={{ background: `${scoreColor}10`, border: `2px solid ${scoreColor}30`, borderRadius: "20px", padding: "28px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center", minWidth: "100px" }}>
                        <div style={{ fontFamily: "'Noto Serif',serif", fontSize: "60px", fontWeight: "800", color: scoreColor, lineHeight: 1 }}>{score}%</div>
                        <div style={{ color: t.muted, fontSize: "11px", fontWeight: "700", letterSpacing: "1px", marginTop: "4px" }}>ATS MATCH SCORE</div>
                        {atsOptResult.estimated_interview_chance && (
                          <div style={{ marginTop: "8px", background: `${scoreColor}20`, borderRadius: "8px", padding: "4px 10px", fontSize: "11px", color: scoreColor, fontWeight: "700" }}>
                            🎯 {atsOptResult.estimated_interview_chance} interview chance
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ fontFamily: "'Noto Serif',serif", fontSize: "20px", fontWeight: "700", color: t.text, marginBottom: "8px" }}>
                          {score >= 80 ? "🟢 Excellent Match!" : score >= 60 ? "🟡 Good Match" : "🔴 Needs Improvement"}
                        </div>
                        <div style={{ background: t.border, borderRadius: "6px", height: "10px", overflow: "hidden", marginBottom: "10px" }}>
                          <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)`, borderRadius: "6px", transition: "width 1.2s ease" }} />
                        </div>
                        <p style={{ color: t.muted, fontSize: "13px", margin: 0 }}>
                          {score >= 80 ? "Your resume is well-optimised for this role. Strong chance of passing ATS screening." : score >= 60 ? "Your resume partially matches. A few targeted improvements will significantly boost your score." : "Your resume needs significant optimisation for this role. Focus on the improvements below."}
                        </p>
                      </div>
                    </div>

                    {/* Category Score Breakdown */}
                    {[["Skills Match", atsOptResult.skills_match_score], ["Keywords", atsOptResult.keywords_match_score], ["Experience", atsOptResult.experience_match_score], ["Education", atsOptResult.education_match_score]].filter(([,v]) => v !== undefined).length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px,1fr))", gap: "10px", marginBottom: "16px" }}>
                        {[["🔧 Skills Match", atsOptResult.skills_match_score], ["🔍 Keywords", atsOptResult.keywords_match_score], ["💼 Experience", atsOptResult.experience_match_score], ["🎓 Education", atsOptResult.education_match_score], ["📄 Formatting", atsOptResult.formatting_score]].filter(([,v]) => v !== undefined).map(([label, val]) => {
                          const c = val >= 70 ? "#43D9A2" : val >= 50 ? "#FFB347" : "#FF6584";
                          return (
                            <div key={label} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                <span style={{ fontSize: "11px", color: t.muted, fontWeight: "600" }}>{label}</span>
                                <span style={{ fontSize: "13px", color: c, fontWeight: "800" }}>{val}%</span>
                              </div>
                              <div style={{ height: "6px", background: t.border, borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${val}%`, background: `linear-gradient(90deg,${c},${c}99)`, borderRadius: "3px", transition: "width 1.2s ease" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      {/* Strengths */}
                      {atsOptResult.strengths && (
                        <div style={{ background: "rgba(67,217,162,0.06)", border: "1px solid rgba(67,217,162,0.2)", borderRadius: "14px", padding: "20px" }}>
                          <div style={{ color: "#43D9A2", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", marginBottom: "10px" }}>✅ WHAT'S WORKING</div>
                          <p style={{ color: t.text, fontSize: "13px", lineHeight: "1.7", margin: 0 }}>{atsOptResult.strengths}</p>
                        </div>
                      )}
                      {/* Weaknesses */}
                      {atsOptResult.weaknesses && (
                        <div style={{ background: "rgba(255,101,132,0.06)", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "14px", padding: "20px" }}>
                          <div style={{ color: "#FF6584", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", marginBottom: "10px" }}>⚠️ KEY GAPS</div>
                          <p style={{ color: t.text, fontSize: "13px", lineHeight: "1.7", margin: 0 }}>{atsOptResult.weaknesses}</p>
                        </div>
                      )}
                    </div>

                    {/* Top 3 Improvements */}
                    {(atsOptResult.top_3_improvements || []).length > 0 && (
                      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
                        <div style={{ color: "#FF6584", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", marginBottom: "14px" }}>🚀 TOP 3 PRIORITY IMPROVEMENTS</div>
                        {(atsOptResult.top_3_improvements || []).slice(0,3).map((imp, i) => (
                          <div key={i} style={{ display: "flex", gap: "14px", padding: "12px 0", borderBottom: i < 2 ? `1px solid ${t.border}60` : "none" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i === 0 ? "#FF6584" : i === 1 ? "#FFB347" : "#6C63FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "white", flexShrink: 0 }}>{i+1}</div>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: t.text, fontSize: "13px", fontWeight: "600", margin: "0 0 3px" }}>{imp.action}</p>
                              {imp.impact && <p style={{ color: "#FFB347", fontSize: "12px", margin: 0, fontWeight: "600" }}>↑ {imp.impact}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Keyword Analysis */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      {(atsOptResult.missing_keywords || []).filter(Boolean).length > 0 && (
                        <div style={{ background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.2)", borderRadius: "14px", padding: "20px" }}>
                          <div style={{ color: "#FFB347", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", marginBottom: "12px" }}>🔍 MISSING KEYWORDS</div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {(atsOptResult.missing_keywords || []).filter(Boolean).map((kw, i) => (
                              <span key={i} style={{ background: "rgba(255,179,71,0.12)", color: "#FFB347", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(255,179,71,0.2)" }}>{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(atsOptResult.matched_keywords || []).filter(Boolean).length > 0 && (
                        <div style={{ background: "rgba(67,217,162,0.06)", border: "1px solid rgba(67,217,162,0.2)", borderRadius: "14px", padding: "20px" }}>
                          <div style={{ color: "#43D9A2", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", marginBottom: "12px" }}>✓ MATCHED KEYWORDS</div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {(atsOptResult.matched_keywords || []).filter(Boolean).map((kw, i) => (
                              <span key={i} style={{ background: "rgba(67,217,162,0.1)", color: "#43D9A2", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(67,217,162,0.2)" }}>{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Next Steps */}
                    {(atsOptResult.next_steps || []).length > 0 && (
                      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "18px 20px", marginBottom: "16px" }}>
                        <div style={{ color: t.text, fontSize: "12px", fontWeight: "700", letterSpacing: "1px", marginBottom: "12px" }}>📋 NEXT STEPS</div>
                        {(atsOptResult.next_steps || []).map((step, i) => (
                          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: i < atsOptResult.next_steps.length - 1 ? "8px" : 0 }}>
                            <span style={{ color: t.accent, fontWeight: "700", fontSize: "12px", minWidth: "16px" }}>→</span>
                            <span style={{ color: t.muted, fontSize: "13px", lineHeight: "1.6" }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button onClick={() => { setAtsOptResult(null); setAtsOptFile(null); setAtsOptResumeText(""); setAtsOptJD(""); }}
                        style={{ padding: "12px 24px", background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                        🔄 Check Another Resume
                      </button>
                      <button onClick={() => setActiveView("editor")}
                        style={{ flex: 1, padding: "12px 24px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700", boxShadow: "0 4px 16px rgba(108,99,255,0.35)" }}>
                        ✏️ Edit My Resume to Improve Score →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── EDITOR ── */}
          {activeView === "editor" && (
            <div>
              {/* ATS */}
              {showAts && (() => {
                const sc = atsScore;
                const score = sc?.overall_score ?? sc?.score ?? 0;
                const scoreColor = score >= 80 ? "#43D9A2" : score >= 60 ? "#FFB347" : "#FF6584";
                const cats = sc ? [
                  { label: "Skills", val: sc.skills_match_score },
                  { label: "Keywords", val: sc.keywords_match_score },
                  { label: "Experience", val: sc.experience_match_score },
                  { label: "Education", val: sc.education_match_score },
                ].filter(c => c.val !== undefined) : [];
                return (
                  <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "18px 22px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "15px", fontWeight: "600", color: t.text, margin: 0 }}>📊 ATS Score Checker</h3>
                      {aiWizardData?.jobDescription?.trim() && !jobDesc.trim() && (
                        <button onClick={() => setJobDesc(aiWizardData.jobDescription)}
                          style={{ fontSize: "11px", padding: "4px 10px", background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}40`, borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                          📋 Use JD from AI Wizard
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "end" }}>
                      <textarea value={jobDesc} onChange={e => { setJobDesc(e.target.value); setAtsScore(null); }}
                        placeholder="Paste the job description here — AI will check your current resume against it and show a detailed score breakdown..." rows={3}
                        style={{ width: "100%", padding: "10px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "12px", color: t.text, outline: "none", resize: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }} />
                      <button onClick={checkAts} disabled={atsLoading}
                        style={{ padding: "10px 18px", background: atsLoading ? t.border : "linear-gradient(135deg,#6C63FF,#FF6584)", color: atsLoading ? t.muted : "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: atsLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                        {atsLoading ? "⏳ Checking..." : "✨ Check ATS"}
                      </button>
                    </div>
                    {atsLoading && (
                      <div style={{ marginTop: "12px", background: `${t.accent}08`, border: `1px solid ${t.accent}25`, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: t.muted }}>
                        🔍 AI is analyzing your resume against this specific job description... (~15 seconds)
                      </div>
                    )}
                    {sc && !atsLoading && (
                      <div style={{ marginTop: "14px" }}>
                        {sc.error ? (
                          <div style={{ background: "rgba(255,101,132,0.08)", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "8px", padding: "10px 14px", color: "#FF6584", fontSize: "12px" }}>
                            ⚠️ {sc.error}
                          </div>
                        ) : (
                          <>
                            {/* Score + bar */}
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                              <div style={{ background: `${scoreColor}18`, borderRadius: "10px", padding: "12px 16px", textAlign: "center", minWidth: "74px" }}>
                                <div style={{ fontFamily: "'Noto Serif',serif", fontSize: "28px", fontWeight: "700", color: scoreColor }}>{score}%</div>
                                <div style={{ color: t.muted, fontSize: "9px", fontWeight: "600", marginTop: "2px" }}>ATS MATCH</div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ height: "8px", background: t.border, borderRadius: "4px", overflow: "hidden", marginBottom: "5px" }}>
                                  <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg,${scoreColor},${scoreColor}99)`, borderRadius: "4px", transition: "width 1s ease" }} />
                                </div>
                                <p style={{ color: t.muted, fontSize: "11px", margin: 0 }}>
                                  {score >= 80 ? "🟢 Excellent match — strong chance of passing ATS!" : score >= 60 ? "🟡 Good match — targeted improvements will boost your score." : "🔴 Needs improvement — use the suggestions below to boost your score."}
                                </p>
                              </div>
                            </div>

                            {/* Category scores */}
                            {cats.length > 0 && (
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "6px", marginBottom: "10px" }}>
                                {cats.map(({ label, val }) => {
                                  const c = val >= 70 ? "#43D9A2" : val >= 50 ? "#FFB347" : "#FF6584";
                                  return (
                                    <div key={label} style={{ background: t.inputBg, borderRadius: "8px", padding: "8px 10px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                        <span style={{ fontSize: "10px", color: t.muted, fontWeight: "600" }}>{label}</span>
                                        <span style={{ fontSize: "11px", color: c, fontWeight: "700" }}>{val}%</span>
                                      </div>
                                      <div style={{ height: "4px", background: t.border, borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${val}%`, background: c, borderRadius: "2px", transition: "width 1s" }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Strengths */}
                            {sc.strengths && (
                              <div style={{ background: "rgba(67,217,162,0.06)", border: "1px solid rgba(67,217,162,0.15)", borderRadius: "8px", padding: "9px 12px", marginBottom: "8px" }}>
                                <div style={{ color: "#43D9A2", fontSize: "10px", fontWeight: "700", marginBottom: "3px" }}>✅ WHAT'S WORKING</div>
                                <p style={{ color: t.text, fontSize: "11px", lineHeight: "1.6", margin: 0 }}>{sc.strengths}</p>
                              </div>
                            )}

                            {/* Top 3 improvements */}
                            {(sc.top_3_improvements || []).length > 0 && (
                              <div style={{ background: "rgba(255,101,132,0.05)", border: "1px solid rgba(255,101,132,0.15)", borderRadius: "8px", padding: "9px 12px", marginBottom: "8px" }}>
                                <div style={{ color: "#FF6584", fontSize: "10px", fontWeight: "700", marginBottom: "6px" }}>🔧 TOP IMPROVEMENTS</div>
                                {sc.top_3_improvements.slice(0,3).map((imp, i) => (
                                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < 2 ? "5px" : 0 }}>
                                    <span style={{ minWidth: "16px", height: "16px", borderRadius: "50%", background: "#FF658420", color: "#FF6584", fontSize: "9px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{i+1}</span>
                                    <div>
                                      <span style={{ color: t.text, fontSize: "11px", lineHeight: "1.5" }}>{imp.action}</span>
                                      {imp.impact && <span style={{ color: "#FFB347", fontSize: "10px", marginLeft: "6px" }}>({imp.impact})</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Missing keywords */}
                            {(sc.missing_keywords || []).filter(Boolean).length > 0 && (
                              <div style={{ background: "rgba(255,179,71,0.05)", border: "1px solid rgba(255,179,71,0.15)", borderRadius: "8px", padding: "9px 12px", marginBottom: "8px" }}>
                                <div style={{ color: "#FFB347", fontSize: "10px", fontWeight: "700", marginBottom: "6px" }}>🔍 MISSING KEYWORDS — Add to your resume:</div>
                                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                  {(sc.missing_keywords || []).filter(Boolean).slice(0,8).map((kw, i) => (
                                    <span key={i} style={{ background: "rgba(255,179,71,0.1)", color: "#FFB347", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600", border: "1px solid rgba(255,179,71,0.2)" }}>{kw}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Matched keywords */}
                            {(sc.matched_keywords || []).filter(Boolean).length > 0 && (
                              <div style={{ background: "rgba(67,217,162,0.04)", border: "1px solid rgba(67,217,162,0.12)", borderRadius: "8px", padding: "9px 12px" }}>
                                <div style={{ color: "#43D9A2", fontSize: "10px", fontWeight: "700", marginBottom: "6px" }}>✓ KEYWORDS ALREADY IN YOUR RESUME:</div>
                                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                  {(sc.matched_keywords || []).filter(Boolean).map((kw, i) => (
                                    <span key={i} style={{ background: "rgba(67,217,162,0.08)", color: "#43D9A2", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600", border: "1px solid rgba(67,217,162,0.2)" }}>{kw}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Resume Completion Progress Bar ── */}
              {(() => {
                const sc = {
                  personal: !!(resume.name && resume.email),
                  summary: !!(resume.summary?.trim()),
                  experience: (resume.experience||[]).some(e => e.company || e.role),
                  education: (resume.education||[]).some(e => e.school || e.degree || e.institution),
                  skills: (resume.skills||[]).length > 0,
                  projects: (resume.projects||[]).some(p => p.name),
                  certs: (resume.certifications||[]).some(c => c.name || c.title),
                  achievements: (resume.achievements||[]).some(a => a.title || a.text || a.description),
                  strengths: (resume.strengths||[]).length > 0,
                  extras: !!(resume.languages?.trim() || resume.interests?.trim() || (resume.hobbies||[]).length > 0),
                };
                const done = Object.values(sc).filter(Boolean).length;
                const pct = Math.round((done / 10) * 100);
                const barColor = pct >= 70 ? "linear-gradient(90deg,#43D9A2,#00b894)" : pct >= 40 ? "linear-gradient(90deg,#FFB347,#e17055)" : "linear-gradient(90deg,#FF6584,#d63031)";
                const msg = pct >= 90 ? "🏆 Excellent! Your resume is very complete." : pct >= 70 ? "🟢 Great progress! A few more sections to go." : pct >= 40 ? "🟡 Keep going — fill more sections to improve your chances." : "🔴 Just getting started — fill in your details below.";
                return (
                  <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: t.text }}>Resume Completeness</span>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: pct >= 70 ? "#43D9A2" : pct >= 40 ? "#FFB347" : "#FF6584" }}>{pct}% — {done}/10 sections</span>
                      </div>
                      <div style={{ height: "6px", background: t.border, borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "3px", transition: "width 0.6s ease" }} />
                      </div>
                      <p style={{ fontSize: "11px", color: t.muted, margin: 0 }}>{msg}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Templates Section */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "700", color: t.text, margin: 0 }}>🎨 Choose Your Template</h2>
                    <p style={{ color: t.muted, fontSize: "13px", margin: "4px 0 0" }}>32 professionally designed templates — select a category below</p>
                  </div>
                  <div style={{ display: "flex", background: "#6C63FF20", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", color: t.accent }}>
                    ⭐ All 32 Templates Available
                  </div>
                </div>

                {/* ── Category Tabs ── */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {[
                    { id: "All",            icon: "🗂",  desc: "All 32 templates" },
                    { id: "ATS Friendly",   icon: "✅",  desc: "Pass every ATS scanner" },
                    { id: "Futuristic",     icon: "🚀",  desc: "Bold, modern designs" },
                    { id: "With Photo",     icon: "📸",  desc: "Headshot-ready layouts" },
                    { id: "Executive Suite",icon: "💼",  desc: "Corporate & premium" },
                  ].map(cat => {
                    const active = templateFilter === cat.id;
                    const count  = cat.id === "All" ? TEMPLATES.length : TEMPLATES.filter(t => t.category === cat.id).length;
                    return (
                      <button key={cat.id} onClick={() => setTemplateFilter(cat.id)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "flex-start",
                          padding: "10px 14px", borderRadius: "12px", cursor: "pointer",
                          border: `1.5px solid ${active ? t.accent : t.border}`,
                          background: active ? `${t.accent}15` : t.card,
                          transition: "all 0.18s", minWidth: "110px",
                        }}>
                        <span style={{ fontSize: "16px", marginBottom: "2px" }}>{cat.icon}</span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: active ? t.accent : t.text, lineHeight: 1.2 }}>{cat.id}</span>
                        <span style={{ fontSize: "9px", color: t.muted, marginTop: "2px" }}>{count} templates</span>
                      </button>
                    );
                  })}
                </div>

                {/* ── Template Cards ── */}
                {(() => {
                  const filtered = templateFilter === "All" ? TEMPLATES : TEMPLATES.filter(tmpl => tmpl.category === templateFilter);
                  const visible  = showAllTemplates ? filtered : filtered.slice(0, 8);
                  return (
                    <>
                      <div className="mobile-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "10px" }}>
                        {visible.map(tmpl => {
                          const isActive = activeTemplate === tmpl.id;
                          const ac = tmpl.accent;
                          const isDark = ["obsidian","neon","lumina"].includes(tmpl.layout);
                          const bg    = isDark ? (tmpl.layout === "neon" ? "#060b14" : tmpl.layout === "lumina" ? "#1c1410" : "#0f0f1a") : "#ffffff";
                          const textC = isDark ? "#e5e7eb" : "#1a1a1a";
                          const mutedC = isDark ? "#6b7280" : "#9ca3af";
                          const lineC  = isDark ? "rgba(255,255,255,0.08)" : "#f0f0f0";

                          // ── Render a realistic mini-resume for each category ──
                          let PreviewContent;

                          // PHOTO templates — sidebar with avatar
                          if (tmpl.category === "With Photo") {
                            const isSidebarPhoto = ["photo_sidebar","photo_german","photo_bold","creative","claude_photo1"].includes(tmpl.layout);
                            PreviewContent = isSidebarPhoto ? (
                              // Sidebar layout: colored left column + white right
                              <div style={{ display:"flex", height:"100%", fontFamily:"sans-serif" }}>
                                {/* Left sidebar */}
                                <div style={{ width:"36%", background: tmpl.layout === "creative" ? ac : tmpl.layout === "photo_bold" ? ac : `${ac}dd`, padding:"8px 5px", display:"flex", flexDirection:"column", alignItems:"center", gap:"5px" }}>
                                  {/* Avatar circle */}
                                  <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"2px solid rgba(255,255,255,0.5)", marginBottom:2, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"rgba(255,255,255,0.8)" }}>AB</div>
                                  {/* Name */}
                                  <div style={{ height:2.5, width:"80%", background:"rgba(255,255,255,0.8)", borderRadius:1 }}/>
                                  <div style={{ height:1.5, width:"55%", background:"rgba(255,255,255,0.5)", borderRadius:1, marginBottom:4 }}/>
                                  {/* Contact lines */}
                                  {["Email","Phone","City","LinkedIn"].map((l,i)=>(
                                    <div key={i} style={{ display:"flex", alignItems:"center", gap:2, width:"100%" }}>
                                      <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(255,255,255,0.5)", flexShrink:0 }}/>
                                      <div style={{ height:1.5, width:`${[70,55,65,60][i]}%`, background:"rgba(255,255,255,0.5)", borderRadius:1 }}/>
                                    </div>
                                  ))}
                                  <div style={{ height:"0.5px", width:"90%", background:"rgba(255,255,255,0.2)", margin:"3px 0" }}/>
                                  {/* Skills label */}
                                  <div style={{ height:2, width:"60%", background:"rgba(255,255,255,0.7)", borderRadius:1, marginBottom:2 }}/>
                                  {[85,65,75,55,70].map((w,i)=>(
                                    <div key={i} style={{ width:"90%", height:3, background:"rgba(255,255,255,0.15)", borderRadius:2 }}>
                                      <div style={{ width:`${w}%`, height:"100%", background:"rgba(255,255,255,0.55)", borderRadius:2 }}/>
                                    </div>
                                  ))}
                                </div>
                                {/* Right main */}
                                <div style={{ flex:1, padding:"7px 6px", display:"flex", flexDirection:"column", gap:"5px", background:bg }}>
                                  <div style={{ height:2.5, width:"75%", background:textC, borderRadius:1 }}/>
                                  <div style={{ height:1.5, width:"45%", background:mutedC, borderRadius:1, marginBottom:3 }}/>
                                  {/* Experience section */}
                                  <div style={{ height:2, width:"40%", background:ac, borderRadius:1, marginBottom:2 }}/>
                                  {[90,80,85,72,78].map((w,i)=>(
                                    <div key={i} style={{ height:1.5, width:`${w}%`, background:i%2===0?"#e5e7eb":"#f3f4f6", borderRadius:1 }}/>
                                  ))}
                                  <div style={{ height:0.5, background:lineC, margin:"3px 0" }}/>
                                  <div style={{ height:2, width:"35%", background:ac, borderRadius:1, marginBottom:2 }}/>
                                  {[85,70,75].map((w,i)=>(
                                    <div key={i} style={{ height:1.5, width:`${w}%`, background:"#f0f0f0", borderRadius:1 }}/>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              // Header layout: photo in top-right of header
                              <div style={{ padding:"0", height:"100%", display:"flex", flexDirection:"column", background:bg, fontFamily:"sans-serif" }}>
                                {/* Colored header bar */}
                                <div style={{ background: tmpl.layout === "photo_minimal" ? "#f8f9fa" : ac, padding:"6px 7px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom: tmpl.layout === "photo_minimal" ? `2px solid ${ac}` : "none" }}>
                                  <div>
                                    <div style={{ height:3.5, width:55, background: tmpl.layout === "photo_minimal" ? textC : "rgba(255,255,255,0.9)", borderRadius:1, marginBottom:2 }}/>
                                    <div style={{ height:2, width:35, background: tmpl.layout === "photo_minimal" ? ac : "rgba(255,255,255,0.6)", borderRadius:1, marginBottom:2 }}/>
                                    <div style={{ display:"flex", gap:3 }}>
                                      {[28,22,24].map((w,i)=>(
                                        <div key={i} style={{ height:1.5, width:w, background: tmpl.layout === "photo_minimal" ? mutedC : "rgba(255,255,255,0.5)", borderRadius:1 }}/>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Photo circle */}
                                  <div style={{ width:26, height:26, borderRadius:"50%", background: tmpl.layout === "photo_minimal" ? `${ac}30` : "rgba(255,255,255,0.25)", border: `2px solid ${tmpl.layout === "photo_minimal" ? ac : "rgba(255,255,255,0.5)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color: tmpl.layout === "photo_minimal" ? ac : "rgba(255,255,255,0.8)", flexShrink:0 }}>AB</div>
                                </div>
                                {/* Content */}
                                <div style={{ flex:1, padding:"5px 7px", display:"flex", flexDirection:"column", gap:"3px" }}>
                                  <div style={{ height:2, width:"42%", background:ac, borderRadius:1, marginBottom:2 }}/>
                                  {[90,80,85,70,78,65].map((w,i)=>(
                                    <div key={i} style={{ height:1.5, width:`${w}%`, background:i%3===0?ac+"44":"#e5e7eb", borderRadius:1 }}/>
                                  ))}
                                  <div style={{ height:0.5, background:lineC, margin:"3px 0" }}/>
                                  <div style={{ height:2, width:"35%", background:ac, borderRadius:1, marginBottom:2 }}/>
                                  {[85,75,80].map((w,i)=>(
                                    <div key={i} style={{ height:1.5, width:`${w}%`, background:"#f0f0f0", borderRadius:1 }}/>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // ATS FRIENDLY — clean single-column, no color blocks
                          else if (tmpl.category === "ATS Friendly") {
                            const isVintage = ["vintage","typewriter","gazette"].includes(tmpl.layout);
                            const headerBg = isVintage ? `${ac}18` : "transparent";
                            PreviewContent = (
                              <div style={{ padding:"7px 8px", background:bg, height:"100%", fontFamily:"sans-serif" }}>
                                {/* Name block */}
                                <div style={{ background:headerBg, borderBottom: isVintage ? `1.5px solid ${ac}` : `1.5px solid ${ac}`, paddingBottom:4, marginBottom:5 }}>
                                  <div style={{ height:4, width:"62%", background:textC, borderRadius:1, marginBottom:2 }}/>
                                  <div style={{ height:2, width:"40%", background:ac, borderRadius:1, marginBottom:3 }}/>
                                  {/* Contact row */}
                                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                                    {[32,26,28,22].map((w,i)=>(
                                      <div key={i} style={{ display:"flex", alignItems:"center", gap:1.5 }}>
                                        <div style={{ width:3, height:3, borderRadius:"50%", background:ac }}/>
                                        <div style={{ height:1.5, width:w, background:mutedC, borderRadius:1 }}/>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {/* Sections */}
                                {[["PROFESSIONAL SUMMARY",3],["EXPERIENCE",4],["EDUCATION",2],["SKILLS",2]].map(([label,rows],si)=>(
                                  <div key={si} style={{ marginBottom:5 }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:2 }}>
                                      <div style={{ height:2, width:label === "SKILLS" ? 22 : label === "EDUCATION" ? 28 : label === "EXPERIENCE" ? 30 : 44, background:textC, borderRadius:1 }}/>
                                      <div style={{ flex:1, height:0.5, background:lineC }}/>
                                    </div>
                                    {Array.from({length:rows}).map((_,i)=>(
                                      <div key={i} style={{ height:1.5, width:`${[85,70,80,60,75,55,65,50][i%8]}%`, background: i===0 && si!==3 ? `${ac}66` : "#e5e7eb", borderRadius:1, marginBottom:1.5 }}/>
                                    ))}
                                    {label === "SKILLS" && (
                                      <div style={{ display:"flex", gap:3, marginTop:2, flexWrap:"wrap" }}>
                                        {[24,18,22,16,20].map((w,i)=>(
                                          <div key={i} style={{ height:5, width:w, background:ac+"22", border:`0.5px solid ${ac}66`, borderRadius:2 }}/>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          // FUTURISTIC — dark backgrounds, glows, bold headers
                          else if (tmpl.category === "Futuristic") {
                            const isNeon = tmpl.layout === "neon";
                            const isObs  = tmpl.layout === "obsidian";
                            const acGlow = isNeon || isObs ? `0 0 6px ${ac}70` : "none";
                            PreviewContent = (
                              <div style={{ padding:"0", height:"100%", background:bg, overflow:"hidden", fontFamily:"sans-serif" }}>
                                {/* Bold header bar */}
                                <div style={{ background: isDark ? ac : `${ac}ee`, padding:"6px 8px", position:"relative" }}>
                                  {isNeon && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${ac}30, transparent 70%)` }}/>}
                                  <div style={{ height:4.5, width:"65%", background:isDark?"rgba(0,0,0,0.7)":"rgba(255,255,255,0.95)", borderRadius:1, marginBottom:2, boxShadow:acGlow }}/>
                                  <div style={{ height:2.5, width:"42%", background:isDark?"rgba(0,0,0,0.5)":"rgba(255,255,255,0.7)", borderRadius:1, marginBottom:3 }}/>
                                  <div style={{ display:"flex", gap:4 }}>
                                    {[28,22,24,18].map((w,i)=>(
                                      <div key={i} style={{ height:1.5, width:w, background: isDark?"rgba(0,0,0,0.4)":"rgba(255,255,255,0.5)", borderRadius:1 }}/>
                                    ))}
                                  </div>
                                </div>
                                {/* Content area */}
                                <div style={{ padding:"6px 8px" }}>
                                  {/* Section header */}
                                  <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:4 }}>
                                    <div style={{ height:2, width:32, background:ac, borderRadius:1, boxShadow:acGlow }}/>
                                    <div style={{ flex:1, height:0.5, background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)" }}/>
                                  </div>
                                  {[90,76,84,68,80,65,74].map((w,i)=>(
                                    <div key={i} style={{ height:2, width:`${w}%`, background: i%3===0 ? (isDark?`${ac}50`:"#e5e7eb") : (isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"), borderRadius:1, marginBottom:2.5,
                                      boxShadow: i%3===0 && isNeon ? `0 0 4px ${ac}30` : "none" }}/>
                                  ))}
                                  <div style={{ display:"flex", alignItems:"center", gap:3, margin:"5px 0 3px" }}>
                                    <div style={{ height:2, width:26, background:ac, borderRadius:1, boxShadow:acGlow }}/>
                                    <div style={{ flex:1, height:0.5, background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)" }}/>
                                  </div>
                                  {/* Skill chips */}
                                  <div style={{ display:"flex", gap:2.5, flexWrap:"wrap", marginTop:2 }}>
                                    {[22,16,20,14,18,16].map((w,i)=>(
                                      <div key={i} style={{ height:6, width:w, background:isDark?`${ac}20`:"rgba(0,0,0,0.05)",
                                        border:`0.5px solid ${ac}${isDark?"60":"44"}`, borderRadius:2,
                                        boxShadow: isNeon && i%2===0 ? `0 0 3px ${ac}40` : "none" }}/>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // EXECUTIVE SUITE — two-column sidebar, corporate
                          else {
                            const accentSidebar = ac;
                            PreviewContent = (
                              <div style={{ display:"flex", height:"100%", fontFamily:"sans-serif" }}>
                                {/* Colored sidebar */}
                                <div style={{ width:"32%", background:`${accentSidebar}ee`, padding:"8px 5px", display:"flex", flexDirection:"column", gap:"4px" }}>
                                  {/* Initials avatar */}
                                  <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.4)", margin:"0 auto 4px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"rgba(255,255,255,0.9)" }}>AK</div>
                                  {/* Name in sidebar */}
                                  <div style={{ height:2.5, width:"85%", background:"rgba(255,255,255,0.8)", borderRadius:1, margin:"0 auto" }}/>
                                  <div style={{ height:1.5, width:"55%", background:"rgba(255,255,255,0.5)", borderRadius:1, margin:"0 auto", marginBottom:3 }}/>
                                  {/* Contact */}
                                  <div style={{ height:1.5, width:"40%", background:"rgba(255,255,255,0.55)", borderRadius:1, marginBottom:2 }}/>
                                  {[5,4,4,5,4].map((_,i)=>(
                                    <div key={i} style={{ height:1.5, width:`${[80,65,75,55,70][i]}%`, background:"rgba(255,255,255,0.35)", borderRadius:1 }}/>
                                  ))}
                                  <div style={{ height:0.5, background:"rgba(255,255,255,0.2)", margin:"4px 0" }}/>
                                  {/* Skills label */}
                                  <div style={{ height:1.8, width:"55%", background:"rgba(255,255,255,0.6)", borderRadius:1, marginBottom:3 }}/>
                                  {[80,60,70,50,65].map((w,i)=>(
                                    <div key={i} style={{ width:"90%", height:3, background:"rgba(255,255,255,0.15)", borderRadius:2, marginBottom:2 }}>
                                      <div style={{ width:`${w}%`, height:"100%", background:"rgba(255,255,255,0.55)", borderRadius:2 }}/>
                                    </div>
                                  ))}
                                </div>
                                {/* Main content */}
                                <div style={{ flex:1, background:bg, padding:"6px 6px", display:"flex", flexDirection:"column", gap:"3px" }}>
                                  {/* Job title accent line */}
                                  <div style={{ height:2.5, width:"70%", background:textC, borderRadius:1, marginBottom:1 }}/>
                                  <div style={{ height:1.5, width:"45%", background:accentSidebar, borderRadius:1, marginBottom:4 }}/>
                                  {/* Summary lines */}
                                  {[95,88,92].map((w,i)=>(
                                    <div key={i} style={{ height:1.5, width:`${w}%`, background:"#e5e7eb", borderRadius:1 }}/>
                                  ))}
                                  <div style={{ height:0.5, background:lineC, margin:"4px 0" }}/>
                                  {/* Experience section */}
                                  <div style={{ height:2, width:"42%", background:accentSidebar, borderRadius:1, marginBottom:2 }}/>
                                  <div style={{ height:2, width:"55%", background:textC, borderRadius:1, marginBottom:1 }}/>
                                  <div style={{ height:1.5, width:"35%", background:mutedC, borderRadius:1, marginBottom:2 }}/>
                                  {[88,78,83,70].map((w,i)=>(
                                    <div key={i} style={{ height:1.5, width:`${w}%`, background:i===0?`${accentSidebar}55`:"#e5e7eb", borderRadius:1 }}/>
                                  ))}
                                  <div style={{ height:0.5, background:lineC, margin:"4px 0" }}/>
                                  <div style={{ height:2, width:"38%", background:accentSidebar, borderRadius:1, marginBottom:2 }}/>
                                  {[85,75].map((w,i)=>(
                                    <div key={i} style={{ height:1.5, width:`${w}%`, background:"#f0f0f0", borderRadius:1 }}/>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={tmpl.id} className="template-card"
                              onClick={() => setActiveTemplate(tmpl.id)}
                              style={{ cursor:"pointer", transition:"all 0.25s", position:"relative" }}>

                              {/* Card wrapper */}
                              <div style={{
                                height: "150px",
                                border: `2px solid ${isActive ? ac : t.border}`,
                                borderRadius: "10px",
                                overflow: "hidden",
                                marginBottom: "6px",
                                position: "relative",
                                background: bg,
                                boxShadow: isActive ? `0 0 0 2px ${ac}40, 0 4px 16px ${ac}20` : "0 2px 8px rgba(0,0,0,0.08)",
                                transition: "all 0.25s",
                              }}>
                                {/* Active checkmark */}
                                {isActive && (
                                  <div style={{ position:"absolute",top:5,right:5,background:ac,borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"white",zIndex:20,boxShadow:`0 2px 6px ${ac}60` }}>✓</div>
                                )}
                                {/* Category badge */}
                                <div style={{ position:"absolute",bottom:4,left:4,background:`${ac}ee`,color:"white",padding:"2px 6px",borderRadius:"3px",fontSize:"7px",fontWeight:"700",zIndex:10,letterSpacing:"0.3px" }}>
                                  {tmpl.category === "ATS Friendly" ? "ATS ✓" : tmpl.category === "Futuristic" ? "⚡ Futuristic" : tmpl.category === "With Photo" ? "📸 Photo" : "💼 Executive"}
                                </div>
                                {PreviewContent}
                              </div>

                              {/* Template name */}
                              <div style={{ textAlign:"center", fontSize:"9px", fontWeight:"600", color:isActive?ac:t.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                                {tmpl.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {filtered.length > 8 && (
                        <div style={{ textAlign:"center" }}>
                          <button onClick={() => setShowAllTemplates(p => !p)}
                            style={{ padding:"7px 20px", background:t.card, color:t.accent, border:`1px solid ${t.accent}33`, borderRadius:"8px", fontSize:"12px", cursor:"pointer", fontWeight:"600" }}>
                            {showAllTemplates ? `▲ Show Less` : `▼ View All ${filtered.length} Templates`}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Split Editor — responsive layout */}
              <div className="desktop-split" style={{ display: "flex", gap: "18px" }}>

                {/* LEFT — Form */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", overflow: "hidden" }}>
                  {/* Fix 5: Horizontal scrollable tab bar — all 10 sections always reachable */}
                  <div className="section-tabs-bar" style={{ display: "flex", borderBottom: `1px solid ${t.border}`, overflowX: "auto", flexWrap: "nowrap" }}>
                    {sections.map(s => {
                      const sc = {
                        personal: !!(resume.name && resume.email),
                        summary: !!(resume.summary?.trim()),
                        experience: (resume.experience||[]).some(e => e.company || e.role),
                        education: (resume.education||[]).some(e => e.school || e.degree || e.institution),
                        skills: (resume.skills||[]).length > 0,
                        projects: (resume.projects||[]).some(p => p.name),
                        certs: (resume.certifications||[]).some(c => c.name || c.title),
                        achievements: (resume.achievements||[]).some(a => a.title || a.text || a.description),
                        strengths: (resume.strengths||[]).length > 0,
                        extras: !!(resume.languages?.trim() || resume.interests?.trim() || (resume.hobbies||[]).length > 0),
                      };
                      const isActive = activeSection === s.id;
                      const isDone = sc[s.id];
                      return (
                        <button key={s.id} className="section-btn" onClick={() => setActiveSection(s.id)}
                          style={{ padding: "10px 11px", background: isActive ? `${t.accent}15` : "transparent", color: isActive ? t.accent : t.muted, border: "none", borderBottom: isActive ? `2px solid ${t.accent}` : "2px solid transparent", cursor: "pointer", fontSize: "10px", fontWeight: isActive ? "600" : "400", whiteSpace: "nowrap", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
                          {s.icon} {s.label}
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: isDone ? "#43D9A2" : t.border, flexShrink: 0, display: "inline-block", marginLeft: 2 }} />
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ padding: "16px", maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>

                    {/* PERSONAL */}
                    {activeSection === "personal" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text, marginBottom: "4px" }}>👤 Personal Information</h3>
                        {/* Photo warning for photo-supporting templates */}
                        {PHOTO_TEMPLATES.includes(template?.layout) && (
                          <div style={{ background: resume.photo ? "rgba(67,217,162,0.08)" : "rgba(255,179,71,0.08)", border: `1px solid ${resume.photo ? "rgba(67,217,162,0.3)" : "rgba(255,179,71,0.3)"}`, borderRadius: "10px", padding: "10px 14px", fontSize: "12px" }}>
                            {resume.photo ? (
                              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                                <img src={resume.photo} style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover" }} />
                                <div>
                                  <p style={{ color:"#43D9A2", fontWeight:"600", fontSize:"11px" }}>✓ Photo added — looking great!</p>
                                  <p style={{ color: t.muted, fontSize:"10px" }}>Clear the URL below to remove it.</p>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p style={{ color:"#FFB347", fontWeight:"600", fontSize:"11px", marginBottom:"4px" }}>📸 This template supports a profile photo</p>
                                <p style={{ color: t.muted, fontSize:"10px" }}>Add a photo URL below, or your initials (<strong style={{color:t.text}}>{(resume.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"AB"}</strong>) will be shown instead. Skipping both may make the resume look incomplete.</p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mobile-grid-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                          {[["Full Name", "name"], ["Job Title", "title"], ["Email", "email"], ["Phone", "phone"]].map(([ph, key]) => (
                            <input key={key} placeholder={ph} value={resume[key] || ""} onChange={e => updateResume(key, e.target.value)} style={inpStyle} />
                          ))}
                          <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", alignItems: "center" }}>
                            <div style={{ ...inpStyle, display: "flex", alignItems: "center", padding: "6px 12px", flex: 1, position: "relative" }}>
                              <span style={{ fontSize: "11px", color: t.muted, marginRight: "10px" }}>📷 Upload Photo</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={e => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateResume("photo", reader.result);
                                    reader.readAsDataURL(file);
                                  }
                                }} 
                                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                              />
                            </div>
                            {resume.photo && (
                              <button 
                                onClick={() => updateResume("photo", "")} 
                                style={{ padding: "8px 12px", background: "rgba(255,101,132,0.1)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "11px", fontWeight: "600", transition: "all 0.2s" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <input placeholder="City, Country" value={resume.location || ""} onChange={e => updateResume("location", e.target.value)} style={{ ...inpStyle, gridColumn: "span 2" }} />
                          <input placeholder="Date of Birth (e.g. 15 Jan 1995)" value={resume.dob || ""} onChange={e => updateResume("dob", e.target.value)} style={inpStyle} />
                          <input placeholder="LinkedIn URL" value={resume.linkedin || ""} onChange={e => updateResume("linkedin", e.target.value)} style={inpStyle} />
                          <textarea placeholder="Full Address" value={resume.address || ""} onChange={e => updateResume("address", e.target.value)} rows={2} style={{ ...inpStyle, gridColumn: "span 2", resize: "none" }} />
                          <input placeholder="Portfolio / Website URL" value={resume.website || ""} onChange={e => updateResume("website", e.target.value)} style={{ ...inpStyle, gridColumn: "span 2" }} />
                          {PHOTO_TEMPLATES.includes(template?.layout) && (
                            <div style={{ gridColumn: "span 2" }}>
                              <label style={{ color: t.muted, fontSize: "10px", display: "block", marginBottom: "4px" }}>📸 Profile Photo URL <span style={{ color: t.muted, fontWeight:"400" }}>(paste any image link)</span></label>
                              <input placeholder="https://example.com/photo.jpg" value={resume.photo || ""} onChange={e => updateResume("photo", e.target.value)} style={inpStyle} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUMMARY */}
                    {activeSection === "summary" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>📝 Professional Summary</h3>
                          <button onClick={() => improveSection("summary", resume.summary)} disabled={improving.summary || summaryCtxLoading}
                            style={{ padding: "4px 12px", background: improving.summary_done ? "rgba(67,217,162,0.15)" : "rgba(108,99,255,0.1)", color: improving.summary_done ? "#43D9A2" : "#A29BFE", border: `1px solid ${improving.summary_done ? "rgba(67,217,162,0.3)" : "rgba(108,99,255,0.2)"}`, borderRadius: "6px", fontSize: "10px", cursor: improving.summary ? "not-allowed" : "pointer", transition: "all 0.3s", fontWeight: "600" }}>
                            {improving.summary ? "⏳ Improving..." : improving.summary_done ? "✓ Improved!" : resume.summary?.trim() ? "✨ AI Improve" : "✨ AI Write Summary"}
                          </button>
                        </div>
                        <textarea placeholder="3-4 sentence professional summary highlighting your key skills, experience, and career goals..." value={resume.summary || ""} onChange={e => updateResume("summary", e.target.value)} rows={7} style={{ ...inpStyle, resize: "vertical" }} />
                        {/* Smart context panel — shown when summary is empty */}
                        {showSummaryCtx && (
                          <div style={{ marginTop: "12px", background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                              <p style={{ color: t.accent, fontWeight: "700", fontSize: "12px" }}>🤖 Help AI write your summary</p>
                              <button onClick={() => setShowSummaryCtx(false)} style={{ background: "none", border: "none", color: t.muted, cursor: "pointer", fontSize: "14px" }}>✕</button>
                            </div>
                            <p style={{ color: t.muted, fontSize: "11px", marginBottom: "10px" }}>Answer a few questions and AI will write a professional summary for you.</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div>
                                <label style={{ color: t.muted, fontSize: "10px", display: "block", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Your areas of interest / specialization *</label>
                                <input placeholder="e.g. Data Analysis, Machine Learning, Financial Modelling..." value={summaryCtx.interests} onChange={e => setSummaryCtx(p => ({ ...p, interests: e.target.value }))} style={inpStyle} />
                              </div>
                              <div>
                                <label style={{ color: t.muted, fontSize: "10px", display: "block", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Brief background / experience (optional)</label>
                                <textarea placeholder="e.g. 3 years in data analytics, worked with Python and SQL, led a team..." value={summaryCtx.experienceSummary} onChange={e => setSummaryCtx(p => ({ ...p, experienceSummary: e.target.value }))} rows={3} style={{ ...inpStyle, resize: "none" }} />
                              </div>
                              <div>
                                <label style={{ color: t.muted, fontSize: "10px", display: "block", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Job description to tailor to (optional)</label>
                                <textarea placeholder="Paste the job description here to make the summary more targeted..." value={summaryCtx.jobDescription} onChange={e => setSummaryCtx(p => ({ ...p, jobDescription: e.target.value }))} rows={3} style={{ ...inpStyle, resize: "none" }} />
                              </div>
                              <button onClick={generateSummaryFromContext} disabled={summaryCtxLoading || !summaryCtx.interests.trim()}
                                style={{ padding: "10px", background: summaryCtxLoading ? "#555" : "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: summaryCtxLoading || !summaryCtx.interests.trim() ? "not-allowed" : "pointer", opacity: !summaryCtx.interests.trim() ? 0.5 : 1 }}>
                                {summaryCtxLoading ? "⏳ Generating Summary..." : "✨ Generate My Summary"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* EXPERIENCE */}
                    {activeSection === "experience" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>💼 Work Experience</h3>
                          <button onClick={addExp} style={{ padding: "5px 10px", background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>+ Add Role</button>
                        </div>
                        {(resume.experience || []).map((exp, idx) => (
                          <div key={exp.id} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                              <span style={{ color: t.muted, fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Experience {idx + 1}</span>
                              <button onClick={() => removeExp(exp.id)} style={{ background: "none", border: "none", color: "#FF6584", cursor: "pointer", fontSize: "11px" }}>Remove</button>
                            </div>
                            <div className="mobile-grid-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                              <input placeholder="Company Name" value={exp.company || ""} onChange={e => updateExp(exp.id, "company", e.target.value)} style={inpStyle} />
                              <input placeholder="Job Title" value={exp.role || ""} onChange={e => updateExp(exp.id, "role", e.target.value)} style={inpStyle} />
                              <input placeholder="Location (e.g. Mumbai / Remote)" value={exp.location || ""} onChange={e => updateExp(exp.id, "location", e.target.value)} style={{ ...inpStyle, gridColumn: "span 2" }} />
                              <div>
                                <label style={{ color: t.muted, fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "3px" }}>From</label>
                                <input type="month" value={exp.from || ""} onChange={e => updateExp(exp.id, "from", e.target.value)} style={inpStyle} />
                              </div>
                              <div>
                                <label style={{ color: t.muted, fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "3px" }}>To</label>
                                {exp.current ? (
                                  <div style={{ padding: "9px 12px", background: "rgba(67,217,162,0.1)", border: "1px solid rgba(67,217,162,0.3)", borderRadius: "8px", fontSize: "11px", color: "#43D9A2", fontWeight: "600" }}>Currently Here ✓</div>
                                ) : (
                                  <input type="month" value={exp.to || ""} onChange={e => updateExp(exp.id, "to", e.target.value)} style={inpStyle} />
                                )}
                              </div>
                              <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                  <div onClick={() => updateExp(exp.id, "current", !exp.current)} style={{ width: "32px", height: "17px", borderRadius: "100px", background: exp.current ? "#43D9A2" : t.border, position: "relative", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}>
                                    <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: "white", position: "absolute", top: "2px", left: exp.current ? "17px" : "2px", transition: "all 0.2s" }} />
                                  </div>
                                  <span style={{ color: t.muted, fontSize: "11px" }}>Currently working here</span>
                                </label>
                              </div>
                            </div>
                            <div style={{ marginBottom: "7px" }}>
                              <label style={{ color: t.muted, fontSize: "10px", display: "block", marginBottom: "4px" }}>Key Responsibilities</label>
                              {(exp.responsibilities || [""]).map((r, rIdx) => (
                                <input key={rIdx} placeholder={`• Responsibility ${rIdx + 1}`} value={r} onChange={e => updateExpArr(exp.id, "responsibilities", rIdx, e.target.value)} style={{ ...inpStyle, marginBottom: "4px" }} />
                              ))}
                              <button onClick={() => updateExp(exp.id, "responsibilities", [...(exp.responsibilities || [""]), ""])} style={{ width: "100%", padding: "5px", background: "none", border: `1px dashed ${t.border}`, borderRadius: "6px", color: t.muted, cursor: "pointer", fontSize: "10px" }}>+ Add Responsibility</button>
                            </div>
                            <div>
                              <label style={{ color: t.muted, fontSize: "10px", display: "block", marginBottom: "4px" }}>Key Achievements (with numbers)</label>
                              {(exp.bullets || [""]).map((b, bIdx) => (
                                <input key={bIdx} placeholder={`• Achievement (e.g. Increased sales by 30%)`} value={b} onChange={e => updateExpArr(exp.id, "bullets", bIdx, e.target.value)} style={{ ...inpStyle, marginBottom: "4px" }} />
                              ))}
                              <button onClick={() => updateExp(exp.id, "bullets", [...(exp.bullets || [""]), ""])} style={{ width: "100%", padding: "5px", background: "none", border: `1px dashed ${t.border}`, borderRadius: "6px", color: t.muted, cursor: "pointer", fontSize: "10px" }}>+ Add Achievement</button>
                            </div>
                          </div>
                        ))}
                        {(resume.experience || []).length === 0 && (
                          <button onClick={addExp} style={{ width: "100%", padding: "14px", background: "none", border: `2px dashed ${t.border}`, borderRadius: "10px", color: t.muted, cursor: "pointer", fontSize: "13px" }}>+ Add Work Experience</button>
                        )}
                      </div>
                    )}

                    {/* EDUCATION */}
                    {activeSection === "education" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>🎓 Education</h3>
                          <button onClick={addEdu} style={{ padding: "5px 10px", background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>+ Add</button>
                        </div>
                        {(resume.education || []).map(edu => (
                          <div key={edu.id} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                            <div className="mobile-grid-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                              <input placeholder="University / Institution" value={edu.institution || ""} onChange={e => updateEdu(edu.id, "institution", e.target.value)} style={{ ...inpStyle, gridColumn: "span 2" }} />
                              <input placeholder="Degree (e.g. B.Tech, MBA)" value={edu.degree || ""} onChange={e => updateEdu(edu.id, "degree", e.target.value)} style={inpStyle} />
                              <input placeholder="Field of Study" value={edu.field || ""} onChange={e => updateEdu(edu.id, "field", e.target.value)} style={inpStyle} />
                              <input placeholder="Year (e.g. 2020-2024)" value={edu.year || ""} onChange={e => updateEdu(edu.id, "year", e.target.value)} style={inpStyle} />
                              <input placeholder="Grade / GPA / %" value={edu.grade || ""} onChange={e => updateEdu(edu.id, "grade", e.target.value)} style={inpStyle} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                              <button onClick={() => removeEdu(edu.id)} style={{ padding: "4px 10px", background: "rgba(255,101,132,0.08)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "7px", fontSize: "11px", cursor: "pointer" }} title="Delete education">🗑 Delete</button>
                            </div>
                          </div>
                        ))}
                        {(resume.education || []).length === 0 && (
                          <button onClick={addEdu} style={{ width: "100%", padding: "14px", background: "none", border: `2px dashed ${t.border}`, borderRadius: "10px", color: t.muted, cursor: "pointer", fontSize: "13px" }}>+ Add Education</button>
                        )}
                      </div>
                    )}

                    {/* SKILLS */}
                    {activeSection === "skills" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>⚡ Skills & Proficiency</h3>
                          <button onClick={addSkill} style={{ padding: "5px 10px", background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>+ Add Skill</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {(resume.skills || []).map(skill => (
                            <div key={skill.id} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
                              <input
                                placeholder="Skill name (e.g. Python)"
                                value={skill.name || ""}
                                onChange={e => updateSkillName(skill.id, e.target.value)}
                                style={{ ...inpStyle, flex: 1, minWidth: 0 }}
                              />
                              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                {[1,2,3,4,5].map(n => (
                                  <button key={n} onClick={() => updateSkillRating(skill.id, n)}
                                    title={["Beginner","Basic","Intermediate","Advanced","Expert"][n-1]}
                                    style={{ width: "20px", height: "20px", borderRadius: "50%", border: "none", cursor: "pointer", transition: "all 0.15s",
                                      background: n <= skill.rating ? t.accent : `${t.accent}25`,
                                      boxShadow: n <= skill.rating ? `0 0 6px ${t.accent}60` : "none" }} />
                                ))}
                              </div>
                              <span style={{ fontSize: "9px", color: t.muted, width: "60px", textAlign: "center", flexShrink: 0 }}>
                                {["Beginner","Basic","Intermediate","Advanced","Expert"][skill.rating-1] || ""}
                              </span>
                              <button onClick={() => removeSkill(skill.id)} style={{ background: "none", border: "none", color: "#FF6584", cursor: "pointer", fontSize: "13px", flexShrink: 0 }}>✕</button>
                            </div>
                          ))}
                          {(resume.skills || []).length === 0 && (
                            <button onClick={addSkill} style={{ width: "100%", padding: "14px", background: "none", border: `2px dashed ${t.border}`, borderRadius: "10px", color: t.muted, cursor: "pointer", fontSize: "13px" }}>+ Add your first skill</button>
                          )}
                        </div>
                        <p style={{ color: t.muted, fontSize: "10px", marginTop: "10px" }}>💡 Rate 1 = Beginner → 5 = Expert. Ratings show as visual dots on your resume.</p>
                        {/* Skills placement toggle for sidebar templates */}
                        {SIDEBAR_LAYOUTS.includes(template?.layout) && (
                          <div style={{ marginTop: "14px", padding: "10px 12px", background: `${t.accent}08`, border: `1px solid ${t.accent}25`, borderRadius: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <p style={{ color: t.text, fontSize: "12px", fontWeight: "600", marginBottom: "2px" }}>📐 Skills Position</p>
                                <p style={{ color: t.muted, fontSize: "10px" }}>Show skills in left sidebar or right main area?</p>
                              </div>
                              <div style={{ display: "flex", gap: "4px" }}>
                                {["sidebar", "main"].map(pos => {
                                  const current = (resume.sectionLayout || {}).skills || "sidebar";
                                  return (
                                    <button key={pos} onClick={() => updateSectionLayout("skills", pos)}
                                      style={{ padding: "5px 14px", borderRadius: "14px", border: `1px solid ${current === pos ? t.accent : t.border}`, background: current === pos ? `${t.accent}18` : "transparent", color: current === pos ? t.accent : t.muted, fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}>
                                      {pos === "sidebar" ? "◀ Left" : "Right ▶"}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PROJECTS */}
                    {activeSection === "projects" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>🚀 Projects</h3>
                          <button onClick={addProject} style={{ padding: "5px 10px", background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>+ Add Project</button>
                        </div>
                        {(resume.projects || []).map(proj => (
                          <div key={proj.id} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <input placeholder="Project Name" value={proj.name || ""} onChange={e => updateProject(proj.id, "name", e.target.value)} style={inpStyle} />
                              <textarea placeholder="Description — what it does, the problem it solved, the impact..." value={proj.description || ""} onChange={e => updateProject(proj.id, "description", e.target.value)} rows={3} style={{ ...inpStyle, resize: "vertical" }} />
                              <input placeholder="Technologies (e.g. React, Python, AWS)" value={proj.tech || ""} onChange={e => updateProject(proj.id, "tech", e.target.value)} style={inpStyle} />
                              <input placeholder="Link / GitHub URL (optional)" value={proj.link || ""} onChange={e => updateProject(proj.id, "link", e.target.value)} style={inpStyle} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                              <button onClick={() => removeProject(proj.id)} style={{ padding: "4px 10px", background: "rgba(255,101,132,0.08)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "7px", fontSize: "11px", cursor: "pointer" }} title="Delete project">🗑 Delete</button>
                            </div>
                          </div>
                        ))}
                        {(resume.projects || []).length === 0 && (
                          <button onClick={addProject} style={{ width: "100%", padding: "14px", background: "none", border: `2px dashed ${t.border}`, borderRadius: "10px", color: t.muted, cursor: "pointer", fontSize: "13px" }}>+ Add Project</button>
                        )}
                      </div>
                    )}

                    {/* CERTIFICATIONS */}
                    {activeSection === "certs" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>📜 Certifications</h3>
                          <button onClick={addCert} style={{ padding: "5px 10px", background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>+ Add</button>
                        </div>
                        {(resume.certifications || []).map(cert => (
                          <div key={cert.id} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "10px", marginBottom: "8px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "6px" }}>
                              <input placeholder="Certification Name" value={cert.name || ""} onChange={e => updateCert(cert.id, "name", e.target.value)} style={inpStyle} />
                              <input placeholder="Issuer (e.g. Coursera)" value={cert.issuer || ""} onChange={e => updateCert(cert.id, "issuer", e.target.value)} style={inpStyle} />
                              <input placeholder="Year" value={cert.year || ""} onChange={e => updateCert(cert.id, "year", e.target.value)} style={inpStyle} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                              <button onClick={() => removeCert(cert.id)} style={{ padding: "4px 10px", background: "rgba(255,101,132,0.08)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "7px", fontSize: "11px", cursor: "pointer" }} title="Delete certification">🗑 Delete</button>
                            </div>
                          </div>
                        ))}
                        {(resume.certifications || []).length === 0 && (
                          <button onClick={addCert} style={{ width: "100%", padding: "14px", background: "none", border: `2px dashed ${t.border}`, borderRadius: "10px", color: t.muted, cursor: "pointer", fontSize: "13px" }}>+ Add Certification</button>
                        )}
                      </div>
                    )}

                    {/* ACHIEVEMENTS */}
                    {activeSection === "achievements" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>🏆 Achievements & Awards</h3>
                          <button onClick={addAchievement} style={{ padding: "5px 10px", background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>+ Add</button>
                        </div>
                        {(resume.achievements || []).map(ach => (
                          <div key={ach.id} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
                            <input placeholder="e.g. Employee of the Month — TCS (March 2023)" value={ach.text || ""} onChange={e => updateAchievement(ach.id, e.target.value)} style={{ ...inpStyle, flex: 1 }} />
                            <button onClick={() => removeAchievement(ach.id)} style={{ padding: "6px 9px", background: "rgba(255,101,132,0.08)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "7px", fontSize: "12px", cursor: "pointer", flexShrink: 0 }} title="Delete">✕</button>
                          </div>
                        ))}
                        {(resume.achievements || []).length === 0 && (
                          <button onClick={addAchievement} style={{ width: "100%", padding: "14px", background: "none", border: `2px dashed ${t.border}`, borderRadius: "10px", color: t.muted, cursor: "pointer", fontSize: "13px" }}>+ Add Achievement</button>
                        )}
                      </div>
                    )}

                    {/* STRENGTHS */}
                    {activeSection === "strengths" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>💪 Core Strengths</h3>
                          <button onClick={addStrength} style={{ padding: "5px 12px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "7px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>+ Add Strength</button>
                        </div>
                        <p style={{ color: t.muted, fontSize: "11px", marginTop: "-6px" }}>List your key strengths as bullet points — keep them concise and impactful.</p>
                        {(resume.strengths || []).length === 0 && (
                          <div style={{ background: t.inputBg, border: `1px dashed ${t.border}`, borderRadius: "10px", padding: "20px", textAlign: "center" }}>
                            <p style={{ color: t.muted, fontSize: "12px" }}>No strengths added yet. Click <strong style={{ color: t.accent }}>+ Add Strength</strong> to begin.</p>
                          </div>
                        )}
                        {(resume.strengths || []).map((s, idx) => (
                          <div key={s.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ color: t.accent, fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>▸</span>
                            <input
                              placeholder={`e.g. Strong analytical and problem-solving skills`}
                              value={s.text}
                              onChange={e => updateStrength(s.id, e.target.value)}
                              style={{ ...inpStyle, flex: 1 }}
                            />
                            <button onClick={() => removeStrength(s.id)} style={{ padding: "6px 9px", background: "rgba(255,101,132,0.08)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "7px", fontSize: "12px", cursor: "pointer", flexShrink: 0 }} title="Remove">✕</button>
                          </div>
                        ))}
                        {(resume.strengths || []).length > 0 && (
                          <p style={{ color: t.muted, fontSize: "10px", marginTop: "4px" }}>💡 Tip: 3–6 strengths is ideal. Keep each under 10 words for best readability.</p>
                        )}
                      </div>
                    )}

                    {/* EXTRAS */}
                    {activeSection === "extras" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "14px", fontWeight: "600", color: t.text }}>🌟 Additional Info</h3>
                        {[["Languages", "languages", "e.g. English (Fluent), Hindi (Native), French (Basic)"],
                          ["Interests", "interests", "e.g. Data Science, Chess, Photography, Reading"],
                          ["Other Information", "other", "Anything else you want to include..."]].map(([label, key, ph]) => (
                          <div key={key}>
                            <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>{label}</label>
                            <textarea placeholder={ph} value={resume[key] || ""} onChange={e => updateResume(key, e.target.value)} rows={2} style={{ ...inpStyle, resize: "vertical" }} />
                          </div>
                        ))}

                        {/* SECTION PLACEMENT TOGGLE — only for sidebar templates */}
                        {SIDEBAR_LAYOUTS.includes(template?.layout) && (
                          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "14px" }}>
                            <div style={{ marginBottom: "10px" }}>
                              <p style={{ color: t.text, fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>📐 Section Placement</p>
                              <p style={{ color: t.muted, fontSize: "10px" }}>Choose where each section appears in the resume layout.</p>
                            </div>
                            {[
                              ["skills",         "Skills"],
                              ["languages",      "Languages"],
                              ["interests",      "Interests"],
                              ["hobbies",        "Hobbies"],
                              ["strengths",      "Strengths"],
                              ["certifications", "Certifications"],
                              ["achievements",   "Achievements"],
                            ].map(([key, label]) => {
                              const current = (resume.sectionLayout || {})[key] || (key === "achievements" ? "main" : "sidebar");
                              return (
                                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: t.inputBg, borderRadius: "8px", marginBottom: "5px" }}>
                                  <span style={{ color: t.text, fontSize: "12px" }}>{label}</span>
                                  <div style={{ display: "flex", gap: "4px" }}>
                                    {["sidebar", "main"].map(pos => (
                                      <button key={pos} onClick={() => updateSectionLayout(key, pos)}
                                        style={{ padding: "3px 12px", borderRadius: "14px", border: `1px solid ${current === pos ? t.accent : t.border}`, background: current === pos ? `${t.accent}18` : "transparent", color: current === pos ? t.accent : t.muted, fontSize: "10px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}>
                                        {pos === "sidebar" ? "◀ Left" : "Right ▶"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* HOBBIES SECTION */}
                        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <div>
                              <p style={{ color: t.text, fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>🎯 Hobbies & Interests</p>
                              <p style={{ color: t.muted, fontSize: "10px" }}>Optional emoji icons available — user's choice!</p>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              {["Yes", "No"].map(opt => (
                                <button key={opt} onClick={() => {
                                  if (opt === "No") setResume(prev => ({ ...prev, hobbies: [] }));
                                  else if ((resume.hobbies || []).length === 0) addHobby();
                                }} style={{ padding: "5px 14px", borderRadius: "20px", border: `1px solid ${(opt === "Yes" ? (resume.hobbies||[]).length > 0 : (resume.hobbies||[]).length === 0) ? t.accent : t.border}`, background: (opt === "Yes" ? (resume.hobbies||[]).length > 0 : (resume.hobbies||[]).length === 0) ? `${t.accent}18` : "transparent", color: (opt === "Yes" ? (resume.hobbies||[]).length > 0 : (resume.hobbies||[]).length === 0) ? t.accent : t.muted, fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>{opt}</button>
                              ))}
                            </div>
                          </div>

                          {(resume.hobbies || []).length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {(resume.hobbies || []).map(h => (
                                <div key={h.id} style={{ position: "relative" }}>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    {/* Emoji Button */}
                                    <button
                                      onClick={() => setOpenEmojiPickerId(openEmojiPickerId === h.id ? null : h.id)}
                                      title="Pick an icon (optional)"
                                      style={{ width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${t.border}`, background: t.inputBg, fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
                                    >{h.icon || "+"}</button>
                                    <input
                                      placeholder="Hobby name (e.g. Cricket)"
                                      value={h.name}
                                      onChange={e => updateHobby(h.id, "name", e.target.value)}
                                      style={{ ...inpStyle, flex: 1 }}
                                    />
                                    <button onClick={() => removeHobby(h.id)} style={{ padding: "6px 9px", background: "rgba(255,101,132,0.08)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "7px", fontSize: "12px", cursor: "pointer", flexShrink: 0 }}>✕</button>
                                  </div>
                                  {/* Inline Emoji Picker */}
                                  {openEmojiPickerId === h.id && (
                                    <div style={{ position: "absolute", top: "42px", left: 0, zIndex: 200, background: t.sidebar, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", width: "260px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <p style={{ color: t.muted, fontSize: "10px", fontWeight: "600" }}>Pick an icon (optional)</p>
                                        <button onClick={() => { updateHobby(h.id, "icon", ""); setOpenEmojiPickerId(null); }} style={{ color: t.muted, background: "none", border: "none", fontSize: "10px", cursor: "pointer" }}>Clear</button>
                                      </div>
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "4px" }}>
                                        {HOBBY_EMOJIS.map(e => (
                                          <button
                                            key={e.icon}
                                            title={e.label}
                                            onClick={() => { updateHobby(h.id, "icon", e.icon); setOpenEmojiPickerId(null); }}
                                            style={{ width: "28px", height: "28px", borderRadius: "6px", border: `1px solid ${h.icon === e.icon ? t.accent : "transparent"}`, background: h.icon === e.icon ? `${t.accent}20` : "transparent", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                                          >{e.icon}</button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              <button onClick={addHobby} style={{ padding: "7px 14px", background: "transparent", border: `1px dashed ${t.accent}`, color: t.accent, borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontWeight: "600", alignSelf: "flex-start" }}>+ Add Hobby</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* BOTTOM — A4 Preview (full width, no horizontal scroll) */}
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ color: t.muted, fontSize: "12px" }}>📄 Live Preview — {template?.name}</span>
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", borderRadius: "7px", overflow: "hidden" }}>
                        <button onClick={exportPDF} disabled={pdfLoading} style={{ padding: "5px 12px", background: pdfLoading ? "#555" : "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", fontSize: "11px", fontWeight: "600", cursor: pdfLoading ? "not-allowed" : "pointer", borderRadius: "7px 0 0 7px" }}>{pdfLoading ? "⏳..." : "📥 PDF"}</button>
                        <button onClick={() => setShowDownloadMenu(v => !v)} style={{ padding: "5px 8px", background: "linear-gradient(135deg,#5a53d4,#d95471)", color: "white", border: "none", borderLeft: "1px solid rgba(255,255,255,0.2)", fontSize: "11px", cursor: "pointer", borderRadius: "0 7px 7px 0" }}>▾</button>
                      </div>
                      {showDownloadMenu && (
                        <div style={{ position: "absolute", top: "34px", right: 0, zIndex: 300, background: t.sidebar, border: `1px solid ${t.border}`, borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", minWidth: "175px", overflow: "hidden" }}>
                          <button onClick={() => { exportPDF(); setShowDownloadMenu(false); }} style={{ width: "100%", padding: "9px 12px", background: "none", border: "none", color: t.text, fontSize: "11px", cursor: "pointer", textAlign: "left" }}>📄 PDF — Best quality</button>
                          <div style={{ height: "1px", background: t.border }} />
                          <button onClick={() => { exportWord(); setShowDownloadMenu(false); }} style={{ width: "100%", padding: "9px 12px", background: "none", border: "none", color: t.text, fontSize: "11px", cursor: "pointer", textAlign: "left" }}>📝 Word (.doc) — Editable</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* A4 preview — scaled to fit, no horizontal scroll */}
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "16px", overflow: "visible" }}>
                    <ScaledPreview resume={resume} template={template} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── IMPORT SUCCESS TOAST ── */}
          {importSuccess && (
            <div style={{ position:"fixed", bottom:24, right:24, background:"#43D9A2", color:"#fff", padding:"14px 22px", borderRadius:"14px", fontWeight:"700", fontSize:"14px", boxShadow:"0 8px 32px rgba(67,217,162,0.4)", zIndex:99999, display:"flex", alignItems:"center", gap:"10px", animation:"slideIn 0.3s ease" }}>
              ✅ Resume imported! All fields populated — review and polish.
            </div>
          )}

          {/* ── IMPORT PREVIEW MODAL ── */}
          {(importPreview || uploadError) && (
            <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.82)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"16px", backdropFilter:"blur(4px)" }}>
              <div style={{ background:t.bg, borderRadius:"20px", border:`1.5px solid ${t.border}`, width:"100%", maxWidth:"760px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.6)" }}>

                {uploadError ? (
                  /* Error State */
                  <div style={{ padding:"40px", textAlign:"center" }}>
                    <div style={{ fontSize:"52px", marginBottom:"16px" }}>❌</div>
                    <h2 style={{ fontSize:"22px", fontWeight:"700", color:t.text, margin:"0 0 12px" }}>Import Failed</h2>
                    <p style={{ color:t.muted, fontSize:"14px", lineHeight:"1.7", marginBottom:"28px" }}>{uploadError}</p>
                    <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
                      <button onClick={dismissImport} style={{ padding:"11px 28px", background:`linear-gradient(135deg,${t.accent},#FF6584)`, color:"white", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:"700", cursor:"pointer" }}>Try Again</button>
                    </div>
                  </div>
                ) : importPreview ? (() => {
                  const meta = importPreview._importMetadata || {};
                  const cap  = importPreview._captureSummary || { captured:[], missing:[], captureRate: meta?.quality?.overall || 0 };
                  const q    = meta.quality || {};
                  const captureRate = cap.captureRate || 0;

                  return (
                    <>
                      {/* Header */}
                      <div style={{ padding:"28px 28px 20px", borderBottom:`1px solid ${t.border}`, background:`linear-gradient(135deg, ${t.accent}10, transparent)`, borderRadius:"20px 20px 0 0" }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px" }}>
                          <div>
                            <h2 style={{ fontFamily:"'Noto Serif',serif", fontSize:"24px", fontWeight:"700", color:t.text, margin:"0 0 6px" }}>📄 Resume Analysis Complete</h2>
                            <p style={{ color:t.muted, fontSize:"13px", margin:0 }}>AI extracted every detail from your resume. Review what was captured below.</p>
                          </div>
                          <button onClick={dismissImport} style={{ background:"transparent", border:`1px solid ${t.border}`, color:t.muted, borderRadius:"8px", padding:"6px 12px", fontSize:"12px", cursor:"pointer", flexShrink:0 }}>✕ Cancel</button>
                        </div>

                        {/* Capture Rate Meter */}
                        <div style={{ marginTop:"20px", display:"flex", alignItems:"center", gap:"20px", background:t.card, borderRadius:"14px", padding:"16px 20px", border:`1px solid ${t.border}` }}>
                          {/* Ring indicator */}
                          <div style={{ position:"relative", width:64, height:64, flexShrink:0 }}>
                            <svg width="64" height="64" style={{ transform:"rotate(-90deg)" }}>
                              <circle cx="32" cy="32" r="26" fill="none" stroke={t.border} strokeWidth="5"/>
                              <circle cx="32" cy="32" r="26" fill="none"
                                stroke={captureRate >= 80 ? "#43D9A2" : captureRate >= 55 ? "#FFB347" : "#FF6B6B"}
                                strokeWidth="5"
                                strokeDasharray={`${2*Math.PI*26}`}
                                strokeDashoffset={`${2*Math.PI*26*(1-captureRate/100)}`}
                                strokeLinecap="round"/>
                            </svg>
                            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", color: captureRate>=80?"#43D9A2":captureRate>=55?"#FFB347":"#FF6B6B" }}>{captureRate}%</div>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:"16px", fontWeight:"700", color:t.text, marginBottom:"4px" }}>
                              {captureRate >= 80 ? "🎉 Excellent capture!" : captureRate >= 55 ? "👍 Good — a few fields missing" : "⚠️ Low capture — check resume format"}
                            </div>
                            <div style={{ fontSize:"13px", color:t.muted }}>
                              <strong style={{color:"#43D9A2"}}>{cap.captured.length} fields captured</strong>
                              {cap.missing.length > 0 && <> &nbsp;·&nbsp; <strong style={{color:"#FF8787"}}>{cap.missing.length} fields missing</strong></>}
                            </div>
                          </div>
                          {/* Quick sub-scores */}
                          <div style={{ display:"flex", gap:"12px" }}>
                            {[["Personal", q.personal], ["Experience", q.experience], ["Skills", q.skills]].map(([label, score]) => (
                              <div key={label} style={{ textAlign:"center", minWidth:"52px" }}>
                                <div style={{ fontSize:"15px", fontWeight:"700", color: (score||0)>=75?"#43D9A2":(score||0)>=40?"#FFB347":"#888" }}>{score||0}%</div>
                                <div style={{ fontSize:"9px", color:t.muted, textTransform:"uppercase" }}>{label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Body — scrollable */}
                      <div style={{ padding:"24px 28px", overflowY:"auto" }}>

                        {/* ── Captured vs Missing grid ── */}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"24px" }}>

                          {/* Captured */}
                          <div style={{ background:"rgba(67,217,162,0.06)", border:"1px solid rgba(67,217,162,0.2)", borderRadius:"12px", padding:"16px" }}>
                            <p style={{ fontSize:"11px", fontWeight:"700", color:"#43D9A2", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"10px" }}>✅ Captured ({cap.captured.length})</p>
                            <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                              {cap.captured.map((field, i) => (
                                <div key={i} style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                                  <span style={{ color:"#43D9A2", fontSize:"11px", flexShrink:0 }}>✓</span>
                                  <span style={{ fontSize:"12px", color:t.text }}>{field}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Missing */}
                          <div style={{ background: cap.missing.length > 0 ? "rgba(255,107,107,0.06)" : "rgba(67,217,162,0.04)", border:`1px solid ${cap.missing.length > 0 ? "rgba(255,107,107,0.2)" : "rgba(67,217,162,0.15)"}`, borderRadius:"12px", padding:"16px" }}>
                            <p style={{ fontSize:"11px", fontWeight:"700", color: cap.missing.length > 0 ? "#FF8787" : "#43D9A2", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"10px" }}>
                              {cap.missing.length > 0 ? `⚠️ Missing (${cap.missing.length}) — add manually` : "🎉 Nothing missing!"}
                            </p>
                            {cap.missing.length > 0 ? (
                              <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                                {cap.missing.map((field, i) => (
                                  <div key={i} style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                                    <span style={{ color:"#FF8787", fontSize:"11px", flexShrink:0 }}>✗</span>
                                    <span style={{ fontSize:"12px", color:t.muted }}>{field}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color:t.muted, fontSize:"12px" }}>All detected fields were successfully extracted.</p>
                            )}
                          </div>
                        </div>

                        {/* ── Extracted Data Detail ── */}
                        {/* Personal info row */}
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"18px" }}>
                          {[["Name", importPreview.name],["Job Title", importPreview.title],["Email", importPreview.email],["Phone", importPreview.phone],["Location", importPreview.location],["LinkedIn", importPreview.linkedin]].map(([label,val]) => val ? (
                            <div key={label} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"10px", padding:"10px 12px" }}>
                              <div style={{ fontSize:"9px", color:t.muted, fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:"3px" }}>{label}</div>
                              <div style={{ fontSize:"12px", color:t.text, fontWeight:"600", wordBreak:"break-all" }}>{val}</div>
                            </div>
                          ) : null)}
                        </div>

                        {/* Experience */}
                        {importPreview.experience?.length > 0 && (
                          <div style={{ marginBottom:"18px" }}>
                            <p style={{ fontSize:"12px", fontWeight:"700", color:t.accent, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"10px" }}>
                              💼 Work Experience ({importPreview.experience.length} entries extracted)
                            </p>
                            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                              {importPreview.experience.map((exp, i) => (
                                <div key={i} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"10px", padding:"12px 14px" }}>
                                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"4px" }}>
                                    <div>
                                      <span style={{ fontSize:"13px", fontWeight:"700", color:t.text }}>{exp.role || "Role not detected"}</span>
                                      <span style={{ fontSize:"12px", color:t.muted }}> @ {exp.company || "Company"}</span>
                                    </div>
                                    <span style={{ fontSize:"10px", color:t.muted, whiteSpace:"nowrap", marginLeft:"8px" }}>
                                      {exp.from || "?"} → {exp.current ? "Present" : (exp.to || "?")}
                                    </span>
                                  </div>
                                  {(exp.responsibilities?.length > 0 || exp.bullets?.length > 0) && (
                                    <div style={{ marginTop:"6px", fontSize:"11px", color:t.muted, lineHeight:"1.6" }}>
                                      {[...(exp.responsibilities||[]).slice(0,2), ...(exp.bullets||[]).slice(0,1)].map((b,bi) => (
                                        <div key={bi}>• {b}</div>
                                      ))}
                                      {(exp.responsibilities?.length + exp.bullets?.length) > 3 && <div style={{color:t.accent}}>+ {(exp.responsibilities?.length||0)+(exp.bullets?.length||0)-3} more bullets</div>}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {importPreview.education?.length > 0 && (
                          <div style={{ marginBottom:"18px" }}>
                            <p style={{ fontSize:"12px", fontWeight:"700", color:t.accent, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"10px" }}>
                              🎓 Education ({importPreview.education.length} entries extracted)
                            </p>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                              {importPreview.education.map((edu, i) => (
                                <div key={i} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:"10px", padding:"12px 14px" }}>
                                  <div style={{ fontSize:"13px", fontWeight:"700", color:t.text }}>{edu.degree} {edu.field ? `in ${edu.field}` : ""}</div>
                                  <div style={{ fontSize:"11px", color:t.muted, marginTop:"3px" }}>{edu.institution}</div>
                                  {(edu.year || edu.grade) && <div style={{ fontSize:"10px", color:t.accent, marginTop:"3px" }}>{edu.year}{edu.grade ? ` · ${edu.grade}` : ""}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        {importPreview.skills?.length > 0 && (
                          <div style={{ marginBottom:"18px" }}>
                            <p style={{ fontSize:"12px", fontWeight:"700", color:t.accent, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"10px" }}>
                              🛠 Skills ({importPreview.skills.length} extracted)
                            </p>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                              {importPreview.skills.map((skill, i) => (
                                <span key={i} style={{ background:`${t.accent}18`, color:t.accent, border:`1px solid ${t.accent}30`, padding:"4px 10px", borderRadius:"6px", fontSize:"11px", fontWeight:"600" }}>
                                  {skill.name} {"★".repeat(skill.rating || 3)}{"☆".repeat(5-(skill.rating||3))}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Job Description Input */}
                        <div style={{ background:`${t.accent}08`, border:`1px solid ${t.accent}25`, borderRadius:"12px", padding:"16px", marginBottom:"16px" }}>
                          <p style={{ fontSize:"12px", fontWeight:"700", color:t.accent, marginBottom:"6px" }}>🎯 Job Description (Optional — for tailored resume)</p>
                          <p style={{ fontSize:"11px", color:t.muted, marginBottom:"10px" }}>Paste the job description so our AI can cross-match your skills and highlight the most relevant experience.</p>
                          <textarea
                            value={uploadJobDesc}
                            onChange={e => setUploadJobDesc(e.target.value)}
                            placeholder="Paste the job description here for a perfectly tailored resume..."
                            rows={4}
                            style={{ width:"100%", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"8px", padding:"10px 12px", fontSize:"12px", color:t.text, resize:"vertical", fontFamily:"'DM Sans',sans-serif", outline:"none" }}
                          />
                          {uploadJobDesc && (
                            <p style={{ fontSize:"11px", color:"#43D9A2", marginTop:"6px" }}>✓ Job description added — AI will optimise your resume for this role</p>
                          )}
                        </div>

                        {/* Issues / Warnings */}
                        {(meta.issues?.length > 0 || meta.warnings?.length > 0) && (
                          <div style={{ marginBottom:"16px" }}>
                            {meta.issues?.length > 0 && (
                              <div style={{ background:"#FF6B6B15", border:"1px solid #FF6B6B30", borderRadius:"10px", padding:"12px 14px", marginBottom:"8px" }}>
                                {meta.issues.map((issue, i) => <p key={i} style={{ color:"#FF8787", fontSize:"12px", margin:i>0?"4px 0 0":0 }}>{issue}</p>)}
                              </div>
                            )}
                            {meta.warnings?.length > 0 && (
                              <div style={{ background:"#FFB34715", border:"1px solid #FFB34730", borderRadius:"10px", padding:"12px 14px" }}>
                                {meta.warnings.map((warn, i) => <p key={i} style={{ color:"#FFC478", fontSize:"12px", margin:i>0?"4px 0 0":0 }}>{warn}</p>)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Buttons */}
                      <div style={{ padding:"20px 28px", borderTop:`1px solid ${t.border}`, display:"flex", gap:"12px", justifyContent:"space-between", alignItems:"center", background:t.card, borderRadius:"0 0 20px 20px" }}>
                        <p style={{ fontSize:"12px", color:t.muted, margin:0 }}>
                          {cap.missing.length > 0 ? `After importing, go to each section to fill in the ${cap.missing.length} missing field(s).` : "Everything looks great — ready to build your resume!"}
                        </p>
                        <div style={{ display:"flex", gap:"10px" }}>
                          <button onClick={dismissImport} style={{ padding:"10px 20px", background:"transparent", color:t.muted, border:`1px solid ${t.border}`, borderRadius:"10px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Cancel</button>
                          <button onClick={confirmImport} style={{ padding:"10px 28px", background:`linear-gradient(135deg,${t.accent},#FF6584)`, color:"white", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:"700", cursor:"pointer", boxShadow:`0 4px 16px ${t.accent}40` }}>
                            ✓ Import & Build Resume
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })() : null}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL (replaces window.confirm)
      ══════════════════════════════════════════════════════════ */}
      {deleteModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 99998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
          onClick={() => setDeleteModal({ open: false, id: null, bulk: false, count: 0 })}>
          <div onClick={e => e.stopPropagation()} style={{ background: t.sidebar, border: `1px solid ${t.border}`, borderRadius: "18px", padding: "28px 32px", maxWidth: "380px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🗑️</div>
            <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "18px", fontWeight: "700", color: t.text, marginBottom: "8px" }}>
              {deleteModal.bulk ? `Delete ${deleteModal.count} Resume${deleteModal.count > 1 ? "s" : ""}?` : "Delete This Resume?"}
            </h3>
            <p style={{ color: t.muted, fontSize: "13px", marginBottom: "22px", lineHeight: "1.5" }}>
              {deleteModal.bulk
                ? `You are about to permanently delete ${deleteModal.count} selected resume${deleteModal.count > 1 ? "s" : ""}. This cannot be undone.`
                : "This resume will be permanently deleted. This action cannot be undone."}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setDeleteModal({ open: false, id: null, bulk: false, count: 0 })}
                style={{ flex: 1, padding: "11px", background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmDelete}
                style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#FF6584,#ff3355)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(255,101,132,0.4)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          GRAMMAR & SPELL CHECK PANEL (slide-in drawer)
      ══════════════════════════════════════════════════════════ */}
      {grammarPanel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99997, display: "flex", justifyContent: "flex-end" }}
          onClick={() => setGrammarPanel(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "380px", height: "100vh", background: t.sidebar, borderLeft: `1px solid ${t.border}`, boxShadow: "-8px 0 40px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {/* Header */}
            <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: t.sidebar, zIndex: 2 }}>
              <div>
                <p style={{ fontFamily: "'Noto Serif',serif", fontSize: "16px", fontWeight: "700", color: t.text }}>🔤 Spelling & Grammar</p>
                <p style={{ color: t.muted, fontSize: "11px" }}>
                  {grammarDone ? "All done!" : grammarResults.length === 0 ? "✅ No issues found" : `${grammarResults.length - grammarIndex} of ${grammarResults.length} suggestion${grammarResults.length > 1 ? "s" : ""} remaining`}
                </p>
              </div>
              <button onClick={() => setGrammarPanel(false)} style={{ background: t.card, border: `1px solid ${t.border}`, color: t.muted, borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "14px" }}>✕</button>
            </div>

            <div style={{ padding: "16px", flex: 1 }}>
              {/* No issues */}
              {grammarResults.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                  <p style={{ color: "#43D9A2", fontWeight: "700", fontSize: "16px", marginBottom: "6px" }}>Looks great!</p>
                  <p style={{ color: t.muted, fontSize: "13px" }}>No spelling or grammar issues were found in your resume.</p>
                </div>
              )}

              {/* Current correction card (one-by-one mode) */}
              {grammarResults.length > 0 && !grammarDone && (
                <div>
                  {/* Progress */}
                  <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
                    {grammarResults.map((_, i) => (
                      <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i < grammarIndex ? "#43D9A2" : i === grammarIndex ? t.accent : t.border, transition: "all 0.3s" }} />
                    ))}
                  </div>

                  {/* Current item */}
                  <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
                    <p style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{grammarResults[grammarIndex]?.field_label}</p>
                    <div style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
                      <p style={{ color: t.muted, fontSize: "9px", marginBottom: "3px" }}>❌ ORIGINAL</p>
                      <p style={{ color: "#FF8787", fontSize: "12px", lineHeight: "1.5" }}>{grammarResults[grammarIndex]?.original}</p>
                    </div>
                    <div style={{ background: "rgba(67,217,162,0.08)", border: "1px solid rgba(67,217,162,0.2)", borderRadius: "8px", padding: "10px" }}>
                      <p style={{ color: t.muted, fontSize: "9px", marginBottom: "3px" }}>✅ CORRECTED</p>
                      <p style={{ color: "#43D9A2", fontSize: "12px", lineHeight: "1.5" }}>{grammarResults[grammarIndex]?.corrected}</p>
                    </div>
                  </div>

                  {/* Accept / Ignore buttons */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <button onClick={acceptGrammarChange}
                      style={{ flex: 1, padding: "10px", background: "rgba(67,217,162,0.15)", color: "#43D9A2", border: "1px solid rgba(67,217,162,0.3)", borderRadius: "9px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>✅ Accept</button>
                    <button onClick={ignoreGrammarChange}
                      style={{ flex: 1, padding: "10px", background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>⏭ Ignore</button>
                  </div>

                  {/* Do All */}
                  <button onClick={applyAllGrammarChanges}
                    style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "9px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>⚡ Apply All {grammarResults.length} Changes at Once</button>
                </div>
              )}

              {/* Done state */}
              {grammarDone && (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎉</div>
                  <p style={{ color: "#43D9A2", fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>All done!</p>
                  <p style={{ color: t.muted, fontSize: "12px" }}>All suggestions have been reviewed. Your resume looks polished!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SCALED PREVIEW — fits any width without horizontal scroll, shows ALL pages ──
function ScaledPreview({ resume, template }) {
  const containerRef = React.useRef(null);
  const contentRef   = React.useRef(null);
  const [scale, setScale]           = React.useState(0.5);
  const [contentHeight, setContentHeight] = React.useState(1123);
  const A4_W = 794; // px at 96dpi

  // Update scale whenever the container resizes
  React.useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      const w = containerRef.current.offsetWidth;
      setScale(w / A4_W);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Measure actual rendered height of the resume content (may be >1123px for multi-page)
  React.useEffect(() => {
    if (!contentRef.current) return;
    const updateHeight = () => {
      const h = contentRef.current.scrollHeight || contentRef.current.offsetHeight;
      if (h > 0) setContentHeight(h);
    };
    // Give React a tick to finish rendering, then measure
    const timer = setTimeout(updateHeight, 100);
    const ro = new ResizeObserver(updateHeight);
    ro.observe(contentRef.current);
    return () => { clearTimeout(timer); ro.disconnect(); };
  }, [resume, template]);

  const scaledH = Math.round(contentHeight * scale);

  return (
    <div ref={containerRef} style={{ width: "100%", overflow: "visible", borderRadius: "4px" }}>
      {/* Outer div height matches scaled content so nothing is clipped */}
      <div style={{ position: "relative", height: scaledH, overflow: "visible" }}>
        <div
          ref={contentRef}
          style={{ width: A4_W + "px", transform: `scale(${scale})`, transformOrigin: "top left", background: "white" }}
        >
          <TemplateBoundary key={template?.id || "modernist"}>
            <ResumePreview resume={resume} template={template} />
          </TemplateBoundary>
        </div>
      </div>
    </div>
  );
}

// ── SHARED HELPERS ──
function fmtDate(d) { try { return d ? new Date(d + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""; } catch { return d || ""; } }
// skillList: handles both old string and new [{name,rating}] formats
function skillList(s) {
  if (!s) return [];
  if (typeof s === "string") return s.split(",").map(x => x.trim()).filter(Boolean).map(name => ({ name, rating: 3 }));
  if (Array.isArray(s)) return s.filter(sk => sk.name);
  return [];
}
// Render skill dots (●●●○○) based on rating
function SkillDots({ rating, accent, size = 6 }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", marginLeft: "4px", verticalAlign: "middle" }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ width: size, height: size, borderRadius: "50%", display: "inline-block",
          background: n <= rating ? accent : `${accent}30` }} />
      ))}
    </span>
  );
}
// Render skill bar for sidebar templates
function SkillBar({ skill, accent }) {
  const pct = `${(skill.rating / 5) * 100}%`;
  return (
    <div style={{ marginBottom: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
        <p style={{ fontSize: "7.5px", color: "#333" }}>{skill.name}</p>
        <SkillDots rating={skill.rating} accent={accent} size={5} />
      </div>
      <div style={{ height: "2px", background: `${accent}25`, borderRadius: "1px" }}>
        <div style={{ width: pct, height: "100%", background: accent, borderRadius: "1px" }} />
      </div>
    </div>
  );
}
function ExpItem({ exp, accent, border }) {
  const from = exp.from ? fmtDate(exp.from) : "";
  const to = exp.current ? "Present" : exp.to ? fmtDate(exp.to) : "";
  return (
    <div className="exp-item" style={{ marginBottom: "10px", borderLeft: border ? `2px solid ${accent}` : "none", paddingLeft: border ? "8px" : "0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div><p style={{ fontWeight: "700", fontSize: "10px", color: "#111" }}>{exp.role}</p><p style={{ color: accent, fontSize: "9px", fontWeight: "600" }}>{exp.company}{exp.location ? ` • ${exp.location}` : ""}</p></div>
        <span style={{ color: "#777", fontSize: "8px", whiteSpace: "nowrap" }}>{from}{from && to ? " – " : ""}{to}</span>
      </div>
      {(exp.responsibilities || []).filter(Boolean).length > 0 && <ul style={{ paddingLeft: "12px", marginTop: "3px" }}>{(exp.responsibilities || []).filter(Boolean).map((r, i) => <li key={i} style={{ color: "#555", fontSize: "8px", marginBottom: "1px" }}>{r}</li>)}</ul>}
      {(exp.bullets || []).filter(Boolean).length > 0 && <ul style={{ paddingLeft: "12px", marginTop: "2px" }}>{(exp.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ color: "#333", fontSize: "8px", marginBottom: "1px", fontWeight: "500" }}>{b}</li>)}</ul>}
    </div>
  );
}
function EduItem({ edu, accent }) {
  return (
    <div className="edu-item" style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
      <div><p style={{ fontWeight: "700", fontSize: "9px", color: "#111" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p><p style={{ color: accent, fontSize: "8px" }}>{edu.institution}</p></div>
      <div style={{ textAlign: "right" }}><p style={{ color: "#666", fontSize: "8px" }}>{edu.year}</p>{edu.grade && <p style={{ color: "#666", fontSize: "8px" }}>{edu.grade}</p>}</div>
    </div>
  );
}

// ── RESUME PREVIEW DISPATCHER ──
// ── Adapter: convert the app's resume state → claude template data format ──────
function toClaudeFormat(r) {
  // Skills: [{name, rating}] | string → ["Python", "SQL"]
  const rawSkills = Array.isArray(r.skills)
    ? r.skills
    : (typeof r.skills === "string" ? r.skills.split(",").map(s => s.trim()) : []);
  const skills = rawSkills.map(s => typeof s === "string" ? s : (s.name || "")).filter(Boolean);
  // Certifications: [{name, issuer, year}] → ["AWS Certified (2023)"]
  const certifications = (r.certifications || []).map(c =>
    typeof c === "string" ? c : [c.name, c.issuer, c.year].filter(Boolean).join(" · ")
  ).filter(Boolean);
  // Languages: string → array
  const languages = r.languages ? r.languages.split(",").map(l => l.trim()).filter(Boolean) : [];
  // Hobbies: [{name, icon}] → ["Reading"]
  const hobbies = (r.hobbies || []).map(h => typeof h === "string" ? h : (h.name || "")).filter(Boolean);
  // Education: add 'school' and 'honors' aliases
  const education = (r.education || []).map(e => ({
    ...e,
    school: e.institution || e.school || e.university || "",
    honors: e.grade || e.honors || ""
  }));
  // Experience: add 'period' and flatten bullets/responsibilities
  const experience = (r.experience || []).map(e => {
    const from = e.from || "";
    const to = e.current ? "Present" : (e.to || "");
    const period = from && to ? `${from} – ${to}` : from || to || e.period || "";
    const bullets = [...(e.bullets || []), ...(e.responsibilities || [])].filter(Boolean);
    return { ...e, period, bullets };
  });
  return { ...r, skills, certifications, languages, hobbies, education, experience };
}

function ResumePreview({ resume, template }) {
  const layout = template?.layout || "modernist";
  const accent = template?.accent || "#6C63FF";
  const d = toClaudeFormat(resume);
  if (layout === "claude_marketing") return <Template6 d={d} colors={{primary: "#7b1d3f", accent: "#e94560", bg: "#fff", light: "#fdf5f7", text: "#1a1a1a"}} />;
  if (layout === "claude_graduate") return <Template7 d={d} colors={{primary: "#1d4e89", accent: "#00b4d8", bg: "#f0f7ff", text: "#1a1a1a"}} />;
  if (layout === "claude_ats1") return <Template11 d={d} colors={{primary: "#1a1a1a", accent: "#2c5282", rule: "#cccccc"}} />;
  if (layout === "claude_ats2") return <Template12 d={d} colors={{primary: "#1b3a5c", accent: "#1b3a5c", bg: "#f8fafc", rule: "#b0c4de"}} />;
  if (layout === "claude_ats3") return <Template13 d={d} colors={{primary: "#0a3d62", accent: "#1a7abf", rule: "#d0e8f5", bg: "#f0f7fc"}} />;
  if (layout === "claude_photo1") return <Template15 d={d} colors={{primary: "#0d2137", accent: "#b8922e", bg: "#f5f3ef", text: "#1a1a1a"}} />;
  if (layout === "claude_photo2") return <Template16 d={d} colors={{primary: "#1a1a2e", accent: "#e94560", bg: "#fff", light: "#f8f8fc"}} />;
  if (layout === "photo_german") return <PhotoGermanLayout resume={resume} accent={accent} />;
  if (layout === "photo_modern") return <PhotoModernLayout resume={resume} accent={accent} />;
  if (layout === "photo_sidebar") return <PhotoSidebarLayout resume={resume} accent={accent} />;
  if (layout === "photo_bold") return <PhotoBoldLayout resume={resume} accent={accent} />;
  if (layout === "photo_minimal") return <PhotoMinimalLayout resume={resume} accent={accent} />;
  if (layout === "ats" || layout === "ats_pro") return <ATSLayout resume={resume} accent={accent} pro={layout === "ats_pro"} />;
  if (layout === "vintage") return <VintageLayout resume={resume} accent={accent} />;
  if (layout === "typewriter") return <TypewriterLayout resume={resume} accent={accent} />;
  if (layout === "gazette") return <GazetteLayout resume={resume} accent={accent} />;
  if (layout === "editorial") return <EditorialLayout resume={resume} accent={accent} />;
  if (layout === "verdant") return <VerdantLayout resume={resume} accent={accent} />;
  if (layout === "creative") return <CreativeLayout resume={resume} accent={accent} />;
  if (layout === "executive") return <ExecutiveLayout resume={resume} accent={accent} />;
  if (layout === "slate") return <SlateLayout resume={resume} accent={accent} />;
  if (layout === "neon") return <NeonLayout resume={resume} accent={accent} />;
  if (layout === "minimal") return <MinimalLayout resume={resume} accent={accent} />;
  if (layout === "prism") return <PrismLayout resume={resume} accent={accent} />;
  if (layout === "tokyo") return <TokyoLayout resume={resume} accent={accent} />;
  if (layout === "coral") return <CoralLayout resume={resume} accent={accent} />;
  if (layout === "sage") return <SageLayout resume={resume} accent={accent} />;
  if (layout === "blueprint") return <BlueprintLayout resume={resume} accent={accent} />;
  if (layout === "lumina") return <LuminaLayout resume={resume} accent={accent} />;
  if (layout === "obsidian") return <ObsidianLayout resume={resume} accent={accent} />;
  return <ModernistLayout resume={resume} accent={accent} />;
}
// ── Fix 3: Proper React class-based Error Boundary (functional try/catch doesn't catch render errors) ──
class TemplateBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Template render error:", error, info);
  }
  componentDidUpdate(prevProps) {
    // Reset error when template changes so user can try another template
    if (prevProps.children?.key !== this.props.children?.key) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div id="resume-preview" style={{ width: "794px", minHeight: "1123px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", gap: "12px" }}>
          <div style={{ fontSize: "32px" }}>⚠️</div>
          <p style={{ color: "#FF6584", fontWeight: "600", fontSize: "14px", textAlign: "center", maxWidth: "300px" }}>
            This template encountered a rendering error.
          </p>
          <p style={{ color: "#888", fontSize: "12px", textAlign: "center", maxWidth: "300px" }}>
            Please select a different template, or try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: "8px 20px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── SHARED SECTION HEADER ──
function Sec({ title, accent, style = {} }) {
  return <h2 style={{ fontSize: "8px", fontWeight: "800", color: accent, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `1.5px solid ${accent}`, paddingBottom: "2px", marginBottom: "6px", marginTop: "10px", ...style }}>{title}</h2>;
}
function EmptyMsg() { return <div style={{ textAlign: "center", padding: "20px", color: "#aaa", fontSize: "10px" }}>Fill in your details on the left to preview your resume.</div>; }

// ─────────────────────────────────────────────────────────
// 1 & 2 — ATS CLASSIC / ATS PRO  (clean, machine-readable)
// ─────────────────────────────────────────────────────────
function ATSLayout({ resume, accent, pro }) {
  const skills = skillList(resume.skills);
  const hasContent = resume.name || resume.summary || (resume.experience||[]).length;
  if (!hasContent) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "Arial, sans-serif", fontSize: "10px", color: "#111", lineHeight: 1.5, padding: "28px 30px", boxShadow: "0 4px 24px rgba(0,0,0,0.18)", borderRadius: "6px" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      {/* ATS Header — plain text, no background boxes */}
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: "10px", marginBottom: "12px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "700", color: accent, marginBottom: "2px", letterSpacing: "-0.3px" }}>{resume.name || "Your Name"}</h1>
        <p style={{ fontSize: "11px", color: "#444", marginBottom: "5px" }}>{resume.title || "Professional Title"}</p>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "8.5px", color: "#555" }}>
          {resume.email && <span>✉ {resume.email}</span>}
          {resume.phone && <span>📞 {resume.phone}</span>}
          {resume.location && <span>📍 {resume.location}</span>}
          {resume.linkedin && <span>🔗 LinkedIn</span>}
          {resume.website && <span>🌐 {resume.website}</span>}
        </div>
      </div>
      {resume.summary && <><Sec title="Professional Summary" accent={accent} /><p style={{ fontSize: "9px", color: "#333", lineHeight: 1.7, marginBottom: "8px" }}>{resume.summary}</p></>}
      {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Work Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border={pro} />)}</>}
      {skills.length > 0 && <><Sec title="Key Skills" accent={accent} /><div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>{skills.map((s,i)=><span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:`${accent}10`, border:`1px solid ${accent}25`, color:"#333", padding:"2px 7px", borderRadius:"4px", fontSize:"8px" }}>{s.name}<SkillDots rating={s.rating} accent={accent} size={5}/></span>)}</div></>}
      {(resume.education||[]).some(e=>e.institution||e.degree) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
      {(resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{ fontSize: "8.5px", color: "#444", marginBottom: "2px" }}>• {c.name}{c.issuer?` — ${c.issuer}`:""}{c.year?` (${c.year})`:""}</p>)}</>}
      {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize: "8.5px", color: "#444", marginBottom: "2px" }}>• {a.text}</p>)}</>}
      {(resume.projects||[]).some(p=>p.name) && <><Sec title="Projects" accent={accent} />{(resume.projects||[]).map(p=>p.name&&<div key={p.id} style={{ marginBottom: "6px" }}><p style={{ fontWeight: "700", fontSize: "9px" }}>{p.name}{p.tech?` | ${p.tech}`:""}</p>{p.description&&<p style={{ fontSize: "8.5px", color: "#555" }}>{p.description}</p>}</div>)}</>}
      {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{ fontSize: "8.5px", color: "#555" }}>{resume.languages}</p></>}
      {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Core Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"8px",flexShrink:0}}>▸</span><p style={{fontSize:"8px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
      {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"8px"}}>·</span>,el],[])}</div></>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 3 — PARCHMENT (aged paper, sepia tones, serif font)
// ─────────────────────────────────────────────────────────
function VintageLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const bg = "#f9f3e3"; const border = "#c8ad8f"; const ink = "#3d2b1f";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: bg, fontFamily: "'Georgia', serif", fontSize: "10px", color: ink, lineHeight: 1.6, padding: "28px 30px", boxShadow: `0 4px 24px rgba(61,43,31,0.25)`, borderRadius: "4px", border: `2px solid ${border}` , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ textAlign: "center", borderBottom: `1px solid ${border}`, paddingBottom: "12px", marginBottom: "14px" }}>
        <h1 style={{ fontFamily: "'Georgia',serif", fontSize: "22px", fontWeight: "700", color: ink, marginBottom: "3px", letterSpacing: "1px" }}>{resume.name || "Your Name"}</h1>
        <p style={{ fontSize: "10px", color: accent, fontStyle: "italic", marginBottom: "6px" }}>{resume.title || "Professional Title"}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", fontSize: "8px", color: "#6b4c2a" }}>
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
        </div>
      </div>
      {resume.summary && <><p style={{ fontSize: "8px", fontWeight: "700", color: accent, textTransform: "uppercase", letterSpacing: "2px", borderBottom: `1px solid ${border}`, paddingBottom: "2px", marginBottom: "6px" }}>Profile</p><p style={{ fontSize: "9px", color: ink, lineHeight: 1.7, fontStyle: "italic", marginBottom: "10px" }}>{resume.summary}</p></>}
      {(resume.experience||[]).some(e=>e.company||e.role) && <>
        <p style={{ fontSize: "8px", fontWeight: "700", color: accent, textTransform: "uppercase", letterSpacing: "2px", borderBottom: `1px solid ${border}`, paddingBottom: "2px", marginBottom: "6px" }}>Experience</p>
        {(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border={false} />)}
      </>}
      {skills.length > 0 && <><p style={{ fontSize: "8px", fontWeight: "700", color: accent, textTransform: "uppercase", letterSpacing: "2px", borderBottom: `1px solid ${border}`, paddingBottom: "2px", marginBottom: "6px" }}>Skills</p><div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>{skills.map((s,i)=><span key={i} style={{ display:"inline-flex", alignItems:"center", fontSize:"8.5px", color: ink, fontStyle:"italic" }}>{s.name}<SkillDots rating={s.rating} accent={accent} size={5}/>{i<skills.length-1 && <span style={{margin:"0 4px"}}>·</span>}</span>)}</div></>}
      {(resume.education||[]).some(e=>e.institution) && <><p style={{ fontSize: "8px", fontWeight: "700", color: accent, textTransform: "uppercase", letterSpacing: "2px", borderBottom: `1px solid ${border}`, paddingBottom: "2px", marginBottom: "6px", marginTop: "10px" }}>Education</p>{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
      {(resume.certifications||[]).some(c=>c.name) && <><p style={{ fontSize: "8px", fontWeight: "700", color: accent, textTransform: "uppercase", letterSpacing: "2px", borderBottom: `1px solid ${border}`, paddingBottom: "2px", marginBottom: "6px" }}>Certifications</p>{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{ fontSize: "8px", color: ink, marginBottom: "2px" }}>• {c.name}</p>)}</>}
      {(resume.strengths||[]).some(s=>s.text) && <><p style={{ fontSize: "8px", fontWeight: "700", color: accent, textTransform: "uppercase", letterSpacing: "2px", borderBottom: `1px solid ${border}`, paddingBottom: "2px", marginBottom: "6px" }}>Strengths</p>{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"8px",color:ink,marginBottom:"2px",fontStyle:"italic"}}>▸ {s.text}</p>)}</>}
      {(resume.hobbies||[]).some(h=>h.name) && <><p style={{ fontSize: "8px", fontWeight: "700", color: accent, textTransform: "uppercase", letterSpacing: "2px", borderBottom: `1px solid ${border}`, paddingBottom: "2px", marginBottom: "6px" }}>Hobbies</p><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:ink,fontStyle:"italic"}}>{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}</span>)}</div></>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 4 — TYPEWRITER (monospace, paper texture, old machine feel)
// ─────────────────────────────────────────────────────────
function TypewriterLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const ink = "#2c1e0f"; const paper = "#f5efe0";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: paper, fontFamily: "'Courier New', Courier, monospace", fontSize: "9.5px", color: ink, lineHeight: 1.7, padding: "28px 30px", boxShadow: "0 4px 24px rgba(0,0,0,0.2)", borderRadius: "3px", border: "1px solid #c8ad8f" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ textAlign: "center", marginBottom: "14px" }}>
        <div style={{ border: `2px double ${ink}`, display: "inline-block", padding: "8px 24px", marginBottom: "6px" }}>
          <h1 style={{ fontSize: "17px", fontWeight: "normal", color: ink, letterSpacing: "3px", textTransform: "uppercase" }}>{resume.name || "YOUR NAME"}</h1>
        </div>
        <p style={{ fontSize: "9px", color: accent, letterSpacing: "2px", textTransform: "uppercase" }}>{resume.title || "Professional Title"}</p>
        <p style={{ fontSize: "8px", color: "#5a3e28", marginTop: "4px" }}>{[resume.email, resume.phone, resume.location].filter(Boolean).join("  |  ")}</p>
      </div>
      <div style={{ borderTop: `1px dashed ${ink}`, borderBottom: `1px dashed ${ink}`, padding: "4px 0", marginBottom: "12px", textAlign: "center", fontSize: "8px", letterSpacing: "1px", color: "#7a5c3a" }}>— CURRICULUM VITAE —</div>
      {resume.summary && <><p style={{ fontSize: "8px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>[ PROFILE ]</p><p style={{ fontSize: "9px", lineHeight: 1.7, marginBottom: "12px" }}>{resume.summary}</p></>}
      {(resume.experience||[]).some(e=>e.company||e.role) && <>
        <p style={{ fontSize: "8px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>[ EXPERIENCE ]</p>
        {(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border={false} />)}
      </>}
      {skills.length > 0 && <><p style={{ fontSize: "8px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>[ SKILLS ]</p><div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"10px" }}>{skills.map((s,i)=><span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"3px", fontSize:"8.5px" }}>[{s.name}<SkillDots rating={s.rating} accent={accent} size={5}/>]</span>)}</div></>}
      {(resume.education||[]).some(e=>e.institution) && <><p style={{ fontSize: "8px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>[ EDUCATION ]</p>{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
      {(resume.certifications||[]).some(c=>c.name) && <><p style={{ fontSize: "8px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>[ CERTIFICATIONS ]</p>{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{fontSize:"8.5px",marginBottom:"2px"}}>[{c.name}]</p>)}</>}
      {(resume.strengths||[]).some(s=>s.text) && <><p style={{ fontSize: "8px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>[ STRENGTHS ]</p>{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"9px",lineHeight:1.7,marginBottom:"3px"}}>▸ {s.text}</p>)}</>}
      {(resume.hobbies||[]).some(h=>h.name) && <><p style={{ fontSize: "8px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>[ HOBBIES ]</p><div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8.5px"}}>[{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}]</span>)}</div></>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 5 — GAZETTE (newspaper style with columns)
// ─────────────────────────────────────────────────────────
function GazetteLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const ink = "#1a0f00"; const rule = "#b8965a";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fdf8ef", fontFamily: "'Georgia', serif", fontSize: "10px", color: ink, lineHeight: 1.55, padding: "22px 26px", boxShadow: "0 4px 24px rgba(0,0,0,0.18)", borderRadius: "4px", border: `1px solid ${rule}` , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ textAlign: "center", borderTop: `3px double ${rule}`, borderBottom: `3px double ${rule}`, padding: "10px 0", marginBottom: "12px" }}>
        <p style={{ fontSize: "7px", letterSpacing: "3px", textTransform: "uppercase", color: rule, marginBottom: "2px" }}>Curriculum Vitae</p>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: ink, letterSpacing: "0.5px", marginBottom: "2px" }}>{resume.name || "Your Name"}</h1>
        <p style={{ fontSize: "10px", fontStyle: "italic", color: accent }}>{resume.title || "Professional Title"}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", fontSize: "7.5px", color: rule, marginTop: "5px", flexWrap: "wrap" }}>
          {[resume.email, resume.phone, resume.location].filter(Boolean).map((v,i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "18px" }}>
        <div>
          {resume.summary && <><p style={{ fontSize: "7.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", color: rule, borderBottom: `1px solid ${rule}`, paddingBottom: "2px", marginBottom: "5px" }}>Profile</p><p style={{ fontSize: "8.5px", fontStyle: "italic", lineHeight: 1.7, marginBottom: "10px" }}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <>
            <p style={{ fontSize: "7.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", color: rule, borderBottom: `1px solid ${rule}`, paddingBottom: "2px", marginBottom: "5px" }}>Experience</p>
            {(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border={false} />)}
          </>}
        </div>
        <div>
          {skills.length > 0 && <><p style={{ fontSize: "7.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", color: rule, borderBottom: `1px solid ${rule}`, paddingBottom: "2px", marginBottom: "5px" }}>Skills</p><div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" }}>{skills.map((s,i) => <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontSize:"7.5px", color:"#333" }}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={5}/></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><p style={{ fontSize: "7.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", color: rule, borderBottom: `1px solid ${rule}`, paddingBottom: "2px", marginBottom: "5px" }}>Education</p>{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
          {(resume.certifications||[]).some(c=>c.name) && <><p style={{ fontSize: "7.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", color: rule, borderBottom: `1px solid ${rule}`, paddingBottom: "2px", marginBottom: "5px" }}>Certifications</p>{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{ fontSize: "8px", color: "#444", marginBottom: "2px" }}>• {c.name}</p>)}</>}
          {(resume.strengths||[]).some(s=>s.text) && <><p style={{ fontSize: "7.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", color: rule, borderBottom: `1px solid ${rule}`, paddingBottom: "2px", marginBottom: "5px" }}>Strengths</p>{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"8px",color:"#444",marginBottom:"2px",fontStyle:"italic"}}>▸ {s.text}</p>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><p style={{ fontSize: "7.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", color: rule, borderBottom: `1px solid ${rule}`, paddingBottom: "2px", marginBottom: "5px" }}>Hobbies</p><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#555"}}>{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}</span>)}</div></>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 6 — EDITORIAL (Stitch-inspired, left sidebar photo card)
// ─────────────────────────────────────────────────────────
// ── SHARED: Smart Photo/Initials Avatar for templates ────────────────────────
function ResumeAvatar({ resume, size = 64, accent, borderColor = "white", shape = "circle" }) {
  const initials = (resume.name || "?").split(" ").map(w => w[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
  const br = shape === "square" ? "8px" : "50%";
  if (resume.photo) {
    return (
      <img
        src={resume.photo}
        alt="Profile"
        crossOrigin="anonymous"
        style={{
          width: size,
          height: size,
          borderRadius: br,
          objectFit: "cover",
          objectPosition: "center top",
          border: `3px solid ${borderColor}`,
          display: "block",
          flexShrink: 0,
        }}
      />
    );
  }
  if (initials) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: br,
        background: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35 + "px",
        fontWeight: "700",
        color: "white",
        border: `3px solid ${borderColor}`,
        flexShrink: 0,
      }}>{initials}</div>
    );
  }
  return null;
}

// ── SHARED: Photo warning banner shown in editor when template needs photo ──
// This is used by the editor, not the preview
const PHOTO_TEMPLATES = ["editorial","verdant","executive","slate","sage"];

function EditorialLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const light = `${accent}15`; const mid = `${accent}30`;
  const sl = resume.sectionLayout || {};
  const skillsLeft = sl.skills !== "main";
  const langLeft = sl.languages !== "main";
  const hobbiesLeft = sl.hobbies !== "main";
  const strengthsLeft = sl.strengths !== "main";
  const certsLeft = sl.certifications !== "main";
  const achieveLeft = sl.achievements === "sidebar";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#f8f9ff", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "10px", color: "#1a1a2e", lineHeight: 1.5, display: "flex", alignItems: "stretch", boxShadow: "0 4px 24px rgba(61,82,160,0.18)", borderRadius: "8px", overflow: "hidden", minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      {/* LEFT SIDEBAR */}
      <div style={{ width: "140px", flexShrink: 0, background: light, borderRight: `1px solid ${mid}`, padding: "22px 14px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <ResumeAvatar resume={resume} size={56} accent={accent} borderColor="white" shape="circle" />
        <div style={{ height: "4px" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: "700", fontSize: "11px", color: accent, lineHeight: 1.3 }}>{resume.name || "Your Name"}</p>
          <p style={{ fontSize: "8px", color: "#555", marginTop: "2px" }}>{resume.title || "Professional Title"}</p>
        </div>
        <div style={{ borderTop: `1px solid ${mid}`, paddingTop: "10px" }}>
          <p style={{ fontSize: "7px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: accent, marginBottom: "5px" }}>Contact</p>
          {resume.email && <p style={{ fontSize: "7.5px", color: "#444", marginBottom: "3px", wordBreak: "break-all" }}>✉ {resume.email}</p>}
          {resume.phone && <p style={{ fontSize: "7.5px", color: "#444", marginBottom: "3px" }}>📞 {resume.phone}</p>}
          {resume.location && <p style={{ fontSize: "7.5px", color: "#444", marginBottom: "3px" }}>📍 {resume.location}</p>}
        </div>
        {skillsLeft && skills.length > 0 && <div style={{ borderTop: `1px solid ${mid}`, paddingTop: "10px" }}>
          <p style={{ fontSize: "7px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: accent, marginBottom: "6px" }}>Expertise</p>
          {skills.slice(0,8).map((s,i) => <SkillBar key={i} skill={s} accent={accent} />)}
        </div>}
        {certsLeft && (resume.certifications||[]).some(c=>c.name) && <div style={{ borderTop: `1px solid ${mid}`, paddingTop: "10px" }}>
          <p style={{ fontSize: "7px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: accent, marginBottom: "5px" }}>Certifications</p>
          {(resume.certifications||[]).filter(c=>c.name).map((c,i) => <p key={i} style={{ fontSize: "7px", color: "#555", marginBottom: "3px", background: mid, padding: "2px 5px", borderRadius: "3px" }}>{c.name}</p>)}
        </div>}
        {langLeft && resume.languages && <div style={{ borderTop: `1px solid ${mid}`, paddingTop: "10px" }}>
          <p style={{ fontSize: "7px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: accent, marginBottom: "5px" }}>Languages</p>
          <p style={{ fontSize: "7.5px", color: "#555" }}>{resume.languages}</p>
        </div>}
        {strengthsLeft && (resume.strengths||[]).some(s=>s.text) && <div style={{ borderTop: `1px solid ${mid}`, paddingTop: "10px" }}>
          <p style={{ fontSize: "7px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: accent, marginBottom: "5px" }}>Strengths</p>
          {(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"7px",flexShrink:0}}>▸</span><p style={{fontSize:"7px",color:"#555",lineHeight:1.4}}>{s.text}</p></div>)}
        </div>}
        {hobbiesLeft && (resume.hobbies||[]).some(h=>h.name) && <div style={{ borderTop: `1px solid ${mid}`, paddingTop: "10px" }}>
          <p style={{ fontSize: "7px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: accent, marginBottom: "5px" }}>Hobbies</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7px",color:"#555"}}>{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}</span>)}</div>
        </div>}
        {achieveLeft && (resume.achievements||[]).some(a=>a.text) && <div style={{ borderTop: `1px solid ${mid}`, paddingTop: "10px" }}>
          <p style={{ fontSize: "7px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: accent, marginBottom: "5px" }}>Achievements</p>
          {(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize: "7px", color: "#555", marginBottom: "3px" }}>• {a.text}</p>)}
        </div>}
      </div>
      {/* RIGHT MAIN */}
      <div style={{ flex: 1, padding: "22px 20px", overflowY: "visible" }}>
        {resume.summary && <><Sec title="Profile" accent={accent} /><p style={{ fontSize: "9px", color: "#444", lineHeight: 1.7, marginBottom: "10px" }}>{resume.summary}</p></>}
        {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border />)}</>}
        {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
        {(resume.projects||[]).some(p=>p.name) && <><Sec title="Key Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p => <div key={p.id} style={{ marginBottom: "8px", background: light, padding: "8px", borderRadius: "5px", border: `1px solid ${mid}` }}><p style={{ fontWeight: "700", fontSize: "9px", color: accent }}>{p.name}</p>{p.tech&&<p style={{ fontSize: "7.5px", color: "#777", marginBottom: "2px" }}>{p.tech}</p>}{p.description&&<p style={{ fontSize: "8px", color: "#555" }}>{p.description}</p>}</div>)}</>}
        {!achieveLeft && (resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize: "8.5px", color: "#444", marginBottom: "3px" }}>• {a.text}</p>)}</>}
        {!skillsLeft && skills.length > 0 && <><Sec title="Skills" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"10px"}}>{skills.map((s,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:"4px",background:`${accent}12`,color:accent,padding:"2px 8px",borderRadius:"4px",fontSize:"8px"}}>{s.name}<SkillDots rating={s.rating} accent={accent} size={5}/></span>)}</div></>}
        {!certsLeft && (resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{ fontSize: "8px", color: "#444", marginBottom: "2px" }}>• {c.name}</p>)}</>}
        {!langLeft && resume.languages && <><Sec title="Languages" accent={accent} /><p style={{ fontSize: "8.5px", color: "#555", marginBottom: "8px" }}>{resume.languages}</p></>}
        {!strengthsLeft && (resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"8px",flexShrink:0}}>▸</span><p style={{fontSize:"8px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
        {!hobbiesLeft && (resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"8px"}}>·</span>,el],[])}</div></>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 7 — VERDANT (Stitch-inspired, centered header, right panel)
// ─────────────────────────────────────────────────────────
function VerdantLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const light = `${accent}12`; const mid = `${accent}25`;
  const sl = resume.sectionLayout || {};
  const skillsInPanel = sl.skills !== "main";
  const langInPanel = sl.languages !== "main";
  const hobbiesInPanel = sl.hobbies !== "main";
  const strengthsInPanel = sl.strengths !== "main";
  const certsInPanel = sl.certifications !== "main";
  const achieveInPanel = sl.achievements === "sidebar";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "10px", color: "#1a1a2e", lineHeight: 1.5, boxShadow: "0 4px 24px rgba(27,58,107,0.18)", borderRadius: "8px", overflow: "hidden", border: `1px solid ${mid}` , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: "#fff", borderBottom: `2px solid ${mid}`, padding: "20px 24px 14px", display:"flex", alignItems:"center", gap:"16px" }}>
        <ResumeAvatar resume={resume} size={64} accent={accent} borderColor={`${accent}40`} shape="circle" />
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: "24px", fontWeight: "700", color: accent, marginBottom: "2px" }}>{resume.name || "Your Name"}</h1>
          <p style={{ fontSize: "11px", color: "#555", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>{resume.title || "Professional Title"}</p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "8px", color: "#666" }}>
            {resume.email && <span>&#10007; {resume.email}</span>}
            {resume.phone && <span>&#128222; {resume.phone}</span>}
            {resume.location && <span>&#128205; {resume.location}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0" }}>
        <div style={{ padding: "18px 20px", borderRight: `1px solid ${mid}` }}>
          {resume.summary && <><Sec title="Executive Summary" accent={accent} /><p style={{ fontSize: "9px", color: "#444", lineHeight: 1.7, marginBottom: "12px" }}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Professional Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border />)}</>}
          {(resume.projects||[]).some(p=>p.name) && <><Sec title="Key Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{ marginBottom:"8px",background:light,padding:"8px",borderRadius:"5px",border:`1px solid ${mid}` }}><p style={{ fontWeight:"700",fontSize:"9px",color:accent }}>{p.name}</p>{p.description&&<p style={{ fontSize:"8px",color:"#555" }}>{p.description}</p>}</div>)}</>}
          {!skillsInPanel && skills.length > 0 && <><Sec title="Strategic Skills" accent={accent} /><div style={{ display:"flex",flexDirection:"column",gap:"5px",marginBottom:"12px" }}>{skills.map((s,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><span style={{ fontSize:"8px",color:"#333" }}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={6}/></div>)}</div></>}
          {!certsInPanel && (resume.certifications||[]).some(c=>c.name) && <><Sec title="Credentials" accent={accent} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{ fontSize:"8px",color:"#444",marginBottom:"3px" }}>{c.name}</p>)}</>}
          {!achieveInPanel && (resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize:"8px",color:"#444",marginBottom:"3px" }}>* {a.text}</p>)}</>}
          {!langInPanel && resume.languages && <><Sec title="Languages" accent={accent} /><p style={{ fontSize:"8px",color:"#555",marginBottom:"8px" }}>{resume.languages}</p></>}
          {!strengthsInPanel && (resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"8px",color:"#555",marginBottom:"2px"}}>{s.text}</p>)}</>}
          {!hobbiesInPanel && (resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#444"}}>{h.name}</span>)}</div></>}
        </div>
        <div style={{ padding: "18px 16px", background: light }}>
          {skillsInPanel && skills.length > 0 && <><Sec title="Strategic Skills" accent={accent} /><div style={{ display:"flex",flexDirection:"column",gap:"5px",marginBottom:"12px" }}>{skills.map((s,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><span style={{ fontSize:"8px",color:"#333" }}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={6}/></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><Sec title="Academic" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
          {certsInPanel && (resume.certifications||[]).some(c=>c.name) && <><Sec title="Credentials" accent={accent} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"8px",color:"#444",marginBottom:"3px"}}>{c.name}</p>)}</>}
          {achieveInPanel && (resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize:"8px",color:"#444",marginBottom:"3px" }}>* {a.text}</p>)}</>}
          {langInPanel && resume.languages && <><Sec title="Languages" accent={accent} /><p style={{ fontSize:"8px",color:"#555" }}>{resume.languages}</p></>}
          {strengthsInPanel && (resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"8px",color:"#555",marginBottom:"2px"}}>{s.text}</p>)}</>}
          {hobbiesInPanel && (resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#444"}}>{h.name}</span>)}</div></>}
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────
// 8 — MODERNIST (gradient header, clean grid)
// ─────────────────────────────────────────────────────────
function ModernistLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'DM Sans', Arial, sans-serif", fontSize: "10px", color: "#1a1a1a", lineHeight: 1.5, boxShadow: "0 8px 32px rgba(108,99,255,0.18)", borderRadius: "10px", overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: `linear-gradient(135deg, ${accent}, #FF6584)`, padding: "22px 26px", color: "white" }}>
        <h1 style={{ fontSize: "21px", fontWeight: "700", marginBottom: "2px" }}>{resume.name || "Your Name"}</h1>
        <p style={{ fontSize: "11px", opacity: 0.9, marginBottom: "8px" }}>{resume.title || "Professional Title"}</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "8px", opacity: 0.85 }}>
          {resume.email && <span>✉ {resume.email}</span>}
          {resume.phone && <span>📞 {resume.phone}</span>}
          {resume.location && <span>📍 {resume.location}</span>}
          {resume.linkedin && <span>🔗 LinkedIn</span>}
        </div>
      </div>
      <div style={{ padding: "18px 24px" }}>
        {resume.summary && <><Sec title="Professional Summary" accent={accent} /><p style={{ fontSize: "9px", color: "#333", lineHeight: 1.75, marginBottom: "10px" }}>{resume.summary}</p></>}
        {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Work Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border />)}</>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div>
            {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
          </div>
          <div>
            {skills.length > 0 && <><Sec title="Skills" accent={accent} /><div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>{skills.map((s,i)=><span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"3px", background:`${accent}12`, color:accent, padding:"2px 7px", borderRadius:"4px", fontSize:"8px", fontWeight:"500" }}>{s.name}<SkillDots rating={s.rating} accent={accent} size={5}/></span>)}</div></>}
          </div>
        </div>
        {(resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{ fontSize: "8.5px", color: "#444", marginBottom: "2px" }}>• {c.name}{c.issuer?` — ${c.issuer}`:""}</p>)}</>}
        {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize: "8.5px", color: "#444", marginBottom: "2px" }}>• {a.text}</p>)}</>}
        {(resume.projects||[]).some(p=>p.name) && <><Sec title="Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{ marginBottom: "7px" }}><p style={{ fontWeight: "700", fontSize: "9px" }}>{p.name}</p>{p.tech&&<p style={{ color: accent, fontSize: "8px" }}>{p.tech}</p>}{p.description&&<p style={{ fontSize: "8px", color: "#555" }}>{p.description}</p>}</div>)}</>}
        {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{ fontSize: "8.5px", color: "#555" }}>{resume.languages}</p></>}
        {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Core Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"8px",flexShrink:0}}>▸</span><p style={{fontSize:"8px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
        {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"8px"}}>·</span>,el],[])}</div></>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 9 — CREATIVE (colored left sidebar, bold typography)
// ─────────────────────────────────────────────────────────
function CreativeLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const sl = resume.sectionLayout || {};
  const skillsLeft = sl.skills !== "main";
  const langLeft = sl.languages !== "main";
  const hobbiesLeft = sl.hobbies !== "main";
  const strengthsLeft = sl.strengths !== "main";
  const certsLeft = sl.certifications !== "main";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'DM Sans', Arial, sans-serif", fontSize: "10px", color: "#111", lineHeight: 1.5, display: "flex", alignItems: "stretch", boxShadow: "0 4px 24px rgba(255,101,132,0.18)", borderRadius: "8px", overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ width: "130px", flexShrink: 0, background: accent, padding: "22px 14px", color: "white" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", color: "white", margin: "0 auto 10px" }}>{(resume.name||"?")[0].toUpperCase()}</div>
        <div style={{ textAlign: "center", marginBottom: "14px" }}>
          <p style={{ fontWeight: "700", fontSize: "10px", lineHeight: 1.3 }}>{resume.name || "Your Name"}</p>
          <p style={{ fontSize: "7.5px", opacity: 0.85, marginTop: "3px" }}>{resume.title || "Title"}</p>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "5px" }}>Contact</p>
          {resume.email && <p style={{ fontSize: "7px", marginBottom: "2px", opacity: 0.9, wordBreak: "break-all" }}>{resume.email}</p>}
          {resume.phone && <p style={{ fontSize: "7px", marginBottom: "2px", opacity: 0.9 }}>{resume.phone}</p>}
          {resume.location && <p style={{ fontSize: "7px", opacity: 0.9 }}>{resume.location}</p>}
        </div>
        {skillsLeft && skills.length > 0 && <div>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "5px" }}>Skills</p>
          {skills.slice(0,8).map((s,i)=><div key={i} style={{ marginBottom: "4px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontSize: "7.5px", opacity: 0.95 }}>{s.name}</p>
              <div style={{ display:"flex", gap:"2px" }}>{[1,2,3,4,5].map(n=><span key={n} style={{ width:5,height:5,borderRadius:"50%",background: n<=s.rating ? "white" : "rgba(255,255,255,0.3)" }}/>)}</div>
            </div>
          </div>)}
        </div>}
        {certsLeft && (resume.certifications||[]).some(c=>c.name) && <div style={{ marginTop: "10px" }}>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "4px" }}>Certifications</p>
          {(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{ fontSize: "7px", opacity: 0.85, marginBottom: "2px" }}>✓ {c.name}</p>)}
        </div>}
        {langLeft && resume.languages && <div style={{ marginTop: "10px" }}>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "4px" }}>Languages</p>
          <p style={{ fontSize: "7px", opacity: 0.85 }}>{resume.languages}</p>
        </div>}
        {strengthsLeft && (resume.strengths||[]).some(s=>s.text) && <div style={{ marginTop: "10px" }}>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "4px" }}>Strengths</p>
          {(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{ fontSize: "7px", opacity: 0.85, marginBottom: "2px" }}>▸ {s.text}</p>)}
        </div>}
        {hobbiesLeft && (resume.hobbies||[]).some(h=>h.name) && <div style={{ marginTop: "10px" }}>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "4px" }}>Hobbies</p>
          {(resume.hobbies||[]).filter(h=>h.name).map(h=><p key={h.id} style={{ fontSize: "7px", opacity: 0.85, marginBottom: "2px" }}>{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}</p>)}
        </div>}
      </div>
      <div style={{ flex: 1, padding: "22px 18px" }}>
        {resume.summary && <><div style={{ height: "4px", background: `${accent}20`, borderRadius: "2px", marginBottom: "6px" }} /><Sec title="About Me" accent={accent} /><p style={{ fontSize: "9px", color: "#444", lineHeight: 1.75, marginBottom: "10px" }}>{resume.summary}</p></>}
        {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border />)}</>}
        {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
        {!certsLeft && (resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{ fontSize: "8px", color: "#444", marginBottom: "2px" }}>• {c.name}{c.issuer?` — ${c.issuer}`:""}</p>)}</>}
        {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize: "8px", color: "#444", marginBottom: "2px" }}>• {a.text}</p>)}</>}
        {!skillsLeft && skills.length > 0 && <><Sec title="Skills" accent={accent} /><div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>{skills.map((s,i)=><span key={i} style={{ display:"inline-flex",alignItems:"center",gap:"4px",background:`${accent}12`,color:accent,padding:"2px 8px",borderRadius:"4px",fontSize:"8px" }}>{s.name}<SkillDots rating={s.rating} accent={accent} size={5}/></span>)}</div></>}
        {!langLeft && resume.languages && <><Sec title="Languages" accent={accent} /><p style={{ fontSize: "8px", color: "#444", marginBottom: "8px" }}>{resume.languages}</p></>}
        {!strengthsLeft && (resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"8px",flexShrink:0}}>▸</span><p style={{fontSize:"8px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
        {!hobbiesLeft && (resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"8px"}}>·</span>,el],[])}</div></>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 10 — EXECUTIVE (navy top band, two-column layout)
// ─────────────────────────────────────────────────────────
function ExecutiveLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const gold = "#b8965a";
  const sl = resume.sectionLayout || {};
  const skillsRight = sl.skills !== "main";
  const langRight = sl.languages !== "main";
  const hobbiesRight = sl.hobbies !== "main";
  const strengthsRight = sl.strengths !== "main";
  const certsRight = sl.certifications !== "main";
  const achieveRight = sl.achievements !== "main";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Georgia', serif", fontSize: "10px", color: "#111", lineHeight: 1.55, boxShadow: "0 4px 24px rgba(10,74,107,0.22)", borderRadius: "6px", overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: accent, padding: "22px 26px", display:"flex", alignItems:"flex-start", gap:"16px" }}>
        <ResumeAvatar resume={resume} size={72} accent="rgba(255,255,255,0.2)" borderColor={gold} shape="circle" />
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize: "21px", fontWeight: "700", color: "white", letterSpacing: "0.5px", marginBottom: "3px" }}>{resume.name || "Your Name"}</h1>
          <p style={{ color: gold, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>{resume.title || "Senior Executive"}</p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "7.5px", color: "rgba(255,255,255,0.75)", marginTop: "6px" }}>
            {resume.email && <span>✉ {resume.email}</span>}
            {resume.phone && <span>📞 {resume.phone}</span>}
            {resume.location && <span>📍 {resume.location}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "0", borderTop: `3px solid ${gold}` }}>
        <div style={{ padding: "18px 20px", borderRight: `1px solid #eee` }}>
          {resume.summary && <><Sec title="Executive Summary" accent={accent} /><p style={{ fontSize: "9px", color: "#333", lineHeight: 1.75, fontStyle: "italic", marginBottom: "12px" }}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Career History" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border />)}</>}
          {(resume.projects||[]).some(p=>p.name) && <><Sec title="Key Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{ marginBottom: "7px" }}><p style={{ fontWeight: "700", fontSize: "9px" }}>{p.name}</p>{p.description&&<p style={{ fontSize: "8px", color: "#555" }}>{p.description}</p>}</div>)}</>}
          {!skillsRight && skills.length > 0 && <><Sec title="Core Competencies" accent={accent} /><div style={{ display:"flex",flexDirection:"column",gap:"5px",marginBottom:"12px" }}>{skills.map((s,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><span style={{ fontSize:"7.5px",color:"#333" }}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={5}/></div>)}</div></>}
          {!certsRight && (resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{ fontSize: "8px", color: "#444", marginBottom: "3px" }}>✓ {c.name}</p>)}</>}
          {!achieveRight && (resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize: "8px", color: "#444", marginBottom: "3px" }}>• {a.text}</p>)}</>}
          {!langRight && resume.languages && <><Sec title="Languages" accent={accent} /><p style={{ fontSize: "8px", color: "#555" }}>{resume.languages}</p></>}
          {!strengthsRight && (resume.strengths||[]).some(s=>s.text) && <><Sec title="Core Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",alignItems:"flex-start",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"7.5px",flexShrink:0}}>▸</span><p style={{fontSize:"7.5px",color:"#555",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {!hobbiesRight && (resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies & Interests" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#555",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"7.5px"}}>·</span>,el],[])}</div></>}
        </div>
        <div style={{ padding: "18px 16px", background: "#f8f9fc" }}>
          {skillsRight && skills.length > 0 && <><Sec title="Core Competencies" accent={accent} /><div style={{ display:"flex",flexDirection:"column",gap:"5px",marginBottom:"12px" }}>{skills.map((s,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><span style={{ fontSize:"7.5px",color:"#333" }}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={5}/></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
          {certsRight && (resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{ fontSize: "8px", color: "#444", marginBottom: "3px" }}>✓ {c.name}</p>)}</>}
          {achieveRight && (resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{ fontSize: "8px", color: "#444", marginBottom: "3px" }}>• {a.text}</p>)}</>}
          {langRight && resume.languages && <><Sec title="Languages" accent={accent} /><p style={{ fontSize: "8px", color: "#555" }}>{resume.languages}</p></>}
          {strengthsRight && (resume.strengths||[]).some(s=>s.text) && <><Sec title="Core Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",alignItems:"flex-start",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"7.5px",flexShrink:0}}>▸</span><p style={{fontSize:"7.5px",color:"#555",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {hobbiesRight && (resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies & Interests" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#555",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"7.5px"}}>·</span>,el],[])}</div></>}
        </div>
      </div>
    </div>
  );
}


// ── 11 ─ SLATE ─────────────────────────────────────────────
function SlateLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const dark = "#2c3e50"; const light = "#ecf0f1"; const mid = "#bdc3c7";
  const sl = resume.sectionLayout || {};
  const skillsLeft = sl.skills !== "main";
  const langLeft = sl.languages !== "main";
  const hobbiesLeft = sl.hobbies !== "main";
  const strengthsLeft = sl.strengths !== "main";
  const certsLeft = sl.certifications !== "main";
  const achieveLeft = sl.achievements === "sidebar";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#2c3e50", lineHeight: 1.5, overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: dark, padding: "22px 26px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap:"14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <ResumeAvatar resume={resume} size={60} accent="rgba(255,255,255,0.15)" borderColor={mid} shape="circle" />
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "0.5px", marginBottom: "2px" }}>{resume.name || "Your Name"}</h1>
              <p style={{ fontSize: "10px", color: mid, letterSpacing: "2px", textTransform: "uppercase" }}>{resume.title || "Professional Title"}</p>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "7.5px", color: mid, lineHeight: 1.8 }}>
            {resume.email && <p>{resume.email}</p>}
            {resume.phone && <p>{resume.phone}</p>}
            {resume.location && <p>{resume.location}</p>}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
        <div style={{ background: light, padding: "18px 14px", borderRight: `3px solid ${dark}` }}>
          {skillsLeft && skills.length > 0 && <><Sec title="Skills" accent={dark} />{skills.map((s,i)=><SkillBar key={i} skill={s} accent={dark}/>)}</>}
          {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={dark} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"7px"}}><p style={{fontWeight:"700",fontSize:"8.5px"}}>{e.degree}{e.field?` in ${e.field}`:""}</p><p style={{color:accent,fontSize:"7.5px"}}>{e.institution}</p><p style={{color:"#666",fontSize:"7.5px"}}>{e.year}</p></div>)}</>}
          {certsLeft && (resume.certifications||[]).some(c=>c.name) && <><Sec title="Certs" accent={dark} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"7.5px",marginBottom:"3px",color:"#444"}}>✓ {c.name}</p>)}</>}
          {langLeft && resume.languages && <><Sec title="Languages" accent={dark} /><p style={{fontSize:"7.5px",color:"#555"}}>{resume.languages}</p></>}
          {strengthsLeft && (resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={dark} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:dark,fontWeight:"700",fontSize:"7.5px",flexShrink:0}}>▸</span><p style={{fontSize:"7.5px",color:"#555",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {hobbiesLeft && (resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={dark} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#555",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"7.5px"}}>·</span>,el],[])}</div></>}
          {achieveLeft && (resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={dark} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"7.5px",color:"#444",marginBottom:"2px"}}>• {a.text}</p>)}</>}
        </div>
        <div style={{ padding: "18px 20px" }}>
          {resume.summary && <><Sec title="Profile" accent={accent} /><p style={{fontSize:"9px",color:"#444",lineHeight:1.75,marginBottom:"10px"}}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border/>)}</>}
          {(resume.projects||[]).some(p=>p.name) && <><Sec title="Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"6px"}}><p style={{fontWeight:"700",fontSize:"9px",color:dark}}>{p.name}</p>{p.tech&&<p style={{fontSize:"7.5px",color:accent}}>{p.tech}</p>}{p.description&&<p style={{fontSize:"8px",color:"#555"}}>{p.description}</p>}</div>)}</>}
          {!achieveLeft && (resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"8px",color:"#444",marginBottom:"2px"}}>• {a.text}</p>)}</>}
          {!skillsLeft && skills.length > 0 && <><Sec title="Skills" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"10px"}}>{skills.map((s,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:"3px",background:`${accent}12`,color:accent,padding:"2px 7px",borderRadius:"4px",fontSize:"8px"}}>{s.name}<SkillDots rating={s.rating} accent={accent} size={5}/></span>)}</div></>}
          {!certsLeft && (resume.certifications||[]).some(c=>c.name) && <><Sec title="Certs" accent={accent} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"7.5px",marginBottom:"3px",color:"#444"}}>✓ {c.name}</p>)}</>}
          {!langLeft && resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"8px",color:"#555",marginBottom:"8px"}}>{resume.languages}</p></>}
          {!strengthsLeft && (resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"7.5px",flexShrink:0}}>▸</span><p style={{fontSize:"7.5px",color:"#555",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {!hobbiesLeft && (resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#555",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"7.5px"}}>·</span>,el],[])}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── 12 ─ NEON ──────────────────────────────────────────────
function NeonLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const bg = "#0d1117"; const card = "#161b22"; const border = `${accent}40`;
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: bg, fontFamily: "'Courier New',monospace", fontSize: "10px", color: "#e6edf3", lineHeight: 1.6, padding: "24px 26px" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ borderBottom: `1px solid ${border}`, paddingBottom: "14px", marginBottom: "14px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: accent, letterSpacing: "1px", fontFamily: "'Helvetica Neue',sans-serif", marginBottom: "3px" }}>{resume.name || "Your Name"}</h1>
        <p style={{ fontSize: "10px", color: "#8b949e", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "6px" }}>{resume.title || "Professional Title"}</p>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "8px", color: "#8b949e" }}>
          {resume.email && <span style={{ color: accent }}>@ {resume.email}</span>}
          {resume.phone && <span># {resume.phone}</span>}
          {resume.location && <span>▸ {resume.location}</span>}
        </div>
      </div>
      {resume.summary && <><p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"5px"}}>// PROFILE</p><p style={{fontSize:"9px",color:"#c9d1d9",lineHeight:1.7,marginBottom:"12px",borderLeft:`2px solid ${accent}`,paddingLeft:"8px"}}>{resume.summary}</p></>}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
        <div>
          {(resume.experience||[]).some(e=>e.company||e.role) && <>
            <p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"8px"}}>// EXPERIENCE</p>
            {(resume.experience||[]).map(e=>(e.company||e.role)&&<div key={e.id} style={{marginBottom:"10px",background:card,border:`1px solid ${border}`,borderRadius:"4px",padding:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><p style={{fontWeight:"700",fontSize:"9px"}}>{e.role}</p><span style={{fontSize:"7px",color:accent}}>{e.current?"→ now":e.to?e.to.slice(0,7):""}</span></div>
              <p style={{color:accent,fontSize:"8px",marginBottom:"3px"}}>{e.company}</p>
              {(e.responsibilities||[]).filter(Boolean).map((r,i)=><p key={i} style={{fontSize:"7.5px",color:"#8b949e"}}>▸ {r}</p>)}
            </div>)}
          </>}
          {(resume.projects||[]).some(p=>p.name) && <>
            <p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"8px"}}>// PROJECTS</p>
            {(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"8px",background:card,border:`1px solid ${border}`,borderRadius:"4px",padding:"8px"}}>
              <p style={{fontWeight:"700",fontSize:"9px",color:accent}}>{p.name}</p>
              {p.tech&&<p style={{fontSize:"7.5px",color:"#8b949e"}}>[{p.tech}]</p>}
              {p.description&&<p style={{fontSize:"8px",color:"#c9d1d9"}}>{p.description}</p>}
            </div>)}
          </>}
        </div>
        <div>
          {skills.length > 0 && <>
            <p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"8px"}}>// SKILLS</p>
            {skills.map((s,i)=><div key={i} style={{marginBottom:"5px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px"}}><span style={{fontSize:"7.5px",color:"#c9d1d9"}}>{s.name}</span><div style={{display:"flex",gap:"2px"}}>{[1,2,3,4,5].map(n=><span key={n} style={{width:5,height:5,borderRadius:"50%",background:n<=s.rating?accent:`${accent}25`}}/>)}</div></div><div style={{height:"1px",background:`${accent}20`}}><div style={{width:`${(s.rating/5)*100}%`,height:"100%",background:accent}}/></div></div>)}
          </>}
          {(resume.education||[]).some(e=>e.institution) && <>
            <p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"8px",marginTop:"10px"}}>// EDUCATION</p>
            {(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"6px",background:card,border:`1px solid ${border}`,padding:"6px",borderRadius:"4px"}}><p style={{fontWeight:"700",fontSize:"8.5px"}}>{e.degree}</p><p style={{color:accent,fontSize:"7.5px"}}>{e.institution}</p><p style={{color:"#8b949e",fontSize:"7.5px"}}>{e.year}</p></div>)}
          </>}
          {(resume.certifications||[]).some(c=>c.name) && <>
            <p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"6px",marginTop:"10px"}}>// CERTS</p>
            {(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"7.5px",color:"#8b949e",marginBottom:"3px"}}>✓ {c.name}</p>)}
          </>}
          {resume.languages && <><p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"4px",marginTop:"10px"}}>// LANGUAGES</p><p style={{fontSize:"7.5px",color:"#8b949e"}}>{resume.languages}</p></>}
          {(resume.achievements||[]).some(a=>a.text) && <><p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"4px",marginTop:"10px"}}>// ACHIEVEMENTS</p>{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"7.5px",color:"#8b949e",marginBottom:"3px"}}>▸ {a.text}</p>)}</>}
          {(resume.strengths||[]).some(s=>s.text) && <><p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"4px",marginTop:"10px"}}>// STRENGTHS</p>{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"7.5px",color:"#c9d1d9",marginBottom:"3px"}}>▸ {s.text}</p>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><p style={{fontSize:"8px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"4px",marginTop:"10px"}}>// HOBBIES</p><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#8b949e"}}>{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}</span>)}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── 13 ─ MINIMAL ───────────────────────────────────────────
function MinimalLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#1a1a1a", lineHeight: 1.7, padding: "40px 44px" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <h1 style={{ fontSize: "28px", fontWeight: "300", letterSpacing: "2px", color: "#111", marginBottom: "4px" }}>{resume.name || "Your Name"}</h1>
      <p style={{ fontSize: "11px", color: "#666", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "10px" }}>{resume.title || "Professional Title"}</p>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "8px", color: "#888", marginBottom: "18px" }}>
        {resume.email && <span>{resume.email}</span>}
        {resume.phone && <span>{resume.phone}</span>}
        {resume.location && <span>{resume.location}</span>}
      </div>
      <div style={{ height: "1px", background: "#111", marginBottom: "18px" }} />
      {resume.summary && <><p style={{fontSize:"9px",lineHeight:1.8,color:"#444",marginBottom:"18px"}}>{resume.summary}</p><div style={{height:"1px",background:"#eee",marginBottom:"14px"}}/></>}
      {(resume.experience||[]).some(e=>e.company||e.role) && <>
        <p style={{fontSize:"8px",fontWeight:"700",letterSpacing:"3px",textTransform:"uppercase",color:"#111",marginBottom:"12px"}}>Experience</p>
        {(resume.experience||[]).map(e=>(e.company||e.role)&&<div key={e.id} style={{marginBottom:"14px",display:"grid",gridTemplateColumns:"100px 1fr",gap:"10px"}}>
          <div><p style={{fontSize:"7.5px",color:"#888"}}>{e.from?e.from.slice(0,7):""}{e.current?" – Now":e.to?" – "+e.to.slice(0,7):""}</p></div>
          <div><p style={{fontWeight:"600",fontSize:"9.5px",marginBottom:"1px"}}>{e.role}</p><p style={{color:accent,fontSize:"8px",marginBottom:"4px"}}>{e.company}</p>{(e.responsibilities||[]).filter(Boolean).map((r,i)=><p key={i} style={{fontSize:"8px",color:"#555",marginBottom:"1px"}}>— {r}</p>)}</div>
        </div>)}
        <div style={{height:"1px",background:"#eee",marginBottom:"14px"}}/>
      </>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          {skills.length > 0 && <>
            <p style={{fontSize:"8px",fontWeight:"700",letterSpacing:"3px",textTransform:"uppercase",color:"#111",marginBottom:"10px"}}>Skills</p>
            {skills.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px",paddingBottom:"4px",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:"8.5px",color:"#333"}}>{s.name}</span><SkillDots rating={s.rating} accent="#111" size={5}/></div>)}
          </>}
        </div>
        <div>
          {(resume.education||[]).some(e=>e.institution) && <>
            <p style={{fontSize:"8px",fontWeight:"700",letterSpacing:"3px",textTransform:"uppercase",color:"#111",marginBottom:"10px"}}>Education</p>
            {(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"8px"}}><p style={{fontWeight:"600",fontSize:"9px"}}>{e.degree}{e.field?` in ${e.field}`:""}</p><p style={{color:"#666",fontSize:"8px"}}>{e.institution}</p><p style={{color:"#999",fontSize:"7.5px"}}>{e.year}{e.grade?` · ${e.grade}`:""}</p></div>)}
          </>}
          {(resume.certifications||[]).some(c=>c.name) && <>
            <p style={{fontSize:"8px",fontWeight:"700",letterSpacing:"3px",textTransform:"uppercase",color:"#111",marginBottom:"8px",marginTop:"10px"}}>Certifications</p>
            {(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"8px",color:"#444",marginBottom:"3px"}}>— {c.name}</p>)}
          </>}
          {(resume.strengths||[]).some(s=>s.text) && <><p style={{fontSize:"8px",fontWeight:"700",letterSpacing:"3px",textTransform:"uppercase",color:"#111",marginBottom:"8px",marginTop:"10px"}}>Strengths</p>{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"8px",color:"#444",marginBottom:"3px"}}>— {s.text}</p>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><p style={{fontSize:"8px",fontWeight:"700",letterSpacing:"3px",textTransform:"uppercase",color:"#111",marginBottom:"8px",marginTop:"10px"}}>Hobbies</p><div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#555"}}>{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}</span>)}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── 14 ─ PRISM ─────────────────────────────────────────────
function PrismLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const light = `${accent}15`; const mid = `${accent}30`;
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#111", lineHeight: 1.5, overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: `linear-gradient(135deg, ${accent} 55%, #fff 55%)`, padding: "26px 26px 34px" }}>
        <h1 style={{ fontSize: "23px", fontWeight: "800", color: "white", marginBottom: "3px" }}>{resume.name || "Your Name"}</h1>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.85)", letterSpacing: "2px", textTransform: "uppercase" }}>{resume.title || "Professional Title"}</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "7.5px", color: "rgba(255,255,255,0.75)", marginTop: "8px" }}>
          {resume.email && <span>✉ {resume.email}</span>}
          {resume.phone && <span>📞 {resume.phone}</span>}
          {resume.location && <span>📍 {resume.location}</span>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0" }}>
        <div style={{ padding: "16px 20px" }}>
          {resume.summary && <><Sec title="About" accent={accent} /><p style={{fontSize:"9px",color:"#444",lineHeight:1.75,marginBottom:"10px"}}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border/>)}</>}
          {(resume.projects||[]).some(p=>p.name) && <><Sec title="Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"7px",padding:"6px 8px",background:light,borderRadius:"5px",borderLeft:`3px solid ${accent}`}}><p style={{fontWeight:"700",fontSize:"9px",color:accent}}>{p.name}</p>{p.tech&&<p style={{fontSize:"7.5px",color:"#666"}}>{p.tech}</p>}{p.description&&<p style={{fontSize:"8px",color:"#555"}}>{p.description}</p>}</div>)}</>}
        </div>
        <div style={{ padding: "16px 16px", background: light, borderLeft: `3px solid ${mid}` }}>
          {skills.length > 0 && <><Sec title="Skills" accent={accent} /><div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"10px"}}>{skills.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:"7.5px"}}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={5}/></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"7px"}}><p style={{fontWeight:"700",fontSize:"8.5px"}}>{e.degree}{e.field?` in ${e.field}`:""}</p><p style={{color:accent,fontSize:"7.5px"}}>{e.institution}</p><p style={{color:"#666",fontSize:"7.5px"}}>{e.year}</p></div>)}</>}
          {(resume.certifications||[]).some(c=>c.name) && <><Sec title="Certs" accent={accent} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"7.5px",color:"#444",marginBottom:"3px"}}>✓ {c.name}</p>)}</>}
          {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Awards" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"7.5px",color:"#444",marginBottom:"3px"}}>★ {a.text}</p>)}</>}
          {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"7.5px",color:"#444"}}>{resume.languages}</p></>}
          {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"7.5px",flexShrink:0}}>▸</span><p style={{fontSize:"7.5px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"7.5px"}}>·</span>,el],[])}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── 15 ─ TOKYO ─────────────────────────────────────────────
function TokyoLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fafafa", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#111", lineHeight: 1.55, minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: "#fff", borderBottom: `4px solid ${accent}`, padding: "14px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#111", marginBottom: "2px" }}>{resume.name || "Your Name"}</h1>
            <p style={{ fontSize: "9px", color: accent, fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>{resume.title || "Professional Title"}</p>
          </div>
          <div style={{ background: accent, padding: "6px 12px", borderRadius: "4px" }}>
            <p style={{ fontSize: "7px", color: "white", lineHeight: 1.7 }}>{resume.email}{resume.email && <br/>}{resume.phone}{resume.phone && <br/>}{resume.location}</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "18px" }}>
          <div>
            {resume.summary && <><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>PROFILE</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div><p style={{fontSize:"8.5px",color:"#444",lineHeight:1.65,marginBottom:"10px"}}>{resume.summary}</p></>}
            {(resume.experience||[]).some(e=>e.company||e.role) && <>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>EXPERIENCE</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div>
              {(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border/>)}
            </>}
            {(resume.projects||[]).some(p=>p.name) && <>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px",marginTop:"8px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>PROJECTS</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div>
              {(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"6px"}}><p style={{fontWeight:"700",fontSize:"9px"}}>{p.name}</p>{p.tech&&<p style={{color:accent,fontSize:"7.5px"}}>{p.tech}</p>}{p.description&&<p style={{fontSize:"8px",color:"#555"}}>{p.description}</p>}</div>)}
            </>}
          </div>
          <div>
            {skills.length > 0 && <>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>SKILLS</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div>
              {skills.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px",padding:"3px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:"8px"}}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={5}/></div>)}
            </>}
            {(resume.education||[]).some(e=>e.institution) && <>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",marginTop:"10px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>EDUCATION</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div>
              {(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent}/>)}
            </>}
            {(resume.certifications||[]).some(c=>c.name) && <>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",marginTop:"10px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>CERTS</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div>
              {(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"7.5px",color:"#444",marginBottom:"3px"}}>✓ {c.name}</p>)}
            </>}
            {resume.languages && <><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",marginTop:"10px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>LANGUAGES</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div><p style={{fontSize:"7.5px",color:"#444"}}>{resume.languages}</p></>}
            {(resume.strengths||[]).some(s=>s.text) && <><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",marginTop:"10px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>STRENGTHS</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div>{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"7.5px",color:"#444",marginBottom:"3px"}}>▸ {s.text}</p>)}</>}
            {(resume.hobbies||[]).some(h=>h.name) && <><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",marginTop:"10px"}}><span style={{fontSize:"7px",color:"#fff",background:accent,padding:"1px 6px",borderRadius:"2px",fontWeight:"700"}}>HOBBIES</span><div style={{flex:1,height:"1px",background:"#e0e0e0"}}/></div><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#444"}}>{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}</span>)}</div></>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 16 ─ CORAL ─────────────────────────────────────────────
function CoralLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const warm = "#fff5f5"; const border = `${accent}30`;
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: warm, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#2d2d2d", lineHeight: 1.55, padding: "28px 30px" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ textAlign: "center", marginBottom: "18px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", color: "white", margin: "0 auto 10px" }}>{(resume.name||"?")[0].toUpperCase()}</div>
        <h1 style={{ fontSize: "21px", fontWeight: "700", color: "#222", marginBottom: "3px" }}>{resume.name || "Your Name"}</h1>
        <p style={{ fontSize: "10px", color: accent, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>{resume.title || "Professional Title"}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", fontSize: "8px", color: "#777" }}>
          {resume.email && <span>✉ {resume.email}</span>}
          {resume.phone && <span>📞 {resume.phone}</span>}
          {resume.location && <span>📍 {resume.location}</span>}
        </div>
      </div>
      <div style={{ background: accent, height: "2px", borderRadius: "2px", marginBottom: "16px" }} />
      {resume.summary && <><Sec title="About Me" accent={accent} /><p style={{fontSize:"9px",color:"#444",lineHeight:1.75,marginBottom:"12px"}}>{resume.summary}</p></>}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
        <div>
          {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border/>)}</>}
          {(resume.projects||[]).some(p=>p.name) && <><Sec title="Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"8px",padding:"8px",background:"#fff",borderRadius:"8px",border:`1px solid ${border}`}}><p style={{fontWeight:"700",fontSize:"9px",color:accent}}>{p.name}</p>{p.tech&&<p style={{fontSize:"7.5px",color:"#888"}}>{p.tech}</p>}{p.description&&<p style={{fontSize:"8px",color:"#555"}}>{p.description}</p>}</div>)}</>}
        </div>
        <div>
          {skills.length > 0 && <><Sec title="Skills" accent={accent} /><div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"12px"}}>{skills.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"#fff",borderRadius:"20px",border:`1px solid ${border}`}}><span style={{fontSize:"7.5px",fontWeight:"500"}}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={5}/></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"7px",padding:"7px",background:"#fff",borderRadius:"8px",border:`1px solid ${border}`}}><p style={{fontWeight:"700",fontSize:"8.5px"}}>{e.degree}{e.field?` in ${e.field}`:""}</p><p style={{color:accent,fontSize:"7.5px"}}>{e.institution}</p><p style={{color:"#888",fontSize:"7.5px"}}>{e.year}</p></div>)}</>}
          {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"7.5px",color:"#444",marginBottom:"3px"}}>★ {a.text}</p>)}</>}
          {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"7.5px",color:"#555"}}>{resume.languages}</p></>}
          {(resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).map(c=>c.name&&<p key={c.id} style={{fontSize:"7.5px",color:"#444",marginBottom:"2px"}}>• {c.name}</p>)}</>}
          {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"7.5px",flexShrink:0}}>▸</span><p style={{fontSize:"7.5px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"7.5px"}}>·</span>,el],[])}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── 17 ─ SAGE ──────────────────────────────────────────────
function SageLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const sageLight = "#f0faf4"; const sageMid = `${accent}30`;
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Georgia',serif", fontSize: "10px", color: "#1a3a2a", lineHeight: 1.6, display: "flex", alignItems: "stretch", overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ width: "150px", flexShrink: 0, background: accent, padding: "24px 14px", color: "white" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:"10px" }}><ResumeAvatar resume={resume} size={56} accent="rgba(255,255,255,0.2)" borderColor="rgba(255,255,255,0.4)" shape="circle" /></div>
        <p style={{ fontWeight: "700", fontSize: "10px", textAlign: "center", lineHeight: 1.3, marginBottom: "4px" }}>{resume.name || "Your Name"}</p>
        <p style={{ fontSize: "7.5px", opacity: 0.8, textAlign: "center", marginBottom: "14px" }}>{resume.title || "Title"}</p>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: "10px", marginBottom: "12px" }}>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "5px" }}>Contact</p>
          {resume.email && <p style={{ fontSize: "7px", opacity: 0.9, marginBottom: "2px", wordBreak: "break-all" }}>{resume.email}</p>}
          {resume.phone && <p style={{ fontSize: "7px", opacity: 0.9, marginBottom: "2px" }}>{resume.phone}</p>}
          {resume.location && <p style={{ fontSize: "7px", opacity: 0.9 }}>{resume.location}</p>}
        </div>
        {skills.length > 0 && <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: "10px", marginBottom: "12px" }}>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "6px" }}>Skills</p>
          {skills.slice(0,8).map((s,i)=><div key={i} style={{marginBottom:"5px"}}><p style={{fontSize:"7px",opacity:0.9,marginBottom:"2px"}}>{s.name}</p><div style={{height:"2px",background:"rgba(255,255,255,0.2)",borderRadius:"1px"}}><div style={{width:`${(s.rating/5)*100}%`,height:"100%",background:"rgba(255,255,255,0.8)",borderRadius:"1px"}}/></div></div>)}
        </div>}
        {(resume.certifications||[]).some(c=>c.name) && <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: "10px" }}>
          <p style={{ fontSize: "6.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.7, marginBottom: "5px" }}>Certs</p>
          {(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{ fontSize: "7px", opacity: 0.85, marginBottom: "3px" }}>✓ {c.name}</p>)}
        </div>}
      </div>
      <div style={{ flex: 1, padding: "22px 20px", background: sageLight }}>
        {resume.summary && <><Sec title="Profile" accent={accent} /><p style={{fontSize:"9px",color:"#333",lineHeight:1.75,marginBottom:"12px",fontStyle:"italic"}}>{resume.summary}</p></>}
        {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border/>)}</>}
        {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent}/>)}</>}
        {(resume.projects||[]).some(p=>p.name) && <><Sec title="Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"7px",padding:"6px 8px",background:"#fff",borderRadius:"6px",border:`1px solid ${sageMid}`}}><p style={{fontWeight:"700",fontSize:"9px",color:accent}}>{p.name}</p>{p.tech&&<p style={{fontSize:"7.5px",color:"#777"}}>{p.tech}</p>}{p.description&&<p style={{fontSize:"8px",color:"#555"}}>{p.description}</p>}</div>)}</>}
        {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"8px",color:"#444",marginBottom:"2px"}}>• {a.text}</p>)}</>}
        {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"8px",color:"#555"}}>{resume.languages}</p></>}
        {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"8px",flexShrink:0}}>▸</span><p style={{fontSize:"8px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
        {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"8px"}}>·</span>,el],[])}</div></>}
      </div>
    </div>
  );
}

// ── 18 ─ BLUEPRINT ─────────────────────────────────────────
function BlueprintLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const bg = "#f0f4ff"; const gridLine = `${accent}15`;
  const gridBg = `repeating-linear-gradient(0deg, transparent, transparent 19px, ${gridLine} 19px, ${gridLine} 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, ${gridLine} 19px, ${gridLine} 20px)`;
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: bg, backgroundImage: gridBg, fontFamily: "'Courier New',monospace", fontSize: "10px", color: accent, lineHeight: 1.6, padding: "24px 26px" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: accent, color: "white", padding: "12px 18px", marginBottom: "16px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "1px", marginBottom: "2px" }}>{resume.name || "YOUR NAME"}</h1>
          <p style={{ fontSize: "8.5px", opacity: 0.85, letterSpacing: "2px", textTransform: "uppercase" }}>{resume.title || "PROFESSIONAL TITLE"}</p>
        </div>
        <div style={{ textAlign: "right", fontSize: "7.5px", opacity: 0.8, lineHeight: 1.8 }}>
          <p>{resume.email}</p><p>{resume.phone}</p><p>{resume.location}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
        <div>
          {resume.summary && <><p style={{fontSize:"7.5px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`1px solid ${accent}`,paddingBottom:"2px",marginBottom:"5px"}}>▸ PROFILE</p><p style={{fontSize:"9px",lineHeight:1.7,marginBottom:"10px",color:"#2c3e50"}}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <>
            <p style={{fontSize:"7.5px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`1px solid ${accent}`,paddingBottom:"2px",marginBottom:"8px"}}>▸ EXPERIENCE</p>
            {(resume.experience||[]).map(e=>(e.company||e.role)&&<div key={e.id} style={{marginBottom:"10px", background:"rgba(255,255,255,0.6)", padding:"8px", borderRadius:"3px", border:`1px solid ${accent}30`}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><p style={{fontWeight:"700",fontSize:"9px",color:"#1a2a4a"}}>{e.role}</p><span style={{fontSize:"7px",color:accent}}>{e.from?e.from.slice(0,7):""}{e.current?" → now":e.to?" → "+e.to.slice(0,7):""}</span></div>
              <p style={{color:accent,fontSize:"8px",marginBottom:"3px",fontWeight:"600"}}>{e.company} {e.location?`· ${e.location}`:""}</p>
              {(e.responsibilities||[]).filter(Boolean).map((r,i)=><p key={i} style={{fontSize:"7.5px",color:"#444",marginBottom:"1px"}}>▸ {r}</p>)}
            </div>)}
          </>}
          {(resume.projects||[]).some(p=>p.name) && <>
            <p style={{fontSize:"7.5px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`1px solid ${accent}`,paddingBottom:"2px",marginBottom:"8px"}}>▸ PROJECTS</p>
            {(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"6px",background:"rgba(255,255,255,0.6)",padding:"6px",borderRadius:"3px"}}><p style={{fontWeight:"700",fontSize:"9px",color:"#1a2a4a"}}>{p.name}</p>{p.tech&&<p style={{fontSize:"7.5px",color:accent}}>[{p.tech}]</p>}{p.description&&<p style={{fontSize:"8px",color:"#444"}}>{p.description}</p>}</div>)}
          </>}
        </div>
        <div>
          {skills.length > 0 && <>
            <p style={{fontSize:"7.5px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`1px solid ${accent}`,paddingBottom:"2px",marginBottom:"8px"}}>▸ SKILLS</p>
            {skills.map((s,i)=><div key={i} style={{marginBottom:"5px",background:"rgba(255,255,255,0.6)",padding:"4px 6px",borderRadius:"3px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px"}}><span style={{fontSize:"7.5px",color:"#1a2a4a"}}>{s.name}</span><span style={{fontSize:"7px",color:accent}}>{s.rating}/5</span></div><div style={{height:"2px",background:`${accent}25`}}><div style={{width:`${(s.rating/5)*100}%`,height:"100%",background:accent}}/></div></div>)}
          </>}
          {(resume.education||[]).some(e=>e.institution) && <>
            <p style={{fontSize:"7.5px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`1px solid ${accent}`,paddingBottom:"2px",marginBottom:"8px",marginTop:"10px"}}>▸ EDUCATION</p>
            {(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"7px",background:"rgba(255,255,255,0.6)",padding:"6px",borderRadius:"3px"}}><p style={{fontWeight:"700",fontSize:"8.5px",color:"#1a2a4a"}}>{e.degree}{e.field?` — ${e.field}`:""}</p><p style={{color:accent,fontSize:"7.5px"}}>{e.institution}</p><p style={{color:"#666",fontSize:"7.5px"}}>{e.year}{e.grade?` · ${e.grade}`:""}</p></div>)}
          </>}
          {(resume.certifications||[]).some(c=>c.name) && <>
            <p style={{fontSize:"7.5px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`1px solid ${accent}`,paddingBottom:"2px",marginBottom:"8px",marginTop:"10px"}}>▸ CERTS</p>
            {(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"7.5px",color:"#1a2a4a",marginBottom:"3px"}}>✓ {c.name}</p>)}
          </>}
          {(resume.achievements||[]).some(a=>a.text) && <>
            <p style={{fontSize:"7.5px",fontWeight:"700",letterSpacing:"2px",textTransform:"uppercase",borderBottom:`1px solid ${accent}`,paddingBottom:"2px",marginBottom:"8px",marginTop:"10px"}}>▸ AWARDS</p>
            {(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"7.5px",color:"#1a2a4a",marginBottom:"3px"}}>★ {a.text}</p>)}
          </>}
        </div>
      </div>
    </div>
  );
}

// ── 19 ─ LUMINA ─────────────────────────────────────────────
function LuminaLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const gold = accent; const light = `${accent}18`;
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#1a1a1a", lineHeight: 1.55, overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, ${accent}60 100%)`, padding: "28px 26px 24px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "100%", background: `radial-gradient(circle at top right, ${accent}40, transparent 70%)` }} />
        <h1 style={{ fontSize: "23px", fontWeight: "700", color: "white", marginBottom: "3px", position: "relative" }}>{resume.name || "Your Name"}</h1>
        <p style={{ fontSize: "10px", color: gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", position: "relative" }}>{resume.title || "Professional Title"}</p>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "8px", color: "rgba(255,255,255,0.65)", position: "relative" }}>
          {resume.email && <span>✉ {resume.email}</span>}
          {resume.phone && <span>📞 {resume.phone}</span>}
          {resume.location && <span>📍 {resume.location}</span>}
          {resume.linkedin && <span>🔗 LinkedIn</span>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0" }}>
        <div style={{ padding: "18px 20px", borderRight: `2px solid ${light}` }}>
          {resume.summary && <><Sec title="Executive Profile" accent={accent} /><p style={{fontSize:"9px",color:"#333",lineHeight:1.75,marginBottom:"12px"}}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Career Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border/>)}</>}
          {(resume.projects||[]).some(p=>p.name) && <><Sec title="Key Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"8px",padding:"7px 10px",background:light,borderRadius:"6px",borderLeft:`3px solid ${gold}`}}><p style={{fontWeight:"700",fontSize:"9px",color:accent}}>{p.name}</p>{p.tech&&<p style={{fontSize:"7.5px",color:"#888"}}>{p.tech}</p>}{p.description&&<p style={{fontSize:"8px",color:"#444"}}>{p.description}</p>}</div>)}</>}
        </div>
        <div style={{ padding: "18px 16px", background: light }}>
          {skills.length > 0 && <><Sec title="Core Skills" accent={accent} /><div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"12px"}}>{skills.map((s,i)=><div key={i}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px"}}><span style={{fontSize:"7.5px",fontWeight:"500",color:"#333"}}>{s.name}</span><SkillDots rating={s.rating} accent={gold} size={6}/></div><div style={{height:"2px",background:`${gold}20`,borderRadius:"1px"}}><div style={{width:`${(s.rating/5)*100}%`,height:"100%",background:`linear-gradient(90deg,${gold},${gold}cc)`,borderRadius:"1px"}}/></div></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"8px",padding:"7px",background:"#fff",borderRadius:"5px",border:`1px solid ${light}`}}><p style={{fontWeight:"700",fontSize:"8.5px"}}>{e.degree}{e.field?` in ${e.field}`:""}</p><p style={{color:accent,fontSize:"7.5px"}}>{e.institution}</p><p style={{color:"#888",fontSize:"7.5px"}}>{e.year}</p></div>)}</>}
          {(resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><div key={i} style={{marginBottom:"4px",display:"flex",alignItems:"center",gap:"5px"}}><span style={{color:gold,fontSize:"10px"}}>✦</span><p style={{fontSize:"7.5px",color:"#444"}}>{c.name}</p></div>)}</>}
          {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"7.5px",color:"#444",marginBottom:"3px"}}>• {a.text}</p>)}</>}
          {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"7.5px",color:"#444"}}>{resume.languages}</p></>}
          {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:gold,fontWeight:"700",fontSize:"7.5px",flexShrink:0}}>▸</span><p style={{fontSize:"7.5px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"7.5px"}}>·</span>,el],[])}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── 20 ─ OBSIDIAN (dark premium, purple accents) ────────────
function ObsidianLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const bg = "#111827"; const card = "#1f2937"; const border = `${accent}35`;
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: bg, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#f9fafb", lineHeight: 1.6, overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: `linear-gradient(135deg, ${accent}25 0%, transparent 100%)`, borderBottom: `1px solid ${border}`, padding: "24px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f9fafb", letterSpacing: "0.5px", marginBottom: "3px" }}>{resume.name || "Your Name"}</h1>
            <p style={{ fontSize: "10px", color: accent, letterSpacing: "2px", textTransform: "uppercase" }}>{resume.title || "Professional Title"}</p>
          </div>
          <div style={{ textAlign: "right", fontSize: "7.5px", color: "#9ca3af", lineHeight: 1.9 }}>
            {resume.email && <p>{resume.email}</p>}
            {resume.phone && <p>{resume.phone}</p>}
            {resume.location && <p>{resume.location}</p>}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0" }}>
        <div style={{ padding: "18px 20px", borderRight: `1px solid ${border}` }}>
          {resume.summary && <><Sec title="Profile" accent={accent} /><p style={{fontSize:"9px",color:"#d1d5db",lineHeight:1.75,marginBottom:"12px"}}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <>
            <Sec title="Experience" accent={accent} />
            {(resume.experience||[]).map(e=>(e.company||e.role)&&<div key={e.id} style={{marginBottom:"10px",padding:"8px 10px",background:card,borderRadius:"6px",border:`1px solid ${border}`}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><p style={{fontWeight:"700",fontSize:"9px",color:"#f9fafb"}}>{e.role}</p><span style={{fontSize:"7px",color:accent}}>{e.current?"Present":e.to?e.to.slice(0,7):""}</span></div>
              <p style={{color:accent,fontSize:"8px",marginBottom:"4px",fontWeight:"600"}}>{e.company}</p>
              {(e.responsibilities||[]).filter(Boolean).map((r,i)=><p key={i} style={{fontSize:"7.5px",color:"#9ca3af",marginBottom:"1px"}}>› {r}</p>)}
              {(e.bullets||[]).filter(Boolean).map((b,i)=><p key={i} style={{fontSize:"7.5px",color:"#d1d5db",fontWeight:"500",marginBottom:"1px"}}>✦ {b}</p>)}
            </div>)}
          </>}
          {(resume.projects||[]).some(p=>p.name) && <>
            <Sec title="Projects" accent={accent} />
            {(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"7px",padding:"7px 10px",background:card,borderRadius:"6px",border:`1px solid ${border}`}}><p style={{fontWeight:"700",fontSize:"9px",color:accent}}>{p.name}</p>{p.tech&&<p style={{fontSize:"7.5px",color:"#6b7280"}}>{p.tech}</p>}{p.description&&<p style={{fontSize:"8px",color:"#d1d5db"}}>{p.description}</p>}</div>)}
          </>}
        </div>
        <div style={{ padding: "18px 16px", background: `${accent}08` }}>
          {skills.length > 0 && <>
            <Sec title="Skills" accent={accent} />
            {skills.map((s,i)=><div key={i} style={{marginBottom:"6px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px"}}><span style={{fontSize:"7.5px",color:"#e5e7eb"}}>{s.name}</span><div style={{display:"flex",gap:"2px"}}>{[1,2,3,4,5].map(n=><span key={n} style={{width:6,height:6,borderRadius:"50%",background:n<=s.rating?accent:`${accent}25`}}/>)}</div></div><div style={{height:"1px",background:`${accent}20`}}><div style={{width:`${(s.rating/5)*100}%`,height:"100%",background:accent}}/></div></div>)}
          </>}
          {(resume.education||[]).some(e=>e.institution) && <>
            <Sec title="Education" accent={accent} />
            {(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"8px",padding:"7px",background:card,borderRadius:"6px",border:`1px solid ${border}`}}><p style={{fontWeight:"700",fontSize:"8.5px",color:"#f9fafb"}}>{e.degree}{e.field?` in ${e.field}`:""}</p><p style={{color:accent,fontSize:"7.5px"}}>{e.institution}</p><p style={{color:"#6b7280",fontSize:"7.5px"}}>{e.year}{e.grade?` · ${e.grade}`:""}</p></div>)}
          </>}
          {(resume.certifications||[]).some(c=>c.name) && <>
            <Sec title="Certifications" accent={accent} />
            {(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"7.5px",color:"#d1d5db",marginBottom:"3px"}}>✓ {c.name}{c.issuer?` — ${c.issuer}`:""}</p>)}
          </>}
          {(resume.achievements||[]).some(a=>a.text) && <>
            <Sec title="Achievements" accent={accent} />
            {(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"7.5px",color:"#d1d5db",marginBottom:"3px"}}>✦ {a.text}</p>)}
          </>}
          {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"7.5px",color:"#9ca3af"}}>{resume.languages}</p></>}
          {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"7.5px",flexShrink:0}}>▸</span><p style={{fontSize:"7.5px",color:"#9ca3af",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"7.5px",color:"#9ca3af",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#555",fontSize:"7.5px"}}>·</span>,el],[])}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── PHOTO 1 ─ GERMAN CV (From User Attachment) ─────────────
const GermanSec = ({ title }) => (
  <h2 style={{ fontSize: "10px", fontWeight: "700", color: "#2b2b2b", background: "#e2cbc0", padding: "4px 8px", marginBottom: "8px", textTransform: "capitalize", display: "inline-block", width: "100%" }}>{title}</h2>
);

function PhotoGermanLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const leftBg = "#faf4f0"; // Similar to the light beige left column in attachment
  const textDark = "#2b2b2b";
  const grayText = "#666";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "9px", color: textDark, lineHeight: 1.5, display: "grid", alignItems: "stretch", gridTemplateColumns: "1fr 2fr", minHeight: "100%", overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      {/* LEFT COLUMN */}
      <div style={{ background: leftBg, borderRight: "1px solid #efe5df", display: "flex", flexDirection: "column" }}>
        
        {/* Photo Area */}
        {resume.photo ? (
          <div style={{ width: "100%", aspectRatio: "1/1.1", backgroundImage: `url(${resume.photo})`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: "16px" }} />
        ) : (
          <div style={{ width: "100%", aspectRatio: "1/1.1", background: "#d4c5bd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "white", marginBottom: "16px", fontWeight: "bold" }}>
            {(resume.name || "?")[0].toUpperCase()}
          </div>
        )}

        <div style={{ padding: "0 18px 24px 18px", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px", color: textDark, fontSize: "8px" }}>
            {resume.phone && <div style={{ display: "flex", gap: "6px" }}><span style={{ opacity: 0.6 }}>📞</span><span>{resume.phone}</span></div>}
            {resume.email && <div style={{ display: "flex", gap: "6px" }}><span style={{ opacity: 0.6 }}>✉</span><span>{resume.email}</span></div>}
            {resume.website && <div style={{ display: "flex", gap: "6px" }}><span style={{ opacity: 0.6 }}>🌐</span><span>{resume.website}</span></div>}
            {resume.location && <div style={{ display: "flex", gap: "6px" }}><span style={{ opacity: 0.6 }}>📍</span><span>{resume.location}</span></div>}
          </div>

          {(resume.education||[]).some(e=>e.institution) && <div style={{ marginBottom: "18px" }}>
            <GermanSec title="Education" />
            {(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{ marginBottom: "8px" }}>
              <p style={{ fontWeight: "700", fontSize: "8.5px" }}>{e.degree}</p>
              <p style={{ fontWeight: "600", fontSize: "8px" }}>{e.institution}</p>
              <p style={{ color: grayText, fontSize: "8px" }}>{e.year}</p>
            </div>)}
          </div>}

          {skills.length > 0 && <div style={{ marginBottom: "18px" }}>
            <GermanSec title="Expertise" />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "4px 0" }}>
              {skills.slice(0, 10).map((s, i) => <p key={i} style={{ fontSize: "8.5px", fontWeight: "500", color: textDark }}>{s.name}</p>)}
            </div>
          </div>}

          {resume.languages && <div style={{ marginBottom: "18px" }}>
            <GermanSec title="Language" />
            <div style={{ fontSize: "8.5px", lineHeight: 1.8 }}>
              {resume.languages.split(',').map((lang, i) => <p key={i}>{lang.trim()}</p>)}
            </div>
          </div>}
          {(resume.hobbies||[]).some(h=>h.name) && <div style={{ marginBottom: "18px" }}>
            <GermanSec title="Hobbies" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {(resume.hobbies||[]).filter(h=>h.name).map(h=><p key={h.id} style={{fontSize:"8.5px",color:"#444",marginBottom:"2px"}}>{h.icon&&<span style={{marginRight:"3px"}}>{h.icon}</span>}{h.name}</p>)}
            </div>
          </div>}
          {(resume.strengths||[]).some(s=>s.text) && <div style={{ marginBottom: "18px" }}>
            <GermanSec title="Strengths" />
            {(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"8px",color:"#444",marginBottom:"2px"}}>▸ {s.text}</p>)}
          </div>}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ padding: "0 24px 24px 24px" }}>
        <div style={{ background: "#e2cbc0", margin: "0 -24px 18px -24px", padding: "30px 24px", borderBottom: "1px solid #d4c5bd" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px", color: textDark }}>{resume.name || "YOUR NAME"}</h1>
          <p style={{ fontSize: "11px", fontWeight: "600", color: textDark }}>{resume.title || "Professional Title"}</p>
        </div>

        {resume.summary && <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", opacity: 0.6 }}>👤</span>
            <h2 style={{ fontSize: "12px", fontWeight: "700", textTransform: "capitalize", color: textDark }}>Profile</h2>
          </div>
          <p style={{ fontSize: "8.5px", color: grayText, lineHeight: 1.7 }}>{resume.summary}</p>
        </div>}

        {(resume.experience||[]).some(e=>e.company||e.role) && <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", opacity: 0.6 }}>💼</span>
            <h2 style={{ fontSize: "12px", fontWeight: "700", textTransform: "capitalize", color: textDark }}>Work Experience</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {(resume.experience||[]).map(e=>(e.company||e.role)&&<div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "10px" }}>
              <div style={{ fontSize: "8px", color: textDark, fontWeight: "700" }}>
                {e.from ? e.from.replace("-", "/") : ""}
                <br/>—<br/>
                {e.current ? "Present" : e.to ? e.to.replace("-", "/") : ""}
              </div>
              <div style={{ borderLeft: "1px solid #dcdcdc", paddingLeft: "12px", position: "relative" }}>
                <div style={{ position: "absolute", width: "5px", height: "5px", background: textDark, borderRadius: "50%", left: "-3px", top: "5px" }} />
                <p style={{ fontWeight: "700", fontSize: "10px", marginBottom: "2px" }}>{e.company}</p>
                <p style={{ fontSize: "8.5px", color: grayText, marginBottom: "4px" }}>{e.role}</p>
                {(e.responsibilities||[]).filter(Boolean).map((r,i)=><p key={i} style={{ fontSize: "8px", color: grayText, marginBottom: "2px", lineHeight: 1.6 }}>• {r}</p>)}
                {(e.bullets||[]).filter(Boolean).map((b,i)=><p key={i} style={{ fontSize: "8px", color: grayText, fontWeight: "600", marginBottom: "2px", lineHeight: 1.6 }}>› {b}</p>)}
              </div>
            </div>)}
          </div>
        </div>}
      </div>
    </div>
  );
}

// ── PHOTO 2 ─ MODERN AVATAR ────────────────────────────────
function PhotoModernLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'DM Sans', Arial, sans-serif", fontSize: "10px", color: "#222", lineHeight: 1.6, padding: "30px", borderTop: `8px solid ${accent}` , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
        {resume.photo && <img src={resume.photo} alt="Profile" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}` }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111", marginBottom: "4px", letterSpacing: "-0.5px" }}>{resume.name || "Your Name"}</h1>
          <p style={{ fontSize: "12px", color: accent, fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{resume.title || "Professional Title"}</p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "8.5px", color: "#666" }}>
            {resume.email && <span>✉ {resume.email}</span>}
            {resume.phone && <span>📞 {resume.phone}</span>}
            {resume.location && <span>📍 {resume.location}</span>}
            {resume.linkedin && <span>🔗 LinkedIn</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div>
          {resume.summary && <><Sec title="About Me" accent={accent} /><p style={{fontSize:"9px",color:"#444",lineHeight:1.8,marginBottom:"16px"}}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border/>)}</>}
          {(resume.projects||[]).some(p=>p.name) && <><Sec title="Projects" accent={accent} />{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"8px"}}><p style={{fontWeight:"600",fontSize:"9px"}}>{p.name}</p>{p.description&&<p style={{fontSize:"8px",color:"#555"}}>{p.description}</p>}</div>)}</>}
        </div>
        <div>
          {skills.length > 0 && <><Sec title="Skills" accent={accent} /><div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"16px"}}>{skills.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:"8.5px"}}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={6}/></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
          {(resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"8px",color:"#444",marginBottom:"3px"}}>✓ {c.name}</p>)}</>}
          {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"8.5px",color:"#555"}}>{resume.languages}</p></>}
          {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"8px",flexShrink:0}}>▸</span><p style={{fontSize:"8px",color:"#555",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#555",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"8px"}}>·</span>,el],[])}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── PHOTO 3 ─ DARK SIDEBAR ─────────────────────────────────
function PhotoSidebarLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  const darkBg = "#1f2937";
  const darkText = "#f3f4f6";
  const lightBg = "#ffffff";
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: lightBg, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#374151", lineHeight: 1.6, display: "grid", alignItems: "stretch", gridTemplateColumns: "1.2fr 2fr", minHeight: "100%", overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: darkBg, color: darkText, padding: "28px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          {resume.photo ? (
            <img src={resume.photo} alt="Profile" style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}` }} />
          ) : (
            <div style={{ width: "110px", height: "110px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "white", border: `3px solid ${accent}` }}>
              {(resume.name || "?")[0].toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>{resume.name || "Your Name"}</h1>
          <p style={{ fontSize: "10px", color: accent, textTransform: "uppercase", letterSpacing: "1px" }}>{resume.title || "Professional Title"}</p>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", marginBottom: "18px" }}>
          <p style={{ fontSize: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: "8px" }}>Contact</p>
          {resume.email && <p style={{ fontSize: "8px", opacity: 0.9, marginBottom: "4px", wordBreak: "break-all" }}>{resume.email}</p>}
          {resume.phone && <p style={{ fontSize: "8px", opacity: 0.9, marginBottom: "4px" }}>{resume.phone}</p>}
          {resume.location && <p style={{ fontSize: "8px", opacity: 0.9 }}>{resume.location}</p>}
        </div>
        {skills.length > 0 && <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", marginBottom: "18px" }}>
          <p style={{ fontSize: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: accent, marginBottom: "8px" }}>Skills</p>
          {skills.slice(0, 10).map((s,i) => <div key={i} style={{marginBottom:"6px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px"}}><span style={{fontSize:"8px",opacity:0.9}}>{s.name}</span></div><div style={{height:"2px",background:"rgba(255,255,255,0.2)",borderRadius:"1px"}}><div style={{width:`${(s.rating/5)*100}%`,height:"100%",background:accent,borderRadius:"1px"}}/></div></div>)}
        </div>}
      </div>
      <div style={{ padding: "30px 24px" }}>
        {resume.summary && <><Sec title="Profile" accent={accent} /><p style={{fontSize:"9px",color:"#4b5563",lineHeight:1.75,marginBottom:"16px"}}>{resume.summary}</p></>}
        {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border/>)}</>}
        {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<EduItem key={e.id} edu={e} accent={accent} />)}</>}
        {(resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"8px",color:"#4b5563",marginBottom:"3px"}}>• {c.name}</p>)}</>}
        {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"8px",color:"#4b5563",marginBottom:"2px"}}>★ {a.text}</p>)}</>}
        {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"8px",color:"#555"}}>{resume.languages}</p></>}
        {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"8px",flexShrink:0}}>▸</span><p style={{fontSize:"8px",color:"#4b5563",lineHeight:1.4}}>{s.text}</p></div>)}</>}
        {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#555",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"8px"}}>·</span>,el],[])}</div></>}
      </div>
    </div>
  );
}

// ── PHOTO 4 ─ PHOTO BOLD ───────────────────────────────────
function PhotoBoldLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: "10px", color: "#111", lineHeight: 1.5, overflow: "hidden" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ background: accent, padding: "34px 30px", color: "white", position: "relative", marginBottom: "40px" }}>
        <div style={{ maxWidth: "65%" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "6px", letterSpacing: "-1px" }}>{resume.name || "Your Name"}</h1>
          <p style={{ fontSize: "14px", fontWeight: "600", opacity: 0.9, textTransform: "uppercase", letterSpacing: "2px" }}>{resume.title || "Professional Title"}</p>
        </div>
        <div style={{ position: "absolute", right: "30px", top: "20px", width: "130px", height: "130px", borderRadius: "50%", background: "white", border: `4px solid white`, boxShadow: "0 8px 16px rgba(0,0,0,0.15)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          {resume.photo ? <img src={resume.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "40px", color: accent, fontWeight: "bold" }}>{(resume.name||"?")[0].toUpperCase()}</span>}
        </div>
      </div>
      <div style={{ padding: "0 30px 24px 30px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        <div>
          <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "8px", color: "#555" }}>
            {resume.email && <div><span style={{color:accent, fontWeight:"bold", marginRight:"4px"}}>E</span> {resume.email}</div>}
            {resume.phone && <div><span style={{color:accent, fontWeight:"bold", marginRight:"4px"}}>P</span> {resume.phone}</div>}
            {resume.location && <div><span style={{color:accent, fontWeight:"bold", marginRight:"4px"}}>L</span> {resume.location}</div>}
            {resume.linkedin && <div><span style={{color:accent, fontWeight:"bold", marginRight:"4px"}}>L</span> {resume.linkedin}</div>}
          </div>
          {skills.length > 0 && <><Sec title="Skills" accent={accent} /><div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"20px"}}>{skills.map((s,i)=><div key={i}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}><span style={{fontSize:"8.5px",fontWeight:"600",color:"#333"}}>{s.name}</span><span style={{fontSize:"7px",color:accent}}>{s.rating}/5</span></div><div style={{height:"3px",background:"#eee",borderRadius:"2px"}}><div style={{width:`${(s.rating/5)*100}%`,height:"100%",background:accent,borderRadius:"2px"}}/></div></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><Sec title="Education" accent={accent} />{(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"8px"}}><p style={{fontWeight:"700",fontSize:"8.5px"}}>{e.degree}</p><p style={{color:accent,fontSize:"8px",fontWeight:"600"}}>{e.institution}</p><p style={{color:"#888",fontSize:"7.5px"}}>{e.year}</p></div>)}</>}
        </div>
        <div>
          {resume.summary && <><Sec title="About" accent={accent} /><p style={{fontSize:"9.5px",color:"#444",lineHeight:1.8,marginBottom:"20px"}}>{resume.summary}</p></>}
          {(resume.experience||[]).some(e=>e.company||e.role) && <><Sec title="Work Experience" accent={accent} />{(resume.experience||[]).map(e=>(e.company||e.role)&&<ExpItem key={e.id} exp={e} accent={accent} border={false}/>)}</>}
          {(resume.certifications||[]).some(c=>c.name) && <><Sec title="Certifications" accent={accent} />{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"8.5px",color:"#444",marginBottom:"3px"}}>✓ {c.name}</p>)}</>}
          {(resume.achievements||[]).some(a=>a.text) && <><Sec title="Achievements" accent={accent} />{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"8.5px",color:"#444",marginBottom:"2px"}}>• {a.text}</p>)}</>}
          {resume.languages && <><Sec title="Languages" accent={accent} /><p style={{fontSize:"8.5px",color:"#555"}}>{resume.languages}</p></>}
          {(resume.strengths||[]).some(s=>s.text) && <><Sec title="Strengths" accent={accent} />{(resume.strengths||[]).filter(s=>s.text).map(s=><div key={s.id} style={{display:"flex",gap:"4px",marginBottom:"2px"}}><span style={{color:accent,fontWeight:"700",fontSize:"8px",flexShrink:0}}>▸</span><p style={{fontSize:"8px",color:"#444",lineHeight:1.4}}>{s.text}</p></div>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><Sec title="Hobbies" accent={accent} /><div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8px",color:"#444",display:"flex",alignItems:"center",gap:"2px"}}>{h.icon&&<span>{h.icon}</span>}<span>{h.name}</span></span>).reduce((acc,el,i)=>[...acc,i>0&&<span key={"dot"+i} style={{color:"#ccc",fontSize:"8px"}}>·</span>,el],[])}</div></>}
        </div>
      </div>
    </div>
  );
}

// ── PHOTO 5 ─ PHOTO MINIMAL ────────────────────────────────
function PhotoMinimalLayout({ resume, accent }) {
  const skills = skillList(resume.skills);
  if (!resume.name && !resume.summary) return <EmptyMsg />;
  return (
    <div id="resume-preview" style={{ background: "#fff", fontFamily: "'Inter', Arial, sans-serif", fontSize: "10px", color: "#333", lineHeight: 1.6, padding: "36px 40px" , minHeight: "1123px", width: "794px", boxSizing: "border-box"}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", borderBottom: `2px solid ${accent}`, paddingBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "26px", fontWeight: "300", color: "#111", marginBottom: "4px", letterSpacing: "1px" }}>{resume.name || "YOUR NAME"}</h1>
          <p style={{ fontSize: "11px", color: accent, fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>{resume.title || "PROFESSIONAL TITLE"}</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "8px", color: "#666" }}>
            {resume.email && <span>{resume.email}</span>}
            {resume.phone && <span>· {resume.phone}</span>}
            {resume.location && <span>· {resume.location}</span>}
          </div>
        </div>
        {resume.photo && (
          <div style={{ width: "80px", height: "80px", overflow: "hidden", borderRadius: "8px", flexShrink: 0 }}>
            <img src={resume.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(20%)" }} />
          </div>
        )}
      </div>
      
      {resume.summary && <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "9px", color: "#444", lineHeight: 1.8 }}>{resume.summary}</p>
      </div>}
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
        <div>
          {skills.length > 0 && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"10px"}}>Skills</h2><div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"20px"}}>{skills.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #eee",paddingBottom:"3px"}}><span style={{fontSize:"8.5px",fontWeight:"500"}}>{s.name}</span><SkillDots rating={s.rating} accent={accent} size={4}/></div>)}</div></>}
          {(resume.education||[]).some(e=>e.institution) && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"10px"}}>Education</h2>{(resume.education||[]).map(e=>(e.institution||e.degree)&&<div key={e.id} style={{marginBottom:"10px"}}><p style={{fontWeight:"700",fontSize:"8.5px"}}>{e.degree}</p><p style={{color:accent,fontSize:"8px",fontWeight:"500"}}>{e.institution}</p><p style={{color:"#888",fontSize:"7.5px"}}>{e.year}</p></div>)}</>}
          {(resume.certifications||[]).some(c=>c.name) && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"10px"}}>Certs</h2>{(resume.certifications||[]).filter(c=>c.name).map((c,i)=><p key={i} style={{fontSize:"8px",color:"#555",marginBottom:"3px"}}>— {c.name}</p>)}</>}
        </div>
        <div>
          {(resume.experience||[]).some(e=>e.company||e.role) && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"14px"}}>Experience</h2>{(resume.experience||[]).map(e=>(e.company||e.role)&&<div key={e.id} style={{marginBottom:"16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"2px"}}><p style={{fontWeight:"700",fontSize:"10px",color:"#111"}}>{e.role}</p><span style={{fontSize:"7.5px",color:"#888"}}>{e.from?e.from.replace("-","/"):""}{e.current?" – Present":e.to?" – "+e.to.replace("-","/"):""}</span></div><p style={{color:accent,fontSize:"8.5px",fontWeight:"600",marginBottom:"6px"}}>{e.company}{e.location?` · ${e.location}`:""}</p>{(e.responsibilities||[]).filter(Boolean).map((r,i)=><p key={i} style={{fontSize:"8.5px",color:"#555",lineHeight:1.6,marginBottom:"2px"}}>• {r}</p>)}{(e.bullets||[]).filter(Boolean).map((b,i)=><p key={i} style={{fontSize:"8.5px",color:"#333",fontWeight:"500",lineHeight:1.6,marginBottom:"2px"}}>› {b}</p>)}</div>)}</>}
          {(resume.projects||[]).some(p=>p.name) && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"10px",marginTop:"10px"}}>Projects</h2>{(resume.projects||[]).filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:"8px"}}><p style={{fontWeight:"700",fontSize:"9px"}}>{p.name} {p.tech&&<span style={{fontWeight:"normal",color:accent,fontSize:"8px"}}>({p.tech})</span>}</p>{p.description&&<p style={{fontSize:"8.5px",color:"#555",lineHeight:1.5}}>{p.description}</p>}</div>)}</>}
          {(resume.achievements||[]).some(a=>a.text) && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"10px",marginTop:"10px"}}>Achievements</h2>{(resume.achievements||[]).map(a=>a.text&&<p key={a.id} style={{fontSize:"8.5px",color:"#555",marginBottom:"2px"}}>\u2022 {a.text}</p>)}</>}
          {resume.languages && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"6px",marginTop:"10px"}}>Languages</h2><p style={{fontSize:"8.5px",color:"#555"}}>{resume.languages}</p></>}
          {(resume.strengths||[]).some(s=>s.text) && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"6px",marginTop:"10px"}}>Strengths</h2>{(resume.strengths||[]).filter(s=>s.text).map(s=><p key={s.id} style={{fontSize:"8.5px",color:"#555",marginBottom:"2px"}}>\u25b8 {s.text}</p>)}</>}
          {(resume.hobbies||[]).some(h=>h.name) && <><h2 style={{fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"2px",color:"#111",marginBottom:"6px",marginTop:"10px"}}>Hobbies</h2><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{(resume.hobbies||[]).filter(h=>h.name).map(h=><span key={h.id} style={{fontSize:"8.5px",color:"#555"}}>{h.icon&&<span style={{marginRight:"2px"}}>{h.icon}</span>}{h.name}</span>)}</div></>}
        </div>
      </div>
    </div>
  );
}
