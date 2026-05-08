import React, { useState } from "react";
import { motion } from "framer-motion";

const vehicleTypes = [
  { value: "micro", label: "Micro", icon: "🚗", dailyWash: 999, interiorCleaning: 300, description: "Alto, Wagon R, Nano" },
  { value: "sedan", label: "Sedan", icon: "🚙", dailyWash: 1199, interiorCleaning: 300, description: "Swift, Dzire, Honda City" },
  { value: "mini_suv", label: "Mini SUV", icon: "🚐", dailyWash: 1199, interiorCleaning: 300, description: "Brezza, Nexon, Venue" },
  { value: "suv", label: "SUV", icon: "🏎️", dailyWash: 1399, interiorCleaning: 300, description: "Fortuner, Innova, Creta" },
];

export default function VehicleForm({ formData, updateFormData }) {
  const [selectedServices, setSelectedServices] = useState({
    dailyWash: false,
    interiorCleaning: false,
  });

  const handleNumberChange = (value) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9 ]/g, "");
    updateFormData("vehicle_number", formatted);
  };

  const selectedVehicle = vehicleTypes.find((v) => v.value === formData?.vehicle_type);

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const updated = { ...prev, [service]: !prev[service] };
      // update total in formData
      const total = calculateTotal(updated, selectedVehicle);
      updateFormData("selected_services", updated);
      updateFormData("total_amount", total);
      return updated;
    });
  };

  const calculateTotal = (services, vehicle) => {
    if (!vehicle) return 0;
    let total = 0;
    if (services.dailyWash) total += vehicle.dailyWash;
    if (services.interiorCleaning) total += vehicle.interiorCleaning;
    return total;
  };

  const total = calculateTotal(selectedServices, selectedVehicle);
  const anySelected = selectedServices.dailyWash || selectedServices.interiorCleaning;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">Vehicle Details</h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Tell us about your vehicle</p>
      </div>

      {/* Vehicle Type Grid */}
      <div>
        <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-3">
          Select Vehicle Type
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {vehicleTypes.map((type) => {
            const isSelected = formData?.vehicle_type === type.value;
            return (
              <label
                key={type.value}
                className={`relative flex flex-col items-start gap-2 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-50 shadow-sm"
                    : "border-slate-200 hover:border-cyan-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="vehicle_type"
                  value={type.value}
                  checked={isSelected}
                  onChange={() => updateFormData("vehicle_type", type.value)}
                  className="hidden"
                />
                <span className="text-2xl sm:text-3xl">{type.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base leading-tight">
                    {type.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                    {type.description}
                  </p>
                  <p className="text-xs sm:text-sm text-cyan-600 font-bold mt-0.5">
                    ₹{type.dailyWash}
                    <span className="font-normal text-slate-400">/mo</span>
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Selectable Service Boxes */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
            Select Services — {selectedVehicle.label}
          </p>

          {/* Service Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Daily Pressure Wash */}
            <button
              type="button"
              onClick={() => toggleService("dailyWash")}
              className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedServices.dailyWash
                  ? "border-cyan-500 bg-cyan-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-cyan-200"
              }`}
            >
              {/* Checkbox indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedServices.dailyWash
                  ? "bg-cyan-500 border-cyan-500"
                  : "border-slate-300 bg-white"
              }`}>
                {selectedServices.dailyWash && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className="pr-6">
                <p className="text-xs text-slate-500 mb-1">Daily Pressure Wash</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">
                  ₹{selectedVehicle.dailyWash}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">/mo</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Exterior cleaning every day</p>
              </div>
            </button>

            {/* Interior Cleaning */}
            <button
              type="button"
              onClick={() => toggleService("interiorCleaning")}
              className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedServices.interiorCleaning
                  ? "border-cyan-500 bg-cyan-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-cyan-200"
              }`}
            >
              {/* Checkbox indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedServices.interiorCleaning
                  ? "bg-cyan-500 border-cyan-500"
                  : "border-slate-300 bg-white"
              }`}>
                {selectedServices.interiorCleaning && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className="pr-6">
                <p className="text-xs text-slate-500 mb-1">Interior Cleaning</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">
                  ₹{selectedVehicle.interiorCleaning}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">/visit</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Deep interior vacuuming & more</p>
              </div>
            </button>
          </div>

          {/* Total Amount */}
          {anySelected && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
                  Total Amount
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {selectedServices.dailyWash && (
                    <span className="text-white/70 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      Daily Wash
                    </span>
                  )}
                  {selectedServices.interiorCleaning && (
                    <span className="text-white/70 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      Interior
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-2xl sm:text-3xl font-bold">
                  ₹{total}
                </p>
                <p className="text-white/70 text-[10px]">* Service charge extra</p>
              </div>
            </motion.div>
          )}

          {/* No selection hint */}
          {!anySelected && (
            <p className="text-xs text-slate-400 text-center py-1">
              Select at least one service to see total
            </p>
          )}
        </motion.div>
      )}

      {/* Vehicle Info Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vehicle_number" className="text-slate-700 text-sm font-medium">
            Vehicle Number <span className="text-red-400">*</span>
          </label>
          <input
            id="vehicle_number"
            placeholder="MH 12 AB 1234"
            value={formData?.vehicle_number || ""}
            onChange={(e) => handleNumberChange(e.target.value)}
            maxLength={13}
            required
            className="mt-2 w-full border border-slate-200 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition bg-white"
          />
        </div>
        <div>
          <label htmlFor="vehicle_model" className="text-slate-700 text-sm font-medium">
            Make & Model <span className="text-red-400">*</span>
          </label>
          <input
            id="vehicle_model"
            placeholder="Maruti Swift"
            value={formData?.vehicle_model || ""}
            onChange={(e) => updateFormData("vehicle_model", e.target.value)}
            required
            className="mt-2 w-full border border-slate-200 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition bg-white"
          />
        </div>
      </div>
    </motion.div>
  );
}