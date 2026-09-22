import React, { useState, useEffect } from 'react';
import SEO from '../components/seo/SEO';

const PrivacyPolicy = () => {
  const [contactDetails, setContactDetails] = useState({
    address: 'S.No. 456/2C1B, D.No. 2/266, ALANGULAM, Vembakottai (Tk), Virudhunagar (Dt)',
    phone: '93639 53616',
    email: 'hari953616@gmail.com'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch dynamic contact details from CMS
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.contact_details) {
          setContactDetails(data.data.contact_details);
        }
      })
      .catch(err => console.error('Error fetching contact details:', err));
  }, []);

  // Format address for display
  const formattedAddress = contactDetails.address.split('\n').map((line, i) => (
    <span key={i}>{line}<br /></span>
  ));

  return (
    <div className="font-body text-black bg-white min-h-screen pt-24 pb-16">
      <SEO 
        title="Privacy Policy | Vela Agencies"
        description="Privacy Policy for Vela Agencies. Learn how we collect, use, and protect your personal information when you use our website for online crackers shopping."
        url="https://www.velaagencies.com/privacy-policy"
      />
      
      <div className="container mx-auto px-4 lg:px-16 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-heading text-brand uppercase mb-8 border-b-2 border-brand/20 pb-4">
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Welcome to Vela Agencies. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website (https://www.velaagencies.com) and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="mb-2">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, phone number, shipping address, and billing address when you place an order or register an account.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, including your IP address, browser type, pages visited, and time spent on the site.</li>
              <li><strong>Cookies:</strong> We use cookies to enhance your browsing experience and analyze website traffic.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="mb-2">We use the collected data for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and deliver your orders accurately.</li>
              <li>To communicate with you regarding your orders, inquiries, or promotional offers.</li>
              <li>To improve our website functionality, customer service, and overall user experience.</li>
              <li>To process payments securely (we do not store your payment card details).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Security</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your data only with trusted third-party service providers (such as courier partners and payment gateways) strictly for the purpose of fulfilling your orders. We implement strict security measures to protect your personal information from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. If you wish to make changes to your data or opt-out of our marketing communications, please contact us using the details provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to This Policy</h2>
            <p>
              We reserve the right to update this Privacy Policy at any time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
            <ul className="mt-3 space-y-1 font-medium text-gray-800">
              <li>Vela Agencies</li>
              <li>{formattedAddress}</li>
              <li>Phone: +91 {contactDetails.phone}</li>
              <li>Email: {contactDetails.email}</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
