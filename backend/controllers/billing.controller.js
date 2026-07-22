// controllers/billing.controller.js
// Admin billing (create/send/edit) + Customer billing (view unpaid, pay, verify)

import pool from "../config/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ═══════════════════════════════════════════════
   ADMIN — Create & Send Bill
   POST /api/admin/billing/create-and-send
   ═══════════════════════════════════════════════ */
export const createAndSendBill = async (req, res) => {
  try {
    const {
      user_id,
      subscription_id,
      base_amount,
      interior_items,
      other_items,
      bill_note,
    } = req.body;

    if (!user_id || base_amount === undefined || base_amount === null) {
      return res.status(400).json({
        success: false,
        error: "user_id and base_amount are required",
      });
    }

    let subId = subscription_id;
    let sub = null;
    if (subId) {
      const [subRows] = await pool.execute(
        `SELECT id, renewal_date, start_date, plan_name FROM subscriptions WHERE id = ?`,
        [subId]
      );
      if (subRows.length) sub = subRows[0];
    }

    if (!sub) {
      const [activeSubs] = await pool.execute(
        `SELECT id, renewal_date, start_date, plan_name FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
        [user_id]
      );
      if (activeSubs.length) {
        sub = activeSubs[0];
        subId = sub.id;
      }
    }

    const now = new Date();
    const renewalDate = sub?.renewal_date ? new Date(sub.renewal_date) : now;
    const fromDate = new Date(renewalDate);
    fromDate.setMonth(fromDate.getMonth() - 1);
    fromDate.setDate(fromDate.getDate() + 1);

    const billMonth = `${renewalDate.getFullYear()}-${String(
      renewalDate.getMonth() + 1
    ).padStart(2, "0")}`;
    const fromDateStr = fromDate.toISOString().split("T")[0];
    const toDateStr = renewalDate.toISOString().split("T")[0];

    // Calculate grand total
    const interiorTotal = (interior_items || []).reduce(
      (sum, i) => sum + Number(i.amount),
      0
    );
    const otherTotal = (other_items || []).reduce(
      (sum, i) => sum + Number(i.amount),
      0
    );
    const grandTotal = Number(base_amount) + interiorTotal + otherTotal;

    // Insert payment with status 'pending'
    const [paymentResult] = await pool.execute(
      `INSERT INTO payments
      (user_id, subscription_id, amount, status, created_at,
       bill_month, bill_from_date, bill_to_date, bill_note, sent_by_admin)
      VALUES (?, ?, ?, 'pending', NOW(), ?, ?, ?, ?, ?)`,
      [
        user_id,
        subId || null,
        grandTotal,
        billMonth,
        fromDateStr,
        toDateStr,
        bill_note || null,
        req.user.id,
      ]
    );

    const paymentId = paymentResult.insertId;

    // Insert monthly base item
    await pool.execute(
      `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
      VALUES (?, ?, 'monthly', 'Monthly Base', ?)`,
      [paymentId, user_id, base_amount]
    );

    // Insert interior items
    for (const item of interior_items || []) {
      await pool.execute(
        `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
        VALUES (?, ?, 'interior', ?, ?)`,
        [paymentId, user_id, item.name || "Interior Cleaning", item.amount]
      );
    }

    // Insert other items
    for (const item of other_items || []) {
      await pool.execute(
        `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
        VALUES (?, ?, 'other', ?, ?)`,
        [paymentId, user_id, item.name || "Other Service", item.amount]
      );
    }

    // Log admin action
    try {
      await pool.execute(
        `INSERT INTO activity_log (admin_id, action, created_at)
        VALUES (?, ?, NOW())`,
        [
          req.user.id,
          `Sent bill ₹${grandTotal} to user_id:${user_id} for ${billMonth}`,
        ]
      );
    } catch (logErr) {
      console.error("Activity log error (non-fatal):", logErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Bill sent to customer successfully",
      payment_id: paymentId,
      total: grandTotal,
      bill_period: { from: fromDateStr, to: toDateStr, month: billMonth },
    });
  } catch (error) {
    console.error("Create bill error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};

/* ═══════════════════════════════════════════════
   ADMIN — Edit Bill
   PATCH /api/admin/billing/:payment_id/edit
   ═══════════════════════════════════════════════ */
export const editBill = async (req, res) => {
  try {
    const { base_amount, interior_items, other_items, bill_note } = req.body;
    const paymentId = req.params.payment_id;

    // Recalculate grand total
    const interiorTotal = (interior_items || []).reduce(
      (sum, i) => sum + Number(i.amount),
      0
    );
    const otherTotal = (other_items || []).reduce(
      (sum, i) => sum + Number(i.amount),
      0
    );
    const grandTotal = Number(base_amount) + interiorTotal + otherTotal;

    // Update payment
    await pool.execute(
      `UPDATE payments
      SET amount = ?, admin_edited_amount = ?, bill_note = ?
      WHERE id = ?`,
      [grandTotal, grandTotal, bill_note || null, paymentId]
    );

    // Delete old billing items and re-insert
    await pool.execute(`DELETE FROM billing_items WHERE payment_id = ?`, [
      paymentId,
    ]);

    const [payment] = await pool.execute(
      `SELECT user_id FROM payments WHERE id = ?`,
      [paymentId]
    );
    const userId = payment[0].user_id;

    await pool.execute(
      `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
      VALUES (?, ?, 'monthly', 'Monthly Base', ?)`,
      [paymentId, userId, base_amount]
    );

    for (const item of interior_items || []) {
      await pool.execute(
        `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
        VALUES (?, ?, 'interior', ?, ?)`,
        [paymentId, userId, item.name || "Interior Cleaning", item.amount]
      );
    }

    for (const item of other_items || []) {
      await pool.execute(
        `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
        VALUES (?, ?, 'other', ?, ?)`,
        [paymentId, userId, item.name || "Other Service", item.amount]
      );
    }

    // Log
    try {
      await pool.execute(
        `INSERT INTO activity_log (admin_id, action, created_at)
        VALUES (?, ?, NOW())`,
        [req.user.id, `Edited bill #${paymentId} new total ₹${grandTotal}`]
      );
    } catch (logErr) {
      console.error("Activity log error (non-fatal):", logErr.message);
    }

    return res
      .status(200)
      .json({ success: true, message: "Bill updated", total: grandTotal });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message });
  }
};

