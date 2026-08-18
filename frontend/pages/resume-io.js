import React, { useState } from 'react';
import { useRouter } from 'next/router';
import PageHead from '../components/PageHead';
import { useTheme } from '../lib/contexts';
import TemplateGallery from '../components/resume-io/TemplateGallery';
import EditorLayout from '../components/resume-io/EditorLayout';
import LivePreview from '../components/resume-io/LivePreview';
import ExportPanel from '../components/resume-io/ExportPanel';
import useResumeState from '../components/resume-io/hooks/useResumeState';
import Sidebar from '../components/Sidebar';

import SectionManager from '../components/resume-io/sections/SectionManager';
import TemplateRenderer from '../components/resume-io/templates/TemplateRenderer';
import ResumeUpload from '../components/resume-io/ResumeUpload';
import ATSChecker from '../components/resume-io/ATSChecker';
import JDOptimizer from '../components/resume-io/JDOptimizer';

export default function ResumeIO() {
  const [view, setView] = useState('gallery'); // 'gallery' | 'editor'
  const [showUpload, setShowUpload] = useState(false);
  const [showATS, setShowATS] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  
  const { resume, updateSection, updateSettings, addSection, removeSection, reorderSections, switchTemplate, setResumeData } = useResumeState();
  const { theme } = useTheme();
  const router = useRouter();
  
  const handleSelectTemplate = (templateId, accentColor) => {
    switchTemplate(templateId);
    if (accentColor) updateSettings({ accentColor });
    setView('editor');
  };

  const handleDataExtracted = (parsedData) => {
    // Assuming useResumeState exposes a way to bulk update sections, or we update them individually
    if (parsedData.personal) updateSection('personal', parsedData.personal);
    if (parsedData.summary) updateSection('summary', parsedData.summary);
    if (parsedData.experience) updateSection('experience', parsedData.experience);
    if (parsedData.education) updateSection('education', parsedData.education);
    if (parsedData.skills) updateSection('skills', parsedData.skills);
  };

  const handleApplyOptimization = (suggestions) => {
    // Optimization handling
  };
  
  const themeVars = {
    '--theme-bg': theme.bg,
    '--theme-card': theme.card,
    '--theme-border': theme.border,
    '--theme-text': theme.text,
    '--theme-muted': theme.muted,
    '--theme-accent': theme.accent,
    '--theme-input-bg': theme.inputBg,
  };

  if (view === 'gallery') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, ...themeVars }}>
        <PageHead title="Resume IO" description="Build a professional resume with our advanced builder" />
        <Sidebar activeId="resume-io" />
        <main style={{ flex: 1, overflow: 'auto', marginLeft: '240px' }}>
          <TemplateGallery onSelect={handleSelectTemplate} />
        </main>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, ...themeVars }}>
      <PageHead title="Resume IO — Editor" />
      <Sidebar activeId="resume-io" />
      <main style={{ flex: 1, overflow: 'hidden', marginLeft: '240px' }}>
        <EditorLayout
          onBack={() => setView('gallery')}
          toolbar={
            <>
              <button onClick={() => setShowUpload(true)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>📄 Import Resume</button>
              <button onClick={() => setShowATS(true)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>🎯 ATS Check</button>
              <button onClick={() => setShowOptimizer(true)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>✨ Optimize for JD</button>
            </>
          }
          formPanel={
            <SectionManager
              resume={resume}
              updateSection={updateSection}
              updateSettings={updateSettings}
              addSection={addSection}
              removeSection={removeSection}
              reorderSections={reorderSections}
            />
          }
          previewPanel={
            <>
              <LivePreview
                resume={resume}
                TemplateComponent={TemplateRenderer}
              />
              <ExportPanel resume={resume} />
            </>
          }
        />
      </main>
      
      {showUpload && <ResumeUpload onDataExtracted={handleDataExtracted} onClose={() => setShowUpload(false)} />}
      {showATS && <ATSChecker resume={resume} onClose={() => setShowATS(false)} />}
      {showOptimizer && <JDOptimizer resume={resume} onApplyOptimization={handleApplyOptimization} onClose={() => setShowOptimizer(false)} />}
    </div>
  );
}
