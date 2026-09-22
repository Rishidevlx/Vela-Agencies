import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  FiHome, FiBox, FiTag, FiPhone, FiMessageCircle, 
  FiSettings, FiUser, FiChevronDown, FiChevronRight, FiLogOut, FiX, FiMonitor, FiFileText, FiTruck
} from 'react-icons/fi';
import whiteLogo from '../../assets/logo-white-withoutbg.png';

const SidebarItem = ({ icon: Icon, title, to, children, isOpen, onClick }) => {
  const hasChildren = Boolean(children);

  return (
    <div className="flex flex-col">
      {hasChildren ? (
        <div 
          onClick={onClick}
          className="flex items-center justify-between px-6 py-3 text-gray-300 hover:text-white hover:bg-[#394d6e] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="text-lg" />
            <span className="font-medium text-sm">{title}</span>
          </div>
          {isOpen ? <FiChevronDown /> : <FiChevronRight />}
        </div>
      ) : (
        <NavLink
          to={to}
          onClick={onClick}
          className={({ isActive }) => 
            `flex items-center gap-3 px-6 py-3 transition-colors ${
              isActive ? 'text-white bg-[#394d6e] border-l-4 border-brand' : 'text-gray-300 hover:text-white hover:bg-[#394d6e] border-l-4 border-transparent'
            }`
          }
        >
          <Icon className="text-lg" />
          <span className="font-medium text-sm">{title}</span>
        </NavLink>
      )}

      {/* Submenu Dropdown */}
      {hasChildren && isOpen && (
        <div className="flex flex-col bg-[#24334a]">
          {children.map((child, idx) => (
            <NavLink
              key={idx}
              to={child.to}
              onClick={child.onClick}
              className={({ isActive }) => 
                `py-2.5 pl-14 pr-6 text-sm transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              {child.title}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ onClose }) => {
  const [openMenus, setOpenMenus] = useState({});
  const [logoUrl, setLogoUrl] = useState(whiteLogo);

  React.useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.general_settings) {
          if (data.data.general_settings.favicon_url) {
            const favicon = document.getElementById('favicon');
            if (favicon) favicon.href = data.data.general_settings.favicon_url;
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: FiHome,
      to: '/dashboard',
    },
    {
      title: 'Home page CMS',
      icon: FiMonitor,
      subItems: [
        { title: 'Home Page', to: '/dashboard/cms/home', onClick: onClose },
        { title: 'Latest Top Selling Product', to: '/dashboard/cms/top-selling', onClick: onClose },
        { title: 'Footer', to: '/dashboard/cms/footer', onClick: onClose }
      ]
    },
    {
      title: 'Products',
      icon: FiBox,
      subItems: [
        { title: 'All Products', to: '/dashboard/products', onClick: onClose },
        { title: 'Add Product', to: '/dashboard/products/add', onClick: onClose },
        { title: 'Categories', to: '/dashboard/categories', onClick: onClose },
        // { title: 'Product Offers', to: '/dashboard/offers', onClick: onClose },
      ],
    },
    {
      title: 'Contact Details',
      icon: FiPhone,
      subItems: [
        { title: 'WhatsApp Settings', to: '/dashboard/settings/whatsapp', onClick: onClose },
        { title: 'Contact Details', to: '/dashboard/contact/details', onClick: onClose },
        { title: 'Giftbox Floating', to: '/dashboard/contact/giftbox', onClick: onClose }
      ]
    },
    {
      title: 'Enquiries',
      icon: FiMessageCircle,
      subItems: [
        { title: 'WhatsApp Enquiries', to: '/dashboard/enquiries/whatsapp', onClick: onClose }
      ]
    },
    {
      title: 'Settings',
      icon: FiSettings,
      subItems: [
        { title: 'General Settings', to: '/dashboard/settings/general', onClick: onClose },
        { title: 'SEO Settings', to: '/dashboard/settings/seo', onClick: onClose },
      ]
    }
  ];

  const billingItems = [
    { title: 'Outward', to: '/dashboard/billing/outward', onClick: onClose },
    { title: 'Outward List', to: '/dashboard/billing/list', onClick: onClose },
  ];

  const transportItems = [
    { title: 'Transport Entry', to: '/dashboard/transport/entry', onClick: onClose },
    { title: 'Transport Report', to: '/dashboard/transport/report', onClick: onClose },
  ];

  const adminItems = [
    { title: 'Profile', to: '/dashboard/account/profile', onClick: onClose },
    { title: 'Change Password', to: '/dashboard/account/change-password', onClick: onClose },
  ];

  return (
    <div className="w-64 bg-[#2F415D] h-screen flex flex-col shadow-xl overflow-y-auto">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 bg-[#24334a] shrink-0">
        <Link to="/dashboard" onClick={onClose} className="flex items-center justify-center w-full py-1">
          <img src={whiteLogo} alt="Vela Agencies" className="h-14 sm:h-16 w-auto max-w-[210px] object-contain drop-shadow" />
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-300 hover:text-white p-1 cursor-pointer">
          <FiX className="text-2xl" />
        </button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        <div className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          Main
        </div>
        
        {menuItems.map((item, idx) => (
          <SidebarItem 
            key={idx}
            icon={item.icon} 
            title={item.title} 
            to={item.to}
            isOpen={openMenus[item.title]}
            onClick={() => toggleMenu(item.title)}
            children={item.subItems}
          />
        ))}

        {/* Billing Section (Between Main and Admin) */}
        <div className="px-6 py-2 mt-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-white/10 pt-4">
          Billing
        </div>
        
        <SidebarItem 
          icon={FiFileText} 
          title="Billing" 
          isOpen={openMenus['Billing'] !== undefined ? openMenus['Billing'] : true}
          onClick={() => toggleMenu('Billing')}
          children={billingItems}
        />

        <SidebarItem 
          icon={FiTruck} 
          title="Transport" 
          isOpen={openMenus['Transport'] !== undefined ? openMenus['Transport'] : true}
          onClick={() => toggleMenu('Transport')}
          children={transportItems}
        />

        {/* Admin Section */}
        <div className="px-6 py-2 mt-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-white/10 pt-4">
          Admin
        </div>
        
        <SidebarItem 
          icon={FiUser} 
          title="Account" 
          isOpen={openMenus['Account']}
          onClick={() => toggleMenu('Account')}
          children={adminItems}
        />
        
        <div 
          onClick={() => {
            localStorage.removeItem('adminToken');
            window.location.href = '/';
          }}
          className="flex items-center gap-3 px-6 py-3 mt-auto text-red-400 hover:text-white hover:bg-red-500/20 cursor-pointer transition-colors"
        >
          <FiLogOut className="text-lg" />
          <span className="font-medium text-sm">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
