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

// Stub components for SectionManager and TemplateRenderer until they are built
const SectionManager = ({ resume, updateSection, updateSettings, addSection, removeSection, reorderSections }) => (
  <div style={{ padding: '20px', color: '#fff' }}>
    <h3>Editor Sections</h3>
    <p>Sections placeholder</p>
  </div>
);

const TemplateRenderer = ({ resume }) => (
  <div style={{ padding: '40px' }}>
    <h1 style={{ color: resume.accentColor, fontFamily: resume.fontFamily }}>{resume.personal?.name || 'Your Name'}</h1>
    <p>Template ID: {resume.templateId}</p>
    <p>This is a placeholder for the template renderer.</p>
  </div>
);

export default function ResumeIO() {
  const [view, setView] = useState('gallery'); // 'gallery' | 'editor'
  const { resume, updateSection, updateSettings, addSection, removeSection, reorderSections, switchTemplate } = useResumeState();
  const { theme } = useTheme();
  const router = useRouter();
  
  const handleSelectTemplate = (templateId) => {
    switchTemplate(templateId);
    setView('editor');
  };
  
  if (view === 'gallery') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg }}>
        <PageHead title="Resume IO" description="Build a professional resume with our advanced builder" />
        <Sidebar activeId="resume-io" />
        <main style={{ flex: 1, overflow: 'auto', marginLeft: '240px' }}>
          <TemplateGallery onSelect={handleSelectTemplate} />
        </main>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg }}>
      <PageHead title="Resume IO — Editor" />
      <Sidebar activeId="resume-io" />
      <main style={{ flex: 1, overflow: 'hidden', marginLeft: '240px' }}>
        <EditorLayout
          onBack={() => setView('gallery')}
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
    </div>
  );
}
