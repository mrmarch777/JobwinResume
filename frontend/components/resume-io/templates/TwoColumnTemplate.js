import React from 'react';

const fontSizes = { small: { name: '24px', title: '13px', heading: '14px', body: '11px', small: '10px' }, medium: { name: '28px', title: '15px', heading: '16px', body: '12px', small: '11px' }, large: { name: '32px', title: '17px', heading: '18px', body: '13px', small: '12px' } };
const spacings = { compact: { section: '12px', item: '6px', line: '1.3' }, normal: { section: '20px', item: '10px', line: '1.5' }, spacious: { section: '28px', item: '14px', line: '1.7' } };

export default function TwoColumnTemplate({ resume }) {
  const { accentColor = '#6C63FF', fontFamily = 'DM Sans', fontSize = 'medium', spacing = 'normal', personal = {}, summary = '', experience = [], education = [], skills = [], projects = [], enabledSections = [] } = resume;
  const fSize = fontSizes[fontSize] || fontSizes.medium;
  const spc = spacings[spacing] || spacings.normal;

  const styles = {
    container: { width: '100%', maxWidth: '794px', minHeight: '1123px', margin: '0 auto', backgroundColor: '#FFFFFF', color: '#333333', fontFamily: fontFamily, fontSize: fSize.body, lineHeight: spc.line, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { padding: '40px 40px 20px 40px', textAlign: 'left', borderBottom: `4px solid ${accentColor}` },
    name: { fontSize: fSize.name, fontWeight: 'bold', color: '#000000', marginBottom: '4px', textTransform: 'uppercase' },
    title: { fontSize: fSize.title, color: '#555555', fontWeight: '500' },
    columnsContainer: { display: 'flex', flex: 1, padding: '0 40px 40px 40px' },
    leftColumn: { flex: '0 0 55%', paddingRight: '25px', borderRight: `1px solid ${accentColor}`, paddingTop: '20px' },
    rightColumn: { flex: '0 0 45%', paddingLeft: '25px', paddingTop: '20px' },
    section: { marginBottom: spc.section },
    sectionTitle: { fontSize: fSize.heading, fontWeight: 'bold', color: accentColor, textTransform: 'uppercase', marginBottom: spc.item, letterSpacing: '1px' },
    item: { marginBottom: spc.item },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' },
    itemTitle: { fontWeight: 'bold', color: '#000000' },
    itemDate: { fontSize: fSize.small, color: '#666666' },
    itemSubtitle: { fontWeight: 'bold', color: '#444444' },
    itemDesc: { marginTop: '4px' },
    contactItem: { display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: fSize.small },
    contactIcon: { color: accentColor, marginRight: '10px', fontWeight: 'bold', width: '20px' },
    skillItem: { marginBottom: '8px' },
    skillHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: fSize.small },
    skillDotsContainer: { display: 'flex', gap: '4px' },
    skillDot: (active) => ({ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: active ? accentColor : '#DDDDDD' })
  };

  const renderDots = (level) => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(<div key={i} style={styles.skillDot(i <= level)}></div>);
    }
    return <div style={styles.skillDotsContainer}>{dots}</div>;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.name}>{personal.name || 'Your Name'}</div>
        {personal.title && <div style={styles.title}>{personal.title}</div>}
      </div>
      
      <div style={styles.columnsContainer}>
        {/* LEFT COLUMN */}
        <div style={styles.leftColumn}>
          {enabledSections.includes('summary') && summary && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Summary</div>
              <div>{summary}</div>
            </div>
          )}

          {enabledSections.includes('experience') && experience.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Experience</div>
              {experience.map((exp, i) => (
                <div key={i} style={styles.item}>
                  <div style={styles.itemHeader}><div style={styles.itemTitle}>{exp.title}</div><div style={styles.itemDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div></div>
                  <div style={styles.itemSubtitle}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                  {exp.bullets && exp.bullets.length > 0 && <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>{exp.bullets.filter(b => b).map((bullet, j) => <li key={j} style={{ marginBottom: '2px' }}>{bullet}</li>)}</ul>}
                </div>
              ))}
            </div>
          )}

          {enabledSections.includes('projects') && projects.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Projects</div>
              {projects.map((proj, i) => (
                <div key={i} style={styles.item}>
                  <div style={styles.itemHeader}><div style={styles.itemTitle}>{proj.name}</div></div>
                  <div style={styles.itemSubtitle}>{proj.technologies}</div>
                  <div style={styles.itemDesc}>{proj.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={styles.rightColumn}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Contact</div>
            {personal.email && <div style={styles.contactItem}><span style={styles.contactIcon}>✉</span> {personal.email}</div>}
            {personal.phone && <div style={styles.contactItem}><span style={styles.contactIcon}>☏</span> {personal.phone}</div>}
            {personal.location && <div style={styles.contactItem}><span style={styles.contactIcon}>⚲</span> {personal.location}</div>}
            {personal.linkedin && <div style={styles.contactItem}><span style={styles.contactIcon}>in</span> {personal.linkedin}</div>}
            {personal.website && <div style={styles.contactItem}><span style={styles.contactIcon}>🌐</span> {personal.website}</div>}
          </div>

          {enabledSections.includes('skills') && skills.filter(s => s.name).length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Skills</div>
              {skills.filter(s => s.name).map((s, i) => (
                <div key={i} style={styles.skillItem}>
                  <div style={styles.skillHeader}><span>{s.name}</span></div>
                  {renderDots(s.level || 4)}
                </div>
              ))}
            </div>
          )}

          {enabledSections.includes('education') && education.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Education</div>
              {education.map((edu, i) => (
                <div key={i} style={{ ...styles.item, marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>{edu.degree}</div>
                  <div>{edu.field}</div>
                  <div style={{ color: '#555', fontSize: fSize.small }}>{edu.institution} | {edu.year}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
