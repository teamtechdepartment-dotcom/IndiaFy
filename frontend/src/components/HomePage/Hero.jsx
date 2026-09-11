import React, { useState, useEffect, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const defaultBanners = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop", // Electronics/Sale
    title: "Big Billion Days Sale",
    subtitle: "Up to 80% Off on Top Electronics",
    badgeText: "Limited Time Offer",
    bgColor: "bg-blue-900",
    link: "/search",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", // Fashion
    title: "Fashion Wardrobe Refresh",
    subtitle: "Min 50% Off on Top Brands",
    badgeText: "Trendy Deals",
    bgColor: "bg-purple-900",
    link: "/search",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop", // Groceries
    title: "Supermart Grocery Delivery",
    subtitle: "Fresh Produce at your Doorstep",
    badgeText: "Fresh Deals",
    bgColor: "bg-green-900",
    link: "/search",
  }
];

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannersList, setBannersList] = useState(defaultBanners);
  const navigate = useNavigate();

  // Load live active campaigns from backend
  useEffect(() => {
    let isMounted = true;
    const fetchActiveCampaigns = async () => {
      try {
        const res = await axiosInstance.get("/campaigns/active");
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list) && list.length > 0 && isMounted) {
          const campaignBanners = list.map((c, idx) => ({
            id: `campaign-${c._id}`,
            campaignId: c._id,
            image: c.bannerImage || (idx % 2 === 0 
              ? "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"),
            title: c.name,
            subtitle: c.description 
              ? `${c.description} • Flat ${c.discountValue}% OFF on Participating Items` 
              : `Flat ${c.discountValue}% OFF across selected products!`,
            badgeText: c.badgeText ? `🔥 ${c.badgeText}` : "Special Live Campaign",
            bgColor: idx % 2 === 0 
              ? "bg-gradient-to-r from-red-950 via-rose-900 to-amber-950" 
              : "bg-gradient-to-r from-purple-950 via-indigo-900 to-blue-950",
            link: `/campaign/${c._id}`,
          }));
          // Prepend active campaigns so they take front-and-center priority
          setBannersList([...campaignBanners, ...defaultBanners]);
        }
      } catch (err) {
        console.warn("Could not load active campaigns for hero banner:", err.message);
      }
    };
    fetchActiveCampaigns();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (bannersList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannersList.length);
    }, 5000); // Auto slide every 5 seconds
    return () => clearInterval(timer);
  }, [bannersList.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? bannersList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannersList.length);
  };

  const currentBanner = bannersList[currentIndex] || bannersList[0] || defaultBanners[0];

  return (
    <div className="relative w-full max-w-[1600px] mx-auto mt-[104px] md:mt-[68px] lg:mt-[116px] bg-brand-background px-2 sm:px-4 py-2 group">
      {/* Carousel Container */}
      <div className="relative h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px] w-full overflow-hidden rounded-md shadow-sm bg-gray-200">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`absolute inset-0 w-full h-full ${currentBanner.bgColor}`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay */}
            <img 
              src={currentBanner.image} 
              alt={currentBanner.title} 
              className="w-full h-full object-cover"
            />
            
            {/* Banner Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-4 sm:px-8 md:px-16 lg:px-24">
              <span className="px-3 py-1 bg-brand-accent text-white text-xs font-bold uppercase rounded-sm mb-3 md:mb-4 shadow-sm flex items-center gap-1.5">
                {currentBanner.badgeText || "Limited Time Offer"}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 max-w-2xl leading-tight">
                {currentBanner.title}
              </h2>
              <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-4 sm:mb-8 max-w-xl">
                {currentBanner.subtitle}
              </p>
              <button 
                onClick={() => navigate(currentBanner.link || '/search')}
                className="bg-white text-brand-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-sm font-bold shadow-md hover:bg-gray-100 transition-colors text-sm sm:text-base cursor-pointer hover:scale-105 active:scale-95 duration-150"
              >
                Shop Now
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-white/80 hover:bg-white backdrop-blur-sm shadow-md flex items-center justify-center text-gray-800 z-30 transition-all opacity-0 group-hover:opacity-100 rounded-r-md cursor-pointer"
          aria-label="Previous banner"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-white/80 hover:bg-white backdrop-blur-sm shadow-md flex items-center justify-center text-gray-800 z-30 transition-all opacity-0 group-hover:opacity-100 rounded-l-md cursor-pointer"
          aria-label="Next banner"
        >
          <ChevronRight size={32} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 z-30">
          {bannersList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                index === currentIndex ? "w-6 bg-white" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(Hero);