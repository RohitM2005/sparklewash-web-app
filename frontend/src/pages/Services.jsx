import React from "react";
import { Car, Sparkles, Shield, Calendar } from "lucide-react";

const services = [
  {
    icon: Car,
    title: "Exterior Wash",
    desc: "Complete exterior cleaning including body wash, tires, and windows.",
  },
  {
    icon: Sparkles,
    title: "Interior Cleaning",
    desc: "Vacuuming, dashboard polishing, and seat sanitization.",
  },
  {
    icon: Shield,
    title: "Protective Coating",
    desc: "Wax and ceramic coating to protect paint and enhance shine.",
  },
  {
    icon: Calendar,
    title: "Monthly Subscriptions",
    desc: "Affordable recurring plans for regular maintenance and care.",
  },
];

export default function Services() {
  return (
    <div className="bg-white overflow-x-hidden">

      {/* HERO */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Our Services
          </h1>
          <p className="text-base sm:text-lg opacity-90">
            Professional vehicle care services designed to keep your ride spotless,
            protected, and shining every day.
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

          {services.map((service, index) => (
            <div
              key={index}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-100
                         transition duration-300
                         sm:hover:shadow-xl sm:hover:-translate-y-1"
            >
              <service.icon className="w-12 h-12 text-cyan-500 mb-4 mx-auto sm:mx-0" />

              <h3 className="text-lg font-semibold mb-2 text-slate-900 text-center sm:text-left">
                {service.title}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed text-center sm:text-left">
                {service.desc}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="bg-cyan-50 py-12 sm:py-16 text-center px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Ready to Experience SparkleFix?
          </h2>

          <p className="text-slate-600 mb-6 text-sm sm:text-base">
            Book your first service today and give your vehicle the care it deserves.
          </p>

          <a
            href="/booking"
            className="inline-block w-full sm:w-auto
                       bg-gradient-to-r from-cyan-500 to-blue-600
                       text-white px-6 py-3 rounded-lg font-medium shadow
                       hover:opacity-90 active:scale-95 transition"
          >
            Book a Service
          </a>
        </div>
      </section>

    </div>
  );
}
