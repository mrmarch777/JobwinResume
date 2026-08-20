import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Plus, Upload, GripVertical, Sparkles } from 'lucide-react';
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
  personal: { component: PersonalInfo, icon: '👤', title: 'Personal Details', required: true, helperText: 'Add your contact information.' },
  summary: { component: Summary, icon: '📝', title: 'Professional Summary', required: true, helperText: 'Write 2-4 short, energetic sentences. Mention your role and what you did.' },
  experience: { component: Experience, icon: '💼', title: 'Employment History', required: false, helperText: 'Show your relevant experience (last 10 years).' },
  education: { component: Education, icon: '🎓', title: 'Education', required: false, helperText: 'A varied education shows the value that your learnings will bring to job.' },
  skills: { component: Skills, icon: '⚡', title: 'Skills', required: false, helperText: 'List your technical and soft skills.' },
  projects: { component: Projects, icon: '🚀', title: 'Projects', required: false, helperText: 'Highlight your notable projects.' },
  certifications: { component: Certifications, icon: '📜', title: 'Certifications', required: false, helperText: 'List your certifications.' },
  languages: { component: Languages, icon: '🌐', title: 'Languages', required: false, helperText: 'List languages you speak.' },
  achievements: { component: Achievements, icon: '🏆', title: 'Achievements', required: false, helperText: 'List your achievements and awards.' },
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
    <div style={{ fontFamily: "'Inter', sans-serif", padding: '0 16px 60px 16px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Progress Bar (Resume.io style) */}
      <div style={{ padding: '24px 0', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#16A34A', color: 'white', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
            {completeness}%
          </div>
          <span style={{ fontSize: '15px', color: '#6B7280', fontWeight: '500' }}>Resume completeness</span>
        </div>
        <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#16A34A', width: `${completeness}%`, transition: 'width 0.3s ease' }}></div>
        </div>
        
        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#F5F3FF', color: '#6D28D9', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
            <Sparkles size={16} /> Try AI profile summary
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
            <Sparkles size={16} /> Create quick cover letter
          </button>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
        {resume.sectionOrder.map((sectionKey) => {
          if (!resume.enabledSections.includes(sectionKey)) return null;
          
          const sectionConfig = sectionComponents[sectionKey];
          if (!sectionConfig) return null;
          
          const Component = sectionConfig.component;
          const isExpanded = expandedSection === sectionKey;
          
          return (
            <div key={sectionKey} style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', overflow: 'hidden', paddingBottom: isExpanded ? '24px' : '0', marginBottom: '8px' }}>
              <div 
                style={{ padding: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#FFFFFF' }}
                onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{sectionConfig.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {!sectionConfig.required && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(sectionKey); }}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                    >
                      <X size={18} />
                    </button>
                  )}
                  <div style={{ color: '#2563EB' }}>
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '0 0 12px 0' }}>
                  {sectionConfig.helperText && (
                    <div style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>{sectionConfig.helperText}</div>
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
