import ShoppingBagIcon from '@heroicons/react/24/outline/ShoppingBagIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import ClipboardDocumentListIcon from '@heroicons/react/24/outline/ClipboardDocumentListIcon';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';

interface EmptyStateProps {
  type: 'cart' | 'orders' | 'addresses' | 'products' | 'seller-products' | 'seller-orders';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const emptyStateConfig: Record<EmptyStateProps['type'], { icon: React.ComponentType<{ className?: string }>; defaultTitle: string; defaultMessage: string; defaultActionLabel: string }> = {
  cart: {
    icon: ShoppingBagIcon,
    defaultTitle: 'Your cart is empty',
    defaultMessage: 'Looks like you haven\'t added any products yet.',
    defaultActionLabel: 'Start Shopping',
  },
  orders: {
    icon: TruckIcon,
    defaultTitle: 'No orders yet',
    defaultMessage: 'When you place orders, they\'ll appear here.',
    defaultActionLabel: 'Browse Products',
  },
  addresses: {
    icon: CreditCardIcon,
    defaultTitle: 'No saved addresses',
    defaultMessage: 'Add an address to speed up checkout.',
    defaultActionLabel: 'Add Address',
  },
  products: {
    icon: BuildingOfficeIcon,
    defaultTitle: 'No products found',
    defaultMessage: 'Try adjusting your search or filters.',
    defaultActionLabel: 'Clear Filters',
  },
  'seller-products': {
    icon: PlusCircleIcon,
    defaultTitle: 'No products listed',
    defaultMessage: 'Start selling by adding your first product.',
    defaultActionLabel: 'Add Product',
  },
  'seller-orders': {
    icon: ClipboardDocumentListIcon,
    defaultTitle: 'No orders yet',
    defaultMessage: 'Orders containing your products will appear here.',
    defaultActionLabel: 'Manage Products',
  },
};

export const EmptyState = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">
        <Icon />
      </div>
      <h3 className="empty-state-title">{title || config.defaultTitle}</h3>
      <p className="empty-state-message">{message || config.defaultMessage}</p>
      {onAction && (
        <button type="button" onClick={onAction} className="btn btn-primary">
          {actionLabel || config.defaultActionLabel}
        </button>
      )}
    </div>
  );
};