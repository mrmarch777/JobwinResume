import React, { useRef, useState, useEffect, useCallback } from 'react';

const STYLES = {
  label: { display: 'block', color: '#9CA3AF', fontSize: '13px', fontWeight: '400', marginBottom: '8px', fontFamily: "'Inter', sans-serif" },
  input: { width: '100%', padding: '12px 16px', background: '#F3F4F6', border: '2px solid transparent', borderRadius: '4px', color: '#111827', fontSize: '15px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
  field: { marginBottom: '24px' },
};

// Simple crop modal using CSS transform + canvas export
function PhotoCropModal({ src, onSave, onClose }) {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [circle, setCircle] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const CROP_SIZE = 240;

  const handleMouseDown = (e) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    setOffsetX(dragStart.current.ox + (e.clientX - dragStart.current.x));
    setOffsetY(dragStart.current.oy + (e.clientY - dragStart.current.y));
  }, []);

  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    const OUT = 400;
    canvas.width = OUT;
    canvas.height = OUT;

    if (circle) {
      ctx.beginPath();
      ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const scaledW = naturalW * zoom;
    const scaledH = naturalH * zoom;
    const ratio = OUT / CROP_SIZE;

    ctx.drawImage(
      img,
      0, 0, naturalW, naturalH,
      (CROP_SIZE / 2 + offsetX - scaledW / 2) * ratio,
      (CROP_SIZE / 2 + offsetY - scaledH / 2) * ratio,
      scaledW * ratio,
      scaledH * ratio
    );

    onSave(canvas.toDataURL('image/jpeg', 0.92));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '340px', fontFamily: "'Inter', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '600', color: '#111827' }}>Crop Photo</h3>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280' }}>Drag to reposition. Scroll to zoom.</p>

        {/* Crop preview viewport */}
        <div
          style={{
            width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px`,
            borderRadius: circle ? '50%' : '8px',
            overflow: 'hidden', margin: '0 auto 16px',
            border: '2px solid #2563EB', cursor: 'grab', position: 'relative',
            background: '#000', flexShrink: 0,
          }}
          onMouseDown={handleMouseDown}
          onWheel={(e) => { e.preventDefault(); setZoom(z => Math.min(3, Math.max(0.5, z - e.deltaY * 0.001))); }}
        >
          <img
            ref={imgRef}
            src={src}
            alt="crop"
            draggable={false}
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
              maxWidth: 'none',
              width: `${CROP_SIZE}px`,
              objectFit: 'cover',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Zoom slider */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', color: '#6B7280', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Zoom</span><span>{Math.round(zoom * 100)}%</span>
          </label>
          <input type="range" min="50" max="300" value={zoom * 100}
            onChange={e => setZoom(Number(e.target.value) / 100)}
            style={{ width: '100%', accentColor: '#2563EB' }}
          />
        </div>

        {/* Circle toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', marginBottom: '20px', cursor: 'pointer' }}>
          <input type="checkbox" checked={circle} onChange={e => setCircle(e.target.checked)} />
          Round crop (circle)
        </label>

        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: '#2563EB', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#fff', fontSize: '14px' }}>Save Photo</button>
        </div>
      </div>
    </div>
  );
}

export default function PersonalInfo({ data = {}, onChange }) {
  const fileInputRef = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);

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
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCropSrc(reader.result); // open crop modal
    reader.readAsDataURL(file);
    e.target.value = ''; // reset so same file can be re-uploaded
  };

  const handleCropSave = (croppedDataUrl) => {
    onChange({ ...data, photo: croppedDataUrl });
    setCropSrc(null);
  };

  return (
    <div>
      {cropSrc && <PhotoCropModal src={cropSrc} onSave={handleCropSave} onClose={() => setCropSrc(null)} />}

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>Job Target</label>
          <input type="text" name="title" value={data.title || ''} onChange={handleChange} style={STYLES.input} placeholder="e.g. Senior Analyst"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '4px', background: '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button onClick={() => fileInputRef.current.click()} style={{
              background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', fontWeight: '500', cursor: 'pointer', padding: 0, textAlign: 'left'
            }}>
              {data.photo ? 'Change photo' : 'Upload photo'}
            </button>
            {data.photo && (
              <button onClick={() => onChange({ ...data, photo: null })} style={{
                background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer', padding: 0, textAlign: 'left'
              }}>
                Remove
              </button>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
        </div>
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>First Name</label>
          <input type="text" value={firstName} onChange={e => handleNameChange(e.target.value, lastName)} style={STYLES.input} placeholder="e.g. John"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div>
          <label style={STYLES.label}>Last Name</label>
          <input type="text" value={lastName} onChange={e => handleNameChange(firstName, e.target.value)} style={STYLES.input} placeholder="e.g. Doe"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>Email</label>
          <input type="email" name="email" value={data.email || ''} onChange={handleChange} style={STYLES.input} placeholder="e.g. john@example.com"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div>
          <label style={STYLES.label}>Phone</label>
          <input type="tel" name="phone" value={data.phone || ''} onChange={handleChange} style={STYLES.input} placeholder="e.g. +1 234 567 8900"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>LinkedIn URL</label>
          <input type="url" name="linkedin" value={data.linkedin || ''} onChange={handleChange} style={STYLES.input} placeholder="linkedin.com/in/johndoe"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div>
          <label style={STYLES.label}>Postal Code</label>
          <input type="text" name="postalCode" value={data.postalCode || ''} onChange={handleChange} style={STYLES.input} placeholder="e.g. 10001"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>

      <div style={STYLES.row}>
        <div>
          <label style={STYLES.label}>City, State</label>
          <input type="text" name="location" value={data.location || ''} onChange={handleChange} style={STYLES.input} placeholder="e.g. New York, NY"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
        <div>
          <label style={STYLES.label}>Country</label>
          <input type="text" name="country" value={data.country || ''} onChange={handleChange} style={STYLES.input} placeholder="e.g. United States"
            onFocus={e => { e.target.style.background = '#FFFFFF'; e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; }}
          />
        </div>
      </div>
    </div>
  );
}
