import React, { useState } from 'react';

export default function ExportPanel({ resume }) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingDOCX, setExportingDOCX] = useState(false);

  const getExportClone = () => {
    const source = document.getElementById('resume-preview-content');
    if (!source) return null;
    const clone = source.cloneNode(true);
    clone.style.transform = 'none';
    clone.style.width = '794px';
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.zIndex = '9999';
    clone.style.background = '#ffffff';
    clone.style.boxShadow = 'none';
    document.body.appendChild(clone);
    return clone;
  };

  const exportPDF = async () => {
    setExportingPDF(true);
    const clone = getExportClone();
    if (!clone) { setExportingPDF(false); return; }
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set({
        margin: 0,
        filename: `${resume.personal.name || 'Resume'}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }).from(clone).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      document.body.removeChild(clone);
      setExportingPDF(false);
    }
  };

  const exportDOCX = async () => {
    setExportingDOCX(true);
    const clone = getExportClone();
    if (!clone) { setExportingDOCX(false); return; }
    try {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>Resume</title></head>
        <body>${clone.innerHTML}</body>
        </html>
      `;
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.personal.name || 'Resume'}_Resume.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('DOCX export failed:', err);
    } finally {
      document.body.removeChild(clone);
      setExportingDOCX(false);
    }
  };

  return (
    <div style={{
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginTop: '20px',
      width: '100%',
      maxWidth: '500px',
      background: '#ffffff',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    }}>
      <button 
        style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: "'Inter', sans-serif", transition: 'opacity 0.2s',
          background: 'linear-gradient(135deg, #6C63FF, #FF6584)', color: '#fff',
        }} 
        onClick={exportPDF} 
        disabled={exportingPDF}
      >
        {exportingPDF ? 'Exporting...' : '⬇ Download PDF'}
      </button>
      <button 
        style={{
          padding: '10px 20px', borderRadius: '8px', fontWeight: '600',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: "'Inter', sans-serif", transition: 'opacity 0.2s',
          background: 'transparent', border: '2px solid #6C63FF', color: '#6C63FF',
        }} 
        onClick={exportDOCX} 
        disabled={exportingDOCX}
      >
        {exportingDOCX ? 'Exporting...' : '⬇ Download DOCX'}
      </button>
    </div>
  );
}
