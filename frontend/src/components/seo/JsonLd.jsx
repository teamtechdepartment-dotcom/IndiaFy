import React from 'react';
import { Helmet } from 'react-helmet-async';

const JsonLd = ({ data }) => {
  if (!data) return null;

  // Safely escape JSON for script tags to prevent XSS
  const jsonLdString = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <Helmet>
      <script type="application/ld+json">
        {jsonLdString}
      </script>
    </Helmet>
  );
};

export default JsonLd;
