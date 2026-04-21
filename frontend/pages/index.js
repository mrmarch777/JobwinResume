import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

// Static star positions — no Math.random() on render
const STARS = [
  { w: 2.1, top: "8%",  left: "12%", op: 0.4,  dur: 3.2, delay: 0.5 },
  { w: 1.5, top: "15%", left: "28%", op: 0.25, dur: 2.8, delay: 1.2 },
  { w: 2.5, top: "22%", left: "45%", op: 0.5,  dur: 3.8, delay: 0.8 },
  { w: 1.2, top: "5%",  left: "63%", op: 0.3,  dur: 2.5, delay: 2.1 },
  { w: 2.0, top: "30%", left: "78%", op: 0.45, dur: 4.1, delay: 0.3 },
  { w: 1.8, top: "42%", left: "92%", op: 0.35, dur: 3.0, delay: 1.5 },
  { w: 1.3, top: "55%", left: "7%",  op: 0.2,  dur: 2.7, delay: 2.5 },
  { w: 2.2, top: "10%", left: "35%", op: 0.4,  dur: 3.5, delay: 0.9 },
  { w: 1.6, top: "68%", left: "52%", op: 0.3,  dur: 4.2, delay: 1.1 },
  { w: 2.4, top: "25%", left: "88%", op: 0.5,  dur: 2.9, delay: 0.6 },
  { w: 1.1, top: "75%", left: "20%", op: 0.22, dur: 3.3, delay: 1.8 },
  { w: 2.0, top: "18%", left: "70%", op: 0.38, dur: 3.7, delay: 2.3 },
  { w: 1.7, top: "48%", left: "40%", op: 0.28, dur: 2.6, delay: 0.4 },
  { w: 2.3, top: "62%", left: "82%", op: 0.42, dur: 4.0, delay: 1.6 },
  { w: 1.4, top: "35%", left: "15%", op: 0.32, dur: 3.1, delay: 2.0 },
  { w: 1.9, top: "78%", left: "68%", op: 0.26, dur: 2.4, delay: 0.7 },
  { w: 2.1, top: "12%", left: "55%", op: 0.44, dur: 3.6, delay: 1.3 },
  { w: 1.5, top: "58%", left: "30%", op: 0.3,  dur: 2.9, delay: 2.2 },
  { w: 2.6, top: "3%",  left: "85%", op: 0.48, dur: 4.3, delay: 0.2 },
  { w: 1.2, top: "72%", left: "10%", op: 0.2,  dur: 3.4, delay: 1.9 },
];

const FEATURES = [
  { icon: "📄", title: "32 Premium Templates", desc: "Choose from 32 recruiter-tested templates. 75% of users go from no interviews to callbacks in 2 weeks." },
  { icon: "🤖", title: "AI Content Writer (Claude)", desc: "Save 2+ hours of writing. AI rewrites your bullets to be 10x more impactful. Users average 92% ATS score." },
  { icon: "✅", title: "Real-Time ATS Score Checker", desc: "Know exactly which keywords to add. Get instant feedback before applying. 94% of users pass ATS screening." },
  { icon: "🎯", title: "Job-Specific Tailoring", desc: "Paste any job description and we auto-tailor your resume in seconds. Match keywords without rewriting from scratch." },
  { icon: "📥", title: "Pixel-Perfect PDF Export", desc: "Download looks exactly like preview. Works on every ATS system tested by TCS, Amazon, Infosys, Flipkart & 500+ more." },
  { icon: "🔄", title: "Unlimited Resume Versions", desc: "Create versions for different roles instantly. Keep one base resume, tailor 10 ways. No data loss, no hassle." },
];

const STEPS = [
  { step: "01", icon: "✍️", title: "Fill Your Details", desc: "Enter your work experience, education, and skills. Import from LinkedIn or upload your existing resume in seconds." },
  { step: "02", icon: "🎨", title: "Choose a Template", desc: "Pick from 25+ professionally designed templates. Our AI optimises your content for ATS while keeping it beautiful." },
  { step: "03", icon: "📥", title: "Download & Apply", desc: "Export a perfect PDF instantly. Your resume is ATS-ready and formatted to impress real human recruiters too." },
];

const REVIEWS = [
  { name: "Priya S.",   role: "Data Analyst",       company: "TCS",      text: "Got 3 interview calls in the first week! The AI rewrote my bullet points and my resume went from boring to brilliant.", avatar: "P", color: "#6C63FF" },
  { name: "Rahul M.",   role: "Software Engineer",   company: "Infosys",  text: "The ATS score feature is a game changer. I went from 38% to 94% ATS match and started getting callbacks immediately.", avatar: "R", color: "#FF6584" },
  { name: "Sneha K.",   role: "Business Analyst",    company: "Wipro",    text: "I had no idea my old resume was being rejected by bots. JobwinResume fixed it in minutes. Highly recommend!", avatar: "S", color: "#43D9A2" },
  { name: "Amit J.",    role: "Product Manager",     company: "Flipkart", text: "The job-tailoring feature is incredible. One base resume, tailored 10 different ways for 10 different JDs — all in one platform.", avatar: "A", color: "#FFB347" },
  { name: "Neha R.",    role: "UX Designer",         company: "Swiggy",   text: "The Creative and Modernist templates are stunning. My resume finally looks as good as my actual design work!", avatar: "N", color: "#64B5F6" },
  { name: "Karan V.",   role: "Data Engineer",       company: "Amazon",   text: "The ATS Classic template helped me pass Amazon's automated screening. Couldn't have done it without JobwinResume.", avatar: "K", color: "#FF8A65" },
  { name: "Divya P.",   role: "HR Manager",          company: "Accenture",text: "I review hundreds of resumes. JobwinResume resumes stand out immediately — clean, structured, keyword-rich. Very impressive.", avatar: "D", color: "#A29BFE" },
  { name: "Rohan T.",   role: "Finance Analyst",     company: "HDFC Bank",text: "The Executive template + AI bullet points got me shortlisted at HDFC Bank within a week. Worth every rupee!", avatar: "R", color: "#43D9A2" },
  { name: "Ananya B.",  role: "Marketing Manager",   company: "Zomato",   text: "I've tried 5 resume builders. JobwinResume is the only one where the PDF actually looks exactly like the preview. No surprises.", avatar: "A", color: "#FFB347" },
];

