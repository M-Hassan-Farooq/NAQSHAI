import LegalPageLayout from '@/components/LegalPageLayout';

export const metadata = {
  title: 'Terms and Conditions | NAQSHAI',
  description: 'Read the terms for using NAQSHAI real estate discovery, geospatial analysis, AI advisory, and plot-listing services.',
};

function TermsSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title="Terms and Conditions"
      description="These terms apply when you access or use NAQSHAI. By using the service, you agree to follow them."
    >
      <TermsSection title="1. About the service">
        <p>
          NAQSHAI provides real estate discovery tools, geospatial visualizations, risk indicators, AI-assisted recommendations, and a facility for submitting plot listings for review. Features, data coverage, and availability may change over time.
        </p>
        <p>
          NAQSHAI is an information and discovery service. It is not a real estate broker, seller, legal adviser, financial adviser, surveyor, or government authority.
        </p>
      </TermsSection>

      <TermsSection title="2. Accounts and acceptable use">
        <p>
          You are responsible for keeping your account credentials secure and for activity carried out through your account. Provide accurate account details and keep them up to date.
        </p>
        <p>
          Do not misuse the service, attempt to access another person&apos;s account or data, interfere with site operation, upload unlawful or malicious material, or use the platform to mislead other users.
        </p>
      </TermsSection>

      <TermsSection title="3. Listings and documents">
        <p>
          If you submit a plot, you confirm that the information and documents you provide are accurate to the best of your knowledge and that you are authorized to submit them. You are responsible for having permission to share any personal or ownership documents you upload.
        </p>
        <p>
          Submissions may be reviewed and can be rejected or returned for correction. A listing is not public merely because it has been submitted; it is published only after the applicable review and approval process. Do not upload documents belonging to another person without authorization.
        </p>
      </TermsSection>

      <TermsSection title="4. Information, maps, and AI output">
        <p>
          Maps, listing details, market information, geospatial metrics, and AI responses may be incomplete, delayed, approximate, or affected by third-party data. They are provided for general informational purposes and are not a guarantee of a property&apos;s condition, title, value, regulatory status, or suitability.
        </p>
        <p>
          Verify important facts independently with relevant authorities and qualified professionals before making a purchase, investment, or other decision. Do not rely on an AI response as legal, financial, or professional advice.
        </p>
      </TermsSection>

      <TermsSection title="5. Third-party services">
        <p>
          Some features rely on third-party services, including Supabase, Google Maps, and Google Gemini. Their availability and use are also subject to the relevant provider&apos;s terms and privacy practices. NAQSHAI does not control third-party services or external sites linked from the platform.
        </p>
      </TermsSection>

      <TermsSection title="6. Intellectual property">
        <p>
          NAQSHAI and its licensors retain rights in the platform, branding, and original materials. You may use the service for personal, lawful property discovery and listing purposes, but may not copy, redistribute, or commercially exploit platform materials except where the law permits or we authorize it.
        </p>
        <p>
          You retain responsibility for content you submit and grant NAQSHAI permission to process and display the relevant listing information as needed to provide review and listing features.
        </p>
      </TermsSection>

      <TermsSection title="7. Availability and liability">
        <p>
          We may update, suspend, or discontinue features and may restrict access where reasonably necessary to protect the service or its users. The service is provided on an “as available” basis to the extent permitted by law.
        </p>
        <p>
          To the extent permitted by applicable law, NAQSHAI is not responsible for decisions made in reliance on informational or AI-generated content, third-party data or outages, or indirect losses arising from use of the service. These terms do not limit liability or rights that cannot legally be limited.
        </p>
      </TermsSection>

      <TermsSection title="8. Suspension and changes to these terms">
        <p>
          We may suspend or end access if these terms are materially breached or if necessary to protect the platform and its users. You may stop using NAQSHAI at any time.
        </p>
        <p>
          We may revise these terms as the service changes. The date above shows the latest revision. Continued use after an update means the updated terms apply, subject to any notice or consent required by law.
        </p>
      </TermsSection>

      <TermsSection title="9. Contact">
        <p>
          For questions about these terms, contact the NAQSHAI operator through the official contact channel provided with the service or your account.
        </p>
      </TermsSection>
    </LegalPageLayout>
  );
}
