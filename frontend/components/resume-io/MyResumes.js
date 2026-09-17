import React, { useEffect, useState, useRef } from 'react';
import { Plus, FileText, Clock, LogIn, MoreVertical, Pencil, Copy, Trash2, Check, Upload, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function MyResumes({ resumes, onSelect, onCreateNew, onUploadResume, onCheckATS, onRefresh }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });
  }, []);

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

  if (isLoggedIn === null) return null;

  const quickActions = [
    {
      emoji: '✨',
      title: 'Create New Resume',
      desc: 'Start fresh — choose a template and build from scratch',
      cta: 'Start Building →',
      color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
      onClick: onCreateNew,
    },
    {
      emoji: '📤',
      title: 'Update / Import Resume',
      desc: 'Upload your existing PDF or Word resume — we\'ll auto-fill all your details',
      cta: 'Upload Resume →',
      color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
      onClick: onUploadResume,
    },
    {
      emoji: '🎯',
      title: 'Check ATS Score',
      desc: 'Paste a job description and see how well your resume matches it',
      cta: 'Run ATS Check →',
      color: '#059669', bg: '#ECFDF5', border: '#A7F3D0',
      onClick: onCheckATS,
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', sans-serif", marginBottom: '32px' }}>

      {/* ─── Quick Action Cards ─────────────────────────── */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--theme-text, #E8E6F0)', marginBottom: '16px', marginTop: 0 }}>
          What would you like to do?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {quickActions.map((action) => (
            <div
              key={action.title}
              onClick={action.onClick}
              style={{ background: action.bg, border: `1px solid ${action.border}`, borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '10px' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 30px ${action.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '32px', lineHeight: 1 }}>{action.emoji}</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{action.title}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>{action.desc}</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: action.color, marginTop: 'auto', paddingTop: '4px' }}>{action.cta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Saved Resumes Section ──────────────────────── */}
      {isLoggedIn ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--theme-text, #E8E6F0)', margin: 0 }}>
              📂 My Saved Resumes
            </h2>
            {onRefresh && (
              <button onClick={onRefresh} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            )}
          </div>

          {!resumes || resumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              No saved resumes yet. Create one above or scroll down to pick a template!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {resumes.map(resume => {
                const accentColor = getAccentColor(resume);
                const isMenuOpen = activeMenu === resume.id;
                const isRenaming = renamingId === resume.id;
                return (
                  <div
                    key={resume.id}
                    onClick={() => !isRenaming && !isMenuOpen && onSelect(resume)}
                    style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', cursor: 'pointer', minHeight: '140px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={e => { if (!isMenuOpen) { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accentColor }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px', marginBottom: '12px' }}>
                      <FileText size={18} style={{ color: accentColor, flexShrink: 0, marginTop: '2px' }} />
                      {isRenaming ? (
                        <div style={{ flex: 1, display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                          <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleRenameSave(resume.id); if (e.key === 'Escape') setRenamingId(null); }} style={{ flex: 1, fontSize: '14px', fontWeight: '600', border: '1px solid #2563EB', borderRadius: '4px', padding: '2px 6px', outline: 'none', color: '#111827' }} />
                          <button onClick={() => handleRenameSave(resume.id)} style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer' }}><Check size={16} /></button>
                        </div>
                      ) : (
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#111827' }}>{resume.title || 'Untitled Resume'}</h3>
                      )}
                      <div style={{ position: 'relative', flexShrink: 0 }} ref={isMenuOpen ? menuRef : null}>
                        <button onClick={e => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : resume.id); }} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px' }} onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                          <MoreVertical size={16} />
                        </button>
                        {isMenuOpen && (
                          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '160px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                            {[
                              { icon: Pencil, label: 'Rename', color: '#374151', action: (e) => handleRenameStart(resume, e) },
                              { icon: Copy, label: 'Duplicate', color: '#374151', action: (e) => handleDuplicate(resume, e) },
                              { icon: Trash2, label: 'Delete', color: '#DC2626', action: (e) => handleDelete(resume.id, e), danger: true },
                            ].map(({ icon: Icon, label, color, action, danger }) => (
                              <button key={label} onClick={action} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color, textAlign: 'left', borderTop: danger ? '1px solid #F3F4F6' : 'none' }} onMouseEnter={e => { e.currentTarget.style.background = danger ? '#FEF2F2' : '#F9FAFB'; }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                                <Icon size={14} />{label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', textTransform: 'capitalize', display: 'inline-block', width: 'fit-content' }}>{resume.template || 'classic'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /><span>Updated {formatDate(resume.updated_at)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 20px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '12px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Sign in to save & access your resumes</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '20px' }}>Your resumes are saved to your account and accessible from any device.</p>
          <button onClick={() => window.location.href = '/login'} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #6C63FF, #2563EB)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={16} /> Sign In
          </button>
        </div>
      )}
    </div>
  );
}
