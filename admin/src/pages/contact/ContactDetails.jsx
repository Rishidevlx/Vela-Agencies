import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiClock, FiMapPin, FiSave } from 'react-icons/fi';

const ContactDetails = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: 'SH 183, Kallamanaickerpatti, near alangulam 626131, virudhunagar , Tamil Nadu , India',
    phone1: '7305327400',
    phone2: '',
    phone3: '',
    phone4: '',
    phone: '7305327400',
    email: 'hari953616@gmail.com',
    working_hours: 'Monday to Sunday: 9:00 AM - 9:00 PM',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.141517032128!2d77.79524451478953!3d9.452668593226768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cee43b8210e3%3A0x868b446a2a07d4b4!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1689254125867!5m2!1sen!2sin',
    call_number: '7305327400'
  });

  const cleanNumber = (val) => {
    if (!val) return '';
    return val.replace('+91', '').trim();
  };

  useEffect(() => {
    fetchContactDetails();
  }, []);

  const fetchContactDetails = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
      const data = await response.json();
      if (data.success && data.data.contact_details) {
        const cd = data.data.contact_details;
        setFormData({
          address: cd.address || '',
          phone1: cleanNumber(cd.phone1 || cd.phone || ''),
          phone2: cleanNumber(cd.phone2 || ''),
          phone3: cleanNumber(cd.phone3 || ''),
          phone4: cleanNumber(cd.phone4 || ''),
          phone: cleanNumber(cd.phone1 || cd.phone || ''),
          email: cd.email || '',
          working_hours: cd.working_hours || '',
          map_url: cd.map_url || '',
          call_number: cleanNumber(cd.call_number || cd.phone1 || cd.phone || '')
        });
      }
    } catch (error) {
      toast.error('Failed to fetch contact details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone1.trim()) {
      toast.error('Customer Service Number 1 is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        phone1: '+91 ' + formData.phone1.trim(),
        phone2: formData.phone2.trim() ? '+91 ' + formData.phone2.trim() : '',
        phone3: formData.phone3.trim() ? '+91 ' + formData.phone3.trim() : '',
        phone4: formData.phone4.trim() ? '+91 ' + formData.phone4.trim() : '',
        phone: '+91 ' + formData.phone1.trim(),
        call_number: '+91' + formData.call_number.replace(/\s/g, '').trim()
      };

      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ contact_details: payload }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Contact details updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update contact details');
      }
    } catch (error) {
      toast.error('An error occurred while updating details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl font-body">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiPhone className="text-brand" /> Contact Details
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Manage contact information displayed on the website</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FiMapPin className="text-gray-400" /> Store Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
            placeholder="e.g., SH 183, Kallamanaickerpatti, near alangulam 626131, virudhunagar , Tamil Nadu , India"
            required
          ></textarea>
        </div>

        {/* 4 Customer Service Numbers Section */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
            Customer Service Numbers (Up to 4 Numbers)
          </h3>
          <p className="text-xs text-gray-500 mb-4">Number 1 is mandatory. Numbers 2, 3, and 4 are optional.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Number 1 (Required) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Service Number 1 <span className="text-red-500 font-bold">* (Required)</span>
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand bg-white">
                <span className="flex items-center px-3 bg-gray-100 text-gray-600 border-r border-gray-300 text-sm font-medium">
                  +91
                </span>
                <input
                  type="text"
                  name="phone1"
                  value={formData.phone1}
                  onChange={handleInputChange}
                  className="w-full p-2.5 outline-none text-sm"
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>

            {/* Number 2 (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Service Number 2 <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand bg-white">
                <span className="flex items-center px-3 bg-gray-100 text-gray-600 border-r border-gray-300 text-sm font-medium">
                  +91
                </span>
                <input
                  type="text"
                  name="phone2"
                  value={formData.phone2}
                  onChange={handleInputChange}
                  className="w-full p-2.5 outline-none text-sm"
                  placeholder="Optional Number 2"
                />
              </div>
            </div>

            {/* Number 3 (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Service Number 3 <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand bg-white">
                <span className="flex items-center px-3 bg-gray-100 text-gray-600 border-r border-gray-300 text-sm font-medium">
                  +91
                </span>
                <input
                  type="text"
                  name="phone3"
                  value={formData.phone3}
                  onChange={handleInputChange}
                  className="w-full p-2.5 outline-none text-sm"
                  placeholder="Optional Number 3"
                />
              </div>
            </div>

            {/* Number 4 (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Service Number 4 <span className="text-gray-400 text-[11px]">(Optional)</span>
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand bg-white">
                <span className="flex items-center px-3 bg-gray-100 text-gray-600 border-r border-gray-300 text-sm font-medium">
                  +91
                </span>
                <input
                  type="text"
                  name="phone4"
                  value={formData.phone4}
                  onChange={handleInputChange}
                  className="w-full p-2.5 outline-none text-sm"
                  placeholder="Optional Number 4"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Floating Call & Email & Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Floating Call Icon Number <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand bg-white">
              <span className="flex items-center px-3 bg-gray-100 text-gray-600 border-r border-gray-300 text-sm font-medium">
                +91
              </span>
              <input
                type="text"
                name="call_number"
                value={formData.call_number}
                onChange={handleInputChange}
                className="w-full p-2.5 outline-none text-sm"
                placeholder="10-digit number"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for the floating call button (10 digits)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiMail className="text-gray-400" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none text-sm"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiClock className="text-gray-400" /> Opening Hours
            </label>
            <input
              type="text"
              name="working_hours"
              value={formData.working_hours}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none text-sm"
              placeholder="e.g., Monday to Sunday: 9:00 AM - 9:00 PM"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Google Maps Embed URL
            </label>
            <textarea
              name="map_url"
              value={formData.map_url}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none text-sm"
              placeholder="https://www.google.com/maps/embed?..."
              required
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Go to Google Maps -&gt; Share -&gt; Embed a map -&gt; Copy the src URL only</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand/90 transition-all shadow-md disabled:opacity-50"
          >
            <FiSave className="text-lg" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactDetails;

