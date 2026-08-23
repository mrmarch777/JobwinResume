import React, { useState, useEffect } from 'react';
import { Search, MapPin, Heart, Bookmark, Loader2 } from 'lucide-react';

export default function TailorPanel({ resume, onSelectJob, selectedJob }) {
  const [urlInput, setUrlInput] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  const fetchJobs = async (loc) => {
    setLoading(true);
    // Mock jobs for now, a real API like Jooble or Adzuna would be needed here
    setJobs([
      { id: '1', title: 'Senior Frontend Engineer', company: 'TechCorp', location: loc || 'Remote', posted: 'Posted 2 days ago', autoApply: true, snippet: 'Looking for a senior frontend engineer with React experience...' },
      { id: '2', title: 'Full Stack Developer', company: 'InnovateInc', location: loc || 'New York, NY', posted: 'Posted 5 days ago', autoApply: false, snippet: 'Join our fast-growing startup to build the next generation of tools.' },
      { id: '3', title: 'React UI Developer', company: 'DesignWorks', location: loc || 'San Francisco, CA', posted: 'Posted 10 days ago', autoApply: true, snippet: 'Strong CSS and React skills required.' }
    ]);
    setLoading(false);
  };

  const handlePasteUrl = async () => {
    if (!urlInput) return;
    setLoading(true);
    try {
      const res = await fetch('/api/fetch-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setJobs([data, ...jobs]);
        onSelectJob(data);
      } else {
        alert('Could not extract job description from URL. Please try another link.');
      }
    } catch (e) {
      alert('Error fetching URL.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs(location);
  }, [resume?.personal?.title]);

  const handleSetLocation = (e) => {
    if (e.key === 'Enter') {
      setShowLocationInput(false);
      fetchJobs(location);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#111827', height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #E5E7EB' }}>
      
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
          Got a posting? Paste a job link with job description:
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input 
            type="text" 
            placeholder="Paste your link here" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ flex: 1, height: 40, padding: '0 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14 }}
          />
          <button 
            onClick={handlePasteUrl}
            style={{ backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: 6, padding: '0 16px', fontWeight: 500, cursor: 'pointer', fontSize: 14 }}
          >
            Start tailoring
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
          Example: https://www.ziprecruiter.com/jobs/company/position
        </div>
      </div>

      <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
        <MapPin size={20} color="#2563EB" style={{ marginRight: 12 }} />
        <div style={{ flex: 1 }}>
          {!showLocationInput && !location ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Where will you work?</div>
              <button onClick={() => setShowLocationInput(true)} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 13, padding: 0, cursor: 'pointer' }}>
                Set your location
              </button>
            </div>
          ) : showLocationInput ? (
            <input 
              autoFocus
              type="text"
              placeholder="City, State or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleSetLocation}
              onBlur={() => { setShowLocationInput(false); fetchJobs(location); }}
              style={{ width: '100%', height: 32, padding: '0 8px', borderRadius: 4, border: '1px solid #D1D5DB', fontSize: 14 }}
            />
          ) : (
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{location}</div>
              <button onClick={() => setShowLocationInput(true)} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 13, padding: 0, cursor: 'pointer' }}>
                Change location
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 className="animate-spin" style={{ color: '#2563EB' }} />
          </div>
        ) : (
          jobs.map((job, idx) => {
            const isSelected = selectedJob && selectedJob.id === job.id;
            return (
              <div 
                key={job.id || idx}
                onClick={() => onSelectJob(job)}
                style={{ 
                  padding: '16px 24px', 
                  borderBottom: '1px solid #F3F4F6', 
                  cursor: 'pointer',
                  borderLeft: isSelected ? '4px solid #2563EB' : '4px solid transparent',
                  backgroundColor: isSelected ? '#F3F6FF' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>{job.title}</h4>
                  <Bookmark size={18} color="#9CA3AF" />
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                  {job.company} • {job.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{job.posted}</div>
                  {job.autoApply && (
                    <span style={{ fontSize: 11, fontWeight: 500, backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: 12 }}>
                      Auto Apply
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  );
}
