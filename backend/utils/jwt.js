// backend/utils/jwt.js
//
// Generates JWTs for authenticated users.

import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  // user is expected to be a "safe" user object (no password)
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    roles: user.roles,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};