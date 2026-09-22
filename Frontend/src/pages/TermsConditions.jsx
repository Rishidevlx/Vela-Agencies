import React, { useState, useEffect } from 'react';
import SEO from '../components/seo/SEO';

const TermsConditions = () => {
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
        title="Terms & Conditions | Vela Agencies"
        description="Terms and Conditions for Vela Agencies. Read our policies regarding online fireworks shopping, delivery, pricing, and safety guidelines."
        url="https://www.velaagencies.com/terms-conditions"
      />
      
      <div className="container mx-auto px-4 lg:px-16 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-heading text-brand uppercase mb-8 border-b-2 border-brand/20 pb-4">
          Terms & Conditions
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Vela Agencies website (https://www.velaagencies.com), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Legal Age Requirement</h2>
            <p>
              Fireworks and crackers can only be purchased by individuals who are 18 years of age or older. By placing an order on our website, you confirm that you meet this legal age requirement. We reserve the right to cancel any order if we suspect the buyer is underage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Pricing and Product Availability</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All prices listed on our website are wholesale prices and are subject to change without prior notice depending on market conditions.</li>
              <li>While we strive to ensure all displayed products are in stock, availability is not guaranteed. In case an ordered item is out of stock, we will offer a suitable replacement or a refund for that specific item.</li>
              <li>Product images are for illustrative purposes only. Actual product packaging may vary.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Shipping and Delivery</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We deliver across Tamil Nadu, South India, and selected parts of North India using authorized transport partners.</li>
              <li>Delivery timelines are estimated and may be affected by unforeseen circumstances such as weather conditions, transport strikes, or festive rush.</li>
              <li>Customers must collect their parcels from the designated transport office in their respective cities. Door delivery is subject to the transport company's policies.</li>
              <li>Shipping charges are calculated based on the weight of the order and the destination.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Returns, Refunds, and Cancellations</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Due to the explosive nature of the products, we do not accept returns once the goods have been dispatched.</li>
              <li>Order cancellations must be made before the dispatch of the goods. Once dispatched, orders cannot be cancelled.</li>
              <li>If you receive a damaged parcel, please contact us immediately with unboxing photos/videos for us to assist you with the transport claim.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Safety Guidelines</h2>
            <p>
              Fireworks must be handled with extreme care. We urge all customers to read the safety instructions provided on the packaging before use. Vela Agencies shall not be held liable for any accidents, injuries, or property damage resulting from the misuse, improper handling, or negligence while using our products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Governing Law</h2>
            <p>
              These Terms & Conditions are governed by the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts located in Virudhunagar District, Tamil Nadu.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Information</h2>
            <p>If you have any questions regarding these Terms & Conditions, please contact us:</p>
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

export default TermsConditions;
