// backend/models/user.model.js

import pool from "../config/db.js";

export const createUser = async (name, email, hashedPassword, role = "customer") => {
  const [result] = await pool.execute(
    "INSERT INTO users (name, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, 'active')",
    [name, name, email, hashedPassword, role]
  );
  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};

export const getUserById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT id, name, full_name, email, role, phone, status FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
};

export const getAllUsers = async () => {
  const [rows] = await pool.execute(
    "SELECT id, name, full_name, email, role, phone, status, created_at FROM users ORDER BY created_at DESC"
  );
  return rows;
};

export const getUsersByRole = async (role) => {
  const [rows] = await pool.execute(
    "SELECT id, name, full_name, email, phone, created_at FROM users WHERE role = ? ORDER BY created_at DESC",
    [role]
  );
  return rows;
};

export const updateUserRole = async (id, role) => {
  const [result] = await pool.execute(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, id]
  );
  return result.affectedRows > 0;
};

export const deleteUser = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM users WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};