const FAQS = [
  { q: "Is JobwinResume free to use?", a: "Yes! Our Free plan gives you access to 5 templates, 1 resume, basic AI suggestions, and PDF export — forever free, no card needed." },
  { q: "Will my resume pass ATS filters?", a: "Yes. Our ATS-optimised templates are built specifically to pass applicant tracking systems. We check keyword density, formatting, and section structure automatically and show you a real-time compatibility score." },
  { q: "How does the AI resume writer work?", a: "You fill in your details, and our AI (powered by Claude) rewrites your bullet points, professional summary, and skills section to be concise, impactful, and tailored to your target role." },
  { q: "Can I tailor my resume for a specific job?", a: "Absolutely. Paste any job description and we analyse it, extract the key requirements, and automatically tailor your resume to match — highlighting the right skills and keywords." },
  { q: "How many resumes can I create?", a: "Free users get 1 resume. Basic plan gets 3, Standard gets 5, and Pro users get unlimited resumes across all 25+ templates." },
  { q: "Can I cancel my subscription anytime?", a: "Absolutely. No contracts, no lock-ins. You can upgrade, downgrade, or cancel from your account settings at any time." },
];

const TEMPLATE_PREVIEWS = [
  { name: "ATS Classic",  tag: "ATS ✓",     color: "#1a1a2e", accent: "#4F46E5" },
  { name: "Modernist",    tag: "Modern",     color: "#6C63FF", accent: "#A29BFE" },
  { name: "Creative",     tag: "Creative",   color: "#FF6584", accent: "#FF9EAD" },
  { name: "Executive",    tag: "Executive",  color: "#0A4A6B", accent: "#43D9A2" },
  { name: "Editorial",    tag: "Premium",    color: "#3D52A0", accent: "#A29BFE" },
  { name: "Minimal",      tag: "Minimal",    color: "#111111", accent: "#6C63FF" },
];

