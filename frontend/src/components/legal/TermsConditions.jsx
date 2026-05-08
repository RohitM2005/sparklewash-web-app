export default function TermsConditionsContent() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500 font-medium">
        Effective Date: 01 April 2026 | Last Updated: 01 April 2026
      </p>

      <Section title="1. Definitions">
        <List items={[
          '"Company" refers to SparkleWash, owned by Vrushabh Wanjale.',
          '"Customer" / "User" refers to any individual using our services.',
          '"Services" refers to car cleaning services provided by SparkleWash.'
        ]} />
      </Section>

      <Section title="2. Acceptance of Terms">
        By accessing or using our services, you acknowledge that you have read,
        understood, and agree to be legally bound by these Terms &amp; Conditions.
      </Section>

      <Section title="3. Services Offered">
        SparkleWash provides doorstep car cleaning services, including but not limited to:
        <List items={[
          "Exterior washing",
          "Interior cleaning (as per selected plan)"
        ]} />
        Services are provided six (6) days a week (Monday to Saturday),
        excluding Sundays and public holidays.
      </Section>

      <Section title="4. Subscription & Billing">
        <SubSection title="4.1 Subscription Model">
          Services are offered on a monthly subscription basis.
        </SubSection>
        <SubSection title="4.2 Payment Terms">
          Payment shall be made after completion of the service cycle.
          Accepted payment methods include:
          <List items={["UPI", "Razorpay", "Bank Transfer", "Cash"]} />
        </SubSection>
        <SubSection title="4.3 Auto-Renewal">
          Subscriptions shall automatically renew at the end of each billing
          cycle. Users must provide at least ten (10) days' prior notice to
          cancel before the next billing cycle.
        </SubSection>
      </Section>

      <Section title="5. Service Conditions">
        <SubSection title="5.1 Scheduling">
          Services are delivered at a fixed time slot assigned to the customer.
        </SubSection>
        <SubSection title="5.2 External Factors">
          SparkleWash shall not be held responsible for service disruptions caused by:
          <List items={[
            "Weather conditions (including rain)",
            "Society regulations or restrictions",
            "Parking limitations"
          ]} />
        </SubSection>
        <SubSection title="5.3 Vehicle Availability">
          If the vehicle is unavailable, the service shall be deemed completed
          for that day. If the vehicle remains unavailable for more than fifteen
          (15) consecutive days, adjustments may be made in the next billing cycle.
        </SubSection>
      </Section>

      <Section title="6. Customer Obligations">
        The Customer agrees to:
        <List items={[
          "Provide proper access to the vehicle",
          "Ensure parking permissions",
          "Inform the Company in advance regarding prolonged absence"
        ]} />
      </Section>

      <Section title="7. Limitation of Liability">
        <List items={[
          "SparkleWash shall have limited liability for damages.",
          "Liability shall only arise where damage is directly caused by our personnel and the Customer provides verifiable proof (photos/videos)."
        ]} />
      </Section>

      <Section title="8. Cancellation Policy">
        <List items={[
          "Customers may cancel services by providing ten (10) days' prior notice.",
          "No refunds or adjustments shall be made for mid-cycle cancellations."
        ]} />
      </Section>

      <Section title="9. Modifications">
        SparkleWash reserves the right to modify pricing, service structure,
        and terms &amp; policies at any time without prior notice.
      </Section>

      <Section title="10. Governing Law">
        These Terms shall be governed by and interpreted in accordance with
        the laws of India, and jurisdiction shall lie in Pune, Maharashtra.
      </Section>

      <Section title="11. Contact Details">
        <div className="space-y-1 text-slate-600">
          <p><strong>SparkleWash</strong></p>
          <p>Owner: Vrushabh Wanjale</p>
          <p>📍 Warje Malwadi, Pune – 411058</p>
          <p>📧 sparklewash5001@gmail.com</p>
          <p>📞 +91 9309225001</p>
        </div>
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

function SubSection({ title, children }) {
  return (
    <div className="mt-2">
      <p className="font-semibold text-slate-800 text-xs mb-1">{title}</p>
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
