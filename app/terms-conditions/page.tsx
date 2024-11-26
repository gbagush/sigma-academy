"use client";
import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="max-w-xl w-full text-start">
        <h1 className="text-4xl font-semibold">Terms and Conditions</h1>
        <p className="text-foreground/75 mt-2">
          Last updated: November 26, 2024
        </p>

        <p className="text-foreground/75 mt-8">
          These Terms and Conditions (&quot;Terms&quot;) govern your use of
          Sigma Academy (&quot;we,&quot; &quot;our,&quot; or
          &quot;platform&quot;). By accessing or using Sigma Academy, you agree
          to comply with these Terms. If you do not agree with these Terms,
          please refrain from using our platform.
        </p>

        <h2 className="text-xl font-semibold mt-4">1. Nature of the Project</h2>
        <p className="text-foreground/75">
          Sigma Academy is a non-commercial educational platform. All content
          available on this platform is sourced from publicly available free
          resources on the internet.
        </p>

        <h2 className="text-xl font-semibold mt-4">2. Use of Content</h2>
        <p className="text-foreground/75">
          All materials provided on Sigma Academy are for personal and
          educational purposes only. We do not claim ownership of the content
          unless otherwise stated. Redistribution or commercial use of content
          may be subject to the original license terms.
        </p>

        <h2 className="text-xl font-semibold mt-4">3. User Responsibilities</h2>
        <p className="text-foreground/75">
          By using Sigma Academy, you agree to:
        </p>
        <ul className="list-disc list-inside">
          <li>Use the platform for personal and educational purposes only.</li>
          <li>
            Avoid redistributing any content that violates licensing terms.
          </li>
          <li>
            Avoid activities that may disrupt the operation of the platform.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-4">4. Intellectual Property</h2>
        <p className="text-foreground/75">
          Sigma Academy does not own the content provided unless explicitly
          mentioned. All third-party content remains the intellectual property
          of its creators. Please respect the original licenses and terms for
          such content.
        </p>

        <h2 className="text-xl font-semibold mt-4">
          5. Limitations of Liability
        </h2>
        <p className="text-foreground/75">
          Sigma Academy and its creators make no warranties regarding the
          accuracy, reliability, or completeness of the materials provided. We
          are not liable for any damages or issues arising from the use of
          content found on the platform.
        </p>

        <h2 className="text-xl font-semibold mt-4">
          6. Modifications to the Platform
        </h2>
        <p className="text-foreground/75">
          Sigma Academy reserves the right to modify or discontinue any part of
          the platform without prior notice. These changes may include content
          updates or removal, platform updates, or other improvements.
        </p>

        <h2 className="text-xl font-semibold mt-4">
          7. Links to External Sites
        </h2>
        <p className="text-foreground/75">
          The platform may include links to external websites for reference or
          additional resources. Sigma Academy is not responsible for the content
          or privacy practices of these external sites.
        </p>

        <h2 className="text-xl font-semibold mt-4">8. Reporting Issues</h2>
        <p className="text-foreground/75">
          If you believe any content violates licensing terms or intellectual
          property rights, please contact us at:{" "}
          <Link
            href="mailto:support@sigmaacademy.my.id"
            className="text-blue-500 underline"
          >
            support@sigmaacademy.my.id
          </Link>
        </p>

        <h2 className="text-xl font-semibold mt-4">9. Governing Law</h2>
        <p className="text-foreground/75">
          These Terms are governed by the laws of [Your Jurisdiction], and any
          disputes arising will be resolved exclusively in [Your Jurisdiction].
        </p>

        <h2 className="text-xl font-semibold mt-4">10. Contact Us</h2>
        <p className="text-foreground/75">
          For any questions or concerns regarding these Terms, please contact us
          at:{" "}
          <Link
            href="mailto:support@sigmaacademy.my.id"
            className="text-blue-500 underline"
          >
            support@sigmaacademy.my.id
          </Link>
        </p>
      </div>
    </section>
  );
}
