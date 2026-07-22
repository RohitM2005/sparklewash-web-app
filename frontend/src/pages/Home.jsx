import React from "react";

import HeroSection from "../components/Home/HeroSection";
import FeaturesSection from "../components/Home/FeaturesSection";
import HowItWorksSection from "../components/Home/HowItWorksSection";
import PricingSection from "../components/Home/PricingSection";
import TestimonialsSection from "../components/Home/Testimonials";
import Footer from "../components/Home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ marginTop: 0, paddingTop: 0 }}>

      {/* HERO — no extra wrapper padding */}
      <section style={{ margin: 0, padding: 0 }}>
        <HeroSection />
      </section>

      {/* FEATURES */}
      <section className="px-4 sm:px-6 lg:px-8" style={{ margin: 0, paddingTop: '48px', paddingBottom: '48px' }}>
        <FeaturesSection />
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 px-4 sm:px-6 lg:px-8" style={{ margin: 0, paddingTop: '48px', paddingBottom: '48px' }}>
        <HowItWorksSection />
      </section>

      {/* PRICING */}
      <section className="px-4 sm:px-6 lg:px-8" style={{ margin: 0, paddingTop: '48px', paddingBottom: '48px' }}>
        <PricingSection />
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-slate-50 px-4 sm:px-6 lg:px-8" style={{ margin: 0, paddingTop: '48px', paddingBottom: '48px' }}>
        <TestimonialsSection />
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}