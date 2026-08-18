import React from 'react';

const fontSizes = { 
  small: { name: '28px', title: '14px', heading: '15px', body: '11px', small: '10px' }, 
  medium: { name: '32px', title: '16px', heading: '17px', body: '12px', small: '11px' }, 
  large: { name: '36px', title: '18px', heading: '19px', body: '13px', small: '12px' } 
};
const spacings = { 
  compact: { section: '16px', item: '8px', line: '1.4' }, 
  normal: { section: '24px', item: '12px', line: '1.6' }, 
  spacious: { section: '32px', item: '16px', line: '1.8' } 
};

export default function ExecutiveTemplate({ resume }) {
  const {
    accentColor = '#B8860B', // Default to gold for executive
    fontFamily = 'Noto Serif', // Serif by default
    fontSize = 'medium',
    spacing = 'normal',
    personal = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    enabledSections = [],
    sectionOrder = []
  } = resume;

  const fSize = fontSizes[fontSize] || fontSizes.medium;
  const spc = spacings[spacing] || spacings.normal;

  const styles = {
    container: {
      width: '100%',
      maxWidth: '794px',
      minHeight: '1123px',
      margin: '0 auto',
      backgroundColor: '#FFFFFF',
      color: '#222222',
      fontFamily: fontFamily,
      fontSize: fSize.body,
      lineHeight: spc.line,
      padding: '45px',
      boxSizing: 'border-box'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spc.item },
    leftHeader: { flex: 1 },
    rightHeader: { textAlign: 'right', fontSize: fSize.small, color: '#555555' },
    name: { fontSize: fSize.name, fontWeight: 'bold', color: '#000000', marginBottom: '4px', textTransform: 'uppercase' },
    title: { fontSize: fSize.title, color: '#555555' },
    hr: { border: 'none', borderBottom: `1px solid ${accentColor}`, margin: `0 0 ${spc.section} 0` },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: 'bold', color: accentColor, textTransform: 'uppercase', borderBottom: '1px solid #DDDDDD', paddingBottom: '4px', marginBottom: spc.item },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    itemCompany: { fontWeight: 'bold', color: '#000000', fontSize: fSize.body },
    itemTitle: { color: accentColor, fontStyle: 'italic', fontSize: fSize.body },
    itemDate: { fontSize: fSize.small, color: '#555555', fontWeight: 'bold' }
  };

  const sectionRenderers = {
    summary: () => {
      if (!summary) return null;
      return (
        <div key="summary" style={styles.section}>
          <div style={styles.sectionTitle}>Executive Profile</div>
          <div style={{ textAlign: 'justify' }}>{summary}</div>
        </div>
      );
    },
    experience: () => {
      if (!experience.length) return null;
      return (
        <div key="experience" style={styles.section}>
          <div style={styles.sectionTitle}>Professional Experience</div>
          {experience.map((exp, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemCompany}>{exp.company}{exp.location ? ` – ${exp.location}` : ''}</div>
                <div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
              </div>
              <div style={styles.itemTitle}>{exp.title}</div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '0', listStyleType: 'none' }}>
                  {exp.bullets.filter(b => b).map((bullet, j) => (
                    <li key={j} style={{ marginBottom: '4px', position: 'relative', paddingLeft: '20px' }}>
                      <span style={{ position: 'absolute', left: 0, color: accentColor }}>✓</span> {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    },
    education: () => {
      if (!education.length) return null;
      return (
        <div key="education" style={styles.section}>
          <div style={styles.sectionTitle}>Education & Credentials</div>
          {education.map((edu, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemCompany}>{edu.institution}</div>
                <div style={styles.itemDate}>{edu.year}</div>
              </div>
              <div>{edu.degree} in {edu.field}</div>
            </div>
          ))}
        </div>
      );
    },
    skills: () => {
      if (!skills.length) return null;
      const validSkills = skills.filter(s => s.name).map(s => s.name);
      if (!validSkills.length) return null;
      return (
        <div key="skills" style={styles.section}>
          <div style={styles.sectionTitle}>Core Competencies</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {validSkills.map((skill, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: accentColor, marginRight: '8px' }}>•</span> {skill}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div id="resume-preview" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.leftHeader}>
          <div style={styles.name}>{personal.name || 'Your Name'}</div>
          {personal.title && <div style={styles.title}>{personal.title}</div>}
        </div>
        <div style={styles.rightHeader}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.linkedin && <div>{personal.linkedin}</div>}
        </div>
      </div>
      <hr style={styles.hr} />
      {sectionOrder
        .filter(key => enabledSections.includes(key) && key !== 'personal')
        .map(key => sectionRenderers[key] && sectionRenderers[key]())}
    </div>
  );
}
