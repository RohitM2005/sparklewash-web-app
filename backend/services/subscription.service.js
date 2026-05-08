// backend/services/subscription.service.js

import pool from "../config/db.js";
import { addMonths } from "../utils/date.utils.js";

export const renewSubscription = async (subscription) => {
  const newRenewalDate = addMonths(subscription.renewal_date, 1);

  await pool.execute(
    "UPDATE subscriptions SET renewal_date=? WHERE id=?",
    [newRenewalDate, subscription.id]
  );

  return newRenewalDate;
};