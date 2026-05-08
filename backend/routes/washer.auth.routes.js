// backend/routes/washer.auth.routes.js

import express from "express";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

// Washer login with role validation
router.post("/login", (req, res, next) => {
  // Add role="washer" to request body for validation
  req.body.role = "washer";
  return login(req, res, next);
});

export default router;
