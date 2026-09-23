import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import ShopBanner from '../components/shop/ShopBanner';
import ShopSidebar from '../components/shop/ShopSidebar';
import ShopTopBar from '../components/shop/ShopTopBar';
import ProductCard from '../components/product/ProductCard';
import ProductTable from '../components/product/ProductTable';
import Pagination from '../components/common/Pagination';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [products, setProducts] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync category & search query parameter from URL (e.g., /shop?category=... or /shop?search=...)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, cmsRes, catRes] = await Promise.all([
          fetch(import.meta.env.VITE_API_URL + '/api/products'),
          fetch(import.meta.env.VITE_API_URL + '/api/cms/home'),
          fetch(import.meta.env.VITE_API_URL + '/api/categories')
        ]);
        
        const productsData = await productsRes.json();
        const cmsData = await cmsRes.json();
        const catData = await catRes.json();

        if (catData.success) {
          setCategoriesList(catData.data || []);
        }

        let initialSort = 'default';
        if (cmsData.success && cmsData.data.general_settings?.product_sort_order === 'recent') {
          initialSort = 'latest';
          setSortOption('latest');
        }

        if (productsData.success) {
          // Map database structure to frontend expectations
          const formattedProducts = productsData.data.map(p => {
            let discount = null;
            const orig = p.original_price ? parseFloat(p.original_price) : null;
            const curr = parseFloat(p.price);
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

            // Parse unit
            let parsedUnit = 'packet';
            if (p.unit) {
              try {
                const u = typeof p.unit === 'string' ? JSON.parse(p.unit) : p.unit;
                if (Array.isArray(u) && u.length > 0) parsedUnit = u[0];
                else if (typeof u === 'string') parsedUnit = u;
              } catch (e) {
                parsedUnit = 'packet';
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
              image: p.main_image,
              unit: parsedUnit
            };
          });
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const expandedCategories = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    const valid = new Set(selectedCategories.map(c => c.trim().toLowerCase()));
    
    categoriesList.forEach(cat => {
      if (cat.name && valid.has(cat.name.trim().toLowerCase())) {
        // Add all subcategories under this parent category
        categoriesList
          .filter(sub => sub.parent_id === cat.id)
          .forEach(sub => {
            if (sub.name) valid.add(sub.name.trim().toLowerCase());
          });
      }
    });

    return Array.from(valid);
  }, [selectedCategories, categoriesList]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const min = minPrice === '' ? 0 : Number(minPrice);
    const max = maxPrice === '' ? Infinity : Number(maxPrice);
    const matchesPrice = product.price >= min && product.price <= max;
    
    let matchesCategory = selectedCategories.length === 0;
    if (!matchesCategory && product.category) {
      matchesCategory = expandedCategories.includes(product.category.trim().toLowerCase());
    }

    return matchesSearch && matchesPrice && matchesCategory;
  });

  let sortedProducts = [...filteredProducts];
  if (sortOption === 'price-low') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'latest') {
    sortedProducts.sort((a, b) => b.id - a.id);
  } else {
    // default (Normal List Order - Oldest First)
    sortedProducts.sort((a, b) => a.id - b.id);
  }

  // Group filtered products category-wise in the order of categoriesList
  const groupedCategoryProducts = useMemo(() => {
    const map = {};
    const uncategorized = [];

    // Pre-populate categories from categoriesList to maintain exact sorting order
    categoriesList.forEach(cat => {
      map[cat.name] = {
        id: cat.id,
        name: cat.name,
        items: []
      };
    });

    // Distribute sortedProducts into categories
    sortedProducts.forEach(product => {
      const catName = product.category;
      if (catName && map[catName]) {
        map[catName].items.push(product);
      } else if (catName) {
        if (!map[catName]) {
          map[catName] = { id: product.category_id || catName, name: catName, items: [] };
        }
        map[catName].items.push(product);
      } else {
        uncategorized.push(product);
      }
    });

    // Only return categories that contain at least one product
    const result = Object.values(map).filter(group => group.items.length > 0);
    if (uncategorized.length > 0) {
      result.push({
        id: 'uncategorized',
        name: 'General Crackers',
        items: uncategorized
      });
    }
    return result;
  }, [sortedProducts, categoriesList]);

  return (
    <main className="shop-page bg-gray-50 min-h-screen pb-16">
      <SEO 
        title="Shop Sivakasi Crackers | Vela Agencies"
        description="Browse our wide collection of premium Sivakasi crackers. Get the best wholesale prices on sparklers, atom bombs, flower pots, and family combo packs."
        keywords="sivakasi crackers price list, buy crackers online, wholesale fireworks, crackers shop, vela agencies shop"
        url="https://www.velaagencies.com/shop"
      />
      <ShopBanner />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-5 md:px-12 pt-6 sm:pt-8 md:pt-10">
        {/* Sidebar Drawer */}
        <ShopSidebar 
          isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          minPrice={minPrice} setMinPrice={setMinPrice}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories}
        />

        {/* Main Content */}
        <div className="w-full">
          <ShopTopBar 
            onOpenFilter={() => setIsFilterOpen(true)}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={handleItemsPerPageChange}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            sortOption={sortOption}
            setSortOption={setSortOption}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Product Listing - Category-wise Grouped View */}
          {viewMode === 'list' ? (
            <ProductTable products={sortedProducts} categoriesList={categoriesList} />
          ) : (
            <div className="space-y-10 sm:space-y-12">
              {groupedCategoryProducts.length > 0 ? (
                groupedCategoryProducts.map((group) => (
                  <section key={group.id} className="category-product-section">
                    
                    {/* Category Title Header Banner */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-red-700 via-brand to-amber-600 text-white px-4 sm:px-6 py-3 rounded-xl shadow-md mb-6 border border-red-600/20">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl drop-shadow">💥</span>
                        <h2 className="text-sm sm:text-base md:text-lg font-black uppercase font-heading tracking-wide drop-shadow-sm">
                          {group.name}
                        </h2>
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full border border-white/30 shrink-0 shadow-inner">
                        {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>

                    {/* Category Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {group.items.map((product) => (
                        <ProductCard key={product.id} product={product} viewMode={viewMode} />
                      ))}
                    </div>

                  </section>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center text-gray-500 font-semibold border border-gray-100 shadow-sm">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-base text-gray-700 font-bold">No products found matching your filters.</p>
                  <p className="text-xs text-gray-400 mt-1">Try clearing some filters or changing your search terms.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default Shop;
