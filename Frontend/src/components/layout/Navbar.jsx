import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiShoppingCart, FiMenu, FiHeart, FiX, FiChevronDown, FiLayers } from 'react-icons/fi';
import { FaPhoneAlt, FaEnvelope, FaDownload, FaBolt } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import logo from '../../assets/WithoutBg-Logo.png';
import CartSidebar from '../cart/CartSidebar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { wishlistCount } = useWishlist();
  const { cartTotal, cartCount, isCartOpen, setIsCartOpen, setSidebarTab } = useCart();

  // Dynamic CMS Settings
  const [logoUrl, setLogoUrl] = useState(logo);
  const [marqueeText, setMarqueeText] = useState('We get crackers direct from factory. Explore a Wide Range of Crackers & Sparklers for all your celebrations!');
  const [contactInfo, setContactInfo] = useState({
    phone1: '(+91) 94430 25873',
    phone2: '(+91) 80568 18873',
    email: 'velaagencies@gmail.com'
  });

  // Fetch all products for live search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/products');
        const data = await response.json();
        if (data.success) {
          setAllProducts(data.data.filter(p => p.status === 'active'));
        }
      } catch (err) {
        console.error('Failed to fetch products for search:', err);
      }
    };
    fetchProducts();
  }, []);

  // Fetch categories for "Shop By Department" dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.filter(c => c.status === 'active'));
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Input (live suggestions)
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(lowerCaseQuery) ||
        (p.category_name && p.category_name.toLowerCase().includes(lowerCaseQuery))
      ).slice(0, 6);
      setSearchResults(filtered);
    }
  }, [searchQuery, allProducts]);

  // Handle Search Form Submit
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults([]);
      setIsOpen(false);
    }
  };

  // Fetch CMS settings
  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
        const data = await response.json();
        if (data.success) {
          if (data.data.marquee_text) {
            setMarqueeText(data.data.marquee_text);
          }
          if (data.data.contact_details) {
            setContactInfo(prev => ({
              ...prev,
              phone1: data.data.contact_details.phone1 || prev.phone1,
              phone2: data.data.contact_details.phone2 || prev.phone2,
              email: data.data.contact_details.email || prev.email,
            }));
          }
          if (data.data.general_settings?.logo_url) {
            setLogoUrl(data.data.general_settings.logo_url);
          }
          if (data.data.general_settings?.favicon_url) {
            const favicon = document.getElementById('favicon');
            if (favicon) {
              favicon.href = data.data.general_settings.favicon_url;
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch CMS settings:', err);
      }
    };
    fetchCMS();
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/shop' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Blog', path: '/blog' },
  ];

  const slugify = (text) => text ? text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '') : '';

  return (
    <>
      <header className="relative w-full z-50 flex flex-col font-body shadow-md">

        {/* ══════════════════════════════════════════════════════════
            ROW 1: TOP MARQUEE & CONTACT BAR (Purple)
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-[#C70E17] text-white text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-red-900/30">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
            
            {/* Left: Marquee Notice */}
            <div className="w-full md:w-8/12 overflow-hidden relative flex items-center">
              <div className="flex whitespace-nowrap animate-marquee">
                <span className="flex items-center gap-2 font-medium tracking-wide pr-12">
                  <FaBolt className="text-yellow-400 text-xs shrink-0" />
                  {marqueeText}
                </span>
                <span className="flex items-center gap-2 font-medium tracking-wide pr-12" aria-hidden="true">
                  <FaBolt className="text-yellow-400 text-xs shrink-0" />
                  {marqueeText}
                </span>
              </div>
            </div>

            {/* Right: Email & Admin link */}
            <div className="hidden sm:flex items-center justify-end gap-5 text-xs font-semibold shrink-0">
              <a 
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2 hover:text-yellow-300 transition-colors"
              >
                <FaEnvelope className="text-yellow-400 text-[11px]" />
                <span>{contactInfo.email}</span>
              </a>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            ROW 2: MAIN HEADER (Logo | Nav Links | Phone Call Support)
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-white py-2.5 sm:py-4 px-3 sm:px-6 lg:px-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 sm:gap-4 lg:gap-8">

            {/* Left: Brand Logo & Mobile Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 sm:p-2 lg:hidden text-gray-700 hover:text-brand rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle Menu"
              >
                {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>

              <Link to="/" className="flex items-center">
                <img
                  src={logoUrl}
                  alt="Vela Agencies"
                  className="h-12 sm:h-20 md:h-24 lg:h-24 w-auto max-w-[160px] sm:max-w-[280px] object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>

            {/* Center: Main Navigation Menu (Desktop) */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/shop' && location.pathname.startsWith('/product'));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm xl:text-[15px] font-bold transition-all duration-300 hover:text-brand ${
                      isActive ? 'text-brand border-b-2 border-brand pb-0.5' : 'text-gray-800'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Phone Numbers with Icon (Responsive for Mobile) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a 
                href={`tel:${contactInfo.phone1.replace(/[^\d+]/g, '')}`}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-200 hover:scale-105 transition-transform"
                title="Call Support"
              >
                <FaPhoneAlt className="text-sm sm:text-base animate-pulse" />
              </a>
              <div className="hidden sm:flex flex-col text-left">
                <a 
                  href={`tel:${contactInfo.phone1.replace(/[^\d+]/g, '')}`}
                  className="text-xs sm:text-sm font-bold text-gray-900 hover:text-brand transition-colors leading-tight"
                >
                  {contactInfo.phone1}
                </a>
                <a 
                  href={`tel:${contactInfo.phone2.replace(/[^\d+]/g, '')}`}
                  className="text-xs sm:text-sm font-bold text-gray-900 hover:text-brand transition-colors leading-tight mt-0.5"
                >
                  {contactInfo.phone2}
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            ROW 3: SUB-BAR (Shop By Department | Search Bar | Wishlist & Cart)
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-footer text-black py-2 sm:py-2.5 px-2.5 sm:px-6 lg:px-8 border-b border-amber-300 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">

            {/* Left: Shop By Department Dropdown Button */}
            <div className="relative shrink-0" ref={categoryDropdownRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-1.5 sm:gap-2.5 bg-[#F8B400] text-gray-900 font-heading text-[11px] sm:text-sm font-bold uppercase px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-md cursor-pointer"
              >
                <FiLayers className="text-sm sm:text-lg text-gray-900" />
                <span className="hidden md:inline">Shop By Department</span>
                <span className="md:hidden">Categories</span>
                <FiChevronDown className={`text-xs sm:text-base transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Department / Category Dropdown Menu */}
              {isCategoryOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in font-body">
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Categories
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <Link
                      to="/shop"
                      onClick={() => setIsCategoryOpen(false)}
                      className="block px-4 py-2.5 text-sm font-bold text-brand hover:bg-gray-50 border-b border-gray-50"
                    >
                      🌟 View All Products
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => setIsCategoryOpen(false)}
                        className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-brand hover:bg-gray-50 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center: Wide Rounded Search Bar */}
            <div className="relative flex-1 min-w-0 max-w-xl xl:max-w-2xl">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crackers..."
                  className="w-full bg-white border border-gray-200 rounded-full py-1.5 sm:py-2.5 pl-3.5 sm:pl-5 pr-8 sm:pr-10 outline-none focus:ring-2 focus:ring-[#C70E17]/20 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition-colors p-1"
                  aria-label="Search"
                >
                  <FiSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </form>

              {/* Autocomplete Search Dropdown */}
              {searchQuery.trim() !== '' && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map(product => (
                          <Link
                            key={product.id}
                            to={`/product/${slugify(product.name)}`}
                            onClick={() => setSearchQuery('')}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <img
                              src={product.main_image || 'https://via.placeholder.com/50'}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded shadow-sm border border-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">{product.name}</h4>
                              <p className="text-xs text-brand font-bold">₹{Number(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500 font-medium">
                        No products found. Press enter to search shop.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Wishlist + Cart + Download Pricelist */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              
              {/* Wishlist Button */}
              <button
                onClick={() => {
                  setSidebarTab('wishlist');
                  setIsCartOpen(true);
                }}
                className="relative p-2 sm:p-2.5 rounded-full bg-white text-gray-800 hover:text-brand hover:scale-105 transition-all shadow-sm cursor-pointer"
                title="Wishlist"
              >
                <FiHeart className="h-4 w-4 sm:h-5 sm:w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] sm:text-[10px] font-bold h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full flex items-center justify-center shadow">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Button (Count Only, No Price Text) */}
              <button
                onClick={() => {
                  setSidebarTab('cart');
                  setIsCartOpen(true);
                }}
                className="relative p-2 sm:p-2.5 rounded-full bg-white text-gray-800 hover:text-brand hover:scale-105 transition-all shadow-sm cursor-pointer border border-gray-100"
                title="View Cart"
              >
                <FiShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] sm:text-[10px] font-extrabold h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Download Pricelist Button (Light Yellow) */}
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/pricelist/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex items-center gap-2 font-bold text-xs bg-[#F8B400] text-gray-900 px-4 py-2.5 rounded-full hover:bg-yellow-400 transition-colors shadow-sm cursor-pointer"
              >
                <FaDownload className="text-xs" /> Pricelist
              </a>

            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MOBILE DRAWER (Search + Nav Links + Download Pricelist)
        ══════════════════════════════════════════════════════════ */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden bg-white border-t border-gray-100 ${isOpen ? 'max-h-[550px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-3 bg-gray-50">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crackers..."
                className="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-4 pr-10 outline-none focus:border-[#C70E17] text-xs font-medium"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C70E17] p-1"
                aria-label="Search"
              >
                <FiSearch className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="px-4 py-3 space-y-1 shadow-inner bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-semibold uppercase ${
                  location.pathname === link.path
                    ? 'bg-footer/50 text-brand border-l-4 border-brand'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/pricelist/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg text-sm font-semibold uppercase text-brand hover:bg-gray-50 flex items-center gap-2 mt-2 border border-brand/40"
            >
              <FaDownload /> Download Pricelist
            </a>
          </div>
        </div>

      </header>

      {/* Cart Sidebar Component */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
