import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CheckCircle2, Clock, X, Image, Star } from "lucide-react";

export default function RecentWashes({ washes = [] }) {
  const [selectedWash, setSelectedWash] = useState(null);

  useEffect(() => {
    if (selectedWash) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedWash]);

  const safeFormat = (date, formatType) => {
    try {
      return format(new Date(date), formatType);
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status = "scheduled") => {
    const config = {
      completed: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
      scheduled: { color: "bg-blue-100 text-blue-700", icon: Clock },
      skipped: { color: "bg-red-100 text-red-700", icon: X },
      cancelled: { color: "bg-slate-100 text-slate-700", icon: X },
      in_progress: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    };
    const { color, icon: Icon } = config[status] || config.scheduled;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${color}`}>
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Recent Washes
          </h3>
          <button className="text-cyan-600 text-xs sm:text-sm font-medium hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {washes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Image className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No wash records yet</p>
            </div>
          ) : (
            washes.slice(0, 5).map((wash, index) => (
              <motion.div
                key={wash._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index }}
                onClick={() => setSelectedWash(wash)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  {wash.after_image ? (
                    <img
                      src={wash.after_image}
                      alt="Wash proof"
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                      {safeFormat(wash.wash_date, "EEEE, MMM d")}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {wash.wash_time || "Morning slot"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap pl-13 sm:pl-0">
                  {getStatusBadge(wash.status)}
                  {wash.customer_rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs sm:text-sm font-medium">
                        {wash.customer_rating}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {selectedWash && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:px-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold mb-4">Wash Details</h3>

            {(selectedWash.before_image || selectedWash.after_image) && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                {selectedWash.before_image && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mb-2">Before</p>
                    <img src={selectedWash.before_image} alt="Before wash" className="w-full h-28 sm:h-40 rounded-xl object-cover" />
                  </div>
                )}
                {selectedWash.after_image && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mb-2">After</p>
                    <img src={selectedWash.after_image} alt="After wash" className="w-full h-28 sm:h-40 rounded-xl object-cover" />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-right">
                  {safeFormat(selectedWash.wash_date, "PPP")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status</span>
                {getStatusBadge(selectedWash.status)}
              </div>
              {selectedWash.washer_name && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Washer</span>
                  <span className="font-medium">{selectedWash.washer_name}</span>
                </div>
              )}
              {selectedWash.notes && (
                <div>
                  <span className="text-slate-500 block mb-1">Notes</span>
                  <p className="text-sm bg-slate-50 p-3 rounded-lg">{selectedWash.notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedWash(null)}
              className="mt-6 w-full py-2.5 border rounded-xl hover:bg-slate-100 transition text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}