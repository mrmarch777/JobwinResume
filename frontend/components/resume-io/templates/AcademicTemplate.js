import React from 'react';

export default function AcademicTemplate({ resume }) {
  const { personal, summary, experience, education, skills, projects, certifications } = resume;
  
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#000000', padding: '50px', minHeight: '1123px', fontFamily: "'Times New Roman', Times, serif" }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', fontWeight: 'bold' }}>{personal?.name || 'Your Name'}</h1>
        <div style={{ fontSize: '14px' }}>
          {personal?.location && <span>{personal.location}</span>}
          {personal?.email && <span> • {personal.email}</span>}
          {personal?.phone && <span> • {personal.phone}</span>}
          {personal?.linkedin && <span> • {personal.linkedin}</span>}
        </div>
      </header>

      {summary && (
        <section style={{ marginBottom: '25px' }}>
          <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, textAlign: 'justify' }}>{summary}</p>
        </section>
      )}

      {education && education.length > 0 && (
        <section style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 15px 0' }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <strong>{edu.institution}</strong>
                <span>{edu.year || edu.endDate}</span>
              </div>
              <div style={{ fontSize: '14px', fontStyle: 'italic' }}>{edu.degree} in {edu.field}</div>
              {edu.grade && <div style={{ fontSize: '13px', marginTop: '3px' }}>GPA/Grade: {edu.grade}</div>}
            </div>
          ))}
        </section>
      )}

      {experience && experience.length > 0 && (
        <section style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 15px 0' }}>Research & Professional Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <strong>{exp.title}</strong>
                <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '5px' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                {exp.bullets?.map((b, j) => <li key={j} style={{ marginBottom: '4px', textAlign: 'justify' }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {projects && projects.length > 0 && (
        <section style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 15px 0' }}>Publications & Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '10px', fontSize: '14px' }}>
              <strong>{proj.name || proj.title}</strong>: {proj.description} {proj.technologies && <i>({proj.technologies})</i>}
            </div>
          ))}
        </section>
      )}

      {skills && skills.length > 0 && (
        <section style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 15px 0' }}>Technical Skills & Competencies</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {skills.map(s => s.name || s).join(', ')}
          </div>
        </section>
      )}
    </div>
  );
}
