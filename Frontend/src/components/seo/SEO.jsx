import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Vela Agencies - Buy Diwali Crackers Online | Sivakasi',
  description = 'Premium quality crackers from Sivakasi. Vela Agencies offers a wide range of diwali fireworks, atom bombs, sparklers, rockets & combo packs at best prices. Order online now!',
  keywords = 'Vela Agencies Sivakasi, wholesale traders in Sivakasi, fireworks supplier in Sivakasi, best traders in Sivakasi, Sivakasi wholesale market, Sivakasi business directory, fireworks manufacturer Sivakasi, Sivakasi crackers wholesale dealers, buy fireworks online Sivakasi, original Sivakasi crackers factory, cheap and best crackers in Sivakasi, Sivakasi pattasu wholesale, diwali crackers online',
  url = 'https://www.velaagencies.com',
  image = 'https://www.velaagencies.com/Logo/logo.png',
  type = 'website',
  structuredData = null,
  twitterData = null,
}) => {
  const fullTitle = title.includes('Vela Agencies')
    ? title
    : `${title} | Vela Agencies`;

  // Get current accurate URL for canonical if in browser
  const currentUrl = typeof window !== 'undefined' ? window.location.href : url;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Vela Agencies" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Vela Agencies" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@VelaAgencies" />
      {twitterData?.label1 && <meta name="twitter:label1" content={twitterData.label1} />}
      {twitterData?.data1 && <meta name="twitter:data1" content={twitterData.data1} />}
      {twitterData?.label2 && <meta name="twitter:label2" content={twitterData.label2} />}
      {twitterData?.data2 && <meta name="twitter:data2" content={twitterData.data2} />}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
