import React, { useState, useEffect } from 'react';
import { useTheme } from '../../lib/contexts';

export default function EditorLayout({ formPanel, previewPanel, toolbar, onBack }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'preview'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const layoutStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
    background: theme.bg,
    color: theme.text
  };

  const topBarStyle = {
    height: '60px',
    borderBottom: `1px solid ${theme.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    justifyContent: 'space-between',
    flexShrink: 0
  };

  const mainAreaStyle = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  };

  const formPanelStyle = {
    width: isMobile ? '100%' : '50%',
    height: '100%',
    overflowY: 'auto',
    padding: '20px',
    display: isMobile && activeTab !== 'form' ? 'none' : 'block',
    borderRight: isMobile ? 'none' : `1px solid ${theme.border}`
  };

  const previewPanelStyle = {
    width: isMobile ? '100%' : '50%',
    height: '100%',
    overflowY: 'auto',
    background: '#f5f5f5', // Light background for contrast against white A4 page
    display: isMobile && activeTab !== 'preview' ? 'none' : 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px'
  };

  const backBtnStyle = {
    background: 'none',
    border: 'none',
    color: theme.muted,
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'background 0.2s',
  };

  const tabContainerStyle = {
    display: isMobile ? 'flex' : 'none',
    width: '100%',
    borderBottom: `1px solid ${theme.border}`
  };

  const getTabStyle = (tabId) => ({
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    background: activeTab === tabId ? 'rgba(255,255,255,0.05)' : 'transparent',
    borderBottom: activeTab === tabId ? `2px solid ${theme.accent}` : '2px solid transparent',
    color: activeTab === tabId ? theme.accent : theme.muted,
    fontWeight: activeTab === tabId ? '600' : 'normal'
  });

  return (
    <div style={layoutStyle}>
      <div style={topBarStyle}>
        <button style={backBtnStyle} onClick={onBack} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
          ← Back to Templates
        </button>
        <div style={{ fontFamily: "'Noto Serif', serif", fontWeight: '700', fontSize: '18px' }}>Resume IO</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {toolbar}
        </div>
      </div>

      <div style={tabContainerStyle}>
        <div style={getTabStyle('form')} onClick={() => setActiveTab('form')}>Editor</div>
        <div style={getTabStyle('preview')} onClick={() => setActiveTab('preview')}>Preview</div>
      </div>

      <div style={mainAreaStyle}>
        <div style={formPanelStyle}>
          {formPanel}
        </div>
        <div style={previewPanelStyle}>
          {previewPanel}
        </div>
      </div>
    </div>
  );
}
