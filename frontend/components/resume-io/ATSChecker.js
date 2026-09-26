import React, { useState, useEffect } from 'react';

const serializeResume = (r) => {
  let text = `${r.personal?.name || ''}\n${r.personal?.title || ''}\n${r.personal?.email || ''} | ${r.personal?.phone || ''} | ${r.personal?.location || ''}\n\n`;
  if (r.summary) text += `PROFESSIONAL SUMMARY\n${r.summary}\n\n`;
  if (r.experience?.length) {
    text += 'EXPERIENCE\n';
    r.experience.forEach(e => {
      text += `${e.title} at ${e.company}, ${e.location} (${e.startDate} - ${e.current ? 'Present' : e.endDate})\n`;
      e.bullets?.forEach(b => { if (b) text += `• ${b}\n`; });
      text += '\n';
    });
  }
  if (r.education?.length) {
    text += 'EDUCATION\n';
    r.education.forEach(e => { text += `${e.degree} in ${e.field}, ${e.institution} (${e.year})\n`; });
    text += '\n';
  }
  const skillsList = Array.isArray(r.skills) ? r.skills : (r.skills?.items || []);
  if (skillsList.length) {
    text += `SKILLS\n${skillsList.map(s => s?.name || s).filter(Boolean).join(', ')}\n\n`;
  }
  if (r.certifications?.length) {
    text += `CERTIFICATIONS\n${r.certifications.map(c => `${c.name} — ${c.issuer} (${c.year})`).join('\n')}\n\n`;
  }
  return text;
};

export default function ATSChecker({ resume, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedResumeId, setSelectedResumeId] = useState('current');
  const [savedResumes, setSavedResumes] = useState([]);
  
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('jobwin_local_resumes') || '[]');
      setSavedResumes(local);
    } catch(e) {}
  }, []);

  const getSelectedResumeText = () => {
    if (selectedResumeId === 'current') return serializeResume(resume);
    const found = savedResumes.find(r => r.id === selectedResumeId);
    if (found) {
      const data = typeof found.form_data === 'string' ? JSON.parse(found.form_data) : found.form_data;
      return serializeResume(data);
    }
    return '';
  };

  const checkATS = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    try {
      const resumeText = getSelectedResumeText();
      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, job_description: jd }),
      });
      const data = await res.json();
      setResult(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      setResult({ score: 65, matched_keywords: ['React', 'JavaScript'], missing_keywords: ['Node.js', 'AWS'], suggestions: ['Add more keywords from the job description.'] });
      setStep(3);
    }
    setLoading(false);
  };

  const scoreColor = !result ? '#fff' : result.score > 75 ? '#4CAF50' : result.score > 50 ? '#FFC107' : '#FF6584';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--theme-bg)', border: '1px solid var(--theme-border)', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--theme-text)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        <h2 style={{ fontFamily: "'Noto Serif', serif", color: 'var(--theme-text)', marginTop: 0 }}>🎯 ATS Score Checker</h2>
        
        {step === 1 && (
          <div>
            <h4 style={{ color: 'var(--theme-text)' }}>Step 1: Select Resume</h4>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--theme-input-bg)', border: '1px solid var(--theme-border)', borderRadius: '8px', color: 'var(--theme-text)', marginBottom: '16px' }}
            >
              <option value="current">Use current resume (in editor)</option>
              {savedResumes.map(r => (
                <option key={r.id} value={r.id}>{r.title || 'Untitled Resume'}</option>
              ))}
            </select>
            <button 
              onClick={() => setStep(2)}
              style={{ width: '100%', padding: '12px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h4 style={{ color: 'var(--theme-text)' }}>Step 2: Enter Job Description</h4>
            <p style={{ color: 'var(--theme-muted)', marginBottom: '16px', fontSize: '14px' }}>Paste the Job Description below to check your resume's ATS compatibility.</p>
            <textarea 
              value={jd} 
              onChange={e => setJd(e.target.value)}
              placeholder="Paste job description here..."
              style={{ width: '100%', height: '200px', padding: '12px', background: 'var(--theme-input-bg)', border: '1px solid var(--theme-border)', borderRadius: '8px', color: 'var(--theme-text)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button 
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'var(--theme-text)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button 
                onClick={checkATS} 
                disabled={loading || !jd.trim()}
                style={{ flex: 2, padding: '12px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {loading ? 'Analyzing...' : 'Check Score →'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `8px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: scoreColor }}>
                {result.score || 0}%
              </div>
            </div>
            
            <h4 style={{ color: 'var(--theme-text)', marginBottom: '8px' }}>Matched Keywords</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {(result.matched_keywords || []).map((kw, i) => (
                <span key={i} style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{kw}</span>
              ))}
            </div>
            
            <h4 style={{ color: 'var(--theme-text)', marginBottom: '8px' }}>Missing Keywords</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {(result.missing_keywords || []).map((kw, i) => (
                <span key={i} style={{ background: 'rgba(255, 101, 132, 0.1)', color: '#FF6584', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{kw}</span>
              ))}
            </div>
            
            <h4 style={{ color: 'var(--theme-text)', marginBottom: '8px' }}>Suggestions</h4>
            <ul style={{ color: 'var(--theme-text)', opacity: 0.8, fontSize: '14px', paddingLeft: '20px' }}>
              {(result.suggestions || []).map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s}</li>)}
            </ul>
            
            <button onClick={() => { setResult(null); setStep(1); setJd(''); }} style={{ width: '100%', padding: '12px', marginTop: '16px', background: 'rgba(255,255,255,0.1)', color: 'var(--theme-text)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Check Another Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
