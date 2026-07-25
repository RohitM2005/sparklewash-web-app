import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function PricingSection() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic Wash",
      gradient: "from-cyan-500 to-blue-600",
      features: [
        {
          main: "Interior Cleaning",
          sub: [
            "All Vacuuming Cleaning",
            "Dash Board Cleaning/Shining",
            "Floor Mats Cleaning",
          ],
        },
        { main: "Floor Paper Mat" },
        { main: "Fragrance Tag" },
      ],
    },
    {
      name: "Deluxe Wash",
      gradient: "from-cyan-500 to-blue-600",
      popular: true,
      features: [
        { main: "Shampoo Wash" },
        { main: "Alloy Wheel Polishing + Tyre Shining" },
        { main: "Under Body Cleaner" },
        { main: "Engine Cleaning" },
        {
          main: "Interior Cleaning",
          sub: [
            "All Vacuuming Cleaning",
            "Dash Board Cleaning/Shining",
            "Floor Mats Cleaning",
            "Car Sanitization",
          ],
        },
        { main: "Floor Paper Mat" },
        { main: "Fragrance Tag" },
      ],
    },
    {
      name: "Premium Wash",
      gradient: "from-purple-500 to-indigo-600",
      features: [
        { main: "Shampoo Wash" },
        { main: "Alloy Wheel Polishing + Tyre Shining" },
        { main: "Under Body Cleaner" },
        { main: "Engine Cleaning" },
        { main: "Ozone Air Purification" },
        {
          main: "Intensive Interior Cleaning",
          sub: [
            "All Vacuuming Cleaning",
            "AC Vent Cleaning",
            "Dash Board Cleaning / Shining",
            "Roof Cleaning",
            "Seats Cleaning",
            "Seats Belt Cleaning",
            "Sides Door Cleaning",
            "Boot Area Cleaning",
          ],
        },
        { main: "Floor Paper Mat" },
        { main: "Fragrance Tag" },
      ],
    },
  ];

  return (
    <div>
      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        viewport={{ once: true, margin: "0px 0px -50px 0px" }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
          Interior Cleaning Services
        </h2>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Choose the right wash plan for your vehicle
        </p>
        <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            className={`relative bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
              plan.popular ? "ring-2 ring-cyan-500" : ""
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <span className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                Most Popular
              </span>
            )}

            {/* Card Header */}
            <div className={`bg-gradient-to-r ${plan.gradient} px-5 py-4`}>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {plan.name}
              </h3>
            </div>

            {/* Features List */}
            <div className="px-5 py-5 flex-1 space-y-3">
              {plan.features.map((feature, i) => (
                <div key={i}>
                  {/* Main Feature */}
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-500 text-base mt-0.5 flex-shrink-0">✳</span>
                    <span className="text-slate-800 text-sm sm:text-base font-medium leading-snug">
                      {feature.main}
                    </span>
                  </div>

                  {/* Sub Features */}
                  {feature.sub && feature.sub.length > 0 && (
                    <ul className="mt-1.5 ml-6 space-y-1">
                      {feature.sub.map((sub, j) => (
                        <li key={j} className="flex items-start gap-2 text-slate-600 text-xs sm:text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default PricingSection;