import React from "react";
import { motion } from "framer-motion";
import { Check, Droplets, Sparkles } from "lucide-react";

const vehiclePricing = {
  micro:    { label: "Micro",    dailyWash: 999,  interiorCleaning: 300 },
  sedan:    { label: "Sedan",    dailyWash: 1199, interiorCleaning: 300 },
  mini_suv: { label: "Mini SUV", dailyWash: 1199, interiorCleaning: 300 },
  suv:      { label: "SUV",      dailyWash: 1399, interiorCleaning: 300 },
};

const timeSlots = [
  { value: "morning",   emoji: "🌅", label: "Morning",   time: "6AM–9AM"   },
  { value: "afternoon", emoji: "☀️", label: "Afternoon", time: "12PM–3PM"  },
  { value: "evening",   emoji: "🌆", label: "Evening",   time: "5PM–8PM"   },
];

const services = [
  {
    key: "dailyWash",
    icon: Droplets,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    title: "Daily Pressure Water Wash",
    subtitle: "Exterior pressure wash every day",
    priceKey: "dailyWash",
    priceSuffix: "/mo",
    selectedBorder: "border-cyan-500",
    selectedBg: "bg-cyan-50",
  },
  {
    key: "interiorCleaning",
    icon: Sparkles,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Interior Cleaning",
    subtitle: "Vacuuming, dashboard, floor mats & more",
    priceKey: "interiorCleaning",
    priceSuffix: "/visit",
    selectedBorder: "border-purple-500",
    selectedBg: "bg-purple-50",
  },
];

export default function PlanSelection({ formData, updateFormData }) {
  const vehicle = vehiclePricing[formData?.vehicle_type] || vehiclePricing.sedan;

  const selectedServices = formData?.selected_services || {
    dailyWash: false,
    interiorCleaning: false,
  };

  const toggleService = (key) => {
    const updated = { ...selectedServices, [key]: !selectedServices[key] };
    const total =
      (updated.dailyWash ? vehicle.dailyWash : 0) +
      (updated.interiorCleaning ? vehicle.interiorCleaning : 0);
    updateFormData("selected_services", updated);
    updateFormData("monthly_price", total);
  };

  const total =
    (selectedServices.dailyWash ? vehicle.dailyWash : 0) +
    (selectedServices.interiorCleaning ? vehicle.interiorCleaning : 0);

  const anySelected =
    selectedServices.dailyWash || selectedServices.interiorCleaning;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">
          Choose Your Services
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Prices for{" "}
          <span className="font-semibold text-cyan-600">{vehicle.label}</span>{" "}
          · Service charge additional
        </p>
      </div>

      {/* Price Chart Reference Strip */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">💧</span>
        <div>
          <p className="text-xs font-semibold text-amber-800">
            Daily Pressure Water Wash — {vehicle.label}
          </p>
          <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5">
            ₹{vehicle.dailyWash}/mo · Interior cleaning ₹{vehicle.interiorCleaning}/visit extra
          </p>
          <p className="text-[10px] text-amber-500 mt-0.5 italic">
            Note: Service charge will be additional
          </p>
        </div>
      </div>

      {/* Service Selection Cards */}
      <div>
        <p className="text-[10px] sm:text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-3">
          Select Services
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => {
            const isSelected = selectedServices[service.key];
            const price = vehicle[service.priceKey];
            return (
              <button
                key={service.key}
                type="button"
                onClick={() => toggleService(service.key)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 w-full ${
                  isSelected
                    ? `${service.selectedBorder} ${service.selectedBg} shadow-sm`
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected
                      ? `${service.selectedBorder} ${service.selectedBg.replace("bg-", "bg-").replace("-50", "-500")} border-transparent`
                      : "border-slate-300 bg-white"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: service.key === "dailyWash" ? "#06b6d4" : "#a855f7" }
                      : {}
                  }
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Icon + Content */}
                <div className="flex items-start gap-3 pr-7">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${service.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <service.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${service.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm sm:text-base leading-tight">
                      {service.title}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-snug">
                      {service.subtitle}
                    </p>
                    <p
                      className={`text-base sm:text-lg font-bold mt-1.5 ${
                        service.key === "dailyWash" ? "text-cyan-600" : "text-purple-600"
                      }`}
                    >
                      ₹{price}
                      <span className="text-[10px] sm:text-xs font-normal text-slate-400 ml-0.5">
                        {service.priceSuffix}
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Total Amount */}
      {anySelected && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-white/70 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
              Total Amount
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {selectedServices.dailyWash && (
                <span className="text-white/80 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                  Daily Wash
                </span>
              )}
              {selectedServices.interiorCleaning && (
                <span className="text-white/80 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                  Interior Cleaning
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-2xl sm:text-3xl font-bold">₹{total}</p>
            <p className="text-white/60 text-[10px]">* Service charge extra</p>
          </div>
        </motion.div>
      )}

      {!anySelected && (
        <p className="text-xs text-slate-400 text-center py-1">
          Select at least one service to see total
        </p>
      )}

      {/* Time Slot */}
      <div>
        <p className="text-[10px] sm:text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-3">
          Daily Wash Time
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {timeSlots.map((slot) => {
            const isSelected = formData?.preferred_time === slot.value;
            return (
              <label
                key={slot.value}
                className={`flex flex-col items-center text-center p-2.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-50 shadow-sm"
                    : "border-slate-200 hover:border-cyan-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="preferred_time"
                  value={slot.value}
                  checked={isSelected}
                  onChange={() => updateFormData("preferred_time", slot.value)}
                  className="hidden"
                />
                <span className="text-xl sm:text-2xl">{slot.emoji}</span>
                <span className="font-semibold text-slate-900 text-[10px] sm:text-xs mt-1">
                  {slot.label}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                  {slot.time}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Summary pill */}
      {anySelected && formData?.preferred_time && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] sm:text-xs text-white/60">Selected</p>
            <p className="font-semibold text-sm sm:text-base capitalize mt-0.5">
              {vehicle.label} ·{" "}
              {[
                selectedServices.dailyWash && "Daily Wash",
                selectedServices.interiorCleaning && "Interior",
              ]
                .filter(Boolean)
                .join(" + ")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] sm:text-xs text-white/60">Monthly Total</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">₹{total}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}