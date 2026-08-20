import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

const PhotoSidebarTemplate = ({ resume }) => {
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
    sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills'],
    enabledSections = ['personal', 'summary', 'experience', 'education', 'skills']
  } = resume || {};

  const sizes = fontSizes[fontSize] || fontSizes.medium;
  const spaces = spacings[spacing] || spacings.normal;

  const renderPhoto = (photo, name, size = 120) => {
    const style = { width: size, height: size, borderRadius: '12px', objectFit: 'cover' };
    if (photo) {
      return <img src={photo} alt={name} style={style} />;
    }
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div style={{ ...style, background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size * 0.35, fontWeight: 'bold' }}>
        {initials}
      </div>
    );
  };

  const isEnabled = (sec) => enabledSections.includes(sec);

  return (
    <div style={{ 
      width: '794px', minHeight: '1123px', background: 'white', color: '#222', 
      fontFamily, lineHeight: spaces.line, display: 'flex', flexDirection: 'row', boxSizing: 'border-box' 
    }}>
      {/* NARROW SIDEBAR */}
      <div style={{ width: '25%', backgroundColor: '#1a1a2e', color: '#e0e0e0', padding: '30px 15px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: spaces.section }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spaces.item }}>
          {renderPhoto(personal.photo, personal.name, 120)}
        </div>
        
        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: sizes.small, wordBreak: 'break-word' }}>
          {personal.email && <div><strong style={{color: accentColor, display: 'block'}}>EMAIL</strong>{personal.email}</div>}
          {personal.phone && <div><strong style={{color: accentColor, display: 'block'}}>PHONE</strong>{personal.phone}</div>}
          {personal.location && <div><strong style={{color: accentColor, display: 'block'}}>LOCATION</strong>{personal.location}</div>}
          {personal.linkedin && <div><strong style={{color: accentColor, display: 'block'}}>LINKEDIN</strong>{personal.linkedin}</div>}
          {personal.website && <div><strong style={{color: accentColor, display: 'block'}}>WEBSITE</strong>{personal.website}</div>}
        </div>

        {/* Skills */}
        {isEnabled('skills') && skills && skills.length > 0 && (
          <div>
            <h3 style={{ fontSize: sizes.heading, color: 'white', borderBottom: `1px solid ${accentColor}`, paddingBottom: '4px', marginBottom: spaces.item }}>SKILLS</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.map((skill, i) => (
                <span key={i} style={{ fontSize: sizes.small, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {isEnabled('languages') && languages && languages.length > 0 && (
          <div>
            <h3 style={{ fontSize: sizes.heading, color: 'white', borderBottom: `1px solid ${accentColor}`, paddingBottom: '4px', marginBottom: spaces.item }}>LANGUAGES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {languages.map((lang, i) => (
                <div key={i} style={{ fontSize: sizes.small }}>
                  <strong style={{display: 'block'}}>{lang.name}</strong>
                  <span style={{ opacity: 0.7 }}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN AREA */}
      <div style={{ width: '75%', padding: '40px 30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: spaces.section }}>
        <div style={{ borderBottom: `3px solid ${accentColor}`, paddingBottom: '15px', marginBottom: '10px' }}>
          <h1 style={{ fontSize: sizes.name, fontWeight: '800', margin: '0 0 5px 0', color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: '1px' }}>{personal.name}</h1>
          <h2 style={{ fontSize: sizes.title, color: accentColor, margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>{personal.title}</h2>
        </div>

        {sectionOrder.map(sectionId => {
          if (!isEnabled(sectionId)) return null;

          if (sectionId === 'summary' && summary) {
            return (
              <div key="summary">
                <p style={{ fontSize: sizes.body, margin: 0 }}>{summary}</p>
              </div>
            );
          }

          if (sectionId === 'experience' && experience && experience.length > 0) {
            return (
              <div key="experience">
                <h3 style={{ fontSize: sizes.heading, color: '#1a1a2e', textTransform: 'uppercase', marginBottom: spaces.item, fontWeight: 'bold' }}>Professional Experience</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: sizes.body, color: accentColor }}>{exp.title}</strong>
                        <span style={{ fontSize: sizes.small, color: '#666', fontWeight: 'bold' }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div style={{ fontSize: sizes.small, fontWeight: '600', color: '#333', marginBottom: '4px' }}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: sizes.body }}>
                          {exp.bullets.map((b, i) => b ? <li key={i} style={{marginBottom: '3px'}}>{b}</li> : null)}
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
                <h3 style={{ fontSize: sizes.heading, color: '#1a1a2e', textTransform: 'uppercase', marginBottom: spaces.item, fontWeight: 'bold' }}>Education</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {education.map(edu => (
                    <div key={edu.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: sizes.body }}>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                        <span style={{ fontSize: sizes.small, color: '#666', fontWeight: 'bold' }}>{edu.year}</span>
                      </div>
                      <div style={{ fontSize: sizes.small, color: '#444' }}>{edu.institution} {edu.grade && `| ${edu.grade}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (sectionId === 'achievements' && achievements && achievements.length > 0) {
            return (
              <div key="achievements">
                <h3 style={{ fontSize: sizes.heading, color: '#1a1a2e', textTransform: 'uppercase', marginBottom: spaces.item, fontWeight: 'bold' }}>Achievements</h3>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: sizes.body }}>
                  {achievements.map((ach, i) => ach ? <li key={i} style={{marginBottom: '4px'}}>{ach}</li> : null)}
                </ul>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

export default PhotoSidebarTemplate;
