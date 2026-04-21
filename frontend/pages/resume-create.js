import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const TEMPLATES = [
  { id: "classic", name: "Classic", color: "#1a1a2e", accent: "#667eea", desc: "Clean and professional" },
  { id: "modern", name: "Modern", color: "#0B7B3E", accent: "#0B7B3E", desc: "Fresh and contemporary" },
  { id: "bold", name: "Bold", color: "#6D28D9", accent: "#6D28D9", desc: "Stand out from the crowd" },
];

export default function ResumeCreate() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [generatedResume, setGeneratedResume] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    linkedin: "",
    targetRole: "",
    experience: "",
    education: "",
    skills: "",
    achievements: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      setForm(f => ({ ...f, email: session.user.email }));
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateResume = async () => {
    if (!form.fullName || !form.targetRole || !form.experience) {
      alert("Please fill in at least your name, target role, and experience!");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      setGeneratedResume(data.resume);
      setStep(3);
    } catch (err) {
      alert("Error generating resume. Please try again.");
    }
    setLoading(false);
  };

  const downloadResume = () => {
    const blob = new Blob([generatedResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.fullName.replace(" ", "_")}_Resume.txt`;
    a.click();
    alert("Resume downloaded! You can copy the text into a Word document and format it with your chosen template.");
  };

  if (!user) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}><div style={{ color: "white" }}>Loading...</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "Arial" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 onClick={() => router.push("/resume")} style={{ color: "white", margin: 0, fontSize: "24px", cursor: "pointer" }}>🚀 JobwinResume</h1>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>✨ Create New Resume</span>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "40px" }}>
          {["Your Details", "Choose Template", "Your Resume"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: step > i ? "#667eea" : step === i + 1 ? "#667eea" : "#ddd", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>{i + 1}</div>
              <span style={{ fontSize: "13px", color: step === i + 1 ? "#667eea" : "#999", fontWeight: step === i + 1 ? "bold" : "normal" }}>{s}</span>
              {i < 2 && <span style={{ color: "#ddd" }}>→</span>}
            </div>
          ))}
        </div>

        {/* STEP 1 — Details form */}
        {step === 1 && (
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 2px 15px rgba(0,0,0,0.08)" }}>
            <h2 style={{ color: "#1a1a2e", marginBottom: "24px" }}>Tell us about yourself</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { name: "fullName", label: "Full Name *", placeholder: "Rahul Sharma" },
                { name: "email", label: "Email *", placeholder: "rahul@gmail.com" },
                { name: "phone", label: "Phone", placeholder: "+91 98765 43210" },
                { name: "city", label: "City", placeholder: "Mumbai" },
                { name: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/rahulsharma" },
                { name: "targetRole", label: "Target Job Role *", placeholder: "Data Analyst" },
              ].map((field) => (
                <div key={field.name}>
                  <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "bold" }}>{field.label}</label>
                  <input
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "bold" }}>Work Experience * (describe your roles, companies, years)</label>
              <textarea name="experience" value={form.experience} onChange={handleChange} placeholder="E.g. 3 years as Data Analyst at TCS. Worked on SQL dashboards, Power BI reports, Python automation scripts. Led a team of 2..." style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", height: "100px", resize: "vertical", outline: "none" }} />
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "bold" }}>Education</label>
              <textarea name="education" value={form.education} onChange={handleChange} placeholder="E.g. B.Tech Computer Science, Mumbai University, 2019. 7.5 CGPA." style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", height: "80px", resize: "vertical", outline: "none" }} />
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "bold" }}>Key Skills (comma separated)</label>
              <input name="skills" value={form.skills} onChange={handleChange} placeholder="Python, SQL, Power BI, Excel, Tableau, Machine Learning" style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }} />
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "bold" }}>Key Achievements (optional)</label>
              <textarea name="achievements" value={form.achievements} onChange={handleChange} placeholder="E.g. Reduced reporting time by 60%, Built dashboard used by 500+ users, Promoted within 1 year..." style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", height: "80px", resize: "vertical", outline: "none" }} />
            </div>

            <button onClick={() => setStep(2)} style={{ marginTop: "24px", width: "100%", padding: "15px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
              Next — Choose Template →
            </button>
          </div>
        )}

        {/* STEP 2 — Template selection */}
        {step === 2 && (
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 2px 15px rgba(0,0,0,0.08)" }}>
            <h2 style={{ color: "#1a1a2e", marginBottom: "8px" }}>Choose your template</h2>
            <p style={{ color: "#666", marginBottom: "30px" }}>All templates are ATS-friendly and professionally designed</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "30px" }}>
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  style={{ border: selectedTemplate === t.id ? `3px solid ${t.accent}` : "2px solid #e0e0e0", borderRadius: "12px", overflow: "hidden", cursor: "pointer" }}
                >
                  {/* Template preview */}
                  <div style={{ background: t.color, padding: "16px", textAlign: "center" }}>
                    <div style={{ color: "white", fontWeight: "bold", fontSize: "13px" }}>RESUME</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", marginTop: "4px" }}>Preview</div>
                  </div>
                  <div style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", color: "#1a1a2e", marginBottom: "4px" }}>{t.name}</div>
                    <div style={{ fontSize: "12px", color: "#999" }}>{t.desc}</div>
                    {selectedTemplate === t.id && <div style={{ color: t.accent, fontWeight: "bold", fontSize: "12px", marginTop: "6px" }}>✓ Selected</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "15px", background: "#f5f5f5", color: "#666", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer" }}>← Back</button>
              <button onClick={generateResume} disabled={loading} style={{ flex: 2, padding: "15px", background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "🤖 AI is writing your resume..." : "✨ Generate My Resume →"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Generated resume */}
        {step === 3 && (
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 2px 15px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ color: "#1a1a2e", margin: 0 }}>✅ Your Resume is Ready!</h2>
              <button onClick={downloadResume} style={{ background: "#0B7B3E", color: "white", border: "none", padding: "12px 24px", borderRadius: "10px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}>📥 Download</button>
            </div>

            <div style={{ background: "#f8f9ff", borderRadius: "12px", padding: "30px", fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: "1.8", color: "#333", whiteSpace: "pre-wrap", maxHeight: "500px", overflowY: "auto", border: "1px solid #e0e0e0" }}>
              {generatedResume}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button onClick={() => router.push("/resume-tailor")} style={{ flex: 1, padding: "12px", background: "#667eea", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>🎯 Tailor this for a specific job</button>
              <button onClick={() => router.push("/")} style={{ flex: 1, padding: "12px", background: "#f5f5f5", color: "#666", border: "none", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>🔍 Search Jobs</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
