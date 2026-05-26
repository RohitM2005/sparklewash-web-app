import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Droplets,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="bg-slate-950 text-slate-400 pt-12 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.jpg"
                alt="SparkleWash"
                className="w-9 h-9 sm:w-10 sm:h-10 object-cover"
                style={{ borderRadius: "10px" }}
              />
              <span className="text-lg sm:text-xl font-bold text-white">
                SparkleWash
              </span>
            </div>

            <p className="text-xs sm:text-sm mb-6 leading-relaxed">
              SparkleWash provides reliable doorstep car wash services across Pune. Our trained professionals keep your vehicle spotless every day using eco-friendly cleaning solutions.
            </p>

            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-cyan-600 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to={user ? "/booking" : "/login"} className="hover:text-cyan-400 transition">
                  Book Now
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-cyan-400 transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">
              Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                "Exterior Car Wash",
                "Interior Vacuum Cleaning",
                "Premium Deep Cleaning",
                "Waterless Eco Wash",
                "Monthly Subscription Plans",
                "Corporate & Fleet Car Wash",
                "Doorstep Car Wash",
              ].map((service) => (
                <li key={service}>
                  <span className="hover:text-cyan-400 cursor-pointer transition">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 mt-1" />
                <span>
                  Warje , Pune - 411023
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
                <span>+91 9309225001</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
                <span>sparklewash5001@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm">
            <p className="text-center sm:text-left">
              © 2026 SparkleWash. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link to="/privacy-policy" className="hover:text-cyan-400 transition">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-cyan-400 transition">
                Terms of Service
              </Link>
              <Link to="/refund-policy" className="hover:text-cyan-400 transition">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}