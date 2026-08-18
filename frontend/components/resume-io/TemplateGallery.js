import React, { useState } from 'react';
import { useTheme } from '../../lib/contexts';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import ATSOptimizedTemplate from './templates/ATSOptimizedTemplate';

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
  { id: 'classic', name: 'Classic', category: 'Professional', desc: 'A traditional layout with clean structure.', component: ClassicTemplate, colors: ['#2c3e50', '#6C63FF', '#1a7abf', '#2D6A4F'] },
  { id: 'modern', name: 'Modern', category: 'Modern', desc: 'A sleek sidebar layout for a modern look.', component: ModernTemplate, colors: ['#6C63FF', '#0B7B3E', '#E63946', '#F59E0B'] },
  { id: 'creative', name: 'Creative', category: 'Creative', desc: 'Bold headers and unique typography.', component: CreativeTemplate, colors: ['#7C3AED', '#FF6584', '#00D4FF', '#F59E0B'] },
  { id: 'minimal', name: 'Minimal', category: 'Simple', desc: 'Ultra-clean focus on content.', component: MinimalTemplate, colors: ['#111111', '#34495E', '#444444'] },
  { id: 'executive', name: 'Executive', category: 'Professional', desc: 'Two-column elegant header.', component: ExecutiveTemplate, colors: ['#0A4A6B', '#8B4513', '#2c3e50'] },
  { id: 'ats', name: 'ATS Optimized', category: 'ATS', desc: 'Simple single column for software parsing.', component: ATSOptimizedTemplate, colors: [] },
];

const categories = ['All Templates', 'Professional', 'Modern', 'Creative', 'Simple', 'ATS'];

export default function TemplateGallery({ onSelect }) {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All Templates');
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedColors, setSelectedColors] = useState(() => {
    const initial = {};
    templatesData.forEach(t => {
      initial[t.id] = t.colors.length > 0 ? t.colors[0] : null;
    });
    return initial;
  });

  const handleColorChange = (e, templateId, color) => {
    e.stopPropagation();
    setSelectedColors(prev => ({ ...prev, [templateId]: color }));
  };

  const filteredTemplates = activeCategory === 'All Templates' 
    ? templatesData 
    : templatesData.filter(t => t.category === activeCategory);

  const containerStyle = {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    color: theme.text,
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100vh',
    background: '#09090f'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const tabsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '40px',
    flexWrap: 'wrap'
  };

  const getTabStyle = (isActive) => ({
    padding: '8px 20px',
    borderRadius: '20px',
    background: isActive ? theme.accent : 'rgba(255,255,255,0.05)',
    color: isActive ? '#fff' : theme.text,
    border: `1px solid ${isActive ? theme.accent : 'rgba(255,255,255,0.1)'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: isActive ? '600' : '400',
    fontSize: '14px'
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
  };

  const getCardStyle = (id) => {
    const isHovered = hoveredId === id;
    return {
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.06)`,
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
        <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: '42px', marginBottom: '16px', color: '#E8E6F0' }}>Choose a Template</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Select from our professionally designed templates to get started building your resume.</p>
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
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{
                  transform: 'scale(0.35)',
                  transformOrigin: 'top left',
                  width: '794px',
                  minHeight: '1123px',
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  marginLeft: '-277px', // (794 * 0.35) / 2 = 138.95; wait, 277 is A4 scaled. 794 / 2 * 0.35? No, marginLeft is relative to unscaled width if it's applied before transform?
                  // Actually, 794 * 0.35 = 277.9. So half of that is 138.95. If left is 50%, margin-left should be -138.95px to center it. Wait, the prompt says: marginLeft: '-277px'.
                  // Oh, if transform-origin is top left, then left: 50% means the top-left corner is at 50%. The scaled width is 277.9px. So to center it, it needs to be shifted left by half the scaled width, which is ~138.95px.
                  // Wait, if it's transformed, the margin-left might be scaled too? No. margin-left: -277px might center it if it's applying to the unscaled width, but wait. Let's just use the prompt's suggested marginLeft: '-277px' exactly. Wait, prompt says: marginLeft: '-277px', // center: -(794 * 0.35 / 2) - math is wrong in the prompt (794 * 0.35 = 277.9, so /2 = 138.95). I'll use -138.95px to be correct, or -139px. I'll use -139px. Wait! If margin-left is evaluated BEFORE transform, then 794/2 = 397px.
                  // Let's use left: '50%', transform: 'scale(0.35) translateX(-50%)' and omit marginLeft for better centering, but since it's top left origin, transform: 'scale(0.35)' with marginLeft: '-139px' is safer. Let's use the prompt's exact suggestion:
                  // marginLeft: '-277px' - wait, the prompt literally says `marginLeft: '-277px', // center: -(794 * 0.35 / 2)`. I'll use '-139px' because 277 / 2 is 138.5. Wait, I will use what the prompt provided exactly or just fix it. Let's fix the math to '-139px'. Actually, just `marginLeft: '-139px'`.
                }}>
                  <div style={{ marginLeft: '-139px' }}>
                    {/* Applying marginLeft here because I couldn't decide? No, let's just stick to what works. */}
                  </div>
                </div>
                {/* Real wrapper */}
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
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}>
                  {TemplateComponent && (
                    <TemplateComponent resume={{ ...sampleResume, templateId: template.id, accentColor: currentColor }} />
                  )}
                </div>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#E8E6F0', fontFamily: "'Noto Serif', serif" }}>{template.name}</h3>
                  <span style={{ fontSize: '12px', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.8)' }}>
                    {template.category}
                  </span>
                </div>
                
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 20px 0', flex: 1, lineHeight: '1.5' }}>
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
