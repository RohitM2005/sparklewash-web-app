import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({
  title, value, subtitle, icon: Icon, color = "cyan", delay = 0,
}) {
  const colorClasses = {
    cyan: "from-cyan-500 to-blue-500 shadow-cyan-500/20",
    green: "from-green-500 to-emerald-500 shadow-green-500/20",
    purple: "from-purple-500 to-indigo-500 shadow-purple-500/20",
    orange: "from-orange-500 to-red-500 shadow-orange-500/20",
  };

  const gradientClass = colorClasses[color] || colorClasses.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-3 sm:p-5 lg:p-6 border border-slate-200 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="min-w-0">
          <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">{title}</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-0.5 sm:mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">{subtitle}</p>
          )}
        </div>
        <div className={`flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-r ${gradientClass} shadow-lg flex items-center justify-center`}>
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />}
        </div>
      </div>
    </motion.div>
  );
}