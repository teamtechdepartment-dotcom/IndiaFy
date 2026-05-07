import React, { lazy, Suspense, memo } from "react";

// Layout Components - eagerly loaded (always visible)
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

// Above-the-fold: eagerly loaded for fast LCP
import Hero from "../../components/HomePage/Hero";

// Below-the-fold: lazy loaded for performance
const BrowseCategories = lazy(() => import("../../components/HomePage/BrowseCategories"));
const TrendingProducts = lazy(() => import("../../components/HomePage/TrendingProducts"));
const VerifiedStores = lazy(() => import("../../components/HomePage/VerifiedStores"));
const RecentlyViewed = lazy(() => import("../../components/HomePage/RecentlyViewed"));
const TrustSection = lazy(() => import("../../components/HomePage/TrustSection"));
const Testimonials = lazy(() => import("../../components/HomePage/Testimonials"));

// Lightweight section fallback
const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center" role="status" aria-label="Loading section">
    <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
  </div>
);

const Home = memo(() => {
  return (
    <>
      {/* Top Navigation */}
      <WebsiteNavbar />

      <main className="overflow-hidden">
        {/* Hero: eagerly loaded for fast LCP */}
        <Hero />

        {/* Below-fold sections: lazy loaded */}
        <Suspense fallback={<SectionLoader />}>
          <BrowseCategories />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <TrendingProducts />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <VerifiedStores />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <RecentlyViewed />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <TrustSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
      </main>

      <Footer />
    </>
  );
});

Home.displayName = 'Home';

export default Home;
