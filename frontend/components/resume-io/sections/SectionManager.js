import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Plus, Upload, GripVertical } from 'lucide-react';
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
  personal: { component: PersonalInfo, icon: '👤', title: 'Personal Information', required: true, helperText: 'Add your contact information.' },
  summary: { component: Summary, icon: '📝', title: 'Professional Summary', required: true, helperText: 'Write 2-4 short, energetic sentences. Mention your role and what you did.' },
  experience: { component: Experience, icon: '💼', title: 'Employment History', required: false, helperText: 'Show your relevant experience (last 10 years).' },
  education: { component: Education, icon: '🎓', title: 'Education', required: false, helperText: 'A varied education shows the value that your learnings will bring to job.' },
  skills: { component: Skills, icon: '⚡', title: 'Skills', required: false, helperText: 'List your technical and soft skills.' },
  projects: { component: Projects, icon: '🚀', title: 'Projects', required: false, helperText: 'Highlight your notable projects.' },
  certifications: { component: Certifications, icon: '📜', title: 'Certifications', required: false, helperText: 'List your certifications.' },
  languages: { component: Languages, icon: '🌐', title: 'Languages', required: false, helperText: 'List languages you speak.' },
  achievements: { component: Achievements, icon: '🏆', title: 'Achievements', required: false, helperText: 'List your achievements and awards.' },
};

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

export default function SectionManager({ resume, updateSection, updateSettings, addSection, removeSection, reorderSections, onUploadResume }) {
  const [expandedSection, setExpandedSection] = useState('personal');

  // Calculate completeness
  let completedFields = 0;
  let totalFields = 6;
  if (resume.personal?.name) completedFields++;
  if (resume.personal?.title) completedFields++;
  if (resume.personal?.email) completedFields++;
  if (resume.summary?.length > 20) completedFields++;
  if (resume.experience?.some(e => e.title)) completedFields++;
  if (resume.education?.length > 0) completedFields++;
  
  const completeness = Math.round((completedFields / totalFields) * 100);

  const availableSections = Object.keys(sectionComponents).filter(
    key => !resume.enabledSections.includes(key)
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '40px' }}>
      {/* Import Resume Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={onUploadResume} style={{ ...STYLES.addButton, background: '#F3F4F6', padding: '8px 16px', borderRadius: '8px', color: '#374151' }}>
          <Upload size={16} /> 📄 Import Resume
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Resume Completeness</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#16A34A' }}>{completeness}%</span>
        </div>
        <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#16A34A', width: `${completeness}%`, transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {resume.sectionOrder.map((sectionKey) => {
          if (!resume.enabledSections.includes(sectionKey)) return null;
          
          const sectionConfig = sectionComponents[sectionKey];
          if (!sectionConfig) return null;
          
          const Component = sectionConfig.component;
          const isExpanded = expandedSection === sectionKey;
          
          return (
            <div key={sectionKey} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
              <div 
                style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#FFFFFF' }}
                onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{sectionConfig.icon}</span>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{sectionConfig.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!sectionConfig.required && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(sectionKey); }}
                      style={STYLES.removeButton}
                    >
                      <X size={20} />
                    </button>
                  )}
                  <div style={{ color: '#9CA3AF' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '0 20px 20px 20px' }}>
                  {sectionConfig.helperText && (
                    <div style={STYLES.sectionSubtext}>{sectionConfig.helperText}</div>
                  )}
                  <Component 
                    data={resume[sectionKey]} 
                    onChange={(data) => updateSection(sectionKey, data)}
                    resumeContext={resume}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Section Grid */}
      {availableSections.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Add Section</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {availableSections.map(key => (
              <div 
                key={key} 
                onClick={() => { addSection(key); setExpandedSection(key); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                  background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
                  cursor: 'pointer', transition: 'border-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              >
                <span style={{ fontSize: '24px' }}>{sectionComponents[key].icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{sectionComponents[key].title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
