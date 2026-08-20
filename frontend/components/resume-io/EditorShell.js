import React, { useState, useEffect } from 'react';
import { FileText, Palette, Bot, Target, ArrowLeft, Download, ChevronDown } from 'lucide-react';

const TABS = [
  { id: 'edit', label: 'Edit', icon: FileText },
  { id: 'customize', label: 'Customize', icon: Palette },
  { id: 'ai-review', label: 'AI Review', icon: Bot },
  { id: 'tailor', label: 'Tailor', icon: Target },
];

// Forced editor theme — crisp, professional, theme-independent
const editorTheme = {
  '--editor-bg': '#FFFFFF',
  '--editor-bg-alt': '#F9FAFB',
  '--editor-border': '#E5E7EB',
  '--editor-text': '#111827',
  '--editor-text-muted': '#6B7280',
  '--editor-text-light': '#9CA3AF',
  '--editor-accent': '#2563EB',
  '--editor-accent-light': '#DBEAFE',
  '--editor-card': '#FFFFFF',
  '--editor-input-bg': '#F9FAFB',
  '--editor-shadow': '0 1px 3px rgba(0,0,0,0.08)',
  '--editor-preview-bg': '#F3F4F6',
};

export default function EditorShell({ activeTab, onTabChange, onBack, leftPanel, rightPanel, onExport, resumeName }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanel, setMobilePanel] = useState('form');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isFullWidth = activeTab === 'tailor';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F3F4F6', ...editorTheme }}>
      {/* Top Navigation Bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '56px', background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB', flexShrink: 0, zIndex: 100,
      }}>
        {/* Left: Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
            border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '14px',
            padding: '6px 8px', borderRadius: '6px', transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#111827'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
          >
            <ArrowLeft size={18} />
            <span style={{ fontWeight: '500' }}>Back</span>
          </button>
          <span style={{ color: '#D1D5DB' }}>|</span>
          <span style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>
            {resumeName || 'Untitled Resume'}
          </span>
        </div>

        {/* Center: 4 Tabs */}
        <nav style={{ display: 'flex', gap: '4px', background: '#F9FAFB', borderRadius: '10px', padding: '4px' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#2563EB' : '#6B7280',
                fontWeight: isActive ? '600' : '500', fontSize: '14px',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
                fontFamily: "'Inter', 'DM Sans', sans-serif",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#6B7280'; }}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === 'tailor' && (
                  <Target size={12} style={{ opacity: 0.6 }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Download */}
        <div style={{ minWidth: '180px', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <button onClick={() => setShowExportMenu(!showExportMenu)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: '#16A34A', color: '#FFFFFF', fontWeight: '600', fontSize: '14px',
            transition: 'background 0.15s',
            fontFamily: "'Inter', 'DM Sans', sans-serif",
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
            onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
          >
            <Download size={16} />
            Download
            <ChevronDown size={14} />
          </button>
          {showExportMenu && (
            <>
              <div onClick={() => setShowExportMenu(false)} style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 199,
              }} />
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E5E7EB',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 200,
                minWidth: '180px',
              }}>
                <button onClick={() => { onExport?.('pdf'); setShowExportMenu(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '14px', color: '#374151', textAlign: 'left',
                  fontFamily: "'Inter', 'DM Sans', sans-serif",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ color: '#EF4444', fontWeight: '700', fontSize: '11px', padding: '2px 6px', background: '#FEF2F2', borderRadius: '4px' }}>PDF</span>
                  Download as PDF
                </button>
                <button onClick={() => { onExport?.('docx'); setShowExportMenu(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '14px', color: '#374151', textAlign: 'left',
                  fontFamily: "'Inter', 'DM Sans', sans-serif",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ color: '#2563EB', fontWeight: '700', fontSize: '11px', padding: '2px 6px', background: '#EFF6FF', borderRadius: '4px' }}>DOCX</span>
                  Download as Word
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile Tab Switcher (form/preview) */}
      {isMobile && !isFullWidth && (
        <div style={{ display: 'flex', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          {['form', 'preview'].map(p => (
            <button key={p} onClick={() => setMobilePanel(p)} style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
              background: mobilePanel === p ? '#EFF6FF' : '#FFFFFF',
              color: mobilePanel === p ? '#2563EB' : '#6B7280',
              fontWeight: '600', fontSize: '13px', borderBottom: mobilePanel === p ? '2px solid #2563EB' : '2px solid transparent',
              fontFamily: "'Inter', 'DM Sans', sans-serif",
            }}>
              {p === 'form' ? 'Editor' : 'Preview'}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{
          width: isFullWidth ? '50%' : '50%',
          background: '#FFFFFF', borderRight: '1px solid #E5E7EB',
          overflowY: 'auto', overflowX: 'hidden',
          display: isMobile && mobilePanel !== 'form' ? 'none' : 'block',
        }}>
          {leftPanel}
        </div>

        {/* Right Panel */}
        <div style={{
          flex: 1, background: isFullWidth ? '#FFFFFF' : '#F3F4F6',
          overflowY: 'auto', overflowX: 'hidden',
          display: isMobile && mobilePanel !== 'preview' ? 'none' : 'flex',
          flexDirection: 'column', alignItems: isFullWidth ? 'stretch' : 'center',
          padding: isFullWidth ? '0' : '24px',
        }}>
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
