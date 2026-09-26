import { useState, useEffect, useRef } from 'react';
import PageHead from '../components/PageHead';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/contexts';
import Sidebar from '../components/Sidebar';

export default function ProfilePage() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    target_role: '',
    linkedin: '',
    website: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      setUser(session.user);
      setForm(f => ({ ...f, email: session.user.email }));
      await loadProfile(session.user.id);
      setLoading(false);
    });
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // use maybeSingle — returns null if no row (not error)

      if (data) {
        setForm(f => ({
          ...f,
          full_name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          target_role: data.target_role || '',
          linkedin: data.linkedin || '',
          website: data.website || '',
        }));
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      }
    } catch (err) {
      console.error('Load profile error:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updates = {
        user_id: user.id,
        full_name: form.full_name,
        phone: form.phone,
        location: form.location,
        target_role: form.target_role,
        linkedin: form.linkedin,
        website: form.website,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'user_id' });

      if (error) {
        // If table doesn't exist, save to localStorage as fallback
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          localStorage.setItem(`jobwin_profile_${user.id}`, JSON.stringify(updates));
          showToast('Profile saved locally (Supabase profiles table not set up yet)', 'warning');
        } else {
          throw error;
        }
      } else {
        showToast('✅ Profile saved successfully!');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast(`Error: ${err.message || 'Could not save profile. Please try again.'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPG, PNG, etc.)', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo must be less than 2MB', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Strategy 1: Try Supabase Storage
      if (user) {
        const ext = file.name.split('.').pop();
        const filename = `${user.id}_${Date.now()}.${ext}`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filename, file, { upsert: true });

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filename);
          setAvatarUrl(publicUrl);
          showToast('📸 Photo uploaded!');
          return;
        }
      }

      // Strategy 2: Convert to base64 and store locally (fallback)
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        setAvatarUrl(base64);
        showToast('📸 Photo set! Click Save Profile to keep it.', 'warning');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Photo upload error:', err);
      showToast('Could not upload photo. Please try again.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const initials = form.full_name
    ? form.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] || '?').toUpperCase();

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${t.border || 'rgba(255,255,255,0.12)'}`,
    borderRadius: '10px',
    color: t.text || '#E8E6F0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  };

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090f', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', fontSize: '16px' }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg || '#09090f', color: t.text || '#E8E6F0', fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <PageHead title="Profile | JobWin Resume" description="Manage your profile and preferences" />
      <Sidebar activeId="profile" collapsed={collapsed} setCollapsed={setCollapsed} user={user} />

      <main style={{ flex: 1, overflow: 'auto', padding: '40px 48px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0', color: t.text || '#E8E6F0' }}>
              Your Profile
            </h1>
            <p style={{ color: t.muted || 'rgba(255,255,255,0.5)', margin: 0, fontSize: '15px' }}>
              Update your personal details and job preferences
            </p>
          </div>

          {/* Toast */}
          {toast && (
            <div style={{
              padding: '12px 20px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', fontWeight: '500',
              background: toastType === 'success' ? 'rgba(67,217,162,0.12)' : toastType === 'error' ? 'rgba(255,100,100,0.12)' : 'rgba(255,179,71,0.12)',
              border: `1px solid ${toastType === 'success' ? 'rgba(67,217,162,0.3)' : toastType === 'error' ? 'rgba(255,100,100,0.3)' : 'rgba(255,179,71,0.3)'}`,
              color: toastType === 'success' ? '#43D9A2' : toastType === 'error' ? '#FF6B6B' : '#FFB347',
            }}>
              {toast}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Photo Section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.border || 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: t.text }}>Profile Photo</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Avatar */}
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: 'white', border: '3px solid rgba(108,99,255,0.3)' }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials
                  }
                </div>
                {/* Upload button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    style={{ padding: '10px 20px', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', color: '#A29BFE', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}
                  >
                    {uploadingPhoto ? '⏳ Uploading...' : '📸 Upload Photo'}
                  </button>
                  <p style={{ margin: 0, fontSize: '12px', color: t.muted || 'rgba(255,255,255,0.4)' }}>JPG, PNG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.border || 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: t.text }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.muted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                  <input style={inputStyle} name="full_name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.muted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email (read-only)</label>
                  <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={form.email} disabled />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.muted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</label>
                  <input style={inputStyle} name="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 99999 99999" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.muted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</label>
                  <input style={inputStyle} name="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Mumbai, India" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.muted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Role / Job Title</label>
                <input style={inputStyle} name="target_role" value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))} placeholder="Senior Data Analyst" />
              </div>
            </div>

            {/* Online Presence */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.border || 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: t.text }}>Online Presence</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.muted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LinkedIn</label>
                  <input style={inputStyle} name="linkedin" value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: t.muted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Website</label>
                  <input style={inputStyle} name="website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yoursite.com" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              style={{ width: '100%', padding: '14px', background: saving ? 'rgba(108,99,255,0.5)' : 'linear-gradient(135deg, #6C63FF, #FF6584)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px' }}
            >
              {saving ? '⏳ Saving...' : '💾 Save Profile'}
            </button>
          </form>

          {/* Account Info */}
          <div style={{ marginTop: '24px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${t.border || 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: t.muted }}>Logged in as</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '600', color: t.text }}>{user?.email}</p>
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
              style={{ padding: '8px 16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '8px', color: '#FF6B6B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
