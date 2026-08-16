import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHead from '../components/PageHead';

export default function Jobs() {
  const router = useRouter();
  useEffect(() => {
    const { role, city } = router.query;
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (city) params.set('city', city);
    const query = params.toString();
    router.replace(`/find-job${query ? '?' + query : ''}`);
  }, [router.query]);
  
  return (
    <div style={{ minHeight: '100vh', background: '#09090f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageHead title="Jobs" description="Redirecting to job search..." />
      <div style={{ color: '#6C63FF', fontFamily: "DM Sans, sans-serif" }}>Redirecting to Job Search...</div>
    </div>
  );
}
