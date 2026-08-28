import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

// Canonical skill level strings
const LEVEL_MAP = { 1: 'Novice', 2: 'Beginner', 3: 'Skillful', 4: 'Experienced', 5: 'Expert' };

/**
 * Normalise any skills format into { items: [{id, name, level}], hideExperienceLevel }
 * Handles: undefined, flat string array, numeric-level objects, string-level objects, canonical shape.
 */
function normalizeSkills(raw) {
  try {
    // Already canonical
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.items)) {
      return {
        items: raw.items.map((s, i) => ({
          id: s?.id || `skill-${i}`,
          name: typeof s === 'string' ? s : String(s?.name || ''),
          level: typeof s?.level === 'number' ? (LEVEL_MAP[s.level] || 'Skillful') : (s?.level || 'Skillful'),
        })),
        hideExperienceLevel: !!raw.hideExperienceLevel,
      };
    }
    // Flat array (strings or {name,level} objects)
    if (Array.isArray(raw)) {
      return {
        items: raw.map((s, i) => ({
          id: (s && s.id) ? s.id : `skill-${i}`,
          name: typeof s === 'string' ? s : String(s?.name || ''),
          level: typeof s?.level === 'number' ? (LEVEL_MAP[s.level] || 'Skillful') : (s?.level || 'Skillful'),
        })),
        hideExperienceLevel: false,
      };
    }
  } catch (_) { /* fall through */ }
  return defaultResume.skills;
}

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

/** Bulletproof sanitizer — never throws, always returns a valid resume object */
function sanitizeResume(data) {
  try {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ...defaultResume };
    return {
      ...defaultResume,
      ...data,
      personal: { ...defaultResume.personal, ...(data.personal && typeof data.personal === 'object' ? data.personal : {}) },
      summary: typeof data.summary === 'string' ? data.summary : '',
      experience: Array.isArray(data.experience) ? data.experience.map(e => ({
        id: e?.id || generateId('exp'),
        title: e?.title || '',
        company: e?.company || '',
        location: e?.location || '',
        startDate: e?.startDate || '',
        endDate: e?.endDate || '',
        current: !!e?.current,
        bullets: Array.isArray(e?.bullets) ? e.bullets : [''],
      })) : defaultResume.experience,
      education: Array.isArray(data.education) ? data.education : defaultResume.education,
      skills: normalizeSkills(data.skills),
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
      achievements: Array.isArray(data.achievements) ? data.achievements : [],
      customSections: Array.isArray(data.customSections) ? data.customSections : [],
      sectionOrder: Array.isArray(data.sectionOrder) && data.sectionOrder.length > 0
        ? data.sectionOrder
        : defaultResume.sectionOrder,
      enabledSections: Array.isArray(data.enabledSections) && data.enabledSections.length > 0
        ? data.enabledSections
        : defaultResume.enabledSections,
    };
  } catch (err) {
    console.error('[sanitizeResume] Unexpected error, falling back to default:', err);
    return { ...defaultResume };
  }
}

const HISTORY_LIMIT = 50;

export default function useResumeState() {
  const [resume, setResumeState] = useState(defaultResume);
  const [resumeName, setResumeName] = useState('Untitled Resume');
  const [resumeId, setResumeId] = useState(null);
  // Auto-save status: 'idle' | 'saving' | 'saved'
  const [saveStatus, setSaveStatus] = useState('idle');

  // Undo/redo history
  const historyRef = useRef([defaultResume]);
  const historyIndexRef = useRef(0);
  const skipHistoryRef = useRef(false); // prevent undo/redo from pushing to history

  /** Internal setter that also pushes to history */
  const setResume = useCallback((updater) => {
    setResumeState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!skipHistoryRef.current) {
        // Truncate forward history and push
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(next);
        if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    skipHistoryRef.current = true;
    setResumeState(historyRef.current[historyIndexRef.current]);
    skipHistoryRef.current = false;
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    skipHistoryRef.current = true;
    setResumeState(historyRef.current[historyIndexRef.current]);
    skipHistoryRef.current = false;
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // Keyboard shortcut for undo/redo
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobwin_resume_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        const { _name, _id, ...resumeData } = parsed;
        const clean = sanitizeResume(resumeData);
        // Initialise history with the loaded state
        historyRef.current = [clean];
        historyIndexRef.current = 0;
        skipHistoryRef.current = true;
        setResumeState(clean);
        skipHistoryRef.current = false;
        if (_name) setResumeName(_name);
        if (_id) setResumeId(_id);
      }
    } catch (e) {
      console.warn('Failed to load draft, starting fresh:', e);
      try { localStorage.removeItem('jobwin_resume_draft'); } catch (_) {}
    }
  }, []);

  // Debounced localStorage auto-save (1 s)
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('jobwin_resume_draft', JSON.stringify({ ...resume, _name: resumeName, _id: resumeId }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.warn('Failed to save draft:', e);
        setSaveStatus('idle');
      }
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
        updated_at: new Date().toISOString(),
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
    try {
      const rawForm = savedResume.form_data || savedResume.content;
      const formData = typeof rawForm === 'string' ? JSON.parse(rawForm) : rawForm;
      const clean = sanitizeResume(formData);
      historyRef.current = [clean];
      historyIndexRef.current = 0;
      skipHistoryRef.current = true;
      setResumeState(clean);
      skipHistoryRef.current = false;
      setResumeName(savedResume.title || 'Untitled Resume');
      setResumeId(savedResume.id);
    } catch (e) {
      console.error('Failed to parse saved resume data:', e);
    }
  }, []);

  const updateSection = useCallback((section, data) => {
    setResume(prev => ({ ...prev, [section]: data }));
  }, [setResume]);

  const updateSettings = useCallback((settings) => {
    setResume(prev => ({ ...prev, ...settings }));
  }, [setResume]);

  const addSection = useCallback((sectionKey) => {
    setResume(prev => ({
      ...prev,
      enabledSections: [...prev.enabledSections, sectionKey],
      sectionOrder: [...prev.sectionOrder, sectionKey],
    }));
  }, [setResume]);

  const removeSection = useCallback((sectionKey) => {
    setResume(prev => ({
      ...prev,
      enabledSections: prev.enabledSections.filter(s => s !== sectionKey),
      sectionOrder: prev.sectionOrder.filter(s => s !== sectionKey),
    }));
  }, [setResume]);

  const reorderSections = useCallback((newOrder) => {
    setResume(prev => ({ ...prev, sectionOrder: newOrder }));
  }, [setResume]);

  const switchTemplate = useCallback((templateId) => {
    setResume(prev => ({ ...prev, templateId }));
  }, [setResume]);

  return {
    resume, updateSection, updateSettings, addSection, removeSection,
    reorderSections, switchTemplate, setResume, resumeName, setResumeName,
    resumeId, saveDraft, loadResume, saveStatus, undo, redo, canUndo, canRedo,
  };
}

export { defaultResume, generateId, normalizeSkills };
