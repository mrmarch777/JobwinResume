import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

export default function CleanTemplate({ resume }) {
  const { accentColor = '#6C63FF', fontFamily = 'DM Sans', fontSize = 'medium', spacing = 'normal', personal = {}, summary = '', experience = [], education = [], skills = [], projects = [], enabledSections = [], sectionOrder = [] } = resume;
  const fSize = fontSizes[fontSize] || fontSizes.medium;
  const spc = spacings[spacing] || spacings.normal;

  const styles = {
    container: { width: '100%', maxWidth: '794px', minHeight: '1123px', margin: '0 auto', backgroundColor: '#FFFFFF', color: '#333333', fontFamily: fontFamily, fontSize: fSize.body, lineHeight: spc.line, padding: '40px', boxSizing: 'border-box' },
    header: { textAlign: 'left', marginBottom: spc.section },
    name: { fontSize: fSize.name, fontWeight: 'bold', color: '#000000', marginBottom: '4px', borderBottom: `4px solid ${accentColor}`, display: 'inline-block', paddingBottom: '4px' },
    title: { fontSize: fSize.title, color: '#555555', marginTop: '8px', marginBottom: '8px', fontWeight: '500' },
    contact: { fontSize: fSize.small, color: '#666666', display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', borderLeft: `3px solid ${accentColor}`, paddingLeft: '10px', marginBottom: spc.item, letterSpacing: '1px' },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
    itemTitle: { fontWeight: 'bold', color: '#000000' },
    itemDate: { fontSize: fSize.small, color: '#555555', fontWeight: '500' },
    itemSubtitle: { fontStyle: 'normal', color: accentColor, fontWeight: '500' },
    itemDesc: { marginTop: '4px' }
  };

  const sectionRenderers = {
    summary: () => summary ? (
      <div key="summary" style={styles.section}><div style={styles.sectionTitle}>Professional Summary</div><div>{summary}</div></div>
    ) : null,
    experience: () => experience.length ? (
      <div key="experience" style={styles.section}>
        <div style={styles.sectionTitle}>Experience</div>
        {experience.map((exp, i) => (
          <div key={i} style={styles.item}>
            <div style={styles.itemHeader}><div style={styles.itemTitle}>{exp.title}</div><div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div></div>
            <div style={styles.itemSubtitle}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
            {exp.bullets && exp.bullets.length > 0 && <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>{exp.bullets.filter(b => b).map((bullet, j) => <li key={j} style={{ marginBottom: '2px' }}>{bullet}</li>)}</ul>}
          </div>
        ))}
      </div>
    ) : null,
    education: () => education.length ? (
      <div key="education" style={styles.section}>
        <div style={styles.sectionTitle}>Education</div>
        {education.map((edu, i) => (
          <div key={i} style={styles.item}>
            <div style={styles.itemHeader}><div style={styles.itemTitle}>{edu.degree} in {edu.field}</div><div style={styles.itemDate}>{edu.year}</div></div>
            <div style={styles.itemSubtitle}>{edu.institution}{edu.grade ? ` | ${edu.grade}` : ''}</div>
          </div>
        ))}
      </div>
    ) : null,
    skills: () => {
      const validSkills = skills.filter(s => s.name).map(s => s.name);
      return validSkills.length ? (
        <div key="skills" style={styles.section}><div style={styles.sectionTitle}>Skills</div><div>{validSkills.join(' • ')}</div></div>
      ) : null;
    },
    projects: () => projects.length ? (
      <div key="projects" style={styles.section}>
        <div style={styles.sectionTitle}>Projects</div>
        {projects.map((proj, i) => (
          <div key={i} style={styles.item}>
            <div style={styles.itemHeader}><div style={styles.itemTitle}>{proj.name}</div>{proj.url && <div style={styles.itemDate}>{proj.url}</div>}</div>
            <div style={styles.itemSubtitle}>{proj.technologies}</div>
            <div style={styles.itemDesc}>{proj.description}</div>
          </div>
        ))}
      </div>
    ) : null
  };

  return (
    <div id="resume-preview" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.name}>{personal.name || 'Your Name'}</div>
        {personal.title && <div style={styles.title}>{personal.title}</div>}
        <div style={styles.contact}>
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>☏ {personal.phone}</span>}
          {personal.location && <span>⚲ {personal.location}</span>}
          {personal.linkedin && <span>in/ {personal.linkedin.split('/').pop()}</span>}
        </div>
      </div>
      {sectionOrder.filter(key => enabledSections.includes(key) && key !== 'personal').map(key => sectionRenderers[key] && sectionRenderers[key]())}
    </div>
  );
}
