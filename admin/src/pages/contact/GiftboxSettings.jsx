import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiUpload, FiImage } from 'react-icons/fi';

const GiftboxSettings = () => {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [settings, setSettings] = useState({
    isActive: false,
    image: '',
    heading: '',
    content: ''
  });

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.giftbox_settings) {
          setSettings({
            isActive: data.data.giftbox_settings.isActive || false,
            image: data.data.giftbox_settings.image || '',
            heading: data.data.giftbox_settings.heading || '',
            content: data.data.giftbox_settings.content || ''
          });
        }
      })
      .catch(err => console.error('Error fetching giftbox settings:', err));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');

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
        setSettings({ ...settings, image: data.url });
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
    setLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ giftbox_settings: settings })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Giftbox floating settings updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating giftbox settings:', error);
      toast.error('Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Giftbox Floating Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="font-semibold text-gray-700 block text-lg">Enable Giftbox Icon</label>
              <p className="text-sm text-gray-500">Show a floating giftbox icon on the website to attract users to offers.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={settings.isActive}
                  onChange={(e) => setSettings({...settings, isActive: e.target.checked})}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${settings.isActive ? 'bg-brand' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.isActive ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Popup Image</label>
            <div className="flex items-center gap-4">
              {settings.image ? (
                <div className="relative w-32 h-32 rounded border border-gray-200 overflow-hidden">
                  <img src={settings.image} alt="Popup" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, image: '' })}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
                  <FiImage className="text-3xl" />
                </div>
              )}
              <label className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer border ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                <FiUpload />
                {isUploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recommended size: 400x300 pixels.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Popup Heading</label>
            <input
              type="text"
              value={settings.heading}
              onChange={(e) => setSettings({...settings, heading: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand outline-none transition-shadow"
              placeholder="e.g. Special Offer!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Popup Content</label>
            <textarea
              value={settings.content}
              onChange={(e) => setSettings({...settings, content: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand outline-none transition-shadow"
              placeholder="e.g. Provide your mobile number to get an exclusive discount code."
              rows="3"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GiftboxSettings;
