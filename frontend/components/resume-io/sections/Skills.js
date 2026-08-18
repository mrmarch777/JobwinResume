import React, { useState } from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px', background: 'var(--theme-input-bg)',
  border: '1px solid var(--theme-border)', borderRadius: '10px',
  color: 'var(--theme-text)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
};

const tagStyle = {
  background: 'var(--theme-input-bg)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px',
  color: 'var(--theme-text)', fontSize: '13px'
};

const dotStyle = (active) => ({
  width: '8px', height: '8px', borderRadius: '50%',
  background: active ? '#6C63FF' : 'rgba(255,255,255,0.1)',
  cursor: 'pointer', transition: 'background 0.2s'
});

export default function Skills({ data = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const addSkill = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onChange([...data, { name: inputValue.trim(), level: 3 }]);
      setInputValue('');
    }
  };

  const deleteSkill = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const setLevel = (index, level) => {
    const newData = [...data];
    newData[index].level = level;
    onChange(newData);
  };

  return (
    <div>
      <form onSubmit={addSkill} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          style={inputStyle} 
          placeholder="e.g. JavaScript, React, Node.js (Press Enter to add)" 
        />
        <button type="submit" style={{ background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 20px', cursor: 'pointer', fontWeight: '500' }}>
          Add
        </button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {data.map((skill, i) => (
          <div key={i} style={tagStyle}>
            <span>{skill.name}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div 
                  key={lvl} 
                  style={dotStyle(lvl <= skill.level)} 
                  onClick={() => setLevel(i, lvl)}
                />
              ))}
            </div>
            <button onClick={() => deleteSkill(i)} style={{ background: 'none', border: 'none', color: 'var(--theme-muted)', cursor: 'pointer', padding: 0, marginLeft: '4px' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
