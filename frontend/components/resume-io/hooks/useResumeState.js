import { useState, useCallback } from 'react';

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const defaultResume = {
  templateId: 'classic',
  accentColor: '#6C63FF',
  fontFamily: 'DM Sans',
  fontSize: 'medium',
  spacing: 'normal',
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', photo: null },
  summary: '',
  experience: [{ id: generateId('exp'), title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }],
  education: [{ id: generateId('edu'), degree: '', field: '', institution: '', year: '', grade: '' }],
  skills: [{ name: '', level: 3 }],
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
  
  return { resume, updateSection, updateSettings, addSection, removeSection, reorderSections, switchTemplate, setResume };
}

export { defaultResume, generateId };
