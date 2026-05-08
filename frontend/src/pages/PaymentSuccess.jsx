import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-md w-full text-center">

        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h1 className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
          Payment Successful 🎉
        </h1>

        <p className="text-slate-600 text-sm sm:text-base mb-6">
          Your subscription has been activated successfully.
        </p>

        <Link
          to="/dashboard"
          className="block w-full py-2.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}