import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiDownload, FiCheckCircle, FiTruck, FiShield } from 'react-icons/fi';
import defaultBanner from '../../assets/images/banners/crackers1.png'; // Fallback

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch banners from CMS
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
        const data = await response.json();
        if (data.success && data.data.hero_banners) {
          const parsedBanners = data.data.hero_banners;
          if (Array.isArray(parsedBanners) && parsedBanners.length > 0) {
            setBanners(parsedBanners);
          } else {
            setBanners([defaultBanner]); // Fallback if empty array
          }
        } else {
          setBanners([defaultBanner]); // Fallback if not found
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setBanners([defaultBanner]); // Fallback on error
      }
    };
    
    fetchBanners();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="flex flex-col bg-white w-full">
      
      {/* Slider Images with Smooth Left-to-Right Animated Swipe & Full Banner Display (No Cropping) */}
      <div className="relative w-full overflow-hidden bg-white">
        <div 
          className="flex w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((img, index) => (
            <div 
              key={index}
              className="w-full flex-shrink-0 flex items-center justify-center select-none bg-white"
            >
              <img 
                src={img} 
                alt={`Vela Agencies Sivakasi Crackers Wholesale - Offer Banner ${index + 1}`} 
                className="w-full h-auto max-h-[85vh] object-contain object-center pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 md:h-2.5 rounded-full transition-all duration-500 shadow-md ${
                  index === currentSlide 
                    ? 'bg-brand w-6 md:w-8 scale-110' 
                    : 'bg-white/60 hover:bg-white w-2 md:w-2.5'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        )}
      </div>

      {/* Redesigned Content Section Below Slider */}
      <section className="relative py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/30 overflow-hidden">
        {/* Subtle Decorative Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-10 w-72 h-72 bg-red-100/50 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-10 w-80 h-80 bg-yellow-100/60 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 py-1.5 px-5 rounded-full bg-white border border-[#C70E17]/20 shadow-sm mb-5 hover:scale-105 transition-transform duration-300">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C70E17] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C70E17]"></span>
            </span>
            <span className="text-xs md:text-sm font-heading font-bold text-[#C70E17] uppercase tracking-wider">
              ✨ Premium Quality Crackers 2026
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black mb-5 leading-tight tracking-tight uppercase text-gray-900">
            <span className="text-[#C70E17] drop-shadow-sm">VELA AGENCIES</span>{' '}
            <span className="text-gray-900">SIVAKASI CRACKERS</span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-gray-600 mb-8 max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed font-body">
            Buy authentic Sivakasi Crackers online directly from <strong className="text-gray-900 font-semibold">Vela Agencies in Sivakasi</strong>. 
            Light up your celebrations with Sivakasi's finest 100% genuine factory wholesale fireworks and green crackers delivered safely to your doorstep.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-12">
            <Link 
              to="/shop" 
              className="bg-[#C70E17] hover:bg-[#F8B400] text-white hover:text-white font-heading font-bold py-3.5 md:py-4 px-8 md:px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 transform hover:-translate-y-1 uppercase tracking-wider text-sm md:text-base group cursor-pointer"
            >
              <span>Shop Now</span>
              <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <a 
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/pricelist/download`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white border-2 border-[#C70E17] text-[#C70E17] hover:bg-[#F8B400] hover:text-white hover:border-[#F8B400] font-heading font-bold py-3.5 md:py-4 px-8 md:px-10 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-wider text-sm md:text-base flex items-center gap-2 cursor-pointer"
            >
              <FiDownload className="text-lg" />
              <span>Download Pricelist</span>
            </a>
          </div>

          {/* Trust & Highlight Badges Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-6 border-t border-gray-200/80">
            <div className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-white/80 border border-gray-100 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-[#C70E17]">
                <FiShield className="text-lg" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 uppercase">100% Genuine</p>
                <p className="text-[11px] text-gray-500">Direct Sivakasi Factory</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-white/80 border border-gray-100 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-[#F8B400]">
                <FiCheckCircle className="text-lg" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 uppercase">Wholesale Price</p>
                <p className="text-[11px] text-gray-500">Guaranteed Lowest Rates</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-white/80 border border-gray-100 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-[#C70E17]">
                <FiTruck className="text-lg" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 uppercase">Safe Delivery</p>
                <p className="text-[11px] text-gray-500">All-India Transport Network</p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Hero;

