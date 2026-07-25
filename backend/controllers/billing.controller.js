// controllers/billing.controller.js
// Admin billing (create/send/edit) + Customer billing (view unpaid, pay, verify)

import pool from "../config/db.js";
import { syncUserData } from "../utils/syncCustomerData.js";
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
    const { amount, base_amount, plan_name, status, payment_method, bill_note, interior_items, other_items } = req.body;
    const paymentId = req.params.payment_id || req.params.id;

    // Fetch existing payment to validate existence
    const [existing] = await pool.execute(`SELECT * FROM payments WHERE id = ?`, [paymentId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }
    const payRow = existing[0];

    // Determine target amount
    let finalAmount;
    if (amount !== undefined && amount !== null && amount !== "" && !isNaN(Number(amount))) {
      finalAmount = Number(amount);
    } else if (base_amount !== undefined && base_amount !== null && base_amount !== "" && !isNaN(Number(base_amount))) {
      const interiorTotal = (interior_items || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
      const otherTotal = (other_items || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
      finalAmount = Number(base_amount) + interiorTotal + otherTotal;
    } else {
      finalAmount = Number(payRow.amount);
    }

    // Validate amount > 0
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ success: false, error: "Payment amount must be greater than 0" });
    }

    const userId = payRow.user_id;
    const subId = payRow.subscription_id;
    const newStatus = status || payRow.status || 'pending';
    const newMethod = payment_method || payRow.payment_method || 'razorpay';
    const newNote = bill_note !== undefined ? bill_note : payRow.bill_note;

    let paidAt = payRow.paid_at;
    if (['paid', 'captured', 'success'].includes(newStatus) && !paidAt) {
      paidAt = new Date();
    } else if (newStatus === 'pending') {
      paidAt = null;
    }

    // Update payment record in database
    await pool.execute(
      `UPDATE payments
       SET amount = ?, admin_edited_amount = ?, status = ?, payment_method = ?, bill_note = ?, paid_at = ?
       WHERE id = ?`,
      [finalAmount, finalAmount, newStatus, newMethod, newNote, paidAt, paymentId]
    );

    // Update plan_name on subscription if provided
    if (plan_name && subId) {
      await pool.execute(`UPDATE subscriptions SET plan_name = ? WHERE id = ?`, [plan_name, subId]);
    }

    // Delete and re-insert billing_items to keep line item breakdown in sync
    await pool.execute(`DELETE FROM billing_items WHERE payment_id = ?`, [paymentId]);

    const baseItemAmount = base_amount !== undefined && base_amount !== null && !isNaN(Number(base_amount)) ? Number(base_amount) : finalAmount;
    await pool.execute(
      `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
       VALUES (?, ?, 'monthly', ?, ?)`,
      [paymentId, userId, plan_name || 'Monthly Base', baseItemAmount]
    );

    for (const item of interior_items || []) {
      if (item.amount > 0) {
        await pool.execute(
          `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
           VALUES (?, ?, 'interior', ?, ?)`,
          [paymentId, userId, item.name || "Interior Cleaning", item.amount]
        );
      }
    }

    for (const item of other_items || []) {
      if (item.amount > 0) {
        await pool.execute(
          `INSERT INTO billing_items (payment_id, user_id, item_type, item_name, amount)
           VALUES (?, ?, 'other', ?, ?)`,
          [paymentId, userId, item.name || "Other Service", item.amount]
        );
      }
    }

    // Log admin action
    try {
      await pool.execute(
        `INSERT INTO activity_log (admin_id, action, created_at)
         VALUES (?, ?, NOW())`,
        [req.user.id, `Edited bill #${paymentId} new total ₹${finalAmount}`]
      );
    } catch (logErr) {
      console.error("Activity log error (non-fatal):", logErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      total: finalAmount,
      payment: {
        id: Number(paymentId),
        amount: finalAmount,
        status: newStatus,
        payment_method: newMethod,
        bill_note: newNote,
        plan_name: plan_name || payRow.plan_name
      }
    });
  } catch (error) {
    console.error("Edit payment error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to update payment" });
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

    // Check if payment is already marked as paid (Idempotency / Duplicate protection)
    const [existingPayment] = await pool.execute(
      `SELECT id, status FROM payments WHERE id = ?`,
      [payment_id]
    );

    if (existingPayment.length > 0 && ['paid', 'captured', 'success'].includes(existingPayment[0].status)) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified and updated.",
      });
    }

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

    // Mark payment as paid
    await pool.execute(
      `UPDATE payments SET
        status = 'paid',
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
          `Customer user_id:${paymentRow[0]?.user_id} paid bill #${payment_id}`,
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
   CUSTOMER & ADMIN — Get Invoice Details
   GET /api/customer/billing/invoice/:payment_id
   ═══════════════════════════════════════════════ */
export const getInvoiceDetails = async (req, res) => {
  try {
    const paymentId = req.params.payment_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch payment with user info
    const [paymentRows] = await pool.execute(
      `SELECT p.*,
              u.name, u.full_name, u.email, u.phone, u.address,
              s.plan_name, s.start_date, s.renewal_date, s.monthly_price
       FROM payments p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN subscriptions s ON s.id = p.subscription_id
       WHERE p.id = ?`,
      [paymentId]
    );

    if (!paymentRows.length) {
      return res.status(404).json({ success: false, error: "Invoice not found" });
    }

    const pay = paymentRows[0];

    // Access control: customer can only view their own invoice
    if (userRole !== 'admin' && pay.user_id !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized access to invoice" });
    }

    // Fetch vehicles owned by customer with their subscription details
    const [vehicles] = await pool.execute(
      `SELECT v.id, v.vehicle_number, v.vehicle_model, v.vehicle_type,
              s.plan_name, s.monthly_price,
              w.name as washer_name, w.phone as washer_phone
       FROM vehicles v
       LEFT JOIN subscriptions s ON s.vehicle_id = v.id AND s.user_id = v.user_id
       LEFT JOIN users w ON s.washer_id = w.id
       WHERE v.user_id = ?
       ORDER BY v.created_at ASC`,
      [pay.user_id]
    );

    // Fetch line items from billing_items table
    const [billingItems] = await pool.execute(
      `SELECT item_type, item_name, amount
       FROM billing_items
       WHERE payment_id = ?
       ORDER BY id ASC`,
      [paymentId]
    );

    // Fetch add-on services for customer
    const [addonServices] = await pool.execute(
      `SELECT a.id, a.service_type, a.amount,
              DATE_FORMAT(a.service_date, '%Y-%m-%d') as service_date,
              v.vehicle_number, v.vehicle_model
       FROM addon_services a
       LEFT JOIN vehicles v ON a.vehicle_id = v.id
       WHERE a.user_id = ?
       ORDER BY COALESCE(a.service_date, a.created_at) DESC`,
      [pay.user_id]
    );

    // Calculate itemized totals
    const vehiclePlansTotal = vehicles.reduce((sum, v) => sum + Number(v.monthly_price || 0), 0);
    const addonsTotal = addonServices.reduce((sum, a) => sum + Number(a.amount || 0), 0);

    const washerItem = billingItems.find(i => (i.item_name || "").toLowerCase().includes("washer"));
    const washerCharge = washerItem ? Number(washerItem.amount || 0) : 0;

    const baseAmount = vehiclePlansTotal > 0 ? vehiclePlansTotal : Number(pay.amount || 0);
    const grandTotal = Number(pay.amount || 0);

    const year = pay.created_at ? new Date(pay.created_at).getFullYear() : new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(pay.id).padStart(5, '0')}`;

    return res.status(200).json({
      success: true,
      invoice: {
        invoice_number: invoiceNumber,
        payment_id: pay.id,
        status: pay.status,
        payment_method: pay.payment_method || 'razorpay',
        razorpay_order_id: pay.razorpay_order_id || 'N/A',
        razorpay_payment_id: pay.razorpay_payment_id || 'N/A',
        created_at: pay.created_at,
        paid_at: pay.paid_at,
        bill_month: pay.bill_month,
        bill_from_date: pay.bill_from_date,
        bill_to_date: pay.bill_to_date,
        bill_note: pay.bill_note,

        // Customer Info
        customer: {
          id: pay.user_id,
          name: pay.full_name || pay.name,
          email: pay.email,
          phone: pay.phone,
          address: pay.address || "Address not provided",
        },

        // Breakdown Data
        vehicles,
        billing_items: billingItems,
        addon_services: addonServices,

        // Totals
        vehicle_plans_total: baseAmount,
        addons_total: addonsTotal,
        washer_charge: washerCharge,
        subtotal: grandTotal,
        tax: 0,
        discount: 0,
        grand_total: grandTotal,
        amount_paid: ['paid', 'captured', 'success'].includes(pay.status) ? grandTotal : 0,
      }
    });
  } catch (error) {
    console.error("Get invoice details error:", error);
    return res.status(500).json({ success: false, error: error.message });
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

    // Update user address and phone if provided
    const userPhone = req.body.phone || req.body.customer_phone || req.body.phone_number;
    const userName = req.body.full_name || req.body.customer_name;
    await syncUserData(user_id, {
      name: userName,
      full_name: userName,
      phone: userPhone,
      address: address,
    });

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
