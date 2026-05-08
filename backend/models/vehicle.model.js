// backend/models/vehicle.model.js

import pool from "../config/db.js";

export const createVehicle = async (vehicle_number, vehicle_type, user_id) => {
  const [result] = await pool.execute(
    "INSERT INTO vehicles (vehicle_number, vehicle_type, user_id) VALUES (?, ?, ?)",
    [vehicle_number, vehicle_type, user_id]
  );
  return result.insertId;
};

export const getVehiclesByCustomerId = async (user_id) => {
  const [rows] = await pool.execute(
    "SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};

export const getVehiclesByWasherId = async (washer_id) => {
  const [rows] = await pool.execute(
    "SELECT v.*, u.name as customer_name, u.email as customer_email FROM vehicles v " +
    "JOIN users u ON v.user_id = u.id " +
    "JOIN subscriptions s ON s.vehicle_id = v.id AND s.washer_id = ? AND s.status = 'active' " +
    "ORDER BY v.created_at DESC",
    [washer_id]
  );
  return rows;
};

export const getAllVehicles = async () => {
  const [rows] = await pool.execute(
    "SELECT v.*, u.name as customer_name, u.email as customer_email " +
    "FROM vehicles v " +
    "LEFT JOIN users u ON v.user_id = u.id " +
    "ORDER BY v.created_at DESC"
  );
  return rows;
};

export const getVehicleById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT v.*, u.name as customer_name, u.email as customer_email " +
    "FROM vehicles v " +
    "LEFT JOIN users u ON v.user_id = u.id " +
    "WHERE v.id = ?",
    [id]
  );
  return rows[0];
};

export const updateVehicleStatus = async (id, status, washer_id = null) => {
  // Vehicle no longer has status/washer_id columns — update subscription instead
  if (washer_id) {
    await pool.execute(
      "UPDATE subscriptions SET washer_id = ? WHERE vehicle_id = ? AND status = 'active'",
      [washer_id, id]
    );
  }
  return true;
};

export const assignVehicleToWasher = async (vehicle_id, washer_id, assigned_by_admin) => {
  // Update active subscriptions for this vehicle
  await pool.execute(
    "UPDATE subscriptions SET washer_id = ? WHERE vehicle_id = ? AND status = 'active'",
    [washer_id, vehicle_id]
  );
};

export const deleteVehicle = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM vehicles WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};

export const getAvailableVehicles = async () => {
  const [rows] = await pool.execute(
    "SELECT v.*, u.name as customer_name, u.email as customer_email " +
    "FROM vehicles v " +
    "JOIN users u ON v.user_id = u.id " +
    "ORDER BY v.created_at DESC"
  );
  return rows;
};

// Legacy functions for backward compatibility
export const addVehicle = createVehicle;
export const getUserVehicles = getVehiclesByCustomerId;