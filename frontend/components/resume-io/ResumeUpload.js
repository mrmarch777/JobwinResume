import React, { useState } from 'react';

export default function ResumeUpload({ onDataExtracted, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progressMsg, setProgressMsg] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setProgressMsg('Uploading file...');
    
    try {
      // Validate file
      const ext = file.name.toLowerCase().split('.').pop();
      if (!['pdf', 'docx', 'doc'].includes(ext)) {
        throw new Error('Unsupported file format. Please upload a PDF or Word document.');
      }
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File is too large. Maximum size is 50MB.');
      }

      setProgressMsg('Sending to AI for analysis...');

      // Send file directly to server — no client-side PDF parsing needed
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      setProgressMsg('Organizing resume data...');

      const parsedData = result.data;

      // Adapt parsedData to the shape the UI expects
      const adapted = {
        personal: {
          name: parsedData.name || '',
          email: parsedData.email || '',
          phone: parsedData.phone || '',
          title: parsedData.title || '',
          location: parsedData.location || '',
          linkedin: parsedData.linkedin || ''
        },
        summary: parsedData.summary || '',
        experience: (parsedData.experience || []).map((exp, i) => ({
          id: `exp-${i}`,
          title: exp.role || exp.title || '',
          company: exp.company || '',
          startDate: exp.from || exp.startDate || '',
          endDate: exp.to || exp.endDate || '',
          current: exp.current || (exp.to && /present|current|now/i.test(exp.to)),
          location: exp.location || '',
          bullets: exp.bullets || exp.responsibilities || []
        })),
        education: (parsedData.education || []).map((edu, i) => ({
          id: `edu-${i}`,
          degree: edu.degree || '',
          institution: edu.institution || '',
          field: edu.field || '',
          startDate: edu.from || '',
          endDate: edu.to || '',
          current: false,
          grade: edu.grade || ''
        })),
        skills: {
          items: (parsedData.skills || []).map((skill, i) => ({
            id: `skill-${i}`,
            name: typeof skill === 'string' ? skill : (skill.name || ''),
            level: 'Skillful'
          }))
        },
        projects: (parsedData.projects || []).map((proj, i) => ({
          id: `proj-${i}`,
          title: proj.title || proj.name || '',
          subtitle: proj.subtitle || proj.technologies || '',
          url: proj.url || '',
          description: proj.description || ''
        })),
        certifications: (parsedData.certifications || []).map((cert, i) => ({
          id: `cert-${i}`,
          name: cert.name || cert.title || '',
          issuer: cert.issuer || cert.organization || '',
          date: cert.date || ''
        })),
        languages: (parsedData.languages || []).map((lang, i) => ({
          id: `lang-${i}`,
          name: typeof lang === 'string' ? lang : (lang.name || ''),
          proficiency: lang.proficiency || lang.level || 'Working knowledge'
        })),
        achievements: (parsedData.achievements || []).map((ach, i) => ({
          id: `ach-${i}`,
          title: typeof ach === 'string' ? ach : (ach.title || ''),
          description: typeof ach === 'string' ? '' : (ach.description || ''),
          date: typeof ach === 'string' ? '' : (ach.date || '')
        }))
      };
      
      onDataExtracted(adapted);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to parse resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px', position: 'relative', fontFamily: "'Inter', sans-serif", boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '24px' }}>✕</button>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginTop: 0, marginBottom: '8px' }}>Import Your Resume</h2>
        <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '15px' }}>Upload your existing resume to pre-fill the editor. AI will extract all sections automatically.</p>
        
        <div style={{ border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', position: 'relative', background: '#F9FAFB', transition: 'border-color 0.2s' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
              <div style={{ color: '#2563EB', fontWeight: '600', marginBottom: '8px' }}>Processing document...</div>
              <div style={{ color: '#6B7280', fontSize: '13px' }}>{progressMsg}</div>
              <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px', color: '#374151', fontWeight: '500' }}>Drag & Drop or click to upload</div>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }} />
              <button style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Choose File</button>
            </>
          )}
        </div>
        
        {error && <div style={{ color: '#EF4444', marginTop: '16px', textAlign: 'center', fontSize: '14px', background: '#FEF2F2', padding: '12px', borderRadius: '8px' }}>{error}</div>}
        <div style={{ color: '#9CA3AF', marginTop: '16px', textAlign: 'center', fontSize: '13px' }}>Supports .pdf, .doc, .docx formats (Max 50MB)</div>
      </div>
    </div>
  );
}
