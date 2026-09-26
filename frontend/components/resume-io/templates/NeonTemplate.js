import React from 'react';

export default function NeonTemplate({ resume }) {
  const { personal, summary, experience, education, skills } = resume;
  
  return (
    <div style={{ backgroundColor: '#0D1117', color: '#C9D1D9', padding: '40px', minHeight: '1123px', fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>
      <header style={{ borderBottom: '2px solid #00FF88', paddingBottom: '20px', marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#00FF88', fontSize: '36px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {personal?.name || 'Your Name'}
        </h1>
        <h2 style={{ color: '#C9D1D9', fontSize: '20px', margin: '0 0 15px 0' }}>{personal?.title || 'Job Title'}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '14px', color: '#8B949E' }}>
          {personal?.email && <span>{personal.email}</span>}
          {personal?.phone && <span>{personal.phone}</span>}
          {personal?.location && <span>{personal.location}</span>}
        </div>
      </header>
      
      {summary && (
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#00FF88', fontSize: '18px', borderLeft: '4px solid #00FF88', paddingLeft: '10px', marginBottom: '15px' }}>SUMMARY</h3>
          <p style={{ lineHeight: '1.6', fontSize: '14px' }}>{summary}</p>
        </section>
      )}
      
      {experience && experience.length > 0 && (
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#00FF88', fontSize: '18px', borderLeft: '4px solid #00FF88', paddingLeft: '10px', marginBottom: '15px' }}>EXPERIENCE</h3>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong style={{ color: '#C9D1D9', fontSize: '16px' }}>{exp.title} <span style={{ color: '#8B949E' }}>@ {exp.company}</span></strong>
                <span style={{ color: '#00FF88', fontSize: '14px' }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0', color: '#C9D1D9', fontSize: '14px' }}>
                {exp.bullets?.map((b, j) => <li key={j} style={{ marginBottom: '5px' }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {skills && skills.length > 0 && (
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#00FF88', fontSize: '18px', borderLeft: '4px solid #00FF88', paddingLeft: '10px', marginBottom: '15px' }}>SKILLS</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {skills.map((s, i) => (
              <span key={i} style={{ border: '1px solid #00FF88', color: '#00FF88', padding: '4px 10px', borderRadius: '4px', fontSize: '13px' }}>
                {s.name || s}
              </span>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#00FF88', fontSize: '18px', borderLeft: '4px solid #00FF88', paddingLeft: '10px', marginBottom: '15px' }}>EDUCATION</h3>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>{edu.degree} in {edu.field}</strong>
                <span style={{ color: '#8B949E', fontSize: '14px' }}>{edu.institution}</span>
              </div>
              <span style={{ color: '#00FF88', fontSize: '14px' }}>{edu.year || edu.endDate}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
