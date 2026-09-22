import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus } from 'react-icons/fi';
import { FaWhatsapp, FaHeart } from 'react-icons/fa';
import ProductCard from '../components/product/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        const data = await response.json();
        if (data.success) {
          const p = data.data;
          let discount = null;
          const orig = p.is_offer_active ? parseFloat(p.original_price) : null;
          const curr = parseFloat(p.price);
          if (orig && orig > curr) {
            discount = Math.round(((orig - curr) / orig) * 100);
          }
          
          let parsedDesc = [];
          if (Array.isArray(p.description)) {
            parsedDesc = p.description;
          } else if (typeof p.description === 'string') {
            try {
              parsedDesc = JSON.parse(p.description);
              if (!Array.isArray(parsedDesc)) parsedDesc = [parsedDesc];
            } catch (e) {
              parsedDesc = [p.description];
            }
          } else if (p.description) {
            parsedDesc = [String(p.description)];
          }

          let subImages = [];
          if (Array.isArray(p.sub_images)) {
            subImages = p.sub_images;
          } else if (typeof p.sub_images === 'string') {
            try {
              subImages = JSON.parse(p.sub_images);
            } catch (e) {}
          }

          let parsedUnit = '';
          if (Array.isArray(p.unit) && p.unit.length > 0) {
            parsedUnit = p.unit[0];
          } else if (typeof p.unit === 'string') {
            try {
              const u = JSON.parse(p.unit);
              if (Array.isArray(u) && u.length > 0) parsedUnit = u[0];
              else parsedUnit = u;
            } catch (e) {
              parsedUnit = p.unit;
            }
          }

          setProduct({
            id: p.id,
            name: p.name,
            category: p.category_name,
            originalPrice: orig || null,
            price: curr,
            discount: discount,
            image: p.main_image,
            description: parsedDesc,
            subImages: subImages,
            unit: parsedUnit,
            moq: p.moq || 1
          });
          setActiveImage(p.main_image);
          setQuantity(p.moq || 1);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDecrease = () => setQuantity(prev => (prev > (product?.moq || 1) ? prev - 1 : (product?.moq || 1)));
  const handleIncrease = () => setQuantity(prev => prev + 1);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col justify-center items-center font-body gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-brand rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen pt-32 flex justify-center items-center">Product not found.</div>;
  }

  return (
    <main className="bg-white min-h-screen pb-16 pt-32 font-body">
      <SEO 
        title={`${product.name} | Buy Online at Vela Agencies`}
        description={product.description[0] || `Buy ${product.name} online at wholesale prices from Vela Agencies. Premium Sivakasi crackers with safe delivery.`}
        keywords={`${product.name}, ${product.category}, buy ${product.name}, sivakasi crackers online, fireworks`}
        url={`https://www.velaagencies.com/product/${id}`}
        image={product.image}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": product.image,
          "description": product.description[0] || `Buy ${product.name} online`,
          "brand": {
            "@type": "Brand",
            "name": "Vela Agencies"
          },
          "offers": {
            "@type": "Offer",
            "url": `https://www.velaagencies.com/product/${id}`,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Vela Agencies"
            }
          }
        }}
        twitterData={{
          label1: "Price",
          data1: `₹${product.price}`,
          label2: "Category",
          data2: product.category || "Fireworks"
        }}
      />
      <div className="max-w-7xl mx-auto px-5 md:px-12">
        
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-brand transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left: Product Image */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              {product.discount && (
                <div className="absolute top-4 left-4 bg-[#F8B400] text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                  -{product.discount}%
                </div>
              )}
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Thumbnail gallery */}
            <div className="flex gap-4">
              <div 
                onClick={() => setActiveImage(product.image)}
                className={`w-24 h-24 bg-gray-50 rounded-lg border cursor-pointer hover:border-brand transition-colors p-2 flex items-center justify-center ${activeImage === product.image ? 'border-brand' : 'border-gray-200'}`}
              >
                <img src={product.image} alt="thumbnail" className="w-full h-full object-contain" />
              </div>
              {product.subImages.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-24 bg-gray-50 rounded-lg border cursor-pointer hover:border-brand transition-colors p-2 flex items-center justify-center ${activeImage === img ? 'border-brand' : 'border-gray-200'}`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              )}
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-brand">
                  ₹{product.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
                {product.unit && (
                  <span className="text-gray-500 font-medium ml-2 text-sm bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                    / Per {product.unit}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-gray-200 mb-8"></div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-300 rounded-md h-12 w-56">
                <button onClick={handleDecrease} className="w-12 h-full flex items-center justify-center text-gray-600 hover:text-brand hover:bg-gray-50 transition-colors">
                  <FiMinus />
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const minMoq = product?.moq || 1;
                    setQuantity(isNaN(val) || val < minMoq ? minMoq : val);
                  }}
                  className="flex-1 h-full w-full text-center font-semibold text-gray-800 border-x border-gray-300 outline-none focus:border-brand appearance-none"
                  min={product?.moq || 1}
                />
                <button onClick={handleIncrease} className="w-12 h-full flex items-center justify-center text-gray-600 hover:text-brand hover:bg-gray-50 transition-colors">
                  <FiPlus />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={() => {
                  addToCart(product, quantity);
                  setQuantity(product?.moq || 1);
                }}
                className="flex-1 w-full h-12 bg-footer text-white rounded-md flex items-center justify-center gap-2 font-bold hover:bg-brand transition-colors shadow-md"
              >
                <FiShoppingCart className="text-lg" />
                ADD TO CART
              </button>
            </div>
            
            {/* MOQ Info */}
            {product?.moq > 1 && (
              <p className="text-sm text-brand font-medium mb-6 mt-[-10px]">
                Minimum Order Quantity: {product.moq} {product.unit ? `per ${product.unit}` : 'items'}
              </p>
            )}

            {/* Wishlist & WhatsApp Buttons */}
            <div className="flex items-center gap-6 mb-8 text-sm font-semibold">
              <button 
                onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-2 transition-colors group ${isWishlisted ? 'text-brand' : 'text-gray-600 hover:text-brand'}`}
              >
                <div className={`p-2 rounded-full border transition-colors ${isWishlisted ? 'border-brand' : 'border-gray-200 group-hover:border-brand'}`}>
                  {isWishlisted ? <FaHeart className="text-lg text-brand" /> : <FiHeart className="text-lg" />}
                </div>
                {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
                    const data = await res.json();
                    const waNumber = data.data?.whatsapp_settings?.number || '';
                    
                    if (!waNumber) {
                      alert('WhatsApp number not configured. Please try again later.');
                      return;
                    }

                    let message = `Hi, I would like to order/inquire about this product:\n\n`;
                    message += `*${product.name}*\n`;
                    if (product.category) {
                      message += `Category: ${product.category}\n`;
                    }
                    message += `Price: ₹${product.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
                    if (product.unit) {
                      message += `Unit: per ${product.unit}\n`;
                    }
                    if (product.image) {
                      message += `Link/Image: ${product.image}\n`;
                    }

                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
                  } catch (error) {
                    console.error('Error with whatsapp enquiry:', error);
                    alert('Something went wrong. Please try again.');
                  }
                }}
                className="flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] transition-colors group"
              >
                <div className="p-2 rounded-full border border-[#25D366] group-hover:border-[#128C7E]">
                  <FaWhatsapp className="text-lg" />
                </div>
                WhatsApp Enquiry
              </button>
            </div>

            <div className="w-full h-px bg-gray-200 mb-6"></div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Description</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                {product.description.map((desc, idx) => (
                  <li key={idx} className="leading-relaxed">{desc}</li>
                ))}
              </ul>
            </div>

            {/* Meta */}
            <div className="text-sm text-gray-500 space-y-2">
              <p><span className="font-semibold text-gray-800">Category:</span> {product.category}</p>
            </div>

          </div>
        </div>

        {/* Related Products Section (Temporarily hidden until we have more products) */}
        {/* <div className="mt-20">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-8 border-l-4 border-brand pl-4">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          </div>
        </div> */}

      </div>
    </main>
  );
};

export default ProductDetails;
