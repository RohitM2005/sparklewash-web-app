// controllers/razorpay.controller.js
import crypto from "crypto";
import pool from "../config/db.js";
import razorpay from "../config/razorpay.js";

// STEP 1 — Create Order
export const createOrder = async (req, res) => {
  try {
    const { amount, subscription_id } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${subscription_id}_${Date.now()}`,
      notes: {
        subscription_id: subscription_id,
        user_id: req.user.id
      }
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP 2 — Verify Payment + Save to DB
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscription_id,
      amount
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed — invalid signature"
      });
    }

    // Idempotency check: verify if razorpay_payment_id already exists in payments
    const [existing] = await pool.query(
      `SELECT id FROM payments WHERE razorpay_payment_id = ?`,
      [razorpay_payment_id]
    );
    if (existing.length > 0) {
      return res.json({ success: true, message: "Payment already verified and saved" });
    }

    // Update subscription to active
    await pool.query(
      `UPDATE subscriptions SET
        status = 'active',
        razorpay_order_id = ?,
        razorpay_payment_id = ?,
        start_date = CURDATE(),
        renewal_date = DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
       WHERE id = ?`,
      [razorpay_order_id, razorpay_payment_id, subscription_id]
    );

    // Save payment record
    await pool.query(
      `INSERT INTO payments
        (user_id, subscription_id, amount, payment_method,
         razorpay_order_id, razorpay_payment_id, razorpay_signature,
         status, paid_at)
       VALUES (?, ?, ?, 'razorpay', ?, ?, ?, 'paid', NOW())`,
      [req.user.id, subscription_id, amount,
       razorpay_order_id, razorpay_payment_id, razorpay_signature]
    );

    res.json({ success: true, message: "Payment verified and saved" });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STEP 3 — Webhook (for production later)
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    // Use raw body buffer for correct signature verification
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    if (req.body.event === "payment.captured") {
      console.log("✅ Payment captured via webhook:",
        req.body.payload.payment.entity.id);
    }

    if (req.body.event === "payment.failed") {
      console.log("❌ Payment failed:",
        req.body.payload.payment.entity.id);
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};