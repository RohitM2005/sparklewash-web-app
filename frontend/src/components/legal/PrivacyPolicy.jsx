import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: "easeOut" },
  }),
};

export default function PrivacyPolicyContent() {
  return (
    <div className="space-y-4">
      <Section index={0} title="1. Introduction">
        SparkleWash is committed to protecting your privacy and ensuring
        transparency in how your data is used.
      </Section>

      <Section index={1} title="2. Information Collection">
        We may collect the following information:
        <List items={["Name", "Phone number", "Address", "Vehicle details"]} />
      </Section>

      <Section index={2} title="3. Purpose of Data Collection">
        Collected data is used for:
        <List
          items={[
            "Service delivery",
            "Customer support",
            "Payment processing",
            "Communication and updates",
          ]}
        />
      </Section>

      <Section index={3} title="4. Payment Security">
        <List
          items={[
            "Payments are securely processed via third-party providers such as Razorpay.",
            "We do not store sensitive payment details like card numbers or CVV.",
          ]}
        />
      </Section>

      <Section index={4} title="5. Communication Consent">
        By using our services, you consent to receive:
        <List
          items={[
            "WhatsApp messages",
            "Emails",
            "Notifications",
            "Promotional content",
          ]}
        />
        <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
          You may opt out at any time.
        </p>
      </Section>

      <Section index={5} title="6. Data Sharing">
        We do not sell your personal data. Data may be shared only with:
        <List
          items={[
            "Payment gateways",
            "Legal authorities (if required)",
          ]}
        />
      </Section>

      <Section index={6} title="7. Data Security">
        We implement reasonable technical and organizational measures to protect
        your data from unauthorized access or misuse.
      </Section>

      <Section index={7} title="8. User Rights">
        You have the right to:
        <List
          items={[
            "Request access to your data",
            "Request deletion of your data",
            "Withdraw consent for marketing",
          ]}
        />
      </Section>

      <Section index={8} title="9. Policy Updates">
        This Privacy Policy may be updated periodically. Continued use of
        services implies acceptance of updates.
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
      {/* Left accent bar */}
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
