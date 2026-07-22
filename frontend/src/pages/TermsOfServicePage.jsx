import React, { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";
import TermsConditionsContent from "../components/legal/TermsConditions";

export default function TermsOfServicePage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <LegalLayout
      icon="📄"
      title="Terms & Conditions"
      subtitle="The rules and guidelines governing your use of SparkleWash services."
      effectiveDate="01 April 2026"
      lastUpdated="01 April 2026"
    >
      <TermsConditionsContent />
    </LegalLayout>
  );
}
