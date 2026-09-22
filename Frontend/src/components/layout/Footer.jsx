import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaFacebook } from 'react-icons/fa';
import whiteLogo from '../../assets/images/logo-white-withoutbg.png';

const Footer = () => {
  const [contactDetails, setContactDetails] = useState({
    address: 'S.No. 456/2C1B, D.No. 2/266, ALANGULAM, Vembakottai (Tk), Virudhunagar (Dt)',
    phone: '93639 53616',
    email: 'hari953616@gmail.com'
  });

  const [footerData, setFooterData] = useState({
    categories: [],
    socials: [
      { id: 'whatsapp', platform: 'WhatsApp', url: '', isActive: true },
      { id: 'phone', platform: 'Phone Call', url: '', isActive: true },
      { id: 'mail', platform: 'Mail', url: '', isActive: true },
      { id: 'facebook', platform: 'Facebook', url: '', isActive: true }
    ]
  });

  const [logoUrl, setLogoUrl] = useState(whiteLogo);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.data.general_settings?.logo_url) {
            setLogoUrl(data.data.general_settings.logo_url);
          }
          if (data.data.contact_details) {
            setContactDetails(data.data.contact_details);
          }
          if (data.data.footer_cms) {
            setFooterData(prev => ({
              ...prev,
              categories: data.data.footer_cms.categories || prev.categories,
              socials: data.data.footer_cms.socials && data.data.footer_cms.socials.length > 0 ? data.data.footer_cms.socials : prev.socials
            }));
          }
        }
      })
      .catch(err => console.error('Error fetching contact details:', err));
  }, []);

  // formatting the address to remove newlines for inline display
  const inlineAddress = contactDetails.address.replace(/\n/g, ', ');

  return (
    <footer className="bg-[#C70E17] text-white py-16 px-6 lg:px-20 font-body relative overflow-hidden border-t-4 border-[#F8B400]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Logo Column */}
        <div className="w-full lg:w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 relative z-10">
          <Link to="/" className="inline-block transition-transform hover:scale-105 duration-300">
            <img src={whiteLogo} alt="Vela Agencies" className="w-52 sm:w-60 md:w-72 lg:w-full max-w-[300px] h-auto object-contain drop-shadow-lg" />
          </Link>
        </div>

        {/* Dynamic Categories (Max 2 columns) */}
        {footerData.categories.slice(0, 2).map((category) => (
          <div key={category.id} className="col-span-1">
            <h3 className="text-white font-heading font-bold text-lg mb-6 uppercase tracking-wider">{category.title}</h3>
            <ul className="space-y-4 text-sm">
              {category.links.map((link) => (
                <li key={link.id}>
                  <Link to={link.url} className="hover:text-yellow-300 hover:translate-x-1 inline-block transition-transform duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Useful Links (Static) */}
        <div className="col-span-1">
          <h3 className="text-white font-heading font-bold text-lg mb-6 uppercase tracking-wider">USEFUL LINKS</h3>
          <ul className="space-y-4 text-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
            <li><Link to="/" className="hover:text-yellow-300 hover:translate-x-1 inline-block transition-transform duration-300">Home</Link></li>
            <li><Link to="/shop" className="hover:text-yellow-300 hover:translate-x-1 inline-block transition-transform duration-300">Shop</Link></li>
            <li><Link to="/about" className="hover:text-yellow-300 hover:translate-x-1 inline-block transition-transform duration-300">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-300 hover:translate-x-1 inline-block transition-transform duration-300">Contact Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-yellow-300 hover:translate-x-1 inline-block transition-transform duration-300">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-yellow-300 hover:translate-x-1 inline-block transition-transform duration-300">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-start lg:items-start">
          <h3 className="text-white font-heading font-bold text-lg mb-4 uppercase tracking-wider">Join our newsletter!</h3>
          <p className="text-sm text-gray-100 mb-4">
            Will be used in accordance with our <Link to="/privacy-policy" className="text-yellow-300 hover:underline">Privacy Policy</Link>
          </p>
          <form className="w-full flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full px-4 py-3 rounded-full bg-transparent border border-white/30 focus:outline-none focus:border-yellow-300 text-white placeholder-gray-300"
              required
            />
            <button 
              type="submit"
              className="w-full px-6 py-3 rounded-full bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition-colors shadow-lg"
            >
              Subscribe
            </button>
          </form>

          {/* Dynamic Social Links */}
          <div className="flex gap-4 mt-6">
            {footerData.socials.map((social) => {
              if (!social.isActive) return null;
              
              let Icon = null;
              let iconColor = '';
              switch (social.id) {
                case 'whatsapp': Icon = FaWhatsapp; iconColor = 'text-[#25D366]'; break;
                case 'phone': Icon = FaPhoneAlt; iconColor = 'text-[#007bff]'; break;
                case 'mail': Icon = FaEnvelope; iconColor = 'text-[#F8B400]'; break;
                case 'facebook': Icon = FaFacebook; iconColor = 'text-[#1877F2]'; break;
                default: break;
              }

              return Icon ? (
                <a 
                  key={social.id}
                  href={social.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white flex items-center justify-center ${iconColor} hover:bg-yellow-400 hover:text-black transition-all hover:-translate-y-1 shadow-md`}
                  title={social.platform}
                >
                  <Icon className="text-lg" />
                </a>
              ) : null;
            })}
          </div>
        </div>
      </div>
      
      {/* Local & GEO SEO Content */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-xs text-white max-w-4xl opacity-90 leading-relaxed">
        <p className="mb-2">
          <strong>Vela Agencies Sivakasi</strong> is a top-rated <strong>fireworks supplier in Sivakasi</strong> and a trusted name in the <strong>Sivakasi business directory</strong>. As one of the leading <strong>wholesale traders in Sivakasi</strong>, we provide high-quality diwali crackers, combo packs, and sparklers across India. Buy directly from the <strong>Sivakasi wholesale market</strong> online and enjoy safe delivery from the most reliable <strong>fireworks manufacturer Sivakasi</strong>.
        </p>
        <p>
          <strong>Our Delivery Network (All India):</strong> We safely deliver premium Sivakasi crackers to all major states and cities including <strong>Tamil Nadu</strong> (Chennai, Coimbatore, Madurai, Trichy), <strong>Kerala</strong>, <strong>Karnataka</strong> (Bangalore), <strong>Andhra Pradesh</strong>, <strong>Telangana</strong> (Hyderabad), and across <strong>North India</strong> (Delhi, Mumbai, Gujarat, UP).
        </p>
      </div>

      {/* Bottom Footer Info */}
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between text-xs text-gray-200 font-medium">
        <p>&copy; {new Date().getFullYear()} Vela Agencies. All Rights Reserved.</p>
        <p className="mt-2 md:mt-0">{inlineAddress} | {contactDetails.phone} | {contactDetails.email}</p>
      </div>
    </footer>
  );
};

export default Footer;
