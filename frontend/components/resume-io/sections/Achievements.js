import React from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px 12px 40px', background: 'var(--theme-input-bg)',
  border: '1px solid var(--theme-border)', borderRadius: '10px',
  color: 'var(--theme-text)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
};
const btnStyle = {
  background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
  padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', width: '100%',
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
};

export default function Achievements({ data = [], onChange }) {
  const updateEntry = (index, value) => {
    const newData = [...data];
    newData[index] = value;
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, '']);
  };

  const deleteEntry = (index) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {data.map((entry, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.2)', cursor: 'grab' }}>⠿</div>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '12px', fontSize: '14px' }}>🏆</span>
              <input type="text" value={entry} onChange={(e) => updateEntry(i, e.target.value)} style={inputStyle} placeholder="e.g. Employee of the Year 2023" />
            </div>
            <button onClick={() => deleteEntry(i)} style={{ background: 'rgba(255, 101, 132, 0.1)', color: '#FF6584', border: 'none', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button onClick={addEntry} style={btnStyle}>
        + Add Achievement
      </button>
    </div>
  );
}
