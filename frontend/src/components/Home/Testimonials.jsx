import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Anup Sawant", role: "IT Professional, Pune", initials: "AS", color: "from-cyan-500 to-blue-600", rating: 5, text: "SparkleWash is effortless. I subscribed once and my car has looked brand new every single morning. The daily consistency gives real peace of mind." },
  { name: "Manoj Bhope", role: "Business Owner, Pune", initials: "MB", color: "from-violet-500 to-purple-600", rating: 5, text: "The team is punctual, professional, and genuinely care about the job. Feels like having a personal car care service. Absolutely worth every rupee." },
  { name: "Rahul Bhattacharya", role: "Doctor, Pune", initials: "RB", color: "from-emerald-500 to-green-600", rating: 5, text: "After a long shift I never worry about car cleaning. SparkleWash handles it perfectly. Quality is consistently excellent — it shows they genuinely care." },
  { name: "Karthik Kumar", role: "Society Secretary, Pune", initials: "KK", color: "from-orange-500 to-red-500", rating: 5, text: "We signed up 12 residents through SparkleWash. Managing everything from the dashboard is seamless. Superb service for apartment complexes." },
];

const stats = [
  { value: "1,000+", label: "Happy Customers" },
  { value: "2,00,000+", label: "Washes Completed" },
  { value: "Pune", label: "Currently Serving" },
  { value: "4.6 / 5", label: "Average Rating" },
];

export default function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-100/40 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
          className="text-center mb-14 sm:mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-xs sm:text-sm font-semibold mb-5 border border-green-100 tracking-wide">✦ Customer Love</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Real People,{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Real Results</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Join hundreds of car owners across Pune who've made the switch to effortless daily car care.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-12 sm:mb-14">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            >
              <div className="h-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 hover:border-transparent hover:shadow-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-[0.03] transition-opacity rounded-2xl`} />
                <div className="relative flex items-start gap-3.5 mb-4">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <span className="text-white text-sm font-black">{t.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{t.name}</h4>
                    <p className="text-slate-500 text-xs sm:text-sm">{t.role}</p>
                    <div className="flex gap-0.5 mt-1.5">
                      {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                  <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-slate-100 flex-shrink-0" />
                </div>
                <p className="relative text-slate-600 text-sm sm:text-base leading-relaxed">"{t.text}"</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
              viewport={{ once: true, margin: "0px 0px -30px 0px" }}
              className="text-center bg-white rounded-2xl px-4 py-5 sm:py-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1.5">{stat.value}</div>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}