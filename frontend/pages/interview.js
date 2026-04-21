import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme, THEMES, usePlan, PLAN_LIMITS } from "../lib/contexts";
import Sidebar from "../components/Sidebar";

const SAMPLE_QUESTIONS = {
  behavioral: [
    { q: "Tell me about yourself.", answer: "Use the Present-Past-Future formula: Start with your current role, briefly mention your background, then explain why you're excited about this opportunity. Keep it to 2 minutes.", category: "Behavioral", difficulty: "Easy" },
    { q: "What is your greatest strength?", answer: "Pick one relevant strength, give a specific example using STAR method, and tie it to how it will help in this role.", category: "Behavioral", difficulty: "Easy" },
    { q: "What is your greatest weakness?", answer: "Choose a real weakness you've improved. Show self-awareness + growth. E.g. 'I used to struggle with public speaking, so I joined Toastmasters and now lead team meetings.'", category: "Behavioral", difficulty: "Medium" },
    { q: "Where do you see yourself in 5 years?", answer: "Show ambition but align with the company's growth. E.g. 'I see myself growing into a senior role, leading projects and mentoring junior team members here.'", category: "Behavioral", difficulty: "Easy" },
    { q: "Why are you leaving your current job?", answer: "Stay positive. Focus on growth, not complaints. E.g. 'I'm looking for new challenges and this role aligns perfectly with where I want to grow.'", category: "Behavioral", difficulty: "Medium" },
  ],
  technical: [
    { q: "Explain a technical project you're proud of.", answer: "Use STAR: Describe the problem, your technical approach, tools used, and the measurable outcome. Highlight your specific contribution.", category: "Technical", difficulty: "Medium" },
    { q: "How do you stay updated with technology trends?", answer: "Mention specific sources: newsletters, GitHub, conferences, courses. Show genuine curiosity with examples.", category: "Technical", difficulty: "Easy" },
  ],
  hr: [
    { q: "Why do you want to work at our company?", answer: "Research 3 specific things: company culture, product/mission, recent news. Show you've done your homework.", category: "HR Round", difficulty: "Easy" },
    { q: "What are your salary expectations?", answer: "Research market rates first. Give a range based on your research. E.g. 'Based on my experience and market research, I'm looking at ₹X-Y LPA, though I'm open to discussion.'", category: "HR Round", difficulty: "Medium" },
    { q: "Do you have any questions for us?", answer: "Always have 3-5 questions ready: about the team, day-to-day responsibilities, growth opportunities, company culture, success metrics for this role.", category: "HR Round", difficulty: "Easy" },
  ],
};

