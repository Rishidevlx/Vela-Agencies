import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiMove, FiCheck, FiX, FiBox, FiImage } from 'react-icons/fi';
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

// Individual Sortable Item Component
const SortableCategoryItem = ({ category, onEdit, onDelete, parentName }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  const isSub = !!category.parent_id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border ${isDragging ? 'border-[#3c50e0] shadow-lg' : 'border-gray-200'} rounded-lg p-4 mb-3 flex items-center justify-between group transition-colors hover:border-[#3c50e0]/50 ${isSub ? 'ml-10 relative' : ''}`}
    >
      {isSub && (
        <div className="absolute -left-6 top-1/2 w-4 h-px bg-gray-300 pointer-events-none"></div>
      )}
      {isSub && (
        <div className="absolute -left-6 -top-3 w-px h-[calc(100%+12px)] bg-gray-300 pointer-events-none"></div>
      )}
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-[#3c50e0] transition-colors bg-gray-50 rounded"
        >
          <FiMove />
        </div>
        
        {category.image_url && (
          <img src={category.image_url} alt={category.name} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
        )}

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{category.name}</h3>
            {category.status === 'inactive' && (
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Inactive</span>
            )}
          </div>
          {parentName ? (
            <p className="text-xs text-gray-500 mt-1">Subcategory of: <span className="font-medium text-gray-700">{parentName}</span></p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Main Category</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(category)}
          className="p-2 text-gray-500 hover:text-[#3c50e0] hover:bg-blue-50 rounded transition-colors"
          title="Edit Category"
        >
          <FiEdit2 />
        </button>
        <button 
          onClick={() => onDelete(category.id)}
          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Delete Category"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState('active');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // For Editing
  const [editingId, setEditingId] = useState(null);

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const getParentName = (pId) => {
    if (!pId) return null;
    const parent = categories.find(c => c.id === pId);
    return parent ? parent.name : null;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading category image...');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setImageUrl(data.url);
        toast.success('Image uploaded successfully', { id: toastId });
      } else {
        toast.error(data.message || 'Upload failed', { id: toastId });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');

    setIsLoading(true);
    const token = localStorage.getItem('adminToken');
    const payload = { 
      name, 
      parent_id: parentId ? parseInt(parentId) : null,
      status,
      image_url: imageUrl || null
    };

    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/api/categories/${editingId}`
        : import.meta.env.VITE_API_URL + '/api/categories';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Category ${editingId ? 'updated' : 'added'} successfully!`);
        resetForm();
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to save category');
      }
    } catch (error) {
      toast.error('Server error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Category deleted');
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setParentId(category.parent_id || '');
    setStatus(category.status);
    setImageUrl(category.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setParentId('');
    setStatus('active');
    setImageUrl('');
  };

  // Drag and Drop End Handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        return reordered;
      });
    }
  };

  const saveReorder = async (reorderedItems) => {
    const payload = reorderedItems.map((item, index) => ({
      id: item.id,
      sort_order: index + 1
    }));

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/categories/reorder/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: payload })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Category order saved successfully!');
      } else {
        toast.error(data.message || 'Failed to save order');
      }
    } catch (err) {
      console.error('Failed to save reorder', err);
      toast.error('Failed to save category order');
    }
  };

  // Filter out current editing category from parent dropdown to prevent self-nesting
  const mainCategories = categories.filter(c => c.parent_id === null && c.id !== editingId);

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Create, edit, and reorder your product categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              {editingId ? <><FiEdit2 className="text-[#3c50e0]"/> Edit Category</> : <><FiPlus className="text-[#3c50e0]"/> Add New Category</>}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sparklers"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#3c50e0] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select 
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#3c50e0] bg-white transition-colors"
                >
                  <option value="">None (Main Category)</option>
                  {mainCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">Select a parent to make this a subcategory.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {imageUrl ? (
                    <div className="relative w-20 h-20 rounded-md border border-gray-200 overflow-hidden shrink-0 group">
                      <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => setImageUrl('')} 
                          className="text-white hover:text-red-400"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 shrink-0 text-gray-400">
                      <FiImage className="text-2xl" />
                    </div>
                  )}
                  
                  <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 text-sm font-medium text-gray-600 hover:text-[#3c50e0] hover:border-[#3c50e0] transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <FiImage className="mb-1 text-lg" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#3c50e0] bg-white transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#3c50e0] hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? 'Saving...' : editingId ? <><FiCheck /> Update</> : <><FiPlus /> Create</>}
                </button>
                
                {editingId && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[calc(100vh-120px)]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-lg font-bold text-gray-800">All Categories</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => saveReorder(categories)}
                  className="text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-green-200"
                >
                  <FiCheck /> Save Order
                </button>
                <span className="text-xs font-semibold bg-blue-50 text-[#3c50e0] px-3 py-1.5 rounded-full">
                  {categories.length} Total
                </span>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <FiBox className="mx-auto text-3xl mb-3 opacity-50" />
                <p>No categories found.</p>
                <p className="text-sm mt-1 opacity-70">Create one from the left panel.</p>
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={categories.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                    {categories.map((category) => (
                      <SortableCategoryItem 
                        key={category.id} 
                        category={category} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        parentName={getParentName(category.parent_id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            
            <p className="text-xs text-gray-400 mt-4 shrink-0 flex items-center justify-center gap-1">
              <FiMove /> Tip: Drag and drop categories to reorder them globally.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Categories;
