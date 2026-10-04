import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

export default function AIResumeBuilder() {
  const router = useRouter();
  const { t } = useTheme();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [personal, setPersonal] = useState({ name: '', email: '', phone: '', location: '', linkedin: '', title: '' });
  const [experience, setExperience] = useState([{ company: '', title: '', startDate: '', endDate: '', current: false, description: '' }]);
  const [education, setEducation] = useState([{ institution: '', degree: '', field: '', year: '', grade: '' }]);
  const [skills, setSkills] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (msg, type='error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-from-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personal, experience, education, skills })
      });
      const data = await res.json();
      if (data.resume) {
        localStorage.setItem('jobwin_wizard_resume', JSON.stringify(data.resume));
        router.push('/resume-io?from=wizard');
      } else {
        showToast('Failed to generate resume.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating resume.');
    }
    setLoading(false);
  };

  const addExperience = () => {
    if (experience.length < 5) {
      setExperience([...experience, { company: '', title: '', startDate: '', endDate: '', current: false, description: '' }]);
    }
  };

  const addEducation = () => {
    if (education.length < 3) {
      setEducation([...education, { institution: '', degree: '', field: '', year: '', grade: '' }]);
    }
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  const updateEducation = (index, field, value) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
  };

  const inputStyle = {
    width: '100%', padding: '12px', background: t.inputBg, border: `1px solid ${t.border}`, 
    borderRadius: '8px', color: t.text, outline: 'none', marginBottom: '16px'
  };

  const btnStyle = {
    padding: '12px 24px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '14px 20px', background: toast.type === 'error' ? '#DC2626' : '#059669', color: 'white', borderRadius: '10px', fontWeight: '600', fontSize: '14px', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', marginLeft: '240px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: t.sidebar, padding: '32px', borderRadius: '16px', border: `1px solid ${t.border}` }}>
          <h1 style={{ color: t.text, marginTop: 0, marginBottom: '8px' }}>✨ AI Resume Builder Wizard</h1>
          <p style={{ color: t.muted, marginBottom: '32px' }}>Step {step} of 5</p>

          {step === 1 && (
            <div>
              <h2 style={{ color: t.text }}>Personal Information</h2>
              <input style={inputStyle} placeholder="Full Name" value={personal.name} onChange={e => setPersonal({...personal, name: e.target.value})} />
              <input style={inputStyle} placeholder="Target Job Title (e.g. Software Engineer)" value={personal.title} onChange={e => setPersonal({...personal, title: e.target.value})} />
              <input style={inputStyle} placeholder="Email" type="email" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} />
              <input style={inputStyle} placeholder="Phone" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} />
              <input style={inputStyle} placeholder="Location (City, Country)" value={personal.location} onChange={e => setPersonal({...personal, location: e.target.value})} />
              <input style={inputStyle} placeholder="LinkedIn URL" value={personal.linkedin} onChange={e => setPersonal({...personal, linkedin: e.target.value})} />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: t.text }}>Work Experience</h2>
              {experience.map((exp, i) => (
                <div key={i} style={{ padding: '16px', border: `1px solid ${t.border}`, borderRadius: '8px', marginBottom: '16px' }}>
                  <input style={inputStyle} placeholder="Company" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
                  <input style={inputStyle} placeholder="Job Title" value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} />
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <input style={inputStyle} placeholder="Start Date (MM/YYYY)" value={exp.startDate} onChange={e => updateExperience(i, 'startDate', e.target.value)} />
                    <input style={inputStyle} placeholder="End Date (MM/YYYY)" value={exp.endDate} onChange={e => updateExperience(i, 'endDate', e.target.value)} disabled={exp.current} />
                  </div>
                  <label style={{ color: t.text, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <input type="checkbox" checked={exp.current} onChange={e => updateExperience(i, 'current', e.target.checked)} />
                    I currently work here
                  </label>
                  <textarea style={{...inputStyle, height: '100px', resize: 'vertical'}} placeholder="Key responsibilities and achievements..." value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} />
                </div>
              ))}
              {experience.length < 5 && (
                <button onClick={addExperience} style={{ padding: '8px 16px', background: 'transparent', color: '#6C63FF', border: '1px solid #6C63FF', borderRadius: '8px', cursor: 'pointer' }}>
                  + Add Another Job
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ color: t.text }}>Education</h2>
              {education.map((edu, i) => (
                <div key={i} style={{ padding: '16px', border: `1px solid ${t.border}`, borderRadius: '8px', marginBottom: '16px' }}>
                  <input style={inputStyle} placeholder="Institution" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} />
                  <input style={inputStyle} placeholder="Degree (e.g. B.S., M.A.)" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} />
                  <input style={inputStyle} placeholder="Field of Study" value={edu.field} onChange={e => updateEducation(i, 'field', e.target.value)} />
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <input style={inputStyle} placeholder="Year" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} />
                    <input style={inputStyle} placeholder="Grade (Optional)" value={edu.grade} onChange={e => updateEducation(i, 'grade', e.target.value)} />
                  </div>
                </div>
              ))}
              {education.length < 3 && (
                <button onClick={addEducation} style={{ padding: '8px 16px', background: 'transparent', color: '#6C63FF', border: '1px solid #6C63FF', borderRadius: '8px', cursor: 'pointer' }}>
                  + Add Another Degree
                </button>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ color: t.text }}>Skills</h2>
              <p style={{ color: t.muted, marginBottom: '16px' }}>Enter your skills separated by commas.</p>
              <textarea 
                style={{...inputStyle, height: '120px', resize: 'vertical'}} 
                placeholder="JavaScript, React, Node.js, Project Management, Agile..." 
                value={skills} 
                onChange={e => setSkills(e.target.value)} 
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Python', 'SQL'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSkills(prev => prev ? prev + ', ' + s : s)}
                    style={{ background: 'rgba(108,99,255,0.1)', color: '#6C63FF', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪄</div>
              <h2 style={{ color: t.text }}>Ready to generate!</h2>
              <p style={{ color: t.muted, maxWidth: '400px', margin: '0 auto 32px' }}>
                Our AI will now take your information, write a professional summary, and enhance your experience bullets to be impactful and action-oriented.
              </p>
              <button onClick={handleGenerate} disabled={loading} style={{...btnStyle, padding: '16px 32px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Generating...' : '✨ Generate My Resume with AI'}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${t.border}` }}>
            {step > 1 ? (
              <button onClick={handlePrev} style={{ padding: '12px 24px', background: 'transparent', color: t.text, border: `1px solid ${t.border}`, borderRadius: '8px', cursor: 'pointer' }}>
                ← Back
              </button>
            ) : <div></div>}
            
            {step < 5 && (
              <button onClick={handleNext} style={btnStyle}>
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
