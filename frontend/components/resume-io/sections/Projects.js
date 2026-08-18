import React from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  color: '#E8E6F0', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
};
const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
  fontWeight: '500', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase', letterSpacing: '0.5px',
};
const cardStyle = {
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px', padding: '20px', marginBottom: '12px', boxSizing: 'border-box',
  display: 'flex', gap: '12px'
};
const btnStyle = {
  background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
  padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', width: '100%',
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
};

export default function Projects({ data = [], onChange }) {
  const updateEntry = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, { id: `proj-${Date.now()}`, name: '', description: '', technologies: '', url: '' }]);
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
              <label style={labelStyle}>Project Name</label>
              <input type="text" value={entry.name} onChange={(e) => updateEntry(i, 'name', e.target.value)} style={inputStyle} placeholder="E-commerce Platform" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Description</label>
              <textarea rows={3} value={entry.description} onChange={(e) => updateEntry(i, 'description', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Built a full-stack e-commerce app..." />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Technologies Used</label>
              <input type="text" value={entry.technologies} onChange={(e) => updateEntry(i, 'technologies', e.target.value)} style={inputStyle} placeholder="React, Node.js, MongoDB" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Project URL (Optional)</label>
              <input type="url" value={entry.url} onChange={(e) => updateEntry(i, 'url', e.target.value)} style={inputStyle} placeholder="https://github.com/..." />
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
        + Add Project
      </button>
    </div>
  );
}
