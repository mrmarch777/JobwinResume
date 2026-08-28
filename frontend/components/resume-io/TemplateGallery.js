import React, { useState } from 'react';
import { useTheme } from '../../lib/contexts';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import ATSOptimizedTemplate from './templates/ATSOptimizedTemplate';
import PhotoModernTemplate from './templates/PhotoModernTemplate';
import PhotoSidebarTemplate from './templates/PhotoSidebarTemplate';
import PhotoBoldTemplate from './templates/PhotoBoldTemplate';
import PhotoMinimalTemplate from './templates/PhotoMinimalTemplate';
import PhotoExecutiveTemplate from './templates/PhotoExecutiveTemplate';
import TraditionalTemplate from './templates/TraditionalTemplate';
import PrimeATSTemplate from './templates/PrimeATSTemplate';
import CleanTemplate from './templates/CleanTemplate';
import CorporateTemplate from './templates/CorporateTemplate';
import ElegantTemplate from './templates/ElegantTemplate';
import BoldTemplate from './templates/BoldTemplate';
import IndustrialTemplate from './templates/IndustrialTemplate';
import SpecialistTemplate from './templates/SpecialistTemplate';
import TwoColumnTemplate from './templates/TwoColumnTemplate';

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

const templatesData = [
  // Original 6
  { id: 'classic', name: 'Classic', category: 'Professional', desc: 'Classically structured for a robust career history.', component: ClassicTemplate, colors: ['#2c3e50','#6C63FF','#1a7abf','#2D6A4F'] },
  { id: 'modern', name: 'Modern', category: 'Modern', desc: 'A sleek sidebar layout for a modern look.', component: ModernTemplate, colors: ['#6C63FF','#0B7B3E','#E63946','#F59E0B'] },
  { id: 'creative', name: 'Creative', category: 'Creative', desc: 'Bold headers and unique typography.', component: CreativeTemplate, colors: ['#7C3AED','#FF6584','#00D4FF','#F59E0B'] },
  { id: 'minimal', name: 'Minimal', category: 'Simple', desc: 'Ultra-clean focus on content.', component: MinimalTemplate, colors: ['#111111','#34495E','#444444'] },
  { id: 'executive', name: 'Executive', category: 'Professional', desc: 'Two-column elegant header.', component: ExecutiveTemplate, colors: ['#0A4A6B','#8B4513','#2c3e50'] },
  { id: 'ats', name: 'ATS Optimized', category: 'ATS', ats: true, desc: 'Simple single column for software parsing.', component: ATSOptimizedTemplate, colors: [] },
  // Photo templates (5)
  { id: 'photo-modern', name: 'Photo Modern', category: 'With Photo', desc: 'Modern sidebar with your professional photo.', component: PhotoModernTemplate, colors: ['#6C63FF','#0B7B3E','#E63946','#2c3e50'] },
  { id: 'photo-sidebar', name: 'Photo Sidebar', category: 'With Photo', desc: 'Dark sidebar with square photo placement.', component: PhotoSidebarTemplate, colors: ['#1a1a2e','#2c3e50','#0A4A6B'] },
  { id: 'photo-bold', name: 'Photo Bold', category: 'With Photo', desc: 'Full-width header with centered photo.', component: PhotoBoldTemplate, colors: ['#6C63FF','#E63946','#7C3AED','#0B7B3E'] },
  { id: 'photo-minimal', name: 'Photo Minimal', category: 'With Photo', desc: 'Clean layout with a small profile photo.', component: PhotoMinimalTemplate, colors: ['#111111','#34495E','#2D6A4F'] },
  { id: 'photo-executive', name: 'Photo Executive', category: 'With Photo', desc: 'Elegant executive style with headshot.', component: PhotoExecutiveTemplate, colors: ['#0A4A6B','#8B4513','#2c3e50'] },
  // Standard templates (9)
  { id: 'traditional', name: 'Traditional', category: 'Professional', desc: 'Conservative layout for traditional industries.', component: TraditionalTemplate, colors: ['#111111','#2c3e50','#8B4513'] },
  { id: 'prime-ats', name: 'Prime ATS', category: 'ATS', ats: true, desc: 'Streamlined for maximum ATS compatibility.', component: PrimeATSTemplate, colors: [] },
  { id: 'clean', name: 'Clean', category: 'Simple', desc: 'Modern and clean with bold section dividers.', component: CleanTemplate, colors: ['#6C63FF','#0B7B3E','#E63946','#F59E0B'] },
  { id: 'corporate', name: 'Corporate', category: 'Professional', desc: 'Business-formal for corporate environments.', component: CorporateTemplate, colors: ['#2c3e50','#0A4A6B','#34495E'] },
  { id: 'elegant', name: 'Elegant', category: 'Creative', desc: 'Refined and sophisticated design.', component: ElegantTemplate, colors: ['#6C63FF','#8B4513','#7C3AED','#E63946'] },
  { id: 'bold', name: 'Bold', category: 'Creative', desc: 'Strong typography and high impact.', component: BoldTemplate, colors: ['#E63946','#6C63FF','#0B7B3E','#F59E0B'] },
  { id: 'industrial', name: 'Industrial', category: 'Modern', desc: 'Structured grid layout with technical feel.', component: IndustrialTemplate, colors: ['#1a1a2e','#2c3e50','#34495E'] },
  { id: 'specialist', name: 'Specialist', category: 'Professional', desc: 'Skills-focused layout for technical roles.', component: SpecialistTemplate, colors: ['#6C63FF','#0B7B3E','#E63946'] },
  { id: 'two-column', name: 'Two Column', category: 'Modern', desc: 'Balanced two-column professional layout.', component: TwoColumnTemplate, colors: ['#6C63FF','#2c3e50','#0A4A6B','#7C3AED'] },
];

