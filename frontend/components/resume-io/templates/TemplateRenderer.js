import ClassicTemplate from './ClassicTemplate';
import ModernTemplate from './ModernTemplate';
import CreativeTemplate from './CreativeTemplate';
import MinimalTemplate from './MinimalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import ATSOptimizedTemplate from './ATSOptimizedTemplate';

const templates = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  ats: ATSOptimizedTemplate,
};

export default function TemplateRenderer({ resume }) {
  if (!resume) return null;
  const Template = templates[resume.templateId] || ClassicTemplate;
  return <Template resume={resume} />;
}
