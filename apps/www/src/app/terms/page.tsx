export default function TermsOfServicePage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl pt-20">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            These Terms of Service constitute a legally binding agreement made
            between you, whether personally or on behalf of an entity ("you")
            and Mocknica ("we," "us" or "our"), concerning your access to and
            use of the Mocknica website as well as any other media form, media
            channel, mobile website or mobile application related, linked, or
            otherwise connected thereto (collectively, the "Site").
          </p>
          <p>
            You agree that by accessing the Site, you have read, understood, and
            agree to be bound by all of these Terms of Service. IF YOU DO NOT
            AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY
            PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE
            IMMEDIATELY.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Intellectual Property Rights
          </h2>
          <p className="mb-4">
            Unless otherwise indicated, the Site is our proprietary property and
            all source code, databases, functionality, software, website
            designs, audio, video, text, photographs, and graphics on the Site
            (collectively, the "Content") and the trademarks, service marks, and
            logos contained therein (the "Marks") are owned or controlled by us
            or licensed to us, and are protected by copyright and trademark laws
            and various other intellectual property rights and unfair
            competition laws of the United States, international copyright laws,
            and international conventions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. User Representations
          </h2>
          <p className="mb-4">
            By using the Site, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              All registration information you submit will be true, accurate,
              current, and complete.
            </li>
            <li>
              You will maintain the accuracy of such information and promptly
              update such registration information as necessary.
            </li>
            <li>
              You have the legal capacity and you agree to comply with these
              Terms of Service.
            </li>
            <li>
              You are not a minor in the jurisdiction in which you reside.
            </li>
            <li>
              You will not access the Site through automated or non-human means,
              whether through a bot, script or otherwise.
            </li>
            <li>
              You will not use the Site for any illegal or unauthorized purpose.
            </li>
            <li>
              Your use of the Site will not violate any applicable law or
              regulation.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Prohibited Activities
          </h2>
          <p className="mb-4">
            You may not access or use the Site for any purpose other than that
            for which we make the Site available. The Site may not be used in
            connection with any commercial endeavors except those that are
            specifically endorsed or approved by us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. User Generated Contributions
          </h2>
          <p className="mb-4">
            The Site may invite you to chat, contribute to, or participate in
            blogs, message boards, online forums, and other functionality, and
            may provide you with the opportunity to create, submit, post,
            display, transmit, perform, publish, distribute, or broadcast
            content and materials to us or on the Site, including but not
            limited to text, writings, video, audio, photographs, graphics,
            comments, suggestions, or personal information or other material
            (collectively, "Contributions").
          </p>
          <p>
            Contributions may be viewable by other users of the Site and through
            third-party websites. As such, any Contributions you transmit may be
            treated as non-confidential and non-proprietary.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Disclaimer</h2>
          <p className="mb-4">
            THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE
            THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE
            RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
            WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR
            USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES
            OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p className="mb-4">
            In order to resolve a complaint regarding the Site or to receive
            further information regarding use of the Site, please contact us at:
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
