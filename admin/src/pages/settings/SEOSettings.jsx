import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSettings, FiSave, FiSearch, FiCode, FiType, FiLink } from 'react-icons/fi';

const SEOSettings = () => {
  const [settings, setSettings] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    google_analytics_code: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const data = await res.json();
      if (data.success && data.data.seo_settings) {
        setSettings({
          meta_title: data.data.seo_settings.meta_title || '',
          meta_description: data.data.seo_settings.meta_description || '',
          meta_keywords: data.data.seo_settings.meta_keywords || '',
          google_analytics_code: data.data.seo_settings.google_analytics_code || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load SEO settings');
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
        body: JSON.stringify({ seo_settings: settings })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('SEO Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast.error('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500 font-medium">Loading Settings...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-body flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6 animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiSearch className="text-brand" /> SEO Settings
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Optimize how your website appears on search engines.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <FiType className="text-brand text-xl" />
              <h2 className="text-lg font-bold text-gray-800">Meta Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Title</label>
                <input 
                  type="text" 
                  value={settings.meta_title}
                  onChange={(e) => setSettings({...settings, meta_title: e.target.value})}
                  maxLength={60}
                  placeholder="e.g. Premium Crackers Online | AK Crackers"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
                <div className="text-right mt-1 text-xs text-gray-400">
                  {settings.meta_title.length}/60 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
                <textarea 
                  value={settings.meta_description}
                  onChange={(e) => setSettings({...settings, meta_description: e.target.value})}
                  maxLength={160}
                  rows={3}
                  placeholder="e.g. Buy high-quality crackers online at wholesale prices. Fast delivery across India."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all resize-none"
                />
                <div className="text-right mt-1 text-xs text-gray-400">
                  {settings.meta_description.length}/160 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Keywords</label>
                <input 
                  type="text" 
                  value={settings.meta_keywords}
                  onChange={(e) => setSettings({...settings, meta_keywords: e.target.value})}
                  placeholder="e.g. crackers, fireworks, diwali crackers, online crackers"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
                <div className="mt-1 text-xs text-gray-400">
                  Separate keywords with commas.
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <FiCode className="text-brand text-xl" />
              <h2 className="text-lg font-bold text-gray-800">Analytics & Tracking</h2>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Google Analytics Script</label>
                <textarea 
                  value={settings.google_analytics_code}
                  onChange={(e) => setSettings({...settings, google_analytics_code: e.target.value})}
                  rows={4}
                  placeholder="<!-- Paste your Google Analytics tracking code here -->"
                  className="w-full px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm border border-gray-800 rounded-xl focus:border-brand outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex justify-start pt-2">
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand/90 transition-all shadow-lg hover:shadow-brand/30 disabled:opacity-70"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <><FiSave className="text-xl" /> Save SEO Settings</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Panel */}
      <div className="w-full lg:w-[400px] shrink-0 pt-20 hidden md:block">
        <div className="sticky top-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Search Engine Preview</h3>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <FiSearch className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 leading-none">Your Website</p>
                <p className="text-[11px] text-gray-500 mt-1">https://yourwebsite.com</p>
              </div>
            </div>
            <h3 className="text-[20px] font-medium text-[#1a0dab] hover:underline cursor-pointer leading-tight mb-1 truncate">
              {settings.meta_title || 'Your Site Title Will Appear Here'}
            </h3>
            <p className="text-[14px] text-[#4d5156] leading-snug break-words">
              {settings.meta_description || 'Your meta description will appear here. Write a compelling description to encourage users to click.'}
            </p>
          </div>
          
          <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 text-sm">
            <strong>Pro Tip:</strong> Keep your title under 60 characters and description under 160 characters for optimal display on Google.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOSettings;
