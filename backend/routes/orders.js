const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Create order
router.post('/', auth, orderController.createOrder);
// Get buyer orders
router.get('/', auth, orderController.getMyOrders);
// Get seller orders (filtered)
router.get('/seller', auth, orderController.getSellerOrders);
// Update order status (seller)
router.put('/:id/status', auth, orderController.updateOrderStatus);
// Cancel order (buyer)
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;