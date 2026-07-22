import express from "express";
import { getPublicSettings } from "../controllers/publicSettings.controller.js";

const router = express.Router();

router.get("/settings", getPublicSettings);

export default router;
