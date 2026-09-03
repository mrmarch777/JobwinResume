import React from 'react';

const fontSizes = { 
  small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, 
  medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, 
  large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } 
};
const spacings = { 
  compact: { section: '12px', item: '6px', line: '1.3' }, 
  normal: { section: '20px', item: '10px', line: '1.5' }, 
  spacious: { section: '28px', item: '14px', line: '1.7' } 
};

export default function ModernTemplate({ resume }) {
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
    languages = [],
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
      display: 'flex',
      alignItems: 'stretch',
      fontFamily: fontFamily,
      fontSize: fSize.body,
      lineHeight: spc.line,
      boxSizing: 'border-box'
    },
    sidebar: {
      width: '30%',
      minWidth: '30%',
      backgroundColor: accentColor,
      color: '#FFFFFF',
      padding: '30px 20px',
      boxSizing: 'border-box',
      flexShrink: 0,
    },
    main: {
      width: '70%',
      padding: '40px 35px 40px 35px',
      color: '#333333',
      boxSizing: 'border-box'
    },
    name: { fontSize: fSize.name, fontWeight: 'bold', color: '#000000', marginBottom: '4px' },
    title: { fontSize: fSize.title, color: accentColor, fontWeight: '600', marginBottom: spc.section },
    sidebarTitle: { fontSize: fSize.heading, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: spc.item, borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px' },
    mainTitle: { fontSize: fSize.heading, fontWeight: 'bold', textTransform: 'uppercase', color: accentColor, marginBottom: spc.item, borderBottom: '2px solid #EEEEEE', paddingBottom: '4px' },
    section: { marginBottom: spc.section },
    contactItem: { marginBottom: '8px', fontSize: fSize.small, wordBreak: 'break-all' },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    itemTitle: { fontWeight: 'bold', color: '#000000' },
    itemSubtitle: { color: '#555555', fontStyle: 'italic' },
    itemDate: { fontSize: fSize.small, color: '#777777' },
    skillBar: { width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', marginTop: '4px', borderRadius: '2px' },
    skillProgress: (level) => ({ height: '100%', width: `${(level/5)*100}%`, backgroundColor: '#FFFFFF', borderRadius: '2px' })
  };

  const renderSidebar = () => (
    <div style={styles.sidebar}>
      {personal.photo && (
        <div style={{ textAlign: 'center', marginBottom: spc.section }}>
          <img src={personal.photo} alt={personal.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FFFFFF' }} />
        </div>
      )}
      <div style={styles.section}>
        <div style={styles.sidebarTitle}>Contact</div>
        {personal.email && <div style={styles.contactItem}>📧 {personal.email}</div>}
        {personal.phone && <div style={styles.contactItem}>📱 {personal.phone}</div>}
        {personal.location && <div style={styles.contactItem}>📍 {personal.location}</div>}
        {personal.linkedin && <div style={styles.contactItem}>💼 {personal.linkedin}</div>}
        {personal.website && <div style={styles.contactItem}>🌐 {personal.website}</div>}
      </div>
      {enabledSections.includes('skills') && skills.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sidebarTitle}>Skills</div>
          {skills.filter(s => s.name).map((skill, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: fSize.small }}>{skill.name}</div>
              <div style={styles.skillBar}>
                <div style={styles.skillProgress(skill.level || 3)}></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {enabledSections.includes('languages') && languages.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sidebarTitle}>Languages</div>
          {languages.filter(l => l.name).map((lang, i) => (
            <div key={i} style={{ marginBottom: '6px', fontSize: fSize.small }}>
              <strong>{lang.name}</strong> - {lang.level}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const sectionRenderers = {
    summary: () => {
      if (!summary) return null;
      return (
        <div key="summary" style={styles.section}>
          <div style={styles.mainTitle}>Profile</div>
          <div>{summary}</div>
        </div>
      );
    },
    experience: () => {
      if (!experience.length) return null;
      return (
        <div key="experience" style={styles.section}>
          <div style={styles.mainTitle}>Experience</div>
          {experience.map((exp, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{exp.title}</div>
                <div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
              </div>
              <div style={styles.itemSubtitle}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
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
          <div style={styles.mainTitle}>Education</div>
          {education.map((edu, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{edu.degree} in {edu.field}</div>
                <div style={styles.itemDate}>{edu.year}</div>
              </div>
              <div style={styles.itemSubtitle}>{edu.institution}{edu.grade ? ` | ${edu.grade}` : ''}</div>
            </div>
          ))}
        </div>
      );
    },
    projects: () => {
      if (!projects.length) return null;
      return (
        <div key="projects" style={styles.section}>
          <div style={styles.mainTitle}>Projects</div>
          {projects.map((proj, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{proj.name}</div>
                {proj.url && <div style={styles.itemDate}>{proj.url}</div>}
              </div>
              <div style={styles.itemSubtitle}>{proj.technologies}</div>
              <div style={{ marginTop: '4px' }}>{proj.description}</div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      {renderSidebar()}
      <div style={styles.main}>
        <div style={styles.name}>{personal.name || 'Your Name'}</div>
        {personal.title && <div style={styles.title}>{personal.title}</div>}
        {sectionOrder
          .filter(key => enabledSections.includes(key) && key !== 'personal' && key !== 'skills' && key !== 'languages')
          .map(key => sectionRenderers[key] && sectionRenderers[key]())}
      </div>
    </div>
  );
}
