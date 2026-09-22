import React, { useState, useEffect } from 'react';
import SEO from '../components/seo/SEO';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [contactDetails, setContactDetails] = useState({
    address: 'S.No. 456/2C1B, D.No. 2/266, ALANGULAM, Vembakottai (Tk), Virudhunagar (Dt)',
    phone: '+91 93639 53616',
    email: 'hari953616@gmail.com',
    working_hours: 'Monday to Sunday: 9:00 AM - 9:00 PM',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.141517032128!2d77.79524451478953!3d9.452668593226768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cee43b8210e3%3A0x868b446a2a07d4b4!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1689254125867!5m2!1sen!2sin'
  });

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.contact_details) {
          setContactDetails(data.data.contact_details);
        }
      })
      .catch(err => console.error('Error fetching contact details:', err));
  }, []);

  return (
    <div className="font-body text-black min-h-screen bg-primary">
      <SEO 
        title="Contact Us | Vela Agencies Sivakasi"
        description="Get in touch with Vela Agencies for wholesale crackers orders, enquiries, and bulk bookings. Visit our shop in Sivakasi or contact us online."
        keywords="contact vela agencies, crackers shop phone number, sivakasi fireworks contact, buy crackers wholesale contact"
        url="https://www.velaagencies.com/contact"
      />
      
      {/* 1. Banner Section */}
      <section 
        className="relative h-40 sm:h-48 md:h-64 lg:h-80 bg-cover bg-center flex items-center"
        style={{ backgroundImage: 'url("/Banner/new_contact_banner.jpg")' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 lg:px-16 flex flex-col items-center justify-center z-10 text-center relative">
          <h1 className="text-4xl md:text-5xl font-heading text-white uppercase mb-4 drop-shadow-md">
            Contact Us
          </h1>
          <div className="text-white text-sm md:text-base font-body">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-200">Contact</span>
          </div>
        </div>
      </section>

      {/* 2. Main Content (Form & Info) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-16 flex flex-col lg:flex-row gap-12">
          
          {/* Left: Store Information */}
          <div className="w-full lg:w-1/3 bg-primary p-8 rounded-lg shadow-sm h-fit">
            <h3 className="text-2xl font-heading text-black uppercase mb-6 border-b-2 border-[#C70E17] pb-2 inline-block">
              Store Information
            </h3>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="text-[#C70E17] text-xl mt-1"><FaMapMarkerAlt /></div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Vela Agencies Address :</h4>
                  <p className="text-gray-600 whitespace-pre-line">{contactDetails.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-[#C70E17] text-xl mt-1"><FaPhoneAlt /></div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Vela Agencies Contact Numbers :</h4>
                  <div className="flex flex-col gap-1 text-gray-600">
                    {[
                      contactDetails.phone1 || contactDetails.phone,
                      contactDetails.phone2,
                      contactDetails.phone3,
                      contactDetails.phone4
                    ].filter(Boolean).map((num, idx) => (
                      <a 
                        key={idx} 
                        href={`tel:${num.replace(/[^\d+]/g, '')}`} 
                        className="hover:text-[#C70E17] transition-colors font-medium flex items-center gap-1.5"
                      >
                        <span>{num}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-[#C70E17] text-xl mt-1"><FaEnvelope /></div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Mail :</h4>
                  <a href={`mailto:${contactDetails.email}`} className="text-[#C70E17] hover:underline">{contactDetails.email}</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-[#C70E17] text-xl mt-1"><FaClock /></div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Opening Hours :</h4>
                  <p className="text-gray-600">{contactDetails.working_hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form & Map */}
          <div className="w-full lg:w-2/3 flex flex-col gap-12">
            <div>
              <h2 className="text-3xl font-heading text-[#C70E17] uppercase mb-4">Let's Get In Touch!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You can contact us any way that is convenient for you. We are available 24/7 via phone or email. 
                You can also use a quick contact form below or visit our office personally. We would be happy to answer your questions.
              </p>

              <form className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                    <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#C70E17]" />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" placeholder="Your Email" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#C70E17]" />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                    <input type="tel" placeholder="Phone Number" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#C70E17]" />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Subject</label>
                    <input type="text" placeholder="Subject" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#C70E17]" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                  <textarea placeholder="Your Message" rows="5" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#C70E17]"></textarea>
                </div>

                <button type="button" className="bg-[#C70E17] text-white font-heading text-lg uppercase py-3 px-8 rounded hover:bg-footer transition-colors w-fit shadow-md">
                  Send Message
                </button>
              </form>
            </div>


          </div>

        </div>
      </section>

      {/* 3. Full Width Map Section */}
      <section className="w-full h-96">
        <iframe 
          title="Vela Agencies Location"
          src={contactDetails.map_url} 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full block"
        ></iframe>
      </section>

      {/* 4. Marquee Footer Section */}
      <section className="bg-white py-4 shadow-sm w-full overflow-hidden border-t border-gray-100">
        <div className="flex w-full whitespace-nowrap hover:[animation-play-state:paused]">
          <div className="flex animate-marquee shrink-0 items-center font-heading text-xl md:text-2xl text-[#C70E17] uppercase tracking-wider">
            {[...Array(5)].map((_, i) => (
              <React.Fragment key={i}>
                <span className="mx-6">Online crackers shop near me</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                <span className="mx-6">Online crackers shop</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                <span className="mx-6">online pattasu kadai</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                <span className="mx-6">Sivakasi pattasu kadai</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                <span className="mx-6">Online crackers</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
              </React.Fragment>
            ))}
          </div>
          <div className="flex animate-marquee shrink-0 items-center font-heading text-xl md:text-2xl text-[#C70E17] uppercase tracking-wider" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <React.Fragment key={`dup-${i}`}>
                <span className="mx-6">Online crackers shop near me</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                <span className="mx-6">Online crackers shop</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                <span className="mx-6">online pattasu kadai</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                <span className="mx-6">Sivakasi pattasu kadai</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                <span className="mx-6">Online crackers</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
