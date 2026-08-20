import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

const PhotoBoldTemplate = ({ resume }) => {
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
    certifications = [],
    sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills'],
    enabledSections = ['personal', 'summary', 'experience', 'education', 'skills']
  } = resume || {};

  const sizes = fontSizes[fontSize] || fontSizes.medium;
  const spaces = spacings[spacing] || spacings.normal;

  const renderPhoto = (photo, name, size = 100) => {
    const style = { width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
    if (photo) {
      return <img src={photo} alt={name} style={style} />;
    }
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div style={{ ...style, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size * 0.35, fontWeight: 'bold' }}>
        {initials}
      </div>
    );
  };

  const isEnabled = (sec) => enabledSections.includes(sec);

  return (
    <div style={{ 
      width: '794px', minHeight: '1123px', background: 'white', color: '#333', 
      fontFamily, lineHeight: spaces.line, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' 
    }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #1a1a2e 100%)`, color: 'white', padding: '40px', display: 'flex', gap: '30px', alignItems: 'center' }}>
        {renderPhoto(personal.photo, personal.name, 120)}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: sizes.name, fontWeight: 'bold', margin: '0 0 5px 0' }}>{personal.name}</h1>
          <h2 style={{ fontSize: sizes.title, margin: '0 0 15px 0', fontWeight: '500', opacity: 0.9 }}>{personal.title}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: sizes.small, opacity: 0.8 }}>
            {personal.email && <span>✉ {personal.email}</span>}
            {personal.phone && <span>☏ {personal.phone}</span>}
            {personal.location && <span>⚲ {personal.location}</span>}
            {personal.linkedin && <span>in/ {personal.linkedin.split('/').pop()}</span>}
          </div>
        </div>
      </div>

      {/* BODY (Two Equal Columns) */}
      <div style={{ display: 'flex', padding: '30px', gap: '40px', flex: 1 }}>
        
        {/* LEFT COLUMN */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: spaces.section }}>
          {isEnabled('summary') && summary && (
            <div>
              <h3 style={{ fontSize: sizes.heading, color: accentColor, borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase', fontWeight: 'bold' }}>About Me</h3>
              <p style={{ fontSize: sizes.body, margin: 0 }}>{summary}</p>
            </div>
          )}

          {isEnabled('experience') && experience && experience.length > 0 && (
            <div>
              <h3 style={{ fontSize: sizes.heading, color: accentColor, borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase', fontWeight: 'bold' }}>Experience</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div style={{ fontSize: sizes.body, fontWeight: 'bold' }}>{exp.title}</div>
                    <div style={{ fontSize: sizes.small, color: accentColor, fontWeight: '500', margin: '2px 0' }}>
                      {exp.company} | {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '18px', fontSize: sizes.small }}>
                        {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: spaces.section }}>
          {isEnabled('education') && education && education.length > 0 && (
            <div>
              <h3 style={{ fontSize: sizes.heading, color: accentColor, borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase', fontWeight: 'bold' }}>Education</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                {education.map(edu => (
                  <div key={edu.id}>
                    <div style={{ fontSize: sizes.body, fontWeight: 'bold' }}>{edu.degree} {edu.field && `in ${edu.field}`}</div>
                    <div style={{ fontSize: sizes.small, color: '#555', margin: '2px 0' }}>{edu.institution}</div>
                    <div style={{ fontSize: sizes.small, color: '#888' }}>{edu.year} {edu.grade && `| ${edu.grade}`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEnabled('skills') && skills && skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: sizes.heading, color: accentColor, borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase', fontWeight: 'bold' }}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skills.map((skill, i) => (
                  <span key={i} style={{ fontSize: sizes.small, backgroundColor: `${accentColor}15`, color: accentColor, padding: '4px 10px', borderRadius: '15px', fontWeight: '500' }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isEnabled('certifications') && certifications && certifications.length > 0 && (
            <div>
              <h3 style={{ fontSize: sizes.heading, color: accentColor, borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase', fontWeight: 'bold' }}>Certifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {certifications.map(cert => (
                  <div key={cert.id} style={{ fontSize: sizes.small }}>
                    <span style={{ fontWeight: 'bold' }}>{cert.name}</span> - {cert.issuer} ({cert.year})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoBoldTemplate;
