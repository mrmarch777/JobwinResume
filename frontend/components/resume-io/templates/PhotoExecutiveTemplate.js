import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

const PhotoExecutiveTemplate = ({ resume }) => {
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
  const headingFont = "'Noto Serif', serif"; // Executive serif look for headings

  const renderPhoto = (photo, name, size = 110) => {
    const style = { width: size, height: size * 1.1, borderRadius: '8px', objectFit: 'cover' };
    if (photo) {
      return <img src={photo} alt={name} style={style} />;
    }
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div style={{ ...style, background: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.4, fontWeight: 'bold' }}>
        {initials}
      </div>
    );
  };

  const isEnabled = (sec) => enabledSections.includes(sec);

  return (
    <div style={{ 
      width: '794px', minHeight: '1123px', background: 'white', color: '#2c3e50', 
      fontFamily, lineHeight: spaces.line, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '50px' 
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${accentColor}`, paddingBottom: '20px', marginBottom: spaces.section }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: sizes.name, fontFamily: headingFont, fontWeight: '700', margin: '0 0 5px 0', color: '#1a252f' }}>{personal.name}</h1>
          <h2 style={{ fontSize: sizes.title, fontFamily: headingFont, margin: '0 0 15px 0', fontWeight: '400', color: accentColor }}>{personal.title}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: sizes.small, color: '#555' }}>
            {personal.email && <div>✉ {personal.email}</div>}
            {personal.phone && <div>☏ {personal.phone}</div>}
            {personal.location && <div>⚲ {personal.location}</div>}
            {personal.linkedin && <div>in/ {personal.linkedin.split('/').pop()}</div>}
          </div>
        </div>
        <div>
          {renderPhoto(personal.photo, personal.name)}
        </div>
      </div>

      {/* SINGLE COLUMN WITH TWO-COLUMN FOOTER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.section }}>
        {isEnabled('summary') && summary && (
          <div>
            <h3 style={{ fontSize: sizes.heading, fontFamily: headingFont, color: '#1a252f', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase' }}>Executive Summary</h3>
            <p style={{ fontSize: sizes.body, margin: 0, textAlign: 'justify' }}>{summary}</p>
          </div>
        )}

        {isEnabled('experience') && experience && experience.length > 0 && (
          <div>
            <h3 style={{ fontSize: sizes.heading, fontFamily: headingFont, color: '#1a252f', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase' }}>Professional Experience</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.section }}>
              {experience.map(exp => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: sizes.body, color: '#2c3e50' }}>{exp.title}</strong>
                    <span style={{ fontSize: sizes.small, color: accentColor, fontWeight: 'bold' }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div style={{ fontSize: sizes.small, color: '#7f8c8d', marginBottom: '8px', fontStyle: 'italic' }}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', fontSize: sizes.body }}>
                      {exp.bullets.map((b, i) => b ? (
                        <li key={i} style={{marginBottom: '5px', display: 'flex'}}>
                          <span style={{ color: accentColor, marginRight: '8px' }}>✓</span>
                          <span>{b}</span>
                        </li>
                      ) : null)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isEnabled('education') && education && education.length > 0 && (
          <div>
            <h3 style={{ fontSize: sizes.heading, fontFamily: headingFont, color: '#1a252f', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase' }}>Education</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
              {education.map(edu => (
                <div key={edu.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: sizes.body }}>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                    <span style={{ fontSize: sizes.small, color: '#7f8c8d' }}>{edu.year}</span>
                  </div>
                  <div style={{ fontSize: sizes.small, color: '#7f8c8d' }}>{edu.institution} {edu.grade && `| ${edu.grade}`}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM TWO COLUMNS for Skills & Certs */}
        <div style={{ display: 'flex', gap: '40px', marginTop: spaces.section }}>
          {isEnabled('skills') && skills && skills.length > 0 && (
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: sizes.heading, fontFamily: headingFont, color: '#1a252f', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase' }}>Core Competencies</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: sizes.small }}>
                {skills.map((skill, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '4px', height: '4px', background: accentColor, borderRadius: '50%', marginRight: '8px' }}></div>
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEnabled('certifications') && certifications && certifications.length > 0 && (
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: sizes.heading, fontFamily: headingFont, color: '#1a252f', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: spaces.item, textTransform: 'uppercase' }}>Certifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: sizes.small }}>
                {certifications.map(cert => (
                  <div key={cert.id}>
                    <strong>{cert.name}</strong> - {cert.issuer} ({cert.year})
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

export default PhotoExecutiveTemplate;
