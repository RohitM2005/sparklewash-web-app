// backend/routes/admin.auth.routes.js

import express from "express";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

// Admin login with role validation
router.post("/login", (req, res, next) => {
  // Add role="admin" to request body for validation
  req.body.role = "admin";
  return login(req, res, next);
});

export default router;
