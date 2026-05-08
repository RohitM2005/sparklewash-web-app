// backend/cron/subscriptionRenewal.cron.js

import cron from "node-cron";
import pool from "../config/db.js";
import { renewSubscription } from "../services/subscription.service.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Running Subscription Renewal Job...");

  const [rows] = await pool.execute(
    "SELECT * FROM subscriptions WHERE renewal_date = CURDATE() AND status='active'"
  );

  for (let subscription of rows) {
    await renewSubscription(subscription);
    console.log(`Renewed Subscription ID: ${subscription.id}`);
  }
});