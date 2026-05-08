// backend/models/subscription.model.js

import pool from "../config/db.js";

export const createSubscription = async (
  user_id,
  plan_name,
  start_date,
  renewal_date,
  status = "active"
) => {
  const [result] = await pool.execute(
    `INSERT INTO subscriptions 
     (user_id, plan_name, start_date, renewal_date, status) 
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, plan_name, start_date, renewal_date, status]
  );
  return result.insertId;
};

export const getUserSubscription = async (user_id) => {
  const [rows] = await pool.execute(
    "SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'",
    [user_id]
  );
  return rows[0];
};