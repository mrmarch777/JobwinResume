import React, { useEffect, useState, useRef } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export default function LivePreview({ resume, TemplateComponent }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState(1);

  // Calculate how much to scale down the preview to fit the panel
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || 600;
        const padding = 40;
        const availableWidth = parentWidth - padding * 2;
        const newScale = Math.min(1, availableWidth / A4_WIDTH);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // After render, measure actual content height to know how many A4 pages it spans
  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const numPages = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT));
      setPages(numPages);
    }
  });

  // The content div is always full A4 width, rendered at natural height
  // We scale the outer wrapper to fit the panel
  const scaledHeight = A4_HEIGHT * pages * scale;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        background: '#f0f0f0',
        minHeight: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Outer wrapper scaled to fit panel width */}
      <div
        style={{
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
          width: `${A4_WIDTH}px`,
          // Reserve the correct height after scaling so parent scroll works
          marginBottom: `${scaledHeight - A4_HEIGHT * pages}px`,
        }}
      >
        {/* Page guides — show grey lines between pages */}
        <div style={{ position: 'relative' }}>
          {/* The actual resume content — renders at full natural height */}
          <div
            id="resume-preview-content"
            ref={contentRef}
            style={{
              width: `${A4_WIDTH}px`,
              background: '#ffffff',
              color: '#000000',
              // No fixed height — let content flow naturally
              position: 'relative',
            }}
          >
            {TemplateComponent ? (
              <TemplateComponent resume={resume} />
            ) : (
              <TemplateRenderer resume={resume} />
            )}
          </div>

          {/* Page break lines overlay — show where A4 pages end */}
          {Array.from({ length: pages - 1 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${A4_HEIGHT * (i + 1)}px`,
                left: 0,
                right: 0,
                height: '4px',
                background: '#3B82F6',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{
                background: '#3B82F6',
                color: 'white',
                fontSize: '10px',
                padding: '1px 8px',
                borderRadius: '0 0 4px 4px',
                position: 'absolute',
                top: '4px',
                whiteSpace: 'nowrap',
                fontFamily: 'sans-serif',
              }}>
                Page {i + 2}
              </span>
            </div>
          ))}
        </div>

        {/* Page count indicator */}
        {pages > 1 && (
          <div style={{
            textAlign: 'center',
            padding: '8px',
            fontSize: '11px',
            color: '#6B7280',
            background: '#F3F4F6',
            fontFamily: 'sans-serif',
            borderTop: '1px solid #E5E7EB',
          }}>
            {pages} pages total
          </div>
        )}
      </div>
    </div>
  );
}
