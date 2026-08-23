import React, { useState } from 'react';
import { Target, Loader2, ExternalLink } from 'lucide-react';

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

export default function TailorJobDetail({ job, resume, onApplyOptimization }) {
  const [tailoring, setTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState(null);

  const tailorResume = async () => {
    setTailoring(true);
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_data: serializeResume(resume), job_description: job.description || job.snippet }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setTailorResult(data);
    } catch (err) {
      setTailorResult({ 
        suggestions: ['Could not connect to AI service. Please try again.'],
        missing_keywords: ['React', 'TypeScript']
      });
    }
    setTailoring(false);
  };

  if (!job) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#111827', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <Target size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
        <h3 style={{ fontSize: 18, fontWeight: 500, color: '#6B7280' }}>Select a job from the left to see details and tailor your resume.</h3>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#111827', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
        <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>{job.company}</div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 'bold' }}>{job.title}</h2>
        <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
          {job.location} • {job.posted}
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={tailorResume}
            disabled={tailoring}
            style={{ flex: 2, backgroundColor: '#2563EB', color: 'white', height: 44, borderRadius: 6, fontSize: 15, fontWeight: 500, border: 'none', cursor: tailoring ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {tailoring ? <Loader2 className="animate-spin" size={18} style={{ marginRight: 8 }} /> : null}
            {tailoring ? 'Tailoring...' : 'Tailor for this job'}
          </button>
          <button 
            style={{ flex: 1, backgroundColor: 'white', color: '#374151', border: '1px solid #D1D5DB', height: 44, borderRadius: 6, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => window.open(job.url || '#', '_blank')}
          >
            Apply <ExternalLink size={16} style={{ marginLeft: 6 }} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        
        {tailorResult && (
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, marginBottom: 32 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Optimization Suggestions</h3>
            
            {tailorResult.missing_keywords && tailorResult.missing_keywords.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Keywords to add:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tailorResult.missing_keywords.map((kw, i) => (
                    <span key={i} style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: 4, fontSize: 13 }}>
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {tailorResult.suggestions && tailorResult.suggestions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Bullet improvements:</div>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
                  {tailorResult.suggestions.map((sug, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            <button 
              onClick={() => onApplyOptimization && onApplyOptimization(tailorResult)}
              style={{ backgroundColor: '#10B981', color: 'white', height: 36, padding: '0 16px', borderRadius: 4, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
            >
              Apply All Suggestions
            </button>
          </div>
        )}

        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600 }}>Job Description</h3>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {job.description || job.snippet || 'No detailed job description provided.'}
          </div>
        </div>
        
      </div>
    </div>
  );
}
