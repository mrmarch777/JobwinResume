import React from 'react';

export default function SunsetTemplate({ resume }) {
  const { personal, summary, experience, education, skills } = resume;
  
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#2d3748', minHeight: '1123px', fontFamily: "'Poppins', sans-serif" }}>
      <header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: '#ffffff', padding: '50px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '42px', margin: '0 0 5px 0', fontWeight: 'bold' }}>{personal?.name || 'Your Name'}</h1>
          <h2 style={{ fontSize: '22px', margin: '0 0 20px 0', fontWeight: '500', opacity: 0.9 }}>{personal?.title || 'Job Title'}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '15px' }}>
            {personal?.email && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{personal.email}</span>}
            {personal?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{personal.phone}</span>}
            {personal?.location && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{personal.location}</span>}
          </div>
        </div>
        <div style={{ position: 'absolute', right: '-50px', bottom: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ position: 'absolute', right: '100px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
      </header>

      <div style={{ padding: '40px' }}>
        {summary && (
          <section style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '20px', color: '#FF6B6B', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '30px', height: '2px', background: '#FF6B6B', marginRight: '10px' }}></span>
              About Me
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#4a5568' }}>{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '20px', color: '#FF6B6B', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '30px', height: '2px', background: '#FF6B6B', marginRight: '10px' }}></span>
              Experience
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {experience.map((exp, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '140px', flexShrink: 0, color: '#FF8E53', fontWeight: '600', fontSize: '14px' }}>
                    {exp.startDate} - <br/>{exp.current ? 'Present' : exp.endDate}
                  </div>
                  <div>
                    <strong style={{ fontSize: '18px', color: '#2d3748', display: 'block' }}>{exp.title}</strong>
                    <div style={{ fontSize: '15px', color: '#718096', marginBottom: '10px', fontWeight: '500' }}>{exp.company}</div>
                    <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: '#4a5568', lineHeight: '1.7' }}>
                      {exp.bullets?.map((b, j) => <li key={j} style={{ marginBottom: '5px' }}>{b}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {education && education.length > 0 && (
            <section>
              <h3 style={{ fontSize: '20px', color: '#FF6B6B', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '30px', height: '2px', background: '#FF6B6B', marginRight: '10px' }}></span>
                Education
              </h3>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '15px' }}>
                  <strong style={{ display: 'block', fontSize: '16px', color: '#2d3748' }}>{edu.degree}</strong>
                  <div style={{ fontSize: '15px', color: '#718096' }}>{edu.field} • {edu.institution}</div>
                  <div style={{ fontSize: '14px', color: '#FF8E53', fontWeight: '500' }}>{edu.year || edu.endDate}</div>
                </div>
              ))}
            </section>
          )}

          {skills && skills.length > 0 && (
            <section>
              <h3 style={{ fontSize: '20px', color: '#FF6B6B', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '30px', height: '2px', background: '#FF6B6B', marginRight: '10px' }}></span>
                Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {skills.map((s, i) => (
                  <span key={i} style={{ background: '#FFF5F5', color: '#FF6B6B', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                    {s.name || s}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
