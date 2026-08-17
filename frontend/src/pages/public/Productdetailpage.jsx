/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

// Global Stores
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useInteractionStore } from "../../store/interactionStore";
import axiosInstance from "../../utils/axiosInstance";

// Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEO from "../../components/seo/SEO";
import JsonLd from "../../components/seo/JsonLd";

// Revamped Components
import ImageGallery from "../../components/ProductDetail/ImageGallery";
import ProductInfo from "../../components/ProductDetail/ProductInfo";
import OfferSection from "../../components/ProductDetail/OfferSection";
import TrustBadges from "../../components/ProductDetail/TrustBadges";
import BuyingActions from "../../components/ProductDetail/BuyingActions";
import ProductTabs from "../../components/ProductDetail/ProductTabs";
import RelatedProducts from "../../components/ProductDetail/RelatedProducts";

// ─── DATA ────────────────────────────────────────────────────────────────────
const PRODUCT = {
  id: 1,
  title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
  brand: "Sony",
  rating: 4.6,
  reviewCount: 3847,
  currentPrice: 24990,
  originalPrice: 34990,
  images: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80",
  ],
  seller: {
    id: "sharma-electronics",
    name: "Sharma Electronics",
    rating: 4.5,
    distance: "1.3 km",
    verified: true,
  },
  delivery: { eta: "15–25 mins", inStock: true, free: true },
  description: "Industry-leading noise cancellation with Sony's flagship WH-1000XM5. Featuring 8 microphones and two processors for unparalleled audio quality. The soft-fit leather and aluminum design gives it a premium feel while the auto-optimize technology senses wearing conditions to deliver the best audio experience.",
  specs: [
    { label: "Driver Unit", value: "30 mm, dome type" },
    { label: "Battery Life", value: "Up to 30 hours" },
    { label: "Connectivity", value: "Bluetooth 5.2" },
    { label: "Weight", value: "250 g" },
  ],
  reviews: [
    {
      id: 1,
      user: "Arjun M.",
      avatar: "AM",
      rating: 5,
      date: "21 June 2025",
      title: "Best headphones I've ever owned",
      body: "The noise cancellation is absolutely mind-blowing. I used them on a 6-hour flight and couldn't hear a thing. Sound quality is incredible too.",
      helpful: 124,
    },
    {
      id: 2,
      user: "Priya S.",
      avatar: "PS",
      rating: 5,
      date: "14 May 2025",
      title: "Worth every rupee",
      body: "Premium build, crazy good ANC, and the multipoint connection works flawlessly.",
      helpful: 89,
    },
  ],
};

