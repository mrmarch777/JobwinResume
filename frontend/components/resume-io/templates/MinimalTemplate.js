import React from 'react';

const fontSizes = { 
  small: { name: '22px', title: '12px', heading: '13px', body: '11px', small: '10px' }, 
  medium: { name: '26px', title: '14px', heading: '15px', body: '12px', small: '11px' }, 
  large: { name: '30px', title: '16px', heading: '17px', body: '13px', small: '12px' } 
};
const spacings = { 
  compact: { section: '16px', item: '8px', line: '1.4' }, 
  normal: { section: '24px', item: '12px', line: '1.6' }, 
  spacious: { section: '32px', item: '16px', line: '1.8' } 
};

export default function MinimalTemplate({ resume }) {
  const {
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
      padding: '50px',
      boxSizing: 'border-box'
    },
    header: { marginBottom: spc.section },
    name: { fontSize: fSize.name, fontWeight: '300', color: '#000000', marginBottom: '8px', letterSpacing: '2px' },
    contact: { fontSize: fSize.small, color: '#777777', display: 'flex', gap: '15px', flexWrap: 'wrap' },
    hr: { border: 'none', borderBottom: '1px solid #EEEEEE', margin: `${spc.section} 0` },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: '400', color: '#111111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: spc.item },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    itemTitle: { fontWeight: '600', color: '#000000' },
    itemSubtitle: { color: '#555555' },
    itemDate: { fontSize: fSize.small, color: '#999999' },
    desc: { marginTop: '4px', color: '#444444' }
  };

  const renderContact = () => {
    const parts = [];
    if (personal.email) parts.push(personal.email);
    if (personal.phone) parts.push(personal.phone);
    if (personal.location) parts.push(personal.location);
    if (personal.linkedin) parts.push(personal.linkedin);
    return parts.join('   •   ');
  };

  const sectionRenderers = {
    summary: () => {
      if (!summary) return null;
      return (
        <div key="summary" style={styles.section}>
          <div style={styles.sectionTitle}>Summary</div>
          <div style={styles.desc}>{summary}</div>
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
                <div style={styles.itemTitle}>{exp.title}, {exp.company}</div>
                <div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '15px', color: '#444444' }}>
                  {exp.bullets.filter(b => b).map((bullet, j) => (
                    <li key={j} style={{ marginBottom: '4px' }}>{bullet}</li>
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
      const validSkills = skills.filter(s => s.name).map(s => s.name);
      if (!validSkills.length) return null;
      return (
        <div key="skills" style={styles.section}>
          <div style={styles.sectionTitle}>Skills</div>
          <div style={styles.desc}>{validSkills.join(' • ')}</div>
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
              </div>
              <div style={styles.desc}>{proj.description}</div>
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
      <hr style={styles.hr} />
      {sectionOrder
        .filter(key => enabledSections.includes(key) && key !== 'personal')
        .map(key => sectionRenderers[key] && sectionRenderers[key]())}
    </div>
  );
}
