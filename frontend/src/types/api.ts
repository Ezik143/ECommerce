export interface CategoryResponse {
  categoryId: number;
  parentCategoryId: number | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children: CategoryResponse[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number | null;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ProductResponse {
  productId: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  sellerId: number;
  sellerName: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  categoryId?: number;
  imageUrl?: string;
}

export interface CartResponse {
  cartId: number;
  userId: number;
  items: CartItemResponse[];
  totalAmount: number;
}

export interface CartItemResponse {
  cartItemId: number;
  cartId: number;
  productId: number;
  product: {
    productId: number;
    name: string;
    price: number;
    imageUrl: string | null;
  } | null;
  quantity: number;
}

export interface OrderResponse {
  orderId: number;
  userId: number;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  orderItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface CreateOrderRequest {
  paymentMethod: 'CreditCard' | 'BankTransfer' | 'CashOnDelivery' | 'EWallet';
  shippingAddressId: number;
}

export interface AddressResponse {
  addressId: number;
  userId: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface CartRequest {
  userId: number;
}

export interface UpdateCartRequest {
  userId?: number;
}

export interface AddCartItemRequest {
  cartId: number;
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateOrderRequest {
  status?: string;
  paymentMethod?: string;
  shippingAddress?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}