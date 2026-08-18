import React, { useRef } from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  color: '#E8E6F0', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
};
const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
  fontWeight: '500', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase', letterSpacing: '0.5px',
};
const rowStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'
};
const fieldStyle = {
  marginBottom: '16px'
};

export default function PersonalInfo({ data = {}, onChange }) {
  const fileInputRef = useRef(null);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
        <div 
          onClick={() => fileInputRef.current.click()}
          style={{
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
            border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0
          }}
        >
          {data.photo ? (
            <img src={data.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '24px', opacity: 0.5 }}>📷</span>
          )}
        </div>
        <div style={{ flex: 1, fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
          Click to upload a profile photo (optional).
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
        </div>
      </div>

      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input type="text" name="name" value={data.name || ''} onChange={handleChange} style={inputStyle} placeholder="Jane Doe" required />
        </div>
        <div>
          <label style={labelStyle}>Job Title</label>
          <input type="text" name="title" value={data.title || ''} onChange={handleChange} style={inputStyle} placeholder="Software Engineer" />
        </div>
      </div>

      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" name="email" value={data.email || ''} onChange={handleChange} style={inputStyle} placeholder="jane@example.com" />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input type="tel" name="phone" value={data.phone || ''} onChange={handleChange} style={inputStyle} placeholder="+1 (555) 123-4567" />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Location</label>
        <input type="text" name="location" value={data.location || ''} onChange={handleChange} style={inputStyle} placeholder="New York, NY" />
      </div>

      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>LinkedIn URL</label>
          <input type="url" name="linkedin" value={data.linkedin || ''} onChange={handleChange} style={inputStyle} placeholder="https://linkedin.com/in/jane" />
        </div>
        <div>
          <label style={labelStyle}>Portfolio / Website</label>
          <input type="url" name="website" value={data.website || ''} onChange={handleChange} style={inputStyle} placeholder="https://janedoe.com" />
        </div>
      </div>
    </div>
  );
}
