import api from "./api";

let cachedSettings = null;
let lastFetchTime = 0;
const CACHE_TTL = 10000; // 10 seconds cache

export const DEFAULT_PRICING = {
  micro: { label: "Hatchback", dailyWash: 999, interiorCleaning: 300 },
  sedan: { label: "Sedan", dailyWash: 1199, interiorCleaning: 300 },
  mini_suv: { label: "Mini SUV", dailyWash: 1199, interiorCleaning: 300 },
  suv: { label: "SUV", dailyWash: 1399, interiorCleaning: 300 },
};

export const fetchPublicSettings = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && now - lastFetchTime < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const res = await api.get("/public/settings");
    if (res.data && res.data.success) {
      cachedSettings = res.data;
      lastFetchTime = now;
      return cachedSettings;
    }
  } catch (error) {
    console.error("Failed to fetch public system settings:", error);
  }

  return cachedSettings || {
    maintenance_mode: "false",
    pricing: {
      price_micro_daily: 999,
      price_sedan_daily: 1199,
      price_mini_suv_daily: 1199,
      price_suv_daily: 1399,
      price_interior_cleaning: 300,
    },
  };
};

export const getSystemPricingMap = (pricingData) => {
  const p = pricingData || (cachedSettings ? cachedSettings.pricing : null);
  const interior = p ? Number(p.price_interior_cleaning) || 300 : 300;

  return {
    micro: {
      label: "Hatchback",
      dailyWash: p ? Number(p.price_micro_daily) || 999 : 999,
      interiorCleaning: interior,
    },
    Hatchback: {
      label: "Hatchback",
      dailyWash: p ? Number(p.price_micro_daily) || 999 : 999,
      interiorCleaning: interior,
    },
    sedan: {
      label: "Sedan",
      dailyWash: p ? Number(p.price_sedan_daily) || 1199 : 1199,
      interiorCleaning: interior,
    },
    mini_suv: {
      label: "Mini SUV",
      dailyWash: p ? Number(p.price_mini_suv_daily) || 1199 : 1199,
      interiorCleaning: interior,
    },
    suv: {
      label: "SUV",
      dailyWash: p ? Number(p.price_suv_daily) || 1399 : 1399,
      interiorCleaning: interior,
    },
  };
};
