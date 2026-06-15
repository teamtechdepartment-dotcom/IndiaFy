/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom SEO Component for React 19 compatibility
 * Safely mutates document head without relying on third-party libraries that may conflict.
 */
export default function SEOHead({
  title = "Indiafy | Hyperlocal Commerce & Verified Sellers Marketplace",
  description = "Shop from verified local sellers, wholesale suppliers and quick commerce networks across India.",
  keywords = "marketplace, online shopping, ecommerce, local sellers, quick commerce, Indiafy, wholesale",
  canonical = "https://india-fy.vercel.app",
  image = "/og-image.jpg",
  type = "website",
  noindex = false,
  schemas = [] // Array of JSON-LD schema objects
}) {
  const location = useLocation();
  const currentUrl = `https://india-fy.vercel.app${location.pathname === '/' ? '' : location.pathname}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to set meta tags dynamically
    const setMetaTag = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        
        // Differentiate between name and property attributes
        if (selector.includes('name=')) {
          const match = selector.match(/name="([^"]+)"/);
          if (match) element.setAttribute('name', match[1]);
        } else if (selector.includes('property=')) {
          const match = selector.match(/property="([^"]+)"/);
          if (match) element.setAttribute('property', match[1]);
        }
        
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // 2. Update Standard Meta Tags
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[name="keywords"]', 'content', keywords);

    // 3. Update Robots / Security SEO
    if (noindex) {
      setMetaTag('meta[name="robots"]', 'content', 'noindex, nosnippet');
    } else {
      setMetaTag('meta[name="robots"]', 'content', 'index, follow');
    }

    // 4. Update Canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', currentUrl);

    // 5. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:url"]', 'content', currentUrl);
    setMetaTag('meta[property="og:type"]', 'content', type);
    
    // Ensure image is absolute
    const absoluteImage = image.startsWith('http') ? image : `https://india-fy.vercel.app${image}`;
    setMetaTag('meta[property="og:image"]', 'content', absoluteImage);

    // 6. Twitter Cards
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'content', title);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', absoluteImage);

    // 7. Schema.org / JSON-LD
    // Remove existing dynamic JSON-LD scripts
    document.querySelectorAll('script[data-dynamic-seo="true"]').forEach(el => el.remove());

    if (schemas && schemas.length > 0) {
      schemas.forEach(schema => {
        const script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-dynamic-seo', 'true');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    // Cleanup function not strictly necessary for most of these as they just overwrite,
    // but useful if we unmount and want to restore defaults (though in a SPA, we usually 
    // just let the next route overwrite them). JSON-LD is cleaned up on next render.
    
    return () => {
      // Remove JSON-LD scripts on unmount to prevent duplicates across route changes
      document.querySelectorAll('script[data-dynamic-seo="true"]').forEach(el => el.remove());
    };
  }, [title, description, keywords, currentUrl, image, type, noindex, schemas]);

  // Renders nothing visible in the DOM
  return null;
}
