import React, { useEffect, useState, useRef } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

export default function LivePreview({ resume, TemplateComponent }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // A4 proportions
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const aspect_ratio = A4_HEIGHT_MM / A4_WIDTH_MM;
  const BASE_WIDTH = 794; // approx A4 width in pixels at 96dpi
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement.clientWidth;
        // Padding around the paper
        const padding = 40;
        const availableWidth = parentWidth - padding * 2;
        
        // Calculate scale to fit width
        const newScale = Math.min(1, availableWidth / BASE_WIDTH);
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const wrapperStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    transformOrigin: 'top center',
    transform: `scale(${scale})`,
    marginBottom: `${(BASE_WIDTH * aspect_ratio) * scale - (BASE_WIDTH * aspect_ratio) + 20}px` // Adjust for scale offset
  };

  const paperStyle = {
    width: `${BASE_WIDTH}px`,
    height: `${BASE_WIDTH * aspect_ratio}px`,
    background: '#ffffff',
    color: '#000000',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={wrapperStyle}>
        <div id="resume-preview" style={paperStyle}>
          {TemplateComponent ? (
            <TemplateComponent resume={resume} />
          ) : (
            <TemplateRenderer resume={resume} />
          )}
        </div>
      </div>
    </div>
  );
}
