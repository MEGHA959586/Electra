require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'electra_db'
};

async function seed() {
  const connection = await mysql.createConnection(config);

  await connection.query('CREATE DATABASE IF NOT EXISTS electra_db');
  await connection.query('USE electra_db');

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('buyer', 'seller') DEFAULT 'buyer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      rating DECIMAL(3,2) DEFAULT 0,
      review_count INT DEFAULT 0,
      image VARCHAR(255),
      category VARCHAR(50),
      brand VARCHAR(100),
      stock INT DEFAULT 0,
      is_custom BOOLEAN DEFAULT FALSE,
      seller_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      image_url VARCHAR(255),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_specs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      spec_key VARCHAR(100),
      spec_value VARCHAR(255),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      order_number VARCHAR(20) UNIQUE NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      discount DECIMAL(10,2) DEFAULT 0,
      tax DECIMAL(10,2) DEFAULT 0,
      shipping DECIMAL(10,2) DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      shipping_address TEXT,
      payment_method VARCHAR(50),
      status ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Processing',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      discount_percent INT NOT NULL,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await connection.query(schema);

  await connection.query(
    "INSERT INTO coupons (code, discount_percent) VALUES ('WELCOME10',10), ('TECH20',20), ('SUPERDEAL',30) ON DUPLICATE KEY UPDATE discount_percent = VALUES(discount_percent)"
  );

  const sellerPassword = await bcrypt.hash('password123', 10);
  const buyerPassword = await bcrypt.hash('password123', 10);

  await connection.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)',
    ['Admin Seller', 'seller@electra.com', sellerPassword, 'seller']
  );
  await connection.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)',
    ['Demo Buyer', 'buyer@electra.com', buyerPassword, 'buyer']
  );

  const [sellerRows] = await connection.query('SELECT id FROM users WHERE email = ?', ['seller@electra.com']);
  const sellerId = sellerRows[0].id;

  // Sample products with gallery and specs
  const sampleProducts = [
    {
      title: 'AeroSound Pro ANC Headphones',
      description: 'Immersive noise-canceling wireless over‑ear headphones with custom spatial audio.',
      price: 249.99,
      original_price: 299.99,
      rating: 4.8,
      review_count: 142,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      category: 'Audio',
      brand: 'AeroSound',
      stock: 12,
      seller_id: sellerId,
      gallery: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
      ],
      specs: { 'Driver Size': '40mm Custom Dynamic', 'Battery Life': 'Up to 45 Hours' }
    },
    {
      title: 'Chronos X Active Smartwatch',
      description: 'Advanced fitness tracker with AMOLED display and GPS.',
      price: 189.99,
      original_price: 229.99,
      rating: 4.5,
      review_count: 98,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      category: 'Wearables',
      brand: 'Chronos Labs',
      stock: 8,
      seller_id: sellerId,
      gallery: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      specs: { 'Display': '1.43" AMOLED Always-On', 'Battery Life': 'Up to 10 Days' }
    },
    {
      title: 'TacType Pro Mechanical Keyboard',
      description: '75% layout wireless keyboard with hot‑swappable switches and RGB lighting.',
      price: 119.99,
      original_price: 139.99,
      rating: 4.9,
      review_count: 215,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      category: 'Accessories',
      brand: 'TacType',
      stock: 15,
      seller_id: sellerId,
      gallery: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'],
      specs: { 'Layout': '75% Form Factor', 'Connectivity': 'Bluetooth 5.1' }
    }
  ];

  for (const product of sampleProducts) {
    const [result] = await connection.query(
      'INSERT INTO products (title, description, price, original_price, rating, review_count, image, category, brand, stock, seller_id, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [product.title, product.description, product.price, product.original_price, product.rating, product.review_count, product.image, product.category, product.brand, product.stock, product.seller_id, 0]
    );
    const productId = result.insertId;

    for (const img of product.gallery) {
      await connection.query('INSERT INTO product_gallery (product_id, image_url) VALUES (?, ?)', [productId, img]);
    }
    for (const [key, value] of Object.entries(product.specs)) {
      await connection.query('INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES (?, ?, ?)', [productId, key, value]);
    }
  }

  console.log('✅ Seed data inserted successfully.');
  await connection.end();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});