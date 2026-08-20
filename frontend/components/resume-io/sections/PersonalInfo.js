import React, { useRef, useState } from 'react';

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

export default function PersonalInfo({ data = {}, onChange }) {
  const fileInputRef = useRef(null);
  const [showMore, setShowMore] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={STYLES.row}>
            <div>
              <label style={STYLES.label}>Full Name</label>
              <input type="text" name="name" value={data.name || ''} onChange={handleChange} style={STYLES.input} />
            </div>
            <div>
              <label style={STYLES.label}>Job Title</label>
              <input type="text" name="title" value={data.title || ''} onChange={handleChange} style={STYLES.input} />
            </div>
          </div>
        </div>
        <div 
          onClick={() => fileInputRef.current.click()}
          style={{
            width: '80px', height: '80px', borderRadius: '4px', background: '#F9FAFB',
            border: '1px dashed #E5E7EB', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
            marginTop: '22px'
          }}
        >
          {data.photo ? (
            <img src={data.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '24px', color: '#9CA3AF' }}>👤</span>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>Email</label>
          <input type="email" name="email" value={data.email || ''} onChange={handleChange} style={STYLES.input} />
        </div>
        <div>
          <label style={STYLES.label}>Phone</label>
          <input type="tel" name="phone" value={data.phone || ''} onChange={handleChange} style={STYLES.input} />
        </div>
      </div>

      <div style={STYLES.field}>
        <label style={STYLES.label}>City / State</label>
        <input type="text" name="location" value={data.location || ''} onChange={handleChange} style={STYLES.input} />
      </div>

      {!showMore ? (
        <button onClick={() => setShowMore(true)} style={STYLES.addButton}>
          Add more details ▼
        </button>
      ) : (
        <div style={STYLES.row}>
          <div>
            <label style={STYLES.label}>LinkedIn URL</label>
            <input type="url" name="linkedin" value={data.linkedin || ''} onChange={handleChange} style={STYLES.input} />
          </div>
          <div>
            <label style={STYLES.label}>Portfolio / Website</label>
            <input type="url" name="website" value={data.website || ''} onChange={handleChange} style={STYLES.input} />
          </div>
        </div>
      )}
    </div>
  );
}
