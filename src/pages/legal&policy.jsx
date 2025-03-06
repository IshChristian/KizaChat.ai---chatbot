import React from 'react';

const LegalPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-center text-purple-600">KizaChat.ai Legal & Policy</h1>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">1. Terms of Service</h2>
        <p className="text-gray-600">
          By using KizaChat.ai, you agree to abide by the terms and conditions set forth in this agreement.
          KizaChat.ai is a platform that provides conversational AI services and is not responsible for any content
          shared during conversations, including the information provided by the users or responses generated.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">2. Privacy Policy</h2>
        <p className="text-gray-600">
          KizaChat.ai values your privacy. We collect and store only the information necessary to provide services.
          Your email address may be used for account-related purposes, but will never be shared with third parties
          without your consent, except as required by law.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">3. Data Usage</h2>
        <p className="text-gray-600">
          The data collected during your interactions with KizaChat.ai may be used for the purpose of improving
          the chatbot's functionality, providing more accurate responses, and enhancing the overall user experience.
          However, all data will be handled in compliance with relevant privacy regulations.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">4. Limitations of Liability</h2>
        <p className="text-gray-600">
          KizaChat.ai is not responsible for any decisions or actions taken based on the information provided by the AI.
          The platform is designed for general information purposes and should not be considered as legal, medical,
          or financial advice. You agree to use the chatbot at your own risk.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">5. User Responsibilities</h2>
        <p className="text-gray-600">
          Users are responsible for ensuring that they do not share sensitive, confidential, or inappropriate information
          while using KizaChat.ai. Any misuse or violation of the platform's guidelines may result in suspension or termination
          of access to the service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">6. Contact Information</h2>
        <p className="text-gray-600">
          For any inquiries or concerns about the legal terms or policies of KizaChat.ai, please contact our support team
          at <a href="mailto:support@kizachat.ai" className="text-purple-600">ishimwechristia94@gmail.com</a>.
        </p>
      </section>

      <div className="text-center">
        <p className="text-gray-600">
          By using KizaChat.ai, you acknowledge that you have read and understood the above terms and policies.
        </p>
      </div>
    </div>
  );
};

export default LegalPolicy;
