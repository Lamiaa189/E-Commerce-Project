export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
  postalCode?: string;
}

export interface Order {
  _id?: string;
  id?: string;
  cartItems?: OrderItem[];
  shippingAddress?: ShippingAddress;
  totalOrderPrice?: number;
  paymentMethodType?: 'cash' | 'card';
  isPaid?: boolean;
  paidAt?: string;
  isDelivered?: boolean;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: string;
  status?: 'pending' | 'paid' | 'delivered' | 'cancelled';
  orderNumber?: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  results?: number;
  pagination?: {
    currentPage: number;
    numberOfPages: number;
    limit: number;
  };
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethodType: 'cash' | 'card';
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card';
  icon: string;
  description: string;
}
