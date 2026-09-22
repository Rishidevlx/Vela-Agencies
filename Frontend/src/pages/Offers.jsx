import React, { useState, useEffect } from 'react';
import SEO from '../components/seo/SEO';
import ShopBanner from '../components/shop/ShopBanner';
import ShopSidebar from '../components/shop/ShopSidebar';
import ShopTopBar from '../components/shop/ShopTopBar';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/common/Pagination';

const Offers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('default');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/products');
        const data = await response.json();
        if (data.success) {
          // Filter out inactive offers first
          const offerProducts = data.data.filter(p => p.is_offer_active === 1 || p.is_offer_active === true);
          
          // Map database structure to frontend expectations
          const formattedProducts = offerProducts.map(p => {
            let discount = null;
            const orig = p.price ? parseFloat(p.price) : null;
            const curr = p.offer_price ? parseFloat(p.offer_price) : orig;
            if (orig && orig > curr) {
              discount = Math.round(((orig - curr) / orig) * 100);
            }
            
            // Description might be a JSON string array, parse to get a single string snippet
            let descSnippet = '';
            if (Array.isArray(p.description) && p.description.length > 0) {
              descSnippet = p.description[0];
            } else if (typeof p.description === 'string') {
              try {
                const parsed = JSON.parse(p.description);
                descSnippet = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : p.description;
              } catch (e) {
                descSnippet = p.description;
              }
            }

            return {
              id: p.id,
              name: p.name,
              category: p.category_name, // Map for the filter logic
              description: descSnippet,
              originalPrice: orig || null,
              price: curr,
              discount: discount,
              moq: p.offer_moq || 1, // Override moq for offers
              image: p.main_image
            };
          });
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const min = minPrice === '' ? 0 : Number(minPrice);
    const max = maxPrice === '' ? Infinity : Number(maxPrice);
    const matchesPrice = product.price >= min && product.price <= max;
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);

    return matchesSearch && matchesPrice && matchesCategory;
  });

  let sortedProducts = [...filteredProducts];
  if (sortOption === 'price-low') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'latest') {
    sortedProducts.sort((a, b) => b.id - a.id);
  }

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleItemsPerPageChange = (num) => {
    setItemsPerPage(num);
    setCurrentPage(1);
  };

  return (
    <main className="offers-page bg-gray-50 min-h-screen pb-16">
      <SEO 
        title="Exclusive Diwali Crackers Offers | Vela Agencies"
        description="Grab the best deals and combo offers on Sivakasi crackers. Special discounts on bulk orders and family packs for a grand Diwali celebration."
        keywords="crackers combo offers, diwali crackers discount, sivakasi crackers offers, cheap crackers online, buy fireworks combo"
        url="https://www.velaagencies.com/offers"
      />
      <ShopBanner />
      
      <div className="max-w-7xl mx-auto px-5 md:px-12 pt-12 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <ShopSidebar 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          minPrice={minPrice} setMinPrice={setMinPrice}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories}
        />

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <ShopTopBar 
            itemsPerPage={itemsPerPage}
            setItemsPerPage={handleItemsPerPageChange}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            sortOption={sortOption}
            setSortOption={setSortOption}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Product Grid */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
            {sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? (
              sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-gray-500 font-semibold">
                No active offers found.
              </div>
            )}
          </div>

          {sortedProducts.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Offers;
