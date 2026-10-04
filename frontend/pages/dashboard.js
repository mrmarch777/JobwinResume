import { useState, useEffect } from "react";
import Head from "next/head";
import PageHead from "../components/PageHead";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme, THEMES, ACTIVE_THEMES, usePlan, PLAN_LIMITS } from "../lib/contexts";
import Sidebar from "../components/Sidebar";
import { SkeletonPulse, SkeletonCard, shimmerKeyframes } from '../components/Skeleton';

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
  const [notifications, setNotifications] = useState(0);
  const [stats, setStats] = useState({ applied: 0, interviews: 0, offers: 0, saved: 0 });
  const [resumesCount, setResumesCount] = useState(0);
  const [recentResumes, setRecentResumes] = useState([]);
  
  const fetchResumes = async (userId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || 'guest';
      const LOCAL_KEY = `jobwin_local_resumes_${uid}`;

      let localResumes = [];
      try {
        localResumes = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      } catch(e) {}
      
      setResumesCount(localResumes.length);
      setRecentResumes(localResumes.slice(0, 3));
      
      const { data } = await supabase.from('resumes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(3);
      if (data && data.length > 0) {
        setResumesCount((prev) => Math.max(prev, data.length)); // rough estimate
        setRecentResumes(data.slice(0, 3));
      }
    } catch(e) {
      console.error(e);
    }
  };

  const fetchStats = async (userId) => {
    try {
      const { data } = await supabase.from('applications').select('status').eq('user_id', userId);
      if (data) {
        const counts = { applied: 0, interviews: 0, offers: 0, saved: 0 };
        data.forEach(app => {
          if (app.status === 'applied') counts.applied++;
          else if (app.status === 'interviewing') counts.interviews++;
          else if (app.status === 'offered') counts.offers++;
          else if (app.status === 'saved') counts.saved++;
        });
        setStats(counts);
      }
    } catch (err) { console.error('Failed to fetch stats:', err); }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const fetchActivities = async (userId) => {
    try {
      const { data } = await supabase
        .from('applications')
        .select('company, role, status, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (data && data.length > 0) {
        const statusColors = {
          saved: '#FF6584',
          applied: '#6C63FF', 
          interviewing: '#FFB347',
          offered: '#43D9A2',
          rejected: '#FF4444'
        };
        setActivities(data.map(a => ({
          company: a.company || 'Unknown',
          role: a.role || 'Unknown Role',
          status: a.status?.charAt(0).toUpperCase() + a.status?.slice(1) || 'Saved',
          statusColor: statusColors[a.status] || '#6C63FF',
          time: getTimeAgo(a.updated_at)
        })));
      }
    } catch (err) { console.error('Failed to fetch activities:', err); }
  };

  const navItems = [
    { id: "home", icon: "⊞", label: "Home" },
    { id: "resume", icon: "📄", label: "Resume Builder" },
    { id: "tracker", icon: "📊", label: "Application Tracker" },
    { id: "cover", icon: "✉️", label: "Cover Letter Generator" },
    { id: "interview", icon: "🎯", label: "Interview Prep" },
    { id: "apply", icon: "📧", label: "One Click Apply" },
    { id: "pricing", icon: "⚡", label: "Upgrade" },
  ];

  const [activities, setActivities] = useState([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const checklist = [
    { id: "resume", label: "Build your resume", done: false, path: "/resume-io", icon: "📄" },
    { id: "jobs", label: "Search your first job", done: false, path: "/find-job", icon: "🔍" },
    { id: "tracker", label: "Add an application to tracker", done: false, path: "/tracker", icon: "📊" },
    { id: "interview", label: "Try AI Interview Prep", done: false, path: "/interview", icon: "🎯" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      fetchStats(session.user.id);
      fetchResumes(session.user.id);
      fetchActivities(session.user.id);
    });
  }, []);

  const handleNav = (id) => {
    setActiveNav(id);
    if (id === "resume") router.push("/resume-io");
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090f' }}>
      <style>{shimmerKeyframes}</style>
      <div style={{ width: '240px', background: '#0d0d14', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <SkeletonPulse width="140px" height="28px" style={{ margin: '24px' }} />
        {[...Array(6)].map((_, i) => (
          <SkeletonPulse key={i} width="180px" height="18px" style={{ margin: '12px 24px' }} />
        ))}
      </div>
      <main style={{ flex: 1, padding: '32px' }}>
        <SkeletonPulse width="300px" height="40px" style={{ marginBottom: '12px' }} />
        <SkeletonPulse width="400px" height="16px" style={{ marginBottom: '32px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </main>
    </div>
  );

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || user.email.split("@")[0];
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif", transition: "all 0.4s ease" }}>
      <PageHead title="Dashboard" description="Your career command centre. Track applications, manage resumes, and accelerate your job search." />
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
            {/* Mobile Theme Switcher — 3 themes only */}
            <div className="desktop-hide" style={{ display: "flex", gap: "6px", alignItems: "center", marginRight: "4px" }}>
               {ACTIVE_THEMES.map((stat, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}`, borderRadius: "16px", padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: stat.color, marginBottom: "8px" }}>{stat.value}</div>
                  <div style={{ fontSize: "13px", color: t.muted, fontWeight: "500" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: t.text, marginBottom: "16px" }}>Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {[
                { title: "Resume Builder", icon: "📄", desc: "Create a new resume", path: "/resume-io", bg: "linear-gradient(135deg, #6C63FF22, #6C63FF44)", border: "#6C63FF" },
                { title: "Find Jobs", icon: "🔍", desc: "Search new opportunities", path: "/find-job", bg: "linear-gradient(135deg, #FFB34722, #FFB34744)", border: "#FFB347" },
                { title: "Cover Letter", icon: "✉️", desc: "Generate with AI", path: "/cover-letter", bg: "linear-gradient(135deg, #43D9A222, #43D9A244)", border: "#43D9A2" },
                { title: "ATS Check", icon: "🎯", desc: "Score your resume", path: "/resume-io", bg: "linear-gradient(135deg, #FF658422, #FF658444)", border: "#FF6584" }
              ].map((action, idx) => (
                <div key={idx} onClick={() => router.push(action.path)} style={{ background: action.bg, border: `1px solid ${action.border}66`, borderRadius: "16px", padding: "24px", cursor: "pointer", transition: "transform 0.2s", display: "flex", flexDirection: "column", gap: "12px" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
                  <div style={{ fontSize: "32px" }}>{action.icon}</div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: t.text }}>{action.title}</div>
                    <div style={{ fontSize: "13px", color: t.muted }}>{action.desc}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {plan === 'free' && (
            <div className="dash-card" onClick={() => router.push('/pricing')} style={{ 
              background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.15))',
              border: '1px solid rgba(108,99,255,0.25)',
              borderRadius: '20px',
              padding: '24px 28px',
              marginBottom: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              position: 'relative',
              zIndex: 1
            }}>
              <div>
                <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: '18px', fontWeight: '700', color: t.text, marginBottom: '6px' }}>
                  ⚡ Unlock the Full Power of JobWin
                </h3>
                <p style={{ color: t.muted, fontSize: '13px', lineHeight: '1.5' }}>
                  Upgrade to get unlimited resumes, one-click apply, AI interview prep, and more.
                </p>
              </div>
              <button style={{ 
                padding: '12px 28px', 
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '14px', 
                fontWeight: '700', 
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(108,99,255,0.35)'
              }}>
                View Plans →
              </button>
            </div>
          )}

          {/* Primary grid */}
          <div className="mobile-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px", position: "relative", zIndex: 1, alignItems: "stretch" }}>

            {/* Smart Resume Card */}
            <div className="dash-card mobile-card" onClick={() => router.push("/resume-io")} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: "28px", cursor: "pointer", animationDelay: "0s" }}>
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
                    <div style={{ fontFamily: "'Noto Serif', serif", fontSize: "22px", fontWeight: "700", color: "#43D9A2" }}>--</div>
                    <div style={{ fontSize: "10px", color: t.muted }}>/ 100</div>
                  </div>
                </div>
                <p style={{ color: t.muted, fontSize: "12px", marginTop: "8px" }}>ATS Score <span style={{fontSize:"10px",opacity:0.5}}>(Build a resume to see score)</span></p>
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
                  <p style={{ color: t.muted, fontSize: "12px" }}>Go to tracker to see real data</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                {[[stats.applied, "Applied", "#6C63FF"], [stats.interviews, "Interviews", "#FFB347"], [stats.offers, "Offers", "#43D9A2"], [stats.saved, "Saved", "#FF6584"]].map(([n, l, c]) => (
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
                {[[0, "Sent", "#6C63FF"], [0, "Opened", "#FFB347"], [0, "Replies", "#43D9A2"], [0, "Saved", "#FF6584"]].map(([n, l, c]) => (
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

          
            {/* Recent Activity (Resumes) */}
            <div className="dash-card" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "24px", padding: "24px 28px", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text, marginBottom: "16px" }}>📄 Recent Resumes</h3>
              {recentResumes.length === 0 ? (
                <p style={{ color: t.muted, fontSize: "13px" }}>No recent resumes found.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentResumes.map((resume, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${t.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(108,99,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📄</div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: t.text }}>{resume.title || resume.name || "Untitled Resume"}</div>
                          <div style={{ fontSize: "12px", color: t.muted }}>Updated {new Date(resume.updated_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button onClick={() => router.push("/resume-io")} style={{ padding: "6px 12px", background: "rgba(108,99,255,0.1)", color: "#6C63FF", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Edit</button>
                    </div>
                  ))}
                </div>
              )}
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
                    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                      <div style={{ width: '64px', height: '64px', background: 'rgba(108,99,255,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>📋</div>
                      <h4 style={{ fontFamily: "'Noto Serif', serif", fontSize: '16px', fontWeight: '600', color: '#E8E6F0', marginBottom: '8px' }}>No Activity Yet</h4>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5' }}>Start applying to jobs to see your<br/>application pipeline here.</p>
                      <button onClick={(e) => { e.stopPropagation(); router.push('/apply'); }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Start Applying →</button>
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
