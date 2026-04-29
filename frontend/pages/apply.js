import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme, THEMES, usePlan, PLAN_LIMITS } from "../lib/contexts";
import Sidebar from "../components/Sidebar";

export default function Apply() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const { theme: t, themeName, setTheme } = useTheme();
  const themes = THEMES;
  const { plan, limits, canAccess } = usePlan();
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [coverLetters, setCoverLetters] = useState({});
  const [generating, setGenerating] = useState({});
  const [sending, setSending] = useState({});
  const [sent, setSent] = useState({});
  const [hrEmail, setHrEmail] = useState({});
  const [activeJob, setActiveJob] = useState(null);
  const [yourName, setYourName] = useState("");
  const [yourRole, setYourRole] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const navItems = [
    { id: "home", icon: "⊞", label: "Home", href: "/dashboard" },
    { id: "jobs", icon: "🔍", label: "Find Job", href: "/find-job" },
    { id: "resume", icon: "📄", label: "Resume Builder", href: "/resume" },
    { id: "apply", icon: "📧", label: "One-Click Apply", href: "/apply" },
    { id: "tracker", icon: "📊", label: "Track Application", href: "/tracker" },
    { id: "interview", icon: "🎯", label: "Interview Prep", href: "/interview" },
    { id: "pricing", icon: "⚡", label: "Upgrade", href: "/pricing" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      const name = session.user.user_metadata?.full_name?.split(" ")[0] || session.user.email.split("@")[0];
      setYourName(name);
    });
    // Load selected jobs from localStorage
    const saved = localStorage.getItem("jobwin_selected_jobs");
    if (saved) {
      const jobs = JSON.parse(saved);
      setSelectedJobs(jobs);
      if (jobs.length > 0) setActiveJob(0);
    }
    // Load resume data for AI context
    try {
      const resumes = JSON.parse(localStorage.getItem("jobwin_resumes") || "[]");
      if (resumes.length > 0) {
        const r = resumes[0];
        setResumeData(r);
        if (r.name) setYourName(r.name);
        if (r.title) setYourRole(r.title);
      }
    } catch (e) {}
  }, []);

  const handleTheme = (name) => setTheme(name);

  const handleNav = (item) => router.push(item.href);
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const removeJob = (i) => {
    const updated = selectedJobs.filter((_, idx) => idx !== i);
    setSelectedJobs(updated);
    localStorage.setItem("jobwin_selected_jobs", JSON.stringify(updated));
    if (activeJob >= updated.length) setActiveJob(Math.max(0, updated.length - 1));
  };

  const generateCoverLetter = async (job, index) => {
    setGenerating(prev => ({ ...prev, [index]: true }));
    try {
      // Build experience summary from resume data if available
      const expSummary = resumeData
        ? (resumeData.experience || []).map(e =>
            `${e.role || ""} at ${e.company || ""} (${e.duration || ""}): ${e.bullets?.join(", ") || e.description || ""}`
          ).join("\n") || resumeData.summary || yourRole || "Experienced professional"
        : yourRole || "Experienced professional";

      const skillsSummary = resumeData
        ? (resumeData.skills || []).map(s => s.name || s).join(", ") || "Various technical and soft skills"
        : "Various technical and soft skills";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: yourName || "Candidate",
          user_experience: expSummary,
          user_skills: skillsSummary,
          job_title: job.title || "the position",
          job_company: job.company || "the company",
          job_description: job.ai_summary || job.description || job.title || "",
          hr_name: "Hiring Manager",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Backend error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const letter = data.cover_letter || data.letter || "";
      if (!letter) throw new Error("Empty response from AI");
      setCoverLetters(prev => ({ ...prev, [index]: letter }));
    } catch (err) {
      console.error("Cover letter error:", err);
      setCoverLetters(prev => ({ ...prev, [index]: `Error: ${err.message}. Make sure the backend is running at ${process.env.NEXT_PUBLIC_API_URL}` }));
    }
    setGenerating(prev => ({ ...prev, [index]: false }));
  };

  const generateAllCoverLetters = async () => {
    for (let i = 0; i < selectedJobs.length; i++) {
      if (!coverLetters[i]) await generateCoverLetter(selectedJobs[i], i);
    }
  };

  const sendEmail = async (job, index) => {
    if (!hrEmail[index]) { alert("Please enter HR email address!"); return; }
    if (!coverLetters[index]) { alert("Please generate cover letter first!"); return; }
    setSending({ ...sending, [index]: true });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hr_email: hrEmail[index],
          job_title: job.title,
          company: job.company,
          cover_letter: coverLetters[index],
          candidate_name: yourName,
          candidate_email: user?.email,
        }),
      });
      if (res.ok) {
        setSent({ ...sent, [index]: true });
      } else {
        alert("Failed to send email. Please try again.");
      }
    } catch (err) {
      alert("Error sending email. Check backend is running.");
    }
    setSending({ ...sending, [index]: false });
  };

  const firstName = user?.email?.split("@")[0] || "";
  const initials = firstName.slice(0, 2).toUpperCase();
  const sentCount = Object.values(sent).filter(Boolean).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif", transition: "all 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.3); border-radius:4px; }
        .nav-item:hover { background:rgba(108,99,255,0.1) !important; }
        .job-tab:hover { background:rgba(108,99,255,0.08) !important; }
        .action-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(108,99,255,0.35) !important; }
        .theme-btn:hover { background:rgba(108,99,255,0.2) !important; }
        input::placeholder, textarea::placeholder { color:${t.muted}; }
        input, textarea { color:${t.text}; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <Sidebar activeId="apply" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />

      {/* ── MAIN ── */}
      <main className="mobile-main" style={{ flex: 1, marginLeft: collapsed ? "72px" : "240px", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <header style={{ height: "56px", background: `${t.sidebar}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.muted, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", transition: "all 0.2s" }}>← Dashboard</button>
            <span style={{ color: t.muted, fontSize: "13px" }}>/</span>
            <span style={{ color: t.text, fontSize: "13px", fontWeight: "500" }}>One-Click Apply</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {sentCount > 0 && <div style={{ background: "rgba(67,217,162,0.1)", border: "1px solid rgba(67,217,162,0.2)", borderRadius: "100px", padding: "4px 12px", fontSize: "11px", color: "#43D9A2", fontWeight: "600" }}>✓ {sentCount} Applied</div>}
            <div style={{ background: plan !== "free" ? "rgba(108,99,255,0.1)" : "rgba(67,217,162,0.1)", border: `1px solid ${plan !== "free" ? "rgba(108,99,255,0.2)" : "rgba(67,217,162,0.2)"}`, borderRadius: "100px", padding: "4px 12px", fontSize: "10px", color: plan !== "free" ? "#A29BFE" : "#43D9A2", fontWeight: "600", letterSpacing: "1px" }}>{(limits?.label || "Free").toUpperCase()} PLAN</div>
          </div>
        </header>

        <div style={{ padding: "28px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "960px" }}>

            {/* ── PLAN GATE or CONTENT ── */}
            {!canAccess("apply") ? (
              <div style={{ background: "linear-gradient(135deg,rgba(108,99,255,0.12),rgba(255,101,132,0.08))", border: "1px solid rgba(108,99,255,0.3)", borderRadius: "20px", padding: "60px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔒</div>
                <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "24px", fontWeight: "700", color: t.text, marginBottom: "10px" }}>One-Click Apply is a Basic feature</h2>
                <p style={{ color: t.muted, fontSize: "14px", lineHeight: "1.75", marginBottom: "28px", maxWidth: "480px", margin: "0 auto 28px" }}>You're on the <strong style={{ color: t.text }}>{limits.label}</strong> plan. Upgrade to Basic or higher to generate AI cover letters and send applications directly from JobwinResume.</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => router.push("/pricing")}
                    style={{ padding: "13px 32px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(108,99,255,0.4)" }}>
                    ⚡ Upgrade to Basic — ₹99/10 days
                  </button>
                  <button onClick={() => router.push("/pricing")}
                    style={{ padding: "13px 24px", background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>
                    View All Plans
                  </button>
                </div>
              </div>
            ) : (<>

            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
              <p style={{ color: t.accent, fontSize: "12px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>ONE-CLICK APPLY</p>
              <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(24px,3vw,40px)", fontWeight: "700", color: t.text, marginBottom: "8px" }}>
                Apply to your <span style={{ fontStyle: "italic", color: "#FF6584" }}>dream jobs</span> instantly.
              </h1>
              <p style={{ color: t.muted, fontSize: "14px" }}>AI writes personalised cover letters for each job. Send via email or apply directly.</p>
            </div>

            {/* No jobs selected */}
            {selectedJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: t.card, borderRadius: "20px", border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>📭</div>
                <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "600", color: t.text, marginBottom: "10px" }}>No jobs selected yet</h3>
                <p style={{ color: t.muted, fontSize: "14px", marginBottom: "24px" }}>Go to Find Job, search for jobs and select the ones you want to apply to.</p>
                <button className="action-btn" onClick={() => router.push("/find-job")}
                  style={{ padding: "13px 28px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s" }}>
                  🔍 Find Jobs to Apply
                </button>
              </div>
            ) : (
              <>
                {/* Your profile */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "20px 24px", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "16px", fontWeight: "600", color: t.text, marginBottom: "14px" }}>👤 Your Profile</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ color: t.muted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Your Name</label>
                      <input type="text" value={yourName} onChange={e => setYourName(e.target.value)} placeholder="Your full name"
                        style={{ width: "100%", padding: "10px 14px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ color: t.muted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Your Target Role</label>
                      <input type="text" value={yourRole} onChange={e => setYourRole(e.target.value)} placeholder="e.g. Data Analyst"
                        style={{ width: "100%", padding: "10px 14px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", outline: "none" }} />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
                  {[
                    { n: selectedJobs.length, l: "Jobs Selected", i: "📋", c: t.accent },
                    { n: Object.values(coverLetters).filter(Boolean).length, l: "Letters Generated", i: "✍️", c: "#FFB347" },
                    { n: sentCount, l: "Applications Sent", i: "📧", c: "#43D9A2" },
                    { n: selectedJobs.length - sentCount, l: "Remaining", i: "⏳", c: "#FF6584" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.i}</div>
                      <div style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "700", color: s.c, marginBottom: "2px" }}>{s.n}</div>
                      <div style={{ color: t.muted, fontSize: "11px" }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Generate all button */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button className="action-btn" onClick={generateAllCoverLetters}
                    style={{ padding: "11px 22px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s" }}>
                    ✨ Generate All Cover Letters
                  </button>
                  <button onClick={() => router.push("/find-job")}
                    style={{ padding: "11px 22px", background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>
                    + Add More Jobs
                  </button>
                </div>

                {/* Job tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
                  {selectedJobs.map((job, i) => (
                    <button key={i} className="job-tab" onClick={() => setActiveJob(i)}
                      style={{ padding: "8px 16px", background: activeJob === i ? "rgba(108,99,255,0.15)" : t.card, border: `1px solid ${activeJob === i ? "rgba(108,99,255,0.4)" : t.border}`, borderRadius: "8px", cursor: "pointer", fontSize: "12px", color: activeJob === i ? "#A29BFE" : t.muted, whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}>
                      {sent[i] && <span style={{ color: "#43D9A2" }}>✓</span>}
                      {job.company} — {job.title?.slice(0, 20)}{job.title?.length > 20 ? "..." : ""}
                    </button>
                  ))}
                </div>

                {/* Active job card */}
                {activeJob !== null && selectedJobs[activeJob] && (
                  <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px", marginBottom: "16px" }}>
                    {(() => {
                      const job = selectedJobs[activeJob];
                      const idx = activeJob;
                      return (
                        <>
                          {/* Job info */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(108,99,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "18px", color: "#6C63FF" }}>
                                {job.company?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "18px", fontWeight: "600", color: t.text, marginBottom: "2px" }}>{job.title}</h3>
                                <p style={{ color: "#6C63FF", fontSize: "13px", fontWeight: "500" }}>{job.company}</p>
                                <p style={{ color: t.muted, fontSize: "12px" }}>📍 {job.location}</p>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              {sent[idx] && <span style={{ background: "rgba(67,217,162,0.1)", color: "#43D9A2", padding: "5px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" }}>✓ Applied!</span>}
                              <button onClick={() => removeJob(idx)} style={{ background: "rgba(255,101,132,0.1)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", padding: "5px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Remove</button>
                              {job.apply_link && (
                                <a href={job.apply_link} target="_blank" rel="noreferrer"
                                  style={{ background: t.inputBg, color: t.muted, border: `1px solid ${t.border}`, padding: "5px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", textDecoration: "none" }}>
                                  View Job →
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Cover letter */}
                          <div style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                              <label style={{ color: t.muted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>AI Cover Letter</label>
                              <button onClick={() => generateCoverLetter(job, idx)} disabled={generating[idx]}
                                style={{ padding: "6px 14px", background: generating[idx] ? t.border : "rgba(108,99,255,0.15)", color: generating[idx] ? t.muted : "#A29BFE", border: "1px solid rgba(108,99,255,0.3)", borderRadius: "8px", cursor: generating[idx] ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "600" }}>
                                {generating[idx] ? "✨ Generating..." : coverLetters[idx] ? "🔄 Regenerate" : "✨ Generate"}
                              </button>
                            </div>
                            <textarea
                              value={coverLetters[idx] || ""}
                              onChange={e => setCoverLetters({ ...coverLetters, [idx]: e.target.value })}
                              placeholder="Click 'Generate' to create an AI cover letter, or type your own..."
                              rows={10}
                              style={{ width: "100%", padding: "14px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", fontSize: "13px", lineHeight: "1.7", resize: "vertical", outline: "none", fontFamily: "'DM Sans',sans-serif" }}
                            />
                          </div>

                          {/* Send options */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {/* Email to HR */}
                            <div style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "16px" }}>
                              <h4 style={{ fontSize: "13px", fontWeight: "600", color: t.text, marginBottom: "10px" }}>📧 Send to HR Email</h4>
                              <input type="email" placeholder="HR email address" value={hrEmail[idx] || ""}
                                onChange={e => setHrEmail({ ...hrEmail, [idx]: e.target.value })}
                                style={{ width: "100%", padding: "9px 12px", background: t.card, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", marginBottom: "10px", outline: "none" }} />
                              <button onClick={() => sendEmail(job, idx)} disabled={sending[idx] || sent[idx]}
                                style={{ width: "100%", padding: "10px", background: sent[idx] ? "rgba(67,217,162,0.15)" : sending[idx] ? t.border : "linear-gradient(135deg,#6C63FF,#FF6584)", color: sent[idx] ? "#43D9A2" : sending[idx] ? t.muted : "white", border: `1px solid ${sent[idx] ? "rgba(67,217,162,0.3)" : "transparent"}`, borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: sent[idx] || sending[idx] ? "not-allowed" : "pointer", transition: "all 0.3s" }}>
                                {sent[idx] ? "✓ Email Sent!" : sending[idx] ? "Sending..." : "Send Email →"}
                              </button>
                            </div>

                            {/* Apply directly */}
                            <div style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "16px" }}>
                              <h4 style={{ fontSize: "13px", fontWeight: "600", color: t.text, marginBottom: "10px" }}>🌐 Apply on Job Portal</h4>
                              <p style={{ color: t.muted, fontSize: "12px", lineHeight: "1.6", marginBottom: "10px" }}>Copy your cover letter and apply directly on the company's job portal.</p>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => { navigator.clipboard.writeText(coverLetters[idx] || ""); alert("Cover letter copied!"); }}
                                  style={{ flex: 1, padding: "10px", background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                                  📋 Copy Letter
                                </button>
                                {job.apply_link && (
                                  <a href={job.apply_link} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                                    <button style={{ width: "100%", padding: "10px", background: "rgba(67,217,162,0.12)", color: "#43D9A2", border: "1px solid rgba(67,217,162,0.25)", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                                      Apply Now →
                                    </button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
