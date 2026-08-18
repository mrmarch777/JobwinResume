import React, { useState } from 'react';

export default function ResumeUpload({ onDataExtracted, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  const parseResumeText = (text) => {
    const result = { personal: {}, summary: '', experience: [], education: [], skills: [] };
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.personal.email = emailMatch[0];
    const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
    if (phoneMatch) result.personal.phone = phoneMatch[0].trim();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines[0]) result.personal.name = lines[0].trim().substring(0, 50);
    return result;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await extractTextFromPDF(file);
      const parsedData = parseResumeText(text);
      onDataExtracted(parsedData);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to parse PDF. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#09090f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#E8E6F0', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        <h2 style={{ fontFamily: "'Noto Serif', serif", color: '#E8E6F0', marginTop: 0 }}>Import Your Resume</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Upload your existing resume to pre-fill the editor</p>
        
        <div style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📄</div>
          {loading ? (
            <div style={{ color: '#6C63FF' }}>Parsing PDF...</div>
          ) : (
            <>
              <div style={{ marginBottom: '12px', color: '#E8E6F0' }}>Drag & Drop or click to upload</div>
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }} />
              <button style={{ background: '#6C63FF', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Choose File</button>
            </>
          )}
        </div>
        
        {error && <div style={{ color: '#FF6584', marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
        <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: '16px', textAlign: 'center', fontSize: '12px' }}>PDF files supported</div>
      </div>
    </div>
  );
}
