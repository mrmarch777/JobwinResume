import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme, THEMES, usePlan, PLAN_LIMITS } from "../lib/contexts";
import Sidebar from "../components/Sidebar";

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeNav, setActiveNav] = useState("pricing");
  const [collapsed, setCollapsed] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const { theme: t, themeName, setTheme } = useTheme();
  const { refreshPlan, plan: currentPlan } = usePlan();
  const currentPlanLabel = PLAN_LIMITS[currentPlan]?.label || "Free";
  const themes = THEMES;

  // ── PROMO CODE SYSTEM ──────────────────────────────────────────────────────
  // FIRSTTIME is annual-only and gives 45% off (introductory offer)
  // All other codes work on monthly plans only
  const PROMO_CODES = {
    "FIRSTTIME":   { discount: 45, label: "45% off Annual Plans (Introductory Offer)", annualOnly: true },
    "BASIC10":     { discount: 10, label: "10% off on Basic", plan: "basic" },
    "STANDARD15":  { discount: 15, label: "15% off on Standard", plan: "standard" },
    "PRO20":       { discount: 20, label: "20% off on Pro", plan: "pro" },
    "JOBWIN10":     { discount: 10, label: "10% off" },
    "LAUNCH20":    { discount: 20, label: "20% off" },
    "WELCOME15":   { discount: 15, label: "15% off" },
    "TESTMASTER95":{ discount: 95, label: "95% off (Test)" },
    "TEST1RUPEE":  { fixed_price: 1, label: "₹1 Test Plan" },
  };

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) { setPromoError("Enter a promo code."); return; }

    if (PROMO_CODES[code]) {
      const promo = PROMO_CODES[code];

      // FIRSTTIME is only valid in annual mode
      if (promo.annualOnly && !isAnnual) {
        setPromoError(`🗓️ Code "${code}" is only valid for Annual plans. Please switch to Annual billing first.`);
        setPromoSuccess("");
        setAppliedPromo(null);
        return;
      }

      // Monthly-specific codes shouldn't be applied to annual
      if (!promo.annualOnly && isAnnual && !promo.plan) {
        setPromoError(`ℹ️ Monthly promo codes don't apply to annual plans. Use FIRSTTIME for 45% off annual.`);
        setPromoSuccess("");
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo({ code, ...promo });
      if (promo.annualOnly) {
        setPromoSuccess(`🎉 Code "${code}" applied — ${promo.label}!`);
      } else if (promo.plan) {
        setPromoSuccess(`✅ Code "${code}" applied — ${promo.label}! (Valid only for ${promo.plan.charAt(0).toUpperCase() + promo.plan.slice(1)} plan)`);
      } else {
        setPromoSuccess(`✅ Code "${code}" applied — ${promo.label}!`);
      }
      setPromoError("");
    } else {
      setPromoError("❌ Invalid promo code. Try BASIC10, STANDARD15, PRO20, or FIRSTTIME (annual)");
      setPromoSuccess("");
      setAppliedPromo(null);
    }
  };

  // Clear FIRSTTIME if user switches back to monthly, and vice versa
  const handleBillingToggle = (annual) => {
    setIsAnnual(annual);
    // If switching to monthly and FIRSTTIME is applied, remove it
    if (!annual && appliedPromo?.annualOnly) {
      setAppliedPromo(null);
      setPromoSuccess("");
      setPromoInput("");
      setPromoError("ℹ️ FIRSTTIME code removed — it only applies to annual plans.");
    }
    // If switching to annual and a monthly-only code is applied, remove it
    if (annual && appliedPromo && !appliedPromo.annualOnly) {
      setAppliedPromo(null);
      setPromoSuccess("");
      setPromoError("ℹ️ Monthly promo removed. Use FIRSTTIME for 45% off on annual plans.");
    }
  };

  // ── PRICE CALCULATION ─────────────────────────────────────────────────────

  // Monthly price with promo (existing logic, unchanged)
  const monthlyDiscountedPrice = (originalPrice, planId) => {
    if (!appliedPromo || originalPrice === 0) return originalPrice;
    if (appliedPromo.annualOnly) return originalPrice; // FIRSTTIME doesn't affect monthly display
    if (appliedPromo.plan && appliedPromo.plan !== planId) return originalPrice;
    if (appliedPromo.fixed_price !== undefined) return appliedPromo.fixed_price;
    return Math.round(originalPrice * (1 - appliedPromo.discount / 100));
  };

  // Annual pricing logic
  // Default annual = 20% off monthly; FIRSTTIME = 45% off monthly
  const getAnnualInfo = (originalPrice) => {
    if (originalPrice === 0) return null;
    const annualDiscount = appliedPromo?.annualOnly ? appliedPromo.discount : 20;
    const perMonth = Math.round(originalPrice * (1 - annualDiscount / 100));
    const annualTotal = perMonth * 12;
    return { perMonth, annualTotal, annualDiscount };
  };

  // Check if monthly promo applies to this plan (for monthly view)
  const monthlyPromoAppliesTo = (planId) => {
    if (!appliedPromo || appliedPromo.annualOnly) return false;
    if (appliedPromo.plan) return appliedPromo.plan === planId;
    return true;
  };

  // ── NAV / PLANS / FAQS ───────────────────────────────────────────────────

  const plans = [
    { id: "free",     name: "Free",     price: 0,   period: "forever", desc: "Perfect for getting started",  features: ["5 resume templates", "1 resume", "Basic AI suggestions", "ATS score preview", "PDF export"],                                                   cta: "Current Plan", highlight: false },
    { id: "basic",    name: "Basic",    price: 99,  period: "month",   desc: "For casual job seekers",        features: ["10 resume templates", "3 resumes", "AI bullet points", "Full ATS checker", "Job description tailoring"],                                      cta: "Get Basic",    highlight: false },
    { id: "standard", name: "Standard", price: 199, period: "month",   desc: "Most popular choice",           features: ["20 resume templates", "5 resumes", "Full AI content writer", "Unlimited job tailoring", "Interview prep", "Priority support"],            cta: "Get Standard", highlight: true  },
    { id: "pro",      name: "Pro",      price: 299, period: "month",   desc: "For serious job seekers",       features: ["All 25+ templates", "Unlimited resumes", "Unlimited AI writing", "Custom branding", "Portfolio page", "Dedicated support"],               cta: "Go Pro Now",   highlight: false },
  ];

  const faqs = [
    { q: "Can I cancel my subscription at any time?",     a: "Yes, you can cancel your monthly subscription at any time from your account settings. You'll keep access until the end of your billing cycle." },
    { q: "How does the annual plan work?",                a: "Annual plans are billed as a single upfront payment for the full year. By default you save 20% compared to monthly billing. With the FIRSTTIME coupon code, you save 45% as an introductory offer." },
    { q: "Can I get a refund on the annual plan?",        a: "If you cancel within 7 days of purchase and haven't significantly used the service, you may be eligible for a refund. Please contact support@jobwinresume.pro." },
    { q: "What payment methods do you accept?",           a: "We accept all major credit cards, debit cards, UPI, and net banking through our secure Razorpay payment processor." },
    { q: "Will I get a confirmation after payment?",      a: "Yes! Once your payment is successful, you'll immediately receive a confirmation email with your invoice and plan details." },
    { q: "What happens if my payment fails?",             a: "If a payment fails, your account won't be charged and you'll remain on the free plan. You can retry from the billing section." },
    { q: "How do I contact support?",                    a: "You can reach us at support@jobwinresume.pro or call +91 7700969639. We typically respond within a few hours." },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("jobwin_theme");
    if (saved && themes[saved]) setTheme(saved);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleTheme = (name) => setTheme(name);
  const handleNav = (item) => { setActiveNav(item.id); router.push(item.href); };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const handleUpgrade = async (plan) => {
    if (!user) { router.push("/login"); return; }
    if (plan.id === "free" || plan.id === currentPlan) return;

    // Validate plan-specific promo before proceeding (monthly)
    if (!isAnnual && appliedPromo && appliedPromo.plan && appliedPromo.plan !== plan.id) {
      alert(`⚠️ The promo code "${appliedPromo.code}" is only valid for the ${appliedPromo.plan.charAt(0).toUpperCase() + appliedPromo.plan.slice(1)} plan.`);
      return;
    }

    setLoading(plan.id);

    let finalPrice;
    let billingDesc;
    if (isAnnual && plan.price > 0) {
      const info = getAnnualInfo(plan.price);
      finalPrice = info.annualTotal;
      billingDesc = `JobwinResume ${plan.name} Annual Plan (${info.annualDiscount}% off${appliedPromo?.annualOnly ? " — FIRSTTIME offer" : " — standard annual"})`;
    } else {
      finalPrice = monthlyDiscountedPrice(plan.price, plan.id);
      billingDesc = `JobwinResume ${plan.name} Plan${appliedPromo && !appliedPromo.annualOnly ? ` (${appliedPromo.label})` : ""}`;
    }

    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: finalPrice * 100,
          currency: "INR",
          name: "JobwinResume",
          description: billingDesc,
          prefill: { email: user.email },
          notes: {
            email: user.email,
            plan: plan.id,
            billing: isAnnual ? "annual" : "monthly",
            promo: appliedPromo?.code || "none",
          },
          theme: { color: "#6C63FF" },
          handler: async (response) => {
            localStorage.setItem("jobwin_plan", plan.id);
            try {
              const updateData = {
                plan: plan.id,
                payment_id: response.razorpay_payment_id,
                amount: finalPrice,
                billing: isAnnual ? "annual" : "monthly",
                activated_at: new Date().toISOString(),
              };
              const checkExisting = await supabase.from("user_plans").select("email").eq("email", user.email).maybeSingle();
              if (checkExisting?.data) {
                await supabase.from("user_plans").update(updateData).eq("email", user.email);
              } else {
                await supabase.from("user_plans").insert({ email: user.email, ...updateData });
              }
            } catch (dbErr) {
              console.warn("Frontend Supabase update failed (webhook will handle it):", dbErr);
            }
            try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL;
              if (apiUrl && !apiUrl.includes("localhost")) {
                fetch(`${apiUrl}/payment-success`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    payment_id: response.razorpay_payment_id,
                    plan: plan.id,
                    email: user.email,
                    amount: finalPrice,
                    billing: isAnnual ? "annual" : "monthly",
                    promo_code: appliedPromo?.code || null,
                  }),
                }).catch(() => {});
              }
            } catch (e) { /* ignore */ }
            await refreshPlan();
            alert(`🎉 Payment successful! Welcome to JobwinResume ${plan.name}${isAnnual ? " (Annual)" : ""}! Your plan is now active.`);
            router.push("/dashboard");
          },
          modal: { ondismiss: () => setLoading(null) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(null);
      };
    } catch (err) {
      alert("Payment failed. Please try again.");
      setLoading(null);
    }
  };

  const firstName = user?.email?.split("@")[0] || "";
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif", transition: "all 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.3); border-radius:4px; }
        .plan-card { transition:all 0.3s; }
        .plan-card:hover { transform:translateY(-6px) !important; box-shadow:0 16px 48px rgba(108,99,255,0.15) !important; }
        .upgrade-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(108,99,255,0.4) !important; }
        .faq-item { cursor:pointer; transition:all 0.2s; }
        .faq-item:hover { border-color:rgba(108,99,255,0.4) !important; }
        .billing-toggle-btn { transition: all 0.25s; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 24px; border-radius: 8px; }
        .billing-toggle-btn.active { background: linear-gradient(135deg,#6C63FF,#FF6584); color: white; box-shadow: 0 4px 16px rgba(108,99,255,0.4); }
        .billing-toggle-btn.inactive { background: transparent; color: rgba(255,255,255,0.45); }
        .billing-toggle-btn.inactive:hover { color: white; background: rgba(255,255,255,0.06); }
        @keyframes pulse-badge { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.85;transform:scale(1.04)} }
        .promo-badge { animation: pulse-badge 2.5s ease-in-out infinite; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <Sidebar activeId="pricing" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />

      {/* ── MAIN ── */}
      <main className="mobile-main" style={{ flex: 1, marginLeft: collapsed ? "68px" : "232px", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <header style={{ height: "56px", background: `${t.sidebar}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.muted, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              ← Dashboard
            </button>
            <span style={{ color: t.muted, fontSize: "13px" }}>/</span>
            <span style={{ color: t.text, fontSize: "13px", fontWeight: "500" }}>Upgrade Plan</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ background: currentPlan !== "free" ? "rgba(108,99,255,0.15)" : "rgba(67,217,162,0.1)", border: `1px solid ${currentPlan !== "free" ? "rgba(108,99,255,0.3)" : "rgba(67,217,162,0.2)"}`, borderRadius: "100px", padding: "4px 12px", fontSize: "10px", color: currentPlan !== "free" ? "#A29BFE" : "#43D9A2", fontWeight: "600", letterSpacing: "1px" }}>{currentPlanLabel.toUpperCase()} PLAN</div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: "32px 28px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "960px" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <p style={{ color: t.accent, fontSize: "12px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>PRICING</p>
              <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: "700", marginBottom: "14px", color: t.text }}>
                Invest in your <span style={{ color: "#6C63FF", fontStyle: "italic" }}>Future.</span>
              </h1>
              <p style={{ color: t.muted, fontSize: "15px", maxWidth: "480px", margin: "0 auto" }}>
                Choose the plan that accelerates your career. Cancel anytime.
              </p>
            </div>

            {/* ── BILLING TOGGLE ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "4px", gap: "2px" }}>
                <button
                  className={`billing-toggle-btn ${!isAnnual ? "active" : "inactive"}`}
                  onClick={() => handleBillingToggle(false)}
                >
                  Monthly
                </button>
                <button
                  className={`billing-toggle-btn ${isAnnual ? "active" : "inactive"}`}
                  onClick={() => handleBillingToggle(true)}
                >
                  Annually
                  {!isAnnual && (
                    <span style={{ marginLeft: "8px", background: "rgba(67,217,162,0.18)", color: "#43D9A2", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "100px" }}>
                      SAVE 20%+
                    </span>
                  )}
                </button>
              </div>

              {/* Annual info banner */}
              {isAnnual && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.25)", borderRadius: "10px", padding: "10px 18px", fontSize: "13px" }}>
                  <span style={{ fontSize: "16px" }}>🎁</span>
                  <span style={{ color: t.muted }}>
                    Annual billing — <strong style={{ color: "white" }}>20% off</strong> by default.
                    Apply coupon <strong style={{ color: "#6C63FF", letterSpacing: "0.5px", fontFamily: "monospace" }}>FIRSTTIME</strong> to unlock{" "}
                    <span className="promo-badge" style={{ display: "inline-block", background: "linear-gradient(135deg,#6C63FF,#FF6584)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "700" }}>
                      45% off
                    </span>{" "}
                    (introductory offer).
                  </span>
                </div>
              )}
              {!isAnnual && (
                <p style={{ color: t.muted, fontSize: "12px" }}>
                  💡 Switch to <strong style={{ color: "white" }}>Annual</strong> and use code{" "}
                  <span style={{ fontFamily: "monospace", color: "#A29BFE", fontWeight: "700" }}>FIRSTTIME</span> to save 45%
                </p>
              )}
            </div>

            {/* Promo Code Banner */}
            <div style={{ background: `${t.accent}0d`, border: `1px solid ${t.accent}33`, borderRadius: "14px", padding: "18px 24px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, marginBottom: "4px" }}>🏷️ Have a promo code?</p>
                <p style={{ fontSize: "11px", color: t.muted }}>
                  {isAnnual ? "Use FIRSTTIME for 45% off annual, or standard codes for monthly plans." : "Enter your code to get a discount on any paid plan."}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1, minWidth: "260px" }}>
                <input
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value); setPromoError(""); setPromoSuccess(""); }}
                  onKeyDown={e => e.key === "Enter" && applyPromo()}
                  placeholder={isAnnual ? "e.g. FIRSTTIME" : "e.g. JOBWIN10"}
                  style={{ flex: 1, padding: "9px 14px", background: t.inputBg, border: `1px solid ${appliedPromo ? "#43D9A2" : t.border}`, borderRadius: "8px", fontSize: "13px", color: t.text, outline: "none", letterSpacing: "1px", textTransform: "uppercase" }}
                />
                <button onClick={applyPromo}
                  style={{ padding: "9px 18px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Apply
                </button>
                {appliedPromo && <button onClick={() => { setAppliedPromo(null); setPromoSuccess(""); setPromoInput(""); }}
                  style={{ padding: "9px 12px", background: "transparent", color: t.muted, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "11px", cursor: "pointer" }}>✕</button>}
              </div>
              {promoSuccess && <p style={{ width: "100%", fontSize: "12px", color: "#43D9A2", fontWeight: "500", margin: 0 }}>{promoSuccess}</p>}
              {promoError && <p style={{ width: "100%", fontSize: "12px", color: "#FF6584", margin: 0 }}>{promoError}</p>}

              {/* Available codes hint */}
              <div style={{ width: "100%", marginTop: "10px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: t.muted, fontWeight: "500" }}>
                  {isAnnual ? "Annual code:" : "Monthly codes:"}
                </span>
                {isAnnual ? (
                  <button onClick={() => { setPromoInput("FIRSTTIME"); setPromoError(""); setPromoSuccess(""); }}
                    style={{ background: "transparent", border: "1px dashed rgba(108,99,255,0.7)", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: "700", color: "white", letterSpacing: "0.5px" }}>FIRSTTIME</span>
                    <span style={{ fontSize: "10px", color: "#A29BFE" }}>45% Off Annual 🎉</span>
                  </button>
                ) : (
                  [
                    { code: "BASIC10",    label: "10% Off Basic",    color: "#6C63FF" },
                    { code: "STANDARD15", label: "15% Off Standard", color: "#A29BFE" },
                    { code: "PRO20",      label: "20% Off Pro",      color: "#FF6584" },
                  ].map(({ code, label, color }) => (
                    <button key={code} onClick={() => { setPromoInput(code); setPromoError(""); setPromoSuccess(""); }}
                      style={{ background: "transparent", border: `1px dashed ${color}88`, borderRadius: "6px", padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: "700", color: "white", letterSpacing: "0.5px" }}>{code}</span>
                      <span style={{ fontSize: "10px", color }}>{label}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── PLAN CARDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "60px" }}>
              {plans.map((p, i) => {
                const annualInfo = isAnnual && p.price > 0 ? getAnnualInfo(p.price) : null;
                const showMonthlyPromo = !isAnnual && monthlyPromoAppliesTo(p.id) && p.price > 0;
                const displayMonthlyPrice = monthlyDiscountedPrice(p.price, p.id);

                return (
                  <div key={i} className="plan-card"
                    style={{ padding: "28px", borderRadius: "20px", background: p.highlight ? `linear-gradient(180deg,rgba(108,99,255,0.15) 0%,rgba(108,99,255,0.05) 100%)` : t.card, border: `1px solid ${p.highlight ? "rgba(108,99,255,0.5)" : t.border}`, position: "relative" }}>

                    {/* MOST POPULAR badge */}
                    {p.highlight && (
                      <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", padding: "4px 16px", borderRadius: "100px", fontSize: "10px", fontWeight: "600", whiteSpace: "nowrap" }}>MOST POPULAR</div>
                    )}

                    {/* ANNUAL OFFER badge */}
                    {isAnnual && p.price > 0 && annualInfo && (
                      <div style={{ position: "absolute", top: p.highlight ? "18px" : "12px", right: "12px", background: annualInfo.annualDiscount === 45 ? "linear-gradient(135deg,#6C63FF,#FF6584)" : "rgba(67,217,162,0.15)", border: annualInfo.annualDiscount === 45 ? "none" : "1px solid rgba(67,217,162,0.3)", color: annualInfo.annualDiscount === 45 ? "white" : "#43D9A2", padding: "3px 8px", borderRadius: "100px", fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                        {annualInfo.annualDiscount === 45 ? "🎉 45% OFF" : "20% OFF"}
                      </div>
                    )}

                    <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: p.highlight ? "#A29BFE" : t.text }}>{p.name}</h3>
                    <p style={{ color: t.muted, fontSize: "12px", marginBottom: "20px" }}>{p.desc}</p>

                    {/* Price block */}
                    <div style={{ marginBottom: "24px" }}>
                      {/* Monthly mode */}
                      {!isAnnual && (
                        <>
                          {showMonthlyPromo && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                              <span style={{ textDecoration: "line-through", color: t.muted, fontSize: "16px" }}>₹{p.price}</span>
                              <span style={{ background: "rgba(67,217,162,0.15)", color: "#43D9A2", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "100px" }}>-{appliedPromo.discount}%</span>
                            </div>
                          )}
                          {!isAnnual && appliedPromo && appliedPromo.plan && appliedPromo.plan !== p.id && p.price > 0 && (
                            <div style={{ marginBottom: "4px" }}>
                              <span style={{ background: "rgba(255,101,132,0.1)", color: "#FF6584", fontSize: "9px", fontWeight: "700", padding: "2px 8px", borderRadius: "100px", letterSpacing: "0.5px" }}>CODE FOR {appliedPromo.plan.toUpperCase()} ONLY</span>
                            </div>
                          )}
                          <span style={{ fontFamily: "'Noto Serif',serif", fontSize: "36px", fontWeight: "700", color: showMonthlyPromo ? "#43D9A2" : t.text }}>
                            ₹{displayMonthlyPrice}
                          </span>
                          <span style={{ color: t.muted, fontSize: "13px" }}>/{p.period}</span>
                        </>
                      )}

                      {/* Annual mode */}
                      {isAnnual && p.price > 0 && annualInfo && (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ textDecoration: "line-through", color: t.muted, fontSize: "14px" }}>₹{p.price}/mo</span>
                          </div>
                          <span style={{ fontFamily: "'Noto Serif',serif", fontSize: "36px", fontWeight: "700", color: annualInfo.annualDiscount === 45 ? "#A29BFE" : "#43D9A2" }}>
                            ₹{annualInfo.perMonth}
                          </span>
                          <span style={{ color: t.muted, fontSize: "13px" }}>/mo</span>
                          <div style={{ marginTop: "6px", fontSize: "11px", color: t.muted }}>
                            Billed as <strong style={{ color: t.text }}>₹{annualInfo.annualTotal}</strong> / year
                          </div>
                        </>
                      )}

                      {/* Free plan annual */}
                      {isAnnual && p.price === 0 && (
                        <>
                          <span style={{ fontFamily: "'Noto Serif',serif", fontSize: "36px", fontWeight: "700", color: t.text }}>₹0</span>
                          <span style={{ color: t.muted, fontSize: "13px" }}>/forever</span>
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <div style={{ marginBottom: "24px" }}>
                      {p.features.map((f, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: t.muted, fontSize: "13px" }}>
                          <span style={{ color: "#43D9A2", fontWeight: "700", flexShrink: 0 }}>✓</span>{f}
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button className="upgrade-btn" onClick={() => handleUpgrade(p)}
                      disabled={loading === p.id || p.id === currentPlan}
                      style={{ width: "100%", padding: "12px", background: p.id === currentPlan ? "rgba(67,217,162,0.12)" : p.highlight ? "linear-gradient(135deg,#6C63FF,#FF6584)" : "rgba(255,255,255,0.06)", color: p.id === currentPlan ? "#43D9A2" : p.highlight ? "white" : t.text, border: `1px solid ${p.id === currentPlan ? "rgba(67,217,162,0.3)" : p.highlight ? "transparent" : t.border}`, borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: p.id === currentPlan ? "default" : "pointer", transition: "all 0.3s", fontFamily: "'DM Sans',sans-serif" }}>
                      {loading === p.id ? "Processing..." : p.id === currentPlan ? "Current Plan ✓" : isAnnual && p.price > 0 ? `${p.cta} — Annually` : p.cta}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Feature comparison */}
            <div style={{ marginBottom: "60px" }}>
              <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "24px", fontWeight: "600", textAlign: "center", marginBottom: "28px", color: t.text }}>Compare Features</h2>
              <div style={{ background: t.card, borderRadius: "16px", overflow: "hidden", border: `1px solid ${t.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "14px 22px", background: `${t.accent}12`, borderBottom: `1px solid ${t.border}` }}>
                  {["Feature", "Free", "Basic", "Standard", "Pro"].map((h, i) => (
                    <div key={i} style={{ color: i === 0 ? t.muted : t.accent, fontWeight: "600", fontSize: "12px", textTransform: i === 0 ? "none" : "uppercase", letterSpacing: i === 0 ? "0" : "1px" }}>{h}</div>
                  ))}
                </div>
                {[
                  ["Resume Templates",   "5",        "10",       "20",         "25+"],
                  ["Resumes",            "1",        "3",        "5",          "Unlimited"],
                  ["AI Content Writer",  "Basic",    "✓",        "✓",          "✓"],
                  ["ATS Score Checker",  "Preview",  "Full",     "Full",       "Full"],
                  ["Job Tailoring",      "—",        "✓",        "Unlimited",  "Unlimited"],
                  ["Interview Prep",     "—",        "—",        "✓",          "✓"],
                  ["Priority Support",   "—",        "Email",    "Priority",   "Dedicated"],
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 22px", borderBottom: `1px solid ${t.border}`, background: i % 2 === 0 ? "transparent" : `${t.accent}04` }}>
                    {row.map((cell, j) => (
                      <div key={j} style={{ color: j === 0 ? t.muted : cell === "✓" || cell === "Unlimited" || cell === "Priority" ? "#43D9A2" : cell === "—" ? t.muted : t.text, fontSize: "13px", fontWeight: j > 0 && cell !== "—" ? "500" : "400" }}>{cell}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div style={{ marginBottom: "60px" }}>
              <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "24px", fontWeight: "600", textAlign: "center", marginBottom: "28px", color: t.text }}>Frequently Asked Questions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {faqs.map((faq, i) => (
                  <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ background: t.card, border: `1px solid ${openFaq === i ? "rgba(108,99,255,0.4)" : t.border}`, borderRadius: "12px", padding: "18px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: t.text, fontSize: "14px", fontWeight: "500" }}>{faq.q}</span>
                      <span style={{ color: t.accent, fontSize: "18px", marginLeft: "16px", flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
                    </div>
                    {openFaq === i && <p style={{ color: t.muted, fontSize: "13px", lineHeight: "1.7", marginTop: "12px", borderTop: `1px solid ${t.border}`, paddingTop: "12px" }}>{faq.a}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div style={{ textAlign: "center", padding: "40px 32px", background: `linear-gradient(135deg,rgba(108,99,255,0.1),rgba(255,101,132,0.06))`, borderRadius: "20px", border: `1px solid rgba(108,99,255,0.2)` }}>
              <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: t.text }}>Need help choosing a plan?</h2>
              <p style={{ color: t.muted, fontSize: "14px", marginBottom: "24px" }}>Our team is here to help you find the right plan for your needs.</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href="mailto:support@jobwinresume.pro" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "12px 24px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>📧 Email Support</button>
                </a>
                <a href="tel:7700969639" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "12px 24px", background: t.card, color: t.text, border: `1px solid ${t.border}`, borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>📞 +91 7700969639</button>
                </a>
              </div>
            </div>

            {/* Policies Footer */}
            <div style={{ textAlign: "center", marginTop: "40px", padding: "20px", borderTop: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginBottom: "10px" }}>
                <a href="/terms" target="_blank" style={{ color: t.muted, fontSize: "12px", textDecoration: "none" }}>Terms &amp; Conditions</a>
                <a href="/privacy" target="_blank" style={{ color: t.muted, fontSize: "12px", textDecoration: "none" }}>Privacy Policy</a>
                <a href="/refund" target="_blank" style={{ color: t.muted, fontSize: "12px", textDecoration: "none" }}>Refund &amp; Cancellation Policy</a>
              </div>
              <p style={{ color: t.muted, fontSize: "12px" }}>© 2026 JobwinResume. All rights reserved.</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
