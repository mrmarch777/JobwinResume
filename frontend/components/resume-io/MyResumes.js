import React from 'react';
import { Plus, FileText, Clock } from 'lucide-react';

export default function MyResumes({ resumes, onSelect, onCreateNew }) {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Unknown';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div style={{ marginBottom: '40px', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
        My Resumes
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {/* Create New Card */}
        <div 
          onClick={onCreateNew}
          style={{
            background: '#F9FAFB',
            border: '2px dashed #E5E7EB',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: '160px',
            transition: 'all 0.2s ease',
            color: '#6B7280'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#2563EB';
            e.currentTarget.style.color = '#2563EB';
            e.currentTarget.style.background = '#EFF6FF';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
            e.currentTarget.style.background = '#F9FAFB';
          }}
        >
          <div style={{ 
            background: '#FFFFFF', padding: '12px', borderRadius: '50%', marginBottom: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Plus size={24} />
          </div>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>Create New</span>
        </div>

        {/* Saved Resumes */}
        {resumes.map(resume => (
          <div
            key={resume.id}
            onClick={() => onSelect(resume)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              minHeight: '160px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Template color strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#2563EB', opacity: 0.8 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', marginBottom: '12px', marginTop: '4px' }}>
              <FileText size={18} style={{ color: '#2563EB' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {resume.title || 'Untitled Resume'}
              </h3>
            </div>

            <div style={{ flex: 1 }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#6B7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                  {resume.template || 'classic'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                <span>Updated {formatDate(resume.updated_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

