import React, { useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

const STYLES = {
  label: { display: 'block', color: '#374151', fontSize: '12px', fontWeight: '600', marginBottom: '6px', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827', fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' },
  inputFocus: { borderColor: '#2563EB' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  field: { marginBottom: '16px' },
  addButton: { display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '14px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontFamily: "'Inter', sans-serif" },
  removeButton: { background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px', borderRadius: '4px' },
  helperText: { color: '#9CA3AF', fontSize: '12px', marginTop: '4px', fontFamily: "'Inter', sans-serif" },
  sectionSubtext: { color: '#6B7280', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5', fontFamily: "'Inter', sans-serif" },
};

export default function Education({ data = [], onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const updateEntry = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, { id: `edu-${Date.now()}`, degree: '', institution: '', field: '', startDate: '', endDate: '', current: false, grade: '' }]);
    setExpandedIndex(data.length);
  };

  const deleteEntry = (index) => {
    const newData = data.filter((_, i) => i !== index);
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
                <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                  {entry.degree || '(Not specified)'} {entry.institution && `at ${entry.institution}`}
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
                    <label style={STYLES.label}>Degree</label>
                    <input type="text" value={entry.degree || ''} onChange={(e) => updateEntry(i, 'degree', e.target.value)} style={STYLES.input} />
                  </div>
                  <div>
                    <label style={STYLES.label}>Institution</label>
                    <input type="text" value={entry.institution || ''} onChange={(e) => updateEntry(i, 'institution', e.target.value)} style={STYLES.input} />
                  </div>
                </div>

                <div style={STYLES.row}>
                  <div>
                    <label style={STYLES.label}>Field of Study</label>
                    <input type="text" value={entry.field || ''} onChange={(e) => updateEntry(i, 'field', e.target.value)} style={STYLES.input} />
                  </div>
                  <div>
                    <label style={STYLES.label}>Grade</label>
                    <input type="text" value={entry.grade || ''} onChange={(e) => updateEntry(i, 'grade', e.target.value)} style={STYLES.input} />
                  </div>
                </div>

                <div style={STYLES.row}>
                  <div>
                    <label style={STYLES.label}>Start Date</label>
                    <input type="text" placeholder="MM/YYYY" value={entry.startDate || ''} onChange={(e) => updateEntry(i, 'startDate', e.target.value)} style={STYLES.input} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ ...STYLES.label, marginBottom: 0 }}>End Date</label>
                      <label style={{ fontSize: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={entry.current || false} onChange={(e) => updateEntry(i, 'current', e.target.checked)} />
                        Present
                      </label>
                    </div>
                    <input type="text" placeholder="MM/YYYY" value={entry.endDate || ''} onChange={(e) => updateEntry(i, 'endDate', e.target.value)} style={STYLES.input} disabled={entry.current} />
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
        + Add one more education
      </button>
    </div>
  );
}
