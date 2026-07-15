const db = require('../config/db');

exports.getCoupons = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM coupons');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.validateCoupon = async (req, res) => {
  const { code } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM coupons WHERE code = ?', [code]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Invalid coupon' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};