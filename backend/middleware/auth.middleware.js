// backend/middleware/auth.middleware.js

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalise the user payload for downstream middleware/controllers
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      roles: decoded.roles || (decoded.role ? [decoded.role] : []),
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
};