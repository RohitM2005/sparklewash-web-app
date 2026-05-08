import React from "react";
import { CheckCircle, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";

export default function SubscriptionPlans() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic",
      price: 499,
      features: [
        "Exterior wash",
        "4 washes per month",
        "Basic cleaning",
      ],
      popular: false,
    },
    {
      name: "Standard",
      price: 799,
      features: [
        "Exterior + Interior wash",
        "8 washes per month",
        "Dashboard polishing",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: 1199,
      features: [
        "Full detailing",
        "12 washes per month",
        "Premium wax coating",
      ],
      popular: false,
    },
  ];


  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <Droplets className="w-8 h-8 text-cyan-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Choose Your Plan
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Flexible monthly subscriptions for your vehicle
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition ${plan.popular ? "border-cyan-500" : ""
                }`}
            >
              {plan.popular && (
                <span className="absolute top-4 right-4 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold text-cyan-600 mb-4">
                ₹{plan.price}
                <span className="text-sm text-slate-500"> / month</span>
              </p>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(`/booking?plan=${plan.name.toLowerCase()}`)}
                className="w-full py-2.5 rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}