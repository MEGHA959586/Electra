const db = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.id AS cart_id, c.quantity, p.*
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(rows.map((row) => ({ ...row, price: Number(row.price), originalPrice: row.original_price ? Number(row.original_price) : undefined })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
    } else {
      await db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, productId, quantity]);
    }

    const [cart] = await db.query(`
      SELECT c.id AS cart_id, c.quantity, p.*
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(cart.map((row) => ({ ...row, price: Number(row.price), originalPrice: row.original_price ? Number(row.original_price) : undefined })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  if (quantity <= 0) return exports.removeItem(req, res);
  try {
    await db.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, req.user.id, productId]);
    const [cart] = await db.query(`
      SELECT c.id AS cart_id, c.quantity, p.*
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(cart.map((row) => ({ ...row, price: Number(row.price), originalPrice: row.original_price ? Number(row.original_price) : undefined })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
    const [cart] = await db.query(`
      SELECT c.id AS cart_id, c.quantity, p.*
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(cart.map((row) => ({ ...row, price: Number(row.price), originalPrice: row.original_price ? Number(row.original_price) : undefined })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};