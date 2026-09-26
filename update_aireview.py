import re

with open('/Users/amarkhot/Desktop/JobwinResume/frontend/components/resume-io/AIReviewPanel.js', 'r') as f:
    content = f.read()

score_logic = """
  const getScoreData = () => {
    let contentScore = 0;
    let keywords = 0;
    let format = 0;
    let completeness = 0;
    let missing = [];
    const r = resume || {};

    if (r.summary) contentScore += 5; else missing.push('Add a professional summary');
    if (r.summary && r.summary.trim().split(/\s+/).length > 50) contentScore += 5; else missing.push('Make summary longer (>50 words)');
    
    let hasExpBullets = false;
    let hasGoodBullets = false;
    if (r.experience?.length) {
      r.experience.forEach(e => {
        if (e.bullets?.length) {
          hasExpBullets = true;
          if (e.bullets.some(b => b && b.length > 10)) hasGoodBullets = true;
        }
      });
    }
    if (hasExpBullets) contentScore += 5; else missing.push('Add bullet points to experience');
    if (hasGoodBullets) contentScore += 5; else missing.push('Make experience bullets more detailed (>10 chars)');
    if (r.education?.length) contentScore += 5; else missing.push('Add education details');

    const skillItems = Array.isArray(r.skills?.items) ? r.skills.items : (Array.isArray(r.skills) ? r.skills : []);
    if (skillItems.length > 0) keywords += 10; else missing.push('Add a skills section');
    if (skillItems.length >= 5) keywords += 10; else missing.push('Add at least 5 skills');
    if (skillItems.length > 0 && skillItems.every(s => s && (s.name || typeof s === 'string'))) keywords += 5;

    if (r.personal?.name) format += 5; else missing.push('Add your name');
    if (r.personal?.email) format += 5; else missing.push('Add your email');
    if (r.personal?.phone) format += 5; else missing.push('Add your phone number');
    if (r.personal?.location) format += 5; else missing.push('Add your location');
    if (r.personal?.linkedin) format += 5; else missing.push('Add your LinkedIn profile');

    if (r.experience?.length) completeness += 5; else missing.push('Add experience section');
    if (r.education?.length) completeness += 5;
    if (skillItems.length > 0) completeness += 5;
    if (r.summary) completeness += 5;
    
    let extraSections = 0;
    if (r.certifications?.length) extraSections++;
    if (r.languages?.length) extraSections++;
    if (r.projects?.length) extraSections++;
    if (r.achievements?.length) extraSections++;
    if (extraSections > 0) completeness += 5; else missing.push('Add an extra section (Projects, Certifications, etc.)');

    const total = contentScore + keywords + format + completeness;
    const tips = [...new Set(missing)].slice(0, 3);
    if (tips.length === 0) tips.push('Your resume looks great!', 'Tailor it to the job description', 'Double check for typos');

    return { total, contentScore, keywords, format, completeness, tips };
  };

  const scoreData = getScoreData();

  const getBarColor = (val) => {
    if (val >= 20) return '#16A34A';
    if (val >= 10) return '#EAB308';
    return '#DC2626';
  };
  
  const scorePanel = (
    <div style={{ marginBottom: 32, padding: 24, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1E293B' }}>Resume Score</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
        {/* Circular Progress */}
        <div style={{ 
          width: 120, height: 120, borderRadius: '50%', 
          background: `conic-gradient(${getScoreColor(scoreData.total)} ${scoreData.total * 3.6}deg, #E2E8F0 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 'bold', color: getScoreColor(scoreData.total) }}>{scoreData.total}</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>/ 100</span>
          </div>
        </div>

        {/* Category Bars */}
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#475569' }}>
              <span>Content</span><span>{scoreData.contentScore}/25</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
              <div style={{ width: `${(scoreData.contentScore / 25) * 100}%`, height: '100%', backgroundColor: getBarColor(scoreData.contentScore), borderRadius: 4 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#475569' }}>
              <span>Keywords</span><span>{scoreData.keywords}/25</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
              <div style={{ width: `${(scoreData.keywords / 25) * 100}%`, height: '100%', backgroundColor: getBarColor(scoreData.keywords), borderRadius: 4 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#475569' }}>
              <span>Format</span><span>{scoreData.format}/25</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
              <div style={{ width: `${(scoreData.format / 25) * 100}%`, height: '100%', backgroundColor: getBarColor(scoreData.format), borderRadius: 4 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500, color: '#475569' }}>
              <span>Completeness</span><span>{scoreData.completeness}/25</span>
            </div>
            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
              <div style={{ width: `${(scoreData.completeness / 25) * 100}%`, height: '100%', backgroundColor: getBarColor(scoreData.completeness), borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', color: '#1E293B' }}>
          <Lightbulb size={16} color="#EAB308" style={{ marginRight: 8 }} />
          Quick Tips for Improvement
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {scoreData.tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </div>
    </div>
  );
"""

new_content = content.replace(
    "if (status === 'idle') {",
    score_logic + "\n  if (status === 'idle') {"
)
new_content = new_content.replace(
    "<h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Get better with AI</h2>",
    "{scorePanel}\n        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Get better with AI</h2>"
)

new_content = new_content.replace(
    "<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>",
    "{scorePanel}\n      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>"
)

with open('/Users/amarkhot/Desktop/JobwinResume/frontend/components/resume-io/AIReviewPanel.js', 'w') as f:
    f.write(new_content)
