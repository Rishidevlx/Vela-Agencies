import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    original_price: '',
    price: '',
    moq: 1,
    unit: ['packet'],
    status: 'active'
  });

  const [description, setDescription] = useState(['']);
  const [mainImage, setMainImage] = useState(null);
  const [subImages, setSubImages] = useState([]); // Up to 3

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      const data = await response.json();
      if (data.success) {
        const p = data.data;
        setFormData({
          name: p.name || '',
          category_id: p.category_id || '',
          original_price: p.original_price || '',
          price: p.price || '',
          moq: p.moq || 1,
          unit: p.unit ? (typeof p.unit === 'string' ? JSON.parse(p.unit) : p.unit) : ['packet'],
          status: p.status || 'active'
        });
        setDescription(p.description ? (typeof p.description === 'string' ? JSON.parse(p.description) : p.description) : ['']);
        setMainImage(p.main_image || null);
        setSubImages(p.sub_images ? (typeof p.sub_images === 'string' ? JSON.parse(p.sub_images) : p.sub_images) : []);
      }
    } catch (error) {
      toast.error('Failed to fetch product details');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.filter(c => c.status === 'active'));
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUnitChange = (type) => {
    setFormData(prev => ({ ...prev, unit: [type] }));
  };

  // Description Bullet Points handlers
  const handleDescChange = (index, value) => {
    const newDesc = [...description];
    newDesc[index] = value;
    setDescription(newDesc);
  };
  const addDescPoint = () => setDescription([...description, '']);
  const removeDescPoint = (index) => {
    if (description.length > 1) {
      const newDesc = [...description];
      newDesc.splice(index, 1);
      setDescription(newDesc);
    }
  };

  // Image Upload Handlers
  const uploadImage = async (file) => {
    const uploadData = new FormData();
    uploadData.append('image', file);

    const token = localStorage.getItem('adminToken');
    const response = await fetch(import.meta.env.VITE_API_URL + '/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: uploadData
    });

    const data = await response.json();
    if (data.success) return data.url;
    throw new Error(data.message);
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      toast.loading('Uploading main image...', { id: 'mainImg' });
      const url = await uploadImage(file);
      setMainImage(url);
      toast.success('Main image uploaded', { id: 'mainImg' });
    } catch (err) {
      toast.error('Image upload failed', { id: 'mainImg' });
    }
  };

  const handleSubImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + subImages.length > 3) {
      return toast.error('Maximum 3 sub-images allowed');
    }
    
    try {
      toast.loading('Uploading sub-images...', { id: 'subImg' });
      const urls = await Promise.all(files.map(file => uploadImage(file)));
      setSubImages([...subImages, ...urls]);
      toast.success('Sub-images uploaded', { id: 'subImg' });
    } catch (err) {
      toast.error('Image upload failed', { id: 'subImg' });
    }
  };

  const removeSubImage = (index) => {
    const newImgs = [...subImages];
    newImgs.splice(index, 1);
    setSubImages(newImgs);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category_id) {
      return toast.error('Please fill required fields (Name, Price, Category)');
    }
    if (!mainImage) {
      return toast.error('Main image is required');
    }

    // Filter out empty descriptions
    const cleanDesc = description.filter(d => d.trim() !== '');

    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        ...formData,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        description: cleanDesc,
        main_image: mainImage,
        sub_images: subImages
      };

      const url = isEditMode ? `${import.meta.env.VITE_API_URL}/api/products/${id}` : import.meta.env.VITE_API_URL + '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isEditMode ? 'Product updated successfully!' : 'Product added successfully!');
        navigate('/dashboard/products'); // Redirect to all products
      } else {
        toast.error(data.message || 'Failed to save product');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiArrowLeft className="text-xl text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 text-sm mt-1">{isEditMode ? 'Update product details and pricing.' : 'Fill in the information below to add a new product.'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-4 outline-none focus:border-[#3c50e0] focus:ring-1 focus:ring-[#3c50e0]/30 transition-all"
                  placeholder="e.g., Mega Combo Offer"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-4 outline-none focus:border-[#3c50e0] focus:ring-1 focus:ring-[#3c50e0]/30 transition-all bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parent_id ? `— ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing & Units */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Strike-out Price (₹)</label>
                  <input 
                    type="number" 
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-4 outline-none focus:border-[#3c50e0]"
                    placeholder="3000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-4 outline-none focus:border-[#3c50e0]"
                    placeholder="1500"
                    required
                  />
                </div>
              </div>

              {/* Minimum Order Quantity (MOQ) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Order Quantity (MOQ) *</label>
                <input 
                  type="number" 
                  name="moq"
                  value={formData.moq}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-4 outline-none focus:border-[#3c50e0]"
                  min="1"
                  required
                />
              </div>

              {/* Units Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Unit Type</label>
                <div className="flex gap-4">
                  {['packet', 'piece', 'box'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="unit" 
                        value={type}
                        checked={formData.unit.includes(type)}
                        onChange={() => handleUnitChange(type)}
                        className="w-4 h-4 text-[#3c50e0] focus:ring-[#3c50e0] border-gray-300"
                      />
                      <span className="text-sm text-gray-700 capitalize">Per {type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-4 outline-none focus:border-[#3c50e0]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Bullet Points Description */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex justify-between items-center">
                  <span>Product Description (Bullet Points)</span>
                  <button type="button" onClick={addDescPoint} className="text-[#3c50e0] hover:text-blue-700 text-xs flex items-center gap-1 font-bold">
                    <FiPlus /> Add Point
                  </button>
                </label>
                <div className="space-y-3">
                  {description.map((point, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-2">•</span>
                      <textarea
                        value={point}
                        onChange={(e) => handleDescChange(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg py-2 px-3 outline-none focus:border-[#3c50e0] text-sm resize-none"
                        rows="2"
                        placeholder="e.g., 100% authentic Sivakasi crackers..."
                      ></textarea>
                      {description.length > 1 && (
                        <button type="button" onClick={() => removeDescPoint(index)} className="mt-2 p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors">
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Product Image *</label>
                <div className="flex items-center gap-4">
                  {mainImage ? (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden group">
                      <img src={mainImage} alt="Main" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type="button" onClick={() => setMainImage(null)} className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUpload className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 font-semibold">Upload</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* Sub Images Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub Images (Max 3)
                  <span className="text-xs text-gray-400 font-normal ml-2">({subImages.length}/3 uploaded)</span>
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  {subImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                      <img src={img} alt={`Sub ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type="button" onClick={() => removeSubImage(idx)} className="text-white bg-red-500 p-1.5 rounded-full hover:bg-red-600">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {subImages.length < 3 && (
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiPlus className="w-5 h-5 text-gray-400 mb-1" />
                        <p className="text-[10px] text-gray-500 font-semibold text-center leading-tight">Add<br/>Image</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleSubImagesChange} />
                    </label>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard/products')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#3c50e0] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><FiSave /> {isEditMode ? 'Update Product' : 'Save Product'}</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;
