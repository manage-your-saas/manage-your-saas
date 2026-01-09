import { Header } from '@/components/header'

export const metadata = {
  title: "Terms of Service",
};

export default function TermsOfService() {
  return (
    <main className="mt-7 tracking-wider max-w-4xl mx-auto px-6 py-16 text-gray-800">
      <Header />
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-6 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
      <p>
        By accessing or using this service, you agree to be bound by these Terms
        of Service.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        2. Description of Service
      </h2>
      <p>
        We provide a dashboard that aggregates analytics, social metrics, and
        revenue data from third-party platforms to help SaaS founders understand
        their business.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        3. Account Responsibilities
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You are responsible for maintaining your account security</li>
        <li>You must provide accurate information</li>
        <li>You must not misuse or abuse the service</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        4. Third-Party Services
      </h2>
      <p>
        We are not affiliated with Google, Stripe, Reddit, X, LinkedIn, or any
        other third-party service. Data accuracy and availability depend on these
        providers.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        5. Payments & Subscriptions
      </h2>
      <p>
        Paid plans are billed via Stripe. Subscriptions renew automatically
        unless canceled. Lifetime plans are one-time payments and non-refundable
        except where required by law.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        6. Fair Use
      </h2>
      <p>
        You may not attempt to reverse engineer, resell, scrape, or abuse the
        service or its underlying systems.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        7. Availability
      </h2>
      <p>
        The service is provided “as is” without guarantees of uptime or
        availability. Maintenance may cause temporary downtime.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        8. Termination
      </h2>
      <p>
        We reserve the right to suspend or terminate accounts that violate these
        terms. You may cancel your account at any time.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        9. Limitation of Liability
      </h2>
      <p>
        We are not liable for lost revenue, data loss, or business decisions made
        using the service.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        10. Governing Law
      </h2>
      <p>
        These terms are governed by the laws of India.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        11. Changes to Terms
      </h2>
      <p>
        We may update these terms at any time. Continued use of the service means
        acceptance of the updated terms.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        12. Contact
      </h2>
      <p>
        For questions, contact us at:{" "}
        <strong>manageyoursaas@gmail.com</strong>
      </p>
    </main>
  );
}
