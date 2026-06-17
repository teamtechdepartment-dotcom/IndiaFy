import React, { useState, useEffect, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Quick Commerce Tailored Banners
const banners = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop", 
    title: "Fresh Groceries",
    subtitle: "Delivered in 10 minutes flat.",
    badge: "Superfast",
    bgColor: "bg-emerald-900",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2070&auto=format&fit=crop", 
    title: "Farm to Door",
    subtitle: "Crisp veggies sorted for you.",
    badge: "Fresh Arrival",
    bgColor: "bg-orange-900",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=2070&auto=format&fit=crop", 
    title: "Midnight Cravings?",
    subtitle: "Snacks & drinks instantly.",
    badge: "Open Till Late",
    bgColor: "bg-blue-900",
  }
];

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Auto slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="bg-white pt-2 pb-4 px-3 sm:px-4 w-full max-w-[1600px] mx-auto flex flex-col">
      
      {/* Promotional Carousel */}
      <div className="relative h-[160px] sm:h-[250px] md:h-[350px] lg:h-[400px] w-full overflow-hidden rounded-xl shadow-sm bg-gray-200 group">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`absolute inset-0 w-full h-full ${banners[currentIndex].bgColor}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <img 
              src={banners[currentIndex].image} 
              alt={banners[currentIndex].title} 
              className="w-full h-full object-cover"
            />
            
            {/* Banner Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-6 md:px-12 lg:px-16">
              <span className="px-2.5 py-1 bg-[#00B55D] text-white text-[9px] md:text-xs font-bold uppercase tracking-wider rounded mb-2 sm:mb-3 shadow-sm">
                {banners[currentIndex].badge}
              </span>
              <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white mb-1 sm:mb-2 max-w-lg leading-tight drop-shadow-md">
                {banners[currentIndex].title}
              </h2>
              <p className="text-xs sm:text-base md:text-xl text-white/90 mb-4 sm:mb-6 max-w-md font-medium drop-shadow-sm">
                {banners[currentIndex].subtitle}
              </p>
              <button 
                onClick={() => navigate('/search')}
                className="bg-white text-gray-900 px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg hover:bg-gray-50 transition-colors"
              >
                Shop Now
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Hidden on mobile for cleaner QC UI) */}
        <button
          onClick={handlePrevious}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-white/80 hover:bg-white backdrop-blur-sm shadow-md items-center justify-center text-gray-800 z-30 transition-all opacity-0 group-hover:opacity-100 rounded-r-xl"
          aria-label="Previous banner"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-white/80 hover:bg-white backdrop-blur-sm shadow-md items-center justify-center text-gray-800 z-30 transition-all opacity-0 group-hover:opacity-100 rounded-l-xl"
          aria-label="Next banner"
        >
          <ChevronRight size={28} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-30">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-4 sm:w-6 bg-white" : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/80"
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