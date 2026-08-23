import React, { useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

const STYLES = {
  label: { display: 'block', color: '#374151', fontSize: '12px', fontWeight: '600', marginBottom: '6px', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827', fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' },
  inputFocus: { borderColor: '#2563EB' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  field: { marginBottom: '16px' },
  addButton: { display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '13px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontFamily: "'Inter', sans-serif" },
  removeButton: { background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px', borderRadius: '4px' },
  helperText: { color: '#9CA3AF', fontSize: '12px', marginTop: '4px', fontFamily: "'Inter', sans-serif" },
  sectionSubtext: { color: '#6B7280', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5', fontFamily: "'Inter', sans-serif" },
};

const formatToMonthYear = (dateStr) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  if (!year || !month) return dateStr;
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const parseToYYYYMM = (str) => {
  if (!str) return '';
  const parts = str.split(' ');
  if (parts.length !== 2) return ''; 
  const months = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
  const m = months[parts[0]];
  if (!m) return '';
  return `${parts[1]}-${m}`;
};

export default function Experience({ data = [], onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const updateEntry = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, { id: `exp-${Date.now()}`, title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }]);
    setExpandedIndex(data.length);
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
    if (!newData[entryIndex].bullets) newData[entryIndex].bullets = [];
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
      {data.map((entry, i) => {
        const isExpanded = expandedIndex === i;
        return (
          <div key={entry.id || i} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '16px', background: '#FFFFFF' }}>
            <div 
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              style={{ padding: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ color: '#9CA3AF', cursor: 'grab', marginRight: '12px' }} onClick={e => e.stopPropagation()}>
                <GripVertical size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
                  {entry.title || '(Not specified)'} {entry.company && `at ${entry.company}`}
                </div>
                <div style={{ color: '#6B7280', fontSize: '13px', marginTop: '2px' }}>
                  {entry.startDate} {entry.startDate && entry.endDate ? '-' : ''} {entry.current ? 'Present' : entry.endDate}
                </div>
              </div>
              <div style={{ color: '#9CA3AF' }}>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {isExpanded && (
              <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                <div style={STYLES.row}>
                  <div>
                    <label style={STYLES.label}>Job Title</label>
                    <input type="text" value={entry.title || ''} onChange={(e) => updateEntry(i, 'title', e.target.value)} style={STYLES.input} placeholder="e.g. Software Engineer" />
                  </div>
                  <div>
                    <label style={STYLES.label}>Company</label>
                    <input type="text" value={entry.company || ''} onChange={(e) => updateEntry(i, 'company', e.target.value)} style={STYLES.input} placeholder="e.g. Google" />
                  </div>
                </div>

                <div style={STYLES.row}>
                  <div>
                    <label style={STYLES.label}>Start Date</label>
                    <input 
                      type="text" placeholder="e.g. 05/2021 or May 2021" 
                      value={parseToYYYYMM(entry.startDate)} 
                      onChange={(e) => updateEntry(i, 'startDate', formatToMonthYear(e.target.value))} 
                      style={STYLES.input} 
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ ...STYLES.label, marginBottom: 0 }}>End Date</label>
                      <label style={{ fontSize: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={entry.current || false} onChange={(e) => updateEntry(i, 'current', e.target.checked)} />
                        Present
                      </label>
                    </div>
                    <input 
                      type="text" placeholder="e.g. 05/2021 or May 2021" 
                      value={parseToYYYYMM(entry.endDate)} 
                      onChange={(e) => updateEntry(i, 'endDate', formatToMonthYear(e.target.value))} 
                      style={STYLES.input} 
                      disabled={entry.current} 
                    />
                  </div>
                </div>

                <div style={STYLES.field}>
                  <label style={STYLES.label}>Location</label>
                  <input type="text" value={entry.location || ''} onChange={(e) => updateEntry(i, 'location', e.target.value)} style={STYLES.input} placeholder="e.g. San Francisco, CA" />
                </div>

                <div>
                  <label style={STYLES.label}>Description</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(entry.bullets || []).map((bullet, bi) => (
                      <div key={bi} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#9CA3AF', marginTop: '10px' }}>•</span>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <textarea 
                            value={bullet} 
                            onChange={(e) => updateBullet(i, bi, e.target.value)} 
                            style={{ ...STYLES.input, minHeight: '60px', resize: 'vertical' }} 
                            placeholder="e.g. Achieved X by doing Y..." 
                          />
                          <button 
                            onClick={async () => {
                              const original = bullet;
                              if (!original) return;
                              updateBullet(i, bi, original + ' (Improving...)');
                              try {
                                const res = await fetch('/api/improve-section', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ section_type: 'experience_bullet', content: original })
                                });
                                const resData = await res.json();
                                if (resData.status === 'success') {
                                  updateBullet(i, bi, resData.improved);
                                } else {
                                  updateBullet(i, bi, original);
                                }
                              } catch (e) {
                                updateBullet(i, bi, original);
                              }
                            }}
                            style={{ position: 'absolute', right: '8px', top: '8px', background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            ✨ Improve
                          </button>
                        </div>
                        <button onClick={() => deleteBullet(i, bi)} style={{ ...STYLES.removeButton, marginTop: '10px' }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => addBullet(i)} style={STYLES.addButton}>
                      + Add bullet point
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button onClick={() => deleteEntry(i)} style={{ color: '#EF4444', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', padding: '8px' }}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={addEntry} style={STYLES.addButton}>
        + Add one more employment
      </button>
    </div>
  );
}
