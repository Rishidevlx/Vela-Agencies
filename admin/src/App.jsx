import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import HomeCMS from './pages/cms/HomeCMS';
import TopSelling from './pages/cms/TopSelling';
import Categories from './pages/categories/Categories';
import AddProduct from './pages/products/AddProduct';
import AllProducts from './pages/products/AllProducts';

import ProductOffers from './pages/offers/ProductOffers';
import WhatsAppSettings from './pages/settings/WhatsAppSettings';
import ContactDetails from './pages/contact/ContactDetails';
import GiftboxSettings from './pages/contact/GiftboxSettings';
import FooterCMS from './pages/cms/FooterCMS';
import WhatsAppEnquiries from './pages/enquiries/WhatsAppEnquiries';
import GeneralSettings from './pages/settings/GeneralSettings';
import SEOSettings from './pages/settings/SEOSettings';
import Profile from './pages/account/Profile';
import ChangePassword from './pages/account/ChangePassword';

import OutwardBilling from './pages/billing/OutwardBilling';
import OutwardList from './pages/billing/OutwardList';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Dashboard Routes wrapped in Layout */}
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="cms/home" element={<HomeCMS />} />
          <Route path="cms/top-selling" element={<TopSelling />} />
          <Route path="cms/footer" element={<FooterCMS />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<AllProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
          <Route path="offers" element={<ProductOffers />} />
          <Route path="billing/outward" element={<OutwardBilling />} />
          <Route path="billing/list" element={<OutwardList />} />
          <Route path="settings/whatsapp" element={<WhatsAppSettings />} />
          <Route path="settings/general" element={<GeneralSettings />} />
          <Route path="settings/seo" element={<SEOSettings />} />
          <Route path="contact/details" element={<ContactDetails />} />
          <Route path="contact/giftbox" element={<GiftboxSettings />} />
          <Route path="enquiries/whatsapp" element={<WhatsAppEnquiries />} />
          <Route path="account/profile" element={<Profile />} />
          <Route path="account/change-password" element={<ChangePassword />} />
          {/* Add more nested routes for CMS, Products, etc. here later */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
