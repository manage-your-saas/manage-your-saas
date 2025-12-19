export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicy() {
  return (
    <main style={{fontFamily: "var(--font-story-script)"}} className="mt-7 tracking-wider max-w-4xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-6 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-6">
        This Privacy Policy explains how we collect, use, and protect your
        information when you use our SaaS dashboard that aggregates analytics,
        social, and revenue data.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        1. Information We Collect
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Account information such as email and name</li>
        <li>
          Connected service data (read-only):
          <ul className="list-disc pl-6 mt-2">
            <li>Stripe (revenue, subscriptions)</li>
            <li>Google Analytics (traffic and usage data)</li>
            <li>Google Search Console (search performance)</li>
            <li>Social platforms like Reddit, X, LinkedIn (metrics only)</li>
          </ul>
        </li>
        <li>Technical data such as IP address, browser type, and device</li>
        <li>Cookies for authentication and session management</li>
      </ul>

      <p className="mt-4 font-medium">
        We do <strong>not</strong> collect passwords from connected services.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        2. How We Use Your Data
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To display dashboards and insights</li>
        <li>To operate and improve the product</li>
        <li>To provide customer support</li>
        <li>To communicate important service updates</li>
      </ul>

      <p className="mt-4 font-medium">
        We never sell or rent your personal data.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        3. Third-Party Services & OAuth
      </h2>
      <p>
        We access third-party services using official OAuth protocols and request
        only the minimum permissions required. You can revoke access at any time
        from your account or directly from the third-party provider.
      </p>

      <p className="mt-4">
        Our use of information received from Google APIs adheres to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          className="text-blue-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        4. Data Storage & Security
      </h2>
      <p>
        We use industry-standard security measures to protect your data.
        However, no system is completely secure, and we cannot guarantee absolute
        security.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        5. Data Retention & Deletion
      </h2>
      <p>
        You can delete your account at any time. Your data will be permanently
        deleted within a reasonable period unless retention is required by law
        (for example, billing records).
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        6. Your Rights
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Access your data</li>
        <li>Correct inaccurate data</li>
        <li>Delete your data</li>
        <li>Withdraw consent</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        7. Children’s Privacy
      </h2>
      <p>
        Our service is not intended for children under the age of 13. We do not
        knowingly collect data from children.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        8. Changes to This Policy
      </h2>
      <p>
        We may update this Privacy Policy from time to time. Significant changes
        will be communicated through the service.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        9. Contact Us
      </h2>
      <p>
        If you have questions, contact us at:{" "}
        <strong>support@yourdomain.com</strong>
      </p>
    </main>
  );
}
