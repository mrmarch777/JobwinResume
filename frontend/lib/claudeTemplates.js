// ═══════════════════════════════════════════════════════════════════════════════
// CLAUDE DESIGN — 20 PROFESSIONAL RESUME TEMPLATES
// Integrated from Claude Design "JobwinResumeTemplate"
// Templates 1-20 with professional styling for all career levels
// ═══════════════════════════════════════════════════════════════════════════════

const SAMPLE = {
  name: "Your Name",
  title: "Professional Title",
  email: "email@example.com",
  phone: "+1-234-567-8900",
  location: "City, State",
  linkedin: "linkedin.com/in/yourprofile",
  website: "yourwebsite.com",
  summary: "Results-driven professional with expertise in key areas. Proven track record of delivering high-impact solutions.",
  experience: [
    { role: "Senior Role", company: "Company Name", location: "City, State", period: "2020 – Present", current: true, bullets: ["Achievement and impact", "Key responsibility", "Quantifiable result"] },
    { role: "Previous Role", company: "Previous Company", location: "City, State", period: "2018 – 2020", current: false, bullets: ["Achievement 1", "Achievement 2", "Achievement 3"] }
  ],
  education: [
    { degree: "Bachelor's Degree", school: "University Name", year: "2018", honors: "Honors / GPA" }
  ],
  skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  certifications: ["Certification 1", "Certification 2"],
  projects: [{ name: "Project Name", desc: "Brief description of the project and your role" }],
  achievements: ["Achievement 1", "Achievement 2", "Achievement 3"],
  languages: ["English (Native)", "Spanish (Intermediate)"],
  hobbies: ["Reading", "Coding", "Traveling"],
  interests: "Technology, Innovation, Professional Development"
};

