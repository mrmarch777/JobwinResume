import { useRouter } from 'next/router';
import PageHead from '../components/PageHead';

export default function Custom404() {
  const router = useRouter();
  
  return (
    <div style={{ minHeight: '100vh', background: '#09090f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <PageHead title="Page Not Found" description="The page you're looking for doesn't exist." />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Serif:wght@600;700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .btn-404:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,99,255,0.4) !important; }
      `}</style>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.6s ease forwards' }}>
        <div style={{ fontSize: 'clamp(80px, 15vw, 160px)', fontFamily: "'Noto Serif', serif", fontWeight: '700', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>404</div>
        <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: '600', color: '#E8E6F0', marginBottom: '12px' }}>Page Not Found</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', maxWidth: '400px', margin: '0 auto 32px', lineHeight: '1.6' }}>The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-404" onClick={() => router.push('/dashboard')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}>Go to Dashboard</button>
          <button className="btn-404" onClick={() => router.push('/')} style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.05)', color: '#E8E6F0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}>Go Home</button>
        </div>
      </div>
    </div>
  );
}
