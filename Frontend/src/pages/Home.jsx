import React from 'react';
import SEO from '../components/seo/SEO';
import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import HomeMarquee from '../components/home/HomeMarquee';
import HomeAbout from '../components/home/HomeAbout';
import WhyChooseUs from '../components/home/WhyChooseUs';

const Home = () => {
  return (
    <main className="home-page font-body">
      <SEO 
        title="Vela Agencies Sivakasi Crackers | Buy Online Fireworks at Wholesale Price"
        description="Vela Agencies in Sivakasi - Buy authentic Sivakasi crackers online at genuine wholesale factory prices. Best crackers shop in Sivakasi with safe doorstep delivery across India."
        keywords="vela agencies in sivakasi, vela agencies, sivakasi crackers, buy crackers online sivakasi, wholesale crackers sivakasi, online crackers shopping sivakasi, diwali crackers wholesale sivakasi, standard fireworks sivakasi"
        url="https://www.velaagencies.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "LocalBusiness",
              "name": "Vela Agencies in Sivakasi",
              "alternateName": "Vela Agencies Sivakasi Crackers",
              "description": "Leading wholesale and retail Sivakasi crackers manufacturer & supplier offering genuine factory prices and online ordering.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "S.No. 456/2C1B, D.No. 2/266, ALANGULAM",
                "addressLocality": "Vembakottai (Tk), Virudhunagar (Dt)",
                "addressRegion": "Tamil Nadu",
                "postalCode": "626131",
                "addressCountry": "IN"
              },
              "telephone": "+919994703605",
              "url": "https://www.velaagencies.com",
              "areaServed": [
                "Sivakasi",
                "Tamil Nadu",
                "South India",
                "North India",
                "All Over India"
              ]
            },
            {
              "@type": "WebSite",
              "name": "Vela Agencies",
              "url": "https://www.velaagencies.com/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.velaagencies.com/shop?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ]
        }}
      />
      <Hero />
      <Categories />
      <WhyChooseUs />
      <FeaturedProducts />
      <HomeMarquee />
      <HomeAbout />
    </main>
  );
};

export default Home;
