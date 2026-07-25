import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const newPassword = "Admin@5001";

async function updateAdminPassword() {
  const hash = await bcrypt.hash(newPassword, 10);
  
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sparklewash",
    port: process.env.DB_PORT || 3306,
  });

  const [result] = await conn.execute(
    "UPDATE users SET password = ? WHERE role = 'admin'",
    [hash]
  );

  console.log(`✅ Updated ${result.affectedRows} admin account(s) to new password: ${newPassword}`);
  await conn.end();
}

updateAdminPassword().catch(err => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
