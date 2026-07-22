// controllers/customerDashboard.controller.js
import pool from "../config/db.js";

// Helper to load current system pricing from settings DB
async function getDynamicDbPrices() {
  try {
    const [rows] = await pool.execute(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'price_%'"
    );
    const m = {};
    rows.forEach(r => { m[r.setting_key] = Number(r.setting_value); });
    return {
      basePrices: {
        micro: m.price_micro_daily || 999,
        sedan: m.price_sedan_daily || 1199,
        mini_suv: m.price_mini_suv_daily || 1199,
        suv: m.price_suv_daily || 1399,
      },
      interiorPrice: m.price_interior_cleaning || 300,
    };
  } catch {
    return {
      basePrices: { micro: 999, sedan: 1199, mini_suv: 1199, suv: 1399 },
      interiorPrice: 300,
    };
  }
}

// ── Compute urgency tier ──────────────────────────────────────────────────────
function getUrgency(daysLeft) {
  if (daysLeft <= 6)  return "red";
  if (daysLeft <= 29) return "yellow";
  return "green";
}

// ── Parse services JSON and return { addons[], basePrice, totalPrice } ────────
function parseServicesBreakdown(servicesRaw, vehicleType, dbPricing) {
  const basePrices = dbPricing?.basePrices || { micro: 999, sedan: 1199, mini_suv: 1199, suv: 1399 };
  const interiorPrice = dbPricing?.interiorPrice || 300;
  const basePrice = basePrices[vehicleType] || basePrices.sedan || 1199;

  const addonCatalog = {
    interior:            { name: "Interior Cleaning",   price: interiorPrice },
    interior_cleaning:   { name: "Interior Cleaning",   price: interiorPrice },
    tyre_polish:         { name: "Tyre Polish",         price: 100 },
    dashboard_cleaning:  { name: "Dashboard Cleaning",  price: 150 },
    engine_cleaning:     { name: "Engine Cleaning",     price: 200 },
  };

  let serviceList = [];
  try {
    const parsed = typeof servicesRaw === "string"
      ? JSON.parse(servicesRaw)
      : servicesRaw;
    serviceList = Array.isArray(parsed) ? parsed : [];
  } catch {
    serviceList = [];
  }

  const addons = [];
  for (const svc of serviceList) {
    const key = svc.toLowerCase().trim();
    if (key === "daily_wash") continue; // base plan — not an addon
    if (addonCatalog[key]) {
      addons.push(addonCatalog[key]);
    }
  }

  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);

  // Validate: if stored monthly_price ≠ derived total, trust the stored price
  // but still show the breakdown
  const derivedTotal = basePrice + addonsTotal;

  return { basePrice, addons, derivedTotal };
}

// ─────────────────────────────────────────────────────────────────────────────

