import { motion } from "framer-motion";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function ComplaintsPage() {
  return (
    <motion.div {...fadeIn}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Complaints</h1>
        <p className="text-gray-500 text-sm">Manage customer complaints</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">
          Complaints Feature Coming Soon
        </h2>
        <p className="text-slate-400 text-sm max-w-md text-center">
          This feature is under development. Customer complaints, ticket management,
          and support threads will be available here.
        </p>
      </div>
    </motion.div>
  );
}
