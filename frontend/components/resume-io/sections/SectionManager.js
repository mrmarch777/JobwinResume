import React, { useState, useRef } from 'react';
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
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSectionName, setCustomSectionName] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Drag-and-drop handlers
  const handleDragStart = (e, sectionKey) => {
    dragItem.current = sectionKey;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnter = (e, sectionKey) => {
    dragOverItem.current = sectionKey;
    e.preventDefault();
  };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragItem.current || dragItem.current === dragOverItem.current) return;
    const newOrder = [...resume.sectionOrder];
    const fromIdx = newOrder.indexOf(dragItem.current);
    const toIdx = newOrder.indexOf(dragOverItem.current);
    if (fromIdx === -1 || toIdx === -1) return;
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragItem.current);
    reorderSections(newOrder);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Improved completeness calculation
  let completedFields = 0;
  const totalFields = 10;
  if (resume.personal?.name) completedFields++;
  if (resume.personal?.title) completedFields++;
  if (resume.personal?.email) completedFields++;
  if (resume.personal?.phone) completedFields++;
  if (resume.summary && resume.summary.split(/\s+/).filter(Boolean).length >= 20) completedFields++;
  if (resume.experience?.some(e => e.title && e.company)) completedFields++;
  if (resume.experience?.some(e => e.bullets?.some(b => b && b.length > 10))) completedFields++;
  if (resume.education?.some(e => e.institution)) completedFields++;
  const skillItems = Array.isArray(resume.skills?.items) ? resume.skills.items : [];
  if (skillItems.some(s => s.name)) completedFields++;
  if ((resume.certifications?.length || 0) > 0 || (resume.projects?.length || 0) > 0) completedFields++;
  
  const completeness = Math.round((completedFields / totalFields) * 100);

  const availableSections = Object.keys(sectionComponents).filter(
    key => !resume.enabledSections.includes(key)
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: '0 20px 60px 20px', maxWidth: '100%' }}>
      
      {/* Import Resume Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={onUploadResume} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6', color: '#374151', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
          <Upload size={16} /> Upload Resume (Auto-fill)
        </button>
      </div>

      {/* Progress Bar (Resume.io style) */}
      <div style={{ padding: '0 0 24px 0', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#16A34A', color: 'white', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
            {completeness}%
          </div>
          <div style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Resume completeness</div>
        </div>
        <div style={{ width: '100%', height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ width: `${completeness}%`, height: '100%', background: '#16A34A' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={async () => {
              const currentSummary = resume.summary || '';
              updateSection('summary', currentSummary + (currentSummary ? '\n' : '') + '(Generating summary...)');
              try {
                const res = await fetch('/api/improve-section', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ section_type: 'summary', content: currentSummary, instruction: 'Write a professional summary from scratch based on my details.' }),
                });
                const resData = await res.json();
                if (resData.status === 'success') {
                  updateSection('summary', resData.improved);
                  // Expand the summary section
                  setExpandedSection('summary');
                } else {
                  updateSection('summary', currentSummary);
                }
              } catch (e) {
                updateSection('summary', currentSummary);
              }
            }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#F5F3FF', color: '#7C3AED', border: '1px solid #EDE9FE', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            <Sparkles size={16} /> Try AI profile summary
          </button>
          <button 
            onClick={() => window.location.href = '/apply'}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            <Sparkles size={16} /> Create quick cover letter
          </button>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '32px' }}>
        {resume.sectionOrder.map((sectionKey) => {
          if (!resume.enabledSections.includes(sectionKey)) return null;

          const sectionConfig = sectionComponents[sectionKey];
          const customSection = (resume.customSections || []).find(c => c.key === sectionKey);
          if (!sectionConfig && !customSection) return null;

          const Component = sectionConfig?.component;
          const isExpanded = expandedSection === sectionKey;

          return (
            <div
              key={sectionKey}
              draggable
              onDragStart={(e) => handleDragStart(e, sectionKey)}
              onDragEnter={(e) => handleDragEnter(e, sectionKey)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ background: '#FFFFFF', borderBottom: '1px solid #F3F4F6', overflow: 'hidden', paddingBottom: isExpanded ? '20px' : '0' }}
            >
              <div
                style={{ padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#FFFFFF' }}
                onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Drag handle */}
                  <span
                    draggable
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Drag to reorder"
                    style={{ color: '#D1D5DB', cursor: 'grab', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical size={16} />
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{sectionConfig?.title || customSection?.title || sectionKey}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {(!sectionConfig?.required) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(sectionKey); }}
                      style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#6B7280'}
                      onMouseLeave={e => e.currentTarget.style.color = '#D1D5DB'}
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div style={{ color: '#9CA3AF' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '0 0 12px 0' }}>
                  {sectionConfig?.helperText && (
                    <div style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '24px' }}>{sectionConfig.helperText}</div>
                  )}
                  {sectionConfig ? (
                    <Component 
                      data={resume[sectionKey]} 
                      onChange={(data) => updateSection(sectionKey, data)}
                      resumeContext={resume}
                    />
                  ) : customSection ? (
                    <div>
                      {(resume[sectionKey] || []).map((item, idx) => (
                        <div key={item.id || idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <span style={{ color: '#9CA3AF', marginTop: '10px' }}>•</span>
                          <textarea 
                            value={item.text || ''} 
                            onChange={(e) => {
                              const newItems = [...(resume[sectionKey] || [])];
                              newItems[idx] = { ...newItems[idx], text: e.target.value };
                              updateSection(sectionKey, newItems);
                            }}
                            style={{ flex: 1, padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', minHeight: '40px', resize: 'vertical', outline: 'none' }}
                            placeholder="Enter details..."
                          />
                          <button 
                            onClick={() => {
                              const newItems = (resume[sectionKey] || []).filter((_, i) => i !== idx);
                              updateSection(sectionKey, newItems);
                            }}
                            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '10px' }}
                          >✕</button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newItems = [...(resume[sectionKey] || []), { id: 'item-' + Date.now(), text: '' }];
                          updateSection(sectionKey, newItems);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '13px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
                      >
                        + Add item
                      </button>
                    </div>
                  ) : null}
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
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{sectionComponents[key].title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Section */}
      <div style={{ marginTop: '24px' }}>
        {!showCustomInput ? (
          <button 
            onClick={() => setShowCustomInput(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontSize: '14px', fontWeight: '600', background: 'none', border: '1px dashed #2563EB', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
          >
            <Plus size={16} /> Add Custom Section
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="text" 
              value={customSectionName} 
              onChange={(e) => setCustomSectionName(e.target.value)}
              placeholder="e.g. Hobbies, Volunteer Work, Publications..."
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customSectionName.trim()) {
                  const key = 'custom_' + customSectionName.trim().toLowerCase().replace(/\s+/g, '_');
                  updateSection(key, [{ id: 'item-' + Date.now(), text: '' }]);
                  const newEnabled = [...resume.enabledSections, key];
                  const newOrder = [...resume.sectionOrder, key];
                  updateSettings({ enabledSections: newEnabled, sectionOrder: newOrder, customSections: [...(resume.customSections || []), { key, title: customSectionName.trim() }] });
                  setCustomSectionName('');
                  setShowCustomInput(false);
                  setExpandedSection(key);
                }
              }}
            />
            <button 
              onClick={() => {
                if (customSectionName.trim()) {
                  const key = 'custom_' + customSectionName.trim().toLowerCase().replace(/\s+/g, '_');
                  updateSection(key, [{ id: 'item-' + Date.now(), text: '' }]);
                  const newEnabled = [...resume.enabledSections, key];
                  const newOrder = [...resume.sectionOrder, key];
                  updateSettings({ enabledSections: newEnabled, sectionOrder: newOrder, customSections: [...(resume.customSections || []), { key, title: customSectionName.trim() }] });
                  setCustomSectionName('');
                  setShowCustomInput(false);
                  setExpandedSection(key);
                }
              }}
              style={{ padding: '10px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Add
            </button>
            <button 
              onClick={() => { setShowCustomInput(false); setCustomSectionName(''); }}
              style={{ padding: '10px', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
