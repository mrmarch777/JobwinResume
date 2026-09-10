import React, { useEffect, useState, useRef, useCallback } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_GAP = 20;

/**
 * applyPageBreaks — JavaScript-based page-break algorithm
 * 
 * Scans all "breakable" elements (li, headers, bold divs, flex rows)
 * inside the container. If any element crosses a page boundary AND is
 * small enough to fit on a single page, a transparent spacer div is
 * inserted before it to push it to the next page.
 * 
 * This runs post-render and modifies the DOM directly (outside React).
 * Spacers are tagged with a data attribute so they can be cleaned up.
 */
function applyPageBreaks(container, pageHeight) {
  if (!container) return;

  // 1. Remove previous spacers
  container.querySelectorAll('[data-page-spacer]').forEach(el => el.remove());

  // 2. Collect all "atomic" elements that should not be split across pages.
  //    We target: list items, headings, bold divs (job titles), flex rows (title+date),
  //    italic divs (company names), and any div with page-break-inside: avoid.
  const selectors = [
    'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  ];
  const candidates = Array.from(container.querySelectorAll(selectors.join(', ')));

  // Also collect divs that have inline styles indicating they're "atomic"
  const allDivs = container.querySelectorAll('div');
  for (const div of allDivs) {
    const s = div.style;
    // Bold divs (job titles, section titles)
    if (s.fontWeight === 'bold' || s.fontWeight === '700') {
      candidates.push(div);
      continue;
    }
    // Flex rows with space-between (title + date rows)
    if (s.justifyContent === 'space-between' && s.display === 'flex') {
      candidates.push(div);
      continue;
    }
    // Italic divs (company/subtitle)
    if (s.fontStyle === 'italic') {
      candidates.push(div);
      continue;
    }
    // Divs with explicit page-break-inside: avoid
    if (s.pageBreakInside === 'avoid' || s.breakInside === 'avoid') {
      candidates.push(div);
      continue;
    }
  }

  // Deduplicate (a div might match multiple criteria)
  const uniqueSet = new Set(candidates);
  const elements = Array.from(uniqueSet);

  // 3. Sort by vertical position (top to bottom)
  const containerTop = container.getBoundingClientRect().top;
  elements.sort((a, b) => {
    return (a.getBoundingClientRect().top - containerTop) - (b.getBoundingClientRect().top - containerTop);
  });

  // 4. Process each element: if it crosses a page boundary, insert a spacer
  let insertedSpacers = 0;
  const MAX_SPACERS = 50; // safety limit

  for (const el of elements) {
    if (insertedSpacers >= MAX_SPACERS) break;

    const rect = el.getBoundingClientRect();
    const relTop = rect.top - container.getBoundingClientRect().top;
    const relBottom = relTop + rect.height;
    const elHeight = rect.height;

    // Skip elements taller than 60% of a page (they can't fit on one page anyway)
    if (elHeight > pageHeight * 0.6) continue;

    // Skip tiny elements (< 5px)
    if (elHeight < 5) continue;

    // Which page does the element start and end on?
    const startPage = Math.floor(relTop / pageHeight);
    const endPage = Math.floor(Math.max(0, relBottom - 1) / pageHeight);

    if (startPage !== endPage) {
      // Element crosses a page boundary — push it to the next page
      const nextPageTop = (startPage + 1) * pageHeight;
      const spacerHeight = nextPageTop - relTop;

      // Only insert if the spacer is reasonable (< 200px gap)
      if (spacerHeight > 0 && spacerHeight < 200) {
        const spacer = document.createElement('div');
        spacer.setAttribute('data-page-spacer', 'true');
        spacer.style.height = spacerHeight + 'px';
        spacer.style.width = '100%';
        spacer.style.flexShrink = '0';
        // Insert before the element
        el.parentNode.insertBefore(spacer, el);
        insertedSpacers++;
      }
    }
  }

  return insertedSpacers;
}


export default function LivePreview({ resume, TemplateComponent, currentPage: _cp, setCurrentPage: _scp }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT);
  const pageBreakApplied = useRef(false);

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

  // Apply page breaks and measure content after render
  useEffect(() => {
    if (!contentRef.current) return;

    // Apply page-break algorithm (inserts spacer divs)
    applyPageBreaks(contentRef.current, A4_HEIGHT);

    // Measure total height AFTER spacers are inserted
    const h = contentRef.current.scrollHeight;
    setContentHeight(h);
    const pages = Math.max(1, Math.ceil(h / A4_HEIGHT));
    setTotalPages(pages);
  });

  const scaledWidth = A4_WIDTH * scale;
  const scaledPageHeight = A4_HEIGHT * scale;
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

      {/* Page cards container */}
      <div style={{
        position: 'relative',
        width: `${scaledWidth}px`,
        height: `${totalVisualHeight}px`,
        flexShrink: 0,
      }}>

        {/* Render each page as a clipped card */}
        {Array.from({ length: totalPages }, (_, pageIndex) => {
          const cardTop = pageIndex * (scaledPageHeight + PAGE_GAP);
          const contentShift = pageIndex * A4_HEIGHT;
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
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${A4_WIDTH}px`,
                  transformOrigin: 'top left',
                  transform: `scale(${scale}) translateY(-${contentShift}px)`,
                }}
              >
                {pageIndex === 0 ? (
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

        {/* Page separator labels */}
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
