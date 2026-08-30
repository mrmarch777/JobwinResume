import React, { useState, Suspense, lazy } from 'react';
import { 
  Check, Plus, AlignLeft, AlignCenter, AlignRight, 
  Layout, List, ToggleLeft, ToggleRight
} from 'lucide-react';

const ClassicTemplate = lazy(() => import('./templates/ClassicTemplate'));
const ModernTemplate = lazy(() => import('./templates/ModernTemplate'));
const CreativeTemplate = lazy(() => import('./templates/CreativeTemplate'));
const MinimalTemplate = lazy(() => import('./templates/MinimalTemplate'));
const ExecutiveTemplate = lazy(() => import('./templates/ExecutiveTemplate'));
const ATSOptimizedTemplate = lazy(() => import('./templates/ATSOptimizedTemplate'));
const PhotoModernTemplate = lazy(() => import('./templates/PhotoModernTemplate'));
const PhotoSidebarTemplate = lazy(() => import('./templates/PhotoSidebarTemplate'));
const PhotoBoldTemplate = lazy(() => import('./templates/PhotoBoldTemplate'));
const PhotoMinimalTemplate = lazy(() => import('./templates/PhotoMinimalTemplate'));
const PhotoExecutiveTemplate = lazy(() => import('./templates/PhotoExecutiveTemplate'));
const TraditionalTemplate = lazy(() => import('./templates/TraditionalTemplate'));
const PrimeATSTemplate = lazy(() => import('./templates/PrimeATSTemplate'));
const CleanTemplate = lazy(() => import('./templates/CleanTemplate'));
const CorporateTemplate = lazy(() => import('./templates/CorporateTemplate'));
const ElegantTemplate = lazy(() => import('./templates/ElegantTemplate'));
const BoldTemplate = lazy(() => import('./templates/BoldTemplate'));
const IndustrialTemplate = lazy(() => import('./templates/IndustrialTemplate'));
const SpecialistTemplate = lazy(() => import('./templates/SpecialistTemplate'));
const TwoColumnTemplate = lazy(() => import('./templates/TwoColumnTemplate'));

// Lightweight fallback for lazy-loaded template thumbnails
const TemplateSkeleton = () => (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
);

const sampleResume = {
  templateId: 'classic',
  accentColor: '#6C63FF',
  fontFamily: 'DM Sans',
  fontSize: 'medium',
  spacing: 'normal',
  personal: {
    name: 'Sarah Mitchell',
    title: 'Senior Product Manager',
    email: 'sarah.mitchell@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/sarahmitchell',
    website: 'sarahmitchell.com',
    photo: null,
  },
  summary: 'Results-driven Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative digital products. Proven track record of increasing user engagement by 40% and driving $2M+ in annual revenue growth through data-driven product strategies.',
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Product Manager',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: '',
      current: true,
      bullets: [
        'Led a team of 12 engineers and designers to launch a B2B SaaS platform serving 50K+ users',
        'Increased user retention by 35% through data-driven feature prioritization and A/B testing',
        'Managed a $3M product budget and delivered all milestones ahead of schedule',
      ],
    },
    {
      id: 'exp-2',
      title: 'Product Manager',
      company: 'InnovateLabs',
      location: 'New York, NY',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      bullets: [
        'Drove product roadmap for a mobile app with 2M+ downloads',
        'Collaborated with UX research to reduce onboarding drop-off by 28%',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'MBA',
      field: 'Technology Management',
      institution: 'Stanford University',
      year: '2018',
      grade: '3.9 GPA',
    },
    {
      id: 'edu-2',
      degree: 'B.S.',
      field: 'Computer Science',
      institution: 'UC Berkeley',
      year: '2014',
      grade: '',
    },
  ],
  skills: [
    { name: 'Product Strategy', level: 5 },
    { name: 'Agile/Scrum', level: 5 },
    { name: 'Data Analytics', level: 4 },
    { name: 'User Research', level: 4 },
    { name: 'SQL & Python', level: 3 },
    { name: 'Figma', level: 4 },
  ],
  projects: [
    { id: 'proj-1', name: 'AI Recommendation Engine', description: 'Built an ML-powered recommendation system that increased conversion by 22%', technologies: 'Python, TensorFlow, AWS', url: '' },
  ],
  certifications: [
    { id: 'cert-1', name: 'Certified Scrum Product Owner', issuer: 'Scrum Alliance', year: '2020' },
  ],
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Intermediate' },
  ],
  achievements: [
    'Winner, TechCrunch Disrupt Hackathon 2022',
    'Published 3 articles on product management in Harvard Business Review',
  ],
  sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'achievements'],
  enabledSections: ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'achievements'],
};

