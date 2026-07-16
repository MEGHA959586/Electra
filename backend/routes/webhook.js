const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// Webhook must use raw body (no express.json() for this route)
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, items, shipping } = paymentIntent.metadata;

    // 1. Create order in your database
    const orderNumber = `ORD-${Date.now()}`;
    const shippingAddress = JSON.parse(shipping);
    const parsedItems = JSON.parse(items);

    // Calculate totals (you can also fetch from DB)
    const total = paymentIntent.amount / 100;
    // Insert order, order_items, clear cart, etc.

    try {
      // ... your order creation logic (similar to handlePlaceOrder)
      console.log(`✅ Order created for user ${userId}`);
    } catch (err) {
      console.error('Order creation failed:', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;