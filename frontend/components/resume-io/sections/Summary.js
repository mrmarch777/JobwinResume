import React from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  color: '#E8E6F0', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
  resize: 'vertical'
};

const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
  fontWeight: '500', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const buttonStyle = {
  background: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', border: '1px solid rgba(108, 99, 255, 0.2)',
  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
};

export default function Summary({ data = "", onChange }) {
  const maxLength = 500;
  const currentLength = (data || "").length;

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleAiSuggest = () => {
    alert("AI suggestions coming soon!");
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Professional Summary</label>
        <button onClick={handleAiSuggest} style={buttonStyle}>
          ✨ AI Suggest
        </button>
      </div>
      
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
          fontSize: '12px', color: currentLength >= maxLength ? '#FF6584' : 'rgba(255,255,255,0.4)',
          pointerEvents: 'none'
        }}>
          {currentLength} / {maxLength}
        </div>
      </div>
    </div>
  );
}
