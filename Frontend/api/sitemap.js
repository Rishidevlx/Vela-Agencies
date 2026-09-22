export default async function handler(req, res) {
  try {
    const apiUrl = process.env.VITE_API_URL || 'https://api.velaagencies.com';
    
    // Fetch active products
    const prodRes = await fetch(`${apiUrl}/api/products`);
    const prodData = await prodRes.json();
    const products = prodData.success ? prodData.data : [];

    // Base URLs
    const baseUrl = 'https://www.velaagencies.com';
    const staticPages = [
      '',
      '/shop',
      '/about',
      '/contact',
      '/blog',
      '/privacy-policy',
      '/terms-conditions'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic product pages
    const slugify = (text) => {
      if (!text) return '';
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };
    
    products.forEach(product => {
      if (product.status === 'active') {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/product/${slugify(product.name)}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // cache for 1 day
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
