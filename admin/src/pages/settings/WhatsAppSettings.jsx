import React, { useState, useEffect } from 'react';
import { FiSave, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const WhatsAppSettings = () => {
  const [settings, setSettings] = useState({
    number: '',
    defaultMessage: 'Hi! I would like to know more about your products.',
    collect_mobile_number: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const data = await response.json();
      
      if (data.success && data.data.whatsapp_settings) {
        let fetchedNumber = data.data.whatsapp_settings.number || '';
        if (fetchedNumber.startsWith('91')) {
          fetchedNumber = fetchedNumber.substring(2);
        }
        setSettings({
          ...data.data.whatsapp_settings,
          number: fetchedNumber
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Clean up the phone number and ensure it starts with 91
    let cleanedNumber = settings.number.replace(/[^0-9]/g, '');
    if (!cleanedNumber.startsWith('91')) {
      cleanedNumber = '91' + cleanedNumber;
    }
    
    const cleanedSettings = {
      ...settings,
      number: cleanedNumber
    };

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ whatsapp_settings: cleanedSettings })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('WhatsApp Settings saved successfully!');
        setSettings(cleanedSettings);
      } else {
        toast.error('Failed to save settings: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Network error while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your WhatsApp contact number and default inquiry messages</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-2xl">
        <form onSubmit={handleSave} className="p-6">
          
          <div className="space-y-6">
            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMessageCircle className="text-gray-400" />
                </div>
                <div className="absolute inset-y-0 left-0 pl-10 flex items-center pointer-events-none border-r border-gray-300 pr-2 my-2">
                  <span className="text-gray-600 font-medium">+91</span>
                </div>
                <input
                  type="text"
                  name="number"
                  value={settings.number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 10) {
                      handleChange({ target: { name: 'number', value: val } });
                    }
                  }}
                  placeholder="e.g. 9876543210"
                  required
                  className="pl-[84px] w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter your 10-digit WhatsApp number (without the +91 country code).</p>
            </div>

            {/* Default Message Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Greeting Message
              </label>
              <textarea
                name="defaultMessage"
                value={settings.defaultMessage}
                onChange={handleChange}
                rows="4"
                placeholder="Enter the default message..."
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">This message will be pre-filled when a user clicks the floating WhatsApp icon on your website.</p>
            </div>

            {/* Collect Mobile Number Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="font-medium text-gray-800 block">Collect Mobile Number on Checkout</label>
                <p className="text-sm text-gray-500 mt-0.5">If active, users will be prompted for their mobile number before redirecting to WhatsApp from the Cart.</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.collect_mobile_number}
                    onChange={(e) => setSettings({...settings, collect_mobile_number: e.target.checked})}
                  />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${settings.collect_mobile_number ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${settings.collect_mobile_number ? 'transform translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
                isSaving || isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              <FiSave />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Preview Section */}
      <div className="mt-6 max-w-2xl bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Live Preview</h3>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <FiMessageCircle className="text-white text-2xl" />
          </div>
          <div className="bg-white p-3 rounded-lg rounded-tl-none border border-gray-200 shadow-sm relative max-w-md">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{settings.defaultMessage}</p>
            <span className="text-[10px] text-gray-400 absolute bottom-1 right-2">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettings;
