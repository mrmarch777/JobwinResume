import React, { useState } from 'react';

export default function JDOptimizer({ resume, onApplyOptimization, onClose }) {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const optimizeResume = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tailor-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_data: resume, job_description: jd }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || { missingKeywords: ['Keyword1'], bulletImprovements: [] });
    } catch (err) {
      console.error(err);
      setSuggestions({
        missingKeywords: ['Agile', 'GraphQL'],
        bulletImprovements: [{ old: 'Did stuff', new: 'Led cross-functional team using Agile methodologies' }]
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--theme-bg)', border: '1px solid var(--theme-border)', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--theme-text)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        <h2 style={{ fontFamily: "'Noto Serif', serif", color: 'var(--theme-text)', marginTop: 0 }}>🎯 Optimize for Job Description</h2>
        
        {!suggestions ? (
          <>
            <p style={{ color: 'var(--theme-muted)', marginBottom: '16px' }}>Paste the Job Description below to get AI-powered optimization suggestions.</p>
            <textarea 
              value={jd} 
              onChange={e => setJd(e.target.value)}
              placeholder="Paste job description here..."
              style={{ width: '100%', height: '200px', padding: '12px', background: 'var(--theme-input-bg)', border: '1px solid var(--theme-border)', borderRadius: '8px', color: 'var(--theme-text)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <button 
              onClick={optimizeResume} 
              disabled={loading || !jd.trim()}
              style={{ width: '100%', padding: '12px', marginTop: '16px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Optimizing...' : 'Optimize Resume'}
            </button>
          </>
        ) : (
          <div>
            <h4 style={{ color: 'var(--theme-text)', marginBottom: '8px' }}>Missing Keywords</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {(suggestions.missingKeywords || []).map((kw, i) => (
                <span key={i} style={{ background: 'rgba(255, 101, 132, 0.1)', color: '#FF6584', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>+ {kw}</span>
              ))}
            </div>
            
            <h4 style={{ color: 'var(--theme-text)', marginBottom: '8px' }}>Suggested Bullet Improvements</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {(suggestions.bulletImprovements || []).map((b, i) => (
                <div key={i} style={{ background: 'var(--theme-input-bg)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ color: '#FF6584', fontSize: '12px', textDecoration: 'line-through', marginBottom: '4px' }}>{b.old}</div>
                  <div style={{ color: '#4CAF50', fontSize: '14px' }}>✨ {b.new}</div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setSuggestions(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={() => { onApplyOptimization(suggestions); onClose(); }} style={{ flex: 2, padding: '12px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Apply Suggestions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
