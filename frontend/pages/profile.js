import { useState, useEffect } from "react";
import Head from "next/head";
import PageHead from "../components/PageHead";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/contexts";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const { theme: t } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    target_role: "",
    linkedin: "",
    website: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      setFormData(prev => ({ ...prev, email: session.user.email }));
      fetchProfile(session.user.id);
    });
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (data) {
        setFormData(prev => ({
          ...prev,
          full_name: data.full_name || "",
          phone: data.phone || "",
          location: data.location || "",
          target_role: data.target_role || "",
          linkedin: data.linkedin || "",
          website: data.website || ""
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updates = {
        user_id: user.id,
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        target_role: formData.target_role,
        linkedin: formData.linkedin,
        website: formData.website,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) throw error;
      
      setToast("Profile saved successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090f', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <PageHead title="Profile" description="Manage your profile" />
      
      <Sidebar activeId="profile" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      
      <main style={{ flex: 1, marginLeft: collapsed ? "72px" : "240px", padding: "40px", transition: "margin-left 0.3s ease" }}>
        <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "32px", marginBottom: "8px" }}>Your Profile</h1>
        <p style={{ color: t.muted, marginBottom: "32px" }}>Update your personal details and job preferences.</p>
        
        {toast && (
          <div style={{ padding: "12px 20px", background: "rgba(67,217,162,0.1)", border: "1px solid rgba(67,217,162,0.2)", color: "#43D9A2", borderRadius: "8px", marginBottom: "20px", display: "inline-block" }}>
            {toast}
          </div>
        )}

        <form onSubmit={handleSave} style={{ maxWidth: "600px", background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "24px", border: `1px solid ${t.border}` }}>
          
          <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
             <div style={{ width: "80px", height: "80px", borderRadius: "40px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "white" }}>
               {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
             </div>
             <div>
               <button type="button" style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, borderRadius: "8px", color: t.text, cursor: "pointer", fontSize: "13px" }}>Upload Photo</button>
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Full Name</label>
              <input name="full_name" value={formData.full_name} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} placeholder="John Doe" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Email Address</label>
              <input value={formData.email} disabled style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: `1px solid ${t.border}`, borderRadius: "10px", color: t.muted, fontSize: "14px", outline: "none", cursor: "not-allowed" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Location</label>
              <input name="location" value={formData.location} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} placeholder="New York, NY" />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Target Role / Title</label>
            <input name="target_role" value={formData.target_role} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} placeholder="Frontend Engineer" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>LinkedIn URL</label>
              <input name="linkedin" value={formData.linkedin} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: t.muted }}>Personal Website</label>
              <input name="website" value={formData.website} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, fontSize: "14px", outline: "none" }} placeholder="https://yourdomain.com" />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", width: "100%", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save Profile"}
          </button>

        </form>

      </main>
    </div>
  );
}
