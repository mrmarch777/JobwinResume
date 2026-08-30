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

export default function ClassicTemplate({ resume }) {
  const {
    accentColor = '#6C63FF',
    fontFamily = 'DM Sans',
    fontSize = 'medium',
    spacing = 'normal',
    skillsLayout = 'Inline',
    skillsColumns = 2,
    showSkillLevel = true,
    personal = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    achievements = [],
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
      padding: '40px',
      boxSizing: 'border-box'
    },
    header: { textAlign: 'center', marginBottom: spc.section },
    name: { fontSize: fSize.name, fontWeight: 'bold', color: '#000000', marginBottom: '4px' },
    title: { fontSize: fSize.title, color: '#555555', marginBottom: '8px' },
    contact: { fontSize: fSize.small, color: '#666666', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' },
    hr: { border: 'none', borderBottom: `2px solid ${accentColor}`, margin: `${spc.item} 0 ${spc.section} 0` },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', marginBottom: spc.item },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
    itemTitle: { fontWeight: 'bold', color: '#000000' },
    itemDate: { fontSize: fSize.small, color: '#555555' },
    itemSubtitle: { fontStyle: 'italic', color: '#444444' },
    itemDesc: { marginTop: '4px' }
  };

  const renderContact = () => {
    const parts = [];
    if (personal.email) parts.push(personal.email);
    if (personal.phone) parts.push(personal.phone);
    if (personal.location) parts.push(personal.location);
    if (personal.linkedin) parts.push(personal.linkedin);
    if (personal.website) parts.push(personal.website);
    return parts.join(' | ');
  };

  const sectionRenderers = {
    summary: () => {
      if (!summary) return null;
      return (
        <div key="summary" style={styles.section}>
          <div style={styles.sectionTitle}>Professional Summary</div>
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
          <div style={styles.sectionTitle}>Education</div>
          {education.map((edu, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                <div style={styles.itemDate}>{edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.current ? 'Present' : (edu.endDate || edu.year || '')}</div>
              </div>
              <div style={styles.itemSubtitle}>{edu.institution}{edu.grade ? ` | ${edu.grade}` : ''}</div>
            </div>
          ))}
        </div>
      );
    },
    skills: () => {
      const skillsList = Array.isArray(skills) ? skills : (skills?.items || []);
      if (!skillsList.length) return null;
      const validSkills = skillsList.filter(s => s.name);
      if (!validSkills.length) return null;
      return (
        <div key="skills" style={styles.section}>
          <div style={styles.sectionTitle}>Skills</div>
          {skillsLayout === 'Columns' ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${skillsColumns}, 1fr)`, gap: '4px 16px' }}>
              {validSkills.map((s, i) => (
                <div key={i} style={{ fontSize: fSize.body, color: '#333' }}>• {s.name}</div>
              ))}
            </div>
          ) : (
            <div>{validSkills.map(s => s.name).join(', ')}</div>
          )}
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
                <div style={styles.itemTitle}>{proj.title || proj.name}</div>
                {(proj.url) && <div style={styles.itemDate}>{proj.url}</div>}
              </div>
              {(proj.subtitle || proj.technologies) && <div style={styles.itemSubtitle}>{proj.subtitle || proj.technologies}</div>}
              {proj.description && <div style={styles.itemDesc}>{proj.description}</div>}
            </div>
          ))}
        </div>
      );
    },
    certifications: () => {
      if (!certifications.length) return null;
      return (
        <div key="certifications" style={styles.section}>
          <div style={styles.sectionTitle}>Certifications</div>
          {certifications.map((cert, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{cert.name}</div>
                {cert.date && <div style={styles.itemDate}>{cert.date}</div>}
              </div>
              {cert.issuer && <div style={styles.itemSubtitle}>{cert.issuer}</div>}
            </div>
          ))}
        </div>
      );
    },
    languages: () => {
      if (!languages.length) return null;
      return (
        <div key="languages" style={styles.section}>
          <div style={styles.sectionTitle}>Languages</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {languages.map((lang, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 'bold', color: '#000' }}>{lang.name}</span>
                {(lang.proficiency || lang.level) && (
                  <span style={{ fontSize: fSize.small, color: '#666' }}>— {lang.proficiency || lang.level}</span>
                )}
                {i < languages.length - 1 && <span style={{ color: '#ccc' }}>|</span>}
              </div>
            ))}
          </div>
        </div>
      );
    },
    achievements: () => {
      if (!achievements.length) return null;
      return (
        <div key="achievements" style={styles.section}>
          <div style={styles.sectionTitle}>Achievements</div>
          {achievements.map((ach, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>{ach.title || ach}</div>
                {ach.date && <div style={styles.itemDate}>{ach.date}</div>}
              </div>
              {ach.description && <div style={styles.itemDesc}>{ach.description}</div>}
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
        {personal.title && <div style={styles.title}>{personal.title}</div>}
        <div style={styles.contact}>{renderContact()}</div>
      </div>
      <hr style={styles.hr} />
      {sectionOrder
        .filter(key => enabledSections.includes(key) && key !== 'personal')
        .map(key => sectionRenderers[key] && sectionRenderers[key]())}
    </div>
  );
}
