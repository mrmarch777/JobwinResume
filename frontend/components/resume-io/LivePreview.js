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
        const availableWidth = parentWidth - 48;
        const newScale = Math.min(1, availableWidth / A4_WIDTH);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure content height to determine number of pages
  useEffect(() => {
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(h / A4_HEIGHT));
      setTotalPages(pages);
      // If current page is now out of range after content change, reset to 1
      setCurrentPage(p => Math.min(p, pages));
    }
  });

  // The Y offset into the content for the current page
  const pageOffset = (currentPage - 1) * A4_HEIGHT;

  // Visible frame height after scaling
  const visibleFrameHeight = A4_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#E5E7EB',
        minHeight: '100%',
      }}
    >
      {/* ── A4 Page Viewport ── */}
      <div
        style={{
          width: `${A4_WIDTH * scale}px`,
          height: `${visibleFrameHeight}px`,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          background: '#fff',
          margin: '24px 0 0 0',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Full-height content rendered inside, shifted up to show current page */}
        <div
          style={{
            transformOrigin: 'top left',
            transform: `scale(${scale}) translateY(${-pageOffset}px)`,
            width: `${A4_WIDTH}px`,
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
      </div>

      {/* ── Pagination Controls ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '14px 20px',
          background: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          margin: '16px 0 24px 0',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '8px 18px',
            background: currentPage === 1 ? '#F3F4F6' : '#2563EB',
            color: currentPage === 1 ? '#9CA3AF' : '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: currentPage === 1 ? 'default' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.15s',
          }}
        >
          ← Prev
        </button>

        <div style={{ textAlign: 'center', minWidth: '100px' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>
            Page {currentPage} of {totalPages}
          </div>
          {totalPages > 1 && (
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
              {totalPages} pages total
            </div>
          )}
        </div>

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 18px',
            background: currentPage === totalPages ? '#F3F4F6' : '#2563EB',
            color: currentPage === totalPages ? '#9CA3AF' : '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: currentPage === totalPages ? 'default' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.15s',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
