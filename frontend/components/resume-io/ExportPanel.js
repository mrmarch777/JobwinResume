import React, { useState } from 'react';
import { useTheme } from '../../lib/contexts';

export default function ExportPanel({ resume }) {
  const { theme } = useTheme();
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingDOCX, setExportingDOCX] = useState(false);

  const exportPDF = async () => {
    setExportingPDF(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('resume-preview');
      const opt = {
        margin: 0,
        filename: `${resume.personal.name || 'Resume'}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    }
    setExportingPDF(false);
  };

  const exportDOCX = async () => {
    setExportingDOCX(true);
    try {
      // Basic simulated DOCX export (can be enhanced with proper lib later)
      const element = document.getElementById('resume-preview');
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>Resume</title></head>
        <body>${element.innerHTML}</body>
        </html>
      `;
      const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.personal.name || 'Resume'}_Resume.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('DOCX export failed:', err);
    }
    setExportingDOCX(false);
  };

  const containerStyle = {
    background: 'var(--theme-card)',
    border: `1px solid var(--theme-border)`, // Keeping dark theme elements on light bg is tricky, let's use standard light theme styling since it's in the preview panel
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '20px',
    width: '100%',
    maxWidth: '500px',
    background: '#ffffff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  };

  const btnStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  };

  const pdfBtnStyle = {
    ...btnStyle,
    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
    color: '#fff',
  };

  const docxBtnStyle = {
    ...btnStyle,
    background: 'transparent',
    border: '2px solid #6C63FF',
    color: '#6C63FF',
  };

  return (
    <div style={containerStyle}>
      <button 
        style={pdfBtnStyle} 
        onClick={exportPDF} 
        disabled={exportingPDF}
        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
      >
        {exportingPDF ? 'Exporting...' : '⬇ Download PDF'}
      </button>
      <button 
        style={docxBtnStyle} 
        onClick={exportDOCX} 
        disabled={exportingDOCX}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(108,99,255,0.05)'}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        {exportingDOCX ? 'Exporting...' : '⬇ Download DOCX'}
      </button>
    </div>
  );
}
