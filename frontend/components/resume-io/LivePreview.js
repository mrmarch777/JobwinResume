import React, { useEffect, useState, useRef } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export default function LivePreview({ resume, TemplateComponent }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Scale to fit panel width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || 600;
        const availableWidth = parentWidth - 32;
        const newScale = Math.min(1, availableWidth / A4_WIDTH);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure total pages from rendered content height
  useEffect(() => {
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(h / A4_HEIGHT));
      setTotalPages(pages);
      setCurrentPage(p => Math.min(p, pages));
    }
  });

  const pageOffset = (currentPage - 1) * A4_HEIGHT;
  const scaledWidth = A4_WIDTH * scale;
  const scaledHeight = A4_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#E8E8E8',
        minHeight: '100%',
        padding: '16px 0 24px 0',
      }}
    >
      {/* ── Page Viewport — clips to exactly one A4 page ── */}
      <div
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)',
          background: '#fff',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Full-height content, shifted up to show current page */}
        <div
          style={{
            transformOrigin: 'top left',
            transform: `scale(${scale}) translateY(${-pageOffset}px)`,
            width: `${A4_WIDTH}px`,
            willChange: 'transform',
          }}
        >
          <div
            id="resume-preview-content"
            ref={contentRef}
            style={{
              width: `${A4_WIDTH}px`,
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

        {/* ── Page Pill (overlaid bottom-right, like resume.io) ── */}
        {totalPages > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              right: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(17,24,39,0.75)',
              backdropFilter: 'blur(6px)',
              borderRadius: '20px',
              padding: '5px 10px',
              zIndex: 20,
              fontFamily: "'Inter', sans-serif",
              userSelect: 'none',
            }}
          >
            {/* Prev arrow */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                background: 'none',
                border: 'none',
                color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                cursor: currentPage === 1 ? 'default' : 'pointer',
                padding: '0 2px',
                fontSize: '13px',
                lineHeight: 1,
                fontWeight: '700',
              }}
            >
              ←
            </button>

            {/* Page indicator */}
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600', letterSpacing: '0.3px' }}>
              {currentPage} / {totalPages}
            </span>

            {/* Next arrow */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                background: 'none',
                border: 'none',
                color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                cursor: currentPage === totalPages ? 'default' : 'pointer',
                padding: '0 2px',
                fontSize: '13px',
                lineHeight: 1,
                fontWeight: '700',
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
