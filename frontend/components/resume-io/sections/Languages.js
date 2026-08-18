import React from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  color: '#E8E6F0', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
};
const selectStyle = {
  ...inputStyle,
  appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23E8E6F0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '10px auto'
};
const btnStyle = {
  background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
  padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', width: '100%',
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
};

const levels = ["Native", "Fluent", "Advanced", "Intermediate", "Beginner"];

export default function Languages({ data = [], onChange }) {
  const updateEntry = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, { name: '', level: 'Intermediate' }]);
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
            <div style={{ flex: 1 }}>
              <input type="text" value={entry.name} onChange={(e) => updateEntry(i, 'name', e.target.value)} style={inputStyle} placeholder="Language (e.g. English, Spanish)" />
            </div>
            <div style={{ flex: 1 }}>
              <select value={entry.level} onChange={(e) => updateEntry(i, 'level', e.target.value)} style={selectStyle}>
                {levels.map(lvl => <option key={lvl} value={lvl} style={{background: '#09090f'}}>{lvl}</option>)}
              </select>
            </div>
            <button onClick={() => deleteEntry(i)} style={{ background: 'rgba(255, 101, 132, 0.1)', color: '#FF6584', border: 'none', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button onClick={addEntry} style={btnStyle}>
        + Add Language
      </button>
    </div>
  );
}
