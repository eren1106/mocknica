export default function PrivacyPolicyPage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl pt-20">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Mocknica ("we," "our," or "us"). We are committed to
            protecting your personal information and your right to privacy. If
            you have any questions or concerns about this privacy notice or our
            practices with regard to your personal information, please contact
            us.
          </p>
          <p>
            This Privacy Policy applies to all information collected through our
            website (https://mocknica.com), our application, and any related
            services, sales, marketing, or events.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Information We Collect
          </h2>
          <p className="mb-4">
            We collect personal information that you voluntarily provide to us
            when you register on the website, express an interest in obtaining
            information about us or our products and services, when you
            participate in activities on the website, or otherwise when you
            contact us.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Personal Information Provided by You:</strong> We collect
              names; email addresses; usernames; passwords; and other similar
              information.
            </li>
            <li>
              <strong>Social Media Login Data:</strong> We may provide you with
              the option to register with us using your existing social media
              account details, like your GitHub, Google, or other social media
              account.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use personal information collected via our website for a variety
            of business purposes described below. We process your personal
            information for these purposes in reliance on our legitimate
            business interests, in order to enter into or perform a contract
            with you, with your consent, and/or for compliance with our legal
            obligations.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To post testimonials.</li>
            <li>To request feedback.</li>
            <li>To enable user-to-user communications.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Sharing Your Information
          </h2>
          <p className="mb-4">
            We only share information with your consent, to comply with laws, to
            provide you with services, to protect your rights, or to fulfill
            business obligations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="mb-4">
            We have implemented appropriate technical and organizational
            security measures designed to protect the security of any personal
            information we process. However, despite our safeguards and efforts
            to secure your information, no electronic transmission over the
            Internet or information storage technology can be guaranteed to be
            100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have questions or comments about this policy, you may email
            us or contact us by post at:
          </p>
          <address className="not-italic">
            Mocknica Team
            <br />
            {/* [Address]<br /> */}
            mocknica.info@gmail.com
          </address>
        </section>
      </div>
    </main>
  );
}
