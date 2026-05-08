export default function RefundPolicyContent() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500 font-medium">
        Effective Date: 01 April 2026
      </p>

      <Section title="1. General Policy">
        All refunds are evaluated on a case-by-case basis at the sole
        discretion of SparkleWash.
      </Section>

      <Section title="2. Non-Refundable Conditions">
        Refunds shall not be applicable in the following cases:
        <List items={[
          "Mid-cycle cancellation",
          "Customer unavailability of vehicle",
          "Service disruption due to society or external conditions"
        ]} />
      </Section>

      <Section title="3. Missed Services">
        In case of missed services attributable to SparkleWash, compensation
        shall be provided in the form of:
        <List items={[
          "Additional service days or extra wash"
        ]} />
      </Section>

      <Section title="4. Refund Eligibility">
        Refunds may be granted only if:
        <List items={[
          "Service was not delivered due to fault on our part",
          "Valid proof is provided by the customer"
        ]} />
      </Section>

      <Section title="5. Cancellation Terms">
        <List items={[
          "Cancellation requires ten (10) days' prior notice before the next billing cycle.",
          "Failure to provide notice will result in automatic renewal."
        ]} />
      </Section>

      <Section title="6. Service Adjustments">
        If the vehicle remains unavailable for more than 15 days, adjustments
        will be made in the next billing cycle.
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
