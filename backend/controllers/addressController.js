const db = require('../config/db');

exports.getAddresses = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json(rows.map(row => ({
      id: String(row.id),
      name: row.name,
      email: row.email,
      address: row.address,
      city: row.city,
      zip: row.zip,
      phone: row.phone,
      is_default: !!row.is_default,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addAddress = async (req, res) => {
  const { name, email, address, city, zip, phone, is_default } = req.body;
  try {
    const [existing] = await db.query('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?', [req.user.id]);
    const shouldBeDefault = existing[0].count === 0 ? true : !!is_default;

    if (shouldBeDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await db.query(
      `INSERT INTO addresses (user_id, name, email, address, city, zip, phone, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, email, address, city, zip, phone, shouldBeDefault]
    );

    const newId = result.insertId;
    const [newAddress] = await db.query('SELECT * FROM addresses WHERE id = ?', [newId]);
    res.status(201).json({
      id: String(newAddress[0].id),
      name: newAddress[0].name,
      email: newAddress[0].email,
      address: newAddress[0].address,
      city: newAddress[0].city,
      zip: newAddress[0].zip,
      phone: newAddress[0].phone,
      is_default: !!newAddress[0].is_default,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateAddress = async (req, res) => {
  const { name, email, address, city, zip, phone, is_default } = req.body;
  try {
    if (is_default) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }
    await db.query(
      `UPDATE addresses SET name=?, email=?, address=?, city=?, zip=?, phone=?, is_default=?
       WHERE id=? AND user_id=?`,
      [name, email, address, city, zip, phone, is_default, req.params.id, req.user.id]
    );
    res.json({ msg: 'Address updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    await db.query('DELETE FROM addresses WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ msg: 'Address deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.setDefault = async (req, res) => {
  try {
    await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    await db.query('UPDATE addresses SET is_default = TRUE WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ msg: 'Default address set' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};