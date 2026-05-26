import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "../components/Home/Footer";
import PrivacyPolicyContent from "../components/legal/PrivacyPolicy";

export default function PrivacyPolicyPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link to="/home" className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">🔐 Privacy Policy</h1>
        <div className="h-1 w-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-8" />
        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed">
          <PrivacyPolicyContent />
        </div>
      </div>
      <Footer />
    </div>
  );
}
