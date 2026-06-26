interface LoadingSkeletonProps {
  variant?: 'card' | 'table-row' | 'product-card' | 'text';
  className?: string;
}

export const LoadingSkeleton = ({ variant = 'card', className = '' }: LoadingSkeletonProps) => {
  if (variant === 'product-card') {
    return (
      <div className="product-card">
        <div className="skeleton skeleton-image" />
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <div className="skeleton skeleton-md" style={{ width: '75%' }} />
          <div className="skeleton skeleton-sm" style={{ width: '50%' }} />
          <div className="skeleton skeleton-sm" style={{ width: '33%' }} />
          <div className="skeleton skeleton-md" style={{ width: '25%', marginTop: '0.5rem' }} />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return <div className={className}><div className="skeleton skeleton-sm" style={{ width: '60%' }} /></div>;
  }

  if (variant === 'table-row') {
    return (
      <tr className={className} style={{ borderBottom: '1px solid var(--border-light)' }}>
        <td style={{ padding: '0.75rem 1rem' }}><div className="skeleton skeleton-sm" style={{ width: '5rem' }} /></td>
        <td style={{ padding: '0.75rem 1rem' }}><div className="skeleton skeleton-sm" style={{ width: '8rem' }} /></td>
        <td style={{ padding: '0.75rem 1rem' }}><div className="skeleton skeleton-sm" style={{ width: '4rem' }} /></td>
        <td style={{ padding: '0.75rem 1rem' }}><div className="skeleton skeleton-sm" style={{ width: '6rem' }} /></td>
        <td style={{ padding: '0.75rem 1rem' }}><div className="skeleton skeleton-sm" style={{ width: '5rem' }} /></td>
      </tr>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div className="skeleton skeleton-md" style={{ width: '75%' }} />
      <div className="skeleton skeleton-sm" style={{ width: '50%' }} />
      <div className="skeleton skeleton-sm" style={{ width: '33%' }} />
    </div>
  );
};