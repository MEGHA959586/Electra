const mysql = require('mysql2');
require('dotenv').config();
const store = require('./store');

let pool;
let useFallback = false;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  });
} catch (error) {
  useFallback = true;
}

function normalizeProduct(product) {
  return {
    ...product,
    price: Number(product.price),
    originalPrice: product.original_price !== undefined && product.original_price !== null ? Number(product.original_price) : undefined,
    original_price: product.original_price !== undefined && product.original_price !== null ? Number(product.original_price) : undefined
  };
}

function normalizeUser(user) {
  return { ...user, id: String(user.id) };
}

function queryFallback(sql, params = []) {
  const statement = sql.trim();

  if (statement.startsWith('SELECT * FROM users WHERE email = ?')) {
    const [rows] = [store.users.filter((user) => user.email === params[0])];
    return Promise.resolve([rows.map(normalizeUser)]);
  }

  if (statement.startsWith('SELECT id, name, email, role FROM users WHERE id = ?')) {
    const user = store.users.find((entry) => entry.id === Number(params[0]));
    return Promise.resolve([[user ? normalizeUser(user) : null]]);
  }

  if (statement.startsWith('SELECT * FROM users WHERE id = ?')) {
    const user = store.users.find((entry) => entry.id === Number(params[0]));
    return Promise.resolve([[user ? normalizeUser(user) : null]]);
  }

  if (statement.startsWith('INSERT INTO users')) {
    const newUser = {
      id: store.users.length + 1,
      name: params[0],
      email: params[1],
      password: params[2],
      role: params[3] || 'buyer',
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    return Promise.resolve([{ insertId: newUser.id, affectedRows: 1 }]);
  }

  if (statement === 'SELECT * FROM products WHERE 1=1' || statement.startsWith('SELECT * FROM products WHERE 1=1')) {
    let results = [...store.products];
    if (statement.includes('AND category = ?')) {
      results = results.filter((product) => product.category === params[0]);
    }
    if (statement.includes('AND brand = ?')) {
      results = results.filter((product) => product.brand === params[params.findIndex((_, index) => statement.includes('AND brand = ?') && index === 0) ?? 0]);
    }
    if (statement.includes('AND price >= ?')) {
      results = results.filter((product) => Number(product.price) >= Number(params[0]));
    }
    if (statement.includes('AND price <= ?')) {
      results = results.filter((product) => Number(product.price) <= Number(params[0]));
    }
    if (statement.includes('AND rating >= ?')) {
      results = results.filter((product) => Number(product.rating) >= Number(params[0]));
    }
    if (statement.includes('AND stock > 0')) {
      results = results.filter((product) => Number(product.stock) > 0);
    }
    if (statement.includes('title LIKE ?')) {
      const searchTerm = params[params.length - 3] || '';
      const term = String(searchTerm).toLowerCase();
      results = results.filter((product) => `${product.title} ${product.brand} ${product.description}`.toLowerCase().includes(term));
    }
    return Promise.resolve([results.map(normalizeProduct)]);
  }

  if (statement.startsWith('SELECT * FROM products WHERE id = ?')) {
    const product = store.products.find((entry) => String(entry.id) === String(params[0]));
    return Promise.resolve([[product ? normalizeProduct(product) : null]]);
  }

  if (statement.startsWith('INSERT INTO products')) {
    const newProduct = {
      id: String(store.products.length + 1),
      title: params[0],
      description: params[1],
      price: Number(params[2]),
      original_price: params[3] !== undefined ? Number(params[3]) : null,
      category: params[4],
      brand: params[5],
      stock: Number(params[6]),
      image: params[7],
      seller_id: params[8],
      rating: 0,
      review_count: 0,
      gallery: [],
      specs: {},
      reviews: [],
      is_custom: true,
      created_at: new Date().toISOString()
    };
    store.products.push(newProduct);
    return Promise.resolve([{ insertId: newProduct.id, affectedRows: 1 }]);
  }

  if (statement.startsWith('UPDATE products SET')) {
    if (statement.includes('stock = stock - ?')) {
      const product = store.products.find((entry) => String(entry.id) === String(params[1]));
      if (product) product.stock = Number(product.stock) - Number(params[0]);
    } else {
      const product = store.products.find((entry) => String(entry.id) === String(params[8]) && Number(entry.seller_id) === Number(params[9]));
      if (product) {
        product.title = params[0];
        product.description = params[1];
        product.price = Number(params[2]);
        product.original_price = params[3] !== undefined ? Number(params[3]) : null;
        product.category = params[4];
        product.brand = params[5];
        product.stock = Number(params[6]);
        product.image = params[7];
      }
    }
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (statement.startsWith('DELETE FROM products')) {
    store.products = store.products.filter((product) => !(String(product.id) === String(params[0]) && Number(product.seller_id) === Number(params[1])));
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (statement.startsWith('SELECT c.id AS cart_id, c.quantity, p.*')) {
    const rows = store.cartItems
      .filter((entry) => Number(entry.user_id) === Number(params[0]))
      .map((entry) => {
        const product = store.products.find((item) => String(item.id) === String(entry.product_id));
        if (!product) return null;
        return {
          cart_id: entry.id,
          quantity: entry.quantity,
          ...normalizeProduct(product)
        };
      })
      .filter(Boolean);
    return Promise.resolve([rows]);
  }

  if (statement.startsWith('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')) {
    const existing = store.cartItems.filter((entry) => Number(entry.user_id) === Number(params[0]) && Number(entry.product_id) === Number(params[1]));
    return Promise.resolve([existing]);
  }

  if (statement.startsWith('INSERT INTO cart_items')) {
    const newEntry = { id: store.cartItems.length + 1, user_id: params[0], product_id: params[1], quantity: Number(params[2]) };
    store.cartItems.push(newEntry);
    return Promise.resolve([{ insertId: newEntry.id, affectedRows: 1 }]);
  }

  if (statement.startsWith('UPDATE cart_items SET quantity = ? WHERE id = ?')) {
    const entry = store.cartItems.find((item) => item.id === Number(params[1]));
    if (entry) entry.quantity = Number(params[0]);
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (statement.startsWith('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?')) {
    const entry = store.cartItems.find((item) => Number(item.user_id) === Number(params[1]) && Number(item.product_id) === Number(params[2]));
    if (entry) entry.quantity = Number(params[0]);
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (statement.startsWith('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?')) {
    store.cartItems = store.cartItems.filter((item) => !(Number(item.user_id) === Number(params[0]) && Number(item.product_id) === Number(params[1])));
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (statement.startsWith('DELETE FROM cart_items WHERE user_id = ?')) {
    store.cartItems = store.cartItems.filter((item) => Number(item.user_id) !== Number(params[0]));
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (statement.startsWith('INSERT INTO orders')) {
    const newOrder = {
      id: store.orders.length + 1,
      user_id: params[0],
      order_number: params[1],
      subtotal: Number(params[2]),
      discount: Number(params[3]),
      tax: Number(params[4]),
      shipping: Number(params[5]),
      total: Number(params[6]),
      shipping_address: params[7],
      payment_method: params[8],
      status: 'Processing',
      created_at: new Date().toISOString()
    };
    store.orders.push(newOrder);
    return Promise.resolve([{ insertId: newOrder.id, affectedRows: 1 }]);
  }

  if (statement.startsWith('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')) {
    const rows = store.orders.filter((order) => Number(order.user_id) === Number(params[0]));
    return Promise.resolve([rows]);
  }

  if (statement.startsWith('SELECT * FROM orders ORDER BY created_at DESC')) {
    return Promise.resolve([store.orders]);
  }

  if (statement.startsWith('UPDATE orders SET status = ? WHERE id = ?')) {
    const order = store.orders.find((entry) => entry.id === Number(params[1]));
    if (order) order.status = params[0];
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (statement.startsWith('INSERT INTO order_items')) {
    return Promise.resolve([{ insertId: Date.now(), affectedRows: 1 }]);
  }

  if (statement.startsWith('INSERT INTO reviews')) {
    const newReview = { id: store.reviews.length + 1, product_id: params[0], user_id: params[1], rating: Number(params[2]), comment: params[3], created_at: new Date().toISOString() };
    store.reviews.push(newReview);
    return Promise.resolve([{ insertId: newReview.id, affectedRows: 1 }]);
  }

  if (statement.startsWith('SELECT AVG(rating) as avgRating, COUNT(*) as count FROM reviews WHERE product_id = ?')) {
    const productReviews = store.reviews.filter((entry) => Number(entry.product_id) === Number(params[0]));
    const avgRating = productReviews.length ? productReviews.reduce((sum, item) => sum + item.rating, 0) / productReviews.length : 0;
    return Promise.resolve([[{ avgRating, count: productReviews.length }]]);
  }

  if (statement.startsWith('UPDATE products SET rating = ?, review_count = ? WHERE id = ?')) {
    const product = store.products.find((entry) => String(entry.id) === String(params[2]));
    if (product) {
      product.rating = Number(params[0]);
      product.review_count = Number(params[1]);
    }
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (statement.startsWith('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC')) {
    return Promise.resolve([store.reviews.filter((entry) => Number(entry.product_id) === Number(params[0]))]);
  }

  if (statement.startsWith('SELECT * FROM coupons')) {
    return Promise.resolve([store.coupons]);
  }

  if (statement.startsWith('SELECT * FROM coupons WHERE code = ?')) {
    const coupon = store.coupons.find((entry) => entry.code === params[0]);
    return Promise.resolve([[coupon]]);
  }

  return Promise.resolve([[]]);
}

async function query(sql, params = []) {
  if (pool && !useFallback) {
    try {
      return await pool.promise().query(sql, params);
    } catch (error) {
      if (error.code === 'ER_BAD_DB_ERROR' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('Unknown database')) {
        useFallback = true;
      } else {
        throw error;
      }
    }
  }

  return queryFallback(sql, params);
}

module.exports = { query, isFallback: () => useFallback };