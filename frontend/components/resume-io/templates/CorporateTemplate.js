import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

export default function CorporateTemplate({ resume }) {
  const { accentColor = '#2c3e50', fontFamily = 'DM Sans', fontSize = 'medium', spacing = 'normal', personal = {}, summary = '', experience = [], education = [], skills = [], projects = [], enabledSections = [], sectionOrder = [] } = resume;
  const fSize = fontSizes[fontSize] || fontSizes.medium;
  const spc = spacings[spacing] || spacings.normal;

  const styles = {
    container: { width: '100%', maxWidth: '794px', minHeight: '1123px', margin: '0 auto', backgroundColor: '#FFFFFF', color: '#333333', fontFamily: fontFamily, fontSize: fSize.body, lineHeight: spc.line, padding: '40px', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spc.section, borderBottom: `2px solid ${accentColor}`, paddingBottom: '15px' },
    headerLeft: { flex: 1 },
    headerRight: { textAlign: 'right', fontSize: fSize.small, color: '#444' },
    name: { fontSize: fSize.name, fontWeight: 'bold', color: '#000000', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' },
    title: { fontSize: fSize.title, color: accentColor, fontWeight: '500' },
    section: { marginBottom: spc.section },
    sectionTitleContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: spc.item },
    sectionLine: { flex: 1, height: '1px', backgroundColor: '#ddd' },
    sectionTitle: { fontSize: fSize.heading, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', padding: '0 15px', fontFamily: '"Noto Serif", serif' },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
    itemTitle: { fontWeight: 'normal', color: '#333' },
    itemDate: { fontSize: fSize.small, color: '#555555' },
    itemCompany: { fontWeight: 'bold', color: '#000' },
    itemDesc: { marginTop: '4px' }
  };

  const sectionRenderers = {
    summary: () => summary ? (
      <div key="summary" style={styles.section}><div style={styles.sectionTitleContainer}><div style={styles.sectionLine}></div><div style={styles.sectionTitle}>Professional Summary</div><div style={styles.sectionLine}></div></div><div style={{ textAlign: 'justify' }}>{summary}</div></div>
    ) : null,
    experience: () => experience.length ? (
      <div key="experience" style={styles.section}>
        <div style={styles.sectionTitleContainer}><div style={styles.sectionLine}></div><div style={styles.sectionTitle}>Experience</div><div style={styles.sectionLine}></div></div>
        {experience.map((exp, i) => (
          <div key={i} style={styles.item}>
            <div style={styles.itemHeader}><div style={styles.itemCompany}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div><div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div></div>
            <div style={styles.itemTitle}>{exp.title}</div>
            {exp.bullets && exp.bullets.length > 0 && <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>{exp.bullets.filter(b => b).map((bullet, j) => <li key={j} style={{ marginBottom: '2px' }}>{bullet}</li>)}</ul>}
          </div>
        ))}
      </div>
    ) : null,
    education: () => education.length ? (
      <div key="education" style={styles.section}>
        <div style={styles.sectionTitleContainer}><div style={styles.sectionLine}></div><div style={styles.sectionTitle}>Education</div><div style={styles.sectionLine}></div></div>
        {education.map((edu, i) => (
          <div key={i} style={styles.item}>
            <div style={styles.itemHeader}><div style={styles.itemCompany}>{edu.institution}</div><div style={styles.itemDate}>{edu.year}</div></div>
            <div style={styles.itemTitle}>{edu.degree} in {edu.field}{edu.grade ? `, ${edu.grade}` : ''}</div>
          </div>
        ))}
      </div>
    ) : null,
    skills: () => {
      const validSkills = skills.filter(s => s.name).map(s => s.name);
      return validSkills.length ? (
        <div key="skills" style={styles.section}><div style={styles.sectionTitleContainer}><div style={styles.sectionLine}></div><div style={styles.sectionTitle}>Skills</div><div style={styles.sectionLine}></div></div><div style={{ textAlign: 'center' }}>{validSkills.join(' | ')}</div></div>
      ) : null;
    }
  };

  return (
    <div style={styles.container}>
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
      {sectionOrder.filter(key => enabledSections.includes(key) && key !== 'personal').map(key => sectionRenderers[key] && sectionRenderers[key]())}
    </div>
  );
}