const categories = ['All Templates', 'Professional', 'Modern', 'Creative', 'Simple', 'ATS', 'With Photo'];

// Per-template error boundary — prevents one bad template from crashing the entire gallery
class TemplateThumbnail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '400px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#F9FAFB', color: '#9CA3AF', fontSize: '13px',
        }}>
          Preview unavailable
        </div>
      );
    }
    const { TemplateComponent, template, currentColor } = this.props;
    if (!TemplateComponent) return null;
    return (
      <div style={{
        transform: 'scale(0.35)',
        transformOrigin: 'top left',
        width: '794px',
        minHeight: '1123px',
        position: 'absolute',
        top: '0',
        left: '50%',
        marginLeft: '-139px',
        background: '#fff',
      }}>
        <TemplateComponent resume={{ ...sampleResume, templateId: template.id, accentColor: currentColor || sampleResume.accentColor }} />
      </div>
    );
  }
}

export default function TemplateGallery({ onSelect, onBack }) {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All Templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedColors, setSelectedColors] = useState(() => {
    const initial = {};
    templatesData.forEach(t => { initial[t.id] = t.colors.length > 0 ? t.colors[0] : null; });
    return initial;
  });

  const handleColorChange = (e, templateId, color) => {
    e.stopPropagation();
    setSelectedColors(prev => ({ ...prev, [templateId]: color }));
  };

  const filteredTemplates = templatesData.filter(t => {
    const matchCategory = activeCategory === 'All Templates' || t.category === activeCategory;
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const containerStyle = {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
    position: 'relative'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px',
    position: 'relative'
  };

  const backButtonStyle = {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: 'var(--theme-text)',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
  };

  const tabsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '40px',
    flexWrap: 'wrap'
  };

  const getTabStyle = (isActive) => ({
    padding: '10px 24px',
    borderRadius: '30px',
    background: isActive ? theme.accent : 'transparent',
    color: isActive ? '#fff' : theme.text,
    border: `1px solid ${isActive ? theme.accent : 'rgba(255,255,255,0.1)'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: isActive ? '600' : '400',
    fontSize: '14px'
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  };

  const getCardStyle = (id) => {
    const isHovered = hoveredId === id;
    return {
      background: 'var(--theme-card)',
      border: `1px solid var(--theme-border)`,
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'none',
      boxShadow: isHovered ? `0 15px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(108, 99, 255, 0.2)` : 'none',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    };
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        {onBack && (
          <button style={backButtonStyle} onClick={onBack}>
            ← Back
          </button>
        )}
        <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: '42px', marginBottom: '16px', color: 'var(--theme-text)' }}>Choose a Template</h1>
        <p style={{ color: 'var(--theme-muted, rgba(255,255,255,0.6))', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Select from our professionally designed templates to get started.</p>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            style={{
              width: '100%', padding: '10px 14px 10px 40px',
              borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)', color: 'var(--theme-text, #fff)',
              fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={tabsStyle}>
        {categories.map(cat => (
          <button
            key={cat}
            style={getTabStyle(activeCategory === cat)}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={gridStyle}>
        {filteredTemplates.map(template => {
          const TemplateComponent = template.component;
          const currentColor = selectedColors[template.id] || null;
          const isHovered = hoveredId === template.id;

          return (
            <div 
              key={template.id} 
              style={getCardStyle(template.id)}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(template.id, currentColor)}
            >
              <div style={{ 
                width: '100%', 
                height: '400px', 
                overflow: 'hidden', 
                position: 'relative',
                background: '#fff',
                borderBottom: '1px solid var(--theme-border)'
              }}>
                {/* Scaled template preview — each wrapped in its own try/catch */}
                <TemplateThumbnail
                  TemplateComponent={TemplateComponent}
                  template={template}
                  currentColor={currentColor}
                />

                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(9, 9, 15, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(2px)',
                    transition: 'all 0.3s ease'
                  }}>
                    <button style={{
                      padding: '12px 24px',
                      background: theme.accent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
                      transition: 'transform 0.2s ease',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Use This Template
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'var(--theme-text)', fontFamily: "'Noto Serif', serif" }}>{template.name}</h3>
                    {template.ats && (
                      <span style={{ fontSize: '10px', padding: '2px 7px', background: '#DCFCE7', color: '#16A34A', borderRadius: '10px', fontWeight: '700', letterSpacing: '0.3px' }}>ATS ✓</span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.8)', flexShrink: 0 }}>
                    {template.category}
                  </span>
                </div>
                
                <p style={{ color: 'var(--theme-muted)', fontSize: '14px', margin: '0 0 20px 0', flex: 1, lineHeight: '1.5' }}>
                  {template.desc}
                </p>

                {template.colors && template.colors.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {template.colors.map(color => (
                      <div
                        key={color}
                        onClick={(e) => handleColorChange(e, template.id, color)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: color,
                          cursor: 'pointer',
                          border: currentColor === color ? '2px solid #fff' : '2px solid transparent',
                          boxShadow: currentColor === color ? `0 0 0 1px ${color}` : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