export default function Interview() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const { theme: t, themeName, setTheme } = useTheme();
  const themes = THEMES;
  const { plan, limits, canAccess } = usePlan();
  const [activeTab, setActiveTab] = useState("generate");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [level, setLevel] = useState("Mid Level");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [openQ, setOpenQ] = useState(null);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [progress, setProgress] = useState({});
  const [contributions, setContributions] = useState([]);
  const [showContrib, setShowContrib] = useState(false);
  const [newContrib, setNewContrib] = useState({ company: "", role: "", questions_raw: "", difficulty: "Medium", date: new Date().toISOString().split("T")[0] });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchContrib, setSearchContrib] = useState("");
  const navItems = [
    { id: "home", icon: "⊞", label: "Home", href: "/dashboard" },
    { id: "jobs", icon: "🔍", label: "Find Job", href: "/find-job" },
    { id: "resume", icon: "📄", label: "Resume Builder", href: "/resume" },
    { id: "apply", icon: "📧", label: "One-Click Apply", href: "/apply" },
    { id: "tracker", icon: "📊", label: "Track Application", href: "/tracker" },
    { id: "interview", icon: "🎯", label: "Interview Prep", href: "/interview" },
    { id: "pricing", icon: "⚡", label: "Upgrade", href: "/pricing" },
  ];

  const categories = ["All", "Behavioral", "Technical", "HR Round", "Situational", "Company Fit"];
  const levels = ["Fresher", "Junior", "Mid Level", "Senior", "Lead"];
  const difficulties = ["Easy", "Medium", "Hard"];

  const tips = [
    { icon: "⭐", title: "STAR Method", desc: "Situation → Task → Action → Result" },
    { icon: "🔍", title: "Research First", desc: "Research company before interview" },
    { icon: "❓", title: "Ask Questions", desc: "Prepare 3-5 smart questions" },
    { icon: "🎯", title: "Be Specific", desc: "Use real examples from experience" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
    });
    // Load contributions from localStorage
    const saved = localStorage.getItem("resumeora_contributions");
    if (saved) setContributions(JSON.parse(saved));
  }, []);

  const handleTheme = (name) => setTheme(name);
  const handleNav = (item) => router.push(item.href);
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const generateQuestions = async () => {
    if (!jobTitle) { setError("Please enter a job title!"); return; }
    setLoading(true); setError(""); setQuestions([]); setOpenQ(null); setProgress({});
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview-prep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: jobTitle, company: company || "the company", level, count: 20 }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        // Fallback to enhanced local questions
        const fallback = generateFallbackQuestions(jobTitle, company, level);
        setQuestions(fallback);
      }
    } catch (err) {
      // Use fallback questions if backend fails
      const fallback = generateFallbackQuestions(jobTitle, company, level);
      setQuestions(fallback);
      setError("");
    }
    setLoading(false);
  };

  const generateFallbackQuestions = (title, comp, lvl) => {
    const q = [
      { question: `Tell me about yourself and your journey to becoming a ${title}.`, category: "Behavioral", difficulty: "Easy", answer: "Use Present-Past-Future: Current role → background → why excited about this role. Keep it under 2 minutes." },
      { question: `Why do you want to work at ${comp || "our company"}?`, category: "HR Round", difficulty: "Easy", answer: "Research 3 specific things about the company. Show you've done homework on their mission, product, and culture." },
      { question: `What is your greatest strength as a ${title}?`, category: "Behavioral", difficulty: "Easy", answer: "Pick one relevant strength, give a specific example using STAR method, tie it to the role." },
      { question: "What is your greatest weakness and how are you working on it?", category: "Behavioral", difficulty: "Medium", answer: "Choose a real weakness you've improved. Show self-awareness + growth mindset." },
      { question: `Where do you see yourself in 5 years?`, category: "HR Round", difficulty: "Easy", answer: "Show ambition aligned with company growth. Mention wanting to grow into a senior role here." },
      { question: `Describe a challenging project you worked on as a ${title} and how you handled it.`, category: "Behavioral", difficulty: "Hard", answer: "STAR: Situation (the challenge), Task (your role), Action (what you did), Result (measurable outcome)." },
      { question: "How do you handle tight deadlines and pressure?", category: "Situational", difficulty: "Medium", answer: "Give a specific example. Mention prioritisation, communication, and staying focused." },
      { question: "Tell me about a time you disagreed with your manager. How did you handle it?", category: "Behavioral", difficulty: "Hard", answer: "Show professionalism. Describe how you raised concerns respectfully and found a solution." },
      { question: `What are the key skills required for a ${title} role in today's market?`, category: "Technical", difficulty: "Medium", answer: "Research current job descriptions and mention 5-6 relevant technical + soft skills." },
      { question: "How do you stay updated with the latest trends in your field?", category: "Technical", difficulty: "Easy", answer: "Mention specific sources: newsletters, conferences, GitHub, LinkedIn Learning, courses." },
      { question: "Describe your experience working in a team. What role do you usually play?", category: "Behavioral", difficulty: "Medium", answer: "Give examples of both leading and contributing. Show flexibility and collaboration." },
      { question: "How do you prioritise when you have multiple tasks with the same deadline?", category: "Situational", difficulty: "Medium", answer: "Describe your prioritisation framework: urgency, impact, stakeholder expectations." },
      { question: `What tools and technologies do you use in your daily work as a ${title}?`, category: "Technical", difficulty: "Easy", answer: "List relevant tools specific to the role. Show depth of knowledge, not just surface familiarity." },
      { question: "Tell me about a time you failed. What did you learn from it?", category: "Behavioral", difficulty: "Hard", answer: "Choose a real failure, take accountability, focus on what you learned and how you improved." },
      { question: "How do you ensure quality in your work?", category: "Situational", difficulty: "Medium", answer: "Describe your quality checklist, peer reviews, testing, and attention to detail." },
      { question: "What motivates you in your work?", category: "HR Round", difficulty: "Easy", answer: "Be genuine. Tie motivation to impact, growth, problem-solving, or helping others." },
      { question: `How would you approach your first 90 days as a ${title} at ${comp || "this company"}?`, category: "Company Fit", difficulty: "Hard", answer: "30-60-90 day plan: Learn (month 1), Contribute (month 2), Lead initiatives (month 3)." },
      { question: "Describe a time when you had to learn something new quickly.", category: "Behavioral", difficulty: "Medium", answer: "STAR method. Show learning agility, resourcefulness, and the positive outcome." },
      { question: "How do you handle constructive criticism?", category: "Behavioral", difficulty: "Easy", answer: "Show openness to feedback, ability to reflect, and give an example of acting on feedback." },
      { question: "Do you have any questions for us?", category: "HR Round", difficulty: "Easy", answer: "Always ask: 1) What does success look like in this role? 2) Team culture? 3) Growth opportunities? 4) Next steps?" },
    ];
    return q;
  };

  const submitContribution = async () => {
    if (!newContrib.company || !newContrib.role || !newContrib.questions_raw) {
      alert("Please fill company, role and questions!");
      return;
    }
    setSubmitting(true);
    const contrib = {
      id: Date.now().toString(),
      company: newContrib.company,
      role: newContrib.role,
      difficulty: newContrib.difficulty,
      date: newContrib.date,
      questions: newContrib.questions_raw.split("\n").filter(q => q.trim()).map(q => q.trim()),
      submitted_by: user?.email?.split("@")[0],
      submitted_at: new Date().toLocaleString(),
    };
    const updated = [contrib, ...contributions];
    setContributions(updated);
    localStorage.setItem("resumeora_contributions", JSON.stringify(updated));
    // Try to save to Supabase
    try {
      await supabase.from("interview_contributions").insert([contrib]);
    } catch (err) {}
    setSubmitting(false);
    setSubmitSuccess(true);
    setNewContrib({ company: "", role: "", questions_raw: "", difficulty: "Medium", date: new Date().toISOString().split("T")[0] });
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const filteredQuestions = questions.filter(q => {
    if (activeCategory === "All") return true;
    const cat = typeof q === "object" ? q.category : "";
    return cat === activeCategory;
  });

  const filteredContribs = contributions.filter(c =>
    c.company?.toLowerCase().includes(searchContrib.toLowerCase()) ||
    c.role?.toLowerCase().includes(searchContrib.toLowerCase())
  );

  const doneCount = Object.values(progress).filter(Boolean).length;
  const firstName = user?.email?.split("@")[0] || "";
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif", transition: "all 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.3); border-radius:4px; }
        .nav-item:hover { background:rgba(108,99,255,0.1) !important; }
        .q-card { transition:all 0.2s; }
        .q-card:hover { border-color:rgba(108,99,255,0.3) !important; }
        .action-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(108,99,255,0.35) !important; }
        .theme-btn:hover { background:rgba(108,99,255,0.2) !important; }
        .tip-card:hover { transform:translateY(-4px) !important; border-color:rgba(108,99,255,0.3) !important; }
        .contrib-card:hover { border-color:rgba(108,99,255,0.3) !important; }
        input::placeholder, textarea::placeholder { color:${t.muted}; }
        input, select, textarea { color:${t.text}; }
        select option { background:#1a1a2e; color:white; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.4s ease forwards; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <Sidebar activeId="interview" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />

      {/* MAIN */}
      <main className="mobile-main" style={{ flex: 1, marginLeft: collapsed ? "68px" : "232px", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column" }}>
        <header style={{ height: "56px", background: `${t.sidebar}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.muted, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>← Dashboard</button>
            <span style={{ color: t.muted }}>/</span>
            <span style={{ color: t.text, fontSize: "13px", fontWeight: "500" }}>Interview Prep</span>
          </div>
          {questions.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: t.muted, fontSize: "12px" }}>{doneCount}/{questions.length} practiced</span>
              <div style={{ width: "100px", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${questions.length > 0 ? (doneCount / questions.length) * 100 : 0}%`, background: "linear-gradient(90deg,#6C63FF,#43D9A2)", borderRadius: "100px", transition: "width 0.4s" }} />
              </div>
            </div>
          )}
        </header>

        <div style={{ padding: "24px 28px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "920px" }}>

            {/* ── PLAN GATE or CONTENT ── */}
            {!canAccess("interview") ? (
              <div style={{ background: "linear-gradient(135deg,rgba(108,99,255,0.12),rgba(255,101,132,0.08))", border: "1px solid rgba(108,99,255,0.3)", borderRadius: "20px", padding: "60px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔒</div>
                <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "24px", fontWeight: "700", color: t.text, marginBottom: "10px" }}>Interview Prep is a Standard feature</h2>
                <p style={{ color: t.muted, fontSize: "14px", lineHeight: "1.75", marginBottom: "28px", maxWidth: "480px", margin: "0 auto 28px" }}>You're on the <strong style={{ color: t.text }}>{limits.label}</strong> plan. Upgrade to Standard or Pro to unlock AI-generated interview questions, community Q&A, expert answer tips, and progress tracking.</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => router.push("/pricing")}
                    style={{ padding: "13px 32px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(108,99,255,0.4)" }}>
                    ⚡ Upgrade to Standard — ₹199/mo
                  </button>
                  <button onClick={() => router.push("/pricing")}
                    style={{ padding: "13px 24px", background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>
                    View All Plans
                  </button>
                </div>
              </div>
            ) : (<>
            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ color: t.accent, fontSize: "12px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>INTERVIEW PREP</p>
              <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(22px,3vw,38px)", fontWeight: "700", color: t.text, marginBottom: "6px" }}>
                Interview <span style={{ fontStyle: "italic", color: "#FF6584" }}>Mastery</span>
              </h1>
              <p style={{ color: t.muted, fontSize: "14px" }}>Generate 20 tailored questions, learn from real interview experiences, and master your answers.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "4px", background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "4px", marginBottom: "24px", width: "fit-content" }}>
              {[["generate", "🎯 Generate Questions"], ["contribute", "✍️ Share Experience"], ["community", "👥 Community Q&A"]].map(([tab, label]) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: "9px 18px", background: activeTab === tab ? "linear-gradient(135deg,#6C63FF,#FF6584)" : "transparent", color: activeTab === tab ? "white" : t.muted, border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab ? "600" : "400", transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── GENERATE TAB ── */}
            {activeTab === "generate" && (
              <>
                {/* Tips */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "20px" }}>
                  {tips.map((tip, i) => (
                    <div key={i} className="tip-card" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "14px", transition: "all 0.3s" }}>
                      <div style={{ fontSize: "20px", marginBottom: "6px" }}>{tip.icon}</div>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: t.text, marginBottom: "3px" }}>{tip.title}</div>
                      <div style={{ fontSize: "11px", color: t.muted, lineHeight: "1.5" }}>{tip.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Generator form */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "22px", marginBottom: "20px" }}>
                  <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "17px", fontWeight: "600", color: t.text, marginBottom: "16px" }}>Generate 20 Interview Questions</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Job Title *</label>
                      <input type="text" placeholder="e.g. Data Analyst" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                        onKeyPress={e => e.key === "Enter" && generateQuestions()}
                        style={{ width: "100%", padding: "10px 13px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Company (Optional)</label>
                      <input type="text" placeholder="e.g. TCS, Google" value={company} onChange={e => setCompany(e.target.value)}
                        style={{ width: "100%", padding: "10px 13px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Experience Level</label>
                      <select value={level} onChange={e => setLevel(e.target.value)}
                        style={{ width: "100%", padding: "10px 13px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "13px", outline: "none" }}>
                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <button className="action-btn" onClick={generateQuestions} disabled={loading}
                    style={{ width: "100%", padding: "13px", background: loading ? t.border : "linear-gradient(135deg,#6C63FF,#FF6584)", color: loading ? t.muted : "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s" }}>
                    {loading ? "🤖 Generating 20 questions..." : "✨ Generate 20 Interview Questions"}
                  </button>
                </div>

                {/* Questions list */}
                {questions.length > 0 && (
                  <div className="fade-up">
                    <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                          style={{ padding: "5px 13px", background: activeCategory === cat ? "rgba(108,99,255,0.15)" : t.card, border: `1px solid ${activeCategory === cat ? "rgba(108,99,255,0.4)" : t.border}`, borderRadius: "100px", color: activeCategory === cat ? "#A29BFE" : t.muted, fontSize: "11px", fontWeight: activeCategory === cat ? "600" : "400", cursor: "pointer", transition: "all 0.2s" }}>
                          {cat}
                        </button>
                      ))}
                      <span style={{ marginLeft: "auto", color: t.muted, fontSize: "12px" }}>{filteredQuestions.length} questions</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {filteredQuestions.map((q, i) => {
                        const qText = typeof q === "string" ? q : q.question || q;
                        const answer = typeof q === "object" ? q.answer : null;
                        const cat = typeof q === "object" ? q.category : "";
                        const diff = typeof q === "object" ? q.difficulty : "";
                        const isDone = progress[i];
                        const diffColor = diff === "Easy" ? "#43D9A2" : diff === "Hard" ? "#FF6584" : "#FFB347";
                        return (
                          <div key={i} className="q-card"
                            style={{ background: isDone ? `${t.accent}06` : t.card, border: `1px solid ${isDone ? t.accent + "33" : t.border}`, borderRadius: "12px", padding: "14px 18px" }}>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                              <div onClick={() => { const p = {...progress}; p[i] = !p[i]; setProgress(p); }}
                                style={{ width: "22px", height: "22px", borderRadius: "7px", border: isDone ? "none" : `2px solid ${t.border}`, background: isDone ? "#43D9A2" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>
                                {isDone ? "✓" : ""}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                                  <p style={{ color: t.text, fontSize: "13px", fontWeight: "500", lineHeight: "1.5", flex: 1 }}>{qText}</p>
                                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                                    {cat && <span style={{ background: `${t.accent}15`, color: t.accent, padding: "2px 8px", borderRadius: "4px", fontSize: "10px" }}>{cat}</span>}
                                    {diff && <span style={{ background: `${diffColor}15`, color: diffColor, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600" }}>{diff}</span>}
                                    <button onClick={() => setOpenQ(openQ === i ? null : i)}
                                      style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: "18px", lineHeight: "1" }}>
                                      {openQ === i ? "−" : "+"}
                                    </button>
                                  </div>
                                </div>
                                {openQ === i && (
                                  <div style={{ marginTop: "10px", padding: "12px 14px", background: `${t.accent}08`, borderRadius: "8px", borderLeft: `3px solid ${t.accent}` }}>
                                    <p style={{ color: t.accent, fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>💡 How to Answer</p>
                                    <p style={{ color: t.muted, fontSize: "12px", lineHeight: "1.7" }}>
                                      {answer || "Use the STAR method: Situation → Task → Action → Result. Be specific with examples from your experience."}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: "16px", padding: "12px 18px", background: `${t.accent}08`, borderRadius: "10px", border: `1px solid ${t.accent}20`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <p style={{ color: t.muted, fontSize: "12px" }}>💡 Check off each question after practicing out loud using the STAR method.</p>
                      <button onClick={() => { setQuestions([]); setProgress({}); setOpenQ(null); }}
                        style={{ padding: "7px 16px", background: t.inputBg, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "7px", fontSize: "12px", cursor: "pointer" }}>
                        Start Over
                      </button>
                    </div>
                  </div>
                )}

                {questions.length === 0 && !loading && (
                  <div style={{ textAlign: "center", padding: "40px", background: t.card, borderRadius: "16px", border: `1px solid ${t.border}` }}>
                    <div style={{ fontSize: "48px", marginBottom: "14px" }}>🎯</div>
                    <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "18px", fontWeight: "600", color: t.text, marginBottom: "8px" }}>Ready to ace your interview?</h3>
                    <p style={{ color: t.muted, fontSize: "13px" }}>Enter your job title above to generate 20 tailored questions with expert answers.</p>
                  </div>
                )}
              </>
            )}

            {/* ── CONTRIBUTE TAB ── */}
            {activeTab === "contribute" && (
              <div>
                <div style={{ background: `rgba(108,99,255,0.06)`, border: `1px solid rgba(108,99,255,0.2)`, borderRadius: "14px", padding: "18px 22px", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "16px", fontWeight: "600", color: t.text, marginBottom: "8px" }}>✍️ Share Your Interview Experience</h3>
                  <p style={{ color: t.muted, fontSize: "13px", lineHeight: "1.6" }}>
                    Just attended an interview? Share the questions you were asked — in raw, natural form. It helps thousands of other job seekers prepare better!
                  </p>
                </div>

                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "22px", marginBottom: "20px" }}>
                  {submitSuccess && (
                    <div style={{ background: "rgba(67,217,162,0.1)", border: "1px solid rgba(67,217,162,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#43D9A2", fontSize: "13px" }}>
                      ✅ Thank you! Your experience has been submitted and will help other job seekers!
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Company *</label>
                      <input type="text" placeholder="e.g. Morningstar, TCS" value={newContrib.company} onChange={e => setNewContrib({ ...newContrib, company: e.target.value })}
                        style={{ width: "100%", padding: "10px 13px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Role Applied For *</label>
                      <input type="text" placeholder="e.g. Data Analyst" value={newContrib.role} onChange={e => setNewContrib({ ...newContrib, role: e.target.value })}
                        style={{ width: "100%", padding: "10px 13px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Difficulty</label>
                        <select value={newContrib.difficulty} onChange={e => setNewContrib({ ...newContrib, difficulty: e.target.value })}
                          style={{ width: "100%", padding: "10px 8px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "12px", outline: "none" }}>
                          {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Date</label>
                        <input type="date" value={newContrib.date} onChange={e => setNewContrib({ ...newContrib, date: e.target.value })}
                          style={{ width: "100%", padding: "10px 8px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "12px", outline: "none" }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Questions Asked * (one per line)</label>
                    <textarea value={newContrib.questions_raw} onChange={e => setNewContrib({ ...newContrib, questions_raw: e.target.value })}
                      placeholder={"Tell me about yourself\nWhy do you want this role?\nWhat are your strengths?\n...add as many as you remember"}
                      rows={8}
                      style={{ width: "100%", padding: "12px 14px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", fontSize: "13px", lineHeight: "1.7", resize: "vertical", outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
                    <p style={{ color: t.muted, fontSize: "11px", marginTop: "5px" }}>Write questions exactly as you remember them — raw and natural is fine!</p>
                  </div>
                  <button onClick={submitContribution} disabled={submitting}
                    style={{ width: "100%", padding: "13px", background: submitting ? t.border : "linear-gradient(135deg,#6C63FF,#FF6584)", color: submitting ? t.muted : "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.3s" }}>
                    {submitting ? "Submitting..." : "🚀 Submit My Experience"}
                  </button>
                </div>
              </div>
            )}

            {/* ── COMMUNITY TAB ── */}
            {activeTab === "community" && (
              <div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                  <input type="text" placeholder="🔍 Search by company or role..." value={searchContrib} onChange={e => setSearchContrib(e.target.value)}
                    style={{ flex: 1, minWidth: "200px", padding: "10px 14px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "9px", fontSize: "13px", outline: "none" }} />
                  <button onClick={() => setActiveTab("contribute")}
                    style={{ padding: "10px 18px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    + Share Experience
                  </button>
                </div>

                {filteredContribs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 20px", background: t.card, borderRadius: "16px", border: `1px solid ${t.border}` }}>
                    <div style={{ fontSize: "48px", marginBottom: "14px" }}>👥</div>
                    <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "18px", fontWeight: "600", color: t.text, marginBottom: "8px" }}>No contributions yet</h3>
                    <p style={{ color: t.muted, fontSize: "13px", marginBottom: "20px" }}>Be the first to share your interview experience and help other job seekers!</p>
                    <button onClick={() => setActiveTab("contribute")}
                      style={{ padding: "11px 24px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                      ✍️ Share Your Experience
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {filteredContribs.map((c, i) => (
                      <div key={i} className="contrib-card" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "20px 22px", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                          <div>
                            <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "16px", fontWeight: "600", color: t.text, marginBottom: "3px" }}>{c.role}</h3>
                            <p style={{ color: "#6C63FF", fontSize: "13px", fontWeight: "500" }}>{c.company}</p>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ background: c.difficulty === "Easy" ? "rgba(67,217,162,0.1)" : c.difficulty === "Hard" ? "rgba(255,101,132,0.1)" : "rgba(255,179,71,0.1)", color: c.difficulty === "Easy" ? "#43D9A2" : c.difficulty === "Hard" ? "#FF6584" : "#FFB347", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: "600" }}>{c.difficulty}</span>
                            <span style={{ color: t.muted, fontSize: "11px" }}>📅 {c.date}</span>
                            <span style={{ color: t.muted, fontSize: "11px" }}>by {c.submitted_by}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {c.questions.map((q, j) => (
                            <div key={j} style={{ display: "flex", gap: "10px", padding: "8px 12px", background: t.inputBg, borderRadius: "8px" }}>
                              <span style={{ color: t.accent, fontSize: "12px", fontWeight: "600", flexShrink: 0 }}>{j + 1}.</span>
                              <p style={{ color: t.text, fontSize: "13px", margin: 0 }}>{q}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}</>) }
          </div>
        </div>
      </main>
    </div>
  );
}
