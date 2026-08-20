import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const defaultResume = {
  // Template & Color settings
  templateId: 'classic',
  accentColor: '#6C63FF',
  
  // Text settings
  primaryFont: 'Lato',
  secondaryFont: 'PT Serif',
  fontSize: 'medium',
  lineHeight: 100,
  
  // Layout settings
  spacing: 'normal',
  margins: {
    headerFooter: 0.5,
    topBottom: 1,
    leftRight: 1,
    betweenSections: 24,
    betweenTitleContent: 24,
    betweenContentBlocks: 12,
    insideContentBlock: 8,
  },
  headerAlignment: 'left',
  dateAlignment: 'right',
  locationAlignment: 'left',
  skillsLayout: 'inline',
  skillsColumns: 4,
  educationLayout: 'stacked',
  showSkillLevel: true,
  paperFormat: 'a4',

  // Legacy compat
  fontFamily: 'DM Sans',

  // Content sections
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', photo: null },
  summary: '',
  experience: [{ id: generateId('exp'), title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }],
  education: [{ id: generateId('edu'), degree: '', field: '', institution: '', year: '', grade: '' }],
  skills: { items: [{ id: 'skill-default', name: '', level: 'Skillful' }], hideExperienceLevel: false },
  projects: [],
  certifications: [],
  languages: [],
  achievements: [],
  customSections: [],
  sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills'],
  enabledSections: ['personal', 'summary', 'experience', 'education', 'skills'],
};

export default function useResumeState() {
  const [resume, setResume] = useState(defaultResume);
  const [resumeName, setResumeName] = useState('Untitled Resume');
  const [resumeId, setResumeId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobwin_resume_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        const { _name, _id, ...resumeData } = parsed;
        setResume({ ...defaultResume, ...resumeData });
        if (_name) setResumeName(_name);
        if (_id) setResumeId(_id);
      }
    } catch (e) { console.warn('Failed to load draft:', e); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('jobwin_resume_draft', JSON.stringify({ ...resume, _name: resumeName, _id: resumeId }));
      } catch (e) { console.warn('Failed to save draft:', e); }
    }, 1000);
    return () => clearTimeout(timer);
  }, [resume, resumeName, resumeId]);

  const saveDraft = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { error: 'Not logged in' };
      const payload = { 
        user_id: session.user.id, 
        title: resumeName, 
        content: JSON.stringify(resume),
        template: resume.templateId,
        form_data: resume,
        updated_at: new Date().toISOString()
      };
      if (resumeId) {
        const { error } = await supabase.from('resumes').update(payload).eq('id', resumeId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('resumes').insert(payload).select().single();
        if (error) throw error;
        setResumeId(data.id);
      }
      return { success: true };
    } catch (e) {
      console.error('Save failed:', e);
      return { error: e.message };
    }
  }, [resume, resumeName, resumeId]);

  const loadResume = useCallback((savedResume) => {
    const formData = typeof savedResume.form_data === 'string' ? JSON.parse(savedResume.form_data) : savedResume.form_data;
    setResume({ ...defaultResume, ...formData });
    setResumeName(savedResume.title || 'Untitled Resume');
    setResumeId(savedResume.id);
  }, []);
  
  const updateSection = useCallback((section, data) => {
    setResume(prev => ({ ...prev, [section]: data }));
  }, []);
  
  const updateSettings = useCallback((settings) => {
    setResume(prev => ({ ...prev, ...settings }));
  }, []);
  
  const addSection = useCallback((sectionKey) => {
    setResume(prev => ({
      ...prev,
      enabledSections: [...prev.enabledSections, sectionKey],
      sectionOrder: [...prev.sectionOrder, sectionKey],
    }));
  }, []);
  
  const removeSection = useCallback((sectionKey) => {
    setResume(prev => ({
      ...prev,
      enabledSections: prev.enabledSections.filter(s => s !== sectionKey),
      sectionOrder: prev.sectionOrder.filter(s => s !== sectionKey),
    }));
  }, []);
  
  const reorderSections = useCallback((newOrder) => {
    setResume(prev => ({ ...prev, sectionOrder: newOrder }));
  }, []);
  
  const switchTemplate = useCallback((templateId) => {
    setResume(prev => ({ ...prev, templateId }));
  }, []);
  
  return { resume, updateSection, updateSettings, addSection, removeSection, reorderSections, switchTemplate, setResume, resumeName, setResumeName, resumeId, saveDraft, loadResume };
}

export { defaultResume, generateId };
