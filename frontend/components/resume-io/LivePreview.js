import React, { useEffect, useState, useRef, useCallback } from 'react';
import TemplateRenderer from './templates/TemplateRenderer';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_GAP = 24;

/**
 * Scans the container for elements that cross A4 page boundaries
 * and inserts transparent spacer divs to push them to the next page.
 */
function applyPageBreaks(container, pageHeight) {
  if (!container) return;
  container.querySelectorAll('[data-page-spacer]').forEach(el => el.remove());

  const candidates = new Set();
  container.querySelectorAll('li, h1, h2, h3, h4, h5, h6, p').forEach(el => candidates.add(el));

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

  const elements = [...candidates].sort((a, b) =>
    a.getBoundingClientRect().top - b.getBoundingClientRect().top
  );

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
  const isEditingRef = useRef(false);  // ref, NOT state — prevents re-render on blur
  const debounceRef = useRef(null);

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

  // Copy template to editable div ONLY when resume form data changes
  // Uses a ref for isEditing so blur/focus DON'T trigger this effect
  useEffect(() => {
    if (isEditingRef.current) return;
    if (!hiddenRef.current || !contentRef.current) return;

    contentRef.current.innerHTML = hiddenRef.current.innerHTML;
    applyPageBreaks(contentRef.current, A4_HEIGHT);

    const h = contentRef.current.scrollHeight;
    setContentHeight(h);
    setTotalPages(Math.max(1, Math.ceil(h / A4_HEIGHT)));
  }, [resume]);  // ONLY resume — not isEditing

  // Recalculate pages after user edits (debounced)
  const handleInput = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!contentRef.current) return;
      applyPageBreaks(contentRef.current, A4_HEIGHT);
      const h = contentRef.current.scrollHeight;
      setContentHeight(h);
      setTotalPages(Math.max(1, Math.ceil(h / A4_HEIGHT)));
    }, 400);
  }, []);

  const scaledW = A4_WIDTH * scale;
  // Total visual height = scaled content + gaps between pages
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
      {/* Edit hint + page count */}
      <div style={{
        color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginBottom: '10px',
        fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        ✏️ Click on resume to edit directly
        {totalPages > 1 && (
          <span style={{
            background: 'rgba(0,0,0,0.4)', padding: '2px 10px', borderRadius: '12px',
            color: '#fff', fontWeight: '600',
          }}>
            {totalPages} pages
          </span>
        )}
      </div>

      {/* Hidden: React renders template here (never visible) */}
      <div
        ref={hiddenRef}
        style={{ position: 'absolute', left: '-9999px', top: 0, width: `${A4_WIDTH}px`, visibility: 'hidden' }}
        aria-hidden="true"
      >
        <TemplateRenderer resume={resume} />
      </div>

      {/* Main preview area */}
      <div style={{ position: 'relative', width: `${scaledW}px`, flexShrink: 0 }}>

        {/* The single contentEditable resume — scaled to fit */}
        <div style={{
          width: `${A4_WIDTH}px`,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}>
          <div
            id="resume-preview-content"
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={() => { isEditingRef.current = true; }}
            onBlur={() => { setTimeout(() => { isEditingRef.current = false; }, 500); }}
            style={{
              width: `${A4_WIDTH}px`,
              minHeight: `${A4_HEIGHT}px`,
              background: '#fff',
              outline: 'none',
              cursor: 'text',
              boxShadow: '0 2px 20px rgba(0,0,0,0.35), 0 1px 5px rgba(0,0,0,0.15)',
            }}
          />
        </div>

        {/* Page separator bars — opaque gray overlays at each page boundary */}
        {Array.from({ length: totalPages - 1 }, (_, i) => {
          const barTop = (i + 1) * A4_HEIGHT * scale;
          return (
            <div
              key={`sep-${i}`}
              style={{
                position: 'absolute',
                top: `${barTop}px`,
                left: '-20px',
                right: '-20px',
                height: `${PAGE_GAP}px`,
                background: '#656565',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
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
