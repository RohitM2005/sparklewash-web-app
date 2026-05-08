// backend/routes/vehicle.routes.js

import express from "express";
import { createVehicle, getVehicles } from "../controllers/vehicle.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createVehicle);
router.get("/", protect, getVehicles);

export default router;