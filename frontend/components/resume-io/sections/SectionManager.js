import React, { useState } from 'react';
import PersonalInfo from './PersonalInfo';
import Summary from './Summary';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import Projects from './Projects';
import Certifications from './Certifications';
import Languages from './Languages';
import Achievements from './Achievements';

const sectionComponents = {
  personal: { component: PersonalInfo, icon: '👤', title: 'Personal Information', required: true },
  summary: { component: Summary, icon: '📝', title: 'Professional Summary', required: true },
  experience: { component: Experience, icon: '💼', title: 'Work Experience', required: false },
  education: { component: Education, icon: '🎓', title: 'Education', required: false },
  skills: { component: Skills, icon: '⚡', title: 'Skills', required: false },
  projects: { component: Projects, icon: '🚀', title: 'Projects', required: false },
  certifications: { component: Certifications, icon: '📜', title: 'Certifications', required: false },
  languages: { component: Languages, icon: '🌐', title: 'Languages', required: false },
  achievements: { component: Achievements, icon: '🏆', title: 'Achievements', required: false },
};

const cardStyle = {
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px', marginBottom: '16px', overflow: 'hidden'
};

const headerStyle = {
  padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  cursor: 'pointer', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.06)'
};

const titleStyle = {
  display: 'flex', alignItems: 'center', gap: '12px', color: '#E8E6F0',
  fontSize: '16px', fontWeight: '600', fontFamily: "'Noto Serif', serif"
};

const contentStyle = {
  padding: '20px'
};

const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
  fontWeight: '500', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const selectStyle = {
  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  color: '#E8E6F0', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
  appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23E8E6F0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '10px auto'
};

export default function SectionManager({ resume, updateSection, updateSettings, addSection, removeSection, reorderSections }) {
  const [expandedSection, setExpandedSection] = useState('personal');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const availableSections = Object.keys(sectionComponents).filter(
    key => !resume.enabledSections.includes(key)
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        {resume.sectionOrder.map((sectionKey, index) => {
          if (!resume.enabledSections.includes(sectionKey)) return null;
          
          const sectionConfig = sectionComponents[sectionKey];
          if (!sectionConfig) return null;
          
          const Component = sectionConfig.component;
          const isExpanded = expandedSection === sectionKey;
          
          return (
            <div key={sectionKey} style={cardStyle}>
              <div style={headerStyle} onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}>
                <div style={titleStyle}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', cursor: 'grab', marginRight: '8px' }} onClick={(e) => e.stopPropagation()}>⠿</span>
                  <span>{sectionConfig.icon}</span>
                  <span>{sectionConfig.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {!sectionConfig.required && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(sectionKey); }}
                      style={{ background: 'none', border: 'none', color: '#FF6584', cursor: 'pointer', fontSize: '18px' }}
                      title="Remove section"
                    >
                      ✕
                    </button>
                  )}
                  <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', color: 'rgba(255,255,255,0.5)' }}>
                    ▼
                  </span>
                </div>
              </div>
              
              {isExpanded && (
                <div style={contentStyle}>
                  <Component 
                    data={resume[sectionKey]} 
                    onChange={(data) => updateSection(sectionKey, data)} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {availableSections.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            style={{
              width: '100%', padding: '16px', background: 'rgba(108, 99, 255, 0.1)',
              color: '#6C63FF', border: '1px dashed rgba(108, 99, 255, 0.3)',
              borderRadius: '16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
            }}
          >
            + Add Section
          </button>
          
          {showAddMenu && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
              background: '#09090f', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '8px', zIndex: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {availableSections.map(key => (
                <div 
                  key={key} 
                  onClick={() => { addSection(key); setShowAddMenu(false); setExpandedSection(key); }}
                  style={{
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', borderRadius: '8px', color: '#E8E6F0', fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>{sectionComponents[key].icon}</span>
                  <span>{sectionComponents[key].title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ ...cardStyle, padding: '24px' }}>
        <h3 style={{ ...titleStyle, marginBottom: '20px', fontSize: '18px' }}>⚙️ Document Settings</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Accent Color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={resume.accentColor || '#6C63FF'} 
                onChange={(e) => updateSettings({ accentColor: e.target.value })}
                style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
              />
              <input 
                type="text" 
                value={resume.accentColor || '#6C63FF'} 
                onChange={(e) => updateSettings({ accentColor: e.target.value })}
                style={{ ...selectStyle, flex: 1 }}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Font Family</label>
            <select 
              value={resume.fontFamily || 'DM Sans'} 
              onChange={(e) => updateSettings({ fontFamily: e.target.value })}
              style={selectStyle}
            >
              <option value="DM Sans" style={{background: '#09090f'}}>DM Sans</option>
              <option value="Inter" style={{background: '#09090f'}}>Inter</option>
              <option value="Noto Serif" style={{background: '#09090f'}}>Noto Serif</option>
              <option value="Georgia" style={{background: '#09090f'}}>Georgia</option>
              <option value="Roboto" style={{background: '#09090f'}}>Roboto</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>Font Size</label>
            <select 
              value={resume.fontSize || 'medium'} 
              onChange={(e) => updateSettings({ fontSize: e.target.value })}
              style={selectStyle}
            >
              <option value="small" style={{background: '#09090f'}}>Small</option>
              <option value="medium" style={{background: '#09090f'}}>Medium</option>
              <option value="large" style={{background: '#09090f'}}>Large</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Spacing</label>
            <select 
              value={resume.spacing || 'normal'} 
              onChange={(e) => updateSettings({ spacing: e.target.value })}
              style={selectStyle}
            >
              <option value="compact" style={{background: '#09090f'}}>Compact</option>
              <option value="normal" style={{background: '#09090f'}}>Normal</option>
              <option value="spacious" style={{background: '#09090f'}}>Spacious</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Template Style</label>
          <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '12px' }}>
            {['classic', 'modern', 'minimal', 'professional', 'creative', 'executive'].map(template => (
              <div 
                key={template}
                onClick={() => updateSettings({ templateId: template })}
                style={{
                  minWidth: '100px', height: '140px', borderRadius: '8px', cursor: 'pointer',
                  border: resume.templateId === template ? '2px solid #6C63FF' : '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: resume.templateId === template ? '#6C63FF' : 'rgba(255,255,255,0.5)',
                  textTransform: 'capitalize', fontSize: '14px', fontWeight: '500'
                }}
              >
                {template}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
