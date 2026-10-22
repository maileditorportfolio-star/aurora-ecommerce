export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  gallery?: string[] | null;
  sku?: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  active: boolean;
  categoryId?: string | null;
  category?: Category | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductListResponse {
  items: Product[];
  categories: Category[];
  pagination: Pagination;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  avatarUrl?: string | null;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
  quantity: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string | null;
  shippingZip?: string | null;
  shippingCountry: string;
  note?: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: 'USER' | 'ADMIN' | 'SYSTEM';
  createdAt: string;
  user?: { id: string; name: string; avatarUrl?: string | null; role: string } | null;
}
