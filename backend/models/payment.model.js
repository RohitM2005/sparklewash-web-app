// backend/models/payment.model.js

import pool from "../config/db.js";

export const createPayment = async (
  user_id,
  subscription_id,
  razorpay_order_id,
  amount,
  status = "pending"
) => {
  const [result] = await pool.execute(
    `INSERT INTO payments 
     (user_id, subscription_id, razorpay_order_id, amount, status)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, subscription_id, razorpay_order_id, amount, status]
  );
  return result.insertId;
};

export const updatePaymentStatus = async (
  razorpay_order_id,
  status,
  razorpay_payment_id
) => {
  await pool.execute(
    `UPDATE payments 
     SET status = ?, razorpay_payment_id = ?
     WHERE razorpay_order_id = ?`,
    [status, razorpay_payment_id, razorpay_order_id]
  );
};