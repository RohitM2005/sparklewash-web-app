-- ================================================================
-- SparkleWash — Complete Database Schema
-- Run this file in phpMyAdmin to set up/reset the database
-- ================================================================

CREATE DATABASE IF NOT EXISTS sparklewash;
USE sparklewash;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  role ENUM('customer','admin','washer') DEFAULT 'customer',
  status ENUM('active','suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  vehicle_number VARCHAR(20) NOT NULL,
  vehicle_type ENUM('micro','sedan','mini_suv','suv') DEFAULT 'sedan',
  vehicle_model VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  plan_name VARCHAR(100) DEFAULT 'Daily Wash',
  services JSON DEFAULT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  preferred_time ENUM('morning','afternoon','evening') DEFAULT 'morning',
  frequency VARCHAR(50) DEFAULT 'daily',
  washer_id INT DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  renewal_date DATE DEFAULT NULL,
  status ENUM('active','paused','cancelled','pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (washer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Wash Records
CREATE TABLE IF NOT EXISTS wash_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subscription_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  user_id INT NOT NULL,
  washer_id INT DEFAULT NULL,
  wash_date DATE NOT NULL,
  status ENUM('pending','washing','completed','skipped','issue_reported') DEFAULT 'pending',
  washer_note TEXT DEFAULT NULL,
  wash_duration_minutes INT DEFAULT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  photo_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (washer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Payments
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  subscription_id INT DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  razorpay_order_id VARCHAR(100) DEFAULT NULL,
  razorpay_payment_id VARCHAR(100) DEFAULT NULL,
  razorpay_signature VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP NULL DEFAULT NULL,
  bill_month VARCHAR(20) DEFAULT NULL,
  bill_from_date DATE DEFAULT NULL,
  bill_to_date DATE DEFAULT NULL,
  bill_note TEXT DEFAULT NULL,
  sent_by_admin INT DEFAULT NULL,
  admin_edited_amount DECIMAL(10,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Billing Items
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
) ENGINE=InnoDB;

-- 7. Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT DEFAULT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  wash_reminders BOOLEAN DEFAULT TRUE,
  subscription_alerts BOOLEAN DEFAULT TRUE,
  promotions BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Password OTPs
CREATE TABLE IF NOT EXISTS password_otps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

