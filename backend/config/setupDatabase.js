import pool from "./db.js";
import { hashPassword } from "../utils/hash.js";

const setupDatabase = async () => {
  try {
    console.log("⏳ Setting up database tables...");

    // 1. Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100),
        full_name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15),
        password VARCHAR(255) NOT NULL,
        role ENUM('customer','admin','washer') DEFAULT 'customer',
        address TEXT,
        status ENUM('active','suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log("✅ Users table ready");

    // 2. Vehicles table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        vehicle_number VARCHAR(20) NOT NULL,
        vehicle_model VARCHAR(100),
        vehicle_type ENUM('micro','sedan','mini_suv','suv') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log("✅ Vehicles table ready");

    // 3. Subscriptions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        vehicle_id INT,
        washer_id INT,
        plan_name VARCHAR(50),
        services JSON,
        monthly_price DECIMAL(10,2),
        preferred_time ENUM('morning','afternoon','evening'),
        status ENUM('active','paused','cancelled','pending') DEFAULT 'pending',
        start_date DATE,
        renewal_date DATE,
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log("✅ Subscriptions table ready");

    // 4. Payments table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        subscription_id INT,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('razorpay','cash') DEFAULT 'razorpay',
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        razorpay_signature VARCHAR(500),
        status ENUM('paid','pending','failed') DEFAULT 'pending',
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);
    console.log("✅ Payments table ready");

    // 5. Wash records table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS wash_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subscription_id INT,
        vehicle_id INT,
        washer_id INT,
        user_id INT NOT NULL,
        wash_date DATE NOT NULL,
        status ENUM('pending','washing','completed','skipped','issue_reported') DEFAULT 'pending',
        before_photo_url VARCHAR(500),
        after_photo_url VARCHAR(500),
        started_at TIMESTAMP NULL,
        washed_at TIMESTAMP NULL,
        wash_duration_minutes INT,
        washer_note TEXT,
        issue_type VARCHAR(100),
        issue_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);
    console.log("✅ Wash records table ready");
    console.log("✅ All 5 tables created and ready");

    // Seed default accounts
    await seedDefaultAccounts();

  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    throw error;
  }
};

async function seedDefaultAccounts() {
  try {
    const [existingAdmins] = await pool.execute(
      "SELECT id FROM users WHERE email IN ('ajayparale9@gmail.com', 'sparklewash5001@gmail.com') LIMIT 1"
    );

    if (existingAdmins.length > 0) {
      console.log("👑 Default accounts already exist");
      return;
    }

    const adminPass = await hashPassword("Admin@123");
    const washerPass = await hashPassword("Washer@123");

    await pool.execute(
      `INSERT IGNORE INTO users
        (name, full_name, email, phone, password, role, status)
       VALUES
        ('Ajay Parale', 'Ajay Parale', 'ajayparale9@gmail.com', '9309225001', ?, 'admin', 'active'),
        ('SparkleWash Owner', 'SparkleWash Owner', 'sparklewash5001@gmail.com', '9309225001', ?, 'admin', 'active'),
        ('Ravi Kumar', 'Ravi Kumar', 'washer1@sparklewash.com', '9000000001', ?, 'washer', 'active'),
        ('Suresh Patil', 'Suresh Patil', 'washer2@sparklewash.com', '9000000002', ?, 'washer', 'active')`,
      [adminPass, adminPass, washerPass, washerPass]
    );

    console.log("✅ Default accounts seeded");
  } catch (error) {
    // Ignore duplicate key errors
    if (error.code !== "ER_DUP_ENTRY") {
      console.error("Seed error:", error.message);
    }
  }
}

export default setupDatabase;