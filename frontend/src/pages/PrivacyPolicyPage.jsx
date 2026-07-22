import React, { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";
import PrivacyPolicyContent from "../components/legal/PrivacyPolicy";

export default function PrivacyPolicyPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <LegalLayout
      icon="🔐"
      title="Privacy Policy"
      subtitle="How SparkleWash collects, uses, and protects your personal information."
      effectiveDate="01 April 2026"
    >
      <PrivacyPolicyContent />
    </LegalLayout>
  );
}
