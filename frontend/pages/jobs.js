import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Jobs() {
  const router = useRouter();
  const { role, city } = router.query;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fact, setFact] = useState(0);
  const [themeIdx] = useState(() => Math.floor(Math.random() * 4));

  const themes = [
    { icon: "🐝", steps: ["Bzzzz... scanning job boards!", "Collecting sweet opportunities...", "Almost done buzzing!", "Results almost ready!"], color: "#FFB347", label: "Bee" },
    { icon: "🦊", steps: ["Our clever fox is searching...", "Outsmarting other job boards!", "Sharp eyes spotted matches!", "Found your targets!"], color: "#FF6584", label: "Fox" },
    { icon: "🚀", steps: ["JobwinResume is zooming through listings!", "Shooting past 50+ job boards!", "Exploring the job market...", "Landing your dream job!"], color: "#6C63FF", label: "Rocket" },
    { icon: "🐨", steps: ["Hang tight! Koala is searching...", "Munching through job boards!", "Finding the best ones...", "Your perfect jobs are here!"], color: "#43D9A2", label: "Koala" },
  ];

  const facts = [
    "Tailoring your resume increases interview chances by 3x!",
    "Apply within 24 hours of posting for best results.",
    "Most jobs get filled within 2 weeks — act fast!",
    "Personalised cover letters get 50% more responses.",
  ];

  const t = themes[themeIdx];

  useEffect(() => { if (role && city) fetchJobs(); }, [role, city]);

  useEffect(() => {
    if (!loading) return;
    const s = setInterval(() => setStep(p => (p + 1) % t.steps.length), 4000);
    const p = setInterval(() => setProgress(p => p >= 90 ? 90 : p + Math.random() * 8), 1500);
    const f = setInterval(() => setFact(p => (p + 1) % facts.length), 5000);
    return () => { clearInterval(s); clearInterval(p); clearInterval(f); };
  }, [loading]);

  const fetchJobs = async () => {
    setLoading(true);
    setProgress(5);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/jobs?role=" + encodeURIComponent(role) + "&city=" + encodeURIComponent(city));
      const data = await res.json();
      setProgress(100);
      setTimeout(() => { setJobs(data.jobs || []); setLoading(false); }, 400);
    } catch (err) {
      setError("Could not fetch jobs!");
      setLoading(false);
    }
  };

  const toggleSelect = (job) => {
    const key = job.company + job.title;
    if (selectedJobs.find(j => j.company + j.title === key)) {
      setSelectedJobs(selectedJobs.filter(j => j.company + j.title !== key));
    } else {
      setSelectedJobs([...selectedJobs, job]);
    }
  };

  const isSelected = (job) => !!selectedJobs.find(j => j.company + j.title === job.company + job.title);

  const handleApply = () => {
    localStorage.setItem("resumeora_selected_jobs", JSON.stringify(selectedJobs));
    router.push("/apply");
  };

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0a0f",color:"white",fontFamily:"Arial"}}>
      <div style={{textAlign:"center",maxWidth:"500px",padding:"40px 20px"}}>
        <div style={{fontSize:"90px",marginBottom:"16px"}}>{t.icon}</div>
        <div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",marginBottom:"20px"}}>JobwinResume {t.label} is searching for you!</div>
        <h2 style={{fontSize:"22px",fontWeight:"700",marginBottom:"12px",color:t.color}}>{t.steps[step]}</h2>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:"14px",marginBottom:"28px"}}>Searching <b style={{color:"white"}}>{role}</b> jobs in <b style={{color:"white"}}>{city}</b></p>
        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:"100px",height:"6px",marginBottom:"8px",overflow:"hidden"}}>
          <div style={{height:"100%",width:progress+"%",background:"linear-gradient(90deg,"+t.color+",#6C63FF)",borderRadius:"100px",transition:"width 1s ease"}} />
        </div>
        <p style={{color:"rgba(255,255,255,0.2)",fontSize:"12px",marginBottom:"28px"}}>{Math.round(progress)}% complete</p>
        <div style={{background:t.color+"18",border:"1px solid "+t.color+"30",borderRadius:"12px",padding:"14px 18px"}}>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:"13px",margin:0}}>💡 {facts[fact]}</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0a0f",color:"white"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"50px",marginBottom:"16px"}}>😕</div>
        <h2 style={{color:"#FF6584",marginBottom:"12px"}}>Something went wrong</h2>
        <p style={{color:"rgba(255,255,255,0.5)",marginBottom:"20px"}}>{error}</p>
        <button onClick={() => router.push("/")} style={{padding:"10px 20px",background:"#6C63FF",color:"white",border:"none",borderRadius:"100px",cursor:"pointer"}}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"white",fontFamily:"Arial"}}>
      <div style={{background:"rgba(10,10,15,0.95)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"}} onClick={() => router.push("/")}>
          <span style={{fontSize:"20px"}}>🚀</span>
          <span style={{fontSize:"18px",fontWeight:"700",color:"white"}}>JobwinResume</span>
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={() => router.push("/resume")} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.1)",padding:"8px 16px",borderRadius:"100px",cursor:"pointer",fontSize:"13px"}}>📄 Resume</button>
          <button onClick={() => router.push("/")} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.1)",padding:"8px 16px",borderRadius:"100px",cursor:"pointer",fontSize:"13px"}}>← New Search</button>
        </div>
      </div>
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"30px 20px"}}>
        <h2 style={{fontSize:"26px",fontWeight:"700",marginBottom:"6px"}}>{jobs.length} {role} jobs in {city}</h2>
        <p style={{color:"rgba(255,255,255,0.4)",marginBottom:"28px",fontSize:"14px"}}>Summarised • Real companies • Updated today</p>
        {jobs.map((job, i) => (
          <div key={i} style={{background:isSelected(job)?"rgba(108,99,255,0.08)":"rgba(255,255,255,0.03)",borderRadius:"16px",padding:"22px",marginBottom:"14px",border:"1px solid "+(isSelected(job)?"rgba(108,99,255,0.4)":"rgba(255,255,255,0.06)"),position:"relative"}}>
            <div onClick={() => toggleSelect(job)} style={{position:"absolute",top:"18px",right:"18px",width:"22px",height:"22px",borderRadius:"5px",border:isSelected(job)?"none":"2px solid rgba(255,255,255,0.15)",background:isSelected(job)?"#6C63FF":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"white",fontWeight:"bold",fontSize:"12px"}}>
              {isSelected(job)?"✓":""}
            </div>
            <div style={{paddingRight:"36px"}}>
              <h3 style={{fontSize:"19px",fontWeight:"700",marginBottom:"4px"}}>{job.title}</h3>
              <p style={{color:"#6C63FF",fontWeight:"600",fontSize:"14px",marginBottom:"10px"}}>{job.company}</p>
              <div style={{display:"flex",gap:"12px",marginBottom:"12px",flexWrap:"wrap"}}>
                <span style={{color:"rgba(255,255,255,0.4)",fontSize:"13px"}}>📍 {job.location}</span>
                <span style={{color:"rgba(255,255,255,0.4)",fontSize:"13px"}}>📅 {job.date_posted}</span>
                <span style={{color:"rgba(255,255,255,0.4)",fontSize:"13px"}}>💼 {job.job_type}</span>
                {job.experience_needed && <span style={{color:"rgba(255,255,255,0.4)",fontSize:"13px"}}>⏱ {job.experience_needed}</span>}
              </div>
              {job.ai_summary && (
                <div style={{background:"rgba(108,99,255,0.07)",borderRadius:"8px",padding:"12px",marginBottom:"12px",borderLeft:"3px solid #6C63FF"}}>
                  <p style={{margin:0,color:"rgba(255,255,255,0.7)",fontSize:"13px",lineHeight:"1.6"}}>✨ {job.ai_summary}</p>
                </div>
              )}
              {job.key_skills && job.key_skills !== "Not specified" && (
                <div style={{marginBottom:"12px"}}>
                  {job.key_skills.split(",").slice(0,6).map((s,j) => (
                    <span key={j} style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",padding:"3px 10px",borderRadius:"100px",fontSize:"12px",marginRight:"6px",marginBottom:"4px",display:"inline-block"}}>{s.trim()}</span>
                  ))}
                </div>
              )}
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {job.apply_link && <a href={job.apply_link} target="_blank" rel="noreferrer" style={{background:"linear-gradient(135deg,#6C63FF,#FF6584)",color:"white",padding:"9px 18px",borderRadius:"100px",textDecoration:"none",fontWeight:"600",fontSize:"13px"}}>Apply Now →</a>}
                <button onClick={() => toggleSelect(job)} style={{background:isSelected(job)?"rgba(108,99,255,0.2)":"rgba(255,255,255,0.05)",color:isSelected(job)?"#A29BFE":"rgba(255,255,255,0.5)",border:"1px solid "+(isSelected(job)?"rgba(108,99,255,0.4)":"rgba(255,255,255,0.1)"),padding:"9px 18px",borderRadius:"100px",fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>
                  {isSelected(job)?"✓ Selected":"+ Select"}
                </button>
                <span style={{background:job.difficulty==="Easy"?"rgba(67,217,162,0.1)":job.difficulty==="Competitive"?"rgba(255,101,132,0.1)":"rgba(255,179,71,0.1)",color:job.difficulty==="Easy"?"#43D9A2":job.difficulty==="Competitive"?"#FF6584":"#FFB347",padding:"9px 14px",borderRadius:"100px",fontSize:"12px",fontWeight:"600"}}>
                  {job.difficulty||"Medium"} competition
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedJobs.length > 0 && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(10,10,15,0.97)",padding:"14px 40px",borderTop:"1px solid rgba(108,99,255,0.3)",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:1000}}>
          <span style={{fontWeight:"600",color:"white"}}>{selectedJobs.length} job{selectedJobs.length>1?"s":""} selected</span>
          <div style={{display:"flex",gap:"10px"}}>
            <button onClick={() => setSelectedJobs([])} style={{padding:"10px 18px",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"100px",cursor:"pointer"}}>Clear</button>
            <button onClick={handleApply} style={{padding:"10px 22px",background:"linear-gradient(135deg,#6C63FF,#FF6584)",color:"white",border:"none",borderRadius:"100px",fontWeight:"700",cursor:"pointer"}}>🚀 Apply to {selectedJobs.length} →</button>
          </div>
        </div>
      )}
    </div>
  );
}
