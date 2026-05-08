import React from "react";
import { Car } from "lucide-react";

export default function Vehicles() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Vehicles</h1>
            <p className="text-sm text-slate-500 mt-0.5">Add and manage your vehicles here</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-slate-600 text-sm">Coming soon.</p>
        </div>
      </div>
    </div>
  );
}