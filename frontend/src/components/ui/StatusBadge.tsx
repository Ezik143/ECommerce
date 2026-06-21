interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  pendingpayment: 'badge badge-yellow',
  paid: 'badge badge-blue',
  shipped: 'badge badge-indigo',
  delivered: 'badge badge-green',
  cancelled: 'badge badge-red',
  refunded: 'badge badge-purple',
  default: 'badge badge-gray',
};

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase();
  const styleClass = statusStyles[normalizedStatus] || statusStyles.default;

  const label = status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return <span className={`${styleClass} ${className}`}>{label}</span>;
};