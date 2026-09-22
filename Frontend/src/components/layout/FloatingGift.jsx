import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaGift, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';

const FloatingGift = () => {
  const { isCartOpen } = useCart();
  const location = useLocation();
  const [giftConfig, setGiftConfig] = useState({
    isActive: false,
    image: '',
    heading: '',
    content: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.giftbox_settings) {
          setGiftConfig(data.data.giftbox_settings);
        }
      })
      .catch(err => console.error('Error fetching giftbox settings:', err));
  }, []);

  if (!giftConfig.isActive || isCartOpen || location.pathname === '/shop') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    // You can send this number to backend here if needed
    toast.success('Thank you! We will contact you shortly.');
    setMobileNumber('');
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-[170px] right-6 bg-[#C70E17] text-white border-2 border-white/80 p-4 rounded-full shadow-lg shadow-red-500/30 hover:scale-110 hover:bg-[#a60b13] hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
      >
        <FaGift className="text-2xl animate-bounce text-white" />
        
        {/* Tooltip on hover */}
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Special Offers!
        </span>
      </button>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Animated Fireworks Background */}
          <div className="absolute inset-0 bg-black/80">
            <div className="fireworks-container absolute inset-0 overflow-hidden pointer-events-none">
              <div className="firework"></div>
              <div className="firework"></div>
              <div className="firework"></div>
            </div>
          </div>
          <style>{`
            @keyframes firework {
              0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
              50% { width: 0.5vmin; opacity: 1; }
              100% { width: var(--finalSize); opacity: 0; }
            }
            .firework, .firework::before, .firework::after {
              --initialSize: 0.5vmin;
              --finalSize: 45vmin;
              --particleSize: 0.2vmin;
              --color1: yellow;
              --color2: khaki;
              --color3: white;
              --color4: lime;
              --color5: gold;
              --color6: mediumseagreen;
              --y: -30vmin;
              --x: -50%;
              --initialY: 60vmin;
              content: "";
              animation: firework 2s infinite;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, var(--y));
              width: var(--initialSize);
              aspect-ratio: 1;
              background: 
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 50% 0%,
                radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 50%,
                radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 50% 100%,
                radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 0% 50%,
                radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 80% 90%,
                radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 95% 90%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 90% 70%,
                radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 60%,
                radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 55% 80%,
                radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 70% 77%,
                radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 22% 90%,
                radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 45% 90%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 33% 70%,
                radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 10% 60%,
                radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 31% 80%,
                radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 28% 77%,
                radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 13% 72%,
                radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 80% 10%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 95% 14%,
                radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 90% 23%,
                radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 100% 43%,
                radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 85% 27%,
                radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 77% 37%,
                radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 60% 7%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 22% 14%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 45% 20%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 33% 34%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 10% 29%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 31% 37%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 28% 7%,
                radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 13% 42%;
              background-size: var(--initialSize) var(--initialSize);
              background-repeat: no-repeat;
            }
            .firework::before {
              --x: -120%;
              --y: -50vmin;
              --initialY: -5vmin;
              transform: translate(-50%, -50%) rotate(40deg) scale(1.3) rotateY(40deg);
            }
            .firework::after {
              --x: -50%;
              --y: -50vmin;
              --initialY: -5vmin;
              transform: translate(-50%, -50%) rotate(170deg) scale(1.15) rotateY(-30deg);
            }
            .firework:nth-child(2) {
              --x: 30vmin;
            }
            .firework:nth-child(2), .firework:nth-child(2)::before, .firework:nth-child(2)::after {
              --color1: pink;
              --color2: violet;
              --color3: fuchsia;
              --color4: orchid;
              --color5: plum;
              --color6: lavender;  
              --finalSize: 40vmin;
              animation-delay: -0.25s;
            }
            .firework:nth-child(3) {
              --x: -30vmin;
            }
            .firework:nth-child(3), .firework:nth-child(3)::before, .firework:nth-child(3)::after {
              --color1: cyan;
              --color2: lightcyan;
              --color3: lightblue;
              --color4: PaleTurquoise;
              --color5: SkyBlue;
              --color6: lavender;
              --finalSize: 35vmin;
              animation-delay: -0.4s;
            }
          `}</style>
          
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative z-10">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-white/80 p-1.5 rounded-full z-10 transition-colors"
            >
              <FaTimes />
            </button>

            {/* Header Image */}
            {giftConfig.image && (
              <div className="w-full h-48 sm:h-56">
                <img 
                  src={giftConfig.image} 
                  alt="Special Offer" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content & Form */}
            <div className="p-6 sm:p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 font-heading mb-3">
                {giftConfig.heading || 'Special Offer!'}
              </h2>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {giftConfig.content || 'Enter your mobile number to get an exclusive discount code.'}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex bg-gray-50 border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#C70E17] focus-within:border-[#C70E17] transition-shadow">
                  <div className="flex items-center justify-center px-4 bg-gray-100 border-r border-gray-300 text-gray-700 font-semibold select-none">
                    +91
                  </div>
                  <input 
                    type="text" 
                    value={mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setMobileNumber(val);
                    }}
                    placeholder="Enter 10-digit number" 
                    className="flex-1 w-full px-4 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#C70E17] text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-[#a60b13] hover:shadow-lg transition-all"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingGift;
