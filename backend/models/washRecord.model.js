// backend/models/washRecord.model.js

import pool from "../config/db.js";

export const createWashRecord = async (
  vehicle_id,
  washer_id,
  status = "pending"
) => {
  const [result] = await pool.execute(
    "INSERT INTO wash_records (vehicle_id, washer_id, status) VALUES (?, ?, ?)",
    [vehicle_id, washer_id, status]
  );
  return result.insertId;
};

export const getUserWashHistory = async (user_id) => {
  const [rows] = await pool.execute(
    `SELECT wr.*
     FROM wash_records wr
     JOIN vehicles v ON wr.vehicle_id = v.id
     WHERE v.user_id = ?`,
    [user_id]
  );
  return rows;
};