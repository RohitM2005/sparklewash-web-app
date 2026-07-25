import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import VideoModal from "../common/VideoModal";

// Custom Icon 1: Daily Wash (Stopwatch with checkmark & wash accent)
const IconDailyWash = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="13" r="7.5" />
    <path d="M11 9.5v3.5l2 2" />
    <path d="M11 2.5v3" />
    <path d="M9 2.5h4" />
    <circle cx="18.5" cy="5.5" r="2.5" />
    <path d="M17.5 5.5l.7.7 1.3-1.3" />
    <path d="M16 16.5l2.5 4.5h-3.5l1-4.5z" />
  </svg>
);

// Custom Icon 2: Verified Professionals (Wavy starburst badge with checkmark)
const IconVerified = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5l2.1 1.5 2.6-.5.9 2.5 2.5.9-.5 2.6 1.5 2.1-1.5 2.1.5 2.6-2.5.9-.9 2.5-2.6-.5L12 21.5l-2.1-1.5-2.6.5-.9-2.5-2.5-.9.5-2.6L3 12l1.5-2.1-.5-2.6 2.5-.9.9-2.5 2.6.5L12 2.5z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// Custom Icon 3: Safe Products (Shield with checkmark on open hand)
const IconSafeProducts = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3s3.5 1.5 5.5 2v4.5c0 4-3 6.8-5.5 8.1-2.5-1.3-5.5-4.1-5.5-8.1V5c2-.5 5.5-2 5.5-2z" />
    <path d="M9.5 9.5l1.8 1.8 3.2-3.2" />
    <path d="M2.5 13h2.5c1.8 0 2.8 1.3 4.5 1.3s3.8-1 5.5-1 4.5 2.2 4.5 4c0 1.2-1.2 1.8-2.5 1.8H5c-1.8 0-2.5-.8-2.5-1.8v-4.3z" />
  </svg>
);

export default function HeroSection() {
  const { user } = useAuth();
  const [videoOpen, setVideoOpen] = useState(false);

  const features = [
    {
      icon: IconDailyWash,
      title: "Daily Wash",
      subtitle: "Subscription",
    },
    {
      icon: IconVerified,
      title: "Verified",
      subtitle: "Professionals",
    },
    {
      icon: IconSafeProducts,
      title: "Safe",
      subtitle: "Products",
    },
  ];

  return (
    <section className="relative min-h-[70vh] sm:min-h-[72vh] lg:min-h-[calc(100vh-64px)] overflow-hidden">

      {/* ================= Background (Desktop) ================= */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          backgroundImage: "url('/assets/hero-bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "10% center",
        }}
      >
        {/* Hero Image */}
        <img
          src="/assets/hero-premium.png"
          alt="SparkleWash"
          className="absolute right-0 top-0 h-full w-auto max-w-none"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* ================= Background (Mobile < lg) ================= */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          backgroundImage: "url('/assets/hero-bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Soft Glassmorphism Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/85 to-slate-50/95 backdrop-blur-[1.5px]" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 xl:px-10">
        <div className="flex items-center min-h-[68vh] sm:min-h-[70vh] lg:min-h-[calc(100vh-64px)] py-6 sm:py-8 lg:py-6">

          {/* ================= CONTENT STACK ================= */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full lg:w-[48%] xl:w-[45%] pt-4 sm:pt-6 lg:pt-4 pb-6 lg:pb-0"
          >

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-sky-100 px-4 py-2 sm:px-4.5 sm:py-2"
            >
              <Sparkles className="h-4 w-4 text-sky-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700 tracking-wide">
                PREMIUM DOORSTEP CAR CARE
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.45 }}
            >
              <p className="mt-3.5 sm:mt-5 uppercase tracking-[4px] sm:tracking-[6px] text-xs font-bold text-slate-600">
                CLEAN CAR.
                <span className="text-sky-600 ml-1.5 sm:ml-2">
                  HAPPY YOU.
                </span>
              </p>

              <h1 className="mt-2.5 sm:mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight sm:leading-tight text-slate-900 tracking-tight">
                Daily Car Wash{" "}
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent block sm:inline">
                  At Your Doorstep
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="mt-3.5 sm:mt-5 max-w-md lg:max-w-xl text-sm sm:text-base leading-relaxed sm:leading-8 text-slate-700 font-medium"
            >
              Professional care, premium products, and trusted
              experts delivering spotless results every single day.
              Keep your vehicle shining without leaving your home.
            </motion.p>

            {/* Buttons (Equal Width on Mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 mt-5 sm:mt-8 w-full sm:w-auto"
            >
              <Link to={user ? "/booking" : "/login"} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto group rounded-full px-6 py-3 sm:px-7 sm:py-3 bg-gradient-to-r from-sky-500 to-blue-700 text-white font-semibold shadow-md hover:scale-105 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 text-sm sm:text-base">
                  <span>Book Your Wash</span>
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <button
                onClick={() => setVideoOpen(true)}
                className="w-full sm:w-auto group rounded-full border border-slate-300/80 bg-white/90 backdrop-blur-md px-6 py-3 sm:px-7 sm:py-3 font-semibold text-slate-700 shadow-sm hover:border-sky-500 hover:text-sky-600 active:scale-[0.98] transition text-sm sm:text-base flex items-center justify-center gap-2.5"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 group-hover:bg-sky-500 transition-colors">
                  <Play className="w-3.5 h-3.5 text-sky-600 group-hover:text-white fill-sky-600 group-hover:fill-white transition-colors ml-0.5" />
                </div>
                <span>How It Works</span>
              </button>
            </motion.div>

            {/* ================= 3 FEATURE CARDS BAR (Proportional & Roomy) ================= */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 sm:mt-9">
              {features.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 + index * 0.05, duration: 0.4 }}
                    whileHover={{ y: -2 }}
                    className="flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center sm:text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all gap-1.5 sm:gap-3"
                  >
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </motion.div>

        </div>
      </div>

      {/* ================= SHARED VIDEO MODAL ================= */}
      <VideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
      />

    </section>
  );
}