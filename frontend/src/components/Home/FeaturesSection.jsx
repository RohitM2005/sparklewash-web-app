import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Shield,
  Smartphone,
  Droplets,
  MapPin,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Daily Doorstep Service",
    description:
      "No more waiting in queues. We come to your home, office, or society every day at your preferred time.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: CreditCard,
    title: "Easy Online Payments",
    description:
      "Secure Razorpay integration for hassle-free subscriptions. Pay monthly, pause anytime.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Smartphone,
    title: "Real-time Dashboard",
    description:
      "Track your wash history, view invoices, manage subscriptions all from your personal dashboard.",
    color: "from-orange-500 to-red-500",
  },

  {
    icon: Shield,
    title: "Trained Professionals",
    description:
      "Our verified and trained washers use eco friendly products safe for your car.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Droplets,
    title: "Eco-Friendly Products",
    description:
      "We use biodegradable, waterless washing solutions safe for the environment.",
    color: "from-teal-500 to-green-500",
  },
  {
    icon: MapPin,
    title: "Wide Coverage",
    description:
      "Currently serving customers across Pune. As we grow, our services will gradually expand to more cities and regions.",
    color: "from-rose-500 to-orange-500",
  },
];

export default function FeaturesSection() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium mb-4">
            Why Choose SparkleWash
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            Everything You Need for a
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
              {" "}Spotless Car
            </span>
          </h2>

          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            We've thought of everything to make car washing effortless.
            From booking to payment it's all seamless.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const gradient = feature.color || "from-cyan-500 to-blue-500";

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                className="group"
              >
                <div className="h-full bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-slate-200 hover:-translate-y-1">

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform`}
                  >
                    {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}