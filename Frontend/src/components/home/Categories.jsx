import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import { FiImage } from 'react-icons/fi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/categories');
        const data = await response.json();
        if (data.success) {
          // Filter to show only active main categories
          const mainCategories = data.data.filter(c => c.parent_id === null && c.status === 'active');
          setCategories(mainCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    // Redirect to shop page with the category filter
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  if (categories.length === 0) return null;

  // Duplicate items if category count is small so that Swiper can loop & auto-scroll seamlessly
  let displayCategories = [...categories];
  if (categories.length > 0 && categories.length < 12) {
    while (displayCategories.length < 12) {
      displayCategories = [...displayCategories, ...categories];
    }
  }

  return (
    <div className="py-10 px-2 sm:px-8 lg:px-12 bg-gray-50/50 border-t border-b border-gray-100">
      <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
        <span className="text-[#C70E17] font-bold text-xs uppercase tracking-widest mb-1">
          Explore Our Collection
        </span>
        <h2 className="text-xl sm:text-3xl text-gray-900 font-extrabold uppercase font-heading">
          TOP CATEGORIES
        </h2>
        <div className="w-16 h-1 bg-[#C70E17] rounded-full mt-2"></div>
      </div>
      
      <div className="w-full relative px-2 sm:px-6">
        <Swiper
          slidesPerView={1}
          spaceBetween={16}
          loop={true}
          speed={900}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={true}
          modules={[Navigation, Autoplay]}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 16 },
            640: { slidesPerView: 3, spaceBetween: 20 },
            768: { slidesPerView: 4, spaceBetween: 24 },
            1024: { slidesPerView: 6, spaceBetween: 30 },
          }}
          className="categoriesSwiper pb-4"
        >
          {displayCategories.map((category, idx) => (
            <SwiperSlide key={`${category.id}-${idx}`}>
              <div 
                onClick={() => handleCategoryClick(category.name)}
                className="group flex flex-col items-center text-center p-2 sm:p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="mb-2.5 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white shadow-md border-2 border-transparent group-hover:border-[#C70E17] group-hover:shadow-lg transition-all duration-300 flex items-center justify-center p-2">
                  <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center overflow-hidden">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={`${category.name} - Vela Agencies Sivakasi`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <FiImage className="text-gray-400 text-3xl" />
                    )}
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm text-gray-800 font-bold group-hover:text-[#C70E17] transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#C70E17] font-semibold mt-0.5 sm:mt-1 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  Explore &rarr;
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="mt-6 flex justify-center">
        <button 
          onClick={() => navigate('/shop')} 
          className="bg-[#C70E17] hover:bg-[#F8B400] text-white hover:text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
        >
          View All Categories
        </button>
      </div>
    </div>
  );
};

export default Categories;
