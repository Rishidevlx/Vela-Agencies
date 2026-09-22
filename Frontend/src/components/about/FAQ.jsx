import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Where to buy authentic Sivakasi crackers online?",
      answer: "You can buy authentic Sivakasi crackers online directly from Vela Agencies. We offer genuine wholesale prices and a wide variety of fireworks, ensuring premium quality and safety."
    },
    {
      question: "Do you deliver Sivakasi crackers to North India?",
      answer: "Yes! While we are based in Sivakasi, we provide safe and secure cracker delivery across all of India, including North India, Chennai, Bangalore, and Kerala."
    },
    {
      question: "Is it safe to buy fireworks online from Sivakasi?",
      answer: "Absolutely. We ensure 100% safe packaging and use trusted transport partners to deliver your crackers damage-free. All our products are thoroughly tested for safety."
    },
    {
      question: "What is the minimum order quantity for wholesale crackers?",
      answer: "At Vela Agencies, we offer the best wholesale pricing for both small family combo packs and large bulk corporate orders. Check our pricelist for specific MOQ details per product."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  // Generate FAQ Schema (AEO Strategy)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-16 bg-white w-full">
      {/* Inject FAQ Schema into the DOM for Answer Engines */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <div className="container mx-auto px-4 lg:px-16 max-w-4xl">
        <div className="text-center mb-12">
          <p className="text-[#C70E17] font-bold uppercase tracking-wider mb-2">Got Questions?</p>
          <h2 className="text-3xl md:text-4xl font-heading text-black uppercase">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-[#C70E17] mx-auto mt-4 rounded"></div>
        </div>

        <div className="flex flex-col gap-4 font-body">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-lg overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-[#C70E17] shadow-md' : 'border-gray-200'}`}
            >
              <button 
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-5 md:p-6 bg-white hover:bg-gray-50 focus:outline-none text-left"
              >
                <h3 className={`text-lg md:text-xl font-bold ${openIndex === index ? 'text-[#C70E17]' : 'text-gray-800'}`}>
                  {faq.question}
                </h3>
                <div className={`text-2xl transition-transform duration-300 ${openIndex === index ? 'text-[#C70E17]' : 'text-gray-400'}`}>
                  {openIndex === index ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out bg-gray-50 overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-5 md:p-6 text-gray-700 leading-relaxed border-t border-gray-100">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
