import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp.jsx';
import FloatingCall from './components/layout/FloatingCall.jsx';
import FloatingGift from './components/layout/FloatingGift.jsx';
import FloatingCart from './components/layout/FloatingCart.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import Footer from './components/layout/Footer.jsx';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import { Toaster } from 'react-hot-toast';
import { Fireworks } from '@fireworks-js/react';


import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Contact from './pages/Contact';
import Offers from './pages/Offers';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';


function App() {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    const handleFireworks = () => {
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 5000); // Fireworks canvas active for 5 seconds
    };
    window.addEventListener('trigger-fireworks', handleFireworks);
    return () => window.removeEventListener('trigger-fireworks', handleFireworks);
  }, []);

  return (
    <Router>
      <Toaster position="top-center" />
      <ScrollToTop />
      
      {/* Global Fireworks Overlay */}
      {showFireworks && (
        <Fireworks
          options={{ opacity: 0.7, particles: 150, intensity: 45 }}
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            position: 'fixed',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        />
      )}

      <div className="app-container">
        <Navbar />
        <FloatingWhatsApp />
        <FloatingCall />
        <FloatingGift />
        <FloatingCart />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:idOrSlug" element={<BlogPost />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
