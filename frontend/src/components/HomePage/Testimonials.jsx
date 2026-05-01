import { useState, useEffect, useRef } from "react";
import { Star, Quote, CheckCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Aman Verma",
    initials: "AV",
    role: "Resident, DLF Phase 3",
    content:
      "Quick Commerce vertical is actually quick! Got my groceries in 12 minutes. The nearest seller prioritization really works for Gurugram traffic.",
    rating: 5,
    verified: true,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    name: "Priyanka Chopra",
    initials: "PC",
    role: "Corporate Professional",
    content:
      "The Video Packing feature is a lifesaver. I ordered high-end cosmetics and seeing the seller pack them on video gave me 100% peace of mind.",
    rating: 5,
    verified: true,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    name: "Rajesh Gupta",
    initials: "RG",
    role: "Bulk Buyer / SME",
    content:
      "Using the Wholesale section for my office pantry. The tiered pricing is transparent and the bulk delivery partner was very professional.",
    rating: 4,
    verified: true,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    name: "Sanya Malhotra",
    initials: "SM",
    role: "Sector 56 Resident",
    content:
      "I love that the rider used a platform QR for payment. No confusion with personal UPI IDs. Very secure and disciplined system.",
    rating: 5,
    verified: true,
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
];

// 🔥 UPGRADED: Reusable Review Card Component
const ReviewCard = ({ review }) => (
  <div className="h-full group p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-sm hover:border-emerald-200 hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
    {/* Floating Top Accent Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* Dynamic Background Watermark Icon */}
    <Quote
      size={160}
      className="absolute -top-10 -right-10 text-zinc-50 group-hover:text-emerald-50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 ease-out z-0"
    />

    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              fill="currentColor"
              className={i < review.rating ? "text-amber-400" : "text-zinc-200"}
            />
          ))}
        </div>
      </div>

      <p className="text-zinc-700 text-[15px] font-medium leading-relaxed mb-8">
        "{review.content}"
      </p>
    </div>

    <div className="pt-6 border-t border-zinc-100 relative z-10 flex items-center gap-4">
      {/* Dynamic Avatar */}
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 border transition-transform duration-300 group-hover:scale-110 ${review.color}`}
      >
        {review.initials}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-black text-zinc-900 text-sm tracking-tight">
            {review.name}
          </span>
          {review.verified && (
            <CheckCircle
              size={14}
              className="text-emerald-500 fill-emerald-50"
            />
          )}
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <MapPin size={12} className="text-zinc-300" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {review.role}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  // Auto-Scroll Logic + Scroll Snap Sync
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const index = Math.round(
          scrollRef.current.scrollLeft / scrollRef.current.offsetWidth,
        );
        setActiveIndex(index);
      }
    };

    const element = scrollRef.current;
    element?.addEventListener("scroll", handleScroll);

    // Auto-advance timer
    const timer = setInterval(() => {
      if (element) {
        const maxScroll = element.scrollWidth - element.clientWidth;
        const nextScroll = element.scrollLeft + element.offsetWidth;

        element.scrollTo({
          left: nextScroll > maxScroll ? 0 : nextScroll,
          behavior: "smooth",
        });
      }
    }, 4000); // 4 seconds

    return () => {
      element?.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="py-24 bg-[#f8f9fa] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-8 h-[2px] bg-emerald-500 rounded-full"></span>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 flex items-center gap-1.5">
                Community Trust
              </h2>
              <span className="w-8 h-[2px] bg-emerald-500 rounded-full"></span>
            </div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tighter">
              Trusted by thousands <br />
              <span className="text-zinc-400 italic">across Gurugram.</span>
            </h3>
          </motion.div>
        </div>

        {/* 📱 MOBILE SWIPEABLE CAROUSEL (Native Feel) */}
        <div className="lg:hidden w-full relative">
          <div
            ref={scrollRef}
            className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4"
          >
            {reviews.map((review, index) => (
              <div key={index} className="w-full shrink-0 snap-center px-2">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {/* Animated Pagination Dots */}
          <div className="flex justify-center gap-2 mt-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  scrollRef.current?.scrollTo({
                    left: idx * scrollRef.current.offsetWidth,
                    behavior: "smooth",
                  });
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeIndex === idx
                    ? "w-8 bg-emerald-500"
                    : "w-2 bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 💻 DESKTOP GRID VIEW (4 Columns) */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </div>

        {/* Trust Footer Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 flex flex-wrap justify-center gap-6 sm:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-700"
        >
          {["10k+ Orders", "500+ Verified Nodes", "Gurugram's Top Choice"].map(
            (text, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-900 bg-zinc-200/50 px-4 py-2 rounded-full"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></span>
                {text}
              </div>
            ),
          )}
        </motion.div>
      </div>

      {/* Required CSS to hide scrollbars globally for this component */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </section>
  );
}