/* ═══════════════════════════════════════════════
   ADMIN — Get Bill Breakdown
   GET /api/admin/billing/:payment_id/breakdown
   ═══════════════════════════════════════════════ */
export const getBillBreakdown = async (req, res) => {
  try {
    const [items] = await pool.execute(
      `SELECT item_type, item_name, amount
      FROM billing_items WHERE payment_id = ?
      ORDER BY id ASC`,
      [req.params.payment_id]
    );

    const [payment] = await pool.execute(
      `SELECT p.*, u.name, u.full_name, u.email
      FROM payments p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ?`,
      [req.params.payment_id]
    );

    return res.status(200).json({
      success: true,
      data: { payment: payment[0], items },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message });
  }
};

/* ═══════════════════════════════════════════════
   CUSTOMER — Get Unpaid Bills
   GET /api/customer/billing/unpaid
   ═══════════════════════════════════════════════ */
export const getUnpaidBills = async (req, res) => {
  try {
    const userId = req.user.id;

    // Only show bills admin explicitly sent AND not yet paid
    const [unpaidBills] = await pool.execute(
      `SELECT
        p.id AS payment_id,
        p.amount AS total,
        p.status,
        p.bill_month,
        p.bill_from_date AS from_date,
        p.bill_to_date AS to_date,
        p.bill_note,
        p.created_at AS bill_sent_at,
        s.plan_name,
        s.renewal_date,
        v.vehicle_number
      FROM payments p
      LEFT JOIN subscriptions s ON s.id = p.subscription_id
      LEFT JOIN vehicles v ON v.id = s.vehicle_id
      WHERE p.user_id = ?
      AND p.status IN ('pending', 'created')
      AND p.sent_by_admin IS NOT NULL
      ORDER BY p.created_at DESC`,
      [userId]
    );

    // Attach line items, vehicle billing breakdown, and addon services to each bill
    for (let bill of unpaidBills) {
      const [items] = await pool.execute(
        `SELECT item_type, item_name, amount
        FROM billing_items WHERE payment_id = ?
        ORDER BY id ASC`,
        [bill.payment_id]
      );
      bill.items = items;

      const [vehicle_billing] = await pool.execute(
        `SELECT v.id, v.vehicle_number, v.vehicle_model, v.vehicle_type,
                s.plan_name, s.monthly_price
         FROM vehicles v
         LEFT JOIN subscriptions s ON s.vehicle_id = v.id AND s.user_id = v.user_id AND s.status = 'active'
         WHERE v.user_id = ?
         ORDER BY v.created_at ASC`,
        [userId]
      );
      bill.vehicle_billing = vehicle_billing;

      const [addon_services] = await pool.execute(
        `SELECT a.id, a.service_type, a.amount,
                DATE_FORMAT(a.service_date, '%Y-%m-%d') as service_date,
                v.vehicle_number, v.vehicle_model
         FROM addon_services a
         LEFT JOIN vehicles v ON a.vehicle_id = v.id
         WHERE a.user_id = ?
         ORDER BY COALESCE(a.service_date, a.created_at) DESC`,
        [userId]
      );
      bill.addon_services = addon_services;
    }

    return res.status(200).json({ success: true, data: unpaidBills });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message });
  }
};

