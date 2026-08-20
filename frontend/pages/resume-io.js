import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../lib/contexts';
import useResumeState from '../components/resume-io/hooks/useResumeState';
import PageHead from '../components/PageHead';
import Sidebar from '../components/Sidebar';
import TemplateGallery from '../components/resume-io/TemplateGallery';
import EditorShell from '../components/resume-io/EditorShell';
import SectionManager from '../components/resume-io/sections/SectionManager';
import LivePreview from '../components/resume-io/LivePreview';
import ExportPanel from '../components/resume-io/ExportPanel';
import ResumeUpload from '../components/resume-io/ResumeUpload';

// Lazy-loaded tab panels
import dynamic from 'next/dynamic';
const CustomizePanel = dynamic(() => import('../components/resume-io/CustomizePanel'), { ssr: false });
const AIReviewPanel = dynamic(() => import('../components/resume-io/AIReviewPanel'), { ssr: false });
const TailorPanel = dynamic(() => import('../components/resume-io/TailorPanel'), { ssr: false });
const TailorJobDetail = dynamic(() => import('../components/resume-io/TailorJobDetail'), { ssr: false });

export default function ResumeIO() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    resume, updateSection, updateSettings,
    addSection, removeSection, reorderSections,
    switchTemplate, setResume,
  } = useResumeState();

  const [view, setView] = useState('gallery'); // 'gallery' | 'editor'
  const [activeTab, setActiveTab] = useState('edit');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Template selection from gallery
  const handleSelectTemplate = (templateId, accentColor) => {
    switchTemplate(templateId);
    if (accentColor) updateSettings({ accentColor });
    setView('editor');
  };

  // Resume upload handler
  const handleDataExtracted = (parsedData) => {
    if (parsedData.personal) updateSection('personal', { ...resume.personal, ...parsedData.personal });
    if (parsedData.summary) updateSection('summary', parsedData.summary);
    if (parsedData.experience?.length) updateSection('experience', parsedData.experience);
    if (parsedData.education?.length) updateSection('education', parsedData.education);
    // Skills can come as { items: [...] } or as a flat array
    if (parsedData.skills) {
      if (parsedData.skills.items) {
        updateSection('skills', parsedData.skills.items);
      } else if (Array.isArray(parsedData.skills) && parsedData.skills.length) {
        updateSection('skills', parsedData.skills);
      }
    }
    // Enable sections that now have data
    const sectionsToEnable = ['personal', 'summary', 'experience', 'education', 'skills'];
    const newEnabled = [...new Set([...resume.enabledSections, ...sectionsToEnable])];
    const newOrder = [...new Set([...resume.sectionOrder, ...sectionsToEnable])];
    updateSettings({ enabledSections: newEnabled, sectionOrder: newOrder });
    setShowUpload(false);
  };

  // Export handler
  const handleExport = async (format) => {
    const el = document.getElementById('resume-export-target');
    if (!el) {
      console.error('Export target not found');
      return;
    }
    if (format === 'pdf') {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().set({
        margin: 0,
        filename: `${resume.personal.name || 'Resume'}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }).from(el).save();
    } else {
      const html = el.innerHTML;
      const blob = new Blob(
        [`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>${html}</body></html>`],
        { type: 'application/msword' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${resume.personal.name || 'Resume'}_Resume.doc`;
      a.click(); URL.revokeObjectURL(url);
    }
  };

  // Apply tailor suggestions
  const handleApplyOptimization = (suggestions) => {
    if (suggestions?.summary) updateSection('summary', suggestions.summary);
    if (suggestions?.experience) updateSection('experience', suggestions.experience);
  };

  // ─── Gallery View ────────────────────────────────────────
  if (view === 'gallery') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg }}>
        <PageHead title="Resume IO" description="Build a professional resume with our advanced builder" />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <TemplateGallery onSelect={handleSelectTemplate} onBack={() => router.push('/dashboard')} />
        </main>
      </div>
    );
  }

  // ─── Editor View ─────────────────────────────────────────
  // Determine left and right panels based on active tab
  let leftPanel, rightPanel;

  switch (activeTab) {
    case 'edit':
      leftPanel = (
        <SectionManager
          resume={resume}
          updateSection={updateSection}
          updateSettings={updateSettings}
          addSection={addSection}
          removeSection={removeSection}
          reorderSections={reorderSections}
          onUploadResume={() => setShowUpload(true)}
        />
      );
      rightPanel = (
        <>
          <LivePreview resume={resume} />
          <ExportPanel resume={resume} />
        </>
      );
      break;

    case 'customize':
      leftPanel = (
        <CustomizePanel
          resume={resume}
          updateSettings={updateSettings}
          switchTemplate={switchTemplate}
        />
      );
      rightPanel = <LivePreview resume={resume} />;
      break;

    case 'ai-review':
      leftPanel = (
        <SectionManager
          resume={resume}
          updateSection={updateSection}
          updateSettings={updateSettings}
          addSection={addSection}
          removeSection={removeSection}
          reorderSections={reorderSections}
          onUploadResume={() => setShowUpload(true)}
        />
      );
      rightPanel = <AIReviewPanel resume={resume} />;
      break;

    case 'tailor':
      leftPanel = (
        <TailorPanel
          resume={resume}
          onSelectJob={setSelectedJob}
          selectedJob={selectedJob}
        />
      );
      rightPanel = (
        <TailorJobDetail
          job={selectedJob}
          resume={resume}
          onApplyOptimization={handleApplyOptimization}
        />
      );
      break;

    default:
      leftPanel = null;
      rightPanel = null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <PageHead title="Resume IO — Editor" />
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <EditorShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => setView('gallery')}
          onExport={handleExport}
          resumeName={resume.personal.name || 'Untitled Resume'}
          leftPanel={leftPanel}
          rightPanel={rightPanel}
        />
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <ResumeUpload
          onDataExtracted={handleDataExtracted}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
