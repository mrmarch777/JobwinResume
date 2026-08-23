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

export default function Certifications({ data = [], onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const updateEntry = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, { id: `cert-${Date.now()}`, name: '', issuer: '', date: '' }]);
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
                <div style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
                  {entry.name || '(Not specified)'}
                </div>
                <div style={{ color: '#6B7280', fontSize: '13px', marginTop: '2px' }}>
                  {entry.issuer} {entry.date && `• ${entry.date}`}
                </div>
              </div>
              <div style={{ color: '#9CA3AF' }}>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {isExpanded && (
              <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                <div style={STYLES.field}>
                  <label style={STYLES.label}>Certification Name</label>
                  <input type="text" value={entry.name || ''} onChange={(e) => updateEntry(i, 'name', e.target.value)} style={STYLES.input} />
                </div>
                
                <div style={STYLES.row}>
                  <div>
                    <label style={STYLES.label}>Issuer / Organization</label>
                    <input type="text" value={entry.issuer || ''} onChange={(e) => updateEntry(i, 'issuer', e.target.value)} style={STYLES.input} />
                  </div>
                  <div>
                    <label style={STYLES.label}>Date Earned</label>
                    <input type="text" placeholder="MM/YYYY" value={entry.date || ''} onChange={(e) => updateEntry(i, 'date', e.target.value)} style={STYLES.input} />
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
        + Add one more certification
      </button>
    </div>
  );
}
