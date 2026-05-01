import React from "react";

// Layout Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

// Home Sections

// import SectionOption from "../../components/HomePage/SectionOption";
import Hero from "../../components/HomePage/Hero";
import BrowseCategories from "../../components/HomePage/BrowseCategories";
import TrendingProducts from "../../components/HomePage/TrendingProducts"; // New Component Added
import VerifiedStores from "../../components/HomePage/VerifiedStores";
import TrustSection from "../../components/HomePage/TrustSection";
import RecentlyViewed from "../../components/HomePage/RecentlyViewed";
import Testimonials from "../../components/HomePage/Testimonials";

const Home = () => {
  return (
    <>
      {/* Top Navigation - Fixed at top [cite: 91] */}
      <WebsiteNavbar />

      <main className="overflow-hidden">
        {/* Dynamic visual introduction [cite: 9, 91] */}
        <Hero />
        

        {/* Sector-based discovery [cite: 10, 44] */}
        <BrowseCategories />
        {/* Displays high-velocity items across the 3 verticals [cite: 14, 19] */}
        <TrendingProducts />

        {/* Trusted local sellers [cite: 5, 28] */}
        <VerifiedStores />


        {/* --------------------------------- */}
        <RecentlyViewed />
        {/* Operational discipline & Anti-fraud info [cite: 31, 52] */}
        <TrustSection />
        {/* Phase 6: Social Proof (Community Trust) */}
        <Testimonials />
      </main>

      {/* Financial & Support information [cite: 40, 70] */}
      <Footer />
    </>
  );
};

export default Home;