const templates = [
  { id: 'classic', name: 'Classic', category: 'Professional', component: ClassicTemplate },
  { id: 'modern', name: 'Modern', category: 'Two Column', component: ModernTemplate },
  { id: 'creative', name: 'Creative', category: 'Professional', component: CreativeTemplate },
  { id: 'minimal', name: 'Minimal', category: 'Simple', component: MinimalTemplate },
  { id: 'executive', name: 'Executive', category: 'Professional', component: ExecutiveTemplate },
  { id: 'ats', name: 'ATS Optimized', category: 'ATS', component: ATSOptimizedTemplate },
  { id: 'photo-modern', name: 'Photo Modern', category: 'With Photo', component: PhotoModernTemplate },
  { id: 'photo-sidebar', name: 'Photo Sidebar', category: 'With Photo', component: PhotoSidebarTemplate },
  { id: 'photo-bold', name: 'Photo Bold', category: 'With Photo', component: PhotoBoldTemplate },
  { id: 'photo-minimal', name: 'Photo Minimal', category: 'With Photo', component: PhotoMinimalTemplate },
  { id: 'photo-executive', name: 'Photo Executive', category: 'With Photo', component: PhotoExecutiveTemplate },
  { id: 'traditional', name: 'Traditional', category: 'Professional', component: TraditionalTemplate },
  { id: 'prime-ats', name: 'Prime ATS', category: 'ATS', component: PrimeATSTemplate },
  { id: 'clean', name: 'Clean', category: 'Simple', component: CleanTemplate },
  { id: 'corporate', name: 'Corporate', category: 'Professional', component: CorporateTemplate },
  { id: 'elegant', name: 'Elegant', category: 'Professional', component: ElegantTemplate },
  { id: 'bold', name: 'Bold', category: 'Professional', component: BoldTemplate },
  { id: 'industrial', name: 'Industrial', category: 'Two Column', component: IndustrialTemplate },
  { id: 'specialist', name: 'Specialist', category: 'Professional', component: SpecialistTemplate },
  { id: 'two-column', name: 'Two Column', category: 'Two Column', component: TwoColumnTemplate },
];

const PRESET_COLORS = ['#2563EB', '#16A34A', '#DC2626', '#7C3AED', '#F59E0B'];
const FILTER_CATEGORIES = ['All', 'With Photo', 'Two Column', 'ATS', 'Professional', 'Simple'];
const PRIMARY_FONTS = ['Lato', 'Inter', 'DM Sans', 'Roboto', 'Open Sans', 'Merriweather', 'Playfair Display', 'Montserrat'];
const SECONDARY_FONTS = ['PT Serif', 'Georgia', 'Noto Serif', 'Times New Roman', 'Lora', 'Source Sans Pro'];

const TEMPLATE_DEFAULTS = {
  accentColor: '#2563EB',
  fontFamily: 'DM Sans',
  secondaryFont: 'PT Serif',
  fontSize: 'medium',
  lineHeight: 100,
  headerAlignment: 'Left',
  dateAlignment: 'Right',
  locationAlignment: 'Right',
  skillsLayout: 'Inline',
  skillsColumns: 2,
  educationLayout: 'Stacked',
  showSkillLevel: true,
  format: 'A4',
  margins: {
    headerFooter: 0.5,
    topBottom: 1.0,
    leftRight: 1.0,
    betweenSections: 16,
    betweenTitlesContent: 12,
    betweenContentBlocks: 8,
    insideContentBlock: 4
  }
};

