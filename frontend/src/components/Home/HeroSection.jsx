import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Play, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function HeroSection() {
  const { user } = useAuth();
  const benefits = [
    "Daily doorstep service",
    "Scratch-Safe Cleaning",
    "Verified Professionals",
  ];

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-60 sm:w-72 h-60 sm:h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* LEFT SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs sm:text-sm text-cyan-300 font-medium">
                Premium Car Care at Your Doorstep
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-[32px] sm:text-[42px] md:text-[52px] lg:text-[60px] font-bold text-white leading-tight mb-6">
              Your Car Deserves a
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Daily Sparkle
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-400 mb-8 max-w-lg">
              Experience hassle-free car washing with our subscription service.
              We come to you daily — reliable, professional, and convenient.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to={user ? "/booking" : "/login"} className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600
                    hover:scale-105 transition-all px-6 sm:px-8 py-3 sm:py-4
                    text-base sm:text-lg rounded-xl shadow-lg shadow-cyan-500/25 text-white"
                >
                  Start Subscription
                </button>
              </Link>

              <a href="#how-it-works" className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto flex items-center justify-center border border-slate-600
                    text-slate-300 hover:bg-slate-800 px-6 sm:px-8 py-3 sm:py-4
                    text-base sm:text-lg rounded-xl transition group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:text-cyan-400" />
                  Watch How It Works
                </button>
              </a>
            </div>

            {/* Benefits */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-slate-300 text-xs sm:text-sm">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SECTION (Image) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="/assets/hero-car.png"
                alt="Professional car wash"
                className="w-full h-[400px] xl:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}