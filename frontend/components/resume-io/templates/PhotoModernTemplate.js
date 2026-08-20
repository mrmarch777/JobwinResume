import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

const PhotoModernTemplate = ({ resume }) => {
  const {
    accentColor = '#6C63FF',
    fontFamily = 'DM Sans',
    fontSize = 'medium',
    spacing = 'normal',
    personal = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    achievements = [],
    customSections = [],
    sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills'],
    enabledSections = ['personal', 'summary', 'experience', 'education', 'skills']
  } = resume || {};

  const sizes = fontSizes[fontSize] || fontSizes.medium;
  const spaces = spacings[spacing] || spacings.normal;

  const renderPhoto = (photo, name, size = 120) => {
    if (photo) {
      return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />;
    }
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size * 0.35, fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.3)' }}>
        {initials}
      </div>
    );
  };

  const isEnabled = (sec) => enabledSections.includes(sec);

  return (
    <div style={{ 
      width: '794px', minHeight: '1123px', background: 'white', color: '#333', 
      fontFamily, lineHeight: spaces.line, display: 'flex', flexDirection: 'row', boxSizing: 'border-box' 
    }}>
      {/* LEFT SIDEBAR */}
      <div style={{ width: '30%', backgroundColor: accentColor, color: 'white', padding: '30px 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: spaces.section }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spaces.item }}>
          {renderPhoto(personal.photo, personal.name, 140)}
        </div>
        
        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item, fontSize: sizes.body }}>
          {personal.email && <div>📧 {personal.email}</div>}
          {personal.phone && <div>📱 {personal.phone}</div>}
          {personal.location && <div>📍 {personal.location}</div>}
          {personal.linkedin && <div>💼 {personal.linkedin}</div>}
          {personal.website && <div>🔗 {personal.website}</div>}
        </div>

        {/* Skills */}
        {isEnabled('skills') && skills && skills.length > 0 && (
          <div>
            <h3 style={{ fontSize: sizes.heading, borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px', marginBottom: spaces.item }}>SKILLS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {skills.map((skill, i) => (
                <div key={i} style={{ fontSize: sizes.body }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>{skill.name}</span>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.2)', height: '4px', borderRadius: '2px' }}>
                    <div style={{ width: `${(skill.level / 5) * 100}%`, background: 'white', height: '100%', borderRadius: '2px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {isEnabled('languages') && languages && languages.length > 0 && (
          <div>
            <h3 style={{ fontSize: sizes.heading, borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px', marginBottom: spaces.item }}>LANGUAGES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {languages.map((lang, i) => (
                <div key={i} style={{ fontSize: sizes.body, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{lang.name}</span>
                  <span style={{ opacity: 0.8 }}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN AREA */}
      <div style={{ width: '70%', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: spaces.section }}>
        <div>
          <h1 style={{ fontSize: sizes.name, fontWeight: 'bold', margin: '0 0 5px 0', color: '#111' }}>{personal.name}</h1>
          <h2 style={{ fontSize: sizes.title, color: accentColor, margin: 0, fontWeight: '500' }}>{personal.title}</h2>
        </div>

        {sectionOrder.map(sectionId => {
          if (!isEnabled(sectionId)) return null;

          if (sectionId === 'summary' && summary) {
            return (
              <div key="summary">
                <h3 style={{ fontSize: sizes.heading, color: accentColor, textTransform: 'uppercase', marginBottom: spaces.item, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', fontWeight: 'bold' }}>Profile</h3>
                <p style={{ fontSize: sizes.body, margin: 0 }}>{summary}</p>
              </div>
            );
          }

          if (sectionId === 'experience' && experience && experience.length > 0) {
            return (
              <div key="experience">
                <h3 style={{ fontSize: sizes.heading, color: accentColor, textTransform: 'uppercase', marginBottom: spaces.item, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', fontWeight: 'bold' }}>Experience</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: sizes.body }}>{exp.title}</strong>
                        <span style={{ fontSize: sizes.small, color: '#666' }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div style={{ fontSize: sizes.small, fontWeight: '500', color: '#444', marginBottom: '4px' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: sizes.body }}>
                          {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (sectionId === 'education' && education && education.length > 0) {
            return (
              <div key="education">
                <h3 style={{ fontSize: sizes.heading, color: accentColor, textTransform: 'uppercase', marginBottom: spaces.item, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', fontWeight: 'bold' }}>Education</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {education.map(edu => (
                    <div key={edu.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: sizes.body }}>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                        <span style={{ fontSize: sizes.small, color: '#666' }}>{edu.year}</span>
                      </div>
                      <div style={{ fontSize: sizes.small, color: '#444' }}>{edu.institution} {edu.grade && `| ${edu.grade}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (sectionId === 'certifications' && certifications && certifications.length > 0) {
            return (
              <div key="certifications">
                <h3 style={{ fontSize: sizes.heading, color: accentColor, textTransform: 'uppercase', marginBottom: spaces.item, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', fontWeight: 'bold' }}>Certifications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {certifications.map(cert => (
                    <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: sizes.body }}>
                      <span><strong>{cert.name}</strong> ({cert.issuer})</span>
                      <span style={{ fontSize: sizes.small, color: '#666' }}>{cert.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (sectionId === 'projects' && projects && projects.length > 0) {
            return (
              <div key="projects">
                <h3 style={{ fontSize: sizes.heading, color: accentColor, textTransform: 'uppercase', marginBottom: spaces.item, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', fontWeight: 'bold' }}>Projects</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {projects.map(proj => (
                    <div key={proj.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: sizes.body }}>{proj.name}</strong>
                        {proj.url && <a href={proj.url} style={{ fontSize: sizes.small, color: accentColor }}>{proj.url}</a>}
                      </div>
                      {proj.technologies && <div style={{ fontSize: sizes.small, color: '#555', fontStyle: 'italic', marginBottom: '2px' }}>{proj.technologies}</div>}
                      {proj.description && <p style={{ margin: 0, fontSize: sizes.body }}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

export default PhotoModernTemplate;
