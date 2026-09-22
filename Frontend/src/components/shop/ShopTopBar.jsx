import React, { useState, useEffect } from 'react';
import { FiGrid, FiList, FiChevronDown, FiCheck, FiFilter, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const ShopTopBar = ({ 
  onOpenFilter,
  itemsPerPage = 12, 
  setItemsPerPage, 
  selectedCategories = [], 
  setSelectedCategories,
  sortOption = 'default',
  setSortOption,
  viewMode = 'grid',
  setViewMode
}) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/categories');
        const data = await response.json();
        if (data.success) {
          const activeCats = data.data.filter(c => c.status === 'active');
          setCategories(activeCats);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const perPageOptions = [9, 12, 18, 24];

  return (
    <div className="flex flex-col gap-4 mb-8 font-body text-sm text-gray-600">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Breadcrumbs & Categories Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center">
            <Link to="/" className="hover:text-brand transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-semibold">Shop</span>
          </div>
          
          <div className="hidden sm:block text-gray-300">|</div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenFilter}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C70E17] text-white px-5 py-2 text-sm font-bold hover:bg-[#F8B400] hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <FiFilter /> Filter
            </button>

            <DropdownMenu.Root>
            <DropdownMenu.Trigger className="inline-flex items-center justify-between gap-2 min-w-[200px] whitespace-nowrap rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all shadow-sm text-gray-700">
              ⭐ Browse Categories <FiChevronDown className="opacity-70 ml-2" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                align="start"
                className="z-50 min-w-[200px] max-h-80 overflow-y-auto scrollbar-thin rounded-lg border border-gray-200 bg-white p-1.5 text-gray-700 shadow-xl font-body"
              >
                <DropdownMenu.Item 
                  onClick={() => setSelectedCategories([])}
                  className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
                >
                  All Categories
                  {selectedCategories.length === 0 && <FiCheck className="ml-auto w-4 h-4 text-brand" />}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="-mx-1.5 my-1 h-px bg-gray-100" />
                
                {categories.map(cat => (
                  <DropdownMenu.Item 
                    key={cat.id}
                    onClick={() => setSelectedCategories([cat.name])}
                    className={`relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 transition-colors ${cat.parent_id ? 'ml-4 text-gray-600' : 'font-medium'}`}
                  >
                    {cat.parent_id && <span className="mr-2 text-gray-300">└</span>}
                    {cat.name}
                    {selectedCategories.includes(cat.name) && <FiCheck className="ml-auto w-4 h-4 text-brand" />}
                  </DropdownMenu.Item>
                ))}

              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full md:w-auto">
          {/* View Toggles */}
          <div className="flex gap-2 text-xl">
            <FiGrid 
              onClick={() => setViewMode && setViewMode('grid')}
              className={`cursor-pointer transition-colors ${viewMode === 'grid' ? 'text-brand' : 'text-gray-400 hover:text-gray-800'}`} 
            />
            <FiList 
              onClick={() => setViewMode && setViewMode('list')}
              className={`cursor-pointer transition-colors ${viewMode === 'list' ? 'text-brand' : 'text-gray-400 hover:text-gray-800'}`} 
            />
          </div>

          {/* Sorting Dropdown */}
          <div>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption && setSortOption(e.target.value)}
              className="border border-gray-200 rounded-full py-1.5 px-4 outline-none bg-white cursor-pointer hover:border-brand focus:border-brand shadow-sm text-gray-700 font-medium transition-colors"
            >
              <option value="default">Default sorting</option>
              <option value="latest">Sort by latest</option>
              <option value="price-low">Sort by price: low to high</option>
              <option value="price-high">Sort by price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Category Badges */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtered By:</span>
          {selectedCategories.map((cat, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1.5 bg-brand/10 text-brand font-bold text-xs px-3 py-1 rounded-full border border-brand/20 shadow-sm"
            >
              {cat}
              <button 
                onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}
                className="hover:text-red-800 focus:outline-none"
                title="Remove filter"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button 
            onClick={() => setSelectedCategories([])}
            className="text-xs font-semibold text-gray-500 hover:text-brand underline ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopTopBar;
