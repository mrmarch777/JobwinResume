import React from 'react';

const PRESET_STRENGTHS = [
  'Leadership', 'Team Management', 'Problem Solving', 'Communication',
  'Critical Thinking', 'Project Management', 'Strategic Planning', 'Adaptability',
  'Time Management', 'Decision Making', 'Conflict Resolution', 'Negotiation',
  'Mentoring', 'Innovation', 'Analytical Skills', 'Attention to Detail',
  'Client Relations', 'Cross-functional Collaboration', 'Process Improvement',
  'Stakeholder Management', 'Risk Management', 'Quality Assurance',
];

const STYLES = {
  input: { width: '100%', padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827', fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' },
};

export default function Strengths({ data = [], onChange }) {
  const addStrength = (text) => {
    if (data.some(s => s.text === text)) return;
    onChange([...data, { id: `str-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text }]);
  };

  const removeStrength = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleCustom = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      addStrength(e.target.value.trim());
      e.target.value = '';
    }
  };

  return (
    <div>
      {/* Added strengths */}
      {data.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {data.map((s, i) => (
            <div key={s.id || i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '20px',
              padding: '6px 14px', fontSize: '13px', color: '#1D4ED8', fontWeight: '500', fontFamily: "'Inter', sans-serif"
            }}>
              {s.text}
              <button onClick={() => removeStrength(i)} style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Custom input */}
      <div style={{ marginBottom: '16px' }}>
        <input type="text" onKeyDown={handleCustom} style={STYLES.input} placeholder="Type a strength and press Enter..." />
      </div>

      {/* Preset chips */}
      <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Suggested Strengths
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {PRESET_STRENGTHS.map(text => {
          const added = data.some(s => s.text === text);
          return (
            <button key={text} onClick={() => !added && addStrength(text)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                background: added ? '#DBEAFE' : 'transparent',
                border: `1px solid ${added ? '#93C5FD' : '#D1D5DB'}`,
                color: added ? '#2563EB' : '#6B7280',
                cursor: added ? 'default' : 'pointer',
                fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                opacity: added ? 0.6 : 1
              }}
            >
              {added ? '✓ ' : '+ '}{text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
