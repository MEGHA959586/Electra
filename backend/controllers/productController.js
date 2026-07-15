const db = require('../config/db');

// Helper to fetch full product details (gallery, specs, reviews)
async function fetchFullProduct(productId) {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
  if (rows.length === 0) return null;
  const product = rows[0];

  const [gallery] = await db.query('SELECT image_url FROM product_gallery WHERE product_id = ?', [productId]);
  const [specs] = await db.query('SELECT spec_key, spec_value FROM product_specs WHERE product_id = ?', [productId]);
  const [reviews] = await db.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [productId]);

  product.gallery = gallery.map(g => g.image_url);
  product.specs = specs.reduce((acc, s) => { acc[s.spec_key] = s.spec_value; return acc; }, {});
  product.reviews = reviews;
  product.price = Number(product.price);
  product.originalPrice = product.original_price ? Number(product.original_price) : undefined;
  return product;
}

exports.getProducts = async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, minRating, inStock, search } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (brand && brand !== 'All') {
      sql += ' AND brand = ?';
      params.push(brand);
    }
    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(maxPrice);
    }
    if (minRating) {
      sql += ' AND rating >= ?';
      params.push(minRating);
    }
    if (inStock === 'true') {
      sql += ' AND stock > 0';
    }
    if (search) {
      sql += ' AND (title LIKE ? OR brand LIKE ? OR description LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const [rows] = await db.query(sql, params);
    const products = [];
    for (const row of rows) {
      const full = await fetchFullProduct(row.id);
      if (full) products.push(full);
    }
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await fetchFullProduct(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ msg: 'Access denied' });

  const { title, description, price, originalPrice, category, brand, stock, image, gallery, specs } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO products (title, description, price, original_price, category, brand, stock, image, seller_id, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, price, originalPrice || null, category, brand, stock, image, req.user.id, 1]
    );
    const productId = result.insertId;

    if (gallery && gallery.length) {
      for (const img of gallery) {
        await db.query('INSERT INTO product_gallery (product_id, image_url) VALUES (?, ?)', [productId, img]);
      }
    }
    if (specs) {
      for (const [key, value] of Object.entries(specs)) {
        await db.query('INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES (?, ?, ?)', [productId, key, value]);
      }
    }

    const newProduct = await fetchFullProduct(productId);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ msg: 'Access denied' });
  const { title, description, price, originalPrice, category, brand, stock, image } = req.body;
  try {
    await db.query(
      'UPDATE products SET title=?, description=?, price=?, original_price=?, category=?, brand=?, stock=?, image=? WHERE id=? AND seller_id=?',
      [title, description, price, originalPrice || null, category, brand, stock, image, req.params.id, req.user.id]
    );
    res.json({ msg: 'Product updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ msg: 'Access denied' });
  try {
    await db.query('DELETE FROM products WHERE id=? AND seller_id=?', [req.params.id, req.user.id]);
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateStock = async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ msg: 'Access denied' });
  const { stock } = req.body;
  try {
    await db.query('UPDATE products SET stock=? WHERE id=? AND seller_id=?', [stock, req.params.id, req.user.id]);
    res.json({ msg: 'Stock updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};