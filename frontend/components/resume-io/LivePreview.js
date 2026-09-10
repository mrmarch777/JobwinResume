import React, { useEffect, useState, useRef } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
// Visual gap between pages in the preview (gives clear visual separation)
const PAGE_GAP = 20;

export default function LivePreview({ resume, TemplateComponent, currentPage: _cp, setCurrentPage: _scp }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT);

  // Scale to fit the available panel width
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

  // Measure total content height and derive page count
  useEffect(() => {
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight;
      setContentHeight(h);
      const pages = Math.max(1, Math.ceil(h / A4_HEIGHT));
      setTotalPages(pages);
    }
  });

  const scaledWidth = A4_WIDTH * scale;
  const scaledPageHeight = A4_HEIGHT * scale;
  // Total visual height = all page heights + gaps between them
  const totalVisualHeight = contentHeight * scale + (totalPages - 1) * PAGE_GAP;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        background: 'var(--editor-preview-gray, #656565)',
        minHeight: '100%',
        padding: '20px 0 48px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Page count badge */}
      {totalPages > 1 && (
        <div style={{
          background: 'rgba(0,0,0,0.45)',
          color: '#fff',
          fontSize: '11px',
          fontWeight: '600',
          padding: '3px 12px',
          borderRadius: '20px',
          marginBottom: '12px',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.4px',
        }}>
          {totalPages} pages
        </div>
      )}

      {/*
        Outer wrapper.
        Height = total visual height (scaled content + all page gaps).
        We render each page as a white card, stacked vertically.
      */}
      <div style={{
        position: 'relative',
        width: `${scaledWidth}px`,
        height: `${totalVisualHeight}px`,
        flexShrink: 0,
      }}>

        {/*
          Render individual page "cards".
          Each card clips to one A4_HEIGHT of content via:
          - position: absolute at the right offset in visual space
          - overflow: hidden at the scaledPageHeight
          - The resume content inside is shifted by -pageIndex * scaledPageHeight
            to show only the relevant slice of content.
        */}
        {Array.from({ length: totalPages }, (_, pageIndex) => {
          // Visual top of this card = pages before it + gaps before it
          const cardTop = pageIndex * (scaledPageHeight + PAGE_GAP);
          // How much content to skip (shift up) for this page
          const contentShift = pageIndex * A4_HEIGHT;
          // Height of this card: last page may be shorter
          const remainingContent = contentHeight - pageIndex * A4_HEIGHT;
          const cardContentHeight = Math.min(A4_HEIGHT, remainingContent);
          const cardHeight = cardContentHeight * scale;

          return (
            <div
              key={pageIndex}
              style={{
                position: 'absolute',
                top: `${cardTop}px`,
                left: 0,
                width: `${scaledWidth}px`,
                height: `${cardHeight}px`,
                background: '#ffffff',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 6px rgba(0,0,0,0.2)',
                borderRadius: '1px',
              }}
            >
              {/*
                The resume content rendered at full A4 width,
                scaled down, shifted up by the page offset.
                Only the current page's slice is visible (overflow: hidden above).
              */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${A4_WIDTH}px`,
                  transformOrigin: 'top left',
                  // Scale then shift up to show the correct page
                  transform: `scale(${scale}) translateY(-${contentShift}px)`,
                }}
              >
                {pageIndex === 0 ? (
                  // Only the first page renders the actual content — others reuse via ref
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
                ) : (
                  // Pages 2+ clone the content from the DOM (read from the first page ref)
                  <div
                    id={`resume-preview-page-${pageIndex + 1}`}
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
                )}
              </div>
            </div>
          );
        })}

        {/* Page separator labels between cards */}
        {Array.from({ length: totalPages - 1 }, (_, i) => {
          const gapTop = (i + 1) * (scaledPageHeight + PAGE_GAP) - PAGE_GAP;
          return (
            <div
              key={`sep-${i}`}
              style={{
                position: 'absolute',
                top: `${gapTop}px`,
                left: 0,
                width: '100%',
                height: `${PAGE_GAP}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                zIndex: 30,
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
              <div style={{
                background: 'rgba(0,0,0,0.35)',
                color: 'rgba(255,255,255,0.75)',
                fontSize: '10px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
              }}>
                PAGE {i + 2}
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
