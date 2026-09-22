import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiBell, FiSearch, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const searchData = [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'Home Page CMS', to: '/dashboard/cms/home' },
  { title: 'Latest Top Selling Product', to: '/dashboard/cms/top-selling' },
  { title: 'Footer', to: '/dashboard/cms/footer' },
  { title: 'All Products', to: '/dashboard/products' },
  { title: 'Add Product', to: '/dashboard/products/add' },
  { title: 'Categories', to: '/dashboard/categories' },
  { title: 'Product Offers', to: '/dashboard/offers' },
  { title: 'Outward Billing', to: '/dashboard/billing/outward' },
  { title: 'Outward List', to: '/dashboard/billing/list' },
  { title: 'WhatsApp Settings', to: '/dashboard/settings/whatsapp' },
  { title: 'Contact Details', to: '/dashboard/contact/details' },
  { title: 'Giftbox Floating', to: '/dashboard/contact/giftbox' },
  { title: 'WhatsApp Enquiries', to: '/dashboard/enquiries/whatsapp' },
  { title: 'General Settings', to: '/dashboard/settings/general' },
  { title: 'SEO Settings', to: '/dashboard/settings/seo' },
  { title: 'Profile', to: '/dashboard/account/profile' },
  { title: 'Change Password', to: '/dashboard/account/change-password' }
];

const Header = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const filteredSearch = searchData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (to) => {
    navigate(to);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-brand transition-colors lg:hidden">
          <FiMenu className="text-xl" />
        </button>
        
        <div className="hidden md:flex relative" ref={searchRef}>
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 w-64 border border-transparent focus-within:border-brand/30 focus-within:bg-white transition-all">
            <FiSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search menu..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
            />
          </div>
          
          {/* Search Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 shadow-lg rounded-md py-1 max-h-64 overflow-y-auto z-50">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSearchSelect(item.to)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-brand/5 hover:text-brand cursor-pointer transition-colors"
                  >
                    {item.title}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        <button className="text-gray-500 hover:text-brand relative transition-colors">
          <FiBell className="text-xl" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-gray-800 group-hover:text-brand transition-colors">Admin User</span>
            <span className="text-xs text-gray-500">Administrator</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
            <FiUser className="text-lg" />
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
