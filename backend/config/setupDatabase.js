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
        frequency VARCHAR(50) DEFAULT 'daily',
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
        started_at TIMESTAMP NULL,
        washed_at TIMESTAMP NULL,
        wash_duration_minutes INT,
        washer_note TEXT,
        issue_type VARCHAR(100),
        issue_note TEXT,
        verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);
    console.log("✅ Wash records table ready");

    // 6. Settings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log("✅ Settings table ready");

    // 7. Activity log table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT,
        action TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    console.log("✅ Activity log table ready");

    // 8. Notification Preferences table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        setting_key VARCHAR(50) NOT NULL,
        setting_value VARCHAR(10) DEFAULT 'true',
        UNIQUE KEY unique_user_setting (user_id, setting_key),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log("✅ Notification preferences table ready");

    // 9. Billing items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS billing_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        payment_id INT NOT NULL,
        user_id INT NOT NULL,
        item_type ENUM('monthly', 'interior', 'other') NOT NULL,
        item_name VARCHAR(200) DEFAULT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log("✅ Billing items table ready");
    console.log("✅ All 9 tables created and ready");

    // Migrations — add new columns to existing tables (safe to re-run)
    const migrations = [
      "ALTER TABLE wash_records ADD COLUMN verified BOOLEAN DEFAULT FALSE",
      "ALTER TABLE wash_records ADD COLUMN verified_at TIMESTAMP NULL",
      "ALTER TABLE subscriptions ADD COLUMN frequency VARCHAR(50) DEFAULT 'daily'",
      "ALTER TABLE wash_records MODIFY COLUMN status ENUM('pending', 'washing', 'completed', 'skipped', 'issue_reported') DEFAULT 'pending'",
      "ALTER TABLE subscriptions MODIFY COLUMN status ENUM('active','paused','cancelled','pending') DEFAULT 'pending'",
      // Billing columns on payments table
      "ALTER TABLE payments ADD COLUMN bill_month VARCHAR(20) DEFAULT NULL",
      "ALTER TABLE payments ADD COLUMN bill_from_date DATE DEFAULT NULL",
      "ALTER TABLE payments ADD COLUMN bill_to_date DATE DEFAULT NULL",
      "ALTER TABLE payments ADD COLUMN bill_note TEXT DEFAULT NULL",
      "ALTER TABLE payments ADD COLUMN sent_by_admin INT DEFAULT NULL",
      "ALTER TABLE payments ADD COLUMN admin_edited_amount DECIMAL(10,2) DEFAULT NULL",
      // Manual stats override columns on users table
      "ALTER TABLE users ADD COLUMN manual_total_washes INT DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN manual_this_month INT DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN manual_recent_wash DATE DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN manual_active_vehicles INT DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN manual_days_left INT DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN manual_active_subscriptions INT DEFAULT NULL",
    ];
    for (const sql of migrations) {
      try { await pool.execute(sql); } catch (e) {
        if (e.code !== "ER_DUP_FIELDNAME") console.error("Migration skip:", e.message);
      }
    }

    // Drop unused columns reset_code and reset_expires from users table (safe to re-run)
    const dropColumns = [
      "ALTER TABLE users DROP COLUMN reset_code",
      "ALTER TABLE users DROP COLUMN reset_expires"
    ];
    for (const sql of dropColumns) {
      try {
        await pool.execute(sql);
        console.log(`✅ Applied drop column migration: ${sql}`);
      } catch (e) {
        // Ignore if columns were already dropped (ER_CANT_DROP_FIELD_OR_KEY)
        if (e.code !== "ER_CANT_DROP_FIELD_OR_KEY" && e.code !== "ER_CANT_DROP_FIELD") {
          console.error("Drop column migration skip:", e.message);
        }
      }
    }

    console.log("✅ Migrations applied");

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