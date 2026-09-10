import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_GAP = 24;

/**
 * applyPageBreaks — JavaScript page-break engine.
 * Scans the container for elements that cross A4 page boundaries
 * and inserts transparent spacers to push them to the next page.
 */
function applyPageBreaks(container, pageHeight) {
  if (!container) return;

  // Clean up previous spacers
  container.querySelectorAll('[data-page-spacer]').forEach(el => el.remove());

  // Collect all atomic elements that should not be split
  const candidates = new Set();

  // Tags that should never be split
  container.querySelectorAll('li, h1, h2, h3, h4, h5, h6, p').forEach(el => candidates.add(el));

  // Styled divs that act as atomic blocks
  for (const div of container.querySelectorAll('div')) {
    const s = div.style;
    if (
      s.fontWeight === 'bold' || s.fontWeight === '700' ||
      (s.justifyContent === 'space-between' && s.display === 'flex') ||
      s.fontStyle === 'italic' ||
      s.pageBreakInside === 'avoid'
    ) {
      candidates.add(div);
    }
  }

  // Sort by vertical position
  const elements = [...candidates].sort((a, b) => {
    return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
  });

  let inserted = 0;
  for (const el of elements) {
    if (inserted >= 50) break;

    const rect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    const relTop = rect.top - cRect.top;
    const relBottom = relTop + rect.height;

    if (rect.height > pageHeight * 0.5 || rect.height < 4) continue;

    const startPage = Math.floor(relTop / pageHeight);
    const endPage = Math.floor(Math.max(0, relBottom - 1) / pageHeight);

    if (startPage !== endPage) {
      const gap = (startPage + 1) * pageHeight - relTop;
      if (gap > 0 && gap < 300) {
        const spacer = document.createElement('div');
        spacer.setAttribute('data-page-spacer', 'true');
        spacer.style.cssText = `height:${gap}px;width:100%;flex-shrink:0;pointer-events:none;`;
        el.parentNode.insertBefore(spacer, el);
        inserted++;
      }
    }
  }
}


