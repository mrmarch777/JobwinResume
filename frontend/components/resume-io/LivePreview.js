import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_GAP = 20;

/**
 * applyPageBreaks — scans elements inside a container and inserts
 * transparent spacer divs to push any element that would be split
 * across a page boundary to the next page.
 *
 * This is the ONLY reliable approach because:
 * - CSS page-break-inside doesn't work with overflow:hidden clipping
 * - html2canvas (used by html2pdf.js) doesn't support CSS page breaks
 * - Puppeteer page.pdf() may not be available on all deployments
 */
function applyPageBreaks(container, pageHeight) {
  if (!container) return 0;

  // Remove previously inserted spacers
  container.querySelectorAll('[data-page-spacer]').forEach(el => el.remove());

  // Gather all "atomic" elements that should never be split across pages
  const tagCandidates = container.querySelectorAll('li, h1, h2, h3, h4, h5, h6');
  const candidates = Array.from(tagCandidates);

  // Also gather styled divs that act as atomic blocks
  for (const div of container.querySelectorAll('div')) {
    const s = div.style;
    if (
      s.fontWeight === 'bold' || s.fontWeight === '700' ||
      (s.justifyContent === 'space-between' && s.display === 'flex') ||
      s.fontStyle === 'italic' ||
      s.pageBreakInside === 'avoid' || s.breakInside === 'avoid'
    ) {
      candidates.push(div);
    }
  }

  // Deduplicate
  const unique = [...new Set(candidates)];

  // Sort by vertical position
  const containerRect = container.getBoundingClientRect();
  unique.sort((a, b) => {
    return (a.getBoundingClientRect().top - containerRect.top) -
           (b.getBoundingClientRect().top - containerRect.top);
  });

  let inserted = 0;
  for (const el of unique) {
    if (inserted >= 40) break; // safety cap

    const rect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect(); // re-read after spacers shift things
    const relTop = rect.top - cRect.top;
    const relBottom = relTop + rect.height;

    // Skip elements too tall (> 50% of page) — they must be allowed to split
    if (rect.height > pageHeight * 0.5) continue;
    // Skip tiny elements
    if (rect.height < 4) continue;

    const startPage = Math.floor(relTop / pageHeight);
    const endPage = Math.floor(Math.max(0, relBottom - 1) / pageHeight);

    if (startPage !== endPage) {
      // Element crosses a page boundary
      const nextPageTop = (startPage + 1) * pageHeight;
      const gap = nextPageTop - relTop;

      if (gap > 0 && gap < 250) {
        const spacer = document.createElement('div');
        spacer.setAttribute('data-page-spacer', 'true');
        spacer.style.height = gap + 'px';
        spacer.style.width = '100%';
        spacer.style.flexShrink = '0';
        spacer.style.pointerEvents = 'none';
        el.parentNode.insertBefore(spacer, el);
        inserted++;
      }
    }
  }
  return inserted;
}


export default function LivePreview({ resume }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT);
  const prevResumeKey = useRef('');

  // Scale to fit panel width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const pw = containerRef.current.parentElement?.clientWidth || 600;
        setScale(Math.min(1, (pw - 32) / A4_WIDTH));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // After render: apply page breaks, measure, then clone content to pages 2+
  useLayoutEffect(() => {
    if (!contentRef.current) return;

    // Apply page breaks to the primary (page-0) content
    applyPageBreaks(contentRef.current, A4_HEIGHT);

    // Measure
    const h = contentRef.current.scrollHeight;
    const pages = Math.max(1, Math.ceil(h / A4_HEIGHT));

    setContentHeight(h);
    setTotalPages(pages);

    // Clone processed HTML (with spacers) to pages 2+
    // Use requestAnimationFrame to ensure DOM is settled
    requestAnimationFrame(() => {
      if (!contentRef.current) return;
      const processedHtml = contentRef.current.innerHTML;
      const clones = containerRef.current?.querySelectorAll('[data-page-clone]');
      if (clones) {
        clones.forEach(el => {
          el.innerHTML = processedHtml;
        });
      }
    });
  });

  const scaledWidth = A4_WIDTH * scale;
  const scaledPageHeight = A4_HEIGHT * scale;
  const totalVisualHeight = contentHeight * scale + Math.max(0, totalPages - 1) * PAGE_GAP;

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
          background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '11px',
          fontWeight: '600', padding: '3px 12px', borderRadius: '20px',
          marginBottom: '12px', fontFamily: "'Inter', sans-serif",
        }}>
          {totalPages} pages
        </div>
      )}

      {/* Pages container */}
      <div style={{
        position: 'relative',
        width: `${scaledWidth}px`,
        height: `${totalVisualHeight}px`,
        flexShrink: 0,
      }}>

        {/* Page cards */}
        {Array.from({ length: totalPages }, (_, pageIndex) => {
          const cardTop = pageIndex * (scaledPageHeight + PAGE_GAP);
          const contentShift = pageIndex * A4_HEIGHT;
          const remaining = contentHeight - pageIndex * A4_HEIGHT;
          const cardH = Math.min(A4_HEIGHT, remaining) * scale;

          return (
            <div
              key={pageIndex}
              style={{
                position: 'absolute',
                top: `${cardTop}px`,
                left: 0,
                width: `${scaledWidth}px`,
                height: `${cardH}px`,
                background: '#fff',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 6px rgba(0,0,0,0.2)',
                borderRadius: '1px',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: `${A4_WIDTH}px`,
                transformOrigin: 'top left',
                transform: `scale(${scale}) translateY(-${contentShift}px)`,
              }}>
                {pageIndex === 0 ? (
                  /* Page 0: renders the actual React template + gets spacers applied */
                  <div
                    id="resume-preview-content"
                    ref={contentRef}
                    style={{ width: `${A4_WIDTH}px`, background: '#fff', color: '#000' }}
                  >
                    <TemplateRenderer resume={resume} />
                  </div>
                ) : (
                  /* Pages 2+: cloned HTML from page 0 (with spacers included) */
                  <div
                    data-page-clone="true"
                    style={{ width: `${A4_WIDTH}px`, background: '#fff', color: '#000' }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Page separator labels */}
        {Array.from({ length: totalPages - 1 }, (_, i) => {
          const gapTop = (i + 1) * (scaledPageHeight + PAGE_GAP) - PAGE_GAP;
          return (
            <div key={`sep-${i}`} style={{
              position: 'absolute', top: `${gapTop}px`, left: 0,
              width: '100%', height: `${PAGE_GAP}px`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', zIndex: 30,
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
              <div style={{
                background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.75)',
                fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                borderRadius: '8px', fontFamily: "'Inter', sans-serif",
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
