import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

const PrimeATSTemplate = ({ resume }) => {
  const {
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
  const font = "Arial, Helvetica, sans-serif";

  const isEnabled = (sec) => enabledSections.includes(sec);

  return (
    <div style={{ 
      width: '794px', minHeight: '1123px', background: 'white', color: 'black', 
      fontFamily: font, lineHeight: spaces.line, padding: '50px', boxSizing: 'border-box' 
    }}>
      {/* HEADER */}
      <div style={{ textAlign: 'left', marginBottom: spaces.section }}>
        <h1 style={{ fontSize: sizes.name, fontWeight: 'bold', margin: '0 0 5px 0' }}>{personal.name}</h1>
        
        <div style={{ fontSize: sizes.small, display: 'flex', flexWrap: 'wrap', gap: '6px', color: '#333' }}>
          {personal.location && <span>{personal.location}</span>}
          {personal.location && (personal.phone || personal.email) && <span>|</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.phone && personal.email && <span>|</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.linkedin && <span>|</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.section }}>
        {sectionOrder.map(sectionId => {
          if (!isEnabled(sectionId)) return null;

          if (sectionId === 'summary' && summary) {
            return (
              <div key="summary">
                <h3 style={{ fontSize: sizes.heading, fontWeight: 'bold', borderBottom: '2px solid black', margin: `0 0 ${spaces.item} 0`, paddingBottom: '2px' }}>Professional Summary</h3>
                <p style={{ fontSize: sizes.body, margin: 0 }}>{summary}</p>
              </div>
            );
          }

          if (sectionId === 'experience' && experience && experience.length > 0) {
            return (
              <div key="experience">
                <h3 style={{ fontSize: sizes.heading, fontWeight: 'bold', borderBottom: '2px solid black', margin: `0 0 ${spaces.item} 0`, paddingBottom: '2px' }}>Professional Experience</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span style={{ fontSize: sizes.body }}>{exp.title}</span>
                        <span style={{ fontSize: sizes.body }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div style={{ fontSize: sizes.body, marginBottom: '4px' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: sizes.body }}>
                          {exp.bullets.map((b, i) => b ? <li key={i} style={{marginBottom: '2px'}}>{b}</li> : null)}
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
                <h3 style={{ fontSize: sizes.heading, fontWeight: 'bold', borderBottom: '2px solid black', margin: `0 0 ${spaces.item} 0`, paddingBottom: '2px' }}>Education</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spaces.item }}>
                  {education.map(edu => (
                    <div key={edu.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span style={{ fontSize: sizes.body }}>{edu.institution}</span>
                        <span style={{ fontSize: sizes.body }}>{edu.year}</span>
                      </div>
                      <div style={{ fontSize: sizes.body }}>
                        {edu.degree} {edu.field && `in ${edu.field}`} {edu.grade && `| ${edu.grade}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (sectionId === 'skills' && skills && skills.length > 0) {
            return (
              <div key="skills">
                <h3 style={{ fontSize: sizes.heading, fontWeight: 'bold', borderBottom: '2px solid black', margin: `0 0 ${spaces.item} 0`, paddingBottom: '2px' }}>Skills</h3>
                <div style={{ fontSize: sizes.body }}>
                  {skills.map(s => s.name).join(', ')}
                </div>
              </div>
            );
          }

          if (sectionId === 'certifications' && certifications && certifications.length > 0) {
            return (
              <div key="certifications">
                <h3 style={{ fontSize: sizes.heading, fontWeight: 'bold', borderBottom: '2px solid black', margin: `0 0 ${spaces.item} 0`, paddingBottom: '2px' }}>Certifications</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: sizes.body }}>
                  {certifications.map(cert => (
                    <li key={cert.id}>{cert.name} - {cert.issuer} ({cert.year})</li>
                  ))}
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

export default PrimeATSTemplate;
