import React from 'react';

const HOBBY_EMOJIS = [
  { emoji: '🏏', label: 'Cricket' }, { emoji: '⚽', label: 'Football' },
  { emoji: '🏊', label: 'Swimming' }, { emoji: '🏋️', label: 'Gym' },
  { emoji: '🧘', label: 'Yoga' }, { emoji: '🎵', label: 'Music' },
  { emoji: '📷', label: 'Photography' }, { emoji: '🎨', label: 'Painting' },
  { emoji: '📚', label: 'Reading' }, { emoji: '✈️', label: 'Traveling' },
  { emoji: '🎮', label: 'Gaming' }, { emoji: '🍳', label: 'Cooking' },
  { emoji: '♟️', label: 'Chess' }, { emoji: '🏔️', label: 'Trekking' },
  { emoji: '🚴', label: 'Cycling' }, { emoji: '🎯', label: 'Darts' },
  { emoji: '🎤', label: 'Singing' }, { emoji: '💃', label: 'Dancing' },
  { emoji: '🏸', label: 'Badminton' }, { emoji: '🎬', label: 'Movies' },
  { emoji: '✍️', label: 'Writing' }, { emoji: '🌱', label: 'Gardening' },
  { emoji: '🧩', label: 'Puzzles' }, { emoji: '🎸', label: 'Guitar' },
  { emoji: '🏃', label: 'Running' }, { emoji: '🧶', label: 'Crafts' },
  { emoji: '🎳', label: 'Bowling' }, { emoji: '🎭', label: 'Theater' },
  { emoji: '🐕', label: 'Pet Care' }, { emoji: '🎣', label: 'Fishing' },
];

const STYLES = {
  input: { width: '100%', padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827', fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' },
  addButton: { display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '13px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontFamily: "'Inter', sans-serif" },
};

export default function Hobbies({ data = [], onChange }) {
  const addHobby = (emoji, label) => {
    if (data.some(h => h.name === label)) return;
    onChange([...data, { id: `hobby-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: label, emoji }]);
  };

  const removeHobby = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const addCustom = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      onChange([...data, { id: `hobby-${Date.now()}`, name: e.target.value.trim(), emoji: '⭐' }]);
      e.target.value = '';
    }
  };

  return (
    <div>
      {/* Added hobbies as pills */}
      {data.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {data.map((h, i) => (
            <div key={h.id || i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '20px',
              padding: '6px 12px', fontSize: '13px', color: '#1D4ED8', fontFamily: "'Inter', sans-serif"
            }}>
              <span>{h.emoji}</span>
              <span style={{ fontWeight: '500' }}>{h.name}</span>
              <button onClick={() => removeHobby(i)} style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 2px', lineHeight: 1 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Custom input */}
      <div style={{ marginBottom: '16px' }}>
        <input type="text" onKeyDown={addCustom} style={STYLES.input} placeholder="Type a hobby and press Enter..." />
      </div>

      {/* Preset grid */}
      <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Quick Add
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {HOBBY_EMOJIS.map(h => {
          const added = data.some(d => d.name === h.label);
          return (
            <button key={h.label} onClick={() => !added && addHobby(h.emoji, h.label)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                padding: '8px 4px', background: added ? '#EFF6FF' : '#F9FAFB',
                border: `1px solid ${added ? '#BFDBFE' : '#E5E7EB'}`, borderRadius: '8px',
                cursor: added ? 'default' : 'pointer', fontSize: '11px', color: added ? '#3B82F6' : '#6B7280',
                fontFamily: "'Inter', sans-serif", transition: 'all 0.15s', opacity: added ? 0.6 : 1
              }}
            >
              <span style={{ fontSize: '18px' }}>{h.emoji}</span>
              <span>{h.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
