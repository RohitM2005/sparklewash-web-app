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
    status: "active",
    payment_status: "pending",
  });

  console.log("Booking component - formData:", formData);

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

  const nextStep = () => {
    if (currentStep === 1) navigate("/booking/details");
    else if (currentStep === 2) navigate("/booking/plan");
    else if (currentStep === 3) navigate("/booking/review");
  };
  const prevStep = () => {
    if (currentStep === 2) navigate("/booking");
    else if (currentStep === 3) navigate("/booking/details");
    else if (currentStep === 4) navigate("/booking/plan");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Step 1: Create or find vehicle
      const vehicleRes = await api.post("/vehicles", {
        vehicle_number: formData.vehicle_number,
        vehicle_model: formData.vehicle_model,
        vehicle_type: formData.vehicle_type,
      });
      const vehicle_id = vehicleRes.data.vehicle_id;

      // Step 2: Create subscription (status = 'pending')
      const subRes = await api.post("/subscriptions", {
        vehicle_id,
        plan_name: formData.plan_name,
        monthly_price: formData.monthly_price,
        preferred_time: formData.preferred_time,
        services: formData.selected_services || [],
      });
      const subscription_id = subRes.data.subscription_id;

      // Step 3: Create Razorpay order
      const amount = formData.monthly_price || 299;
      const orderRes = await api.post("/razorpay/create-order", {
        amount,
        subscription_id,
      });
      const order = orderRes.data.order;

      // Step 4: Open Razorpay checkout
      const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "SparkleWash",
        description: `${formData.plan_name} Plan Subscription`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Step 5: Verify payment
            await api.post("/razorpay/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              subscription_id,
              amount,
            });
            navigate("/payment-success");
          } catch (err) {
            console.error("Payment verification failed:", err);
            navigate("/payment-failed");
          }
        },
        prefill: {
          name: formData.customer_name,
          email: formData.customer_email,
          contact: formData.customer_phone,
        },
        theme: { color: "#06B6D4" },
      };

      if (typeof window.Razorpay !== "undefined") {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => navigate("/payment-failed"));
        rzp.open();
      } else {
        // Razorpay SDK not loaded — fall back to marking subscription as active directly
        console.warn("Razorpay SDK not loaded, skipping payment");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert(error.response?.data?.message || "Booking failed. Please try again.");
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
    if (currentStep === 3)
      return formData.plan_name && formData.preferred_time;
    return true;
  };

  if (isSubmitting) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">SparkleWash</span>
          </Link>
        </div>
      </div>

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
                className="w-full sm:w-auto px-4 py-2 border rounded-md hover:bg-slate-100"
              >
                Back
              </button>

              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="w-full sm:w-auto px-6 py-2 rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600"
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