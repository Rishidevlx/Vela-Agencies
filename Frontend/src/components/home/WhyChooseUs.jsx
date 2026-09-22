import React from 'react';
import { Link } from 'react-router-dom';
import homeDeliveryImg from '../../assets/home delivery.png';

const WhyChooseUs = () => {
  return (
    <section className="py-16 md:py-24 bg-[#C70E17] font-body overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Side: Image */}
          <div className="w-full lg:w-1/2 relative group">
            {/* Decorative background behind image */}
            <div className="absolute inset-0 bg-white/10 rounded-2xl transform rotate-3 scale-105 transition-transform duration-500 group-hover:rotate-6"></div>
            <img 
              src={homeDeliveryImg} 
              alt="Vela Agencies - Wholesale Crackers Dealers in Sivakasi" 
              className="relative z-10 w-full h-auto object-contain rounded-2xl drop-shadow-2xl transition-transform duration-500 group-hover:-translate-y-2"
            />
          </div>

          {/* Right Side: SEO Content */}
          <div className="w-full lg:w-1/2 text-white">
            <span className="inline-block py-1 px-4 rounded-full bg-white/15 text-yellow-300 font-bold text-xs uppercase tracking-widest mb-3">
              Direct Sivakasi Manufacturer Deals
            </span>
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-heading font-bold uppercase leading-tight mb-6 drop-shadow-sm">
              <span className="text-white">Wholesale Crackers Dealers in </span><span className="text-[#F8B400]">Sivakasi</span>
            </h2>
            
            <div className="space-y-6 text-white/90 text-sm md:text-base leading-relaxed font-medium">
              <p>
                <strong className="text-white text-lg">Vela Agencies in Sivakasi</strong> is your most trusted direct factory destination for 
                <strong> online crackers shopping in Sivakasi</strong>. We offer an extensive catalogue of premium Sivakasi fireworks including 
                sound crackers, sparklers, fancy multi-colour aerial sky shots, flower pots, ground chakkars, gift boxes, and kids special novelty crackers.
              </p>
              
              <p>
                We guarantee unbeatable <strong>genuine wholesale prices</strong>, swift dispatch, and strict safety-tested ISI green cracker standards for all your 
                wedding, Diwali, and festive celebrations. Experience effortless ordering with Vela Agencies.
              </p>

              <div className="pt-4">
                <Link to="/shop" className="inline-block bg-[#F8B400] text-[#C70E17] hover:bg-white hover:text-[#C70E17] font-heading uppercase font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base">
                  Spread the Festive Cheer! &rarr;
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
