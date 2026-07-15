const db = require('../config/db');

exports.createOrder = async (req, res) => {
  console.log('📦 Incoming order from user:', req.user.id);
  const { subtotal, discount, tax, shipping, total, shippingAddress, paymentMethod, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: 'Order must contain at least one item' });
  }

  try {
    const orderNumber = `ORD-${Date.now()}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
    console.log('📝 Inserting order:', orderNumber);

    const [result] = await db.query(
      `INSERT INTO orders 
        (user_id, order_number, subtotal, discount, tax, shipping, total, shipping_address, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        orderNumber,
        subtotal,
        discount,
        tax,
        shipping,
        total,
        JSON.stringify(shippingAddress),
        paymentMethod
      ]
    );

    const orderId = result.insertId;
    console.log('✅ Order inserted with ID:', orderId);

    for (const item of items) {
      const productId = parseInt(item.product.id, 10);
      if (isNaN(productId)) {
        throw new Error(`Invalid product ID: ${item.product.id}`);
      }

      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, productId, item.quantity, item.product.price]
      );

      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, productId]);
      console.log(`📦 Product ${productId} stock updated, quantity: ${item.quantity}`);
    }

    await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    console.log(`🛒 Cart cleared for user ${req.user.id}`);

    res.status(201).json({ msg: 'Order placed', orderId });
  } catch (err) {
    console.error('❌ Order creation error:', err.message);
    console.error(err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    for (const order of orders) {
      const [items] = await db.query(`
        SELECT oi.quantity, oi.price, p.*
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      // Ensure product object is fully formed
      order.items = items.map((row) => ({
        quantity: row.quantity,
        price: row.price,
        product: {
          id: String(row.id),
          title: row.title,
          description: row.description,
          price: Number(row.price),
          originalPrice: row.original_price ? Number(row.original_price) : undefined,
          rating: Number(row.rating || 0),
          reviewCount: Number(row.review_count || 0),
          image: row.image,
          gallery: [],
          category: row.category,
          brand: row.brand,
          stock: Number(row.stock),
          specs: {},
          reviews: [],
          seller_id: row.seller_id ? String(row.seller_id) : null,
        }
      }));
      order.shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null;
    }
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSellerOrders = async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ msg: 'Access denied' });
  try {
    // Get orders that contain at least one product belonging to this seller
    const [orders] = await db.query(`
      SELECT DISTINCT o.*
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    for (const order of orders) {
      // Fetch items with FULL product details
      const [items] = await db.query(`
        SELECT 
          oi.id AS order_item_id,
          oi.quantity,
          oi.price,
          p.id AS product_id,
          p.title,
          p.description,
          p.price AS product_price,
          p.original_price,
          p.rating,
          p.review_count,
          p.image,
          p.category,
          p.brand,
          p.stock,
          p.seller_id
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      // Map each item to include a full `product` object
      order.items = items.map((row) => ({
        quantity: row.quantity,
        price: row.price,
        product: {
          id: String(row.product_id),
          title: row.title,
          description: row.description,
          price: Number(row.product_price),
          originalPrice: row.original_price ? Number(row.original_price) : undefined,
          rating: Number(row.rating || 0),
          reviewCount: Number(row.review_count || 0),
          image: row.image,
          gallery: [],
          category: row.category,
          brand: row.brand,
          stock: Number(row.stock),
          specs: {},
          reviews: [],
          seller_id: row.seller_id ? String(row.seller_id) : null,
        }
      }));

      order.shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null;
    }
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ msg: 'Access denied' });
  const { status } = req.body;
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ msg: 'Order status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};