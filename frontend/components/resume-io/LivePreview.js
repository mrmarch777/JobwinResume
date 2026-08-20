import React, { useEffect, useState, useRef } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

export default function LivePreview({ resume, TemplateComponent }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const BASE_WIDTH = 794; // approx A4 width in pixels at 96dpi
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || 600;
        const padding = 40;
        const availableWidth = parentWidth - padding * 2;
        const newScale = Math.min(1, availableWidth / BASE_WIDTH);
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Visible scaled preview — scrollable, no fixed height */}
      <div style={{
        transformOrigin: 'top center',
        transform: `scale(${scale})`,
        marginBottom: '-20px',
        width: `${BASE_WIDTH}px`,
      }}>
        <div style={{
          width: `${BASE_WIDTH}px`,
          minHeight: '1123px',
          background: '#ffffff',
          color: '#000000',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
        }}>
          {TemplateComponent ? (
            <TemplateComponent resume={resume} />
          ) : (
            <TemplateRenderer resume={resume} />
          )}
        </div>
      </div>

      {/* Hidden full-size export target — not scaled, not clipped */}
      <div
        id="resume-export-target"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: `${BASE_WIDTH}px`,
          background: '#ffffff',
          color: '#000000',
        }}
      >
        {TemplateComponent ? (
          <TemplateComponent resume={resume} />
        ) : (
          <TemplateRenderer resume={resume} />
        )}
      </div>
    </div>
  );
}

