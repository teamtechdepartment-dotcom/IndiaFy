import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, ChevronRight, Flame } from "lucide-react";
import SEOHead from "../../components/seo/SEOHead";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import { WholesaleSkeleton } from "../../components/ui/skeletons/WholesaleSkeleton";

// Lazy loaded sections
const Hero = lazy(() => import("../../components/WholesalePage/Hero"));
const TopCategories = lazy(() => import("../../components/WholesalePage/TopCategories"));
const TrendingBulkProducts = lazy(() => import("../../components/WholesalePage/TrendingBulkProducts"));
const FeaturedSuppliers = lazy(() => import("../../components/WholesalePage/FeaturedSuppliers"));
const DealsAndRFQ = lazy(() => import("../../components/WholesalePage/DealsAndRFQ"));
const BusinessServices = lazy(() => import("../../components/WholesalePage/BusinessServices"));

const SectionLoader = () => (
  <div className="py-16 max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16" role="status" aria-label="Loading section">
    <WholesaleSkeleton count={6} mode="product" />
  </div>
);

function WholesaleSubNav() {
  const categories = [
    "FMCG", "Electronics", "Fashion", "Grocery", "Industrial Tools", "Packaging", "Beauty & Care", "Home & Kitchen", "Office Supplies"
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200/80 sticky top-[64px] lg:top-[120px] z-30 shadow-xs">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex items-center justify-between h-13 gap-6 overflow-x-auto no-scrollbar">
        
        {/* Left Links */}
        <div className="flex items-center gap-6 text-xs sm:text-sm font-bold text-[#1F2937] whitespace-nowrap shrink-0">
          <Link to="/search?type=wholesale" className="flex items-center gap-1.5 text-[#0B6E5D] bg-[#E6F4F1] px-3.5 py-1.5 rounded-lg hover:bg-[#d5ece7] transition-colors">
            <Grid size={15} />
            <span>All Categories</span>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/search?type=wholesale&category=${encodeURIComponent(cat)}`}
              className="hover:text-[#0B6E5D] transition-colors py-1 font-semibold"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Right Bulk Deals Badge */}
        <Link
          to="/search?type=wholesale&sort=discount"
          className="ml-auto shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#F97316] bg-[#F97316]/10 hover:bg-[#F97316]/20 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          <Flame size={16} className="fill-current animate-bounce" />
          <span>Bulk Deals</span>
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export default function WholesalePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#0B6E5D] selection:text-white">
      <SEOHead 
        title="Wholesale Marketplace India | Verified Wholesale Shops & Bulk Distributors"
        description="Join Indiafy's B2B marketplace in India. Source wholesale inventory in bulk directly from verified wholesale shops, dealers, and trusted stockists at dealer prices."
      />
      <WebsiteNavbar />
      <div className="h-[64px] lg:h-[120px] w-full shrink-0" aria-hidden="true" />
      <WholesaleSubNav />
      
      <main className="w-full flex flex-col">
        <Suspense fallback={<SectionLoader />}>
          <Hero />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <TopCategories />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <TrendingBulkProducts />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FeaturedSuppliers />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <DealsAndRFQ />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <BusinessServices />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}