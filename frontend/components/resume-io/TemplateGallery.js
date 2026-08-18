import React, { useState } from 'react';
import { useTheme } from '../../lib/contexts';

const templates = [
  { id: 'classic', name: 'Classic', category: 'Professional', desc: 'A traditional layout with clean structure.', accent: '#1a365d' },
  { id: 'modern', name: 'Modern', category: 'Modern', desc: 'A sleek sidebar layout for a modern look.', accent: '#319795' },
  { id: 'creative', name: 'Creative', category: 'Creative', desc: 'Bold headers and unique typography.', accent: '#805ad5' },
  { id: 'minimal', name: 'Minimal', category: 'Professional', desc: 'Ultra-clean focus on content.', accent: '#171923' },
  { id: 'executive', name: 'Executive', category: 'Professional', desc: 'Two-column elegant header.', accent: '#d69e2e' },
  { id: 'ats', name: 'ATS Optimized', category: 'Standard', desc: 'Simple single column for software parsing.', accent: '#2b6cb0' },
];

export default function TemplateGallery({ onSelect }) {
  const { theme } = useTheme();
  const [hoveredId, setHoveredId] = useState(null);

  const containerStyle = {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    color: theme.text,
    fontFamily: "'DM Sans', sans-serif"
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  };

  const getCardStyle = (id) => {
    const isHovered = hoveredId === id;
    return {
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'none',
      boxShadow: isHovered ? `0 10px 20px rgba(108, 99, 255, 0.15)` : 'none',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    };
  };

  const previewBlockStyle = (accent) => ({
    height: '240px',
    background: '#ffffff',
    borderRadius: '8px',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    gap: '8px'
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: '36px', marginBottom: '12px' }}>Choose a Template</h1>
        <p style={{ color: theme.muted, fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>Select from our professionally designed templates to get started building your resume.</p>
      </div>

      <div style={gridStyle}>
        {templates.map(template => (
          <div 
            key={template.id} 
            style={getCardStyle(template.id)}
            onMouseEnter={() => setHoveredId(template.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(template.id)}
          >
            <div style={previewBlockStyle(template.accent)}>
              {/* Fake Resume Preview */}
              <div style={{ height: '30px', background: template.accent, width: '100%', borderRadius: '4px', opacity: 0.8 }} />
              <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                {template.id === 'modern' && <div style={{ width: '30%', background: `${template.accent}20`, borderRadius: '4px' }} />}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '12px', background: '#e2e8f0', width: '80%', borderRadius: '2px' }} />
                  <div style={{ height: '12px', background: '#e2e8f0', width: '100%', borderRadius: '2px' }} />
                  <div style={{ height: '12px', background: '#e2e8f0', width: '90%', borderRadius: '2px' }} />
                  <div style={{ height: '24px', background: '#cbd5e1', width: '40%', borderRadius: '2px', marginTop: 'auto' }} />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>{template.name}</h3>
              <span style={{ fontSize: '12px', padding: '4px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', color: theme.muted }}>{template.category}</span>
            </div>
            <p style={{ color: theme.muted, fontSize: '14px', margin: 0, flex: 1 }}>{template.desc}</p>
            
            <div style={{
              marginTop: '16px',
              padding: '10px',
              background: theme.accent,
              color: '#fff',
              textAlign: 'center',
              borderRadius: '8px',
              fontWeight: '600',
              opacity: hoveredId === template.id ? 1 : 0,
              transition: 'opacity 0.2s ease'
            }}>
              Use This Template
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
