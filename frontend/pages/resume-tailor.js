import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function ResumeTailor() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [atsScore, setAtsScore] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
    });

    // Check if job was passed from search results
    const params = new URLSearchParams(window.location.search);
    if (params.get("job_title")) setJobTitle(params.get("job_title"));
    if (params.get("job_company")) setJobCompany(params.get("job_company"));
    if (params.get("job_description")) setJobDescription(decodeURIComponent(params.get("job_description")));
  }, []);

  const checkATS = async () => {
    if (!resumeText || !jobDescription) {
      alert("Please paste both your resume and the job description!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ats-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
      });
      const data = await response.json();
      setAtsScore(data);
    } catch (err) {
      alert("Error checking ATS score. Make sure backend is running!");
    }
    setLoading(false);
  };

  const tailorResume = async () => {
    if (!resumeText || !jobDescription) {
      alert("Please paste both your resume and the job description!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tailor-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          job_title: jobTitle || "the position",
          job_company: jobCompany || "the company",
          job_description: jobDescription,
        }),
      });
      const data = await response.json();
      setResult(data.tailored_resume);
    } catch (err) {
      alert("Error tailoring resume. Make sure backend is running!");
    }
    setLoading(false);
  };

  const downloadResume = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tailored_Resume_${jobCompany || "Job"}.txt`;
    a.click();
  };

  if (!user) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}><div style={{ color: "white" }}>Loading...</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "Arial" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 onClick={() => router.push("/resume")} style={{ color: "white", margin: 0, fontSize: "24px", cursor: "pointer" }}>🚀 JobwinResume</h1>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>🎯 Tailor Resume to Job</span>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
        <h2 style={{ color: "#1a1a2e", marginBottom: "8px" }}>🎯 Tailor Your Resume</h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>Paste your resume and a job description — AI rewrites your resume to match the job perfectly</p>

        {/* Job details */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 15px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1a2e", marginBottom: "16px" }}>Job Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "bold" }}>Job Title</label>
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Data Analyst" style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "bold" }}>Company Name</label>
              <input value={jobCompany} onChange={e => setJobCompany(e.target.value)} placeholder="e.g. Infosys" style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "bold" }}>Job Description *</label>
            <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", height: "120px", resize: "vertical", outline: "none" }} />
          </div>
        </div>

        {/* Resume input */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 15px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1a2e", marginBottom: "8px" }}>Your Current Resume</h3>
          <p style={{ color: "#999", fontSize: "13px", marginBottom: "16px" }}>Paste your existing resume text here</p>
          <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume here..." style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", height: "200px", resize: "vertical", outline: "none" }} />
        </div>

        {/* ATS Score */}
        {atsScore && (
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 15px rgba(0,0,0,0.06)", borderLeft: `4px solid ${atsScore.score >= 70 ? "#0B7B3E" : atsScore.score >= 40 ? "#B45309" : "#B91C1C"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: atsScore.score >= 70 ? "#0B7B3E" : atsScore.score >= 40 ? "#B45309" : "#B91C1C" }}>{atsScore.score}%</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "18px", color: "#1a1a2e" }}>ATS Match Score</div>
                <div style={{ color: "#666", fontSize: "14px" }}>{atsScore.score >= 70 ? "Great match! ✅" : atsScore.score >= 40 ? "Needs improvement ⚠️" : "Poor match ❌ — tailor your resume"}</div>
              </div>
            </div>
            {atsScore.missing_keywords?.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ fontSize: "13px", color: "#555" }}>Missing keywords:</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {atsScore.missing_keywords.map((kw, i) => <span key={i} style={{ background: "#FCEBEB", color: "#B91C1C", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" }}>{kw}</span>)}
                </div>
              </div>
            )}
            {atsScore.top_fix && <div style={{ background: "#EBF3FF", color: "#185FA5", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>💡 Top fix: {atsScore.top_fix}</div>}
          </div>
        )}

        {/* Generated resume */}
        {result && (
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 15px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ color: "#0B7B3E", margin: 0 }}>✅ Tailored Resume Ready!</h3>
              <button onClick={downloadResume} style={{ background: "#0B7B3E", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>📥 Download</button>
            </div>
            <div style={{ background: "#f8f9ff", borderRadius: "8px", padding: "20px", fontFamily: "Georgia, serif", fontSize: "13px", lineHeight: "1.8", whiteSpace: "pre-wrap", maxHeight: "400px", overflowY: "auto", border: "1px solid #e0e0e0" }}>
              {result}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={checkATS} disabled={loading} style={{ flex: 1, padding: "15px", background: loading ? "#ccc" : "#185FA5", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Checking..." : "📊 Check ATS Score"}
          </button>
          <button onClick={tailorResume} disabled={loading} style={{ flex: 2, padding: "15px", background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "🤖 AI is tailoring your resume..." : "🎯 Tailor My Resume with AI"}
          </button>
        </div>
      </div>
    </div>
  );
}
