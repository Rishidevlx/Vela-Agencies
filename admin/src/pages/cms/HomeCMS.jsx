import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiUpload, FiTrash2, FiImage } from 'react-icons/fi';

const HomeCMS = () => {
  const [marqueeText, setMarqueeText] = useState('');
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchCMSData();
  }, []);

  const fetchCMSData = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const data = await response.json();
      if (data.success) {
        if (data.data.marquee_text) setMarqueeText(data.data.marquee_text);
        if (data.data.hero_banners) setBanners(data.data.hero_banners);
      }
    } catch (error) {
      console.error('Error fetching CMS:', error);
      toast.error('Failed to load CMS data');
    }
  };

  // Upload image to Cloudinary via Backend
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading image to secure cloud...');

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
        setBanners([...banners, data.url]);
        toast.success('Image uploaded successfully', { id: toastId });
      } else {
        toast.error(data.message || 'Upload failed', { id: toastId });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeBanner = (indexToRemove) => {
    setBanners(banners.filter((_, index) => index !== indexToRemove));
  };

  // Save changes to DB
  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          marquee_text: marqueeText,
          hero_banners: banners
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Home page updated on live website! 🎉');
      } else {
        toast.error('Failed to save changes');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Home Page CMS</h1>
          <p className="text-gray-500 text-sm mt-1">Manage content displayed on the main landing page.</p>
        </div>
        <button 
          onClick={handleSaveChanges}
          disabled={isLoading || isUploading}
          className="flex items-center gap-2 bg-[#3c50e0] hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-sm"
        >
          <FiSave />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Marquee Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Scrolling Marquee Text</h2>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Display Text</label>
          <input 
            type="text" 
            value={marqueeText}
            onChange={(e) => setMarqueeText(e.target.value)}
            placeholder="e.g. 50% OFF ON ALL CRACKERS THIS DIWALI!"
            className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-[#3c50e0] transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">This text will scroll at the very top of your website.</p>
        </div>
      </div>

      {/* Hero Banners Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-800">Hero Slider Banners</h2>
          
          <label className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer border
            ${isUploading ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}`}>
            <FiUpload />
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

        {banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <FiImage className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-center">No banners uploaded yet</p>
            <p className="text-gray-400 text-xs text-center mt-1">Upload images to display in the home page slider.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((url, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img 
                  src={url} 
                  alt={`Banner ${index + 1}`} 
                  className="w-full h-48 object-cover"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <span className="text-white font-medium mb-3">Banner {index + 1}</span>
                  <button 
                    onClick={() => removeBanner(index)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default HomeCMS;
