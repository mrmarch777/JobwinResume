import React from 'react';

const fontSizes = { 
  small: { name: '20px', title: '12px', heading: '13px', body: '11px', small: '10px' }, 
  medium: { name: '24px', title: '14px', heading: '15px', body: '12px', small: '11px' }, 
  large: { name: '28px', title: '16px', heading: '17px', body: '13px', small: '12px' } 
};
const spacings = { 
  compact: { section: '12px', item: '6px', line: '1.3' }, 
  normal: { section: '16px', item: '8px', line: '1.5' }, 
  spacious: { section: '20px', item: '10px', line: '1.7' } 
};

export default function ATSOptimizedTemplate({ resume }) {
  const {
    fontFamily = 'Arial, sans-serif',
    fontSize = 'medium',
    spacing = 'normal',
    personal = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    projects = [],
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
      color: '#000000',
      fontFamily: fontFamily,
      fontSize: fSize.body,
      lineHeight: spc.line,
      padding: '40px',
      boxSizing: 'border-box'
    },
    header: { textAlign: 'center', marginBottom: spc.section },
    name: { fontSize: fSize.name, fontWeight: 'bold', marginBottom: '8px' },
    contact: { fontSize: fSize.body, display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', marginBottom: spc.item },
    item: { marginBottom: spc.item },
    itemHeader: { marginBottom: '4px' },
    itemTitle: { fontWeight: 'bold' }
  };

  const renderContact = () => {
    const parts = [];
    if (personal.email) parts.push(personal.email);
    if (personal.phone) parts.push(personal.phone);
    if (personal.location) parts.push(personal.location);
    if (personal.linkedin) parts.push(personal.linkedin);
    return parts.join(' | ');
  };

  const sectionRenderers = {
    summary: () => {
      if (!summary) return null;
      return (
        <div key="summary" style={styles.section}>
          <div style={styles.sectionTitle}>SUMMARY</div>
          <div>{summary}</div>
        </div>
      );
    },
    experience: () => {
      if (!experience.length) return null;
      return (
        <div key="experience" style={styles.section}>
          <div style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</div>
          {experience.map((exp, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <span style={styles.itemTitle}>{exp.title}, {exp.company}</span>
                {exp.location && <span> — {exp.location}</span>}
                <div style={{ float: 'right' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div>
              </div>
              <div style={{ clear: 'both' }}></div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                  {exp.bullets.filter(b => b).map((bullet, j) => (
                    <li key={j} style={{ marginBottom: '2px' }}>{bullet}</li>
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
          <div style={styles.sectionTitle}>EDUCATION</div>
          {education.map((edu, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <span style={styles.itemTitle}>{edu.institution}</span>
                <div style={{ float: 'right' }}>{edu.year}</div>
              </div>
              <div style={{ clear: 'both' }}></div>
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
          <div style={styles.sectionTitle}>SKILLS</div>
          <div>{validSkills.join(', ')}</div>
        </div>
      );
    },
    projects: () => {
      if (!projects.length) return null;
      return (
        <div key="projects" style={styles.section}>
          <div style={styles.sectionTitle}>PROJECTS</div>
          {projects.map((proj, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <span style={styles.itemTitle}>{proj.name}</span>
                {proj.url && <span> — {proj.url}</span>}
              </div>
              <div>{proj.description}</div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.name}>{personal.name || 'Your Name'}</div>
        <div style={styles.contact}>{renderContact()}</div>
      </div>
      {sectionOrder
        .filter(key => enabledSections.includes(key) && key !== 'personal')
        .map(key => sectionRenderers[key] && sectionRenderers[key]())}
    </div>
  );
}