export const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const [[user]] = await pool.execute(
      `SELECT id, name, full_name, email, phone,
              manual_total_washes, manual_this_month, manual_recent_wash,
              manual_active_vehicles, manual_days_left, manual_active_subscriptions
       FROM users WHERE id = ?`,
      [userId]
    );

    // Get ALL subscriptions with vehicle and washer info
    const [subscriptions] = await pool.execute(
      `SELECT s.*,
              v.vehicle_number, v.vehicle_type, v.vehicle_model,
              w.name as washer_name, w.full_name as washer_full_name
       FROM subscriptions s
       LEFT JOIN vehicles v ON s.vehicle_id = v.id
       LEFT JOIN users w ON s.washer_id = w.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );

    // ── Enrich each subscription ─────────────────────────────────────────────
    const now = new Date();
    const dbPricing = await getDynamicDbPrices();

    const enrichedSubscriptions = subscriptions.map(s => {
      const daysLeft = s.renewal_date
        ? Math.max(0, Math.ceil((new Date(s.renewal_date) - now) / (1000 * 60 * 60 * 24)))
        : 0;

      const urgency = getUrgency(daysLeft);

      const { basePrice, addons, derivedTotal } = parseServicesBreakdown(
        s.services,
        s.vehicle_type,
        dbPricing
      );

      // Use stored monthly_price as source of truth for total
      // If it matches derived, perfect. Otherwise trust stored.
      const totalPrice = Number(s.monthly_price) || derivedTotal;

      return {
        ...s,
        daysLeft,
        urgency,
        plan: { name: s.plan_name || "Daily Wash", basePrice },
        addons,
        totalPrice,
      };
    });

    // ── Active subscriptions only — sorted by renewal date ASC (soonest first) ─
    const activeSubscriptions = enrichedSubscriptions
      .filter(s => s.status === "active")
      .sort((a, b) => {
        if (!a.renewal_date) return 1;
        if (!b.renewal_date) return -1;
        return new Date(a.renewal_date) - new Date(b.renewal_date);
      });

    // ── Next Renewal = soonest-expiring active sub ────────────────────────────
    const soonest = activeSubscriptions[0] || null;
    const nextRenewal = soonest
      ? {
          vehicleName:   soonest.vehicle_model || soonest.vehicle_number || "Vehicle",
          vehicleNumber: soonest.vehicle_number || "",
          renewalDate:   soonest.renewal_date,
          daysLeft:      soonest.daysLeft,
          urgency:       soonest.urgency,
        }
      : null;

    // ── Renewal Summary: urgency bucket counts ────────────────────────────────
    const renewalSummary = { red: 0, yellow: 0, green: 0 };
    for (const s of activeSubscriptions) {
      renewalSummary[s.urgency] = (renewalSummary[s.urgency] || 0) + 1;
    }

    // ── Primary sub (backward compat) ─────────────────────────────────────────
    const activeSub = soonest || enrichedSubscriptions[0] || null;

    // ── Today's wash ──────────────────────────────────────────────────────────
    const today = now.toISOString().split("T")[0];
    const [todayWash] = await pool.execute(
      `SELECT wr.*, v.vehicle_number
       FROM wash_records wr
       LEFT JOIN vehicles v ON wr.vehicle_id = v.id
       WHERE wr.user_id = ? AND wr.wash_date = ?
       ORDER BY wr.created_at DESC LIMIT 1`,
      [userId, today]
    );

    // ── Wash history (last 30) ────────────────────────────────────────────────
    const [washHistory] = await pool.execute(
      `SELECT wr.*, v.vehicle_number, v.vehicle_type
       FROM wash_records wr
       LEFT JOIN vehicles v ON wr.vehicle_id = v.id
       WHERE wr.user_id = ?
       ORDER BY wr.wash_date DESC LIMIT 30`,
      [userId]
    );

    // ── Vehicles enriched with subscription data ──────────────────────────────
    const [vehicles] = await pool.execute(
      `SELECT v.*,
              s.id AS sub_id, s.plan_name, s.status AS sub_status,
              s.monthly_price, s.preferred_time, s.frequency,
              s.start_date, s.renewal_date, s.washer_id
       FROM vehicles v
       LEFT JOIN subscriptions s
         ON s.vehicle_id = v.id AND s.user_id = v.user_id AND s.status = 'active'
       WHERE v.user_id = ?
       ORDER BY v.created_at DESC`,
      [userId]
    );

    // ── Payments ──────────────────────────────────────────────────────────────
    const [payments] = await pool.execute(
      `SELECT p.id, p.subscription_id, p.amount, p.status, p.payment_method,
              p.razorpay_order_id, p.razorpay_payment_id, p.paid_at, p.created_at,
              s.plan_name
       FROM payments p
       LEFT JOIN subscriptions s ON p.subscription_id = s.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC LIMIT 20`,
      [userId]
    );

    // ── Stats ─────────────────────────────────────────────────────────────────
    const computedActiveVehicles      = vehicles.length;
    const computedActiveSubscriptions = activeSubscriptions.length;

    res.json({
      user: user || {},

      // Backward compat
      subscription: activeSub,
      allSubscriptions: enrichedSubscriptions,

      // Multi-vehicle enriched (sorted soonest-first)
      activeSubscriptions,

      // Smart renewal info
      nextRenewal,
      renewalSummary,

      todayWash: todayWash[0] || null,
      washRecords: washHistory,
      washHistory,
      vehicles,
      payments,

      stats: {
        activeVehicles:
          user?.manual_active_vehicles != null
            ? user.manual_active_vehicles
            : computedActiveVehicles,
        activeSubscriptions:
          user?.manual_active_subscriptions != null
            ? user.manual_active_subscriptions
            : computedActiveSubscriptions,
        // daysLeft intentionally omitted from stats — use nextRenewal instead
      },
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard", error: error.message });
  }
};