const RELATED_PRODUCTS = [
  { id: 2, name: "Sony WF-1000XM5 Earbuds", price: 19990, rating: 4.8, img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80" },
  { id: 3, name: "Bose QuietComfort Ultra", price: 32900, rating: 4.7, img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80" },
  { id: 4, name: "Apple AirPods Max", price: 59900, rating: 4.9, img: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=400&q=80" },
  { id: 5, name: "Sennheiser Momentum 4", price: 29990, rating: 4.6, img: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&q=80" },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated } = useAuthStore();
  const trackInteraction = useInteractionStore(state => state.trackInteraction);

  // Validate and extract attribution from URL
  const { source, surface } = useMemo(() => {
    const ref = searchParams.get('ref');
    const ALLOWED_REFS = ["homepage_recommendation", "search_recommendation", "organic", "search"];
    const isValidRef = ALLOWED_REFS.includes(ref);
    return {
      source: isValidRef && ref.includes("recommendation") ? "recommendation" : "organic",
      surface: isValidRef ? ref : "none"
    };
  }, [searchParams]);

  // Persist item-level attribution for Checkout purchase tracking with TTL
  useEffect(() => {
    if (id && source === "recommendation") {
      try {
        const stored = JSON.parse(localStorage.getItem('indiafy_item_attribution') || '{}');
        stored[id] = { source, surface, createdAt: Date.now() };
        localStorage.setItem('indiafy_item_attribution', JSON.stringify(stored));
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [id, source, surface]);

  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        const data = res.data?.data || res.data;
        setProductData(data);
        if (data?.categoryName || data?.brand) {
          const relRes = await axiosInstance.get('/products', {
            params: { categoryName: data.categoryName } // In reality this is a simple fetch, we will sort below
          });
          const list = relRes.data?.data || relRes.data || [];
          
          // Phase 13 Priority Sorting: 1. same category+brand 2. same category 3. same brand
          const sortedList = list.filter(item => (item._id || item.id) !== id).sort((a, b) => {
            const aCatMatch = a.categoryName === data.categoryName;
            const bCatMatch = b.categoryName === data.categoryName;
            const aBrandMatch = a.brand && data.brand && a.brand === data.brand;
            const bBrandMatch = b.brand && data.brand && b.brand === data.brand;
            
            const aScore = (aCatMatch ? 1 : 0) + (aBrandMatch ? 2 : 0);
            const bScore = (bCatMatch ? 1 : 0) + (bBrandMatch ? 2 : 0);
            return bScore - aScore; // Descending
          }).slice(0, 8); // Max 8

          setRelatedProducts(
            sortedList
              .map(item => ({
                id: item._id || item.id,
                slug: item.slug || item._id || item.id,
                name: item.productName,
                price: item.attribute?.salePrice || item.price || 0,
                rating: item.ratingAverage || 4.5,
                img: item.productImage?.[0] || "https://placehold.co/400"
              }))
          );
        }
      } catch (_err) {
        console.error("Failed to fetch product details", _err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
    else setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (productData && productData._id) {
      trackInteraction({
        action: "VIEW",
        productId: productData._id,
        categoryName: productData.categoryName || "none",
        metadata: { source, surface }
      });
    }
  }, [productData, source, surface, trackInteraction]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874F0]"></div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
        <SEO title="Product Not Found - IndiaFy" robots="noindex, nofollow" />
        <WebsiteNavbar />
        <div className="pt-[130px] md:pt-[160px] pb-20 text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-zinc-500 mb-6">The product you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate("/")} className="bg-[#2874F0] text-white px-6 py-2 rounded font-bold">Go to Homepage</button>
        </div>
        <Footer />
      </div>
    );
  }

  const p = productData;
  const pImages = p.productImage?.length > 0 ? p.productImage : ["https://placehold.co/400x400?text=Product"];
  const attribute = Array.isArray(p.attribute) ? p.attribute[0] : p.attribute;
  
  const mappedProduct = {
    ...PRODUCT,
    id: p._id || p.id,
    title: p.productName || p.name,
    brand: p.brand || "",
    rating: p.ratingAverage || 4.5,
    reviewCount: p.ratingCount || 0,
    currentPrice: attribute?.salePrice || p.price || 0,
    originalPrice: attribute?.mrpPrice || p.price || 0,
    images: pImages,
    seller: {
      id: p.sellerId?._id || "seller",
      name: p.sellerId ? `${p.sellerId.firstName} ${p.sellerId.lastName || ""}`.trim() : "Verified Seller",
      rating: 4.5,
      distance: "1.2 km",
      verified: true
    },
    delivery: { eta: "20–30 mins", inStock: p.stock > 0, free: true },
    description: p.description || "No description available.",
    specs: [
      { label: "Weight", value: attribute?.weight || "N/A" },
      { label: "Unit", value: p.unit || "pcs" }
    ],
    reviews: []
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warn("Please login to add items to cart");
      navigate("/login");
      return;
    }
    
    trackInteraction({
      action: "CART_ADD",
      productId: mappedProduct.id,
      categoryName: p.categoryName || "none",
      metadata: { source, surface }
    });

    await addToCart(mappedProduct.id, quantity);
    toast.success("Added to Cart!");
  };

  const handleBuyNow = async () => {
    trackInteraction({
      action: "CART_ADD",
      productId: mappedProduct.id,
      categoryName: p.categoryName || "none",
      metadata: { source, surface }
    });

    if (!isAuthenticated) {
      localStorage.setItem("pending_purchase", JSON.stringify({ productId: mappedProduct.id, quantity, product: p }));
      navigate("/login?redirect=checkout");
      return;
    }
    try {
      await addToCart(mappedProduct.id, quantity);
      navigate("/checkout");
    } catch (_err) {
      navigate("/checkout");
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <SEO 
        title={`${mappedProduct.title} | Buy Online in India | IndiaFy`.substring(0, 60)} 
        description={`Buy ${mappedProduct.title}${mappedProduct.brand ? ` by ${mappedProduct.brand}` : ''} online in India at ₹${mappedProduct.currentPrice}. Explore more in ${p.categoryName || 'our store'}.`} 
        ogImage={mappedProduct.images[0]}
        canonical={`https://indiafy.com/product/${p.slug || mappedProduct.id}`}
      />
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": mappedProduct.title,
          "image": mappedProduct.images,
          "description": mappedProduct.description,
          ...(p.productSkuId ? { "sku": p.productSkuId } : {}),
          ...(mappedProduct.brand ? {
            "brand": {
              "@type": "Brand",
              "name": mappedProduct.brand
            }
          } : {}),
          ...(p.ratingCount > 0 ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": p.ratingAverage || 4.5,
              "reviewCount": p.ratingCount
            }
          } : {}),
          "offers": {
            "@type": "Offer",
            "url": `https://indiafy.com/product/${p.slug || mappedProduct.id}`,
            "priceCurrency": "INR",
            "price": mappedProduct.currentPrice,
            "availability": mappedProduct.delivery.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
          }
        },
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
              "name": p.categoryName || "Products",
              "item": `https://indiafy.com/category/${encodeURIComponent(p.categoryName || "Products")}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": mappedProduct.title,
              "item": `https://indiafy.com/product/${p.slug || mappedProduct.id}`
            }
          ]
        }
      ]} />
      <WebsiteNavbar />

      <main className="w-full mx-auto pt-[120px] md:pt-[140px] pb-20 px-2 lg:px-4">
        
        {/* Amazon-style Breadcrumb */}
        <div className="px-4 sm:px-6 mb-4 flex items-center gap-1.5 text-xs text-[#565959]">
          <a href="/" className="hover:underline">Home</a> <ChevronRight size={12} />
          <a href={`/category/${encodeURIComponent(p.categoryName || "Products")}`} className="hover:underline">{p.categoryName || "Products"}</a> <ChevronRight size={12} />
          <span className="text-[#0F1111] line-clamp-1">{mappedProduct.title}</span>
        </div>

        {/* Main Grid */}
        <div className="px-4 sm:px-6 lg:grid lg:grid-cols-12 gap-8 relative">
          
          {/* Left Column: Image Gallery (Col span 5) */}
          <div className="lg:col-span-5 mb-8 lg:mb-0">
            <div className="sticky top-[100px]">
              <ImageGallery images={mappedProduct.images} productName={mappedProduct.title} />
            </div>
          </div>

          {/* Middle Column: Product Info (Col span 4) */}
          <div className="lg:col-span-4 mb-8 lg:mb-0 min-w-0">
            <ProductInfo product={mappedProduct} />
            <OfferSection />
            <TrustBadges />
          </div>

          {/* Right Column: Buy Box (Col span 3) */}
          <div className="lg:col-span-3">
            <div className="sticky top-[100px]">
               <BuyingActions 
                product={mappedProduct} 
                handleAddToCart={handleAddToCart} 
                handleBuyNow={handleBuyNow} 
                quantity={quantity} 
                setQuantity={setQuantity} 
              />
            </div>
          </div>
        </div>
        {/* Tabs & Related Section */}
        <div className="px-4 sm:px-6 mt-8">
           <ProductTabs product={mappedProduct} />
           {relatedProducts.length > 0 && (
             <>
               <RelatedProducts products={relatedProducts} title="Products related to this item" />
               <RelatedProducts products={relatedProducts.slice().reverse()} title="Customers who viewed this item also viewed" />
             </>
           )}
        </div>
      </main>

      {/* MOBILE STICKY ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-40 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
          <span className="text-base font-extrabold text-slate-900">₹{(mappedProduct.currentPrice * quantity).toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors shadow-md"
          >
            Buy Now
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}