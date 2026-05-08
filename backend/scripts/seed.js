// backend/scripts/seed.js
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const seed = async () => {
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const washerPass = await bcrypt.hash("Washer@123", 10);

  // Seed admin users
  await pool.query(`
    INSERT IGNORE INTO users (name, full_name, email, phone, password, role, status) VALUES
    ('Ajay Parale', 'Ajay Parale', 'ajayparale9@gmail.com', '9309225001', ?, 'admin', 'active'),
    ('SparkleWash Owner', 'SparkleWash Owner', 'sparklewash5001@gmail.com', '9309225001', ?, 'admin', 'active')
  `, [adminPass, adminPass]);

  // Seed washers table
  await pool.query(`
    INSERT IGNORE INTO washers (full_name, email, phone, password, area, status) VALUES
    ('Ravi Kumar', 'washer1@sparklewash.com', '9000000001', ?, 'Warje', 'active'),
    ('Suresh Patil', 'washer2@sparklewash.com', '9000000002', ?, 'Kothrud', 'active')
  `, [washerPass, washerPass]);

  // Also add washers to users table so they can login via auth system
  await pool.query(`
    INSERT IGNORE INTO users (name, full_name, email, phone, password, role, status) VALUES
    ('Ravi Kumar', 'Ravi Kumar', 'washer1@sparklewash.com', '9000000001', ?, 'washer', 'active'),
    ('Suresh Patil', 'Suresh Patil', 'washer2@sparklewash.com', '9000000002', ?, 'washer', 'active')
  `, [washerPass, washerPass]);

  console.log("✅ Seeded successfully");
  console.log("Admin 1:  ajayparale9@gmail.com     / Admin@123");
  console.log("Admin 2:  sparklewash5001@gmail.com  / Admin@123");
  console.log("Washer 1: washer1@sparklewash.com   / Washer@123 (Warje)");
  console.log("Washer 2: washer2@sparklewash.com   / Washer@123 (Kothrud)");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
