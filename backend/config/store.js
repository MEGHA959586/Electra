const seedProducts = [
  {
    id: 'prod-1',
    title: 'AeroSound Pro ANC Headphones',
    description: 'Immersive noise-canceling wireless over-ear headphones with custom spatial audio.',
    price: 249.99,
    original_price: 299.99,
    rating: 4.8,
    review_count: 142,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Audio',
    brand: 'AeroSound',
    stock: 12,
    specs: {
      'Driver Size': '40mm Custom Dynamic',
      'Battery Life': 'Up to 45 Hours'
    },
    reviews: [],
    is_custom: false,
    seller_id: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'Chronos X Active Smartwatch',
    description: 'Advanced fitness tracker and elegant watch featuring AMOLED display and GPS.',
    price: 189.99,
    original_price: 229.99,
    rating: 4.5,
    review_count: 98,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Wearables',
    brand: 'Chronos Labs',
    stock: 8,
    specs: {
      'Display': '1.43" AMOLED Always-On',
      'Battery Life': 'Up to 10 Days'
    },
    reviews: [],
    is_custom: false,
    seller_id: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: 'TacType Pro Mechanical Keyboard',
    description: '75% layout wireless keyboard with hot-swappable switches and RGB lighting.',
    price: 119.99,
    original_price: 139.99,
    rating: 4.9,
    review_count: 215,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Accessories',
    brand: 'TacType',
    stock: 15,
    specs: {
      'Layout': '75% Form Factor',
      'Connectivity': 'Bluetooth 5.1'
    },
    reviews: [],
    is_custom: false,
    seller_id: 1,
    created_at: new Date().toISOString()
  }
];

module.exports = {
  users: [],
  products: seedProducts,
  cartItems: [],
  orders: [],
  reviews: [],
  coupons: [
    { id: 1, code: 'WELCOME10', discount_percent: 10 },
    { id: 2, code: 'TECH20', discount_percent: 20 },
    { id: 3, code: 'SUPERDEAL', discount_percent: 30 }
  ]
};