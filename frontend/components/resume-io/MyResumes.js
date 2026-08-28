import React, { useEffect, useState, useRef } from 'react';
import { Plus, FileText, Clock, LogIn, MoreVertical, Pencil, Copy, Trash2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function MyResumes({ resumes, onSelect, onCreateNew, onRefresh }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // resume id with open menu
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Unknown';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return 'Unknown'; }
  };

  const getAccentColor = (resume) => {
    try {
      const data = typeof resume.form_data === 'string' ? JSON.parse(resume.form_data) : resume.form_data;
      return data?.accentColor || '#2563EB';
    } catch { return '#2563EB'; }
  };

  const handleDelete = async (resumeId, e) => {
    e.stopPropagation();
    setActiveMenu(null);
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await supabase.from('resumes').delete().eq('id', resumeId);
      onRefresh?.();
    } catch (err) { console.error('Delete failed:', err); }
  };

  const handleDuplicate = async (resume, e) => {
    e.stopPropagation();
    setActiveMenu(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const payload = {
        user_id: session.user.id,
        title: `${resume.title || 'Untitled'} (Copy)`,
        content: resume.content,
        template: resume.template,
        form_data: resume.form_data,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('resumes').insert(payload);
      onRefresh?.();
    } catch (err) { console.error('Duplicate failed:', err); }
  };

  const handleRenameStart = (resume, e) => {
    e.stopPropagation();
    setActiveMenu(null);
    setRenamingId(resume.id);
    setRenameValue(resume.title || '');
  };

  const handleRenameSave = async (resumeId) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    try {
      await supabase.from('resumes').update({ title: renameValue.trim(), updated_at: new Date().toISOString() }).eq('id', resumeId);
      onRefresh?.();
    } catch (err) { console.error('Rename failed:', err); }
    setRenamingId(null);
  };

  const renderHeader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--theme-text, #E8E6F0)', margin: 0 }}>My Resumes</h2>
      {isLoggedIn && onRefresh && (
        <button
          onClick={onRefresh}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      )}
    </div>
  );

  if (isLoggedIn === null) return null;

  if (!isLoggedIn) {
    return (
      <div style={{ marginBottom: '32px' }}>
        {renderHeader()}
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}>Sign in to see your saved resumes</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '20px', fontSize: '14px' }}>Your resumes are saved to your account. Sign in to access them.</p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #6C63FF, #2563EB)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <LogIn size={16} /> Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div style={{ marginBottom: '32px' }}>
        {renderHeader()}
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>No saved resumes yet. Create your first one below!</p>
          <button
            onClick={onCreateNew}
            style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            + Create New Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '40px', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      {renderHeader()}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px',
      }}>
        {/* Create New Card */}
        <div
          onClick={onCreateNew}
          style={{
            background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '12px',
            padding: '24px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', minHeight: '160px', transition: 'all 0.2s ease', color: '#6B7280',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = '#F9FAFB'; }}
        >
          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '50%', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Plus size={24} />
          </div>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>Create New</span>
        </div>

        {/* Saved Resumes */}
        {resumes.map(resume => {
          const accentColor = getAccentColor(resume);
          const isMenuOpen = activeMenu === resume.id;
          const isRenaming = renamingId === resume.id;

          return (
            <div
              key={resume.id}
              onClick={() => !isRenaming && !isMenuOpen && onSelect(resume)}
              style={{
                background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
                padding: '20px', display: 'flex', flexDirection: 'column',
                cursor: 'pointer', minHeight: '160px', transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isMenuOpen) { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Template accent strip */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accentColor }} />

              {/* Header: title + context menu */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px', marginBottom: '12px' }}>
                <FileText size={18} style={{ color: accentColor, flexShrink: 0, marginTop: '2px' }} />

                {isRenaming ? (
                  <div style={{ flex: 1, display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRenameSave(resume.id); if (e.key === 'Escape') setRenamingId(null); }}
                      style={{ flex: 1, fontSize: '14px', fontWeight: '600', border: '1px solid #2563EB', borderRadius: '4px', padding: '2px 6px', outline: 'none', color: '#111827' }}
                    />
                    <button onClick={() => handleRenameSave(resume.id)} style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer', padding: '2px' }}>
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#111827' }}>
                    {resume.title || 'Untitled Resume'}
                  </h3>
                )}

                {/* Context menu button */}
                <div style={{ position: 'relative', flexShrink: 0 }} ref={isMenuOpen ? menuRef : null}>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : resume.id); }}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#374151'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9CA3AF'; }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {isMenuOpen && (
                    <div
                      style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                        background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '160px',
                        overflow: 'hidden',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {[
                        { icon: Pencil, label: 'Rename', color: '#374151', action: (e) => handleRenameStart(resume, e) },
                        { icon: Copy, label: 'Duplicate', color: '#374151', action: (e) => handleDuplicate(resume, e) },
                        { icon: Trash2, label: 'Delete', color: '#DC2626', action: (e) => handleDelete(resume.id, e), danger: true },
                      ].map(({ icon: Icon, label, color, action, danger }) => (
                        <button
                          key={label}
                          onClick={action}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                            padding: '10px 14px', border: 'none', background: 'none',
                            cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                            color, textAlign: 'left', borderTop: danger ? '1px solid #F3F4F6' : 'none',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = danger ? '#FEF2F2' : '#F9FAFB'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#6B7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', textTransform: 'capitalize' }}>
                    {resume.template || 'classic'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  <span>Updated {formatDate(resume.updated_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