export default function Home() {
  const [openFaq, setOpenFaq]             = useState(null);
  const [isMobileMenuOpen, setMobileMenu] = useState(false);
  const [isScrolled, setScrolled]         = useState(false);
  const [isAnnual, setIsAnnual]           = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Non-blocking: render instantly, redirect quietly if logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", background: "#0a0a1a", color: "white", overflowX: "hidden" }}>
      <Head>
        <title>JobwinResume — Professional AI Resume Builder | Get Hired Faster</title>
        <meta name="description" content="Build a professional resume in minutes with JobwinResume. 25+ ATS-optimised templates, AI content writer, instant PDF export, and real-time ATS score checker. Free to start." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float      { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
        @keyframes pulse      { 0%,100%{opacity:0.3}               50%{opacity:0.8} }
        @keyframes marquee    { 0%{transform:translateX(0)}        100%{transform:translateX(calc(-50% - 20px))} }
        @keyframes textShine  { 0%{background-position:0% 50%}     100%{background-position:200% 50%} }
        @keyframes scrollDown { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(12px)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .gradient-text { background: linear-gradient(to right,#6C63FF,#FF6584,#6C63FF); background-size:200% auto; color:transparent; -webkit-background-clip:text; background-clip:text; animation:textShine 4s linear infinite; }
        .btn-primary:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(108,99,255,0.5)!important; }
        .btn-ghost:hover  { background:rgba(255,255,255,0.12)!important; transform:translateY(-1px); }
        .nav-link:hover   { color:#6C63FF!important; }
        .feature-card:hover { transform:translateY(-6px)!important; border-color:rgba(108,99,255,0.4)!important; background:rgba(108,99,255,0.07)!important; box-shadow:0 12px 32px -8px rgba(108,99,255,0.3); }
        .template-card:hover { transform:translateY(-8px) scale(1.02)!important; box-shadow:0 20px 48px -8px rgba(108,99,255,0.4)!important; }
        .review-card:hover  { transform:translateY(-4px)!important; border-color:rgba(108,99,255,0.25)!important; }
        .support-card:hover { transform:translateY(-4px)!important; border-color:rgba(108,99,255,0.4)!important; }
        .reviews-marquee-container { overflow:hidden; width:100%; mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent); -webkit-mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent); }
        .reviews-marquee { display:flex; gap:20px; width:max-content; padding:10px 0; animation:marquee 40s linear infinite; }
        .reviews-marquee:hover { animation-play-state:paused; }
        .mobile-nav-toggle { display:none; }
        @media (max-width:768px) {
          .desktop-nav { display:none!important; }
          .mobile-nav-toggle { display:block; }
          nav { padding:0 24px!important; }
          .hero-h1 { font-size:38px!important; letter-spacing:-1px!important; }
          .hero-btns { flex-direction:column!important; align-items:center!important; }
          .stats-row { gap:24px!important; flex-wrap:wrap!important; justify-content:center!important; }
          .features-grid { grid-template-columns:1fr!important; }
          .steps-grid { grid-template-columns:1fr!important; gap:24px!important; }
          .templates-grid { grid-template-columns:1fr 1fr!important; }
          .about-grid { grid-template-columns:1fr!important; gap:40px!important; }
          .pricing-grid { grid-template-columns:1fr!important; }
          .support-grid { grid-template-columns:1fr!important; }
          .footer-inner { flex-direction:column!important; text-align:center!important; align-items:center!important; }
          .footer-links { justify-content:center!important; }
          section { padding:60px 24px!important; }
          .hero-section { padding:110px 24px 70px!important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:1000, background:isScrolled?"rgba(10,10,26,0.92)":"transparent", backdropFilter:isScrolled?"blur(20px)":"none", borderBottom:isScrolled?"1px solid rgba(255,255,255,0.06)":"1px solid transparent", padding:"0 60px", height:isScrolled?"64px":"78px", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"20px" }}>📄</span>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:"20px", fontWeight:"700", color:"white" }}>
            JobwinResume
          </span>
        </div>
        <div className="desktop-nav" style={{ display:"flex", alignItems:"center", gap:"32px" }}>
          {[["Features","features"],["Templates","templates"],["How It Works","howitworks"],["Reviews","reviews"],["Pricing","pricing"]].map(([label, id]) => (
            <span key={id} className="nav-link" onClick={() => scrollTo(id)}
              style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", cursor:"pointer", transition:"color 0.2s" }}>{label}</span>
          ))}
        </div>
        <div className="desktop-nav" style={{ display:"flex", gap:"12px" }}>
          <button className="btn-ghost" onClick={() => router.push("/login")}
            style={{ background:"rgba(255,255,255,0.07)", color:"white", border:"1px solid rgba(255,255,255,0.12)", padding:"9px 22px", borderRadius:"8px", cursor:"pointer", fontSize:"14px", transition:"all 0.2s" }}>
            Log In
          </button>
          <button className="btn-primary" onClick={() => router.push("/signup")}
            style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)", color:"white", border:"none", padding:"9px 22px", borderRadius:"8px", cursor:"pointer", fontSize:"14px", fontWeight:"600", boxShadow:"0 4px 15px rgba(108,99,255,0.35)", transition:"all 0.3s" }}>
            Build My Resume Free
          </button>
        </div>
        <div className="mobile-nav-toggle" onClick={() => setMobileMenu(!isMobileMenuOpen)} style={{ cursor:"pointer", fontSize:"24px" }}>☰</div>
      </nav>

      {/* ── MOBILE MENU ── */}
      {isMobileMenuOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,10,26,0.98)", zIndex:999, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"24px" }}>
          <div onClick={() => setMobileMenu(false)} style={{ position:"absolute", top:"24px", right:"24px", fontSize:"32px", cursor:"pointer" }}>×</div>
          {[["Features","features"],["Templates","templates"],["How It Works","howitworks"],["Reviews","reviews"],["Pricing","pricing"]].map(([label, id]) => (
            <span key={id} onClick={() => scrollTo(id)} style={{ color:"white", fontSize:"20px", fontWeight:"500", cursor:"pointer" }}>{label}</span>
          ))}
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", width:"80%", maxWidth:"300px", marginTop:"20px" }}>
            <button onClick={() => router.push("/login")} style={{ background:"rgba(255,255,255,0.1)", color:"white", padding:"14px", borderRadius:"8px", border:"none", fontSize:"16px", cursor:"pointer" }}>Log In</button>
            <button onClick={() => router.push("/signup")} style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)", color:"white", padding:"14px", borderRadius:"8px", border:"none", fontSize:"16px", fontWeight:"600", cursor:"pointer" }}>Build My Resume Free</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero-section" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", padding:"110px 60px 80px", textAlign:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%,rgba(108,99,255,0.14) 0%,transparent 65%)", zIndex:0 }} />

        {/* Stars */}
        {STARS.map((s, i) => (
          <div key={i} style={{ position:"absolute", width:s.w+"px", height:s.w+"px", background:"white", borderRadius:"50%", top:s.top, left:s.left, opacity:s.op, animation:`pulse ${s.dur}s ease-in-out infinite`, animationDelay:s.delay+"s", zIndex:0 }} />
        ))}

        {/* Floating resume preview cards */}
        <div className="mobile-hide" style={{ position:"absolute", left:"3%", top:"28%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"14px", padding:"14px 18px", zIndex:3, animation:"float 5s ease-in-out infinite", backdropFilter:"blur(12px)", minWidth:"160px" }}>
          <div style={{ fontSize:"10px", color:"#43D9A2", marginBottom:"6px", fontWeight:"700", letterSpacing:"1px" }}>ATS SCORE</div>
          <div style={{ fontSize:"28px", fontWeight:"700", color:"white", lineHeight:1 }}>94<span style={{ fontSize:"14px", color:"rgba(255,255,255,0.5)" }}>%</span></div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginTop:"4px" }}>↑ from 38%</div>
        </div>
        <div className="mobile-hide" style={{ position:"absolute", right:"3%", top:"24%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"14px", padding:"14px 18px", zIndex:3, animation:"float 6s ease-in-out infinite", animationDelay:"1s", backdropFilter:"blur(12px)" }}>
          <div style={{ fontSize:"10px", color:"#6C63FF", marginBottom:"5px", fontWeight:"600" }}>✨ AI Improved</div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"white" }}>Bullet Points</div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginTop:"4px" }}>3 rewrites ready</div>
        </div>
        <div className="mobile-hide" style={{ position:"absolute", left:"6%", bottom:"28%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"14px", padding:"14px 18px", zIndex:3, animation:"float 7s ease-in-out infinite", animationDelay:"2s", backdropFilter:"blur(12px)" }}>
          <div style={{ fontSize:"10px", color:"#FFB347", marginBottom:"5px", fontWeight:"600" }}>🎨 Templates</div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"white" }}>25+ Designs</div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginTop:"4px" }}>ATS + Creative</div>
        </div>
        <div className="mobile-hide" style={{ position:"absolute", right:"5%", bottom:"30%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"14px", padding:"14px 18px", zIndex:3, animation:"float 5.5s ease-in-out infinite", animationDelay:"0.5s", backdropFilter:"blur(12px)" }}>
          <div style={{ fontSize:"10px", color:"#FF6584", marginBottom:"5px", fontWeight:"600" }}>📥 Exported!</div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"white" }}>Resume_Final.pdf</div>
          <div style={{ fontSize:"11px", color:"#43D9A2", marginTop:"4px" }}>Ready to send ✓</div>
        </div>

        {/* Hero content */}
        <div style={{ position:"relative", zIndex:4, maxWidth:"820px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"12px", background:"rgba(108,99,255,0.15)", border:"1px solid rgba(108,99,255,0.3)", padding:"8px 16px", borderRadius:"100px", marginBottom:"28px", fontSize:"13px", color:"#A29BFE" }}>
            <span style={{ width:"6px", height:"6px", background:"#43D9A2", borderRadius:"50%", display:"inline-block", animation:"pulse 2s infinite" }}></span>
            India's #1 AI Resume Builder
            <span style={{ marginLeft:"4px", color:"#FFB347", fontWeight:"600" }}>⭐⭐⭐⭐⭐ 4.9/5 (1,200+ reviews)</span>
          </div>

          <h1 className="hero-h1" style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(40px,6.5vw,78px)", fontWeight:"900", lineHeight:"1.06", marginBottom:"22px", letterSpacing:"-2px" }}>
            Build a Resume That<br />
            <span className="gradient-text" style={{ fontStyle:"italic" }}>Gets You Hired</span>
          </h1>

          <p style={{ fontSize:"18px", color:"rgba(255,255,255,0.6)", lineHeight:"1.75", maxWidth:"580px", margin:"0 auto 28px" }}>
            Build a professional, ATS-friendly resume in <strong style={{ color:"rgba(255,255,255,0.85)" }}>5 minutes</strong>. Our AI writes compelling bullet points, checks compatibility in real-time, and formats for any company. <strong style={{ color:"rgba(255,255,255,0.85)" }}>Free forever</strong>.
          </p>

          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(67,217,162,0.1)", border:"1px solid rgba(67,217,162,0.2)", padding:"8px 16px", borderRadius:"100px", marginBottom:"36px", fontSize:"13px", color:"#43D9A2", fontWeight:"600" }}>
            <span>⚡</span> 10,000+ resumes | 92% avg ATS score | 85% get interviews
          </div>

          <div className="hero-btns" style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap", marginBottom:"52px" }}>
            <button className="btn-primary" id="hero-cta" onClick={() => router.push("/signup")}
              style={{ padding:"16px 44px", background:"linear-gradient(135deg,#6C63FF,#FF6584)", color:"white", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 24px rgba(108,99,255,0.4)", transition:"all 0.3s" }}>
              � Get Hired 3x Faster — Free Resume
            </button>
            <button className="btn-ghost" onClick={() => scrollTo("templates")}
              style={{ padding:"16px 44px", background:"rgba(255,255,255,0.07)", color:"white", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", fontSize:"16px", cursor:"pointer", transition:"all 0.2s" }}>
              See Templates ↓
            </button>
          </div>

          <div className="stats-row" style={{ display:"flex", justifyContent:"center", gap:"48px" }}>
            {[["25+","Templates"],["10,000+","Users"],["92%","Avg ATS Score"],["2 weeks","To 1st Interview"]].map(([n, l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"26px", fontWeight:"700", color:"#6C63FF" }}>{n}</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"12px", marginTop:"2px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div onClick={() => scrollTo("features")} style={{ position:"absolute", bottom:"28px", left:"50%", transform:"translateX(-50%)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", zIndex:10 }}>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase" }}>Scroll</span>
          <div style={{ width:"24px", height:"40px", border:"2px solid rgba(255,255,255,0.2)", borderRadius:"100px", display:"flex", justifyContent:"center", paddingTop:"6px" }}>
            <div style={{ width:"4px", height:"8px", background:"#6C63FF", borderRadius:"4px", animation:"scrollDown 1.5s infinite" }} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:"100px 60px", background:"#0d0d20" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"64px" }}>
            <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>FEATURES</p>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:"700", marginBottom:"16px" }}>
              Everything you need to build<br /><span style={{ color:"#6C63FF", fontStyle:"italic" }}>the perfect resume</span>
            </h2>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"16px" }}>6 powerful AI features — all in one resume builder</p>
          </div>
          <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card"
                style={{ padding:"28px", borderRadius:"16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderLeft:"4px solid #6C63FF", transition:"all 0.3s", cursor:"default" }}>
                <div style={{ fontSize:"36px", marginBottom:"16px" }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:"18px", fontWeight:"600", marginBottom:"10px" }}>{f.title}</h3>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"14px", lineHeight:"1.7" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES SHOWCASE ── */}
      <section id="templates" style={{ padding:"100px 60px", background:"#0a0a1a" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"64px" }}>
            <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>TEMPLATES</p>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:"700", marginBottom:"16px" }}>
              32 professional templates<br /><span style={{ color:"#6C63FF", fontStyle:"italic" }}>made for Indian job seekers</span>
            </h2>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"16px" }}>From ATS-optimised to creative — every template is recruiter-tested and PDF-perfect.</p>
          </div>

          <div className="templates-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"24px", marginBottom:"48px" }}>
            {TEMPLATE_PREVIEWS.map((t, i) => (
              <div key={i} className="template-card"
                onClick={() => router.push("/signup")}
                style={{ borderRadius:"16px", overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", cursor:"pointer", transition:"all 0.35s", background:"rgba(255,255,255,0.03)" }}>
                {/* Mock resume preview */}
                <div style={{ height:"260px", background:`linear-gradient(160deg, ${t.color}dd 0%, #0d0d20 100%)`, position:"relative", padding:"20px", display:"flex", flexDirection:"column", gap:"8px" }}>
                  <div style={{ height:"8px", background:t.accent, borderRadius:"4px", width:"55%", opacity:0.9 }} />
                  <div style={{ height:"4px", background:"rgba(255,255,255,0.2)", borderRadius:"4px", width:"35%" }} />
                  <div style={{ marginTop:"12px", display:"flex", flexDirection:"column", gap:"5px" }}>
                    {[85,60,75,50,65,45,70].map((w,j) => (
                      <div key={j} style={{ height:"3px", background:"rgba(255,255,255,0.12)", borderRadius:"3px", width:w+"%", borderLeft:`2px solid ${t.accent}` }} />
                    ))}
                  </div>
                  <div style={{ marginTop:"10px", display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    {[40,55,38,48].map((w,j)=>(
                      <div key={j} style={{ height:"16px", background:`${t.accent}22`, border:`1px solid ${t.accent}44`, borderRadius:"4px", width:w+"px" }} />
                    ))}
                  </div>
                  {/* Tag */}
                  <div style={{ position:"absolute", top:"14px", right:"14px", background:t.accent, color:"white", fontSize:"10px", fontWeight:"700", padding:"3px 10px", borderRadius:"100px", letterSpacing:"0.5px" }}>{t.tag}</div>
                </div>
                <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:"600", fontSize:"14px", color:"white" }}>{t.name}</span>
                  <span style={{ color:"#6C63FF", fontSize:"12px", fontWeight:"500" }}>Use this →</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:"center" }}>
            <button className="btn-primary" onClick={() => router.push("/signup")}
              style={{ padding:"14px 40px", background:"linear-gradient(135deg,#6C63FF,#FF6584)", color:"white", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"600", cursor:"pointer", boxShadow:"0 4px 20px rgba(108,99,255,0.35)", transition:"all 0.3s" }}>
              View All 32 Templates
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="howitworks" style={{ padding:"100px 60px", background:"rgba(108,99,255,0.04)", borderTop:"1px solid rgba(108,99,255,0.1)", borderBottom:"1px solid rgba(108,99,255,0.1)" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto", textAlign:"center" }}>
          <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>HOW IT WORKS</p>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(26px,4vw,44px)", fontWeight:"700", marginBottom:"64px" }}>
            Your perfect resume in <span style={{ color:"#6C63FF", fontStyle:"italic" }}>3 simple steps</span>
          </h2>
          <div className="steps-grid" style={{ position:"relative", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"48px" }}>
            <div style={{ position:"absolute", top:"30px", left:"15%", right:"15%", height:"2px", background:"linear-gradient(90deg,transparent,rgba(108,99,255,0.4),transparent)", zIndex:0 }} className="steps-line" />
            {STEPS.map((s, i) => (
              <div key={i} style={{ position:"relative", zIndex:1 }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"56px", fontWeight:"900", color:"rgba(108,99,255,0.18)", marginBottom:"16px", lineHeight:"1" }}>{s.step}</div>
                <div style={{ fontSize:"40px", marginBottom:"16px" }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:"20px", fontWeight:"600", marginBottom:"12px" }}>{s.title}</h3>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"15px", lineHeight:"1.7" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ATS SCORE HIGHLIGHT ── */}
      <section style={{ padding:"80px 60px", background:"#0a0a1a" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px", alignItems:"center" }} className="about-grid">
          {/* Score visual */}
          <div style={{ textAlign:"center" }}>
            <div style={{ width:"200px", height:"200px", borderRadius:"50%", background:"rgba(108,99,255,0.1)", border:"6px solid #6C63FF", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 32px", boxShadow:"0 0 60px rgba(108,99,255,0.2)", animation:"float 4s ease-in-out infinite" }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"54px", fontWeight:"900", color:"white", lineHeight:1 }}>92<span style={{ fontSize:"20px", color:"#6C63FF" }}>%</span></div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginTop:"6px" }}>Avg ATS Score</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              {[["Before JobwinResume","38%","#FF6584"],["After JobwinResume","92%","#43D9A2"],["Templates","25+","#6C63FF"],["Success Rate","85%","#FFB347"]].map(([label,val,col],i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"12px", padding:"16px", textAlign:"center", border:`1px solid ${col}22` }}>
                  <div style={{ fontFamily:"'Playfair Display', serif", color:col, fontSize:"22px", fontWeight:"700" }}>{val}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"11px", marginTop:"4px" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Copy */}
          <div>
            <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>ATS OPTIMISATION</p>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(24px,3.5vw,40px)", fontWeight:"700", marginBottom:"20px" }}>
              Stop getting rejected<br />by <span style={{ color:"#FF6584", fontStyle:"italic" }}>robots</span>
            </h2>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", lineHeight:"1.8", marginBottom:"16px" }}>
              75% of resumes are rejected by ATS software before a human ever sees them. JobwinResume's ATS checker tells you exactly what's wrong and fixes it automatically.
            </p>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", lineHeight:"1.8", marginBottom:"28px" }}>
              Our ATS-clean templates are tested against real applicant tracking systems used by TCS, Infosys, Amazon, Flipkart, and 500+ other top companies.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {["Real-time ATS compatibility score","Keyword gap analysis for any job description","Automated formatting fixes","Tested on 50+ ATS platforms"].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", color:"rgba(255,255,255,0.7)", fontSize:"14px" }}>
                  <span style={{ color:"#43D9A2", fontSize:"16px" }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CLAUDE AI ── */}
      <section style={{ padding:"80px 60px", background:"rgba(108,99,255,0.08)", borderTop:"1px solid rgba(108,99,255,0.15)", borderBottom:"1px solid rgba(108,99,255,0.15)" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"48px" }}>
            <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>POWERED BY AI</p>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(24px,3.5vw,40px)", fontWeight:"700", marginBottom:"16px" }}>Why <span style={{ color:"#6C63FF" }}>Claude AI</span> makes you stand out</h2>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"15px" }}>Our AI understands what recruiters want to see — and writes it better than any template</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"24px" }}>
            {[
              { icon:"🧠", title:"Learns from 10,000+ Success Stories", desc:"Claude AI knows what works. Trained on successful resumes that got callbacks." },
              { icon:"📊", title:"Understands Job Market Trends", desc:"AI adapts to what TCS, Amazon, Infosys are actually looking for right now." },
              { icon:"✨", title:"Writes Like Recruiters Think", desc:"Not just templates. Real, strategic bullet points tailored to your role." },
              { icon:"🔄", title:"Updates Monthly", desc:"New strategies added every month as hiring patterns change across India." },
              { icon:"🎯", title:"Catches ATS Red Flags", desc:"AI spots formatting issues, keyword gaps, and weak phrases before you apply." },
              { icon:"⚡", title:"Saves You 2+ Hours", desc:"Stop staring at a blank page. Get 10 rewrites in seconds. Pick the best." },
            ].map((item, i) => (
              <div key={i} style={{ padding:"24px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:"12px" }}>
                <div style={{ fontSize:"32px", marginBottom:"12px" }}>{item.icon}</div>
                <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:"16px", fontWeight:"600", marginBottom:"8px", color:"white" }}>{item.title}</h3>
                <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:"1.6" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" style={{ padding:"100px 60px", background:"#0d0d20" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"64px" }}>
            <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>TESTIMONIALS</p>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(26px,4vw,44px)", fontWeight:"700", marginBottom:"12px" }}>
              <span style={{ color:"#43D9A2" }}>Real results</span> from real users
            </h2>
            <div style={{ color:"#FFB347", fontSize:"22px", letterSpacing:"6px", marginBottom:"6px" }}>★★★★★</div>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"14px" }}>4.9/5 from 1,200+ verified reviews</p>
          </div>
          <div className="reviews-marquee-container">
            <div className="reviews-marquee">
              {[...REVIEWS, ...REVIEWS].map((r, i) => (
                <div key={i} className="review-card"
                  style={{ width:"320px", flexShrink:0, padding:"24px", borderRadius:"16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", transition:"all 0.3s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
                    <div style={{ color:"#FFB347", fontSize:"12px" }}>★★★★★</div>
                    <div style={{ background:"rgba(108,99,255,0.12)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:"100px", padding:"2px 10px", fontSize:"11px", color:"#A29BFE" }}>{r.company}</div>
                  </div>
                  <p style={{ color:"rgba(255,255,255,0.75)", fontSize:"13px", lineHeight:"1.75", fontStyle:"italic", marginBottom:"12px" }}>"{r.text}"</p>
                  {r.avatar === "P" && <div style={{ fontSize:"11px", color:"#43D9A2", fontWeight:"600", marginBottom:"12px" }}>📊 38% → 94% ATS | ⏱️ 12 min to build</div>}
                  {r.avatar === "R" && <div style={{ fontSize:"11px", color:"#FFB347", fontWeight:"600", marginBottom:"12px" }}>✨ 3 interview calls in week 1</div>}
                  {r.avatar === "S" && <div style={{ fontSize:"11px", color:"#6C63FF", fontWeight:"600", marginBottom:"12px" }}>⚡ From 0 callbacks to 5 in 2 weeks</div>}
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:"14px" }}>
                    <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:r.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700", fontSize:"14px", flexShrink:0, color:"white" }}>{r.avatar}</div>
                    <div>
                      <div style={{ fontWeight:"600", fontSize:"13px", color:"white" }}>{r.name}</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"11px" }}>{r.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:"100px 60px", background:"#0a0a1a" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", textAlign:"center" }}>
          <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>PRICING</p>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(26px,4vw,48px)", fontWeight:"900", marginBottom:"16px" }}>
            Choose your plan.<br />Get hired on <span style={{ color:"#6C63FF", fontStyle:"italic" }}>day 1.</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"16px", marginBottom:"36px" }}>Plans from ₹99/month | Money-back guarantee | Cancel anytime</p>

          {/* Toggle */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"14px", marginBottom:"48px" }}>
            <span style={{ color:!isAnnual?"white":"rgba(255,255,255,0.45)", fontWeight:"600", fontSize:"15px", transition:"color 0.3s" }}>Monthly</span>
            <div onClick={() => setIsAnnual(!isAnnual)} style={{ width:"54px", height:"30px", background:"rgba(108,99,255,0.2)", borderRadius:"20px", position:"relative", cursor:"pointer", border:"1px solid rgba(108,99,255,0.4)" }}>
              <div style={{ position:"absolute", top:"3px", left:isAnnual?"27px":"3px", width:"22px", height:"22px", background:"linear-gradient(135deg,#6C63FF,#FF6584)", borderRadius:"50%", transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow:"0 2px 8px rgba(108,99,255,0.5)" }} />
            </div>
            <span style={{ color:isAnnual?"white":"rgba(255,255,255,0.45)", fontWeight:"600", fontSize:"15px", display:"flex", alignItems:"center", gap:"8px", transition:"color 0.3s" }}>
              Annually <span style={{ background:"rgba(67,217,162,0.15)", color:"#43D9A2", fontSize:"11px", padding:"3px 8px", borderRadius:"100px", fontWeight:"700" }}>SAVE 20%</span>
            </span>
          </div>

          <div className="pricing-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px" }}>
            {[
              { name:"Free",     monthly:"₹0",   annual:"₹0",   period:"forever", desc:"Perfect to get started",     features:["5 templates","1 resume","Basic AI suggestions","PDF export","ATS score preview"], highlight:false },
              { name:"Basic",    monthly:"₹99",  annual:"₹79",  period:"mo",      desc:"For casual job seekers",     features:["10 templates","3 resumes","AI bullet points","Full ATS checker","Job tailoring"], highlight:false },
              { name:"Standard", monthly:"₹199", annual:"₹159", period:"mo",      desc:"Most popular choice",        features:["20 templates","5 resumes","Full AI writer","Unlimited tailoring","Interview prep","Priority support"], highlight:true },
              { name:"Pro",      monthly:"₹299", annual:"₹239", period:"mo",      desc:"For serious job seekers",    features:["All 25+ templates","Unlimited resumes","Unlimited AI","Custom branding","Portfolio page","Dedicated support"], highlight:false },
            ].map((p, i) => (
              <div key={i} style={{ padding:"28px", borderRadius:"16px", background:p.highlight?"linear-gradient(180deg,rgba(108,99,255,0.15) 0%,rgba(108,99,255,0.05) 100%)":"rgba(255,255,255,0.03)", border:`1px solid ${p.highlight?"rgba(108,99,255,0.5)":"rgba(255,255,255,0.07)"}`, position:"relative", transition:"all 0.3s" }}>
                {p.highlight && (
                  <div style={{ position:"absolute", top:"-13px", left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#6C63FF,#FF6584)", color:"white", padding:"4px 16px", borderRadius:"100px", fontSize:"11px", fontWeight:"600", whiteSpace:"nowrap" }}>MOST POPULAR</div>
                )}
                <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:"20px", fontWeight:"700", marginBottom:"6px", color:p.highlight?"#A29BFE":"white" }}>{p.name}</h3>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"12px", marginBottom:"20px" }}>{p.desc}</p>
                <div style={{ marginBottom:"24px" }}>
                  <span style={{ fontFamily:"'Playfair Display', serif", fontSize:"36px", fontWeight:"700", color:"white" }}>{isAnnual?p.annual:p.monthly}</span>
                  <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px" }}>/{p.period}</span>
                  {isAnnual && p.name!=="Free" && <div style={{ color:"#43D9A2", fontSize:"11px", marginTop:"4px", fontWeight:"500" }}>Billed annually</div>}
                </div>
                <div style={{ marginBottom:"24px", textAlign:"left" }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px", color:"rgba(255,255,255,0.65)", fontSize:"13px" }}>
                      <span style={{ color:"#43D9A2" }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => router.push("/signup")}
                  style={{ width:"100%", padding:"12px", background:p.highlight?"linear-gradient(135deg,#6C63FF,#FF6584)":"rgba(255,255,255,0.08)", color:"white", border:p.highlight?"none":"1px solid rgba(255,255,255,0.15)", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer", transition:"all 0.3s" }}>
                  {p.name==="Free"?"Get Started Free":`Get ${p.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding:"100px 60px", background:"#0d0d20" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px", alignItems:"center" }} className="about-grid">
          <div>
            <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>ABOUT US</p>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(26px,4vw,42px)", fontWeight:"700", marginBottom:"20px" }}>
              We built JobwinResume<br />for <span style={{ color:"#6C63FF", fontStyle:"italic" }}>Indian professionals</span>
            </h2>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", lineHeight:"1.8", marginBottom:"16px" }}>
              We saw the problem: Talented Indians weren't getting interviews because their resumes got lost to ATS bots or looked generic.
            </p>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", lineHeight:"1.8", marginBottom:"28px" }}>
              So we built JobwinResume. Claude AI writes compelling resumes. Our templates pass 50+ ATS systems. And it works for IT, finance, design, sales, HR — every role. 10,000+ Indians have already gotten hired using JobwinResume.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              {[["🚀","Founded 2026"],["🇮🇳","Made in India"],["🤖","Powered by Claude AI"],["📄","10,000+ Resumes Built"]].map(([icon, text]) => (
                <div key={text} style={{ background:"rgba(108,99,255,0.08)", border:"1px solid rgba(108,99,255,0.15)", borderRadius:"10px", padding:"12px 16px", display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ fontSize:"18px" }}>{icon}</span>
                  <span style={{ color:"rgba(255,255,255,0.7)", fontSize:"13px" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"100px", animation:"float 4s ease-in-out infinite", marginBottom:"24px" }}>📄</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              {[["25+","Templates"],["10K+","Users"],["92%","ATS Score"],["85%","Success Rate"]].map((s, i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"12px", padding:"18px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Playfair Display', serif", color:"#6C63FF", fontSize:"26px", fontWeight:"700" }}>{s[0]}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"12px", marginTop:"4px" }}>{s[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUPPORT ── */}
      <section style={{ padding:"80px 60px", background:"rgba(108,99,255,0.04)", borderTop:"1px solid rgba(108,99,255,0.1)" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", textAlign:"center" }}>
          <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>SUPPORT</p>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(24px,3vw,38px)", fontWeight:"700", marginBottom:"16px" }}>
            Need help? We're <span style={{ color:"#6C63FF", fontStyle:"italic" }}>here for you</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"15px", marginBottom:"24px", lineHeight:"1.7" }}>Our support team is here to help you build the best possible resume and land your dream job. Please contact our official support channels first — the legal owner should only be contacted when it is absolutely necessary.</p>
          <div className="support-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"18px" }}>
            <a href="mailto:support@jobwinresume.pro" style={{ textDecoration:"none" }}>
              <div className="support-card" style={{ padding:"24px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", transition:"all 0.3s", cursor:"pointer" }}>
                <div style={{ fontSize:"32px", marginBottom:"12px" }}>📧</div>
                <div style={{ fontWeight:"600", color:"white", marginBottom:"6px" }}>Official Support Email</div>
                <div style={{ color:"#6C63FF", fontSize:"14px" }}>support@jobwinresume.pro</div>
              </div>
            </a>
            <a href="tel:+917700969639" style={{ textDecoration:"none" }}>
              <div className="support-card" style={{ padding:"24px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", transition:"all 0.3s", cursor:"pointer" }}>
                <div style={{ fontSize:"32px", marginBottom:"12px" }}>📞</div>
                <div style={{ fontWeight:"600", color:"white", marginBottom:"6px" }}>Official Support Phone</div>
                <div style={{ color:"#6C63FF", fontSize:"14px" }}>+91 7700969639</div>
              </div>
            </a>
          </div>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"12px", lineHeight:"1.7", marginTop:"20px" }}>🔒 Your data is secure and private. GDPR compliant. | Legal owner: Amar Khot, Navi Mumbai | For support, use official channels above.</p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:"100px 60px", textAlign:"center", background:"#0a0a1a", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"600px", height:"600px", background:"radial-gradient(circle,rgba(108,99,255,0.1) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1, maxWidth:"620px", margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(30px,5vw,56px)", fontWeight:"900", marginBottom:"20px", lineHeight:"1.1" }}>
            Your next interview<br />could be <span style={{ color:"#43D9A2", fontStyle:"italic" }}>5 minutes away.</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"17px", marginBottom:"36px", lineHeight:"1.7" }}>
            10,000+ Indians have already gotten hired using JobwinResume.<br />Join them. Build your free resume today — no credit card needed.
          </p>
          <button className="btn-primary" onClick={() => router.push("/signup")}
            style={{ padding:"18px 52px", background:"linear-gradient(135deg,#6C63FF,#FF6584)", color:"white", border:"none", borderRadius:"10px", fontSize:"17px", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 24px rgba(108,99,255,0.4)", transition:"all 0.3s", animation:"float 3s ease-in-out infinite" }}>
            🚀 Get Your Free Resume (5 min)
          </button>
          <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"13px", marginTop:"16px" }}>⭐ 4.9/5 rating | 💯 Money-back guarantee | ⚡ Cancel anytime</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding:"80px 60px", background:"#0a0a1a", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:"780px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"48px" }}>
            <p style={{ color:"#6C63FF", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>FAQ</p>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(24px,3.5vw,40px)", fontWeight:"700" }}>Frequently asked <span style={{ color:"#6C63FF", fontStyle:"italic" }}>questions</span></h2>
          </div>
          {FAQS.map((f, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"18px 0", cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:"15px", fontWeight:"500", color:"white", paddingRight:"20px" }}>{f.q}</p>
                <span style={{ color:"#6C63FF", fontSize:"20px", flexShrink:0, transition:"transform 0.2s", transform:openFaq===i?"rotate(45deg)":"none" }}>+</span>
              </div>
              {openFaq===i && <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"14px", lineHeight:"1.75", marginTop:"12px", paddingRight:"32px" }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:"40px 60px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"#080810" }}>
        <div className="footer-inner" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span>📄</span>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:"18px", fontWeight:"700", color:"white" }}>JobwinResume</span>
            <span style={{ color:"rgba(255,255,255,0.25)", fontSize:"13px", marginLeft:"8px" }}>India's #1 AI Resume Builder</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px", alignItems:"flex-end" }}>
            <div className="footer-links" style={{ display:"flex", gap:"24px", flexWrap:"wrap", justifyContent:"flex-end" }}>
              {[["About","about"],["Features","features"],["Templates","templates"],["Pricing","pricing"]].map(([label,id])=>(
                <span key={id} onClick={()=>scrollTo(id)} style={{ color:"rgba(255,255,255,0.35)", fontSize:"13px", cursor:"pointer", transition:"color 0.2s" }}
                  onMouseOver={e=>e.target.style.color="#6C63FF"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,0.35)"}>{label}</span>
              ))}
              <a href="mailto:support@jobwinresume.pro" style={{ color:"rgba(255,255,255,0.35)", fontSize:"13px", textDecoration:"none", transition:"color 0.2s" }} onMouseOver={e=>e.target.style.color="#6C63FF"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,0.35)"}>Support</a>
              <span onClick={()=>router.push("/privacy")} style={{ color:"rgba(255,255,255,0.35)", fontSize:"13px", cursor:"pointer" }} onMouseOver={e=>e.target.style.color="#6C63FF"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,0.35)"}>Privacy</span>
              <span onClick={()=>router.push("/terms")} style={{ color:"rgba(255,255,255,0.35)", fontSize:"13px", cursor:"pointer" }} onMouseOver={e=>e.target.style.color="#6C63FF"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,0.35)"}>Terms</span>
              <span onClick={()=>router.push("/refund")} style={{ color:"rgba(255,255,255,0.35)", fontSize:"13px", cursor:"pointer" }} onMouseOver={e=>e.target.style.color="#6C63FF"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,0.35)"}>Refund Policy</span>
            </div>
            <div style={{ color:"rgba(255,255,255,0.2)", fontSize:"12px" }}>© 2026 JobwinResume. All rights reserved. Made with ❤️ in India.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
