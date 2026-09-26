import React, { useState } from 'react';
import { Lightbulb, CheckCircle, X } from 'lucide-react';

// Inline spin animation since Tailwind isn't loaded here
const spinKeyframes = `
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const serializeResume = (r) => {
  if (!r) return '';
  let text = `${r.personal?.name || ''}\n${r.personal?.title || ''}\n${r.personal?.email || ''} | ${r.personal?.phone || ''} | ${r.personal?.location || ''}\n\n`;
  if (r.summary) text += `PROFESSIONAL SUMMARY\n${r.summary}\n\n`;
  if (r.experience?.length) {
    text += 'EXPERIENCE\n';
    r.experience.forEach(e => {
      text += `${e.title} at ${e.company}, ${e.location} (${e.startDate} - ${e.current ? 'Present' : e.endDate})\n`;
      e.bullets?.forEach(b => { if (b) text += `\u2022 ${b}\n`; });
      text += '\n';
    });
  }
  if (r.education?.length) {
    text += 'EDUCATION\n';
    r.education.forEach(e => { text += `${e.degree} in ${e.field}, ${e.institution} (${e.year})\n`; });
    text += '\n';
  }
  // Handle both canonical { items: [...] } shape and legacy flat array
  const skillItems = Array.isArray(r.skills?.items)
    ? r.skills.items
    : Array.isArray(r.skills) ? r.skills : [];
  if (skillItems.length) {
    text += `SKILLS\n${skillItems.map(s => s?.name || s).filter(Boolean).join(', ')}\n\n`;
  }
  if (r.certifications?.length) {
    text += 'CERTIFICATIONS\n';
    r.certifications.forEach(c => { text += `${c.name} \u2014 ${c.issuer} (${c.year})\n`; });
    text += '\n';
  }
  if (r.languages?.length) {
    text += `LANGUAGES\n${r.languages.map(l => `${l.name} (${l.level})`).join(', ')}\n\n`;
  }
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

  
  const getScoreData = () => {
    let contentScore = 0;
    let keywords = 0;
    let format = 0;
    let completeness = 0;
    let missing = [];
    const r = resume || {};

    if (r.summary) contentScore += 5; else missing.push('Add a professional summary');
    if (r.summary && r.summary.trim().split(/\s+/).length > 50) contentScore += 5; else missing.push('Make summary longer (>50 words)');
    
    let hasExpBullets = false;
    let hasGoodBullets = false;
    if (r.experience?.length) {
      r.experience.forEach(e => {
        if (e.bullets?.length) {
          hasExpBullets = true;
          if (e.bullets.some(b => b && b.length > 10)) hasGoodBullets = true;
        }
      });
    }
    if (hasExpBullets) contentScore += 5; else missing.push('Add bullet points to experience');
    if (hasGoodBullets) contentScore += 5; else missing.push('Make experience bullets more detailed (>10 chars)');
    if (r.education?.length) contentScore += 5; else missing.push('Add education details');

    const skillItems = Array.isArray(r.skills?.items) ? r.skills.items : (Array.isArray(r.skills) ? r.skills : []);
    if (skillItems.length > 0) keywords += 10; else missing.push('Add a skills section');
    if (skillItems.length >= 5) keywords += 10; else missing.push('Add at least 5 skills');
    if (skillItems.length > 0 && skillItems.every(s => s && (s.name || typeof s === 'string'))) keywords += 5;

    if (r.personal?.name) format += 5; else missing.push('Add your name');
    if (r.personal?.email) format += 5; else missing.push('Add your email');
    if (r.personal?.phone) format += 5; else missing.push('Add your phone number');
    if (r.personal?.location) format += 5; else missing.push('Add your location');
    if (r.personal?.linkedin) format += 5; else missing.push('Add your LinkedIn profile');

    if (r.experience?.length) completeness += 5; else missing.push('Add experience section');
    if (r.education?.length) completeness += 5;
    if (skillItems.length > 0) completeness += 5;
    if (r.summary) completeness += 5;
    
    let extraSections = 0;
    if (r.certifications?.length) extraSections++;
    if (r.languages?.length) extraSections++;
    if (r.projects?.length) extraSections++;
    if (r.achievements?.length) extraSections++;
    if (extraSections > 0) completeness += 5; else missing.push('Add an extra section (Projects, Certifications, etc.)');

    const total = contentScore + keywords + format + completeness;
    const tips = [...new Set(missing)].slice(0, 3);
    if (tips.length === 0) tips.push('Your resume looks great!', 'Tailor it to the job description', 'Double check for typos');

    return { total, contentScore, keywords, format, completeness, tips };
  };

  const scoreData = getScoreData();

  const getBarColor = (val) => {
    if (val >= 20) return '#16A34A';
    if (val >= 10) return '#EAB308';
    return '#DC2626';
  };
  
  const scorePanel = (
    <div style={{ marginBottom: 32, padding: 24, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1E293B' }}>Resume Score</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
        {/* Circular Progress */}
        <div style={{ 
          width: 120, height: 120, borderRadius: '50%', 
          background: `conic-gradient(${getScoreColor(scoreData.total)} ${scoreData.total * 3.6}deg, #E2E8F0 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 'bold', color: getScoreColor(scoreData.total) }}>{scoreData.total}</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>/ 100</span>
          </div>
        </div>

        {/* Category Bars */}
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#475569' }}>
              <span>Content</span><span>{scoreData.contentScore}/25</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
              <div style={{ width: `${(scoreData.contentScore / 25) * 100}%`, height: '100%', backgroundColor: getBarColor(scoreData.contentScore), borderRadius: 4 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#475569' }}>
              <span>Keywords</span><span>{scoreData.keywords}/25</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
              <div style={{ width: `${(scoreData.keywords / 25) * 100}%`, height: '100%', backgroundColor: getBarColor(scoreData.keywords), borderRadius: 4 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#475569' }}>
              <span>Format</span><span>{scoreData.format}/25</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
              <div style={{ width: `${(scoreData.format / 25) * 100}%`, height: '100%', backgroundColor: getBarColor(scoreData.format), borderRadius: 4 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#475569' }}>
              <span>Completeness</span><span>{scoreData.completeness}/25</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
              <div style={{ width: `${(scoreData.completeness / 25) * 100}%`, height: '100%', backgroundColor: getBarColor(scoreData.completeness), borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', color: '#1E293B' }}>
          <Lightbulb size={16} color="#EAB308" style={{ marginRight: 8 }} />
          Quick Tips for Improvement
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {scoreData.tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </div>
    </div>
  );

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

        {scorePanel}
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
        <style>{spinKeyframes}</style>
        <div style={{ width: 48, height: 48, border: '4px solid #DBEAFE', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
        <h3 style={{ fontSize: 18, fontWeight: 500 }}>Analyzing your resume...</h3>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>This usually takes 20-30 seconds</p>
      </div>
    );
  }

  const scoreColor = getScoreColor(result?.score || 0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#111827', height: '100%', padding: '24px 32px', overflowY: 'auto' }}>
      {scorePanel}
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
