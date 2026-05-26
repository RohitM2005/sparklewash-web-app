import { Link } from "react-router-dom";
import { ArrowRight, User, Shield, Car } from "lucide-react";

export default function RoleSelection() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-screen background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/assets/how-it-works.mp4" type="video/mp4" />
        <source src="/assets/how-it-works.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
      
      {/* Content positioned above video */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center space-y-8">
          
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img
              src="/logo.jpg"
              alt="SparkleWash"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover shadow-2xl"
              style={{ borderRadius: "20px", border: "2px solid rgba(255,255,255,0.15)" }}
            />
          </div>

          {/* Title and subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Let's Get Your Car Shining ✨
            </h1>
            <p className="text-base sm:text-lg text-white/80 max-w-md mx-auto">
              Choose your role to continue
            </p>
          </div>

          {/* Role selection buttons */}
          <div className="space-y-4 w-full px-2">
            {/* Customer Login Button */}
            <Link
              to="/home"
              className="group relative overflow-hidden text-white px-8 py-5 rounded-2xl font-semibold text-lg shadow-2xl transform hover:scale-[1.03] transition-all duration-300 flex items-center justify-between w-full"
              style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <User className="w-6 h-6" />
                Customer Login
              </span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, #0891b2, #2563eb)" }} />
            </Link>

            {/* Admin Login Button */}
            <Link
              to="/admin/login"
              className="group relative overflow-hidden text-white px-8 py-5 rounded-2xl font-semibold text-lg shadow-2xl transform hover:scale-[1.03] transition-all duration-300 flex items-center justify-between w-full"
              style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Shield className="w-6 h-6" />
                Admin Login
              </span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, #9333ea, #4f46e5)" }} />
            </Link>

            {/* Washer Login Button */}
            <Link
              to="/washer/login"
              className="group relative overflow-hidden text-white px-8 py-5 rounded-2xl font-semibold text-lg shadow-2xl transform hover:scale-[1.03] transition-all duration-300 flex items-center justify-between w-full"
              style={{ background: "linear-gradient(135deg, #22c55e, #10b981)" }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Car className="w-6 h-6" />
                Washer Login
              </span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, #16a34a, #059669)" }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
