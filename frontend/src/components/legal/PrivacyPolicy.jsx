export default function PrivacyPolicyContent() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500 font-medium">
        Effective Date: 01 April 2026
      </p>

      <Section title="1. Introduction">
        SparkleWash is committed to protecting your privacy and ensuring
        transparency in how your data is used.
      </Section>

      <Section title="2. Information Collection">
        We may collect the following information:
        <List items={["Name", "Phone number", "Address", "Vehicle details"]} />
      </Section>

      <Section title="3. Purpose of Data Collection">
        Collected data is used for:
        <List items={[
          "Service delivery",
          "Customer support",
          "Payment processing",
          "Communication and updates"
        ]} />
      </Section>

      <Section title="4. Payment Security">
        <List items={[
          "Payments are securely processed via third-party providers such as Razorpay.",
          "We do not store sensitive payment details like card numbers or CVV."
        ]} />
      </Section>

      <Section title="5. Communication Consent">
        By using our services, you consent to receive:
        <List items={[
          "WhatsApp messages",
          "Emails",
          "Notifications",
          "Promotional content"
        ]} />
        You may opt out at any time.
      </Section>

      <Section title="6. Data Sharing">
        We do not sell your personal data. Data may be shared only with:
        <List items={[
          "Payment gateways",
          "Legal authorities (if required)"
        ]} />
      </Section>

      <Section title="7. Data Security">
        We implement reasonable technical and organizational measures to
        protect your data from unauthorized access or misuse.
      </Section>

      <Section title="8. User Rights">
        You have the right to:
        <List items={[
          "Request access to your data",
          "Request deletion of your data",
          "Withdraw consent for marketing"
        ]} />
      </Section>

      <Section title="9. Policy Updates">
        This Privacy Policy may be updated periodically. Continued use of
        services implies acceptance of updates.
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
      <div className="text-slate-600">{children}</div>
    </div>
  );
}

function List({ items }) {
  return (
    <ul className="mt-1.5 space-y-1 pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-cyan-500 mt-1 flex-shrink-0">●</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
