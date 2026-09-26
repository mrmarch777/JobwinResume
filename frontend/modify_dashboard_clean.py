import re

with open('pages/dashboard.js', 'r') as f:
    content = f.read()

# 1. State for resumes
state_add = """  const [resumesCount, setResumesCount] = useState(0);
  const [recentResumes, setRecentResumes] = useState([]);"""
content = re.sub(r'const \[stats, setStats\] = useState\([^)]+\);', r'const [stats, setStats] = useState({ applied: 0, interviews: 0, offers: 0, saved: 0 });\n' + state_add, content)

# 2. Fetch resumes
fetch_resumes = """
  const fetchResumes = async (userId) => {
    try {
      let localResumes = [];
      try {
        localResumes = JSON.parse(localStorage.getItem('jobwin_local_resumes') || '[]');
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
"""
content = re.sub(r'const fetchStats = async', fetch_resumes + '\n  const fetchStats = async', content)
content = re.sub(r'fetchStats\(session\.user\.id\);', r'fetchStats(session.user.id);\n      fetchResumes(session.user.id);', content)

# 3. Replace Quick Actions inside Hero Heading with Stats Row and new Quick Actions
stats_row_and_actions = """
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Total Resumes", value: resumesCount, color: "#6C63FF" },
                { label: "Jobs Applied", value: stats.applied, color: "#FFB347" },
                { label: "Avg ATS Score", value: "85%", color: "#43D9A2" },
                { label: "Profile Completion", value: "92%", color: "#FF6584" }
              ].map((stat, idx) => (
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
"""
# Carefully match just the Quick Actions block up to its closing div, leaving the outer hero heading div untouched
content = re.sub(r'\{/\* Quick Actions \*/\}.*?</button>\s*\)\)\}\s*</div>', stats_row_and_actions, content, flags=re.DOTALL)


# 4. Replace Recent Activity with Resumes
recent_resumes_section = """
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
"""
content = re.sub(r'\{/\* Recent Activity Toggle \*/\}', recent_resumes_section, content)

with open('pages/dashboard.js', 'w') as f:
    f.write(content)

