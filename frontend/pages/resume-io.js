import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../lib/contexts';
import { supabase } from '../lib/supabase';
import useResumeState, { defaultResume } from '../components/resume-io/hooks/useResumeState';
import PageHead from '../components/PageHead';
import Sidebar from '../components/Sidebar';
import TemplateGallery from '../components/resume-io/TemplateGallery';
import EditorShell from '../components/resume-io/EditorShell';
import SectionManager from '../components/resume-io/sections/SectionManager';
import LivePreview from '../components/resume-io/LivePreview';
import ExportPanel from '../components/resume-io/ExportPanel';
import ResumeUpload from '../components/resume-io/ResumeUpload';
import MyResumes from '../components/resume-io/MyResumes';

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
    resumeName, setResumeName, resumeId, saveDraft, loadResume
  } = useResumeState();

  const [view, setView] = useState('gallery'); // 'gallery' | 'editor'
  const [activeTab, setActiveTab] = useState('edit');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [savedResumes, setSavedResumes] = useState([]);

  const loadSavedResumes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.from('resumes').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }).limit(20);
      if (data) setSavedResumes(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (view === 'gallery') {
      loadSavedResumes();
    }
  }, [view]);

  // Template selection from gallery
  const handleSelectTemplate = (templateId, accentColor) => {
    switchTemplate(templateId);
    if (accentColor) updateSettings({ accentColor });
    setResumeName('Untitled Resume'); // reset on new
    setView('editor');
  };

  const handleSelectSaved = (saved) => {
    loadResume(saved);
    setView('editor');
  };

  // Resume upload handler
  const handleDataExtracted = (parsedData) => {
    if (parsedData.personal) updateSection('personal', { ...resume.personal, ...parsedData.personal });
    if (parsedData.summary) updateSection('summary', parsedData.summary);
    if (parsedData.experience?.length) updateSection('experience', parsedData.experience);
    if (parsedData.education?.length) updateSection('education', parsedData.education);
    // Skills: normalize to { items: [...], hideExperienceLevel } shape for Skills.js UI
    if (parsedData.skills) {
      let skillsArray = [];
      if (parsedData.skills.items) {
        skillsArray = parsedData.skills.items;
      } else if (Array.isArray(parsedData.skills)) {
        skillsArray = parsedData.skills;
      }
      if (skillsArray.length) {
        // Ensure each skill has { id, name, level } shape
        const normalized = skillsArray.map((s, i) => ({
          id: s.id || `skill-${i}`,
          name: typeof s === 'string' ? s : (s.name || ''),
          level: s.level || 'Skillful'
        }));
        updateSection('skills', { items: normalized, hideExperienceLevel: false });
      }
    }
    
    if (parsedData.projects?.length) updateSection('projects', parsedData.projects);
    if (parsedData.certifications?.length) updateSection('certifications', parsedData.certifications);
    if (parsedData.languages?.length) updateSection('languages', parsedData.languages);
    if (parsedData.achievements?.length) updateSection('achievements', parsedData.achievements);

    // Enable sections that now have data
    const sectionsToEnable = ['personal', 'summary', 'experience', 'education', 'skills'];
    if (parsedData.projects?.length) sectionsToEnable.push('projects');
    if (parsedData.certifications?.length) sectionsToEnable.push('certifications');
    if (parsedData.languages?.length) sectionsToEnable.push('languages');
    if (parsedData.achievements?.length) sectionsToEnable.push('achievements');
    
    const newEnabled = [...new Set([...resume.enabledSections, ...sectionsToEnable])];
    const newOrder = [...new Set([...resume.sectionOrder, ...sectionsToEnable])];
    updateSettings({ enabledSections: newEnabled, sectionOrder: newOrder });
    setShowUpload(false);
  };

  // Export handler — clones the preview at full size for capture
  const handleExport = async (format) => {
    const source = document.getElementById('resume-preview-content');
    if (!source) {
      console.error('Resume preview not found');
      return;
    }

    // Clone the preview and render it at full size (no scale transform)
    const clone = source.cloneNode(true);
    clone.style.transform = 'none';
    clone.style.width = '794px';
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.zIndex = '9999';
    clone.style.background = '#ffffff';
    clone.style.boxShadow = 'none';
    document.body.appendChild(clone);

    try {
      if (format === 'pdf') {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf().set({
          margin: 0,
          filename: `${resume.personal.name || 'Resume'}_Resume.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        }).from(clone).save();
      } else {
        const html = clone.innerHTML;
        const blob = new Blob(
          [`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>${html}</body></html>`],
          { type: 'application/msword' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${resume.personal.name || 'Resume'}_Resume.doc`;
        a.click(); URL.revokeObjectURL(url);
      }
    } finally {
      document.body.removeChild(clone);
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
          {savedResumes.length > 0 && (
            <div style={{ padding: '40px 40px 0 40px' }}>
              <MyResumes 
                resumes={savedResumes} 
                onSelect={handleSelectSaved} 
                onCreateNew={() => {
                  setResume(defaultResume);
                  setResumeName('Untitled Resume');
                  setView('editor');
                }} 
              />
            </div>
          )}
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
      {/* Force dark text colors for all form inputs in the Resume IO editor */}
      <style>{`
        .resume-io-editor input, .resume-io-editor textarea, .resume-io-editor select {
          color: #111827 !important;
        }
        .resume-io-editor input::placeholder, .resume-io-editor textarea::placeholder {
          color: #9CA3AF !important;
        }
        .resume-io-editor input[type="month"] {
          appearance: none;
          -webkit-appearance: none;
          background: #F9FAFB;
          cursor: pointer;
        }
      `}</style>
      <main className="resume-io-editor" style={{ flex: 1, overflow: 'hidden' }}>
        <EditorShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => setView('gallery')}
          onExport={handleExport}
          resumeName={resumeName}
          onRenameSave={setResumeName}
          onSaveDraft={saveDraft}
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
