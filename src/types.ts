export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  category: string;
  brand: string;
  stock: number;
  specs: { [key: string]: string };
  reviews: Review[];
  isCustom?: boolean; // added by vendor
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface Coupon {
  code: string;
  discountPercent: number;
}