// ─── TEMPLATE 6: MARKETING / SALES ───────────────────────────────────────────
function Template6({ d = SAMPLE, colors = { primary: "#7b1d3f", accent: "#e94560", bg: "#fff", light: "#fdf5f7", text: "#1a1a1a" } }) {
  const MKTG = {
    ...d,
    name: d.name || "Marcus Rivera",
    title: d.title || "VP Marketing & Growth",
    summary: d.summary || "Data-driven marketing executive with 11 years scaling B2B SaaS brands from $0 to $100M+ ARR.",
    skills: d.skills || ["Demand Generation","Brand Strategy","Performance Marketing","CRM / HubSpot","Content Marketing","SEO / SEM","Product Marketing","Growth Hacking","ABM Campaigns","Marketing Ops"],
    experience: d.experience || [{ role: "VP of Marketing", company: "CloudVault Inc.", period: "2021 – Present", location: "Austin, TX", bullets: ["Grew MQL volume by 312% in 18 months through integrated ABM campaigns","Managed $4.2M annual marketing budget delivering 7.8x pipeline ROI","Built 14-person marketing team from scratch"] }]
  };
  const metrics = [
    { value: "312%", label: "MQL Growth" },
    { value: "7.8x", label: "Pipeline ROI" },
    { value: "$4.2M", label: "Budget Managed" },
    { value: "44%", label: "CAC Reduction" },
  ];
  const s = {
    page: { width: 794, minHeight: 1123, background: colors.bg, fontFamily: "'Montserrat', sans-serif", color: colors.text },
    header: { background: `linear-gradient(135deg, ${colors.primary} 0%, #4a0e24 100%)`, padding: "0 0 0 0", position: "relative", overflow: "hidden" },
    headerDecor: { position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: `${colors.accent}22` },
    headerDecor2: { position: "absolute", bottom: -30, left: 200, width: 120, height: 120, borderRadius: "50%", background: `rgba(255,255,255,0.04)` },
    headerMain: { padding: "36px 50px 24px", position: "relative" },
    name: { fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1 },
    titleText: { fontSize: 13, color: `${colors.accent}dd`, letterSpacing: 2, textTransform: "uppercase", marginTop: 7, fontWeight: 600 },
    contactRow: { display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" },
    contactItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "rgba(255,255,255,0.72)" },
    metricsBar: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: colors.accent, padding: "0" },
    metricCell: { padding: "14px 20px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)" },
    metricVal: { fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1 },
    metricLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 3 },
    body: { display: "flex", padding: "28px 0 0" },
    main: { flex: 1, padding: "0 40px 32px 50px" },
    sidebar: { width: 210, padding: "0 24px 32px 0", borderLeft: `2px solid ${colors.light}` },
    sectionLabel: { fontSize: 10.5, letterSpacing: 3, textTransform: "uppercase", color: colors.accent, fontWeight: 800, marginBottom: 12, position: "relative", paddingLeft: 12 },
    sectionBar: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 4, height: 14, background: colors.accent, borderRadius: 2 },
    section: { marginBottom: 22 },
    jobTitle: { fontSize: 14.5, fontWeight: 800, color: colors.primary },
    jobMeta: { fontSize: 12, color: "#666", marginBottom: 6 },
    bullet: { fontSize: 12.5, color: "#444", paddingLeft: 14, position: "relative", marginBottom: 3, lineHeight: 1.55 },
    accentDot: { position: "absolute", left: 0, top: 7, width: 5, height: 5, background: colors.accent, borderRadius: "50%" },
    skillPill: { display: "inline-block", background: colors.light, border: `1px solid ${colors.accent}33`, color: colors.primary, fontSize: 10.5, padding: "3px 10px", borderRadius: 12, margin: "2px 3px 2px 0", fontWeight: 600 },
  };
  return (
    <div id="resume-preview" style={s.page}>
      <div style={s.header}>
        <div style={s.headerDecor}/>
        <div style={s.headerDecor2}/>
        <div style={s.headerMain}>
          <div style={s.name}>{MKTG.name}</div>
          <div style={s.titleText}>{MKTG.title}</div>
          <div style={s.contactRow}>
            {[d.phone, d.email, d.location, d.linkedin].filter(Boolean).map((c,i) => (
              <div key={i} style={s.contactItem}><span style={{color:colors.accent}}>·</span><span>{c}</span></div>
            ))}
          </div>
        </div>
        <div style={s.metricsBar}>
          {metrics.map((m,i) => (
            <div key={i} style={{...s.metricCell, borderRight: i===3?"none":"1px solid rgba(255,255,255,0.2)"}}>
              <div style={s.metricVal}>{m.value}</div>
              <div style={s.metricLabel}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.body}>
        <div style={s.main}>
          <div style={{...s.section, background:colors.light, padding:"14px 18px", borderRadius:6, borderLeft:`3px solid ${colors.accent}`, marginBottom:22}}>
            <p style={{fontSize:13,lineHeight:1.7,color:"#444",margin:0}}>{MKTG.summary}</p>
          </div>

          <div style={s.section}>
            <div style={s.sectionLabel}><span style={s.sectionBar}/>Experience</div>
            {MKTG.experience.map((exp,i) => (
              <div key={i} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={s.jobTitle}>{exp.role}</div>
                  <div style={{fontSize:11,color:"#999",background:"#f5f5f5",padding:"2px 8px",borderRadius:10,height:"fit-content"}}>{exp.period}</div>
                </div>
                <div style={s.jobMeta}>{exp.company} · {exp.location}</div>
                {exp.bullets?.map((b,j) => <div key={j} style={s.bullet}><span style={s.accentDot}/>{b}</div>)}
              </div>
            ))}
          </div>
        </div>

        <div style={s.sidebar}>
          <div style={{...s.section, marginTop:0}}>
            <div style={s.sectionLabel}><span style={s.sectionBar}/>Skills</div>
            <div>{MKTG.skills.map((sk,i) => <span key={i} style={s.skillPill}>{sk}</span>)}</div>
          </div>
          <div style={s.section}>
            <div style={s.sectionLabel}><span style={s.sectionBar}/>Education</div>
            {d.education.map((e,i) => (
              <div key={i} style={{marginBottom:10}}>
                <div style={{fontSize:12.5,fontWeight:700,color:colors.primary,lineHeight:1.3}}>{e.degree}</div>
                <div style={{fontSize:11.5,color:"#666",marginTop:2}}>{e.school} · {e.year}</div>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionLabel}><span style={s.sectionBar}/>Certifications</div>
            {d.certifications?.map((c,i) => <div key={i} style={{fontSize:12,color:"#444",marginBottom:4,paddingLeft:10,position:"relative"}}><span style={{position:"absolute",left:0,top:6,width:4,height:4,background:colors.accent,borderRadius:"50%",display:"block"}}/>{c}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 7: FRESH GRADUATE ───────────────────────────────────────────────
function Template7({ d = SAMPLE, colors = { primary: "#1d4e89", accent: "#00b4d8", bg: "#f0f7ff", text: "#1a1a1a" } }) {
  const s = {
    page: { width: 794, minHeight: 1123, background: "#fff", fontFamily: "'Nunito', sans-serif", color: colors.text },
    banner: { background: colors.primary, height: 10 },
    header: { background: colors.bg, padding: "32px 52px 24px", display: "flex", gap: 24, alignItems: "flex-start" },
    headerInfo: { flex: 1 },
    name: { fontSize: 32, fontWeight: 800, color: colors.primary, lineHeight: 1.1 },
    titleText: { fontSize: 13, color: colors.accent, fontWeight: 700, marginTop: 5, letterSpacing: 0.5 },
    contactRow: { display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" },
    contactItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#555" },
    body: { padding: "24px 52px 36px" },
    sectionLabel: { fontSize: 12, fontWeight: 800, color: colors.primary, textTransform: "uppercase", letterSpacing: 2, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
    labelAccent: { width: 28, height: 3, background: colors.accent, borderRadius: 2 },
    section: { marginBottom: 20 },
    eduCard: { background: colors.bg, borderRadius: 8, padding: "14px 18px", border: `1px solid ${colors.accent}33`, marginBottom: 8 },
    jobTitle: { fontSize: 14.5, fontWeight: 800, color: colors.primary },
    jobMeta: { fontSize: 12, color: "#666", marginBottom: 6 },
    bullet: { fontSize: 13, color: "#444", paddingLeft: 16, position: "relative", marginBottom: 4, lineHeight: 1.55 },
    accentCheck: { position: "absolute", left: 0, top: 5, width: 8, height: 8, borderRadius: 2, background: colors.accent },
    skillPill: { display: "inline-flex", alignItems: "center", background: `${colors.accent}18`, color: colors.primary, fontSize: 12, padding: "5px 12px", borderRadius: 20, margin: "3px 4px 3px 0", fontWeight: 600, border: `1px solid ${colors.accent}33` },
  };
  return (
    <div id="resume-preview" style={s.page}>
      <div style={s.banner}/>
      <div style={s.header}>
        <div style={s.headerInfo}>
          <div style={s.name}>{d.name}</div>
          <div style={s.titleText}>{d.title}</div>
          <div style={s.contactRow}>
            {[d.phone, d.email, d.location, d.linkedin].filter(Boolean).map((c,i) => (
              <div key={i} style={s.contactItem}><span style={{color: colors.accent}}>●</span><span>{c}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div style={s.body}>
        <div style={s.section}>
          <div style={s.sectionLabel}><span style={s.labelAccent}/>Summary</div>
          <p style={{fontSize:13,lineHeight:1.7,color:"#555"}}>{d.summary}</p>
        </div>
        <div style={s.section}>
          <div style={s.sectionLabel}><span style={s.labelAccent}/>Experience</div>
          {d.experience?.map((exp,i) => (
            <div key={i} style={{marginBottom:14}}>
              <div style={s.jobTitle}>{exp.role}</div>
              <div style={s.jobMeta}>{exp.company} · {exp.period}</div>
              {exp.bullets?.map((b,j) => <div key={j} style={s.bullet}><span style={s.accentCheck}/>{b}</div>)}
            </div>
          ))}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 36px"}}>
          <div>
            <div style={s.section}>
              <div style={s.sectionLabel}><span style={s.labelAccent}/>Education</div>
              {d.education?.map((e,i) => (
                <div key={i} style={s.eduCard}>
                  <div style={{fontSize:13,fontWeight:700,color:colors.primary}}>{e.degree}</div>
                  <div style={{fontSize:12,color:"#666",marginTop:4}}>{e.school}</div>
                  <div style={{fontSize:11.5,color:colors.accent,marginTop:2}}>{e.year}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={s.section}>
              <div style={s.sectionLabel}><span style={s.labelAccent}/>Skills</div>
              <div>{d.skills?.map((sk,i) => <span key={i} style={s.skillPill}>{sk}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 11: ATS CLASSIC ─────────────────────────────────────────────────
function Template11({ d = SAMPLE, colors = { primary: "#1a1a1a", accent: "#2c5282", rule: "#cccccc" } }) {
  const s = {
    page: { width: 794, minHeight: 1123, background: "#fff", fontFamily: "'Arial', 'Helvetica', sans-serif", color: "#1a1a1a", padding: "52px 64px", boxSizing: "border-box" },
    name: { fontSize: 28, fontWeight: 700, color: colors.primary, letterSpacing: 0.5, marginBottom: 4 },
    titleText: { fontSize: 14, color: colors.accent, fontWeight: 700, marginBottom: 10 },
    contactRow: { fontSize: 12, color: "#444", marginBottom: 4, lineHeight: 1.6 },
    hr: { border: "none", borderTop: `2px solid ${colors.primary}`, margin: "14px 0 12px" },
    thinHr: { border: "none", borderTop: `1px solid ${colors.rule}`, margin: "10px 0" },
    sectionLabel: { fontSize: 13, fontWeight: 700, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 },
    jobTitle: { fontSize: 13.5, fontWeight: 700, color: colors.primary, marginBottom: 1 },
    jobMeta: { fontSize: 12.5, color: "#555", marginBottom: 5 },
    bullet: { fontSize: 12.5, color: "#333", paddingLeft: 18, position: "relative", marginBottom: 3, lineHeight: 1.6 },
    bulletDash: { position: "absolute", left: 0, top: 0, color: colors.accent, fontWeight: 700 },
    section: { marginBottom: 16 },
    summary: { fontSize: 13, lineHeight: 1.75, color: "#333", marginBottom: 0 },
    skillItem: { fontSize: 12.5, color: "#333", marginBottom: 3, paddingLeft: 14, position: "relative" },
    skillDot: { position: "absolute", left: 0, top: 7, width: 4, height: 4, borderRadius: "50%", background: colors.accent },
  };
  return (
    <div id="resume-preview" style={s.page}>
      <div style={s.name}>{d.name}</div>
      <div style={s.titleText}>{d.title}</div>
      <div style={s.contactRow}>{d.phone} | {d.email} | {d.location} | {d.linkedin}</div>
      <div style={s.hr}/>

      <div style={s.section}>
        <div style={s.sectionLabel}>Professional Summary</div>
        <p style={s.summary}>{d.summary}</p>
      </div>
      <div style={s.thinHr}/>

      <div style={s.section}>
        <div style={s.sectionLabel}>Work Experience</div>
        {d.experience?.map((exp,i) => (
          <div key={i} style={{marginBottom:14}}>
            <div style={s.jobTitle}>{exp.role}</div>
            <div style={s.jobMeta}>{exp.company} | {exp.location} | {exp.period}</div>
            {exp.bullets?.map((b,j) => <div key={j} style={s.bullet}><span style={s.bulletDash}>•</span>{b}</div>)}
          </div>
        ))}
      </div>
      <div style={s.thinHr}/>

      <div style={s.section}>
        <div style={s.sectionLabel}>Education</div>
        {d.education?.map((e,i) => (
          <div key={i} style={{marginBottom:8}}>
            <div style={s.jobTitle}>{e.degree}</div>
            <div style={s.jobMeta}>{e.school} | {e.year} | {e.honors}</div>
          </div>
        ))}
      </div>
      <div style={s.thinHr}/>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px"}}>
        <div>
          <div style={{...s.section}}>
            <div style={s.sectionLabel}>Skills</div>
            {d.skills?.map((sk,i) => <div key={i} style={s.skillItem}><span style={s.skillDot}/>{sk}</div>)}
          </div>
        </div>
        <div>
          <div style={s.section}>
            <div style={s.sectionLabel}>Certifications</div>
            {d.certifications?.map((c,i) => <div key={i} style={s.skillItem}><span style={s.skillDot}/>{c}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 12: ATS STRUCTURED PRO ─────────────────────────────────────────
function Template12({ d = SAMPLE, colors = { primary: "#1b3a5c", accent: "#1b3a5c", bg: "#f8fafc", rule: "#b0c4de" } }) {
  const s = {
    page: { width: 794, minHeight: 1123, background: "#fff", fontFamily: "'Calibri', 'Segoe UI', Arial, sans-serif", color: "#1a1a1a", padding: 0, boxSizing: "border-box" },
    header: { background: colors.primary, padding: "36px 56px 28px" },
    name: { fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: 0.5 },
    titleText: { fontSize: 13.5, color: "rgba(255,255,255,0.8)", marginTop: 5, marginBottom: 14, fontWeight: 400 },
    contactLine: { fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 },
    body: { padding: "24px 56px 40px" },
    sectionWrap: { marginBottom: 20 },
    sectionLabel: { fontSize: 12, fontWeight: 700, color: colors.primary, textTransform: "uppercase", letterSpacing: 2, borderBottom: `2px solid ${colors.primary}`, paddingBottom: 4, marginBottom: 12 },
    jobTitle: { fontSize: 14, fontWeight: 700, color: "#1a1a1a" },
    jobRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 },
    jobPeriod: { fontSize: 12, color: "#666", fontStyle: "italic" },
    jobCo: { fontSize: 13, color: colors.accent, fontWeight: 600, marginBottom: 6 },
    bullet: { fontSize: 12.5, color: "#333", paddingLeft: 16, position: "relative", marginBottom: 3, lineHeight: 1.6 },
    bDot: { position: "absolute", left: 2, top: 6, width: 5, height: 5, borderRadius: "50%", background: colors.accent },
    skillChip: { fontSize: 11.5, color: colors.primary, border: `1px solid ${colors.rule}`, padding: "3px 10px", borderRadius: 2, display: "inline-block", margin: "3px 4px" },
    summary: { fontSize: 13, lineHeight: 1.75, color: "#333", margin: 0 },
  };
  return (
    <div id="resume-preview" style={s.page}>
      <div style={s.header}>
        <div style={s.name}>{d.name}</div>
        <div style={s.titleText}>{d.title}</div>
        <div style={s.contactLine}>{d.phone} &nbsp;|&nbsp; {d.email} &nbsp;|&nbsp; {d.location} &nbsp;|&nbsp; {d.linkedin}</div>
      </div>
      <div style={s.body}>
        <div style={s.sectionWrap}>
          <div style={s.sectionLabel}>Professional Summary</div>
          <p style={s.summary}>{d.summary}</p>
        </div>

        <div style={s.sectionWrap}>
          <div style={s.sectionLabel}>Professional Experience</div>
          {d.experience?.map((exp,i) => (
            <div key={i} style={{marginBottom:15}}>
              <div style={s.jobRow}>
                <div style={s.jobTitle}>{exp.role}</div>
                <div style={s.jobPeriod}>{exp.period}</div>
              </div>
              <div style={s.jobCo}>{exp.company} — {exp.location}</div>
              {exp.bullets?.map((b,j) => <div key={j} style={s.bullet}><span style={s.bDot}/>{b}</div>)}
            </div>
          ))}
        </div>

        <div style={{display:"grid", gridTemplateColumns:"55% 45%", gap:"0 32px"}}>
          <div>
            <div style={s.sectionWrap}>
              <div style={s.sectionLabel}>Education</div>
              {d.education?.map((e,i) => (
                <div key={i} style={{marginBottom:10}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:"#1a1a1a"}}>{e.degree}</div>
                  <div style={{fontSize:12.5,color:"#555"}}>{e.school}</div>
                  <div style={{fontSize:11.5,color:"#999"}}>{e.year}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={s.sectionWrap}>
              <div style={s.sectionLabel}>Core Skills</div>
              <div>{d.skills?.map((sk,i) => <span key={i} style={s.skillChip}>{sk}</span>)}</div>
            </div>
            <div style={s.sectionWrap}>
              <div style={s.sectionLabel}>Certifications</div>
              {d.certifications?.map((c,i) => <div key={i} style={{fontSize:12.5,color:"#333",marginBottom:4}}>{c}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 13: ATS CLEAN BLUE ──────────────────────────────────────────────
function Template13({ d = SAMPLE, colors = { primary: "#0a3d62", accent: "#1a7abf", rule: "#d0e8f5", bg: "#f0f7fc" } }) {
  const s = {
    page: { width: 794, minHeight: 1123, background: "#fff", fontFamily: "'Trebuchet MS', Arial, sans-serif", color: "#1a1a1a", boxSizing: "border-box" },
    topStripe: { background: colors.primary, height: 8 },
    header: { padding: "30px 56px 24px", borderBottom: `1px solid ${colors.rule}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
    nameBlock: {},
    name: { fontSize: 34, fontWeight: 700, color: colors.primary, letterSpacing: 0.5 },
    titleText: { fontSize: 14, color: colors.accent, marginTop: 4, fontWeight: 600 },
    contactBlock: { textAlign: "right", fontSize: 11.5, color: "#555", lineHeight: 2, borderLeft: `2px solid ${colors.rule}`, paddingLeft: 20 },
    body: { padding: "20px 56px 40px" },
    sectionLabel: { fontSize: 11.5, fontWeight: 700, color: "#fff", background: colors.primary, textTransform: "uppercase", letterSpacing: 2, padding: "5px 12px", marginBottom: 12, marginLeft: -8 },
    section: { marginBottom: 20 },
    summary: { fontSize: 13, lineHeight: 1.75, color: "#333", background: colors.bg, padding: "12px 16px", borderLeft: `3px solid ${colors.accent}` },
    jobTitle: { fontSize: 14, fontWeight: 700, color: colors.primary },
    jobRow: { display: "flex", justifyContent: "space-between" },
    jobMeta: { fontSize: 12.5, color: colors.accent, fontWeight: 600, marginBottom: 6 },
    jobPeriod: { fontSize: 12, color: "#888", background: colors.bg, padding: "1px 8px", borderRadius: 3 },
    bullet: { fontSize: 12.5, color: "#333", paddingLeft: 16, position: "relative", marginBottom: 3, lineHeight: 1.6 },
    bArrow: { position: "absolute", left: 0, top: 0, color: colors.accent, fontWeight: 700, fontSize: 13 },
    skillDot: { width: 6, height: 6, borderRadius: 1, background: colors.accent, flexShrink: 0 },
  };
  return (
    <div id="resume-preview" style={s.page}>
      <div style={s.topStripe}/>
      <div style={s.header}>
        <div style={s.nameBlock}>
          <div style={s.name}>{d.name}</div>
          <div style={s.titleText}>{d.title}</div>
        </div>
        <div style={s.contactBlock}>
          <div>{d.email}</div>
          <div>{d.phone}</div>
          <div>{d.location}</div>
          <div>{d.linkedin}</div>
        </div>
      </div>
      <div style={s.body}>
        <div style={s.section}>
          <div style={s.sectionLabel}>Professional Summary</div>
          <div style={s.summary}>{d.summary}</div>
        </div>
        <div style={s.section}>
          <div style={s.sectionLabel}>Work Experience</div>
          {d.experience?.map((exp,i) => (
            <div key={i} style={{marginBottom:14}}>
              <div style={s.jobRow}>
                <div style={s.jobTitle}>{exp.role}</div>
                <div style={s.jobPeriod}>{exp.period}</div>
              </div>
              <div style={s.jobMeta}>{exp.company} · {exp.location}</div>
              {exp.bullets?.map((b,j) => <div key={j} style={s.bullet}><span style={s.bArrow}>›</span>{b}</div>)}
            </div>
          ))}
        </div>
        <div style={s.section}>
          <div style={s.sectionLabel}>Education</div>
          {d.education?.map((e,i) => (
            <div key={i} style={{marginBottom:10}}>
              <div style={{fontWeight:700,fontSize:13.5,color:colors.primary}}>{e.degree}</div>
              <div style={{fontSize:12.5,color:"#555"}}>{e.school} · {e.year}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 36px"}}>
          <div>
            <div style={{...s.sectionLabel}}>Skills</div>
            {d.skills?.map((sk,i) => <div key={i} style={{fontSize:12.5,color:"#333",marginBottom:5,paddingLeft:12,position:"relative"}}><span style={{position:"absolute",left:0,top:6,width:4,height:4,borderRadius:"50%",background:colors.accent,display:"block"}}/>{sk}</div>)}
          </div>
          <div>
            <div style={{...s.sectionLabel}}>Certifications</div>
            {d.certifications?.map((c,i) => <div key={i} style={{fontSize:12.5,color:"#333",marginBottom:5,paddingLeft:12,position:"relative"}}><span style={{position:"absolute",left:0,top:6,width:4,height:4,borderRadius:"50%",background:colors.accent,display:"block"}}/>{c}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 15: PHOTO EXECUTIVE (SIDEBAR) ──────────────────────────────────
function Template15({ d = SAMPLE, colors = { primary: "#0d2137", accent: "#b8922e", bg: "#f5f3ef", text: "#1a1a1a" } }) {
  const s = {
    page: { width: 794, minHeight: 1123, background: colors.bg, fontFamily: "'Lato', sans-serif", color: colors.text, display: "flex" },
    sidebar: { width: 236, background: colors.primary, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 22px 32px" },
    sideName: { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.3, marginBottom: 4 },
    sideTitle: { fontSize: 10, color: colors.accent, letterSpacing: 2, textTransform: "uppercase", textAlign: "center", marginBottom: 22 },
    divider: { width: "100%", height: 1, background: `rgba(255,255,255,0.12)`, marginBottom: 20 },
    sideLabel: { fontSize: 9.5, letterSpacing: 3, color: colors.accent, textTransform: "uppercase", fontWeight: 700, alignSelf: "flex-start", marginBottom: 10 },
    contactItem: { display: "flex", gap: 8, fontSize: 11.5, color: "rgba(255,255,255,0.72)", marginBottom: 7, width: "100%" },
    main: { flex: 1, padding: "40px 36px 36px 30px" },
    sectionLabel: { fontSize: 10.5, letterSpacing: 3, textTransform: "uppercase", color: colors.primary, fontWeight: 700, marginBottom: 10, paddingBottom: 5, borderBottom: `1px solid ${colors.accent}` },
    jobTitle: { fontFamily: "'Playfair Display', serif", fontSize: 14.5, fontWeight: 700, color: colors.primary },
    jobMeta: { fontSize: 12, color: "#666", marginTop: 2, marginBottom: 6 },
    bullet: { fontSize: 12.5, color: "#444", paddingLeft: 14, position: "relative", marginBottom: 3, lineHeight: 1.55 },
    dot: { position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: colors.accent },
  };
  return (
    <div id="resume-preview" style={s.page}>
      <div style={s.sidebar}>
        {d.photo
          ? <img src={d.photo} alt="Profile" crossOrigin="anonymous" style={{ width:110, height:110, borderRadius:"50%", objectFit:"cover", objectPosition:"center top", border:`3px solid ${colors.accent}`, marginBottom:20, display:"block" }} />
          : <div style={{width:110,height:110,borderRadius:"50%",background:`linear-gradient(135deg,${colors.primary},${colors.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:700,color:"#fff",border:`3px solid ${colors.accent}`,marginBottom:20}}>{(d.name||"?").split(" ").map(w=>w[0]).filter(Boolean).slice(0,2).join("").toUpperCase()}</div>
        }
        <div style={s.sideName}>{d.name}</div>
        <div style={s.sideTitle}>{d.title?.split(" ").slice(0,3).join(" ")}</div>
        <div style={s.divider}/>
        <div style={s.sideLabel}>Contact</div>
        {[d.phone, d.email, d.location, d.linkedin].filter(Boolean).map((c,i)=>(
          <div key={i} style={s.contactItem}><span>{c}</span></div>
        ))}
        <div style={s.divider}/>
        <div style={s.sideLabel}>Skills</div>
        {d.skills?.slice(0,7).map((sk,i)=>(
          <div key={i} style={{fontSize:11.5,color:"rgba(255,255,255,0.8)",marginBottom:6,width:"100%"}}>{sk}</div>
        ))}
        <div style={s.divider}/>
        <div style={s.sideLabel}>Languages</div>
        {d.languages?.map((l,i)=><div key={i} style={{fontSize:11.5,color:"rgba(255,255,255,0.7)",marginBottom:4,width:"100%"}}>{l}</div>)}
      </div>
      <div style={s.main}>
        <div style={{marginBottom:20,borderLeft:`3px solid ${colors.accent}`,paddingLeft:14}}>
          <p style={{fontSize:12.5,lineHeight:1.7,color:"#555",margin:0,fontStyle:"italic"}}>{d.summary}</p>
        </div>
        <div style={{marginBottom:20}}>
          <div style={s.sectionLabel}>Professional Experience</div>
          {d.experience?.map((exp,i)=>(
            <div key={i} style={{marginBottom:14}}>
              <div style={s.jobTitle}>{exp.role}</div>
              <div style={s.jobMeta}><span style={{color:colors.primary,fontWeight:700}}>{exp.company}</span> · {exp.period}</div>
              {exp.bullets?.map((b,j)=><div key={j} style={s.bullet}><span style={s.dot}/>{b}</div>)}
            </div>
          ))}
        </div>
        <div style={{marginBottom:20}}>
          <div style={s.sectionLabel}>Education</div>
          {d.education?.map((e,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <div style={{fontWeight:700,fontSize:13,color:colors.primary}}>{e.degree}</div>
              <div style={{fontSize:12,color:"#666"}}>{e.school} · {e.year}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:20}}>
          <div style={s.sectionLabel}>Certifications</div>
          <div>{d.certifications?.map((c,i)=><span key={i} style={{display:"inline-block",background:`${colors.primary}0e`,border:`1px solid ${colors.accent}44`,color:"#333",fontSize:11,padding:"3px 10px",borderRadius:2,margin:"2px 3px 2px 0"}}>{c}</span>)}</div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE 16: PHOTO MODERN HEADER ────────────────────────────────────────
function Template16({ d = SAMPLE, colors = { primary: "#1a1a2e", accent: "#e94560", bg: "#fff", light: "#f8f8fc" } }) {
  const s = {
    page: { width: 794, minHeight: 1123, background: colors.bg, fontFamily: "'Montserrat', sans-serif", color: "#1a1a1a" },
    header: { background: `linear-gradient(120deg, ${colors.primary} 0%, #16213e 100%)`, padding: "36px 50px 28px", display: "flex", gap: 28, alignItems: "center", position: "relative", overflow: "hidden" },
    headerInfo: { flex: 1, position: "relative" },
    name: { fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1.1 },
    titleText: { fontSize: 12.5, color: colors.accent, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginTop: 8, marginBottom: 18 },
    contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 20px" },
    contactItem: { display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "rgba(255,255,255,0.65)" },
    body: { padding: "28px 50px 40px" },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 36px" },
    sectionLabel: { fontSize: 11, fontWeight: 800, color: colors.primary, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12, position: "relative", paddingLeft: 12 },
    sLabelBar: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 4, height: 14, background: colors.accent, borderRadius: 2 },
    jobTitle: { fontSize: 14, fontWeight: 800, color: colors.primary },
    jobMeta: { fontSize: 12, color: "#777", marginBottom: 6 },
    bullet: { fontSize: 12.5, color: "#444", paddingLeft: 13, position: "relative", marginBottom: 3, lineHeight: 1.55 },
    bDot: { position: "absolute", left: 0, top: 7, width: 4, height: 4, borderRadius: "50%", background: colors.accent },
    skillPill: { display: "inline-block", background: colors.light, color: colors.primary, fontSize: 11, padding: "4px 10px", borderRadius: 12, margin: "2px 3px 2px 0", fontWeight: 600 },
  };
  return (
    <div id="resume-preview" style={s.page}>
      <div style={s.header}>
        <div style={{position:"absolute",right:-60,top:-60,width:280,height:280,borderRadius:"50%",background:`${colors.accent}15`}}/>
        {d.photo
          ? <img src={d.photo} alt="Profile" crossOrigin="anonymous" style={{ width:108, height:108, borderRadius:"12px", objectFit:"cover", objectPosition:"center top", border:`3px solid ${colors.accent}`, boxShadow:"0 8px 32px rgba(0,0,0,0.3)", flexShrink:0, position:"relative" }} />
          : <div style={{width:108,height:108,borderRadius:"12px",background:`linear-gradient(135deg,${colors.accent},#8b2252)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:700,color:"#fff",border:`3px solid ${colors.accent}`,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",flexShrink:0,position:"relative"}}>{(d.name||"?").split(" ").map(w=>w[0]).filter(Boolean).slice(0,2).join("").toUpperCase()}</div>
        }
        <div style={s.headerInfo}>
          <div style={s.name}>{d.name}</div>
          <div style={s.titleText}>{d.title}</div>
          <div style={s.contactGrid}>
            {[d.phone,d.email,d.location,d.linkedin].filter(Boolean).map((c,i)=>(
              <div key={i} style={s.contactItem}><span style={{width:4,height:4,borderRadius:"50%",background:colors.accent,display:"block",flexShrink:0}}/><span>{c}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div style={s.body}>
        <div style={{marginBottom:22,background:`${colors.accent}08`,padding:"14px 16px",borderRadius:6,borderLeft:`3px solid ${colors.accent}`}}>
          <p style={{fontSize:13,lineHeight:1.7,color:"#444",margin:0}}>{d.summary}</p>
        </div>
        <div style={s.twoCol}>
          <div>
            <div style={{marginBottom:20}}>
              <div style={s.sectionLabel}><span style={s.sLabelBar}/>Experience</div>
              {d.experience?.map((exp,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={s.jobTitle}>{exp.role}</div>
                  <div style={s.jobMeta}>{exp.company} · {exp.period}</div>
                  {exp.bullets?.map((b,j)=><div key={j} style={s.bullet}><span style={s.bDot}/>{b}</div>)}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{marginBottom:20}}>
              <div style={s.sectionLabel}><span style={s.sLabelBar}/>Education</div>
              {d.education?.map((e,i)=>(
                <div key={i} style={{background:colors.light,borderRadius:6,padding:"12px 16px",marginBottom:8,borderLeft:`3px solid ${colors.accent}`}}>
                  <div style={{fontWeight:800,fontSize:13,color:colors.primary}}>{e.degree}</div>
                  <div style={{fontSize:12,color:"#666",marginTop:3}}>{e.school}</div>
                  <div style={{fontSize:11.5,color:colors.accent,marginTop:2}}>{e.year}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={s.sectionLabel}><span style={s.sLabelBar}/>Skills</div>
              <div>{d.skills?.map((sk,i)=><span key={i} style={s.skillPill}>{sk}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Template6, Template7, Template11, Template12, Template13, Template15, Template16, SAMPLE };
