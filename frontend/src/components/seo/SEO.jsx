import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const cleanCanonicalUrl = (pathname, search) => {
  const url = new URL(`https://indiafy.com${pathname}${search}`);
  const paramsToRemove = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'ref', 'variant', 'recommendationExperiment', 'recommendationVariant'
  ];
  
  paramsToRemove.forEach(param => url.searchParams.delete(param));
  
  // Sort remaining parameters for consistent URLs (optional, but good for SEO)
  url.searchParams.sort();
  
  const searchStr = url.searchParams.toString();
  return `${url.origin}${url.pathname}${searchStr ? '?' + searchStr : ''}`;
};

const SEO = ({ 
  title = "IndiaFy — Buy Products Online from Local & Trusted Sellers", 
  description = "IndiaFy is an ecommerce platform connecting customers with local retail, wholesale, and quick-commerce sellers.", 
  canonical,
  robots = "index, follow",
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image"
}) => {
  const location = useLocation();
  const canonicalUrl = canonical || cleanCanonicalUrl(location.pathname, location.search);

  const fallbackOgTitle = ogTitle || title;
  const fallbackOgDescription = ogDescription || description;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={robots} />

      {/* Open Graph Metadata */}
      <meta property="og:title" content={fallbackOgTitle} />
      <meta property="og:description" content={fallbackOgDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Metadata */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fallbackOgTitle} />
      <meta name="twitter:description" content={fallbackOgDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default SEO;
