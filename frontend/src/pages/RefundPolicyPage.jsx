import React, { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";
import RefundPolicyContent from "../components/legal/RefundPolicy";

export default function RefundPolicyPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <LegalLayout
      icon="💸"
      title="Refund & Cancellation Policy"
      subtitle="Understand the conditions under which refunds and cancellations are processed."
      effectiveDate="01 April 2026"
    >
      <RefundPolicyContent />
    </LegalLayout>
  );
}
