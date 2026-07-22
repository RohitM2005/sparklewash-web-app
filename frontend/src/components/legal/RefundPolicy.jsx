import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: "easeOut" },
  }),
};

export default function RefundPolicyContent() {
  return (
    <div className="space-y-4">
      <Section index={0} title="1. General Policy">
        All refunds are evaluated on a case-by-case basis at the sole discretion
        of SparkleWash.
      </Section>

      <Section index={1} title="2. Non-Refundable Conditions">
        Refunds shall not be applicable in the following cases:
        <List
          items={[
            "Mid-cycle cancellation",
            "Customer unavailability of vehicle",
            "Service disruption due to society or external conditions",
          ]}
        />
      </Section>

      <Section index={2} title="3. Missed Services">
        In case of missed services attributable to SparkleWash, compensation
        shall be provided in the form of:
        <List items={["Additional service days or extra wash"]} />
      </Section>

      <Section index={3} title="4. Refund Eligibility">
        Refunds may be granted only if:
        <List
          items={[
            "Service was not delivered due to fault on our part",
            "Valid proof is provided by the customer",
          ]}
        />
      </Section>

      <Section index={4} title="5. Cancellation Terms">
        <List
          items={[
            "Cancellation requires ten (10) days' prior notice before the next billing cycle.",
            "Failure to provide notice will result in automatic renewal.",
          ]}
        />
      </Section>

      <Section index={5} title="6. Service Adjustments">
        If the vehicle remains unavailable for more than 15 days, adjustments
        will be made in the next billing cycle.
      </Section>
    </div>
  );
}

/* ── Shared primitives ──────────────────────────────────────────────────── */

function Section({ title, children, index = 0 }) {
  return (
    <motion.section
      custom={index}
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="flex">
        <div className="w-1 flex-shrink-0 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-l-2xl" />
        <div className="flex-1 px-5 sm:px-7 py-5 sm:py-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 leading-snug">
            {title}
          </h2>
          <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function List({ items }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center">
            <svg
              className="w-2.5 h-2.5 text-cyan-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
