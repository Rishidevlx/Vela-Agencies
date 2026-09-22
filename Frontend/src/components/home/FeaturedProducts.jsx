import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/products/top-selling');
        const data = await response.json();
        let topSelling = [];
        if (data.success && Array.isArray(data.data)) {
          topSelling = data.data;
        }

        if (topSelling.length < 10) {
          const allRes = await fetch(import.meta.env.VITE_API_URL + '/api/products');
          const allData = await allRes.json();
          if (allData.success && Array.isArray(allData.data)) {
            const existingIds = new Set(topSelling.map(p => p.id));
            const latest = allData.data
              .filter(p => !existingIds.has(p.id) && p.status === 'active') // exclude duplicates and inactive
              .sort((a, b) => b.id - a.id)
              .slice(0, 10 - topSelling.length);
            
            topSelling = [...topSelling, ...latest];
          }
        }
        
        setProducts(topSelling);
      } catch (error) {
        console.error('Failed to fetch top selling products:', error);
      }
    };
    fetchTopSelling();
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="py-10 px-4 sm:px-8 lg:px-12 bg-white">
      <div className="mb-7">
        <h2 className="text-2xl text-gray-800 mb-1 font-medium uppercase font-heading">LATEST TOP SELLING</h2>
        <div className="w-12 h-0.5 bg-[#F8B400]"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-7 mt-5">
        {products.map((product) => {
          const originalPrice = parseFloat(product.original_price);
          const price = parseFloat(product.price);
          let parsedUnit = 'packet';
          if (product.unit) {
            try {
              const u = typeof product.unit === 'string' ? JSON.parse(product.unit) : product.unit;
              if (Array.isArray(u) && u.length > 0) parsedUnit = u[0];
              else if (typeof u === 'string') parsedUnit = u;
            } catch (e) {
              parsedUnit = 'packet';
            }
          }
          
          return (
            <div className="border border-gray-100 rounded-lg p-3 sm:p-4 text-center transition-all duration-300 hover:shadow-xl bg-primary group flex flex-col hover:border-amber-200" key={product.id}>
              <Link to={`/product/${product.id}`} className="w-full h-36 sm:h-40 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden relative">
                {/* Product Image with scale on hover */}
                <img 
                  src={product.main_image || 'https://via.placeholder.com/200'} 
                  alt={product.name}
                  className="max-h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-110 drop-shadow-sm" 
                />
              </Link>
              <div className="flex flex-col items-center flex-1">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-1.5 sm:mb-2 font-body line-clamp-1 hover:text-[#C70E17] transition-colors">{product.name}</h3>
                </Link>
                <div className="mb-3 sm:mb-4 mt-auto flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-[#C70E17] text-sm sm:text-base">
                    ₹{price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} {parsedUnit && <span className="text-[10px] text-gray-500 font-medium capitalize ml-0.5 sm:ml-1">/ Per {parsedUnit}</span>}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-gray-400 line-through text-[10px] sm:text-xs">₹{originalPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  )}
                </div>
                <button 
                  onClick={() => addToCart(product, product.moq || 1)}
                  className="w-full bg-[#C70E17] text-white border-none py-2 sm:py-2.5 px-3 sm:px-4 rounded-full cursor-pointer font-bold text-[11px] sm:text-xs transition-all duration-300 hover:bg-[#F8B400] hover:text-white shadow-sm hover:shadow-md font-body mt-auto"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-10 flex justify-center">
        <Link to="/shop" className="bg-[#C70E17] hover:bg-[#F8B400] text-white hover:text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm transform hover:-translate-y-0.5">
          View More Products
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProducts;
