import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiSearch, FiX } from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, product, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
      <div className="flex items-center gap-4 cursor-grab active:cursor-grabbing flex-1" {...attributes} {...listeners}>
        <div className="text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
        </div>
        <img src={product.main_image || 'https://via.placeholder.com/50'} alt={product.name} className="w-12 h-12 rounded object-cover border border-gray-100" />
        <div>
          <h4 className="font-semibold text-gray-800">{product.name}</h4>
          <p className="text-sm text-gray-500">₹{product.price}</p>
        </div>
      </div>
      <button 
        onClick={() => onRemove(id)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <FiX />
      </button>
    </div>
  );
};

const TopSelling = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/products?admin=true');
      const data = await response.json();
      if (data.success) {
        setAllProducts(data.data);
        const topSelling = data.data
          .filter(p => p.is_top_selling)
          .sort((a, b) => a.top_selling_order - b.top_selling_order)
          .map(p => ({ id: p.id, ...p }));
        setSelectedItems(topSelling);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setSelectedItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddProduct = (product) => {
    if (selectedItems.length >= 10) {
      toast.error('You can only select up to 10 products');
      return;
    }
    if (selectedItems.find(item => item.id === product.id)) {
      toast.error('Product already selected');
      return;
    }
    setSelectedItems([...selectedItems, { ...product }]);
    setSearchQuery('');
  };

  const handleRemoveProduct = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/products/top-selling', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds: selectedItems.map(item => item.id)
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Top selling products updated');
        fetchProducts(); // Refresh
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Server error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out products already selected
  const availableProducts = allProducts.filter(p => !selectedItems.find(item => item.id === p.id));
  
  const searchResults = searchQuery.trim() === '' ? [] : availableProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="p-6 max-w-5xl mx-auto font-body">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-heading">Latest Top Selling Products</h1>
          <p className="text-gray-500 text-sm mt-1">Select and reorder up to 10 products to show on the home page.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold hover:bg-[#d82a30] transition-colors shadow-sm disabled:opacity-70"
        >
          <FiSave className="text-lg" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Add Products</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {searchQuery && (
              <div className="mt-2 border border-gray-100 rounded-lg shadow-sm overflow-hidden bg-white max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleAddProduct(product)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                    >
                      <img src={product.main_image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h4>
                        <p className="text-xs text-brand">₹{product.price}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No products found</div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <strong>Note:</strong> You have selected {selectedItems.length}/10 products. Drag and drop the items on the right to reorder them.
          </div>
        </div>

        {/* Right Column: Sortable List */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-6 border-b pb-4">Selected Products (Order will be preserved)</h3>
            
            {selectedItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                No products selected yet.
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={selectedItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {selectedItems.map((item) => (
                    <SortableItem key={item.id} id={item.id} product={item} onRemove={handleRemoveProduct} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSelling;
