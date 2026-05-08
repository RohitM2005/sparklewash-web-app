import React from "react";

import HeroSection from "../components/Home/HeroSection";
import FeaturesSection from "../components/Home/FeaturesSection";
import HowItWorksSection from "../components/Home/HowItWorksSection";
import PricingSection from "../components/Home/PricingSection";
import TestimonialsSection from "../components/Home/Testimonials";
import Footer from "../components/Home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* HERO */}
      <section className="pt-2 sm:pt-4 md:pt-6">
        <HeroSection />
      </section>

      {/* FEATURES */}
      <section className="py-10 sm:py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <FeaturesSection />
      </section>

      {/* HOW IT WORKS */}
      <section className="py-10 sm:py-14 md:py-20 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <HowItWorksSection />
      </section>

      {/* PRICING */}
      <section className="py-10 sm:py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <PricingSection />
      </section>

      {/* TESTIMONIALS */}
      <section className="py-10 sm:py-14 md:py-20 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <TestimonialsSection />
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
