import React, { useState, useCallback, useEffect } from 'react';
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

// Error Boundary to prevent full-page crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Resume IO Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', sans-serif", padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px', textAlign: 'center', maxWidth: '400px' }}>
            The resume editor encountered an error. This is usually caused by corrupted saved data.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                try { localStorage.removeItem('jobwin_resume_draft'); } catch(e) {}
                window.location.reload();
              }}
              style={{ padding: '12px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              Clear Data & Reload
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{ padding: '12px 24px', background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              Go to Dashboard
            </button>
          </div>
          <details style={{ marginTop: '24px', color: '#9CA3AF', fontSize: '12px', maxWidth: '500px' }}>
            <summary style={{ cursor: 'pointer' }}>Error details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: '8px' }}>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ResumeIO() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    resume, updateSection, updateSettings,
    addSection, removeSection, reorderSections,
    switchTemplate, setResume,
    resumeName, setResumeName, resumeId, saveDraft, loadResume,
    saveStatus, undo, redo, canUndo, canRedo,
  } = useResumeState();

  const [view, setView] = useState('gallery'); // 'gallery' | 'editor'
  const [activeTab, setActiveTab] = useState('edit');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [savedResumes, setSavedResumes] = useState([]);

  const loadSavedResumes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[MyResumes] session:', session?.user?.email);
      if (!session?.user) {
        console.warn('[MyResumes] No session — user not logged in, cannot load saved resumes');
        setSavedResumes([]);
        return;
      }
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      console.log('[MyResumes] loaded resumes:', data?.length, error);
      if (data) setSavedResumes(data);
    } catch (e) { 
      console.error('[MyResumes] load error:', e); 
    }
  };

  useEffect(() => {
    loadSavedResumes();
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

  // Export handler — uses server-side Puppeteer for perfect PDF, html2pdf as fallback
  const handleExport = async (format) => {
    const source = document.getElementById('resume-preview-content');
    if (!source) {
      alert('Resume preview not found. Please try again.');
      return;
    }

    const name = resume.personal?.name || 'Resume';

    if (format === 'pdf') {
      // Build a standalone HTML page with all inline styles intact
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules).map(r => r.cssText).join('\n');
          } catch { return ''; }
        })
        .join('\n');

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; background: white; }
    ${styles}
    p, li { page-break-inside: avoid; orphans: 3; widows: 3; }
    h1, h2, h3, h4 { page-break-after: avoid; }
  </style>
</head>
<body>${source.outerHTML}</body>
</html>`;

      try {
        // Try server-side Puppeteer PDF first (perfect rendering)
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: fullHtml, filename: `${name}_Resume.pdf` }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name}_Resume.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.warn('Server PDF failed, falling back to html2pdf:', err);
      }

      // Fallback: html2pdf client-side
      const scaledWrapper = source.parentElement;
      const originalTransform = scaledWrapper?.style.transform;
      const originalWidth = scaledWrapper?.style.width;
      if (scaledWrapper) {
        scaledWrapper.style.transform = 'none';
        scaledWrapper.style.width = '794px';
      }
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf().set({
          margin: 0,
          filename: `${name}_Resume.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, windowWidth: 794 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: 'css' },
        }).from(source).save();
      } finally {
        if (scaledWrapper) {
          scaledWrapper.style.transform = originalTransform || '';
          scaledWrapper.style.width = originalWidth || '';
        }
      }
    } else {
      // Word export
      const outerHtml = source.outerHTML;
      const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" 
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8"><title>Resume</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page { size: A4; margin: 1cm; }
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
  * { box-sizing: border-box; }
</style>
</head>
<body>${outerHtml}</body>
</html>`;
      const blob = new Blob([wordHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}_Resume.doc`;
      a.click();
      URL.revokeObjectURL(url);
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
      <ErrorBoundary>
      <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg }}>
        <PageHead title="Free Resume Builder | JobWin Resume" description="Build a professional resume with our AI-powered resume builder. Choose from 21 templates, get ATS score, and download as PDF." />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '40px 40px 0 40px' }}>
            <MyResumes 
              resumes={savedResumes} 
              onSelect={handleSelectSaved} 
              onRefresh={loadSavedResumes}
              onCreateNew={() => { 
                setResume(defaultResume); 
                setResumeName('Untitled Resume'); 
                setView('editor'); 
              }} 
            />
          </div>
          <TemplateGallery onSelect={handleSelectTemplate} onBack={() => router.push('/dashboard')} />
        </main>
      </div>
      </ErrorBoundary>
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
        <LivePreview resume={resume} />
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
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', padding: '40px 24px', color: '#6B7280', textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>AI Resume Review</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.6, maxWidth: '280px' }}>
            Fill in your resume details on the <strong>Edit</strong> tab, then switch back here to run the AI analysis.
          </p>
          <button
            onClick={() => setActiveTab('edit')}
            style={{ marginTop: '20px', padding: '10px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Go to Edit Tab
          </button>
        </div>
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
    <ErrorBoundary>
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <PageHead title="Resume Editor | JobWin Resume" />
      {/* Force dark text colors for all form inputs in the Resume IO editor */}
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
        .resume-io-editor input, .resume-io-editor textarea, .resume-io-editor select {
          color: #111827 !important;
        }
        .resume-io-editor input::placeholder, .resume-io-editor textarea::placeholder {
          color: #9CA3AF !important;
        }
      `}} />
      <main className="resume-io-editor" style={{ flex: 1, overflow: 'hidden' }}>
        <EditorShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => setView('gallery')}
          onExport={handleExport}
          resumeName={resumeName}
          onRenameSave={setResumeName}
          onSaveDraft={saveDraft}
          saveStatus={saveStatus}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
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
    </ErrorBoundary>
  );
}
