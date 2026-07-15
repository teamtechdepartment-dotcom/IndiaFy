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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        const data = res.data?.data || res.data;
        setProductData(data);
        if (data?.categoryName) {
          const relRes = await axiosInstance.get('/products', {
            params: { categoryName: data.categoryName }
          });
          const list = relRes.data?.data || relRes.data || [];
          setRelatedProducts(
            list
              .filter(item => (item._id || item.id) !== id)
              .map(item => ({
                id: item._id || item.id,
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
        <WebsiteNavbar />
        <div className="pt-[180px] pb-20 text-center max-w-md mx-auto">
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
    brand: p.brand || "Generic",
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
    await addToCart(mappedProduct.id, quantity);
    toast.success("Added to Cart!");
  };

  const handleBuyNow = async () => {
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
           {relatedProducts.length > 0 && (
             <>
               <RelatedProducts products={relatedProducts} title="Products related to this item" />
               <RelatedProducts products={relatedProducts.slice().reverse()} title="Customers who viewed this item also viewed" />
             </>
           )}
        </div>
      </main>

      <Footer />
    </div>
  );
}