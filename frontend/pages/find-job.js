import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme, THEMES, usePlan, PLAN_LIMITS } from "../lib/contexts";
import Sidebar from "../components/Sidebar";

export default function FindJob() {
  const router = useRouter();
  const { role: queryRole, city: queryCity } = router.query;

  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState("jobs");
  const [collapsed, setCollapsed] = useState(false);
  const { theme: t, themeName, setTheme } = useTheme();
  const { plan, limits } = usePlan();
  const planLabel = PLAN_LIMITS[plan]?.label || "Free";
  const maxResults = limits.searches === Infinity ? 50 : limits.searches;
  const themes = THEMES;
  const [searchRole, setSearchRole] = useState("");
  const [locations, setLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [hoveredJob, setHoveredJob] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fact, setFact] = useState(0);
  const [themeIdx] = useState(() => Math.floor(Math.random() * 4));
  const [selectedJobJD, setSelectedJobJD] = useState(null);

  const loadingThemes = [
    { icon: "🐝", steps: ["Bzzzz... scanning job boards!", "Collecting the sweetest opportunities...", "Almost done buzzing!", "Results almost ready!"], color: "#FFB347", label: "Bee" },
    { icon: "🦊", steps: ["Our clever fox is searching...", "Outsmarting other job boards!", "Sharp eyes spotted matches!", "Found your targets!"], color: "#FF6584", label: "Fox" },
    { icon: "🚀", steps: ["JobwinResume is zooming through listings!", "Shooting past 50+ job boards!", "Exploring every opportunity...", "Landing your dream job!"], color: "#6C63FF", label: "Rocket" },
    { icon: "🐨", steps: ["Hang tight! Koala is searching...", "Munching through job boards!", "Finding the best ones...", "Your perfect jobs are here!"], color: "#43D9A2", label: "Koala" },
  ];
  const lt = loadingThemes[themeIdx];

  const facts = [
    "💡 Tailoring your resume increases interview chances by 3x!",
    "📊 Apply within 24 hours of posting for best results.",
    "🎯 Most jobs get filled within 2 weeks — act fast!",
    "📧 Personalised cover letters get 50% more responses.",
  ];
  const navItems = [
    { id: "home", icon: "⊞", label: "Home", href: "/dashboard" },
    { id: "jobs", icon: "🔍", label: "Find Job", href: "/find-job" },
    { id: "resume", icon: "📄", label: "Resume Builder", href: "/resume" },
    { id: "apply", icon: "📧", label: "One-Click Apply", href: "/apply" },
    { id: "tracker", icon: "📊", label: "Track Application", href: "/tracker" },
    { id: "interview", icon: "🎯", label: "Interview Prep", href: "/interview" },
    { id: "pricing", icon: "⚡", label: "Upgrade", href: "/pricing" },
  ];

  const popularLocations = ["Mumbai", "Navi Mumbai", "Pune", "Bangalore", "Delhi NCR", "Hyderabad", "Remote 🌐"];
  const filters = ["ALL", "FULL-TIME", "DESIGN", "ENGINEERING", "REMOTE", "FRESHERS"];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("resumeora_theme");
    if (saved && themes[saved]) setTheme(saved);
  }, []);

  useEffect(() => {
    if (queryRole && queryCity) {
      setSearchRole(queryRole);
      setLocations(queryCity.split(", ").filter(Boolean));
      fetchJobs(queryRole, queryCity, maxResults);
    }
  }, [queryRole, queryCity]);

  useEffect(() => {
    if (!loading) return;
    const s = setInterval(() => setStep(p => (p + 1) % lt.steps.length), 4000);
    const p = setInterval(() => setProgress(p => p >= 90 ? 90 : p + Math.random() * 8), 1500);
    const f = setInterval(() => setFact(p => (p + 1) % facts.length), 5000);
    return () => { clearInterval(s); clearInterval(p); clearInterval(f); };
  }, [loading]);

  const addLocation = (loc) => {
    const clean = loc.replace("🌐", "").trim();
    if (!clean || locations.length >= 3 || locations.includes(clean)) return;
    setLocations(prev => [...prev, clean]);
    setLocationInput("");
  };

  const removeLocation = (loc) => setLocations(prev => prev.filter(l => l !== loc));

  const fetchJobs = async (role, city, numResults) => {
    setLoading(true); setError(""); setSearched(false); setProgress(5);
    const limit = numResults || maxResults;
    try {
      // Pass the current plan to the backend for tier-enforcement
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?role=${encodeURIComponent(role)}&city=${encodeURIComponent(city)}&num_results=${limit}&plan=${plan}`);
      const data = await res.json();
      setProgress(100);
      setTimeout(() => { setJobs(data.jobs || []); setLoading(false); setSearched(true); }, 500);
    } catch (err) {
      setError("Could not connect to the JobwinResume search engine. Please make sure the service is online.");
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const all = [...locations];
    if (locationInput.trim()) all.push(locationInput.trim());
    if (!searchRole || all.length === 0) { alert("Please enter job role and at least one location!"); return; }
    fetchJobs(searchRole, all.join(", "), maxResults);
  };

  const toggleSelect = (job) => {
    const key = job.company + job.title;
    if (selectedJobs.find(j => j.company + j.title === key)) {
      setSelectedJobs(selectedJobs.filter(j => j.company + j.title !== key));
    } else {
      setSelectedJobs([...selectedJobs, job]);
    }
  };

  const isSelected = (job) => !!selectedJobs.find(j => j.company + j.title === job.company + job.title);

  const handleApply = () => {
    localStorage.setItem("resumeora_selected_jobs", JSON.stringify(selectedJobs));
    router.push("/apply");
  };

  const handleNav = (item) => {
    setActiveNav(item.id);
    if (item.href !== "/find-job") router.push(item.href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const filteredJobs = jobs.filter(job => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "REMOTE") return job.location?.toLowerCase().includes("remote") || job.job_type?.toLowerCase().includes("remote");
    if (activeFilter === "FULL-TIME") return job.job_type?.toLowerCase().includes("full");
    if (activeFilter === "FRESHERS") return job.experience_needed?.toLowerCase().includes("fresh") || job.experience_needed?.toLowerCase().includes("0");
    return true;
  });

  const firstName = user?.email?.split("@")[0] || "";
  const initials = firstName.slice(0, 2).toUpperCase();

  // ── LOADING SCREEN ──
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, color: t.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .floating { animation: float 2.5s ease-in-out infinite; display:inline-block; }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        .bouncing { animation: bounce 1.2s ease-in-out infinite; }
      `}</style>
      <div style={{ textAlign: "center", maxWidth: "520px", padding: "40px 20px" }}>
        <div style={{ fontSize: "90px", marginBottom: "8px" }}><span className="floating">{lt.icon}</span></div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", border: `1px solid ${lt.color}33`, padding: "4px 14px", borderRadius: "100px", marginBottom: "20px", fontSize: "12px", color: t.text === "#1a1a2e" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
          JobwinResume {lt.label} is on the case!
        </div>
        <h2 className="fade-in" key={step} style={{ fontFamily: "'Noto Serif', serif", fontSize: "24px", fontWeight: "600", marginBottom: "10px", color: lt.color, lineHeight: "1.3" }}>
          {lt.steps[step]}
        </h2>
        <p style={{ color: t.text === "#1a1a2e" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "28px", fontFamily: "'DM Sans', sans-serif" }}>
          Searching <strong style={{ color: t.text === "#1a1a2e" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }}>{searchRole}</strong> jobs in <strong style={{ color: "rgba(255,255,255,0.7)" }}>{locations.join(", ")}</strong>
        </p>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "100px", height: "6px", marginBottom: "8px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${lt.color}, #6C63FF)`, borderRadius: "100px", transition: "width 1s ease" }} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginBottom: "28px", fontFamily: "'DM Sans', sans-serif" }}>{Math.round(progress)}% complete</p>
        <div style={{ background: `${lt.color}15`, border: `1px solid ${lt.color}25`, borderRadius: "12px", padding: "14px 18px" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{facts[fact]}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif", transition: "all 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.3); border-radius:4px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .nav-item:hover { background:rgba(108,99,255,0.1) !important; }
        .job-card { animation:fadeUp 0.4s ease forwards; transition:all 0.3s ease; }
        .job-card:hover { transform:translateY(-4px) !important; border-color:rgba(108,99,255,0.35) !important; box-shadow:0 16px 48px rgba(108,99,255,0.12) !important; }
        .filter-pill:hover { background:rgba(108,99,255,0.15) !important; border-color:rgba(108,99,255,0.4) !important; }
        .loc-pill:hover { background:rgba(108,99,255,0.15) !important; border-color:rgba(108,99,255,0.4) !important; color:${t.text} !important; }
        .search-inp:focus { border-color:rgba(108,99,255,0.5) !important; box-shadow:0 0 0 3px rgba(108,99,255,0.1) !important; outline:none; }
        .action-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(108,99,255,0.35) !important; }
        .theme-btn:hover { background:rgba(108,99,255,0.2) !important; }
        input::placeholder { color: ${t.muted}; }
        input { color: ${t.text}; }
        .apply-btn:hover { opacity:0.85; transform:translateY(-1px); }
      `}</style>

      {/* ── SIDEBAR ── */}
      <Sidebar activeId={activeNav} collapsed={collapsed} setCollapsed={setCollapsed} user={user} />

      {/* ── MAIN ── */}
      <main className="mobile-main" style={{ flex: 1, marginLeft: collapsed ? "68px" : "232px", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <header style={{ height: "56px", background: `${t.sidebar}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: t.muted, fontSize: "13px" }}>JobwinResume.pro</span>
            <span style={{ color: t.muted, fontSize: "13px" }}>/</span>
            <span style={{ color: t.text, fontSize: "13px", fontWeight: "500" }}>Find Job</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ background: plan !== "free" ? "rgba(108,99,255,0.1)" : "rgba(67,217,162,0.1)", border: `1px solid ${plan !== "free" ? "rgba(108,99,255,0.2)" : "rgba(67,217,162,0.2)"}`, borderRadius: "100px", padding: "4px 12px", fontSize: "10px", color: plan !== "free" ? "#A29BFE" : "#43D9A2", fontWeight: "600", letterSpacing: "1px" }}>{planLabel.toUpperCase()} PLAN</div>
            <button className="action-btn" onClick={() => router.push("/pricing")} style={{ padding: "7px 18px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s" }}>⚡ Upgrade</button>
          </div>
        </header>

        <div style={{ padding: "32px 28px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "900px" }}>

          {/* Glow */}
          <div style={{ position: "fixed", top: "15%", left: "45%", width: "500px", height: "400px", background: "radial-gradient(circle,rgba(108,99,255,0.07) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "glow 4s ease-in-out infinite" }} />

          {/* Hero */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: "32px" }}>
            <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(28px,3.5vw,52px)", fontWeight: "700", lineHeight: "1.15", marginBottom: "10px", color: t.text }}>
              Your next <span style={{ fontStyle: "italic", color: "#FF6584" }}>evolution</span> starts here.
            </h1>
            <p style={{ color: t.muted, fontSize: "15px", marginBottom: "28px" }}>
              Refine your career search with high-fidelity listings, AI summaries, and one-click applications.
            </p>

            {/* Search box */}
            <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "20px", padding: "20px", maxWidth: "760px", marginBottom: "16px" }}>
              {/* Role input */}
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: t.muted }}>🔍</span>
                <input className="search-inp" type="text" placeholder="Search job role or company..." value={searchRole} onChange={e => setSearchRole(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && handleSearch()}
                  style={{ width: "100%", paddingLeft: "42px", paddingRight: "14px", paddingTop: "13px", paddingBottom: "13px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "12px", fontSize: "14px", color: t.text, transition: "all 0.3s" }} />
              </div>

              {/* Location input + tags */}
              <div style={{ position: "relative", marginBottom: "14px" }}>
                <span style={{ position: "absolute", left: "14px", top: locations.length > 0 ? "14px" : "50%", transform: locations.length > 0 ? "none" : "translateY(-50%)", fontSize: "16px", color: t.muted, zIndex: 1 }}>📍</span>
                <div style={{ paddingLeft: "42px", paddingRight: "14px", paddingTop: "10px", paddingBottom: "10px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "12px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", minHeight: "48px" }}>
                  {locations.map(loc => (
                    <span key={loc} style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "#A29BFE", padding: "3px 10px", borderRadius: "100px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                      {loc}
                      <span onClick={() => removeLocation(loc)} style={{ cursor: "pointer", opacity: 0.7, fontWeight: "bold", fontSize: "13px" }}>×</span>
                    </span>
                  ))}
                  <input className="search-inp" type="text" placeholder={locations.length === 0 ? "Search up to 3 locations (e.g. Mumbai, Pune...)" : "Add another..."}
                    value={locationInput} onChange={e => setLocationInput(e.target.value)}
                    onKeyPress={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addLocation(locationInput); } }}
                    onBlur={() => { if (locationInput.trim()) addLocation(locationInput); }}
                    style={{ flex: 1, minWidth: "180px", background: "transparent", border: "none", fontSize: "13px", color: t.text, outline: "none" }} />
                </div>
              </div>

              <button className="action-btn" onClick={handleSearch}
                style={{ width: "100%", padding: "14px", background: "#6C63FF", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 20px rgba(108,99,255,0.35)" }}>
                🔍 Search Jobs
              </button>
            </div>

            {/* Popular locations */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              <span style={{ color: t.muted, fontSize: "12px", alignSelf: "center" }}>Popular:</span>
              {popularLocations.map(loc => (
                <button key={loc} className="loc-pill" onClick={() => addLocation(loc)}
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}`, color: t.muted, padding: "5px 14px", borderRadius: "100px", fontSize: "12px", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif" }}>
                  {loc}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {filters.map(f => (
                <button key={f} className="filter-pill" onClick={() => setActiveFilter(f)}
                  style={{ padding: "6px 16px", borderRadius: "100px", border: `1px solid ${activeFilter === f ? "rgba(108,99,255,0.5)" : t.border}`, background: activeFilter === f ? "rgba(108,99,255,0.15)" : "rgba(255,255,255,0.03)", color: activeFilter === f ? "#A29BFE" : t.muted, fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.5px" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(255,101,132,0.1)", border: "1px solid rgba(255,101,132,0.3)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#FF6584", fontSize: "14px" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Results */}
          {searched && (
            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Stats bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "18px", fontWeight: "600", color: t.text, marginBottom: "4px" }}>
                    {filteredJobs.length > 0 ? "Discover Roles" : "No results found"}
                  </h2>
                  <p style={{ color: t.muted, fontSize: "13px" }}>
                    {filteredJobs.length} {activeFilter !== "ALL" ? activeFilter.toLowerCase() : ""} jobs for "<strong style={{ color: t.text }}>{searchRole}</strong>" in {locations.join(", ")}
                    <span style={{ color: "#FFB347", marginLeft: "10px", fontWeight: "600", padding: "2px 8px", background: "rgba(255,179,71,0.1)", borderRadius: "4px" }}>
                      Plan: {planLabel} (Max {maxResults} results)
                    </span>
                  </p>
                </div>
                {filteredJobs.length > 0 && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    {selectedJobs.length > 0 && (
                      <button onClick={handleApply} style={{ padding: "8px 20px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        🚀 Apply to {selectedJobs.length} selected →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Job cards grid */}
              {filteredJobs.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                  {filteredJobs.map((job, i) => (
                    <div key={i} className="job-card" onMouseEnter={() => setHoveredJob(i)} onMouseLeave={() => setHoveredJob(null)}
                      style={{ background: isSelected(job) ? "rgba(108,99,255,0.08)" : "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${isSelected(job) ? "rgba(108,99,255,0.4)" : t.border}`, borderRadius: "20px", padding: "22px", position: "relative", animationDelay: `${i * 0.05}s` }}>

                      {/* Checkbox */}
                      <div onClick={() => toggleSelect(job)} style={{ position: "absolute", top: "16px", right: "16px", width: "22px", height: "22px", borderRadius: "6px", border: isSelected(job) ? "none" : `2px solid ${t.border}`, background: isSelected(job) ? "#6C63FF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontWeight: "bold", fontSize: "11px", zIndex: 1 }}>
                        {isSelected(job) ? "✓" : ""}
                      </div>

                      {/* Company + title */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px", paddingRight: "32px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `rgba(108,99,255,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px", color: "#6C63FF", flexShrink: 0 }}>
                          {job.company?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "15px", fontWeight: "600", color: t.text, marginBottom: "3px", lineHeight: "1.3" }}>{job.title}</h3>
                          <p style={{ color: "#6C63FF", fontSize: "13px", fontWeight: "500" }}>{job.company}</p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                        <span style={{ background: "rgba(255,255,255,0.05)", color: t.muted, padding: "3px 10px", borderRadius: "100px", fontSize: "11px" }}>📍 {job.location}</span>
                        <span style={{ background: "rgba(255,255,255,0.05)", color: t.muted, padding: "3px 10px", borderRadius: "100px", fontSize: "11px" }}>💼 {job.job_type || "Full-time"}</span>
                        {job.date_posted && <span style={{ background: "rgba(255,179,71,0.1)", color: "#FFB347", padding: "3px 10px", borderRadius: "100px", fontSize: "11px" }}>🕐 {job.date_posted}</span>}
                        {job.salary && job.salary !== "Not specified" && <span style={{ background: "rgba(67,217,162,0.1)", color: "#43D9A2", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: "600" }}>{job.salary}</span>}
                      </div>

                      {/* AI Summary */}
                      {job.ai_summary && (
                        <div style={{ background: "rgba(108,99,255,0.06)", borderLeft: "3px solid rgba(108,99,255,0.4)", borderRadius: "0 8px 8px 0", padding: "10px 12px", marginBottom: "12px" }}>
                          <p style={{ color: t.muted, fontSize: "12px", lineHeight: "1.6", margin: 0 }}>✨ {job.ai_summary}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {job.key_skills && job.key_skills !== "Not specified" && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" }}>
                          {job.key_skills.split(",").slice(0, 5).map((s, j) => (
                            <span key={j} style={{ background: "rgba(255,255,255,0.04)", color: t.muted, padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>{s.trim()}</span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        {job.apply_link && (
                          <a href={job.apply_link} target="_blank" rel="noreferrer" className="apply-btn"
                            style={{ flex: 1, padding: "9px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", textDecoration: "none", textAlign: "center", fontSize: "12px", fontWeight: "600", display: "block", transition: "all 0.2s" }}>
                            Apply Now →
                          </a>
                        )}
                        <button onClick={() => setSelectedJobJD(job)}
                          style={{ padding: "9px 12px", background: "rgba(255,255,255,0.05)", color: "#A29BFE", border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                          📜 JD
                        </button>
                        <button onClick={() => toggleSelect(job)}
                          style={{ padding: "9px 14px", background: isSelected(job) ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.05)", color: isSelected(job) ? "#A29BFE" : t.muted, border: `1px solid ${isSelected(job) ? "rgba(108,99,255,0.4)" : t.border}`, borderRadius: "8px", fontSize: "12px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                          {isSelected(job) ? "✓ Added" : "+ Select"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: "56px", marginBottom: "20px" }}>🕵️‍♂️</div>
                  <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "600", color: t.text, marginBottom: "12px" }}>No results found for these terms</h3>
                  <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "left", background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: `1px solid ${t.border}` }}>
                    <p style={{ color: t.text, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Try these tips:</p>
                    <ul style={{ color: t.muted, fontSize: "12px", lineHeight: "1.8", paddingLeft: "20px" }}>
                      <li>Check for typos in the job title or company name.</li>
                      <li>Try a more general role (e.g., "Developer" instead of "Junior React Dev").</li>
                      <li>Search in a different major city nearby.</li>
                      <li>Ensuring those job locations aren't too specific.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Bottom stats */}
              {filteredJobs.length > 0 && (
                <div style={{ marginTop: "40px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                    {[["1,240+", "New Listings"], ["₹14L", "Average Salary"], ["68%", "Remote-Friendly"]].map(([n, l]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Noto Serif',serif", fontSize: "22px", fontWeight: "700", color: "#6C63FF" }}>{n}</div>
                        <div style={{ color: t.muted, fontSize: "12px", marginTop: "2px" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <button style={{ padding: "12px 24px", background: "white", color: "#0a0a1a", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px" }}>
                    GET CAREER ALERTS
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!searched && !loading && (
            <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔍</div>
              <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "24px", fontWeight: "600", color: t.text, marginBottom: "10px" }}>Ready to find your perfect role?</h2>
              <p style={{ color: t.muted, fontSize: "15px" }}>Enter a job title and location above to search 50,000+ live opportunities</p>
            </div>
          )}
        </div>
          </div>
      </main>

      {/* ── JD MODAL ── */}
      {selectedJobJD && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setSelectedJobJD(null)}>
          <div style={{ background: t.sidebar, border: `1px solid ${t.border}`, borderRadius: "24px", width: "100%", maxWidth: "700px", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
              <div>
                <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "20px", fontWeight: "700", color: t.text, marginBottom: "4px" }}>{selectedJobJD.title}</h2>
                <p style={{ color: "#6C63FF", fontSize: "14px", fontWeight: "600" }}>{selectedJobJD.company}</p>
              </div>
              <button onClick={() => setSelectedJobJD(null)} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.text, width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            {/* Content */}
            <div style={{ padding: "32px", overflowY: "auto", flex: 1, lineHeight: "1.8", color: t.text, fontSize: "15px", whiteSpace: "pre-wrap" }}>
              {selectedJobJD.description && selectedJobJD.description.trim() !== "" ? (
                selectedJobJD.description
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: t.muted }}>
                   <div style={{ fontSize: "40px", marginBottom: "16px" }}>📄</div>
                   <p>NO JD mentioned for this job.</p>
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding: "20px 32px", borderTop: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedJobJD(null)} style={{ padding: "10px 24px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.text, borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating apply bar */}
      {selectedJobs.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: collapsed ? "68px" : "232px", right: 0, background: "rgba(9,9,15,0.97)", backdropFilter: "blur(20px)", padding: "14px 28px", borderTop: "1px solid rgba(108,99,255,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1000, transition: "left 0.3s" }}>
          <span style={{ fontWeight: "600", color: "white", fontSize: "14px" }}>{selectedJobs.length} job{selectedJobs.length > 1 ? "s" : ""} selected</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setSelectedJobs([])} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Clear</button>
            <button onClick={handleApply} style={{ padding: "9px 22px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
              🚀 Apply to {selectedJobs.length} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
