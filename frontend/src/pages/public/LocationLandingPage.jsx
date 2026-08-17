import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEO from "../../components/seo/SEO";
import JsonLd from "../../components/seo/JsonLd";
import ProductGrid from "../../components/Category/ProductGrid";

export default function LocationLandingPage() {
  const { citySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [seoData, setSeoData] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    
    // Fetch location SEO data
    axiosInstance.get(`/content/location/${citySlug}`)
      .then(res => {
        const data = res.data?.data || res.data;
        setSeoData(data);
        
        // Normally we'd pass the actual nodeIds to filter by city.
        // For simplicity and since we don't have a /products?city= endpoint directly yet,
        // we'll rely on a generalized search or just fetch popular products globally for this mock up
        // In a real scenario we'd create a /products?nodeIds= endpoint. 
        // For now, let's just fetch default popular products to render the grid (as Phase 13 focuses on SEO structure).
        return axiosInstance.get(`/products`);
      })
      .then(res => {
        const raw = res.data?.data || res.data || [];
        setProducts(raw.slice(0, 20).map(p => ({
          id: p._id || p.id,
          slug: p.slug || p._id || p.id,
          name: p.productName || p.name || "Product",
          brand: p.brand || "Indiafy Store",
          price: p.attribute?.salePrice || p.price || 0,
          original: p.attribute?.mrpPrice || p.price || (p.attribute?.salePrice || p.price || 0),
          rating: p.ratingAverage || 4.5,
          reviews: p.ratingCount || 12,
          seller: p.sellerId ? `${p.sellerId.firstName || ""} ${p.sellerId.lastName || ""}`.trim() : "Verified Seller",
          dist: 1.2,
          eta: "Today",
          img: p.productImage?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop",
          inStock: p.stock !== undefined ? p.stock > 0 : true,
        })));
      })
      .catch(err => {
        console.error("Failed to load location data", err);
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [citySlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
        <WebsiteNavbar />
        <div className="pt-[130px] flex justify-center pb-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874F0]"></div></div>
        <Footer />
      </div>
    );
  }

  if (error || !seoData) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
        <WebsiteNavbar />
        <div className="pt-[130px] md:pt-[160px] pb-20 text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Location Not Found</h2>
          <p className="text-zinc-500 mb-6">The city you are looking for does not have active sellers or products yet.</p>
          <button onClick={() => navigate("/")} className="bg-[#2874F0] text-white px-6 py-2 rounded font-bold">Go to Homepage</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <SEO 
        title={seoData.title} 
        description={seoData.description}
        canonical={seoData.canonical}
        robots={location.search.match(/[?&](sort|price|dist)=/i) ? "noindex, follow" : "index, follow"}
      />
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://indiafy.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": seoData.city,
              "item": seoData.canonical
            }
          ]
        },
        products.length > 0 && {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": products.map((p, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `https://indiafy.com/product/${p.slug || p.id}`
          }))
        }
      ].filter(Boolean)} />
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-[130px] lg:pt-[140px] pb-16">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-900 font-bold">{seoData.city}</span>
        </div>

        <div className="mb-6 max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Buy Products Online in {seoData.city}</h1>
          <p className="text-sm text-slate-600 leading-relaxed">{seoData.intro}</p>
          {seoData.availableCategories && seoData.availableCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="font-semibold text-slate-700">Available Categories in {seoData.city}:</span>
              {seoData.availableCategories.map(cat => (
                <Link 
                  key={cat} 
                  to={`/category/${encodeURIComponent(cat)}`}
                  className="text-emerald-600 hover:underline"
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
          <div className="mb-4">
             <h2 className="text-lg font-bold text-slate-800">Popular Products in {seoData.city}</h2>
          </div>
          <ProductGrid products={products} isLoading={false} viewMode="grid" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
