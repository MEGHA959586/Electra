const db = require('../config/db');

exports.addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    await db.query('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [productId, req.user.id, rating, comment]);
    const [avg] = await db.query('SELECT AVG(rating) as avgRating, COUNT(*) as count FROM reviews WHERE product_id = ?', [productId]);
    const avgRating = avg[0].avgRating || 0;
    const reviewCount = avg[0].count || 0;
    await db.query('UPDATE products SET rating = ?, review_count = ? WHERE id = ?', [avgRating, reviewCount, productId]);
    res.status(201).json({ msg: 'Review added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const [reviews] = await db.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [req.params.productId]);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};