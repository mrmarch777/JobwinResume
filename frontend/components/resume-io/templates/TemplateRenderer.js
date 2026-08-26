import React from 'react';
import ClassicTemplate from './ClassicTemplate';
import ModernTemplate from './ModernTemplate';
import CreativeTemplate from './CreativeTemplate';
import MinimalTemplate from './MinimalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import ATSOptimizedTemplate from './ATSOptimizedTemplate';
import PhotoModernTemplate from './PhotoModernTemplate';
import PhotoSidebarTemplate from './PhotoSidebarTemplate';
import PhotoBoldTemplate from './PhotoBoldTemplate';
import PhotoMinimalTemplate from './PhotoMinimalTemplate';
import PhotoExecutiveTemplate from './PhotoExecutiveTemplate';
import TraditionalTemplate from './TraditionalTemplate';
import PrimeATSTemplate from './PrimeATSTemplate';
import CleanTemplate from './CleanTemplate';
import CorporateTemplate from './CorporateTemplate';
import ElegantTemplate from './ElegantTemplate';
import BoldTemplate from './BoldTemplate';
import IndustrialTemplate from './IndustrialTemplate';
import SpecialistTemplate from './SpecialistTemplate';
import TwoColumnTemplate from './TwoColumnTemplate';

const templates = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  ats: ATSOptimizedTemplate,
  'photo-modern': PhotoModernTemplate,
  'photo-sidebar': PhotoSidebarTemplate,
  'photo-bold': PhotoBoldTemplate,
  'photo-minimal': PhotoMinimalTemplate,
  'photo-executive': PhotoExecutiveTemplate,
  traditional: TraditionalTemplate,
  'prime-ats': PrimeATSTemplate,
  clean: CleanTemplate,
  corporate: CorporateTemplate,
  elegant: ElegantTemplate,
  bold: BoldTemplate,
  industrial: IndustrialTemplate,
  specialist: SpecialistTemplate,
  'two-column': TwoColumnTemplate,
};

// Known built-in section keys — filter these out from sectionOrder when passing to templates
// that don't know about custom sections
const BUILTIN_SECTIONS = new Set([
  'personal','summary','experience','education','skills',
  'projects','certifications','languages','achievements'
]);

export default function TemplateRenderer({ resume }) {
  const Template = templates[resume.templateId] || ClassicTemplate;
  
  try {
    // Normalize data shapes so all templates get consistent field names
    const normalizedResume = {
      ...resume,
      // Skills: always convert to flat array for templates
      skills: Array.isArray(resume.skills) 
        ? resume.skills 
        : (resume.skills?.items || []),
      
      // Experience: ensure bullets is always an array
      experience: (resume.experience || []).map(exp => ({
        ...exp,
        bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        startDate: exp.startDate || exp.from || '',
        endDate: exp.endDate || exp.to || '',
      })),

      // Education: normalize field names
      education: (resume.education || []).map(edu => ({
        ...edu,
        startDate: edu.startDate || edu.from || '',
        endDate: edu.endDate || edu.to || '',
      })),

      // Projects: ensure both name/title and technologies/subtitle work
      projects: (resume.projects || []).map(p => ({
        ...p,
        name: p.name || p.title || '',
        title: p.title || p.name || '',
        technologies: p.technologies || p.subtitle || '',
        subtitle: p.subtitle || p.technologies || '',
        description: p.description || '',
      })),

      // Languages: ensure both proficiency and level work
      languages: (resume.languages || []).map(l => ({
        ...l,
        level: l.level || l.proficiency || '',
        proficiency: l.proficiency || l.level || '',
      })),

      // Achievements: normalize strings to objects
      achievements: (resume.achievements || []).map(a => 
        typeof a === 'string' ? { title: a, description: '', date: '' } : a
      ),

      // Certifications: ensure consistent shape
      certifications: (resume.certifications || []).map(c => ({
        ...c,
        name: c.name || c.title || '',
        issuer: c.issuer || c.organization || '',
        date: c.date || c.year || '',
      })),

      // Strip custom section keys from sectionOrder for templates that don't handle them
      sectionOrder: (resume.sectionOrder || []).filter(key => BUILTIN_SECTIONS.has(key)),
      enabledSections: (resume.enabledSections || []).filter(key => BUILTIN_SECTIONS.has(key)),

      // Keep original customSections for templates that DO handle them
      customSections: resume.customSections || [],
    };

    return <Template resume={normalizedResume} />;
  } catch (err) {
    // Last-resort fallback — render Classic if the selected template crashes
    console.error(`Template "${resume.templateId}" crashed:`, err);
    const safeResume = {
      ...resume,
      skills: Array.isArray(resume.skills) ? resume.skills : (resume.skills?.items || []),
      experience: resume.experience || [],
      education: resume.education || [],
      projects: resume.projects || [],
      certifications: resume.certifications || [],
      languages: resume.languages || [],
      achievements: resume.achievements || [],
      sectionOrder: (resume.sectionOrder || []).filter(k => BUILTIN_SECTIONS.has(k)),
      enabledSections: (resume.enabledSections || []).filter(k => BUILTIN_SECTIONS.has(k)),
    };
    return <ClassicTemplate resume={safeResume} />;
  }
}
