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
  position: 'relative', display: 'flex', gap: '12px'
};
const rowStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'
};
const fieldStyle = {
  marginBottom: '16px'
};
const btnStyle = {
  background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
  padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', width: '100%',
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
};

export default function Experience({ data = [], onChange }) {
  const updateEntry = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, { id: `exp-${Date.now()}`, title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }]);
  };

  const deleteEntry = (index) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const updateBullet = (entryIndex, bulletIndex, value) => {
    const newData = [...data];
    newData[entryIndex].bullets[bulletIndex] = value;
    onChange(newData);
  };

  const addBullet = (entryIndex) => {
    const newData = [...data];
    newData[entryIndex].bullets.push('');
    onChange(newData);
  };

  const deleteBullet = (entryIndex, bulletIndex) => {
    const newData = [...data];
    newData[entryIndex].bullets = newData[entryIndex].bullets.filter((_, i) => i !== bulletIndex);
    onChange(newData);
  };

  return (
    <div>
      {data.map((entry, i) => (
        <div key={entry.id || i} style={cardStyle}>
          <div style={{ color: 'rgba(255,255,255,0.2)', cursor: 'grab', paddingTop: '10px' }}>⠿</div>
          <div style={{ flex: 1 }}>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Job Title</label>
                <input type="text" value={entry.title} onChange={(e) => updateEntry(i, 'title', e.target.value)} style={inputStyle} placeholder="Software Engineer" />
              </div>
              <div>
                <label style={labelStyle}>Company</label>
                <input type="text" value={entry.company} onChange={(e) => updateEntry(i, 'company', e.target.value)} style={inputStyle} placeholder="Google" />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Location</label>
              <input type="text" value={entry.location} onChange={(e) => updateEntry(i, 'location', e.target.value)} style={inputStyle} placeholder="Mountain View, CA" />
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="month" value={entry.startDate} onChange={(e) => updateEntry(i, 'startDate', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>End Date</label>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={entry.current} onChange={(e) => updateEntry(i, 'current', e.target.checked)} />
                    Present
                  </label>
                </div>
                <input type="month" value={entry.endDate} onChange={(e) => updateEntry(i, 'endDate', e.target.value)} style={inputStyle} disabled={entry.current} />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Description / Responsibilities</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(entry.bullets || []).map((bullet, bi) => (
                  <div key={bi} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--theme-muted)' }}>•</span>
                    <input type="text" value={bullet} onChange={(e) => updateBullet(i, bi, e.target.value)} style={{ ...inputStyle, padding: '8px 12px' }} placeholder="Achieved X by doing Y..." />
                    <button onClick={async () => {
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/improve-section`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ section_type: 'experience', content: bullet, instruction: 'Make this bullet point more professional and impactful' }),
                        });
                        const data = await res.json();
                        if (data.status === 'success' && data.improved) {
                          updateBullet(i, bi, data.improved);
                        } else {
                          updateBullet(i, bi, bullet + ' (Improved by AI)');
                        }
                      } catch (e) {
                        updateBullet(i, bi, bullet + ' (Improved)');
                      }
                    }} style={{ background: 'none', border: 'none', color: '#6C63FF', cursor: 'pointer', padding: '4px', fontSize: '12px', whiteSpace: 'nowrap' }} title="Improve with AI">✨</button>
                    <button onClick={() => deleteBullet(i, bi)} style={{ background: 'none', border: 'none', color: '#FF6584', cursor: 'pointer', padding: '4px' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => addBullet(i)} style={{ background: 'none', border: 'none', color: '#6C63FF', cursor: 'pointer', textAlign: 'left', fontSize: '12px', marginTop: '4px' }}>
                  + Add bullet
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => deleteEntry(i)} style={{ background: 'rgba(255, 101, 132, 0.1)', color: '#FF6584', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addEntry} style={btnStyle}>
        + Add Experience
      </button>
    </div>
  );
}
