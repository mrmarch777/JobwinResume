import React, { useState, useEffect, useRef } from 'react';
import { FileText, Palette, Bot, Target, ArrowLeft, Download, ChevronDown, Save, Check, RotateCcw, RotateCw, Pencil } from 'lucide-react';

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

export default function EditorShell({ activeTab, onTabChange, onBack, leftPanel, rightPanel, onExport, resumeName, onRenameSave, onSaveDraft, saveStatus, onUndo, onRedo, canUndo, canRedo }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanel, setMobilePanel] = useState('form');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(resumeName || 'Untitled Resume');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    setTempName(resumeName || 'Untitled Resume');
  }, [resumeName]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const handleNameSave = () => {
    setIsEditingName(false);
    if (tempName.trim() && tempName !== resumeName) {
      onRenameSave?.(tempName.trim());
    } else {
      setTempName(resumeName || 'Untitled Resume');
    }
  };

  const handleSaveClick = async () => {
    if (onSaveDraft) {
      await onSaveDraft();
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
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
          {isEditingName ? (
            <input
              ref={nameInputRef}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') {
                  setTempName(resumeName || 'Untitled Resume');
                  setIsEditingName(false);
                }
              }}
              style={{
                fontWeight: '600', color: '#111827', fontSize: '15px',
                border: '1px solid #E5E7EB', borderRadius: '4px', padding: '2px 6px',
                fontFamily: "'Inter', 'DM Sans', sans-serif", width: '150px'
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingName(true)}
              title="Click to rename"
              style={{
                fontWeight: '600', color: '#111827', fontSize: '15px',
                cursor: 'pointer', padding: '3px 7px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.querySelector('.pencil-icon').style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.querySelector('.pencil-icon').style.opacity = '0'; }}
            >
              {resumeName || 'Untitled Resume'}
              <Pencil size={13} className="pencil-icon" style={{ opacity: 0, color: '#9CA3AF', transition: 'opacity 0.15s', flexShrink: 0 }} />
            </span>
          )}
        </div>

        {/* Center: Tabs — underline style like resume.io */}
        <nav style={{ display: 'flex', gap: '0', height: '56px', alignItems: 'flex-end' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0 20px', height: '100%', border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: isActive ? '#2563EB' : '#6B7280',
                fontWeight: isActive ? '600' : '500', fontSize: '14px',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                transition: 'all 0.15s',
                fontFamily: "'Inter', 'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#6B7280'; }}
              >
                <Icon size={15} />
                {tab.label}
                {tab.id === 'tailor' && (
                  <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#92400E', padding: '1px 5px', borderRadius: '4px', fontWeight: '600' }}>AI</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Undo / Redo / Save / Download */}
        <div style={{ minWidth: '220px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', position: 'relative' }}>

          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #E5E7EB',
              background: '#FFFFFF', color: canUndo ? '#374151' : '#D1D5DB',
              cursor: canUndo ? 'pointer' : 'default', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (canUndo) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
          >
            <RotateCcw size={15} />
          </button>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #E5E7EB',
              background: '#FFFFFF', color: canRedo ? '#374151' : '#D1D5DB',
              cursor: canRedo ? 'pointer' : 'default', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (canRedo) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
          >
            <RotateCw size={15} />
          </button>

          <div style={{ width: '1px', height: '24px', background: '#E5E7EB', margin: '0 2px' }} />

          {/* Save + status indicator */}
          <div style={{ position: 'relative' }}>
            <button onClick={handleSaveClick} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer',
              background: '#FFFFFF', color: '#374151', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              title="Save Draft"
            >
              <Save size={18} />
            </button>
            {showSavedToast && (
              <div style={{
                position: 'absolute', top: '100%', right: '50%', transform: 'translateX(50%)', marginTop: '8px',
                background: '#1F2937', color: '#FFFFFF', fontSize: '12px', fontWeight: '500',
                padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px',
                whiteSpace: 'nowrap', zIndex: 300,
              }}>
                <Check size={12} /> Saved!
              </div>
            )}
          </div>

          {/* Auto-save status pill */}
          {saveStatus !== 'idle' && (
            <span style={{
              fontSize: '11px', fontWeight: '500',
              color: saveStatus === 'saved' ? '#16A34A' : '#9CA3AF',
              display: 'flex', alignItems: 'center', gap: '3px',
              whiteSpace: 'nowrap',
            }}>
              {saveStatus === 'saving' ? '● Saving…' : '✓ Saved'}
            </span>
          )}

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
        {/* Left Panel — 42% */}
        <div style={{
          width: isFullWidth ? '50%' : '42%',
          minWidth: isMobile ? 0 : '380px',
          background: '#FFFFFF', borderRight: '1px solid #E5E7EB',
          overflowY: 'auto', overflowX: 'hidden',
          display: isMobile && mobilePanel !== 'form' ? 'none' : 'block',
        }}>
          {leftPanel}
        </div>

        {/* Right Panel — 58% preview */}
        <div style={{
          flex: 1, background: isFullWidth ? '#FFFFFF' : '#656565',
          overflowY: 'auto', overflowX: 'hidden',
          display: isMobile && mobilePanel !== 'preview' ? 'none' : 'flex',
          flexDirection: 'column', alignItems: isFullWidth ? 'stretch' : 'center',
          padding: isFullWidth ? '0' : '0',
        }}>
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
