import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

const PhotoMinimalTemplate = ({ resume }) => {
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
    sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills'],
    enabledSections = ['personal', 'summary', 'experience', 'education', 'skills']
  } = resume || {};

  const sizes = fontSizes[fontSize] || fontSizes.medium;
  const spaces = spacings[spacing] || spacings.normal;

  const renderPhoto = (photo, name, size = 60) => {
    const style = { width: size, height: size, borderRadius: '50%', objectFit: 'cover' };
    if (photo) {
      return <img src={photo} alt={name} style={style} />;
    }
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div style={{ ...style, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: size * 0.4, fontWeight: 'bold' }}>
        {initials}
      </div>
    );
  };

  const isEnabled = (sec) => enabledSections.includes(sec);

  return (
    <div style={{ 
      width: '794px', minHeight: '1123px', background: 'white', color: '#444', 
      fontFamily, lineHeight: spaces.line, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '60px' 
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: spaces.section }}>
        {renderPhoto(personal.photo, personal.name, 70)}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: sizes.name, fontWeight: '300', margin: '0 0 5px 0', color: '#111', letterSpacing: '1px' }}>{personal.name}</h1>
          <h2 style={{ fontSize: sizes.title, margin: 0, fontWeight: '400', color: '#666' }}>{personal.title}</h2>
        </div>
        <div style={{ textAlign: 'right', fontSize: sizes.small, color: '#777', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.linkedin && <div>{personal.linkedin}</div>}
        </div>
      </div>

      {/* SINGLE COLUMN BODY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.section }}>
        {sectionOrder.map(sectionId => {
          if (!isEnabled(sectionId)) return null;

          if (sectionId === 'summary' && summary) {
            return (
              <div key="summary">
                <h3 style={{ fontSize: sizes.heading, color: '#333', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: spaces.item, fontWeight: '400' }}>Profile</h3>
                <p style={{ fontSize: sizes.body, margin: 0, color: '#555' }}>{summary}</p>
              </div>
            );
          }

          if (sectionId === 'experience' && experience && experience.length > 0) {
            return (
              <div key="experience">
                <h3 style={{ fontSize: sizes.heading, color: '#333', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: spaces.item, fontWeight: '400' }}>Experience</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {experience.map(exp => (
                    <div key={exp.id} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: sizes.body, color: '#222' }}>{exp.title}</strong>
                        <span style={{ fontSize: sizes.small, color: '#888' }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div style={{ fontSize: sizes.small, color: '#666', fontStyle: 'italic', marginBottom: '6px' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: sizes.body, color: '#555' }}>
                          {exp.bullets.map((b, i) => b ? <li key={i} style={{marginBottom: '4px'}}>{b}</li> : null)}
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
                <h3 style={{ fontSize: sizes.heading, color: '#333', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: spaces.item, fontWeight: '400' }}>Education</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {education.map(edu => (
                    <div key={edu.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: sizes.body, color: '#222' }}>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                        <span style={{ fontSize: sizes.small, color: '#888' }}>{edu.year}</span>
                      </div>
                      <div style={{ fontSize: sizes.small, color: '#666' }}>{edu.institution} {edu.grade && `| ${edu.grade}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (sectionId === 'skills' && skills && skills.length > 0) {
            return (
              <div key="skills">
                <h3 style={{ fontSize: sizes.heading, color: '#333', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: spaces.item, fontWeight: '400' }}>Skills</h3>
                <div style={{ fontSize: sizes.body, color: '#555' }}>
                  {skills.map(s => s.name).join(' • ')}
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

export default PhotoMinimalTemplate;
