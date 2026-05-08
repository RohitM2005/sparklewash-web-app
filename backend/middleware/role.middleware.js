// backend/middleware/role.middleware.js

import jwt from "jsonwebtoken";

// Role-based middleware factory
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: "Access token required" 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required role: ${allowedRoles.join(" or ")}, Current role: ${decoded.role}` 
        });
      }

      // Attach user info to request
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid or expired token" 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: "Server error during authentication" 
      });
    }
  };
};

// Specific role middlewares
export const requireAdmin = requireRole(['admin']);
export const requireWasher = requireRole(['washer']);
export const requireCustomer = requireRole(['customer']);
export const requireAdminOrWasher = requireRole(['admin', 'washer']);
export const requireCustomerOrWasher = requireRole(['customer', 'washer']);

// Enhanced middleware with user data fetching
export const requireRoleWithUser = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: "Access token required" 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required role: ${allowedRoles.join(" or ")}, Current role: ${decoded.role}` 
        });
      }

      // Fetch fresh user data from database
      const { getUserById } = await import("../models/user.model.js");
      const user = await getUserById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      // Attach user info to request
      req.user = { ...decoded, ...user };
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid or expired token" 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: "Server error during authentication" 
      });
    }
  };
};

// Enhanced specific role middlewares with user data
export const requireAdminWithUser = requireRoleWithUser(['admin']);
export const requireWasherWithUser = requireRoleWithUser(['washer']);
export const requireCustomerWithUser = requireRoleWithUser(['customer']);

// Legacy middleware for backward compatibility
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);

    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access Denied - Insufficient Permission",
      });
    }

    next();
  };
};