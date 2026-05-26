// controllers/auth.controller.js
//
// Handles user registration, login, and current-user profile.

import { createUser, findUserByEmail, getUserById } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "ajayparale9@gmail.com";

// Build the effective roles list for a user record
const buildUserRoles = (user) => {
  const roles = new Set();

  if (user.role) {
    roles.add(user.role);
  }

  if (user.email === OWNER_EMAIL) {
    // Website owner gets both admin and washer capabilities
    roles.add("admin");
    roles.add("washer");
  }

  if (roles.size === 0) {
    roles.add("customer");
  }

  return Array.from(roles);
};

const toSafeUser = (user) => {
  const roles = buildUserRoles(user);
  const primaryRole = roles[0] || "customer";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: primaryRole,
    roles,
  };
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await hashPassword(password);

    // New users are customers by default; owner is promoted via roles logic
    const userId = await createUser(name, email, hashed);

    res.status(201).json({ message: "User Registered", userId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "User already exists" });
    }

    console.error("Register error:", err);
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log("Login attempt:", { email, hasPassword: !!password, role });

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (!user.password) {
      return res.status(500).json({ success: false, message: "User password is missing" });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // Role validation
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This account is registered as ${user.role}, not ${role}.`
      });
    }

    const safeUser = toSafeUser(user);
    const token = generateToken(safeUser);

    res.json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const safeUser = toSafeUser(user);
    res.json(safeUser);
  } catch (err) {
    console.error("Get current user error:", err);
    res
      .status(500)
      .json({ message: "Could not load current user", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    const [result] = await pool.execute(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updatedUser = await getUserById(req.user.id);
    const safeUser = toSafeUser(updatedUser);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: safeUser
    });
  } catch (err) {
    console.error("Update profile error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    res
      .status(500)
      .json({ success: false, message: "Profile update failed", error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Current password and new password are required" });
    }

    // Query password directly — getUserById doesn't return it
    const [rows] = await pool.execute(
      "SELECT id, password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    if (!user.password) {
      return res.status(500).json({ success: false, message: "User password is missing" });
    }

    const match = await comparePassword(currentPassword, user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const [result] = await pool.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ success: false, message: "Failed to update password" });
    }

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, message: "Password change failed", error: err.message });
  }
};

// POST /api/auth/reset-password — public endpoint for forgot-password flow
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Email and new password are required." });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 8 characters." });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const [result] = await pool.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ success: false, message: "Failed to update password." });
    }

    console.log("✅ Password updated for:", email);
    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ success: false, message: "Password reset failed", error: err.message });
  }
};

