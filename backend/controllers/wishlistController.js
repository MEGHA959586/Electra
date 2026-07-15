const db = require('../config/db');

exports.getWishlist = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.* FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?`,
      [req.user.id]
    );
    // Map to frontend Product format
    const products = rows.map(row => ({
      id: String(row.id),
      title: row.title,
      description: row.description,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      rating: Number(row.rating || 0),
      reviewCount: Number(row.review_count || 0),
      image: row.image,
      gallery: row.gallery ? JSON.parse(row.gallery) : [],
      category: row.category,
      brand: row.brand,
      stock: Number(row.stock),
      specs: row.specs ? JSON.parse(row.specs) : {},
      reviews: row.reviews ? JSON.parse(row.reviews) : [],
      seller_id: row.seller_id ? String(row.seller_id) : null,
    }));
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    await db.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [req.user.id, productId]
    );
    // Return updated wishlist
    const [rows] = await db.query(
      `SELECT p.* FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?`,
      [req.user.id]
    );
    res.json(rows.map(row => ({
      id: String(row.id),
      title: row.title,
      description: row.description,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      rating: Number(row.rating || 0),
      reviewCount: Number(row.review_count || 0),
      image: row.image,
      gallery: row.gallery ? JSON.parse(row.gallery) : [],
      category: row.category,
      brand: row.brand,
      stock: Number(row.stock),
      specs: row.specs ? JSON.parse(row.specs) : {},
      reviews: row.reviews ? JSON.parse(row.reviews) : [],
      seller_id: row.seller_id ? String(row.seller_id) : null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    await db.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );
    const [rows] = await db.query(
      `SELECT p.* FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?`,
      [req.user.id]
    );
    res.json(rows.map(row => ({
      id: String(row.id),
      title: row.title,
      description: row.description,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      rating: Number(row.rating || 0),
      reviewCount: Number(row.review_count || 0),
      image: row.image,
      gallery: row.gallery ? JSON.parse(row.gallery) : [],
      category: row.category,
      brand: row.brand,
      stock: Number(row.stock),
      specs: row.specs ? JSON.parse(row.specs) : {},
      reviews: row.reviews ? JSON.parse(row.reviews) : [],
      seller_id: row.seller_id ? String(row.seller_id) : null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};