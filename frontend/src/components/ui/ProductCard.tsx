import { Link } from 'react-router-dom';
import type { ProductResponse } from '../../types/api';

interface ProductCardProps {
  product: ProductResponse;
  onAddToCart?: (productId: number) => void;
  showAddToCart?: boolean;
  isAdding?: boolean;
  variant?: 'catalog' | 'seller';
}

export const ProductCard = ({
  product,
  onAddToCart,
  showAddToCart = true,
  isAdding = false,
  variant = 'catalog',
}: ProductCardProps) => {
  const imageUrl = product.imageUrl || '/images/placeholder-product.svg';

  return (
    <div className="product-card animate-fade-in-up">
      <Link to={`/products/${product.productId}`} className="product-card-image">
        <img src={imageUrl} alt={product.name ? `Product: ${product.name}` : 'Product image not available'} loading="lazy" />
        {variant === 'seller' && product.stockQuantity < 10 && product.stockQuantity > 0 && (
          <span className="product-card-badge badge badge-yellow">Low Stock: {product.stockQuantity}</span>
        )}
        {variant === 'seller' && product.stockQuantity === 0 && (
          <span className="product-card-badge badge badge-red">Out of Stock</span>
        )}
      </Link>

      <div className="product-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h3 className="product-card-name">{product.name}</h3>
            {variant === 'seller' && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>ID: {product.productId}</span>
            )}
        </div>

        <p className="product-card-desc">{product.description || 'No description'}</p>

        <div className="product-card-price">${product.price.toFixed(2)}</div>

        <div className="product-card-meta">
          <span>{product.categoryName}</span>
          <span>Stock: {product.stockQuantity}</span>
        </div>

        {showAddToCart && onAddToCart && (
          <button type="button"
            onClick={() => onAddToCart(product.productId)}
            disabled={isAdding || product.stockQuantity === 0}
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};