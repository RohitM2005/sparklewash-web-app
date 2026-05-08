// backend/config/db.js

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "sparklewash";
const DB_PORT = process.env.DB_PORT || 3306;

console.log("🔍 Database Connection Config:", {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD ? "***" : "empty",
  database: DB_NAME,
  port: DB_PORT,
});

// Ensure the database exists before creating the pool.
// This avoids "Unknown database" errors on fresh installs.
try {
  console.log("🔧 Bootstrapping database...");
  const bootstrap = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
  });
  
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  console.log(`✅ Database '${DB_NAME}' ensured to exist`);
  await bootstrap.end();
} catch (error) {
  console.error("❌ Failed to bootstrap database:", error.message);
  console.error("Full error:", error);
  // allow app to continue; subsequent queries will error with details
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log("✅ MySQL Connected");
    connection.release();
  })
  .catch(err => {
    console.error("❌ DB Failed:", err.message);
    process.exit(1);
  });

export default pool;