/* ═══════════════════════════════════════════════
   CUSTOMER — Create Razorpay Order for Bill
   POST /api/customer/billing/pay
   ═══════════════════════════════════════════════ */
export const payBill = async (req, res) => {
  try {
    const { payment_id, amount } = req.body;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `bill_${payment_id}_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: amount,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message });
  }
};

/* ═══════════════════════════════════════════════
   CUSTOMER — Verify Razorpay Payment for Bill
   POST /api/customer/billing/verify
   ═══════════════════════════════════════════════ */
export const verifyBillPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_id,
    } = req.body;

    // Verify Razorpay signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid payment signature" });
    }

    // Mark payment as captured
    await pool.execute(
      `UPDATE payments SET
        status = 'captured',
        razorpay_order_id = ?,
        razorpay_payment_id = ?,
        razorpay_signature = ?,
        payment_method = 'razorpay',
        paid_at = NOW()
      WHERE id = ?`,
      [razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id]
    );

    // Update subscription — new cycle starts from renewal_date
    // renewal_date shifts forward by 1 month
    await pool.execute(
      `UPDATE subscriptions
      SET
        start_date = renewal_date,
        renewal_date = DATE_ADD(renewal_date, INTERVAL 1 MONTH),
        status = 'active'
      WHERE id = (
        SELECT subscription_id FROM payments WHERE id = ?
      )`,
      [payment_id]
    );

    // Log
    try {
      const [paymentRow] = await pool.execute(
        `SELECT user_id FROM payments WHERE id = ?`,
        [payment_id]
      );
      await pool.execute(
        `INSERT INTO activity_log (admin_id, action, created_at)
        VALUES (1, ?, NOW())`,
        [
          `Customer user_id:${paymentRow[0].user_id} paid bill #${payment_id}`,
        ]
      );
    } catch (logErr) {
      console.error("Activity log error (non-fatal):", logErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Bill paid successfully. New cycle started.",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message });
  }
};

/* ═══════════════════════════════════════════════
   BOOKING — Confirm Subscription (No Payment)
   POST /api/booking/confirm
   ═══════════════════════════════════════════════ */
export const confirmBooking = async (req, res) => {
  try {
    const {
      vehicle_id,
      plan_name,
      services,
      monthly_price,
      preferred_time,
      start_date,
      renewal_date,
      address,
    } = req.body;

    const user_id = req.user.id;

    console.log("Creating subscription:", req.body);

    // Validate
    if (!vehicle_id || !monthly_price) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: vehicle_id, monthly_price",
      });
    }

    // Check if active subscription already exists for this vehicle
    const [existing] = await pool.execute(
      `SELECT id FROM subscriptions
      WHERE user_id = ? AND vehicle_id = ? AND status = 'active'`,
      [user_id, vehicle_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Active subscription already exists for this vehicle",
      });
    }

    // Safely handle preferred_time
    const validTimes = ["morning", "evening"];
    const safeTime = validTimes.includes(preferred_time)
      ? preferred_time
      : "morning";

    // Safely handle services
    let servicesJson;
    try {
      servicesJson = JSON.stringify(services || ["daily_wash"]);
    } catch {
      servicesJson = '["daily_wash"]';
    }

    const safeStartDate =
      start_date || new Date().toISOString().split("T")[0];
    const safeRenewalDate =
      renewal_date ||
      (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split("T")[0];
      })();

    // Create subscription with status 'active'
    const [result] = await pool.execute(
      `INSERT INTO subscriptions
      (user_id, vehicle_id, plan_name, services, monthly_price,
       preferred_time, start_date, renewal_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        user_id,
        vehicle_id,
        plan_name || "Daily Wash",
        servicesJson,
        monthly_price,
        safeTime,
        safeStartDate,
        safeRenewalDate,
      ]
    );

    const subscriptionId = result.insertId;

    // Update user address if provided
    if (address) {
      await pool.execute(`UPDATE users SET address = ? WHERE id = ?`, [
        address,
        user_id,
      ]);
    }

    // Fetch created subscription with vehicle info
    const [subscription] = await pool.execute(
      `SELECT
        s.*,
        v.vehicle_number,
        v.vehicle_type,
        v.vehicle_model,
        u.name,
        u.full_name,
        u.email,
        u.phone
      FROM subscriptions s
      JOIN vehicles v ON v.id = s.vehicle_id
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?`,
      [subscriptionId]
    );

    return res.status(200).json({
      success: true,
      message: "Subscription created successfully",
      subscription: subscription[0],
    });
  } catch (error) {
    console.error("Booking confirm error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      sqlMessage: error.sqlMessage || null,
    });
  }
};
