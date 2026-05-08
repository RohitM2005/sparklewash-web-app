import React from "react";
import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-md w-full text-center">

        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

        <h1 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
          Payment Failed ❌
        </h1>

        <p className="text-slate-600 text-sm sm:text-base mb-6">
          Something went wrong during payment. Please try again.
        </p>

        <Link
          to="/subscription"
          className="block w-full py-2.5 rounded-md text-white bg-red-600 hover:bg-red-700 transition"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}