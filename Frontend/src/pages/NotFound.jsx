import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';

const NotFound = () => {
  return (
    <main className="min-h-screen bg-primary flex flex-col justify-center items-center px-4 py-20 font-body text-center">
      <SEO 
        title="Page Not Found | Vela Agencies" 
        description="The page you are looking for does not exist. Return to the Vela Agencies homepage to shop for the best Sivakasi fireworks."
        url="https://www.velaagencies.com/404"
      />
      <h1 className="text-8xl md:text-9xl font-heading font-bold text-brand drop-shadow-md mb-4">404</h1>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 uppercase tracking-wider">Oops! Page Not Found</h2>
      <p className="text-gray-600 max-w-md mx-auto mb-10 leading-relaxed">
        We can't seem to find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="bg-brand text-white font-bold py-4 px-10 rounded-full hover:bg-footer transition-colors duration-300 shadow-lg text-lg uppercase tracking-wide"
      >
        Back to Home
      </Link>
    </main>
  );
};

export default NotFound;
