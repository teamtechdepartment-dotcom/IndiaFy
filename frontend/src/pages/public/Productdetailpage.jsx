/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

// Global Stores
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../utils/axiosInstance";

// Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

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
  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated } = useAuthStore();

  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        setProductData(res.data);
      } catch (_err) {
        // Fallback to static for UI testing
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
    else setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874F0]"></div>
      </div>
    );
  }

  // Fallback to static product for UI demonstration
  const p = productData || PRODUCT;
  const pImages = p.productImage?.length > 0 ? p.productImage : PRODUCT.images;
  const attribute = Array.isArray(p.attribute) ? p.attribute[0] : p.attribute;
  
  const mappedProduct = {
    ...PRODUCT,
    title: p.productName || PRODUCT.title,
    currentPrice: attribute?.salePrice || attribute?.price || PRODUCT.currentPrice,
    originalPrice: attribute?.mrpPrice || PRODUCT.originalPrice,
    images: pImages,
    brand: p.brand || PRODUCT.brand,
    description: p.description || PRODUCT.description,
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warn("Please login to add items to cart");
      navigate("/login");
      return;
    }
    const idToUse = productData?._id || "507f1f77bcf86cd799439011";
    await addToCart(idToUse, quantity);
    toast.success("Added to Cart!");
  };

  const handleBuyNow = async () => {
    const idToUse = productData?._id || "507f1f77bcf86cd799439011";
    if (!isAuthenticated) {
      localStorage.setItem("pending_purchase", JSON.stringify({ productId: idToUse, quantity, product: p }));
      navigate("/login?redirect=checkout");
      return;
    }
    try {
      await addToCart(idToUse, quantity);
      navigate("/checkout");
    } catch (_err) {
      navigate("/checkout");
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <SEOHead title={`${mappedProduct.title} | Indiafy`} description={mappedProduct.description} image={mappedProduct.images[0]} />
      <WebsiteNavbar />

      <main className="w-full mx-auto pt-[120px] md:pt-[140px] pb-20 px-2 lg:px-4">
        
        {/* Amazon-style Breadcrumb */}
        <div className="px-4 sm:px-6 mb-4 flex items-center gap-1.5 text-xs text-[#565959]">
          <a href="/" className="hover:underline">Home</a> <ChevronRight size={12} />
          <a href="/category" className="hover:underline">Electronics</a> <ChevronRight size={12} />
          <span className="text-[#0F1111] line-clamp-1">{mappedProduct.title}</span>
        </div>

        {/* Main Grid */}
        <div className="px-4 sm:px-6 lg:grid lg:grid-cols-12 gap-8 relative">
          
          {/* Left Column: Image Gallery (Col span 5) */}
          <div className="lg:col-span-5 mb-8 lg:mb-0">
            <div className="sticky top-[100px]">
              <ImageGallery images={mappedProduct.images} />
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
           <RelatedProducts products={RELATED_PRODUCTS} title="Products related to this item" />
           <RelatedProducts products={RELATED_PRODUCTS.slice().reverse()} title="Customers who viewed this item also viewed" />
        </div>
      </main>

      <Footer />
    </div>
  );
}