export default function LivePreview({ resume }) {
  const outerRef = useRef(null);
  const contentRef = useRef(null);
  const hiddenRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT);
  const [isEditing, setIsEditing] = useState(false);
  const editTimerRef = useRef(null);

  // Scale to fit panel width
  useEffect(() => {
    const onResize = () => {
      if (outerRef.current) {
        const pw = outerRef.current.parentElement?.clientWidth || 600;
        setScale(Math.min(1, (pw - 40) / A4_WIDTH));
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // When resume changes (from form), re-render into the editable preview
  // BUT only if user is NOT currently editing the preview
  useEffect(() => {
    if (isEditing) return;
    if (!hiddenRef.current || !contentRef.current) return;

    // Copy the fresh template HTML into the editable preview div
    contentRef.current.innerHTML = hiddenRef.current.innerHTML;

    // Apply page-break spacers
    applyPageBreaks(contentRef.current, A4_HEIGHT);

    // Measure and calculate pages
    const h = contentRef.current.scrollHeight;
    setContentHeight(h);
    setTotalPages(Math.max(1, Math.ceil(h / A4_HEIGHT)));
  }, [resume, isEditing]);

  // When user edits the preview, recalculate pages after a short delay
  const handleInput = useCallback(() => {
    if (editTimerRef.current) clearTimeout(editTimerRef.current);
    editTimerRef.current = setTimeout(() => {
      if (!contentRef.current) return;
      // Re-apply page breaks after user edits
      applyPageBreaks(contentRef.current, A4_HEIGHT);
      const h = contentRef.current.scrollHeight;
      setContentHeight(h);
      setTotalPages(Math.max(1, Math.ceil(h / A4_HEIGHT)));
    }, 300);
  }, []);

  const handleFocus = useCallback(() => setIsEditing(true), []);
  const handleBlur = useCallback(() => {
    // Delay to allow click events to fire first
    setTimeout(() => setIsEditing(false), 200);
  }, []);

  const scaledW = A4_WIDTH * scale;
  const scaledPageH = A4_HEIGHT * scale;
  const totalH = contentHeight * scale + Math.max(0, totalPages - 1) * PAGE_GAP;

  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        background: '#656565',
        minHeight: '100%',
        padding: '16px 0 60px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto',
      }}
    >
      {/* Edit hint */}
      <div style={{
        color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px',
        fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        ✏️ Click on the resume to edit directly
        {totalPages > 1 && (
          <span style={{
            background: 'rgba(0,0,0,0.4)', padding: '2px 10px', borderRadius: '12px',
            color: '#fff', fontWeight: '600', marginLeft: '8px',
          }}>
            {totalPages} pages
          </span>
        )}
      </div>

      {/* Hidden div: React renders the template here (never visible) */}
      <div
        ref={hiddenRef}
        style={{ position: 'absolute', left: '-9999px', top: 0, width: `${A4_WIDTH}px`, visibility: 'hidden' }}
        aria-hidden="true"
      >
        <TemplateRenderer resume={resume} />
      </div>

      {/* Visible pages container */}
      <div style={{
        position: 'relative',
        width: `${scaledW}px`,
        height: `${totalH}px`,
        flexShrink: 0,
      }}>

        {/* White page card backgrounds (just visual) */}
        {Array.from({ length: totalPages }, (_, i) => {
          const top = i * (scaledPageH + PAGE_GAP);
          const remaining = contentHeight - i * A4_HEIGHT;
          const h = Math.min(A4_HEIGHT, remaining) * scale;
          return (
            <div key={`bg-${i}`} style={{
              position: 'absolute', top: `${top}px`, left: 0,
              width: `${scaledW}px`, height: `${h}px`,
              background: '#fff',
              boxShadow: '0 2px 16px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.15)',
              borderRadius: '1px',
              zIndex: 1,
            }} />
          );
        })}

        {/* The editable content — ONE continuous div, clipped per page via overflow */}
        {Array.from({ length: totalPages }, (_, pageIndex) => {
          const cardTop = pageIndex * (scaledPageH + PAGE_GAP);
          const contentShift = pageIndex * A4_HEIGHT;
          const remaining = contentHeight - pageIndex * A4_HEIGHT;
          const cardH = Math.min(A4_HEIGHT, remaining) * scale;

          return (
            <div key={`page-${pageIndex}`} style={{
              position: 'absolute', top: `${cardTop}px`, left: 0,
              width: `${scaledW}px`, height: `${cardH}px`,
              overflow: 'hidden',
              zIndex: 2,
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${A4_WIDTH}px`,
                transformOrigin: 'top left',
                transform: `scale(${scale}) translateY(-${contentShift}px)`,
              }}>
                {pageIndex === 0 ? (
                  // Page 0: The actual editable content
                  <div
                    id="resume-preview-content"
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{
                      width: `${A4_WIDTH}px`,
                      outline: 'none',
                      cursor: 'text',
                      minHeight: `${A4_HEIGHT}px`,
                    }}
                  />
                ) : (
                  // Pages 2+: show the SAME content from page 0 (shifted up)
                  // We reuse the page-0 contentRef by rendering it again at a different offset
                  // This div is just a "window" — it shares the same content via cloneNode
                  <div
                    data-page-mirror={pageIndex}
                    style={{
                      width: `${A4_WIDTH}px`,
                      minHeight: `${A4_HEIGHT}px`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Page separator labels */}
        {Array.from({ length: totalPages - 1 }, (_, i) => {
          const gapTop = (i + 1) * (scaledPageH + PAGE_GAP) - PAGE_GAP;
          return (
            <div key={`sep-${i}`} style={{
              position: 'absolute', top: `${gapTop}px`, left: 0,
              width: '100%', height: `${PAGE_GAP}px`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', zIndex: 30,
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <div style={{
                background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.8)',
                fontSize: '10px', fontWeight: '600', padding: '2px 10px',
                borderRadius: '10px', fontFamily: "'Inter', sans-serif",
                whiteSpace: 'nowrap',
              }}>
                PAGE {i + 2}
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Clone content from page 0 to pages 2+ after render
if (typeof window !== 'undefined') {
  const syncMirrors = () => {
    const source = document.getElementById('resume-preview-content');
    if (!source) return;
    document.querySelectorAll('[data-page-mirror]').forEach(mirror => {
      mirror.innerHTML = source.innerHTML;
    });
  };
  // Run after each React render via MutationObserver on the preview
  let observer = null;
  const startObserving = () => {
    const target = document.getElementById('resume-preview-content');
    if (!target) { setTimeout(startObserving, 500); return; }
    syncMirrors();
    observer = new MutationObserver(() => {
      requestAnimationFrame(syncMirrors);
    });
    observer.observe(target, { childList: true, subtree: true, characterData: true });
  };
  if (typeof window !== 'undefined') {
    // Delay start to let React mount
    setTimeout(startObserving, 1000);
  }
}
