import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

export default function SpecialistTemplate({ resume }) {
  const { accentColor = '#0B7B3E', fontFamily = 'DM Sans', fontSize = 'medium', spacing = 'normal', personal = {}, summary = '', experience = [], education = [], skills = [], projects = [], enabledSections = [], sectionOrder = [] } = resume;
  const fSize = fontSizes[fontSize] || fontSizes.medium;
  const spc = spacings[spacing] || spacings.normal;

  const styles = {
    container: { width: '100%', maxWidth: '794px', minHeight: '1123px', margin: '0 auto', backgroundColor: '#FFFFFF', color: '#333333', fontFamily: fontFamily, fontSize: fSize.body, lineHeight: spc.line, padding: '40px', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spc.section, borderBottom: '2px solid #EEEEEE', paddingBottom: '15px' },
    headerLeft: { flex: 1 },
    headerRight: { textAlign: 'right', fontSize: fSize.small, color: '#555' },
    name: { fontSize: fSize.name, fontWeight: 'bold', color: '#000000', marginBottom: '4px' },
    title: { fontSize: fSize.title, color: accentColor, fontWeight: 'bold' },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', marginBottom: spc.item },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
    itemTitle: { fontWeight: 'bold', color: '#000000' },
    itemDate: { fontSize: fSize.small, color: accentColor, fontWeight: 'bold' },
    itemSubtitle: { fontStyle: 'italic', color: '#444444' },
    skillsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 30px' },
    skillItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    skillBarBg: { width: '100px', height: '6px', backgroundColor: '#EEEEEE', borderRadius: '3px', overflow: 'hidden' },
    skillBarFill: (level) => ({ width: `${(level/5)*100}%`, height: '100%', backgroundColor: accentColor })
  };

  // Force skills to be early in the order if enabled
  const orderedSections = ['summary', 'skills', 'experience', 'projects', 'education'].filter(k => enabledSections.includes(k));

  const sectionRenderers = {
    summary: () => summary ? (
      <div key="summary" style={styles.section}><div style={styles.sectionTitle}>Summary</div><div>{summary}</div></div>
    ) : null,
    skills: () => {
      const validSkills = skills.filter(s => s.name);
      return validSkills.length ? (
        <div key="skills" style={styles.section}>
          <div style={styles.sectionTitle}>Core Competencies</div>
          <div style={styles.skillsGrid}>
            {validSkills.map((s, i) => (
              <div key={i} style={styles.skillItem}>
                <span style={{ fontWeight: '500' }}>{s.name}</span>
                <div style={styles.skillBarBg}><div style={styles.skillBarFill(s.level || 4)}></div></div>
              </div>
            ))}
          </div>
        </div>
      ) : null;
    },
    experience: () => experience.length ? (
      <div key="experience" style={styles.section}>
        <div style={styles.sectionTitle}>Professional Experience</div>
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
    projects: () => projects.length ? (
      <div key="projects" style={styles.section}>
        <div style={styles.sectionTitle}>Projects</div>
        {projects.map((proj, i) => (
          <div key={i} style={styles.item}>
            <div style={styles.itemHeader}><div style={styles.itemTitle}>{proj.name}</div>{proj.url && <div style={styles.itemDate}>{proj.url}</div>}</div>
            <div style={styles.itemSubtitle}>{proj.technologies}</div>
            <div style={{ marginTop: '4px' }}>{proj.description}</div>
          </div>
        ))}
      </div>
    ) : null
  };

  return (
    <div id="resume-preview" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.name}>{personal.name || 'Your Name'}</div>
          {personal.title && <div style={styles.title}>{personal.title}</div>}
        </div>
        <div style={styles.headerRight}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.linkedin && <div>{personal.linkedin}</div>}
        </div>
      </div>
      {orderedSections.map(key => sectionRenderers[key] && sectionRenderers[key]())}
    </div>
  );
}
