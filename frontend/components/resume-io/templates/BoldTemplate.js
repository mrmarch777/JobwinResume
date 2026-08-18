import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '32px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '38px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

export default function BoldTemplate({ resume }) {
  const { accentColor = '#E63946', fontFamily = 'DM Sans', fontSize = 'medium', spacing = 'normal', personal = {}, summary = '', experience = [], education = [], skills = [], projects = [], enabledSections = [], sectionOrder = [] } = resume;
  const fSize = fontSizes[fontSize] || fontSizes.medium;
  const spc = spacings[spacing] || spacings.normal;

  const styles = {
    container: { width: '100%', maxWidth: '794px', minHeight: '1123px', margin: '0 auto', backgroundColor: '#FFFFFF', color: '#111111', fontFamily: fontFamily, fontSize: fSize.body, lineHeight: spc.line, padding: '40px', boxSizing: 'border-box' },
    header: { marginBottom: spc.section },
    name: { fontSize: fSize.name, fontWeight: '900', color: '#000000', marginBottom: '0px', textTransform: 'uppercase', lineHeight: '1.1' },
    title: { fontSize: fSize.title, color: accentColor, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' },
    contact: { fontSize: fSize.small, color: '#333333', display: 'flex', gap: '15px', flexWrap: 'wrap', fontWeight: '500' },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: '900', color: '#FFFFFF', backgroundColor: accentColor, display: 'inline-block', padding: '4px 10px', textTransform: 'uppercase', marginBottom: spc.item, letterSpacing: '1px' },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' },
    itemTitle: { fontWeight: 'bold', color: '#000000', fontSize: fSize.body },
    itemDate: { fontSize: fSize.small, color: '#555555', fontWeight: 'bold' },
    itemSubtitle: { fontWeight: 'bold', color: '#333333' },
    itemDesc: { marginTop: '4px' },
    skillChip: { display: 'inline-block', border: `2px solid ${accentColor}`, padding: '4px 10px', margin: '0 8px 8px 0', fontWeight: 'bold', fontSize: fSize.small, borderRadius: '4px' }
  };

  const sectionRenderers = {
    summary: () => summary ? (
      <div key="summary" style={styles.section}><div style={styles.sectionTitle}>Summary</div><div>{summary}</div></div>
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
        <div key="skills" style={styles.section}><div style={styles.sectionTitle}>Skills</div><div>{validSkills.map((s, i) => <span key={i} style={styles.skillChip}>{s}</span>)}</div></div>
      ) : null;
    }
  };

  return (
    <div id="resume-preview" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.name}>{personal.name || 'Your Name'}</div>
        {personal.title && <div style={styles.title}>{personal.title}</div>}
        <div style={styles.contact}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </div>
      {sectionOrder.filter(key => enabledSections.includes(key) && key !== 'personal').map(key => sectionRenderers[key] && sectionRenderers[key]())}
    </div>
  );
}
