import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

export default function IndustrialTemplate({ resume }) {
  const { accentColor = '#1a1a2e', fontFamily = '"Courier New", Courier, monospace', fontSize = 'medium', spacing = 'normal', personal = {}, summary = '', experience = [], education = [], skills = [], projects = [], enabledSections = [], sectionOrder = [] } = resume;
  const fSize = fontSizes[fontSize] || fontSizes.medium;
  const spc = spacings[spacing] || spacings.normal;

  const styles = {
    container: { width: '100%', maxWidth: '794px', minHeight: '1123px', margin: '0 auto', backgroundColor: '#FFFFFF', color: '#222222', fontFamily: fontFamily, fontSize: fSize.body, lineHeight: spc.line, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    headerBanner: { backgroundColor: accentColor, color: '#FFFFFF', padding: '30px 40px', width: '100%', boxSizing: 'border-box' },
    name: { fontSize: fSize.name, fontWeight: 'bold', color: '#FFFFFF', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '2px' },
    title: { fontSize: fSize.title, color: '#DDDDDD', marginBottom: '10px' },
    contact: { fontSize: fSize.small, color: '#BBBBBB', display: 'flex', gap: '20px', flexWrap: 'wrap' },
    content: { padding: '40px', flex: 1 },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', borderBottom: '2px dashed #999', paddingBottom: '4px', marginBottom: spc.item, letterSpacing: '1px' },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
    itemTitle: { fontWeight: 'bold', color: '#000000' },
    itemDate: { fontSize: fSize.small, color: '#555555' },
    itemSubtitle: { fontWeight: 'bold', color: '#555555' },
    itemDesc: { marginTop: '4px' },
    gridSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }
  };

  const mainSections = sectionOrder.filter(k => enabledSections.includes(k) && k !== 'personal' && k !== 'skills' && k !== 'education');
  const bottomSections = sectionOrder.filter(k => enabledSections.includes(k) && (k === 'skills' || k === 'education'));

  const renderSection = (key) => {
    switch(key) {
      case 'summary':
        return summary ? <div key="summary" style={styles.section}><div style={styles.sectionTitle}>Summary</div><div>{summary}</div></div> : null;
      case 'experience':
        return experience.length ? (
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
        ) : null;
      case 'projects':
        return projects.length ? (
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
        ) : null;
      case 'education':
        return education.length ? (
          <div key="education">
            <div style={styles.sectionTitle}>Education</div>
            {education.map((edu, i) => (
              <div key={i} style={styles.item}>
                <div style={styles.itemHeader}><div style={styles.itemTitle}>{edu.degree} in {edu.field}</div><div style={styles.itemDate}>{edu.year}</div></div>
                <div style={styles.itemSubtitle}>{edu.institution}{edu.grade ? ` | ${edu.grade}` : ''}</div>
              </div>
            ))}
          </div>
        ) : null;
      case 'skills':
        const validSkills = skills.filter(s => s.name).map(s => s.name);
        return validSkills.length ? (
          <div key="skills"><div style={styles.sectionTitle}>Skills</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{validSkills.map((s,i) => <span key={i} style={{ border: '1px solid #999', padding: '2px 6px' }}>{s}</span>)}</div></div>
        ) : null;
      default: return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerBanner}>
        <div style={styles.name}>{personal.name || 'Your Name'}</div>
        {personal.title && <div style={styles.title}>{personal.title}</div>}
        <div style={styles.contact}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </div>
      <div style={styles.content}>
        {mainSections.map(key => renderSection(key))}
        
        {bottomSections.length > 0 && (
          <div style={styles.gridSection}>
            {bottomSections.map(key => <div key={key}>{renderSection(key)}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
