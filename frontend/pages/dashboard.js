import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme, THEMES, usePlan, PLAN_LIMITS } from "../lib/contexts";
import Sidebar from "../components/Sidebar";

function CountUp({ end, duration = 1500, prefix = "", suffix = "", decimals = 0, format = false }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    let animationFrame;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(easeOutQuart * end);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  const formattedCount = format ? Math.floor(count).toLocaleString() : count.toFixed(decimals);
  
  return <span>{prefix}{formattedCount}{suffix}</span>;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [searchRole, setSearchRole] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const { theme: t, themeName, setTheme } = useTheme();
  const { plan } = usePlan();
  const planLabel = PLAN_LIMITS[plan]?.label || "Free";
  const themes = THEMES;
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const navItems = [
    { id: "home", icon: "⊞", label: "Home" },
    { id: "resume", icon: "📄", label: "Resume Builder" },
    { id: "tracker", icon: "📊", label: "Application Tracker" },
    { id: "cover", icon: "✉️", label: "Cover Letter Generator" },
    { id: "interview", icon: "🎯", label: "Interview Prep" },
    { id: "apply", icon: "📧", label: "One Click Apply" },
    { id: "pricing", icon: "⚡", label: "Upgrade" },
  ];

  const activities = [];
  const [showChecklist, setShowChecklist] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const checklist = [
    { id: "resume", label: "Build your resume", done: false, path: "/resume", icon: "📄" },
    { id: "jobs", label: "Search your first job", done: false, path: "/find-job", icon: "🔍" },
    { id: "tracker", label: "Add an application to tracker", done: false, path: "/tracker", icon: "📊" },
    { id: "interview", label: "Try AI Interview Prep", done: false, path: "/interview", icon: "🎯" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
    });
  }, []);

  const handleNav = (id) => {
    setActiveNav(id);
    if (id === "resume") router.push("/resume");
    if (id === "tracker") router.push("/tracker");
    if (id === "cover") router.push("/apply");
    if (id === "apply") router.push("/apply");
    if (id === "interview") router.push("/interview");
    if (id === "pricing") router.push("/pricing");
  };

  const handleSearch = () => {
    if (!searchRole || !searchCity) { alert("Enter job role and city!"); return; }
    setSearching(true);
    router.push(`/jobs?role=${encodeURIComponent(searchRole)}&city=${encodeURIComponent(searchCity)}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6C63FF", fontFamily: "DM Sans, sans-serif" }}>Loading...</div>
    </div>
  );

  const firstName = user.email.split("@")[0];
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif", transition: "all 0.4s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.3); border-radius: 4px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        .nav-item:hover { background: rgba(108,99,255,0.1) !important; color: ${t.text} !important; }
        .dash-card { animation: fadeUp 0.5s ease forwards; transition: all 0.3s ease; }
        .dash-card:hover { transform: translateY(-4px) !important; border-color: rgba(108,99,255,0.3) !important; box-shadow: 0 16px 48px rgba(108,99,255,0.12) !important; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,99,255,0.4) !important; }
        .theme-btn:hover { background: rgba(108,99,255,0.2) !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        .search-input:focus { border-color: rgba(108,99,255,0.5) !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.1) !important; outline: none; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <Sidebar activeId="home" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />

      {/* ── MAIN ── */}
      <main className="mobile-main" style={{ flex: 1, marginLeft: collapsed ? "72px" : "240px", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top bar */}
        <header className="mobile-header" style={{ padding: "0 28px", height: "64px", background: `${t.sidebar}cc`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          {/* Top-bar: notifications + upgrade only — search removed (use hero card below) */}
          <div style={{ flex: 1 }}>
            <p className="mobile-hide" style={{ color: t.muted, fontSize: "13px" }}>Your career command centre 🚀</p>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Mobile Theme Switcher */}
            <div className="desktop-hide" style={{ display: "flex", gap: "6px", alignItems: "center", marginRight: "4px" }}>
               {Object.entries(THEMES).map(([thm, data]) => (
                  <div key={thm} onClick={() => setTheme(thm)}
                     title={thm}
                     style={{
                        width: "16px", height: "16px", borderRadius: "50%", cursor: "pointer",
                        background: data.bg, border: `2px solid ${themeName === thm ? data.accent || "#6C63FF" : "rgba(255,255,255,0.2)"}`
                     }} 
                  />
               ))}
            </div>
            <div style={{ background: plan !== "free" ? "rgba(108,99,255,0.1)" : "rgba(67,217,162,0.1)", border: `1px solid ${plan !== "free" ? "rgba(108,99,255,0.2)" : "rgba(67,217,162,0.2)"}`, borderRadius: "100px", padding: "5px 14px", fontSize: "11px", color: plan !== "free" ? "#A29BFE" : "#43D9A2", fontWeight: "600", letterSpacing: "1px" }}>
              {planLabel.toUpperCase()} PLAN
            </div>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <div style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🔔</div>
              {notifications > 0 && <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "16px", height: "16px", background: "#FF6584", borderRadius: "50%", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700" }}>{notifications}</div>}
            </div>
            <div style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", cursor: "pointer" }}>⚙️</div>
            <button className="action-btn" onClick={() => router.push("/pricing")}
              style={{ padding: "9px 20px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s" }}>
              ⚡ Upgrade
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="mobile-pad" style={{ padding: "32px", flex: 1 }}>

          {/* Glow effect */}
          <div style={{ position: "fixed", top: "20%", left: "40%", width: "500px", height: "400px", background: "radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "glow 4s ease-in-out infinite" }} />

          {/* Hero heading */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: "32px" }}>
            <h1 className="mobile-text-lg" style={{ fontFamily: "'Noto Serif', serif", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: "700", color: t.text, marginBottom: "8px", lineHeight: "1.2" }}>
              Welcome back, <span style={{ fontStyle: "italic", color: "#6C63FF" }}>{firstName}.</span>
            </h1>
            <p style={{ color: t.muted, fontSize: "15px", marginBottom: "20px" }}>Your career trajectory is looking great — let's keep the momentum going! 🚀</p>
            
            {/* Quick Actions */}
            <div className="mobile-actions" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "4px" }}>
              {[
                { icon: "📄", label: "Create Resume", path: "/resume" },
                { icon: "📊", label: "Application Tracker", path: "/tracker" },
                { icon: "✉️", label: "Generate Cover Letter", path: "/apply" },
                { icon: "🎯", label: "Practice Interview", path: "/interview" },
                { icon: "📧", label: "One Click Apply", path: "/apply" }
              ].map(act => (
                <button key={act.label} onClick={() => router.push(act.path)} className="action-btn"
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}`, borderRadius: "100px", color: t.text, fontSize: "13px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap" }}>
                  <span>{act.icon}</span> {act.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary grid */}
          <div className="mobile-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px", position: "relative", zIndex: 1, alignItems: "stretch" }}>

            {/* Smart Resume Card */}
            <div className="dash-card mobile-card" onClick={() => router.push("/resume")} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: "28px", cursor: "pointer", animationDelay: "0s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(67,217,162,0.12)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📄</div>
                <div>
                  <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text }}>Smart Resume</h3>
                  <p style={{ color: t.muted, fontSize: "12px" }}>AI-powered builder</p>
                </div>
              </div>
              {/* Score ring */}
              <div style={{ textAlign: "center", margin: "16px 0 20px" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#43D9A2" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="25" strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}/>
                  </svg>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Noto Serif', serif", fontSize: "22px", fontWeight: "700", color: "#43D9A2" }}><CountUp end={92} /></div>
                    <div style={{ fontSize: "10px", color: t.muted }}>/ 100</div>
                  </div>
                </div>
                <p style={{ color: t.muted, fontSize: "12px", marginTop: "8px" }}>ATS Score <span style={{fontSize:"10px",opacity:0.5}}>(estimate)</span></p>
              </div>
              <button style={{ width: "100%", padding: "11px", background: "rgba(67,217,162,0.1)", color: "#43D9A2", border: "1px solid rgba(67,217,162,0.2)", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Optimize Now →
              </button>
            </div>

            {/* Application Tracker Card */}
            <div className="dash-card mobile-card" onClick={() => router.push("/tracker")} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: "28px", cursor: "pointer", animationDelay: "0.1s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(108,99,255,0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📊</div>
                <div>
                  <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text }}>Application Tracker</h3>
                  <p style={{ color: t.muted, fontSize: "12px" }}>Manage your pipeline</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                {[[14, "Applied", "#6C63FF"], [5, "Interviews", "#FFB347"], [2, "Offers", "#43D9A2"], [18, "Saved", "#FF6584"]].map(([n, l, c]) => (
                  <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px", textAlign: "center", border: `1px solid ${t.border}` }}>
                    <div style={{ fontFamily: "'Noto Serif', serif", fontSize: "22px", fontWeight: "700", color: c }}><CountUp end={n} /></div>
                    <div style={{ color: t.muted, fontSize: "11px", marginTop: "2px" }}>{l}</div>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", padding: "11px", background: "rgba(108,99,255,0.1)", color: "#A29BFE", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                View Tracker →
              </button>
            </div>

            {/* Cover Letter Generator Card */}
            <div className="dash-card mobile-card" onClick={() => router.push("/apply")} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: "28px", cursor: "pointer", animationDelay: "0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(67,217,162,0.12)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✉️</div>
                <div>
                  <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text }}>Cover Letter Generator</h3>
                  <p style={{ color: t.muted, fontSize: "12px" }}>AI-powered letters</p>
                </div>
              </div>
              <div style={{ textAlign: "center", margin: "16px 0 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>📝</div>
                <p style={{ color: t.muted, fontSize: "13px", marginBottom: "16px" }}>Generate tailored cover letters instantly with AI</p>
              </div>
              <button style={{ width: "100%", padding: "11px", background: "rgba(67,217,162,0.1)", color: "#43D9A2", border: "1px solid rgba(67,217,162,0.2)", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Generate Now →
              </button>
            </div>

            {/* Interview Prep Card */}
            <div className="dash-card mobile-card" onClick={() => router.push("/interview")} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: "28px", cursor: "pointer", animationDelay: "0.3s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(255,101,132,0.12)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎯</div>
                <div>
                  <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text }}>AI Mock Interview</h3>
                  <p style={{ color: t.muted, fontSize: "12px" }}>Tailored to your role</p>
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                {[["Behavioral", "78%", "#FFB347"], ["Technical", "65%", "#6C63FF"], ["HR Round", "91%", "#43D9A2"]].map(([label, pct, color]) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: t.muted, fontSize: "11px" }}>{label}</span>
                      <span style={{ color, fontSize: "11px", fontWeight: "600" }}>{pct}</span>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: pct, background: color, borderRadius: "100px" }} />
                    </div>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", padding: "11px", background: "rgba(255,101,132,0.1)", color: "#FF6584", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Start Session →
              </button>
            </div>
            {/* One Click Apply */}
            <div className="dash-card mobile-card" onClick={() => router.push("/apply")} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: "28px", cursor: "pointer", animationDelay: "0.4s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(255,179,71,0.12)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📧</div>
                <div>
                  <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text }}>One Click Apply</h3>
                  <p style={{ color: t.muted, fontSize: "12px" }}>AI cover letters</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                {[[14, "Sent", "#6C63FF"], [5, "Opened", "#FFB347"], [2, "Replies", "#43D9A2"], [18, "Saved", "#FF6584"]].map(([n, l, c]) => (
                  <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px", textAlign: "center", border: `1px solid ${t.border}` }}>
                    <div style={{ fontFamily: "'Noto Serif', serif", fontSize: "22px", fontWeight: "700", color: c }}><CountUp end={n} /></div>
                    <div style={{ color: t.muted, fontSize: "11px", marginTop: "2px" }}>{l}</div>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", padding: "11px", background: "rgba(255,179,71,0.1)", color: "#FFB347", border: "1px solid rgba(255,179,71,0.2)", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Start Applying →
              </button>
            </div>

          </div>

          {/* Recent Activity Toggle */}
          <div className="dash-card mobile-card" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: showActivity ? "24px 28px" : "18px 28px", animationDelay: "0.5s", cursor: "pointer", marginBottom: "16px" }} onClick={() => setShowActivity(!showActivity)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text }}>📋 Recent Activity {showActivity ? "−" : "+"}</h3>
                  {showActivity && <p style={{ color: t.muted, fontSize: "12px", marginTop: "4px" }}>Your application pipeline</p>}
                </div>
                {showActivity && <span onClick={(e) => { e.stopPropagation(); router.push("/tracker"); }} style={{ color: "#6C63FF", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>View all →</span>}
              </div>
              {showActivity && (
                <div style={{ marginTop: "20px" }}>
                  {activities.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <div style={{ fontSize: "40px", marginBottom: "10px" }}>📋</div>
                      <p style={{ color: t.muted, fontSize: "13px", marginBottom: "12px" }}>No applications yet.<br/>Start applying to track your pipeline!</p>
                      <button onClick={(e) => { e.stopPropagation(); router.push("/apply"); }} style={{ padding: "9px 20px", background: "rgba(108,99,255,0.12)", color: "#A29BFE", border: "1px solid rgba(108,99,255,0.25)", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Start Applying →</button>
                    </div>
                  ) : (
                    <div>
                      {activities.map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: i < activities.length - 1 ? `1px solid ${t.border}` : "none" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", color: "#6C63FF", flexShrink: 0 }}>{a.company[0]}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: "500", color: t.text }}>{a.company}</div>
                            <div style={{ fontSize: "11px", color: t.muted }}>{a.role}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ background: `${a.statusColor}18`, color: a.statusColor, padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", marginBottom: "3px" }}>{a.status}</div>
                            <div style={{ color: t.muted, fontSize: "10px" }}>{a.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Market Pulse Toggle */}
          <div className="dash-card" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: showPulse ? "24px 28px" : "18px 28px", position: "relative", zIndex: 1, animationDelay: "0.6s", cursor: "pointer" }} onClick={() => setShowPulse(!showPulse)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text }}>📈 Market Pulse {showPulse ? "−" : "+"}</h3>
                {showPulse && <p style={{ color: t.muted, fontSize: "12px", marginTop: "4px" }}>India job market estimates</p>}
              </div>
              {showPulse && <div style={{ background: "rgba(67,217,162,0.08)", border: "1px solid rgba(67,217,162,0.15)", borderRadius: "8px", padding: "4px 12px", fontSize: "11px", color: "#43D9A2" }}>India avg. estimates</div>}
            </div>
            {showPulse && (
              <div className="mobile-grid-1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "20px" }}>
                {[
                  { label: "Market Demand", value: <CountUp end={18.4} decimals={1} prefix="+" suffix="%" />, icon: "📈", color: "#43D9A2", sub: "vs last year" },
                  { label: "Avg. Salary", value: <CountUp end={14.2} decimals={1} prefix="₹" suffix="L" />, icon: "💰", color: "#FFB347", sub: "per annum" },
                  { label: "Competition", value: "Medium", icon: "⚔️", color: "#FF6584", sub: "~342 applicants" },
                  { label: "Hot Skills", value: "React, AI", icon: "🔥", color: "#6C63FF", sub: "most in demand" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "18px", border: `1px solid ${t.border}` }}>
                    <div style={{ fontSize: "22px", marginBottom: "10px" }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Noto Serif', serif", fontSize: "20px", fontWeight: "700", color: s.color, marginBottom: "4px" }}>{s.value}</div>
                    <div style={{ color: t.text, fontSize: "12px", fontWeight: "500", marginBottom: "2px" }}>{s.label}</div>
                    <div style={{ color: t.muted, fontSize: "11px" }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Onboarding Checklist Toggle */}
          <div className="dash-card" style={{ background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "24px", padding: showChecklist ? "24px 28px" : "18px 28px", position: "relative", zIndex: 1, marginTop: "16px", animationDelay: "0.7s", cursor: "pointer" }} onClick={(e) => {
              if (e.target.tagName !== "BUTTON") setShowChecklist(!showChecklist);
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text }}>🚀 Get Started Setup {showChecklist ? "−" : "+"}</h3>
              </div>
            </div>
            {showChecklist && (
              <div className="mobile-grid-1" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "16px" }}>
                {checklist.map(item => (
                  <div key={item.id} onClick={() => router.push(item.path)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}`, borderRadius: "12px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "rgba(108,99,255,0.4)"}
                    onMouseOut={e => e.currentTarget.style.borderColor = t.border}>
                    <span style={{ fontSize: "18px" }}>{item.icon}</span>
                    <span style={{ color: t.text, fontSize: "13px", fontWeight: "500" }}>{item.label}</span>
                    <span style={{ marginLeft: "auto", color: "#A29BFE", fontSize: "12px" }}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
