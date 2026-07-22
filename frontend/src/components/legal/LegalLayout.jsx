import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../Home/Footer";

/**
 * Shared premium layout for all legal pages.
 * Props:
 *  - icon        : string  — emoji or char shown in the badge
 *  - title       : string  — page title
 *  - subtitle    : string  — short descriptor shown under title
 *  - effectiveDate: string — e.g. "01 April 2026"
 *  - lastUpdated : string  — optional
 *  - accentColor : string  — Tailwind gradient class (default cyan→blue)
 *  - children    : ReactNode — the content sections
 */
export default function LegalLayout({
  icon = "📄",
  title,
  subtitle,
  effectiveDate,
  lastUpdated,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500 opacity-10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 right-0 w-72 h-72 rounded-full bg-blue-600 opacity-10 blur-3xl"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          {/* Back nav */}
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white font-medium mb-8 transition-colors duration-150 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>

          {/* Icon badge + Title */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-900/30 mt-0.5">
              {icon}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-slate-400 text-sm sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Meta bar */}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5">
            {effectiveDate && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                Effective: {effectiveDate}
              </span>
            )}
            {lastUpdated && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                Last Updated: {lastUpdated}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-auto">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-emerald-400">SparkleWash Official Policy</span>
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60" />
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-4"
        >
          {children}
        </motion.div>

        {/* ── Contact CTA card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-10 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40 border border-cyan-100 dark:border-cyan-900/40 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Questions about this policy?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reach us at{" "}
              <a
                href="mailto:sparklewash5001@gmail.com"
                className="text-cyan-600 dark:text-cyan-400 underline underline-offset-2 hover:text-cyan-700 transition-colors"
              >
                sparklewash5001@gmail.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:+919309225001"
                className="text-cyan-600 dark:text-cyan-400 underline underline-offset-2 hover:text-cyan-700 transition-colors"
              >
                +91 9309225001
              </a>
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
