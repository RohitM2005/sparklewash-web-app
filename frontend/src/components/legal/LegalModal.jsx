import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LegalModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl
              max-h-[85vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6
              border-b border-slate-200 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-4 sm:p-6 text-slate-700 text-sm leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 flex-shrink-0 text-center">
              <p className="text-[10px] sm:text-xs text-slate-500">
                SparkleWash – Your Daily Car Wash Partner &nbsp;|&nbsp;
                📞 9309225001 &nbsp;|&nbsp;
                📧 sparklewash5001@gmail.com &nbsp;|&nbsp;
                🌐 www.sparklewash.in
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
