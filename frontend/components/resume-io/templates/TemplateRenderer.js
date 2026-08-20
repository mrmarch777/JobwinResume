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

export default function TemplateRenderer({ resume }) {
  const Template = templates[resume.templateId] || ClassicTemplate;
  // Normalize skills: ensure templates always get a flat array of { name, level }
  const normalizedResume = {
    ...resume,
    skills: Array.isArray(resume.skills) ? resume.skills : (resume.skills?.items || []),
  };
  return <Template resume={normalizedResume} />;
}
