import React from 'react';

const fontSizes = { 
  small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, 
  medium: { name: '32px', title: '15px', heading: '16px', body: '12px', small: '11px' }, 
  large: { name: '36px', title: '17px', heading: '18px', body: '13px', small: '12px' } 
};
const spacings = { 
  compact: { section: '12px', item: '6px', line: '1.3' }, 
  normal: { section: '20px', item: '10px', line: '1.5' }, 
  spacious: { section: '28px', item: '14px', line: '1.7' } 
};

export default function CreativeTemplate({ resume }) {
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
      color: '#333333',
      fontFamily: fontFamily,
      fontSize: fSize.body,
      lineHeight: spc.line,
      boxSizing: 'border-box'
    },
    header: {
      backgroundColor: accentColor,
      color: '#FFFFFF',
      padding: '40px',
      textAlign: 'center'
    },
    name: { fontSize: fSize.name, fontWeight: 'bold', marginBottom: '8px' },
    title: { fontSize: fSize.title, opacity: 0.9, marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' },
    contactRow: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: fSize.small },
    contactItem: { display: 'flex', alignItems: 'center', gap: '4px' },
    content: { padding: '40px' },
    section: { marginBottom: spc.section },
    sectionTitle: { 
      fontSize: fSize.heading, 
      fontWeight: 'bold', 
      color: '#000000', 
      textTransform: 'uppercase', 
      borderLeft: `4px solid ${accentColor}`, 
      paddingLeft: '12px', 
      marginBottom: spc.item 
    },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    itemTitle: { fontWeight: 'bold', color: '#000000', fontSize: fSize.body },
    itemSubtitle: { color: accentColor, fontWeight: '600' },
    itemDate: { fontSize: fSize.small, color: '#777777' },
    pills: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
    pill: { backgroundColor: accentColor, color: '#FFFFFF', padding: '4px 12px', borderRadius: '20px', fontSize: fSize.small, fontWeight: 'bold' }
  };

  const sectionRenderers = {
    summary: () => {
      if (!summary) return null;
      return (
        <div key="summary" style={styles.section}>
          <div style={styles.sectionTitle}>Profile</div>
          <div>{summary}</div>
        </div>
      );
    },
    experience: () => {
      if (!experience.length) return null;
      return (
        <div key="experience" style={styles.section}>
          <div style={styles.sectionTitle}>Experience</div>
          {experience.map((exp, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{exp.title}</div>
                <div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
              </div>
              <div style={styles.itemSubtitle}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  {exp.bullets.filter(b => b).map((bullet, j) => (
                    <li key={j} style={{ marginBottom: '4px', '&::marker': { color: accentColor } }}>{bullet}</li>
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
          <div style={styles.sectionTitle}>Education</div>
          {education.map((edu, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{edu.degree} in {edu.field}</div>
                <div style={styles.itemDate}>{edu.year}</div>
              </div>
              <div style={styles.itemSubtitle}>{edu.institution}</div>
            </div>
          ))}
        </div>
      );
    },
    skills: () => {
      if (!skills.length) return null;
      const validSkills = skills.filter(s => s.name);
      if (!validSkills.length) return null;
      return (
        <div key="skills" style={styles.section}>
          <div style={styles.sectionTitle}>Skills</div>
          <div style={styles.pills}>
            {validSkills.map((skill, i) => (
              <span key={i} style={styles.pill}>{skill.name}</span>
            ))}
          </div>
        </div>
      );
    },
    projects: () => {
      if (!projects.length) return null;
      return (
        <div key="projects" style={styles.section}>
          <div style={styles.sectionTitle}>Projects</div>
          {projects.map((proj, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{proj.name}</div>
                {proj.url && <div style={styles.itemDate}>{proj.url}</div>}
              </div>
              <div style={{ color: '#555555', fontStyle: 'italic', marginBottom: '4px' }}>{proj.technologies}</div>
              <div>{proj.description}</div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div id="resume-preview" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.name}>{personal.name || 'Your Name'}</div>
        {personal.title && <div style={styles.title}>{personal.title}</div>}
        <div style={styles.contactRow}>
          {personal.email && <div style={styles.contactItem}>✉ {personal.email}</div>}
          {personal.phone && <div style={styles.contactItem}>☏ {personal.phone}</div>}
          {personal.location && <div style={styles.contactItem}>⚲ {personal.location}</div>}
          {personal.linkedin && <div style={styles.contactItem}>in {personal.linkedin}</div>}
        </div>
      </div>
      <div style={styles.content}>
        {sectionOrder
          .filter(key => enabledSections.includes(key) && key !== 'personal')
          .map(key => sectionRenderers[key] && sectionRenderers[key]())}
      </div>
    </div>
  );
}
