import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSettings, FiSave, FiImage, FiType, FiDollarSign } from 'react-icons/fi';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    logo_url: '',
    favicon_url: '',
    pricelist_url: '',
    currency_symbol: '₹',
    gst_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingPricelist, setUploadingPricelist] = useState(false);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    if (type === 'logo') setUploadingLogo(true);
    else if (type === 'favicon') setUploadingFavicon(true);
    else setUploadingPricelist(true);

    const toastId = toast.loading(`Uploading ${type}...`);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        if (type === 'logo') {
          setSettings(prev => ({ ...prev, logo_url: data.url }));
        } else if (type === 'favicon') {
          setSettings(prev => ({ ...prev, favicon_url: data.url }));
        } else {
          setSettings(prev => ({ ...prev, pricelist_url: data.url }));
        }
        toast.success(`${type} uploaded successfully`, { id: toastId });
      } else {
        toast.error(data.message || 'Upload failed', { id: toastId });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Network error during upload', { id: toastId });
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else if (type === 'favicon') setUploadingFavicon(false);
      else setUploadingPricelist(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const data = await res.json();
      if (data.success && data.data.general_settings) {
        setSettings({
          logo_url: data.data.general_settings.logo_url || '',
          favicon_url: data.data.general_settings.favicon_url || '',
          pricelist_url: data.data.general_settings.pricelist_url || '',
          currency_symbol: data.data.general_settings.currency_symbol || '₹',
          gst_number: data.data.general_settings.gst_number || '',
          is_promo_enabled: data.data.general_settings.is_promo_enabled !== false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ general_settings: settings })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500 font-medium">Loading Settings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto font-body">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FiSettings className="text-brand" /> General Settings
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Manage your website's core branding and configuration.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        {/* Branding Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiType className="text-brand text-xl" />
            <h2 className="text-lg font-bold text-gray-800">Branding Information</h2>
          </div>
          
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiImage className="text-gray-400" /> Upload Logo
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <label className="cursor-pointer bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors shadow-sm text-sm font-semibold">
                    {uploadingLogo ? 'Uploading...' : 'Choose Logo'}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                  {settings.logo_url && <span className="text-sm text-green-600 font-medium">Logo uploaded!</span>}
                </div>
                {settings.logo_url && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center h-32">
                    <img src={settings.logo_url} alt="Logo Preview" className="max-h-full max-w-full object-contain drop-shadow-md" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiImage className="text-gray-400" /> Upload Favicon
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <label className="cursor-pointer bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors shadow-sm text-sm font-semibold">
                    {uploadingFavicon ? 'Uploading...' : 'Choose Favicon'}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                      disabled={uploadingFavicon}
                      className="hidden"
                    />
                  </label>
                  {settings.favicon_url && <span className="text-sm text-green-600 font-medium">Favicon uploaded!</span>}
                </div>
                {settings.favicon_url && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center h-32">
                    <img src={settings.favicon_url} alt="Favicon Preview" className="h-12 w-12 object-contain drop-shadow-sm" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiImage className="text-gray-400" /> Upload Pricelist PDF
              </label>
              <div className="flex items-center gap-4 mb-3">
                <label className="cursor-pointer bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors shadow-sm text-sm font-semibold">
                  {uploadingPricelist ? 'Uploading...' : 'Choose PDF File'}
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, 'pricelist')}
                    disabled={uploadingPricelist}
                    className="hidden"
                  />
                </label>
                {settings.pricelist_url && <span className="text-sm text-green-600 font-medium break-all">Pricelist uploaded: {settings.pricelist_url.split('/').pop()}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiDollarSign className="text-brand text-xl" />
            <h2 className="text-lg font-bold text-gray-800">Regional Configuration</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="max-w-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Symbol</label>
                <input 
                  type="text" 
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({...settings, currency_symbol: e.target.value})}
                  placeholder="e.g. ₹ or $"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-xl font-bold"
                />
              </div>
              <div className="max-w-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number</label>
                <input 
                  type="text" 
                  value={settings.gst_number || ''}
                  onChange={(e) => setSettings({...settings, gst_number: e.target.value})}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-semibold uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Promo Intro Screen Toggle Card (Temporarily Commented Out)
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💥</span>
              <h2 className="text-lg font-bold text-gray-800">Website Promo Loader Screen</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${settings.is_promo_enabled !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {settings.is_promo_enabled !== false ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          
          <div className="p-6 flex items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Enable Bomb Blast Promo Screen</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                When enabled, visitors will see the animated bomb fuse & blast intro screen on opening the website.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input 
                type="checkbox" 
                checked={settings.is_promo_enabled !== false}
                onChange={(e) => setSettings({ ...settings, is_promo_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>
        </div>
        */}

        {/* Action Area */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-all shadow-sm disabled:opacity-70 cursor-pointer"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <><FiSave className="text-xs" /> Save Configuration</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;
