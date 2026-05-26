import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, isBefore, isAfter, startOfDay,
} from "date-fns";
import { CheckCircle2, XCircle, Minus, ChevronLeft, ChevronRight } from "lucide-react";

export default function WashCalendar({ washRecords = [], currentMonth, onMonthChange }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const washMap = useMemo(() => {
    const map = {};
    washRecords.forEach((r) => {
      const key = format(new Date(r.wash_date), "yyyy-MM-dd");
      map[key] = r.status;
    });
    return map;
  }, [washRecords]);

  const getWashState = (date) => {
    const key = format(date, "yyyy-MM-dd");
    const status = washMap[key];
    const today = startOfDay(new Date());
    const dayStart = startOfDay(date);
    const isFuture = isAfter(dayStart, today);

    if (status === "completed") return "completed";
    if (isFuture) return "neutral";
    if (isToday(date) && !status) return "neutral";
    if (status && ["pending", "missed", "skipped", "issue_reported"].includes(status)) return "missed";
    if (!status && isBefore(dayStart, today)) return "neutral";
    return "neutral";
  };

  const prevMonth = () => {
    if (!onMonthChange) return;
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  };

  const nextMonth = () => {
    if (!onMonthChange) return;
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">Wash Calendar</h3>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <button onClick={prevMonth} className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm sm:text-base font-medium text-slate-700 min-w-[110px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={nextMonth} className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-slate-500 py-1 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array(monthStart.getDay()).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const state = getWashState(day);
          return (
            <div
              key={day.toISOString()}
              className={`relative flex flex-col items-center justify-start gap-1 sm:gap-1.5 rounded-md sm:rounded-lg text-center transition-all ${
                isToday(day) ? "ring-2 ring-cyan-500 bg-cyan-50"
                : state === "completed" ? "bg-green-50"
                : state === "missed" ? "bg-red-50"
                : "hover:bg-slate-50"
              }`}
              style={{ minHeight: "60px", padding: "6px 2px" }}
            >
              {/* Bigger date number */}
              <span className={`text-sm sm:text-lg font-semibold ${isToday(day) ? "text-cyan-700" : "text-slate-700"}`}>
                {format(day, "d")}
              </span>
              {/* Bigger status icons */}
              <div>
                {state === "completed" && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
                {state === "missed" && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                {state === "neutral" && <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-5 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200">
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          <span className="text-xs sm:text-sm">Car Washed</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600">
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          <span className="text-xs sm:text-sm">Car Not Washed</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600">
          <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
          <span className="text-xs sm:text-sm">Not Available</span>
        </div>
      </div>
    </motion.div>
  );
}