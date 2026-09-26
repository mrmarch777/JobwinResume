import React from 'react';

export default function NavyTemplate({ resume }) {
  const { personal, summary, experience, education, skills } = resume;
  const headerBg = '#1E3A5F';
  
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#333333', minHeight: '1123px', fontFamily: "'Georgia', serif" }}>
      <header style={{ backgroundColor: headerBg, color: '#ffffff', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', margin: '0 0 10px 0', fontWeight: 'normal', letterSpacing: '1px' }}>{personal?.name || 'Your Name'}</h1>
        <h2 style={{ fontSize: '20px', margin: '0 0 20px 0', color: '#A9BEDA', fontWeight: 'normal' }}>{personal?.title || 'Job Title'}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '14px', color: '#ffffff' }}>
          {personal?.email && <span>{personal.email}</span>}
          {personal?.phone && <span>{personal.phone}</span>}
          {personal?.location && <span>{personal.location}</span>}
          {personal?.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </header>

      <div style={{ padding: '40px' }}>
        {summary && (
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', color: headerBg, borderBottom: `1px solid ${headerBg}`, paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase' }}>Professional Summary</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', fontFamily: "'Arial', sans-serif" }}>{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', color: headerBg, borderBottom: `1px solid ${headerBg}`, paddingBottom: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>Professional Experience</h3>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '20px', fontFamily: "'Arial', sans-serif" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                  <strong style={{ fontSize: '16px', color: '#000' }}>{exp.title}</strong>
                  <span style={{ fontSize: '14px', color: '#666' }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div style={{ fontStyle: 'italic', fontSize: '15px', color: '#444', marginBottom: '10px' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                  {exp.bullets?.map((b, j) => <li key={j} style={{ marginBottom: '4px' }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        <div style={{ display: 'flex', gap: '40px', fontFamily: "'Arial', sans-serif" }}>
          {education && education.length > 0 && (
            <section style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', color: headerBg, borderBottom: `1px solid ${headerBg}`, paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontFamily: "'Georgia', serif" }}>Education</h3>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '15px' }}>
                  <strong style={{ display: 'block', fontSize: '15px', color: '#000' }}>{edu.degree} in {edu.field}</strong>
                  <div style={{ fontSize: '14px', color: '#444' }}>{edu.institution}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{edu.year || edu.endDate}</div>
                </div>
              ))}
            </section>
          )}

          {skills && skills.length > 0 && (
            <section style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', color: headerBg, borderBottom: `1px solid ${headerBg}`, paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontFamily: "'Georgia', serif" }}>Core Competencies</h3>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {skills.map((s, i) => (
                  <li key={i} style={{ fontSize: '14px' }}>{s.name || s}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
