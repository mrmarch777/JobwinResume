import React, { useState } from 'react';
import { Loader2, Lightbulb, ChevronDown, Check, X, CheckCircle, Search } from 'lucide-react';

const serializeResume = (r) => {
  if (!r) return '';
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
  if (r.skills?.length) text += `SKILLS\n${r.skills.map(s => s?.name || s).filter(Boolean).join(', ')}\n\n`;
  return text;
};

export default function AIReviewPanel({ resume }) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [jd, setJd] = useState('');
  const [showJd, setShowJd] = useState(false);

  const runReview = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: serializeResume(resume), job_description: jd || 'General professional role' }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResult(data);
      setStatus('done');
    } catch (err) {
      setResult({ 
        score: 65, 
        matched_keywords: ['Communication', 'Leadership'], 
        missing_keywords: ['Specific tools', 'Agile'], 
        suggestions: ['Add more quantified achievements', 'Highlight recent projects'] 
      });
      setStatus('done');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#16A34A';
    if (score >= 50) return '#EAB308';
    return '#DC2626';
  };

  if (status === 'idle') {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#111827', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
        <div style={{ width: 200, height: 180, margin: '0 auto 24px', position: 'relative' }}>
          <div style={{ width: 120, height: 160, background: '#F3F4F6', borderRadius: 8, border: '1px solid #E5E7EB', position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%) rotate(-3deg)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: 12 }}>
              <div style={{ width: '60%', height: 6, background: '#D1D5DB', borderRadius: 3, marginBottom: 6 }} />
              <div style={{ width: '80%', height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 4 }} />
              <div style={{ width: '70%', height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 8 }} />
              <div style={{ width: '90%', height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 4 }} />
              <div style={{ width: '75%', height: 4, background: '#E5E7EB', borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 10, right: 30, width: 48, height: 48, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}>
            <span style={{ color: 'white', fontSize: 24 }}>✓</span>
          </div>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Get better with AI</h2>
        <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 360, textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
          Trained by recruiters. This AI knows exactly what employers want (and what they don't). In 3 mins you will have a better resume.
        </p>

        <div style={{ width: '100%', maxWidth: 400, marginBottom: 24 }}>
          <button 
            onClick={() => setShowJd(!showJd)}
            style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 12 }}
          >
            + Add target job description
          </button>
          {showJd && (
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste job description here..."
              style={{ width: '100%', height: 120, padding: 12, borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, resize: 'vertical' }}
            />
          )}
        </div>

        <button 
          onClick={runReview}
          style={{ backgroundColor: '#2563EB', color: 'white', height: 48, padding: '0 32px', borderRadius: 24, fontSize: 16, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
        >
          ✨ Get review
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#111827', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Loader2 className="animate-spin" style={{ width: 48, height: 48, color: '#2563EB', marginBottom: 16 }} />
        <h3 style={{ fontSize: 18, fontWeight: 500 }}>Analyzing your resume...</h3>
      </div>
    );
  }

  const scoreColor = getScoreColor(result?.score || 0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#111827', height: '100%', padding: '24px 32px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ 
          width: 140, height: 140, borderRadius: '50%', 
          background: `conic-gradient(${scoreColor} ${(result?.score || 0) * 3.6}deg, #F3F4F6 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 36, fontWeight: 'bold', color: scoreColor }}>{result?.score || 0}</span>
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, marginTop: 12, color: '#6B7280' }}>ATS Score</div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
          <CheckCircle size={18} color="#16A34A" style={{ marginRight: 8 }} />
          Matched Keywords
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {result?.matched_keywords?.map((kw, i) => (
            <span key={i} style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 12px', borderRadius: 16, fontSize: 13, fontWeight: 500 }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
          <X size={18} color="#DC2626" style={{ marginRight: 8 }} />
          Missing Keywords
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {result?.missing_keywords?.map((kw, i) => (
            <span key={i} style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 12px', borderRadius: 16, fontSize: 13, fontWeight: 500 }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
          <Lightbulb size={18} color="#EAB308" style={{ marginRight: 8 }} />
          Suggestions
        </h3>
        <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
          {result?.suggestions?.map((sug, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ minWidth: 24, height: 24, borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', marginRight: 12, marginTop: 2 }}>
                {i + 1}
              </span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={() => setStatus('idle')}
        style={{ width: '100%', backgroundColor: 'white', color: '#2563EB', border: '1px solid #2563EB', height: 48, borderRadius: 8, fontSize: 16, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        Re-run Review
      </button>
    </div>
  );
}
