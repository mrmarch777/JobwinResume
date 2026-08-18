import React from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px', background: 'var(--theme-input-bg)',
  border: '1px solid var(--theme-border)', borderRadius: '10px',
  color: 'var(--theme-text)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
};
const labelStyle = {
  display: 'block', color: 'var(--theme-muted)', fontSize: '12px',
  fontWeight: '500', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase', letterSpacing: '0.5px',
};
const cardStyle = {
  background: 'var(--theme-card)', border: '1px solid var(--theme-border)',
  borderRadius: '16px', padding: '20px', marginBottom: '12px', boxSizing: 'border-box',
  display: 'flex', gap: '12px'
};
const rowStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'
};
const btnStyle = {
  background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
  padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', width: '100%',
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
};

export default function Certifications({ data = [], onChange }) {
  const updateEntry = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, { id: `cert-${Date.now()}`, name: '', issuer: '', year: '' }]);
  };

  const deleteEntry = (index) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  return (
    <div>
      {data.map((entry, i) => (
        <div key={entry.id || i} style={cardStyle}>
          <div style={{ color: 'rgba(255,255,255,0.2)', cursor: 'grab', paddingTop: '10px' }}>⠿</div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Certification Name</label>
              <input type="text" value={entry.name} onChange={(e) => updateEntry(i, 'name', e.target.value)} style={inputStyle} placeholder="AWS Certified Solutions Architect" />
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Issuing Organization</label>
                <input type="text" value={entry.issuer} onChange={(e) => updateEntry(i, 'issuer', e.target.value)} style={inputStyle} placeholder="Amazon Web Services" />
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <input type="text" value={entry.year} onChange={(e) => updateEntry(i, 'year', e.target.value)} style={inputStyle} placeholder="2023" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button onClick={() => deleteEntry(i)} style={{ background: 'rgba(255, 101, 132, 0.1)', color: '#FF6584', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addEntry} style={btnStyle}>
        + Add Certification
      </button>
    </div>
  );
}
