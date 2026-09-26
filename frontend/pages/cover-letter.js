import { useState, useEffect } from "react";
import Head from "next/head";
import PageHead from "../components/PageHead";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/contexts";
import Sidebar from "../components/Sidebar";

export default function CoverLetter() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const { theme: t } = useTheme();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    jd: "",
    yourName: "",
    tone: "professional"
  });
  const [generatedLetter, setGeneratedLetter] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      
      const { data } = await supabase.from('profiles').select('full_name').eq('user_id', session.user.id).single();
      const name = data?.full_name || session.user.email.split('@')[0];
      setFormData(prev => ({ ...prev, yourName: name }));
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateLetter = async () => {
    if (!formData.jobTitle || !formData.company || !formData.jd) {
      alert("Please fill out job title, company, and description.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.coverLetter) {
        setGeneratedLetter(data.coverLetter);
      } else {
        alert("Failed to generate cover letter.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating cover letter.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${formData.company || "Job"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    alert("Copied to clipboard!");
  };

  if (!user) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090f', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <PageHead title="Cover Letter Builder" description="AI generated cover letters" />
      <Sidebar activeId="cover" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      
      <main style={{ flex: 1, marginLeft: collapsed ? "72px" : "240px", padding: "40px", transition: "margin-left 0.3s ease", display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "32px", marginBottom: "8px" }}>Cover Letter Builder</h1>
        <p style={{ color: t.muted, marginBottom: "32px" }}>Generate tailored cover letters instantly with AI.</p>
        
        <div style={{ display: "flex", gap: "24px", flex: 1, alignItems: 'stretch' }}>
          
          {/* Left Panel */}
          <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "24px", border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}>
             
             <div style={{ marginBottom: "16px" }}>
               <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Your Name</label>
               <input name="yourName" value={formData.yourName} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} />
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
               <div>
                 <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Job Title</label>
                 <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Frontend Developer" style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} />
               </div>
               <div>
                 <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Company Name</label>
                 <input name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Google" style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} />
               </div>
             </div>

             <div style={{ marginBottom: "16px", flex: 1, display: 'flex', flexDirection: 'column' }}>
               <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Job Description</label>
               <textarea name="jd" value={formData.jd} onChange={handleChange} placeholder="Paste the job description here..." style={{ width: "100%", flex: 1, minHeight: '200px', padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none", resize: "none" }} />
             </div>

             <div style={{ marginBottom: "24px" }}>
               <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Tone</label>
               <select name="tone" value={formData.tone} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none", appearance: 'none' }}>
                 <option value="professional">Professional</option>
                 <option value="friendly">Friendly</option>
                 <option value="confident">Confident</option>
               </select>
             </div>

             <button onClick={generateLetter} disabled={loading} style={{ padding: "14px 24px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", width: "100%", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Generating..." : "Generate Cover Letter ✨"}
             </button>
          </div>

          {/* Right Panel */}
          <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "24px", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Preview</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                 <button onClick={handleCopy} disabled={!generatedLetter} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, borderRadius: "8px", color: t.text, cursor: "pointer", fontSize: "13px", opacity: generatedLetter ? 1 : 0.5 }}>Copy</button>
                 <button onClick={handleDownload} disabled={!generatedLetter} style={{ padding: "8px 16px", background: "rgba(67,217,162,0.1)", border: "1px solid rgba(67,217,162,0.2)", borderRadius: "8px", color: "#43D9A2", cursor: "pointer", fontSize: "13px", opacity: generatedLetter ? 1 : 0.5 }}>Download .txt</button>
              </div>
            </div>
            <textarea value={generatedLetter} onChange={(e) => setGeneratedLetter(e.target.value)} placeholder="Your generated cover letter will appear here..." style={{ width: "100%", flex: 1, padding: "20px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", lineHeight: "1.6", outline: "none", resize: "none" }} />
          </div>

        </div>
      </main>
    </div>
  );
}
