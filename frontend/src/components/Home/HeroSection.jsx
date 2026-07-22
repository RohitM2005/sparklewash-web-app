import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Droplets,
  CalendarCheck,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function HeroSection() {
  const { user } = useAuth();

  const features = [
    {
      icon: Droplets,
      title: "Daily Wash",
      subtitle: "Subscription",
    },
    {
      icon: BadgeCheck,
      title: "Verified",
      subtitle: "Professionals",
    },
    {
      icon: ShieldCheck,
      title: "Safe",
      subtitle: "Products",
    },
    {
      icon: CalendarCheck,
      title: "Easy",
      subtitle: "Booking",
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* ================= Background ================= */}

      <div className="absolute inset-0">

      </div>

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
          className="
              absolute
              right-0
              top-0
              h-full
              w-auto
              max-w-none
              "
        />


      </div>

      <div className="relative z-20 max-w-1xl mx-auto px-8 lg:px-12">

        <div className="flex items-center min-h-[900px]">

          {/* ================= LEFT ================= */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
            className="w-full lg:w-[45%] pt-20 lg:pt-10"
          >

            {/* Badge */}

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .2 }}
              className="inline-flex items-center gap-3 rounded-full bg-white shadow-lg border border-sky-100 px-5 py-3"
            >
              <Sparkles className="h-5 w-5 text-sky-600" />

              <span className="text-sm font-semibold text-slate-700 tracking-wide">
                PREMIUM DOORSTEP CAR CARE
              </span>

            </motion.div>

            {/* Heading */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .3 }}
            >

              <p className="mt-10 uppercase tracking-[6px] text-slate-500 font-semibold">

                CLEAN CAR.

                <span className="text-sky-600 ml-2">
                  HAPPY YOU.
                </span>

              </p>

              <h1 className="mt-6 text-5xl md:text-5xl xl:text-7xl font-black leading-tight text-slate-900">

                Daily Car Wash

                <br />

                <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent">

                  At Your Doorstep

                </span>

              </h1>

            </motion.div>

            {/* Description */}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: .45 }}
              className="mt-6 max-w-md text-base leading-8 text-slate-600"
            >
              Professional care, premium products, and trusted
              experts delivering spotless results every single day.
              Keep your vehicle shining without leaving your home.
            </motion.p>

            {/* Buttons */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: .6 }}
              className="flex flex-wrap gap-5 mt-10"
            >

              <Link to={user ? "/booking" : "/login"}>

                <button className="group rounded-full px-7 py-3 bg-gradient-to-r from-sky-500 to-blue-700 text-white font-semibold shadow-xl hover:scale-105 transition-all duration-300">

                  <span className="flex items-center gap-3">

                    Book Your Wash

                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />

                  </span>

                </button>

              </Link>

              <button className="rounded-full border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-700 shadow-sm hover:border-sky-500 hover:text-sky-600 transition">

                Explore Services

              </button>

            </motion.div>

            {/* Features */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14">

              {features.map((item, index) => {

                const Icon = item.icon;

                return (

                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: .8 + index * .1 }}
                    whileHover={{ y: -8 }}
                    className="h-[160px] rounded-2xl bg-white p-5 shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 mb-4">

                      <Icon className="h-7 w-7 text-sky-600" />

                    </div>

                    <h3 className="mt-5 font-bold text-slate-800">

                      {item.title}

                    </h3>

                    <p className="mt-2 text-sm text-slate-500 leading-5">

                      {item.subtitle}

                    </p>

                  </motion.div>

                );

              })}

            </div>

          </motion.div>

          {/* ================= RIGHT ================= */}



        </div>

      </div>

    </section>
  );
}