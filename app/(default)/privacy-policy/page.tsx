"use client";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="max-w-xl w-full text-start">
        <h1 className="text-4xl font-semibold">Privacy Policy</h1>
        <p className="text-foreground/75 mt-2">
          Last updated: December 2, 2024
        </p>

        <p className="text-foreground/75 mt-8">
          Sigma Academy (&quot;we,&quot; &quot;our,&quot; or
          &quot;platform&quot;) respects your privacy and is committed to
          protecting your personal information. This privacy policy explains how
          we collect, use, and safeguard your data when you visit or use Sigma
          Academy, accessible at{" "}
          <Link
            href="https://sigmaacademy.my.id"
            className="text-blue-500 underline"
          >
            https://sigmaacademy.my.id
          </Link>
          .
        </p>

        <h2 className="text-xl font-semibold mt-4">Information We Collect</h2>
        <p className="text-foreground/75">
          We may collect the following information from you:
        </p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Personal Data</strong>: Name, email, and payment details.
          </li>
          <li>
            <strong>Automatic Data</strong>: Information collected through
            tracking technologies like cookies, including IP addresses, device
            types, and usage activity.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-4">
          How We Use Your Information
        </h2>
        <p className="text-foreground/75">We use your information to:</p>
        <ul className="list-disc list-inside">
          <li>
            Provide the services you need, including processing transactions.
          </li>
          <li>
            Conduct analytics to improve user experience and develop new
            features.
          </li>
          <li>
            Send notification emails related to account activation, password
            reset, and other authentication purposes.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-4">
          Cookies and Tracking Technologies
        </h2>
        <p className="text-foreground/75">
          We use cookies to enhance user experience and analyze user activity
          through tools like <strong>Google Analytics</strong>. Our cookies are
          not used for advertising purposes.
        </p>

        <h2 className="text-xl font-semibold mt-4">
          Sharing Information with Third Parties
        </h2>
        <p className="text-foreground/75">
          We do not sell your data. However, we share your data with:
        </p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Xendit</strong> for processing payment transactions.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-4">
          Data Storage and Security
        </h2>
        <ul className="list-disc list-inside">
          <li>
            Your data is stored on our local servers and cloud services with
            high-security protocols.
          </li>
          <li>
            We use data encryption and two-factor authentication to protect your
            information.
          </li>
          <li>Data is retained until your account is deleted.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4">User Rights</h2>
        <p className="text-foreground/75">As a user, you have the right to:</p>
        <ul className="list-disc list-inside">
          <li>
            Access, update, or delete your personal information at any time.
          </li>
          <li>
            To exercise your rights, please contact us at{" "}
            <Link
              href="mailto:support@sigmaacademy.my.id"
              className="text-blue-500 underline"
            >
              support@sigmaacademy.my.id
            </Link>
            .
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-4">Use by Children</h2>
        <p className="text-foreground/75">
          This platform is accessible to children under parental supervision. We
          encourage parents to monitor their children&apos;s activities while
          using our platform.
        </p>

        <h2 className="text-xl font-semibold mt-4">
          Changes to this Privacy Policy
        </h2>
        <p className="text-foreground/75">
          We may update this privacy policy from time to time. Any changes will
          be announced on our website to keep you informed.
        </p>

        <h2 className="text-xl font-semibold mt-4">Contact Us</h2>
        <p className="text-foreground/75">
          If you have any questions about this privacy policy or how we handle
          your data, please contact us at:{" "}
          <Link
            href="mailto:support@sigmaacademy.my.id"
            className="text-blue-500 underline"
          >
            support@sigmaacademy.my.id
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
