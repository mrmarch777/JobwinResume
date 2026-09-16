import React from 'react';

const STYLES = {
  label: { display: 'block', color: '#374151', fontSize: '12px', fontWeight: '600', marginBottom: '6px', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827', fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  helperText: { color: '#9CA3AF', fontSize: '12px', marginTop: '4px', fontFamily: "'Inter', sans-serif" },
};

const DEFAULT_TEXT = 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.';

export default function Declaration({ data = {}, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#92400E', fontFamily: "'Inter', sans-serif" }}>
        💡 Required for government & academic applications in India
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={STYLES.label}>Declaration Text</label>
        <textarea
          value={data.text || DEFAULT_TEXT}
          onChange={(e) => updateField('text', e.target.value)}
          style={{ ...STYLES.input, minHeight: '80px', resize: 'vertical', lineHeight: '1.5' }}
          placeholder="I hereby declare that..."
        />
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>Place</label>
          <input
            type="text"
            value={data.place || ''}
            onChange={(e) => updateField('place', e.target.value)}
            style={STYLES.input}
            placeholder="e.g. Mumbai"
          />
        </div>
        <div>
          <label style={STYLES.label}>Date</label>
          <input
            type="text"
            value={data.date || ''}
            onChange={(e) => updateField('date', e.target.value)}
            style={STYLES.input}
            placeholder="e.g. 15 September 2026"
          />
        </div>
      </div>
    </div>
  );
}
