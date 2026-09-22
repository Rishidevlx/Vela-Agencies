import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBox, FiGrid, FiTag, FiStar, FiMessageCircle, 
  FiArrowRight, FiActivity, FiPieChart, FiBarChart2 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, isPositive }) => (
  <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex-1 min-w-[200px]">
    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100 mb-4">
      <Icon className="text-xl" />
    </div>
    <div className="flex justify-between items-end mt-2">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value || 0}</h3>
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${isPositive ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>
          {isPositive ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
  </div>
);

const ShortcutCard = ({ title, to, icon: Icon }) => (
  <Link to={to} className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand/30 transition-all group">
    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-brand group-hover:bg-red-50 transition-colors mr-4">
      <Icon className="text-xl" />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
    </div>
    <FiArrowRight className="text-gray-300 group-hover:text-brand transition-colors" />
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOffers: 0,
    featuredProducts: 0,
    totalEnquiries: 0,
    chartData: {
      monthlyEnquiries: Array(12).fill(0),
      monthlyProducts: Array(12).fill(0)
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/dashboard-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setStats(prev => ({ ...prev, ...data.data }));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const enquiriesChartData = stats.chartData.monthlyEnquiries.map((count, index) => ({
    name: monthNames[index],
    Enquiries: count
  }));

  const productsChartData = stats.chartData.monthlyProducts.map((count, index) => ({
    name: monthNames[index],
    Products: count
  }));

  const TARGET_CATEGORIES = 20; // Hardcoded target for visual
  const categoryPercentage = Math.min(((stats.totalCategories / TARGET_CATEGORIES) * 100).toFixed(2), 100);

  return (
    <div className="flex flex-col gap-8 pb-10 font-body">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here's a quick summary of your store.</p>
      </div>

      {/* Stats Grid (5 Cards) */}
      <div className="flex flex-wrap gap-4">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={FiBox}
        />
        <StatCard 
          title="Total Categories" 
          value={stats.totalCategories} 
          icon={FiGrid}
        />
        <StatCard 
          title="Total Offers" 
          value={stats.totalOffers} 
          icon={FiTag}
        />
        <StatCard 
          title="Featured Products" 
          value={stats.featuredProducts} 
          icon={FiStar}
        />
        <StatCard 
          title="Latest Enquiries" 
          value={stats.totalEnquiries} 
          icon={FiMessageCircle}
        />
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Enquiries Graph */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 Monthly Enquiries
              </h2>
              <p className="text-gray-500 text-xs mt-1">Enquiry requests over time</p>
            </div>
            <select className="text-sm border border-gray-200 rounded px-2 py-1 outline-none text-gray-600 font-medium">
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enquiriesChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="Enquiries" stroke="#3c50e0" strokeWidth={3} dot={{ r: 4, fill: '#3c50e0', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Graph */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Category Target
          </h2>
          <p className="text-gray-500 text-xs mb-8">Target: {TARGET_CATEGORIES} Categories</p>
          
          <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
            {/* Dynamic gauge visual */}
            <div className="relative w-48 h-24 overflow-hidden mb-4">
              <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-gray-100"></div>
              <div 
                className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-transparent border-t-[#3c50e0] border-l-[#3c50e0] transition-transform duration-1000 ease-out"
                style={{ transform: `rotate(${ -135 + (categoryPercentage / 100) * 180 }deg)` }}
              ></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-center mt-2">
              <h3 className="text-3xl font-bold text-gray-800">{categoryPercentage}%</h3>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">{stats.totalCategories} / {TARGET_CATEGORIES}</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">You have achieved {categoryPercentage}% of your category target. Keep up the good work!</p>
        </div>

        {/* Product Graph */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-3 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Monthly Products Added
            </h2>
          </div>
          
          <div className="flex-1 w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Products" fill="#3c50e0" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Shortcuts Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 mt-2">Quick Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ShortcutCard title="Manage Products" to="/dashboard/products" icon={FiBox} />
          <ShortcutCard title="Manage Offers" to="/dashboard/offers" icon={FiTag} />
          <ShortcutCard title="View Enquiries" to="/dashboard/enquiries/whatsapp" icon={FiMessageCircle} />
          <ShortcutCard title="General Settings" to="/dashboard/settings/general" icon={FiGrid} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

