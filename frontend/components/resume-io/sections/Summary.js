import React from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px', background: 'var(--theme-input-bg)',
  border: '1px solid var(--theme-border)', borderRadius: '10px',
  color: 'var(--theme-text)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
  resize: 'vertical'
};

const labelStyle = {
  display: 'block', color: 'var(--theme-muted)', fontSize: '12px',
  fontWeight: '500', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const buttonStyle = {
  background: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', border: '1px solid rgba(108, 99, 255, 0.2)',
  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
};

export default function Summary({ data = "", onChange, resumeContext }) {
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiSuggestions, setAiSuggestions] = React.useState([]);
  const maxLength = 500;
  const currentLength = (data || "").length;

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const context = `Job Title: ${resumeContext?.personal?.title || 'Professional'}\nExperience: ${resumeContext?.experience?.map(e => e.title + ' at ' + e.company).join(', ') || 'Various roles'}\nSkills: ${resumeContext?.skills?.map(s => s.name).join(', ') || 'Various skills'}`;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/improve-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_type: 'summary', content: context, instruction: 'Write a compelling 2-3 sentence professional summary' }),
      });
      const result = await res.json();
      if (result.status === 'success' && result.improved) {
        setAiSuggestions([result.improved]);
      } else {
        // Fallback for demo
        setAiSuggestions(["Results-oriented professional with a proven track record of driving success.", "Experienced leader passionate about leveraging technology to solve complex problems."]);
      }
    } catch (err) {
      console.error('AI suggestion failed:', err);
      // Fallback for demo
      setAiSuggestions(["Results-oriented professional with a proven track record of driving success.", "Experienced leader passionate about leveraging technology to solve complex problems."]);
    }
    setAiLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Professional Summary</label>
        <button onClick={handleAiSuggest} style={buttonStyle} disabled={aiLoading}>
          {aiLoading ? '✨ Generating...' : '✨ AI Suggest'}
        </button>
      </div>
      
      {aiSuggestions.length > 0 && (
        <div style={{ background: 'rgba(108, 99, 255, 0.05)', border: '1px solid rgba(108, 99, 255, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#6C63FF', marginBottom: '8px', fontWeight: 'bold' }}>Suggestions:</div>
          {aiSuggestions.map((s, i) => (
            <div key={i} onClick={() => { onChange(s); setAiSuggestions([]); }} style={{ fontSize: '13px', color: 'var(--theme-text)', padding: '8px', background: 'var(--theme-input-bg)', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px' }}>
              {s}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <textarea 
          value={data || ""} 
          onChange={handleChange} 
          style={inputStyle} 
          rows={6}
          placeholder="Write 2-3 sentences about your professional background and career goals..."
          maxLength={maxLength}
        />
        <div style={{ 
          position: 'absolute', bottom: '12px', right: '12px', 
          fontSize: '12px', color: currentLength >= maxLength ? '#FF6584' : 'var(--theme-muted)',
          pointerEvents: 'none'
        }}>
          {currentLength} / {maxLength}
        </div>
      </div>
    </div>
  );
}
