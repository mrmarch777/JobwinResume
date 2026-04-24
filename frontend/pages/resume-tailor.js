import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { extractTextFromPDF, extractTextFromDOCX } from "../lib/resumeParser";

export default function ResumeTailor() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/login");
      else setUser(session.user);
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get("job_title")) setJobTitle(params.get("job_title"));
    if (params.get("job_company")) setJobCompany(params.get("job_company"));
    if (params.get("job_description")) setJobDescription(decodeURIComponent(params.get("job_description")));
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setStatus("Reading file...");
    setLoading(true);
    try {
      let text = file.name.endsWith(".pdf") ? await extractTextFromPDF(file) : await extractTextFromDOCX(file);
      setResumeText(text);
      setStatus("Resume loaded!");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const checkATS = async () => {
    if (!resumeText || !jobDescription) { alert("Fill in both fields!"); return; }
    setLoading(true);
    setStatus("Analyzing...");
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comprehensive-ats-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
      });
      const data = await resp.json();
      setAtsAnalysis(data);
      setStatus("Analysis complete!");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      setError("Analysis failed. Backend running?");
    }
    setLoading(false);
  };

  const tailor = async () => {
    if (!resumeText || !jobDescription) { alert("Fill in both fields!"); return; }
    setLoading(true);
    setStatus("Tailoring...");
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tailor-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          job_title: jobTitle || "role",
          job_company: jobCompany || "company",
          job_description: jobDescription,
        }),
      });
      const data = await resp.json();
      setResult(data.tailored_resume);
      setStatus("Done!");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      setError("Tailor failed.");
    }
    setLoading(false);
  };

  if (!user) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}><div style={{ color: "white" }}>Loading...</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px 40px" }}>
        <h1 onClick={() => router.push("/")} style={{ color: "white", margin: 0, fontSize: "24px", cursor: "pointer" }}>🚀 JobwinResume</h1>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 20px" }}>
        <h2>🎯 ATS Analyzer & Resume Tailor</h2>

        {error && <div style={{ background: "#FFE5E5", padding: "12px", borderRadius: "6px", marginBottom: "15px", color: "#991B1B" }}>❌ {error}</div>}
        {status && <div style={{ background: "#E0E7FF", padding: "12px", borderRadius: "6px", marginBottom: "15px", color: "#5B21B6", textAlign: "center" }}>{status}</div>}

        <div style={{ background: "white", borderRadius: "8px", padding: "15px", marginBottom: "15px" }}>
          <h3>📋 Job</h3>
          <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Job Title" style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} />
          <input value={jobCompany} onChange={e => setJobCompany(e.target.value)} placeholder="Company" style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} />
          <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Job description" style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", height: "80px", boxSizing: "border-box" }} />
        </div>

        <div style={{ background: "white", borderRadius: "8px", padding: "15px", marginBottom: "15px" }}>
          <h3>📄 Resume</h3>
          <div style={{ marginBottom: "10px", border: "2px dashed #667eea", padding: "15px", textAlign: "center", borderRadius: "4px" }}>
            <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} disabled={loading} style={{ display: "none" }} id="file" />
            <label htmlFor="file" style={{ cursor: "pointer", color: "#667eea", fontWeight: "bold" }}>📤 Upload PDF/DOCX</label>
          </div>
          <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Or paste resume" style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", height: "100px", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button onClick={checkATS} disabled={loading || !resumeText || !jobDescription} style={{ flex: 1, padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>📊 Check ATS</button>
          <button onClick={tailor} disabled={loading || !resumeText || !jobDescription} style={{ flex: 1, padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>✨ Tailor</button>
        </div>

        {atsAnalysis && atsAnalysis.overall_score !== undefined && (
          <div style={{ background: "white", borderRadius: "8px", padding: "15px", marginBottom: "15px" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: atsAnalysis.overall_score >= 70 ? "#0B7B3E" : "#B91C1C" }}>{atsAnalysis.overall_score}% Match</div>
            <p><strong>Strengths:</strong> {atsAnalysis.strengths}</p>
            <p><strong>Weaknesses:</strong> {atsAnalysis.weaknesses}</p>
            {atsAnalysis.missing_hard_skills?.length > 0 && (
              <div><strong>Missing:</strong> {atsAnalysis.missing_hard_skills.join(", ")}</div>
            )}
            {atsAnalysis.top_3_improvements?.map((imp, i) => (
              <div key={i} style={{ fontSize: "12px", marginTop: "6px", padding: "6px", background: "#F3F4F6" }}>{i+1}. {imp.action}</div>
            ))}
          </div>
        )}

        {result && (
          <div style={{ background: "white", borderRadius: "8px", padding: "15px" }}>
            <h3>✅ Tailored Resume</h3>
            <button onClick={() => { const blob = new Blob([result], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "resume.txt"; a.click(); }} style={{ marginBottom: "10px", padding: "8px 16px", background: "#0B7B3E", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>📥 Download</button>
            <textarea value={result} readOnly style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", height: "150px", fontFamily: "monospace", fontSize: "11px", boxSizing: "border-box" }} />
          </div>
        )}
      </div>
    </div>
  );
}
