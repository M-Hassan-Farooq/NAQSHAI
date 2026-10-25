import LegalPageLayout from '@/components/LegalPageLayout';

export const metadata = {
  title: 'Privacy Policy | NAQSHAI',
  description: 'Learn what information NAQSHAI uses to provide real estate and geospatial services, and how it is handled.',
};

function PolicySection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="This policy explains how NAQSHAI handles information when you use our real estate discovery, geospatial analysis, AI advisory, and plot-listing services."
    >
      <PolicySection title="1. Information we handle">
        <p>
          Depending on how you use NAQSHAI, we may handle account details such as your name, email address, and phone number; profile information and avatar images; plot searches, saved favorites, listing details, and messages you send to the AI advisor.
        </p>
        <p>
          If you submit a plot for verification, we also handle the ownership and identity documents you upload, including CNIC images and allotment or transfer documents, along with the contact details you provide for that listing.
        </p>
        <p>
          The service and its providers may also receive technical information needed to operate and secure the site, such as browser requests, error details, and authentication events.
        </p>
      </PolicySection>

      <PolicySection title="2. How we use information">
        <p>
          We use information to create and secure accounts, save your preferences and drafts, show maps and property information, respond to AI advisor requests, verify submitted listings, communicate about account or listing activity, and maintain the reliability and security of NAQSHAI.
        </p>
        <p>
          Geospatial indicators, market information, and AI-generated recommendations are provided to support discovery and review. They do not replace independent property, legal, financial, or engineering advice.
        </p>
      </PolicySection>

      <PolicySection title="3. Service providers and sharing">
        <p>
          NAQSHAI relies on service providers to operate its features. Supabase provides authentication, database, and file-storage services. Google Maps services provide map and place features. Google Gemini processes prompts sent to the AI advisor to generate responses and recommendations.
        </p>
        <p>
          Information included in a map request, AI prompt, account request, or uploaded file may therefore be processed by the relevant provider to deliver that feature. Review the providers&apos; own privacy information for details about their handling and retention practices.
        </p>
        <p>
          Plot documents are used for listing verification and are not intended to be publicly displayed as listing content. We may disclose information where needed to protect users or the service, meet a legal obligation, or respond to a valid legal request.
        </p>
      </PolicySection>

      <PolicySection title="4. Cookies and browser storage">
        <p>
          NAQSHAI uses essential cookies or browser storage for authentication, saved preferences, and site functionality. For example, the app stores login state and selected preferences in the browser. The cookie notice dismissal is also saved in browser storage.
        </p>
        <p>
          NAQSHAI does not currently use analytics or advertising cookies. If that changes, this policy and the notice will be updated before those optional technologies are introduced.
        </p>
      </PolicySection>

      <PolicySection title="5. Retention and security">
        <p>
          Information is retained for as long as needed to provide the service, manage accounts and listings, complete verification, resolve disputes, and meet applicable obligations. Retention periods can vary by information type and service provider.
        </p>
        <p>
          We use access controls and other reasonable safeguards appropriate to the service. No online service or transmission method can be guaranteed completely secure.
        </p>
      </PolicySection>

      <PolicySection title="6. Your choices and requests">
        <p>
          You can update profile information through account settings and discard eligible listing drafts through the seller dashboard. You can choose not to provide optional profile information, but some features—such as submitting a listing for verification—require the information and documents requested for that feature.
        </p>
        <p>
          Depending on the law that applies to you, you may be able to request access to, correction of, or deletion of your personal information. To make a privacy request, contact the NAQSHAI operator through the official contact channel provided with the service or your account. Some information may need to be retained for security, verification, or legal reasons.
        </p>
      </PolicySection>

      <PolicySection title="7. Children and changes">
        <p>
          NAQSHAI is a real estate information service and is not directed to children. We do not knowingly seek personal information from children.
        </p>
        <p>
          We may update this policy as the service changes. The date at the top of this page indicates when it was last revised; material changes will be communicated through the service where appropriate.
        </p>
      </PolicySection>
    </LegalPageLayout>
  );
}