export default function CustomizePanel({ resume, updateSettings, switchTemplate }) {
  const [activeTab, setActiveTab] = useState('Template & Colors');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const currentAccent = resume?.accentColor || '#2563EB';
  const customColorInputRef = React.useRef(null);

  const colors = [currentAccent, ...PRESET_COLORS.filter(c => c !== currentAccent)].slice(0, 6);
  if (colors.length < 6) colors.push(PRESET_COLORS[PRESET_COLORS.length - 1]); // Fallback if current is one of presets

  const handleColorSelect = (color) => {
    updateSettings({ accentColor: color });
  };

  const handleCustomColorClick = () => {
    customColorInputRef.current?.click();
  };

  const handleCustomColorChange = (e) => {
    updateSettings({ accentColor: e.target.value });
  };

  const tabs = ['Template & Colors', 'Text', 'Layout'];

  const filteredTemplates = activeFilter === 'All' 
    ? templates 
    : templates.filter(t => t.category === activeFilter);

  const margins = resume?.margins || {
    headerFooter: 0.5,
    topBottom: 1.0,
    leftRight: 1.0,
    betweenSections: 16,
    betweenTitlesContent: 12,
    betweenContentBlocks: 8,
    insideContentBlock: 4
  };

  const updateMargin = (key, value) => {
    updateSettings({ margins: { ...margins, [key]: Number(value) } });
  };

  return (
    <div style={{ 
      background: '#ffffff', 
      color: '#111827', 
      fontFamily: "'Inter', sans-serif",
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #E5E7EB'
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '16px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #2563EB' : '3px solid transparent',
              color: activeTab === tab ? '#111827' : '#9CA3AF',
              fontWeight: activeTab === tab ? '600' : '500',
              fontSize: '15px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
        
        {/* TAB 1: Template & Colors */}
        {activeTab === 'Template & Colors' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              <label style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>Main color</label>
              
              <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#111827', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} color="#ffffff" strokeWidth={3} />
              </button>
              
              {/* Dummy locked colors to match screenshot */}
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '24px 0', marginBottom: '32px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                {FILTER_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '999px',
                      background: '#FFFFFF',
                      color: activeFilter === cat ? '#2563EB' : '#374151',
                      border: activeFilter === cat ? '1px solid #2563EB' : '1px solid #E5E7EB',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '32px 24px' }}>
              {filteredTemplates.map(template => {
                const TemplateComp = template.component;
                const isActive = resume?.templateId === template.id;
                
                return (
                  <div key={template.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827', marginBottom: '12px' }}>
                      {template.name}
                    </div>
                    
                    <div 
                      onClick={() => switchTemplate(template.id)}
                      style={{
                        width: '100%',
                        aspectRatio: '210 / 297',
                        background: '#ffffff',
                        border: isActive ? '3px solid #2563EB' : '1px solid #E5E7EB',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        width: '794px',
                        height: '1123px',
                        transform: 'scale(0.23)',
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}>
                        <Suspense fallback={<TemplateSkeleton />}>
                          <TemplateComp resume={{ ...sampleResume, templateId: template.id, accentColor: currentAccent }} />
                        </Suspense>
                      </div>
                      
                      {isActive && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#2563EB', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                          <Check size={24} color="#ffffff" strokeWidth={3} />
                        </div>
                      )}
                      
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                        <span style={{ background: '#F59E0B', color: '#FFFFFF', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px' }}>PDF</span>
                        <span style={{ background: '#F59E0B', color: '#FFFFFF', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px' }}>DOCX</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Text */}
        {activeTab === 'Text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Google Fonts for preview */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Inter:wght@400;700&family=DM+Sans:wght@400;700&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&family=PT+Serif:wght@400;700&family=Noto+Serif:wght@400;700&family=Lora:wght@400;700&family=Source+Sans+Pro:wght@400;700&display=swap');`}</style>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Primary Font</label>
              <select
                value={resume?.fontFamily || 'Inter'}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#ffffff', fontSize: '14px', color: '#111827', outline: 'none', fontFamily: resume?.fontFamily || 'Inter' }}
              >
                {PRIMARY_FONTS.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
              </select>
              <div style={{ marginTop: '8px', padding: '10px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', fontFamily: resume?.fontFamily || 'Inter', fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                The quick brown fox jumps over the lazy dog.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Secondary Font</label>
              <select
                value={resume?.secondaryFont || 'PT Serif'}
                onChange={(e) => updateSettings({ secondaryFont: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#ffffff', fontSize: '14px', color: '#111827', outline: 'none', fontFamily: resume?.secondaryFont || 'PT Serif' }}
              >
                {SECONDARY_FONTS.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
              </select>
              <div style={{ marginTop: '8px', padding: '10px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', fontFamily: resume?.secondaryFont || 'PT Serif', fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                The quick brown fox jumps over the lazy dog.
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>Line Height</label>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>{resume?.lineHeight || 100}%</span>
              </div>
              <input
                type="range"
                min="80" max="150" step="5"
                value={resume?.lineHeight || 100}
                onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>Font Size</label>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['small', 'medium', 'large'].map((size, idx) => {
                  const labels = ['S', 'M', 'L'];
                  const isActive = (resume?.fontSize || 'medium') === size;
                  return (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: isActive ? '#DBEAFE' : '#ffffff',
                        border: isActive ? '1px solid #2563EB' : '1px solid #E5E7EB',
                        color: isActive ? '#2563EB' : '#4B5563',
                        borderRadius: '6px',
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      {labels[idx]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reset to Defaults */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
              <button
                onClick={() => updateSettings(TEMPLATE_DEFAULTS)}
                style={{
                  width: '100%', padding: '10px 0', background: '#FFF7ED',
                  border: '1px solid #FED7AA', color: '#92400E',
                  borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FFEDD5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFF7ED'; }}
              >
                ↺ Reset All to Default Settings
              </button>
            </div>
          </div>
        )}


        {/* TAB 3: Layout */}
        {activeTab === 'Layout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Format</label>
              <select 
                value={resume?.format || 'A4'}
                onChange={(e) => updateSettings({ format: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#ffffff', fontSize: '14px', color: '#111827', outline: 'none' }}
              >
                <option value="A4">A4 (8.27" x 11.69")</option>
                <option value="Letter">Letter (8.5" x 11")</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' }}>Margins & Paddings</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Header & Footer', key: 'headerFooter', min: 0, max: 1.5, step: 0.1, val: margins.headerFooter, unit: 'in' },
                  { label: 'Top & Bottom', key: 'topBottom', min: 0.5, max: 2, step: 0.1, val: margins.topBottom, unit: 'in' },
                  { label: 'Left & Right', key: 'leftRight', min: 0.5, max: 2, step: 0.1, val: margins.leftRight, unit: 'in' },
                  { label: 'Between sections', key: 'betweenSections', min: 8, max: 40, step: 2, val: margins.betweenSections, unit: 'pt' },
                  { label: 'Between Titles & Content', key: 'betweenTitlesContent', min: 8, max: 40, step: 2, val: margins.betweenTitlesContent, unit: 'pt' },
                  { label: 'Between Content blocks', key: 'betweenContentBlocks', min: 4, max: 24, step: 2, val: margins.betweenContentBlocks, unit: 'pt' },
                  { label: 'Inside content block', key: 'insideContentBlock', min: 2, max: 16, step: 2, val: margins.insideContentBlock, unit: 'pt' },
                ].map((item) => (
                  <div key={item.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#4B5563' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>{item.val} {item.unit}</span>
                    </div>
                    <input 
                      type="range" 
                      min={item.min} max={item.max} step={item.step}
                      value={item.val}
                      onChange={(e) => updateMargin(item.key, e.target.value)}
                      style={{ width: '100%', accentColor: '#2563EB' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>Header Alignment</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Left', 'Center', 'Right'].map(align => {
                  const isActive = (resume?.headerAlignment || 'Left') === align;
                  return (
                    <button
                      key={align}
                      onClick={() => updateSettings({ headerAlignment: align })}
                      style={{
                        flex: 1, padding: '12px 0', background: isActive ? '#DBEAFE' : '#ffffff',
                        border: isActive ? '1px solid #2563EB' : '1px solid #E5E7EB',
                        borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center'
                      }}
                    >
                      {align === 'Left' && <AlignLeft size={20} color={isActive ? '#2563EB' : '#6B7280'} />}
                      {align === 'Center' && <AlignCenter size={20} color={isActive ? '#2563EB' : '#6B7280'} />}
                      {align === 'Right' && <AlignRight size={20} color={isActive ? '#2563EB' : '#6B7280'} />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>Date Alignment</label>
                <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
                  {['Left', 'Right'].map(align => (
                    <button
                      key={align}
                      onClick={() => updateSettings({ dateAlignment: align })}
                      style={{
                        flex: 1, padding: '6px 0', fontSize: '13px', fontWeight: '500',
                        background: (resume?.dateAlignment || 'Right') === align ? '#ffffff' : 'transparent',
                        color: (resume?.dateAlignment || 'Right') === align ? '#111827' : '#6B7280',
                        border: 'none', borderRadius: '4px', cursor: 'pointer',
                        boxShadow: (resume?.dateAlignment || 'Right') === align ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>Location Alignment</label>
                <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
                  {['Left', 'Right'].map(align => (
                    <button
                      key={align}
                      onClick={() => updateSettings({ locationAlignment: align })}
                      style={{
                        flex: 1, padding: '6px 0', fontSize: '13px', fontWeight: '500',
                        background: (resume?.locationAlignment || 'Right') === align ? '#ffffff' : 'transparent',
                        color: (resume?.locationAlignment || 'Right') === align ? '#111827' : '#6B7280',
                        border: 'none', borderRadius: '4px', cursor: 'pointer',
                        boxShadow: (resume?.locationAlignment || 'Right') === align ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>Skills Layout</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {['Inline', 'Columns'].map(layout => {
                  const isActive = (resume?.skillsLayout || 'Inline') === layout;
                  return (
                    <button
                      key={layout}
                      onClick={() => updateSettings({ skillsLayout: layout })}
                      style={{
                        flex: 1, padding: '10px 0', background: isActive ? '#DBEAFE' : '#ffffff',
                        border: isActive ? '1px solid #2563EB' : '1px solid #E5E7EB',
                        color: isActive ? '#2563EB' : '#4B5563', borderRadius: '6px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: '500'
                      }}
                    >
                      {layout === 'Inline' ? <List size={16} /> : <Layout size={16} />}
                      {layout}
                    </button>
                  )
                })}
              </div>
              {(resume?.skillsLayout === 'Columns') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#4B5563' }}>Columns</span>
                  <input 
                    type="number" min="2" max="4" 
                    value={resume?.skillsColumns || 2}
                    onChange={(e) => updateSettings({ skillsColumns: Number(e.target.value) })}
                    style={{ width: '60px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #E5E7EB', fontSize: '13px' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>Education Layout</label>
              <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
                {['Stacked', 'Inline'].map(layout => (
                  <button
                    key={layout}
                    onClick={() => updateSettings({ educationLayout: layout })}
                    style={{
                      flex: 1, padding: '6px 0', fontSize: '13px', fontWeight: '500',
                      background: (resume?.educationLayout || 'Stacked') === layout ? '#ffffff' : 'transparent',
                      color: (resume?.educationLayout || 'Stacked') === layout ? '#111827' : '#6B7280',
                      border: 'none', borderRadius: '4px', cursor: 'pointer',
                      boxShadow: (resume?.educationLayout || 'Stacked') === layout ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Show skill level</span>
              <button
                onClick={() => updateSettings({ showSkillLevel: !(resume?.showSkillLevel ?? true) })}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
              >
                {(resume?.showSkillLevel ?? true) ? (
                  <ToggleRight size={32} color="#2563EB" strokeWidth={1.5} />
                ) : (
                  <ToggleLeft size={32} color="#9CA3AF" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
