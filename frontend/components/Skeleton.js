export function SkeletonPulse({ width, height, borderRadius, style }) {
  return (
    <div style={{
      width: width || '100%',
      height: height || '16px',
      borderRadius: borderRadius || '8px',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...style
    }} />
  );
}

export function SkeletonCard({ style }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '24px',
      padding: '28px',
      ...style
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <SkeletonPulse width="36px" height="36px" borderRadius="10px" />
        <div style={{ flex: 1 }}>
          <SkeletonPulse width="120px" height="16px" style={{ marginBottom: '6px' }} />
          <SkeletonPulse width="80px" height="12px" />
        </div>
      </div>
      <SkeletonPulse height="40px" style={{ marginBottom: '12px' }} />
      <SkeletonPulse height="40px" style={{ marginBottom: '12px' }} />
      <SkeletonPulse height="36px" borderRadius="10px" />
    </div>
  );
}

export const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
