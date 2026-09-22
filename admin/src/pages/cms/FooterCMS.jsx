import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiMove, FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';
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

const SortableCategory = ({ category, updateCategory, removeCategory }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  const handleLinkChange = (linkIndex, field, value) => {
    const updatedLinks = [...category.links];
    updatedLinks[linkIndex][field] = value;
    updateCategory(category.id, { links: updatedLinks });
  };

  const addLink = () => {
    if (category.links.length >= 5) {
      return toast.error("Maximum 5 links allowed per category.");
    }
    const updatedLinks = [...category.links, { id: Date.now().toString(), label: '', url: '' }];
    updateCategory(category.id, { links: updatedLinks });
  };

  const removeLink = (linkId) => {
    const updatedLinks = category.links.filter(l => l.id !== linkId);
    updateCategory(category.id, { links: updatedLinks });
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'} rounded-lg p-5 mb-4`}>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-blue-500 bg-gray-50 rounded">
            <FiMove />
          </div>
          <input
            type="text"
            value={category.title}
            onChange={(e) => updateCategory(category.id, { title: e.target.value })}
            placeholder="Category Title"
            className="text-lg font-bold text-gray-800 border-none outline-none focus:ring-0 px-0 placeholder-gray-300 w-64"
          />
        </div>
        <button type="button" onClick={() => removeCategory(category.id)} className="text-red-400 hover:text-red-600 transition-colors">
          <FiTrash2 />
        </button>
      </div>

      <div className="space-y-3">
        {category.links.map((link, index) => (
          <div key={link.id} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 w-4">{index + 1}.</span>
            <input
              type="text"
              value={link.label}
              onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
              placeholder="Link Label"
              className="flex-1 p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              placeholder="URL (e.g., /shop)"
              className="flex-1 p-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
            />
            <button type="button" onClick={() => removeLink(link.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <FiX />
            </button>
          </div>
        ))}
      </div>
      
      {category.links.length < 5 && (
        <button type="button" onClick={addLink} className="mt-3 text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
          <FiPlus /> Add Link
        </button>
      )}
    </div>
  );
};

// FiX icon helper for removing links
import { FiX } from 'react-icons/fi';

const FooterCMS = () => {
  const [loading, setLoading] = useState(false);
  
  const [categories, setCategories] = useState([
    { id: 'cat-1', title: 'FANCY COMET', links: [{ id: 'l1', label: 'Chotta Fancy', url: '/shop' }] }
  ]);

  const [socials, setSocials] = useState([
    { id: 'whatsapp', platform: 'WhatsApp', url: '', isActive: true },
    { id: 'phone', platform: 'Phone Call', url: '', isActive: true },
    { id: 'mail', platform: 'Mail', url: '', isActive: true },
    { id: 'facebook', platform: 'Facebook', url: '', isActive: true }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const data = await response.json();
      if (data.success && data.data.footer_cms) {
        if (data.data.footer_cms.categories) setCategories(data.data.footer_cms.categories);
        if (data.data.footer_cms.socials) setSocials(data.data.footer_cms.socials);
      }
    } catch (error) {
      toast.error('Failed to load footer data');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addCategory = () => {
    if (categories.length >= 3) {
      return toast.error("Maximum 3 categories allowed.");
    }
    setCategories([...categories, { id: Date.now().toString(), title: 'New Category', links: [] }]);
  };

  const updateCategory = (id, updates) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updateSocial = (id, field, value) => {
    setSocials(socials.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      categories,
      socials
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ footer_cms: payload }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Footer saved successfully!');
      } else {
        toast.error('Failed to save footer data');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Footer CMS</h1>
          <p className="text-gray-500 text-sm mt-1">Manage footer categories, links, and social media settings.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow transition-colors flex items-center gap-2"
        >
          {loading ? 'Saving...' : <><FiCheck /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Footer Categories</h2>
              <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                {categories.length} / 3 Categories
              </span>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <SortableCategory 
                      key={category.id} 
                      category={category} 
                      updateCategory={updateCategory}
                      removeCategory={removeCategory}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {categories.length < 3 && (
              <button 
                onClick={addCategory}
                className="mt-6 w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-semibold hover:border-blue-500 hover:text-blue-500 transition-colors flex justify-center items-center gap-2"
              >
                <FiPlus className="text-xl" /> Add Category
              </button>
            )}
          </div>
        </div>

        {/* Social Links Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Social Media Links</h2>
            <div className="space-y-6">
              {socials.map((social) => (
                <div key={social.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-gray-700 text-sm">{social.platform}</label>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={social.isActive}
                          onChange={(e) => updateSocial(social.id, 'isActive', e.target.checked)}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${social.isActive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${social.isActive ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  {social.isActive && (
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => updateSocial(social.id, 'url', e.target.value)}
                      placeholder={`${social.platform} URL`}
                      className="w-full p-2 text-sm border border-gray-300 rounded outline-none focus:border-blue-500 mt-1"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FooterCMS;
