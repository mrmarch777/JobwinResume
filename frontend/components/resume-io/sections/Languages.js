import React from 'react';
import { GripVertical } from 'lucide-react';

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

export default function Languages({ data = [], onChange }) {
  const updateEntry = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addEntry = () => {
    onChange([...data, { id: `lang-${Date.now()}`, name: '', proficiency: 'Native speaker' }]);
  };

  const deleteEntry = (index) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const proficiencies = ['Native speaker', 'Highly proficient', 'Very good command', 'Good working knowledge', 'Working knowledge', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'];

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {data.map((entry, i) => (
          <div key={entry.id || i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ color: '#9CA3AF', cursor: 'grab' }}>
              <GripVertical size={16} />
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input 
                type="text" 
                value={entry.name || ''} 
                onChange={(e) => updateEntry(i, 'name', e.target.value)} 
                style={STYLES.input} 
                placeholder="Language" 
              />
              <select 
                value={entry.proficiency || 'Native speaker'} 
                onChange={(e) => updateEntry(i, 'proficiency', e.target.value)} 
                style={{ ...STYLES.input, appearance: 'none', background: '#F9FAFB url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E") no-repeat right 10px center', backgroundSize: '16px' }}
              >
                {proficiencies.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={() => deleteEntry(i)} style={STYLES.removeButton}>✕</button>
          </div>
        ))}
      </div>

      <button onClick={addEntry} style={STYLES.addButton}>
        + Add one more language
      </button>
    </div>
  );
}
