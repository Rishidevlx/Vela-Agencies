import React, { useState, useEffect } from 'react';

const bannerBgColors = [
  '#FDD980', // Banner 1 - Sandal color
  '#001475', // Banner 2 - Royal / Dark Blue
  '#512A76', // Banner 3 - Light dark Purple color
];

const ShopBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch banners from CMS (Same as Home page)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
        const data = await response.json();
        if (data.success && data.data.hero_banners && data.data.hero_banners.length > 0) {
          setBanners(data.data.hero_banners);
        } else {
          setBanners(['/Banner/Shop page banner.jpg']); // Fallback
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setBanners(['/Banner/Shop page banner.jpg']); // Fallback on error
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

  // Dispatch color change event for navbar sync
  useEffect(() => {
    const color = bannerBgColors[currentSlide % bannerBgColors.length] || '#FDD980';
    window.dispatchEvent(new CustomEvent('banner-color-change', { detail: { color, index: currentSlide } }));
  }, [currentSlide]);

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((img, index) => {
          const bgColor = bannerBgColors[index % bannerBgColors.length] || '#FDD980';
          return (
            <div 
              key={index}
              className="w-full flex-shrink-0 flex items-center justify-center transition-colors duration-700 select-none"
              style={{ backgroundColor: bgColor }}
            >
              <img 
                src={img} 
                alt={`Shop Banner ${index + 1}`} 
                className="w-full h-auto object-contain object-center pointer-events-none"
              />
            </div>
          );
        })}
      </div>

      {/* Slider Controls */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/50 hover:bg-white'}`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopBanner;
