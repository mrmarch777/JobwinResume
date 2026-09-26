import React from 'react';

export default function CompactTemplate({ resume }) {
  const { personal, summary, experience, education, skills } = resume;
  
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#000000', padding: '25px', minHeight: '1123px', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <header style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '10px', marginBottom: '15px' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 2px 0', textTransform: 'uppercase' }}>{personal?.name || 'Your Name'}</h1>
        <div style={{ fontSize: '12px', color: '#333' }}>
          {personal?.email && <span style={{ margin: '0 5px' }}>{personal.email}</span>}
          {personal?.phone && <span style={{ margin: '0 5px' }}>| {personal.phone}</span>}
          {personal?.location && <span style={{ margin: '0 5px' }}>| {personal.location}</span>}
          {personal?.linkedin && <span style={{ margin: '0 5px' }}>| {personal.linkedin}</span>}
        </div>
      </header>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Main Column */}
        <div style={{ flex: '0 0 65%' }}>
          {summary && (
            <section style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', margin: '0 0 5px 0' }}>Summary</h3>
              <p style={{ fontSize: '11px', lineHeight: '1.4', margin: 0 }}>{summary}</p>
            </section>
          )}

          {experience && experience.length > 0 && (
            <section style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', margin: '0 0 5px 0' }}>Experience</h3>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <strong>{exp.title}</strong>
                    <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontStyle: 'italic', marginBottom: '3px' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                  <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '11px', lineHeight: '1.3' }}>
                    {exp.bullets?.map((b, j) => <li key={j} style={{ marginBottom: '2px' }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Side Column */}
        <div style={{ flex: '0 0 32%' }}>
          {skills && skills.length > 0 && (
            <section style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', margin: '0 0 5px 0' }}>Skills</h3>
              <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '11px', lineHeight: '1.4' }}>
                {skills.map((s, i) => <li key={i}>{s.name || s}</li>)}
              </ul>
            </section>
          )}

          {education && education.length > 0 && (
            <section style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', margin: '0 0 5px 0' }}>Education</h3>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '8px', fontSize: '11px' }}>
                  <strong>{edu.degree}</strong>
                  <div>{edu.field}</div>
                  <div>{edu.institution}</div>
                  <div>{edu.year || edu.endDate}</div>
                </div>
              ))}
            </section>
          )}
          
          {resume.certifications && resume.certifications.length > 0 && (
            <section style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #ccc', margin: '0 0 5px 0' }}>Certifications</h3>
              {resume.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: '5px', fontSize: '11px' }}>
                  <strong>{cert.name}</strong>
                  <div>{cert.issuer} ({cert.year || cert.date})</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
