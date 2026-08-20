import React, { useRef, useState, useEffect } from 'react';

const STYLES = {
  label: { display: 'block', color: '#9CA3AF', fontSize: '13px', fontWeight: '400', marginBottom: '8px', fontFamily: "'Inter', sans-serif" },
  input: { width: '100%', padding: '12px 16px', background: '#F3F4F6', border: '2px solid transparent', borderRadius: '4px', color: '#111827', fontSize: '15px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
  field: { marginBottom: '24px' },
};

export default function PersonalInfo({ data = {}, onChange }) {
  const fileInputRef = useRef(null);
  
  // Parse name into first/last for the UI
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (data.name) {
      const parts = data.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [data.name]);

  const handleNameChange = (first, last) => {
    setFirstName(first);
    setLastName(last);
    onChange({ ...data, name: `${first} ${last}`.trim() });
  };

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
      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>Job Target</label>
          <input type="text" name="title" value={data.title || ''} onChange={handleChange} style={STYLES.input} 
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '4px', background: '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            {data.photo ? (
              <img src={data.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </div>
          <button onClick={() => fileInputRef.current.click()} style={{
            background: 'none', border: 'none', color: '#2563EB', fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: 0
          }}>
            Upload photo
          </button>
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
        </div>
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>First Name</label>
          <input type="text" value={firstName} onChange={e => handleNameChange(e.target.value, lastName)} style={STYLES.input}
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div>
          <label style={STYLES.label}>Last Name</label>
          <input type="text" value={lastName} onChange={e => handleNameChange(firstName, e.target.value)} style={STYLES.input}
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>Email</label>
          <input type="email" name="email" value={data.email || ''} onChange={handleChange} style={STYLES.input}
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div>
          <label style={STYLES.label}>Phone</label>
          <input type="tel" name="phone" value={data.phone || ''} onChange={handleChange} style={STYLES.input}
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>LinkedIn URL</label>
          <input type="url" name="linkedin" value={data.linkedin || ''} onChange={handleChange} style={STYLES.input}
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div>
          <label style={STYLES.label}>Postal Code</label>
          <input type="text" name="postalCode" value={data.postalCode || ''} onChange={handleChange} style={STYLES.input}
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>City, State</label>
          <input type="text" name="location" value={data.location || ''} onChange={handleChange} style={STYLES.input}
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div>
          <label style={STYLES.label}>Country</label>
          <input type="text" name="country" value={data.country || ''} onChange={handleChange} style={STYLES.input}
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>
    </div>
  );
}
