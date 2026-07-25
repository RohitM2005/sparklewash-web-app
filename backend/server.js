import app from "./app.js";
import dotenv from "dotenv";
import setupDatabase from "./config/setupDatabase.js";
import "./cron/subscriptionRenewal.cron.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize database tables, then start the server
setupDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});