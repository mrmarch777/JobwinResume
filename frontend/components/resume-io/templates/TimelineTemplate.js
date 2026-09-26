import React from 'react';

export default function TimelineTemplate({ resume }) {
  const { personal, summary, experience, education, skills } = resume;
  const accent = resume.accentColor || '#3B82F6';
  
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#1f2937', minHeight: '1123px', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '35%', backgroundColor: '#f3f4f6', padding: '40px', borderRight: `4px solid ${accent}` }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#111827', lineHeight: '1.2' }}>{personal?.name || 'Your Name'}</h1>
        <h2 style={{ fontSize: '18px', color: accent, margin: '0 0 30px 0', fontWeight: '500' }}>{personal?.title || 'Job Title'}</h2>
        
        <div style={{ marginBottom: '40px', fontSize: '14px', lineHeight: '2' }}>
          {personal?.email && <div>✉ {personal.email}</div>}
          {personal?.phone && <div>☎ {personal.phone}</div>}
          {personal?.location && <div>📍 {personal.location}</div>}
        </div>

        {skills && skills.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', borderBottom: `2px solid ${accent}`, paddingBottom: '5px' }}>Skills</h3>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {skills.map((s, i) => (
                <li key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>• {s.name || s}</li>
              ))}
            </ul>
          </div>
        )}
        
        {education && education.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', borderBottom: `2px solid ${accent}`, paddingBottom: '5px' }}>Education</h3>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{edu.degree}</div>
                <div style={{ fontSize: '13px', color: '#4b5563' }}>{edu.institution}</div>
                <div style={{ fontSize: '12px', color: accent }}>{edu.year || edu.endDate}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: '65%', padding: '40px 40px 40px 50px' }}>
        {summary && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '15px' }}>About Me</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#4b5563' }}>{summary}</p>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '25px' }}>Experience</h3>
            <div style={{ position: 'relative', borderLeft: `2px solid ${accent}`, paddingLeft: '25px' }}>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '30px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-32px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: accent, border: '2px solid #fff' }} />
                  <div style={{ fontSize: '13px', color: accent, fontWeight: 'bold', marginBottom: '5px' }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{exp.title}</div>
                  <div style={{ fontSize: '15px', color: '#4b5563', marginBottom: '10px' }}>{exp.company}</div>
                  <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                    {exp.bullets?.map((b, j) => <li key={j} style={{ marginBottom: '6px' }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
