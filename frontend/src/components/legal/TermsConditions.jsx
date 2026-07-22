import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.055, ease: "easeOut" },
  }),
};

export default function TermsConditionsContent() {
  return (
    <div className="space-y-4">
      <Section index={0} title="1. Definitions">
        <List
          items={[
            '"Company" refers to SparkleWash, owned by Vrushabh Wanjale.',
            '"Customer" / "User" refers to any individual using our services.',
            '"Services" refers to car cleaning services provided by SparkleWash.',
          ]}
        />
      </Section>

      <Section index={1} title="2. Acceptance of Terms">
        By accessing or using our services, you acknowledge that you have read,
        understood, and agree to be legally bound by these Terms &amp; Conditions.
      </Section>

      <Section index={2} title="3. Services Offered">
        SparkleWash provides doorstep car cleaning services, including but not
        limited to:
        <List
          items={[
            "Exterior washing",
            "Interior cleaning (as per selected plan)",
          ]}
        />
        <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
          Services are provided six (6) days a week (Monday to Saturday),
          excluding Sundays and public holidays.
        </p>
      </Section>

      <Section index={3} title="4. Subscription & Billing">
        <SubSection title="4.1 Subscription Model">
          Services are offered on a monthly subscription basis.
        </SubSection>
        <SubSection title="4.2 Payment Terms">
          Payment shall be made after completion of the service cycle. Accepted
          payment methods include:
          <List items={["UPI", "Razorpay", "Bank Transfer", "Cash"]} />
        </SubSection>
        <SubSection title="4.3 Auto-Renewal">
          Subscriptions shall automatically renew at the end of each billing
          cycle. Users must provide at least ten (10) days' prior notice to
          cancel before the next billing cycle.
        </SubSection>
      </Section>

      <Section index={4} title="5. Service Conditions">
        <SubSection title="5.1 Scheduling">
          Services are delivered at a fixed time slot assigned to the customer.
        </SubSection>
        <SubSection title="5.2 External Factors">
          SparkleWash shall not be held responsible for service disruptions
          caused by:
          <List
            items={[
              "Weather conditions (including rain)",
              "Society regulations or restrictions",
              "Parking limitations",
            ]}
          />
        </SubSection>
        <SubSection title="5.3 Vehicle Availability">
          If the vehicle is unavailable, the service shall be deemed completed
          for that day. If the vehicle remains unavailable for more than fifteen
          (15) consecutive days, adjustments may be made in the next billing
          cycle.
        </SubSection>
      </Section>

      <Section index={5} title="6. Customer Obligations">
        The Customer agrees to:
        <List
          items={[
            "Provide proper access to the vehicle",
            "Ensure parking permissions",
            "Inform the Company in advance regarding prolonged absence",
          ]}
        />
      </Section>

      <Section index={6} title="7. Limitation of Liability">
        <List
          items={[
            "SparkleWash shall have limited liability for damages.",
            "Liability shall only arise where damage is directly caused by our personnel and the Customer provides verifiable proof (photos/videos).",
          ]}
        />
      </Section>

      <Section index={7} title="8. Cancellation Policy">
        <List
          items={[
            "Customers may cancel services by providing ten (10) days' prior notice.",
            "No refunds or adjustments shall be made for mid-cycle cancellations.",
          ]}
        />
      </Section>

      <Section index={8} title="9. Modifications">
        SparkleWash reserves the right to modify pricing, service structure, and
        terms &amp; policies at any time without prior notice.
      </Section>

      <Section index={9} title="10. Governing Law">
        These Terms shall be governed by and interpreted in accordance with the
        laws of India, and jurisdiction shall lie in Pune, Maharashtra.
      </Section>

      <Section index={10} title="11. Contact Details">
        <div className="space-y-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          <ContactRow
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            label="SparkleWash"
            bold
          />
          <ContactRow
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            label="Owner: Vrushabh Wanjale"
          />
          <ContactRow
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Warje Malwadi, Pune – 411058"
          />
          <ContactRow
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            label={
              <a href="mailto:sparklewash5001@gmail.com" className="text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-2">
                sparklewash5001@gmail.com
              </a>
            }
          />
          <ContactRow
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
            label={
              <a href="tel:+919309225001" className="text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-2">
                +91 9309225001
              </a>
            }
          />
        </div>
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

function SubSection({ title, children }) {
  return (
    <div className="mt-4 first:mt-0 pl-4 border-l-2 border-slate-100 dark:border-slate-700">
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1.5">
        {title}
      </p>
      <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </div>
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

function ContactRow({ icon, label, bold }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-cyan-500 dark:text-cyan-400 flex-shrink-0">{icon}</span>
      <span className={bold ? "font-bold text-slate-800 dark:text-slate-200" : ""}>{label}</span>
    </div>
  );
}
