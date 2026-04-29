import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/contexts";
import Sidebar from "../components/Sidebar";

const STATUSES = ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"];
const STATUS_COLORS = {
  Wishlist: "#64B5F6",
  Applied: "#6C63FF",
  Interviewing: "#FFB347",
  Offer: "#43D9A2",
  Rejected: "#FF6584",
};

export default function Tracker() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const { theme: t } = useTheme();
  const [view, setView] = useState("kanban");
  const [applications, setApplications] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [newApp, setNewApp] = useState({ company: "", role: "", status: "Applied", date: new Date().toISOString().split("T")[0], location: "", salary: "", notes: "", link: "" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");


  const loadApplications = async (userId) => {
    // Load from localStorage first for speed
    const saved = localStorage.getItem("jobwin_tracker");
    if (saved) setApplications(JSON.parse(saved));
    // Then try Supabase
    try {
      const { data } = await supabase.from("applications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setApplications(data);
        localStorage.setItem("jobwin_tracker", JSON.stringify(data));
      }
    } catch (err) {}
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      loadApplications(session.user.id);
    });
  }, []);

  const saveApplications = (apps) => {
    setApplications(apps);
    localStorage.setItem("jobwin_tracker", JSON.stringify(apps));
    if (user) {
      (async () => { try { await supabase.from("applications").upsert(apps.map(a => ({ ...a, user_id: user.id }))); } catch (_) {} })();
    }
  };

  const addApplication = () => {
    if (!newApp.company || !newApp.role) { alert("Please fill company and role!"); return; }
    const app = {
      ...newApp,
      id: Date.now().toString(),
      user_id: user?.id,
      created_at: new Date().toISOString(),
      activity: [{ action: `Application created`, time: new Date().toLocaleString() }],
    };
    saveApplications([app, ...applications]);
    setNewApp({ company: "", role: "", status: "Applied", date: new Date().toISOString().split("T")[0], location: "", salary: "", notes: "", link: "" });
    setShowAdd(false);
  };

  const updateStatus = (id, status) => {
    const updated = applications.map(a => {
      if (a.id === id) {
        const activity = [...(a.activity || []), { action: `Status changed to ${status}`, time: new Date().toLocaleString() }];
        return { ...a, status, activity };
      }
      return a;
    });
    saveApplications(updated);
  };

  const updateNotes = (id, notes) => {
    saveApplications(applications.map(a => a.id === id ? { ...a, notes } : a));
  };

  const deleteApp = (id) => {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    saveApplications(applications.filter(a => a.id !== id));
    if (activeApp?.id === id) setActiveApp(null);
  };



  const filteredApps = applications.filter(a => {
    const matchSearch = a.company?.toLowerCase().includes(search.toLowerCase()) || a.role?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    { n: applications.length, l: "Total", i: "📋", c: t.accent },
    { n: applications.filter(a => a.status === "Applied").length, l: "Applied", i: "📧", c: "#6C63FF" },
    { n: applications.filter(a => a.status === "Interviewing").length, l: "Interviewing", i: "🎯", c: "#FFB347" },
    { n: applications.filter(a => a.status === "Offer").length, l: "Offers", i: "🎉", c: "#43D9A2" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif", transition: "all 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.3); border-radius:4px; }
        .nav-item:hover { background:rgba(108,99,255,0.1) !important; }
        .app-card:hover { border-color:rgba(108,99,255,0.3) !important; transform:translateY(-2px); }
        .action-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(108,99,255,0.35) !important; }
        .theme-btn:hover { background:rgba(108,99,255,0.2) !important; }
        input::placeholder, textarea::placeholder { color:${t.muted}; }
        input, textarea, select { color:${t.text}; }
        select option { background:${t.sidebar}; color:${t.text}; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <Sidebar activeId="tracker" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />

      {/* MAIN */}
      <main className="mobile-main" style={{ flex: 1, marginLeft: collapsed ? "72px" : "240px", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ height: "56px", background: `${t.sidebar}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.muted, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>← Dashboard</button>
            <span style={{ color: t.muted }}>/</span>
            <span style={{ color: t.text, fontSize: "13px", fontWeight: "500" }}>Application Tracker</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {/* View toggle */}
            <div style={{ display: "flex", background: t.card, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
              {[["kanban", "⊞ Kanban"], ["list", "☰ List"]].map(([v, label]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: "7px 14px", background: view === v ? "rgba(108,99,255,0.2)" : "transparent", color: view === v ? "#A29BFE" : t.muted, border: "none", cursor: "pointer", fontSize: "12px", fontWeight: view === v ? "600" : "400", fontFamily: "'DM Sans',sans-serif" }}>
                  {label}
                </button>
              ))}
            </div>
            <button className="action-btn" onClick={() => setShowAdd(!showAdd)}
              style={{ padding: "7px 18px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s" }}>
              + New Application
            </button>
          </div>
        </header>

        <div style={{ padding: "24px 28px", flex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: "700", color: t.text, marginBottom: "6px" }}>
              Application <span style={{ fontStyle: "italic", color: t.accent }}>Tracker</span>
            </h1>
            <p style={{ color: t.muted, fontSize: "13px" }}>Monitor your journey from application to offer.</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.i}</div>
                <div style={{ fontFamily: "'Noto Serif',serif", fontSize: "24px", fontWeight: "700", color: s.c, marginBottom: "2px" }}>{s.n}</div>
                <div style={{ color: t.muted, fontSize: "11px" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Add form */}
          {showAdd && (
            <div style={{ background: t.card, border: `1px solid rgba(108,99,255,0.3)`, borderRadius: "16px", padding: "20px 24px", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "16px", fontWeight: "600", color: t.text, marginBottom: "16px" }}>+ New Application</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                {[
                  { label: "Company *", key: "company", placeholder: "e.g. Google, TCS" },
                  { label: "Job Role *", key: "role", placeholder: "e.g. Data Analyst" },
                  { label: "Location", key: "location", placeholder: "e.g. Mumbai" },
                  { label: "Salary", key: "salary", placeholder: "e.g. ₹8-12 LPA" },
                  { label: "Date Applied", key: "date", placeholder: "", type: "date" },
                  { label: "Job Link", key: "link", placeholder: "https://..." },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.placeholder} value={newApp[f.key]} onChange={e => setNewApp({ ...newApp, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", outline: "none" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Status</label>
                  <select value={newApp.status} onChange={e => setNewApp({ ...newApp, status: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", outline: "none" }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: t.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>Notes</label>
                  <input type="text" placeholder="Any notes..." value={newApp.notes} onChange={e => setNewApp({ ...newApp, notes: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", outline: "none" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={addApplication} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Add Application</button>
                <button onClick={() => setShowAdd(false)} style={{ padding: "10px 22px", background: t.inputBg, color: t.muted, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Search + filter */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input type="text" placeholder="🔍 Search company or role..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: "200px", padding: "9px 14px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", outline: "none" }} />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["ALL", ...STATUSES].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  style={{ padding: "7px 14px", background: filterStatus === s ? `${STATUS_COLORS[s] || t.accent}22` : t.card, border: `1px solid ${filterStatus === s ? (STATUS_COLORS[s] || t.accent) + "55" : t.border}`, borderRadius: "8px", color: filterStatus === s ? (STATUS_COLORS[s] || t.accent) : t.muted, fontSize: "11px", fontWeight: filterStatus === s ? "600" : "400", cursor: "pointer", transition: "all 0.2s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* KANBAN VIEW */}
          {view === "kanban" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "14px", overflowX: "auto" }}>
              {STATUSES.map(status => {
                const apps = filteredApps.filter(a => a.status === status);
                return (
                  <div key={status}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: STATUS_COLORS[status], flexShrink: 0 }} />
                      <span style={{ color: t.muted, fontSize: "12px", fontWeight: "600" }}>{status}</span>
                      <span style={{ background: `${STATUS_COLORS[status]}22`, color: STATUS_COLORS[status], padding: "1px 8px", borderRadius: "100px", fontSize: "10px", fontWeight: "600" }}>{apps.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "80px" }}>
                      {apps.map(app => (
                        <div key={app.id} className="app-card" onClick={() => setActiveApp(activeApp?.id === app.id ? null : app)}
                          style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "14px", cursor: "pointer", transition: "all 0.2s" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${STATUS_COLORS[status]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", color: STATUS_COLORS[status] }}>
                              {app.company?.[0]?.toUpperCase()}
                            </div>
                            <button onClick={e => { e.stopPropagation(); deleteApp(app.id); }} style={{ background: "none", border: "none", color: t.muted, cursor: "pointer", fontSize: "15px", opacity: 0.6 }}>×</button>
                          </div>
                          <div style={{ fontWeight: "600", fontSize: "12px", color: t.text, marginBottom: "2px" }}>{app.role}</div>
                          <div style={{ color: t.muted, fontSize: "11px", marginBottom: "8px" }}>{app.company}</div>
                          {app.location && <div style={{ color: t.muted, fontSize: "10px", marginBottom: "6px" }}>📍 {app.location}</div>}
                          <div style={{ fontSize: "10px", color: t.muted }}>📅 {app.date}</div>
                          <select value={app.status} onChange={e => { e.stopPropagation(); updateStatus(app.id, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: "100%", marginTop: "10px", padding: "4px 8px", background: `${STATUS_COLORS[app.status]}15`, border: `1px solid ${STATUS_COLORS[app.status]}44`, borderRadius: "6px", fontSize: "10px", color: STATUS_COLORS[app.status], outline: "none", cursor: "pointer" }}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      ))}
                      {apps.length === 0 && (
                        <div style={{ border: `1px dashed ${t.border}`, borderRadius: "10px", padding: "20px", textAlign: "center" }}>
                          <p style={{ color: t.muted, fontSize: "11px" }}>No applications</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {view === "list" && (
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.5fr", padding: "12px 20px", background: `${t.accent}10`, borderBottom: `1px solid ${t.border}` }}>
                {["Company", "Role", "Location", "Date", "Status", ""].map((h, i) => (
                  <div key={i} style={{ color: t.muted, fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</div>
                ))}
              </div>
              {filteredApps.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <p style={{ color: t.muted, fontSize: "14px" }}>No applications found</p>
                </div>
              ) : filteredApps.map((app, i) => (
                <div key={app.id} onClick={() => setActiveApp(activeApp?.id === app.id ? null : app)}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.5fr", padding: "14px 20px", borderBottom: `1px solid ${t.border}`, cursor: "pointer", background: activeApp?.id === app.id ? `${t.accent}08` : "transparent", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${STATUS_COLORS[app.status]}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", color: STATUS_COLORS[app.status], flexShrink: 0 }}>
                      {app.company?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: "500", fontSize: "13px", color: t.text }}>{app.company}</span>
                  </div>
                  <div style={{ color: t.muted, fontSize: "13px", alignSelf: "center" }}>{app.role}</div>
                  <div style={{ color: t.muted, fontSize: "12px", alignSelf: "center" }}>{app.location || "—"}</div>
                  <div style={{ color: t.muted, fontSize: "12px", alignSelf: "center" }}>{app.date}</div>
                  <div style={{ alignSelf: "center" }}>
                    <select value={app.status} onChange={e => { e.stopPropagation(); updateStatus(app.id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      style={{ padding: "4px 10px", background: `${STATUS_COLORS[app.status]}15`, border: `1px solid ${STATUS_COLORS[app.status]}44`, borderRadius: "6px", fontSize: "11px", color: STATUS_COLORS[app.status], outline: "none", cursor: "pointer" }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ alignSelf: "center", textAlign: "right" }}>
                    <button onClick={e => { e.stopPropagation(); deleteApp(app.id); }} style={{ background: "none", border: "none", color: t.muted, cursor: "pointer", fontSize: "16px" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detail panel */}
          {activeApp && (
            <div style={{ marginTop: "20px", background: t.card, border: `1px solid rgba(108,99,255,0.3)`, borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "18px", fontWeight: "600", color: t.text, marginBottom: "2px" }}>{activeApp.role}</h3>
                  <p style={{ color: "#6C63FF", fontSize: "13px", fontWeight: "500" }}>{activeApp.company}</p>
                </div>
                <button onClick={() => setActiveApp(null)} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.muted, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Close ×</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {activeApp.location && <span style={{ background: t.inputBg, color: t.muted, padding: "4px 10px", borderRadius: "6px", fontSize: "12px" }}>📍 {activeApp.location}</span>}
                    {activeApp.salary && <span style={{ background: "rgba(67,217,162,0.1)", color: "#43D9A2", padding: "4px 10px", borderRadius: "6px", fontSize: "12px" }}>💰 {activeApp.salary}</span>}
                    <span style={{ background: t.inputBg, color: t.muted, padding: "4px 10px", borderRadius: "6px", fontSize: "12px" }}>📅 {activeApp.date}</span>
                  </div>
                  <label style={{ color: t.muted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>Notes</label>
                  <textarea value={activeApp.notes || ""} onChange={e => { updateNotes(activeApp.id, e.target.value); setActiveApp({ ...activeApp, notes: e.target.value }); }}
                    placeholder="Add notes about this application..."
                    rows={4}
                    style={{ width: "100%", padding: "10px 12px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "13px", lineHeight: "1.6", resize: "vertical", outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
                  {activeApp.link && (
                    <a href={activeApp.link} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "10px", color: "#6C63FF", fontSize: "13px" }}>🔗 View Job Posting →</a>
                  )}
                </div>
                <div>
                  <label style={{ color: t.muted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>Activity Log</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                    {(activeApp.activity || [{ action: "Application created", time: activeApp.created_at }]).map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6C63FF", marginTop: "5px", flexShrink: 0 }} />
                        <div>
                          <p style={{ color: t.text, fontSize: "12px", marginBottom: "2px" }}>{a.action}</p>
                          <p style={{ color: t.muted, fontSize: "10px" }}>{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {applications.length === 0 && !showAdd && (
            <div style={{ textAlign: "center", padding: "60px 20px", background: t.card, borderRadius: "20px", border: `1px solid ${t.border}`, marginTop: "20px" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>📊</div>
              <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "20px", fontWeight: "600", color: t.text, marginBottom: "10px" }}>No applications yet</h3>
              <p style={{ color: t.muted, fontSize: "14px", marginBottom: "24px" }}>Start tracking your job applications to stay organised and never miss a follow-up.</p>
              <button className="action-btn" onClick={() => setShowAdd(true)}
                style={{ padding: "12px 28px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s" }}>
                + Add First Application
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
