import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  User,
  CreditCard,
  CheckCircle,
  Droplets,
} from "lucide-react";
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { addMonths, format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

import VehicleForm from "../components/Booking/VehicleForm";
import CustomerForm from "../components/Booking/CustomerForm";
import PlanSelection from "../components/Booking/PlanSelection";
import ReviewSubmit from "../components/Booking/ReviewSubmit";
import Loader from "../components/common/Loader";
import api from "../services/api";

const steps = [
  { id: 1, name: "Vehicle", icon: Car },
  { id: 2, name: "Details", icon: User },
  { id: 3, name: "Plan", icon: CreditCard },
  { id: 4, name: "Review", icon: CheckCircle },
];

const toastStyle = {
  style: { borderRadius: '10px', background: '#1a1a2e', color: '#fff', border: '1px solid rgba(0,212,255,0.2)' },
  success: { iconTheme: { primary: '#00d4ff', secondary: '#fff' } },
  error: { iconTheme: { primary: '#ff4444', secondary: '#fff' } },
};

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStepFromPath = () => {
    const path = location.pathname;
    if (path.endsWith("/details")) return 2;
    if (path.endsWith("/plan")) return 3;
    if (path.endsWith("/review")) return 4;
    return 1;
  };
  const currentStep = getStepFromPath();

  const [formData, setFormData] = useState({
    vehicle_type: "sedan",
    vehicle_number: "",
    vehicle_model: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    address: "",
    city: "",
    preferred_date: "",
    preferred_time: "morning",
    special_instructions: "",
    plan_name: "standard",
    monthly_price: 0,
    selected_services: { dailyWash: false, interiorCleaning: false },
    status: "active",
    payment_status: "pending",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan) {
      setFormData((prev) => ({ ...prev, plan_name: plan }));
    }
  }, []);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateDetailsStep = async () => {
    const { customer_name, customer_phone, customer_email, address, city } = formData;

    if (!customer_name?.trim()) { toast.error("Full name is required"); return false; }
    if (!customer_phone || !/^[6-9]\d{9}$/.test(customer_phone)) { toast.error("Valid 10-digit phone number required"); return false; }
    if (!customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) { toast.error("Valid email required"); return false; }
    if (!address?.trim()) { toast.error("Address is required"); return false; }
    if (!city?.trim()) { toast.error("City is required"); return false; }

    // Save updated details to DB — exact field names matching users table columns
    const payload = {
      full_name: customer_name.trim(),
      phone: customer_phone.trim(),
      email: customer_email.trim(),
      address: address.trim(),
    };

    console.log("Saving customer details — payload:", payload);

    setIsSubmitting(true);
    try {
      const response = await api.patch("/customer/profile", payload);
      console.log("✅ Profile save response:", response.data);
      toast.success("Details saved!");
    } catch (err) {
      console.error("❌ Profile save error:", err.response?.data);
      const msg = err.response?.data?.sqlMessage || err.response?.data?.message || err.response?.data?.error || "Failed to save details";
      toast.error("Save failed: " + msg);
      // Non-blocking — allow proceeding even if save fails
    } finally {
      setIsSubmitting(false);
    }
    return true;
  };

  const nextStep = async () => {
    if (isSubmitting) return;
    if (currentStep === 1) navigate("/booking/details");
    else if (currentStep === 2) {
      const valid = await validateDetailsStep();
      if (valid) navigate("/booking/plan");
    }
    else if (currentStep === 3) navigate("/booking/review");
  };
  const prevStep = () => {
    if (currentStep === 2) navigate("/booking");
    else if (currentStep === 3) navigate("/booking/details");
    else if (currentStep === 4) navigate("/booking/plan");
  };

  const getRenewalDate = (startDate) => {
    const date = startDate ? new Date(startDate) : new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Step 1: Create or find vehicle
      console.log("Step 1 — Creating vehicle:", { vehicle_number: formData.vehicle_number, vehicle_model: formData.vehicle_model, vehicle_type: formData.vehicle_type });
      const vehicleRes = await api.post("/vehicles", {
        vehicle_number: formData.vehicle_number,
        vehicle_model: formData.vehicle_model,
        vehicle_type: formData.vehicle_type,
      });
      const vehicle_id = vehicleRes.data.vehicle_id;
      console.log("Step 1 ✅ vehicle_id:", vehicle_id);

      // Calculate correct price
      const vehiclePrices = { micro: 999, sedan: 1199, mini_suv: 1199, suv: 1399 };
      const selectedServices = formData.selected_services || {};
      const basePrice = selectedServices.dailyWash ? (vehiclePrices[formData.vehicle_type] || 1199) : 0;
      const interiorAddon = selectedServices.interiorCleaning ? 300 : 0;
      const monthlyTotal = basePrice + interiorAddon;
      const amount = monthlyTotal > 0 ? monthlyTotal : (formData.monthly_price || 1199);

      // Build services array
      const services = [];
      if (selectedServices.dailyWash) services.push("daily_wash");
      if (selectedServices.interiorCleaning) services.push("interior");
      if (services.length === 0) services.push("daily_wash");

      const startDate = formData.preferred_date || new Date().toISOString().split("T")[0];
      const fullAddress = formData.address ? `${formData.address}${formData.city ? `, ${formData.city}` : ""}` : undefined;

      // Step 2: Directly create subscription — no payment
      const response = await api.post("/booking/confirm", {
        vehicle_id,
        plan_name: "Daily Wash",
        services,
        monthly_price: amount,
        preferred_time: formData.preferred_time || "morning",
        start_date: startDate,
        renewal_date: getRenewalDate(startDate),
        address: fullAddress,
      });

      if (response.data.success) {
        toast.success("Booking confirmed! 🎉", toastStyle);
        navigate("/booking/confirmed", {
          state: {
            subscription: response.data.subscription,
            bookingData: formData,
          },
        });
      }
    } catch (error) {
      console.error("Booking Error:", error);
      console.error("Error details:", error.response?.data);
      const msg = error.response?.data?.message || error.response?.data?.error || "Booking failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1)
      return formData.vehicle_number && formData.vehicle_model;
    if (currentStep === 2)
      return (
        formData.customer_name &&
        formData.customer_phone &&
        formData.customer_email &&
        formData.address &&
        formData.city &&
        formData.preferred_date &&
        formData.preferred_time
      );
    if (currentStep === 3) {
      const svc = formData.selected_services || {};
      return (svc.dailyWash || svc.interiorCleaning) && formData.preferred_time;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" toastOptions={toastStyle} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          {steps.map((s) => (
            <div key={s.id} className="text-center">
              <div
                className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${s.id <= currentStep
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-200 text-slate-400"
                  }`}
              >
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-xs mt-2">{s.name}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/"
                  element={
                    <VehicleForm
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  }
                />
                <Route
                  path="details"
                  element={
                    <CustomerForm
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  }
                />
                <Route
                  path="plan"
                  element={
                    <PlanSelection
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  }
                />
                <Route
                  path="review"
                  element={
                    <ReviewSubmit
                      formData={formData}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                    />
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto px-4 py-2 border rounded-md hover:bg-slate-100 disabled:opacity-40"
              >
                Back
              </button>

              <button
                onClick={nextStep}
                disabled={!isStepValid() || isSubmitting}
                className="w-full sm:w-auto px-6 py-2 rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}