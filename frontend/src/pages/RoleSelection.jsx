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
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content positioned above video */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          
          {/* Title and subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Let’s Get Your Car Shining ✨
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Choose your role to continue
            </p>
          </div>

          {/* Role selection buttons */}
          <div className="space-y-4 max-w-md mx-auto">
            {/* Customer Login Button */}
            <Link
              to="/home"
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <User className="w-6 h-6" />
                Customer Login
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Admin Login Button */}
            <Link
              to="/admin/login"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                Admin Login
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Washer Login Button */}
            <Link
              to="/washer/login"
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <Car className="w-6 h-6" />
                Washer Login
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
