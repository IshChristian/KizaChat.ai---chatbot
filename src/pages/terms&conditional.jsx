import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-center text-purple-600">KizaChat.ai Terms & Conditions</h1>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">1. Introduction</h2>
        <p className="text-gray-600">
          Welcome to KizaChat.ai! These Terms and Conditions govern your use of our services and platform. By accessing or
          using KizaChat.ai, you agree to comply with and be bound by these terms. If you do not agree to these terms, please
          refrain from using our services.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">2. User Registration</h2>
        <p className="text-gray-600">
          In order to use certain features of KizaChat.ai, you may be required to create an account. You are responsible for
          maintaining the confidentiality of your account information and for all activities that occur under your account.
          You agree to notify us immediately of any unauthorized use of your account.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">3. Acceptable Use</h2>
        <p className="text-gray-600">
          You agree to use KizaChat.ai in a lawful and ethical manner. You shall not:
          <ul className="list-disc pl-6 mt-2">
            <li>Engage in any unlawful activities, including but not limited to hacking, spamming, or data mining.</li>
            <li>Use the platform to distribute harmful, offensive, or inappropriate content.</li>
            <li>Impersonate any person or entity, or falsely represent your affiliation with any entity or organization.</li>
            <li>Violate any applicable laws, regulations, or third-party rights.</li>
          </ul>
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">4. Privacy and Data Security</h2>
        <p className="text-gray-600">
          Your privacy is important to us. KizaChat.ai will collect and process your personal data in accordance with our 
          <a href="/legal" className="text-purple-600">Privacy Policy</a>. We take reasonable precautions to safeguard your
          data, but cannot guarantee its absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">5. Intellectual Property</h2>
        <p className="text-gray-600">
          All content on the KizaChat.ai platform, including but not limited to text, images, logos, and code, is the 
          property of KizaChat.ai and is protected by copyright laws. You may not use, reproduce, or distribute any of 
          this content without our express permission, unless permitted by law.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">6. Disclaimers</h2>
        <p className="text-gray-600">
          KizaChat.ai is provided "as is" without warranties of any kind, either express or implied, including but not 
          limited to the accuracy, completeness, or reliability of any content, service, or feature provided by the platform.
          We do not guarantee that the services will be uninterrupted or error-free.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">7. Limitation of Liability</h2>
        <p className="text-gray-600">
          KizaChat.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
          arising out of or relating to the use or inability to use the platform. Our total liability, whether in contract, 
          tort, or otherwise, shall not exceed the amount you paid for the use of the service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">8. Modifications</h2>
        <p className="text-gray-600">
          KizaChat.ai reserves the right to modify, suspend, or discontinue any part of the service at any time, with or 
          without notice. We may update these Terms and Conditions periodically, and we encourage you to review them regularly.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">9. Governing Law</h2>
        <p className="text-gray-600">
          These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in
          which KizaChat.ai operates. Any disputes will be subject to the exclusive jurisdiction of the courts in that jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">10. Contact Information</h2>
        <p className="text-gray-600">
          If you have any questions regarding these Terms and Conditions, please contact us at 
          <a href="mailto:support@kizachat.ai" className="text-purple-600">support@kizachat.ai</a>.
        </p>
      </section>

      <div className="text-center">
        <p className="text-gray-600">
          By using KizaChat.ai, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
