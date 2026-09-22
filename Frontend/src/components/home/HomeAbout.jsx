import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import crackerRunningImg from '../../assets/images/Cracker Running.png';

const HomeAbout = () => {
  return (
    <section className="relative w-full py-14 md:py-20 bg-white overflow-hidden border-t-4 border-[#C70E17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          
          {/* Left Side: Content */}
          <div className="w-full lg:w-3/5 text-left">
            <span className="inline-block py-1.5 px-4 rounded-full bg-[#C70E17]/10 text-[#C70E17] font-bold text-xs uppercase tracking-wider mb-3">
              Sivakasi's Most Trusted Fireworks Dealer
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading tracking-wider mb-4 text-[#C70E17] uppercase drop-shadow-sm font-extrabold">
              Online Crackers in Sivakasi
            </h2>
            
            <div className="text-sm sm:text-base font-body leading-relaxed text-gray-700 space-y-4">
              <p className="font-bold text-[#C70E17] text-base sm:text-lg uppercase tracking-wide">
                Vela Agencies – Wholesale & Retail Crackers in Sivakasi
              </p>
              <p className="text-gray-600 leading-relaxed">
                Welcome to <strong>Vela Agencies</strong>, the premier destination to <strong>buy crackers online in Sivakasi</strong>. As one of the top authorized wholesale suppliers of 100% genuine Sivakasi fireworks and green crackers, we bring factory-direct wholesale prices directly to families and businesses across Tamil Nadu, South India, and all over India.
              </p>

              <div className="bg-red-50/60 p-4 sm:p-5 rounded-2xl border border-red-100 shadow-sm mt-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C70E17]"></span>
                  Why Choose Vela Agencies in Sivakasi:
                </h3>
                <ul className="space-y-2 text-gray-700 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-[#C70E17] mt-0.5 shrink-0 text-base" />
                    <span><strong>Direct Factory Wholesale Prices:</strong> Guaranteed lowest rates straight from Sivakasi manufacturing units.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-[#C70E17] mt-0.5 shrink-0 text-base" />
                    <span><strong>100% Certified Green Crackers:</strong> Safe, eco-friendly, low-smoke, and ISI-standard fireworks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-[#C70E17] mt-0.5 shrink-0 text-base" />
                    <span><strong>Doorstep Transport Delivery:</strong> Reliable, damage-proof packing & swift dispatch across all major cities.</span>
                  </li>
                </ul>
              </div>

              <p className="font-semibold text-[#C70E17] mt-3 text-xs sm:text-sm">
                Contact <strong>Vela Agencies</strong> today for bulk bookings, custom gift boxes, and special festival discounts!
              </p>
            </div>

            <div className="mt-7 flex justify-start">
              <Link 
                to="/about"
                className="bg-[#C70E17] hover:bg-[#F8B400] text-white hover:text-white px-7 sm:px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Know More About Us <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="w-full lg:w-2/5 flex justify-center items-center select-none">
            <img 
              src={crackerRunningImg} 
              alt="Vela Agencies Sivakasi Crackers" 
              draggable={false}
              className="w-full max-h-[420px] object-contain drop-shadow-xl select-none pointer-events-none transition-transform duration-500 hover:scale-105" 
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HomeAbout;
