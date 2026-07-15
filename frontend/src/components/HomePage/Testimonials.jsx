import { useState, useEffect, useRef } from "react";
import { Star, CheckCircle, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Aman Verma",
    initials: "AV",
    role: "DLF Phase 3",
    content: "Quick Commerce vertical is actually quick! Got my groceries in under 30 minutes. The nearest seller prioritization really works.",
    rating: 5,
    verified: true,
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Priyanka Sharma",
    initials: "PS",
    role: "Sector 49",
    content: "The Video Packing feature is a lifesaver. I ordered cosmetics and seeing the seller pack them on video gave me complete peace of mind.",
    rating: 5,
    verified: true,
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Rajesh Gupta",
    initials: "RG",
    role: "Sector 56",
    content: "Using the Wholesale section for my office pantry. The tiered pricing is transparent and the bulk delivery was very professional.",
    rating: 4,
    verified: true,
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Sanya Malhotra",
    initials: "SM",
    role: "Sector 45",
    content: "I love that the rider used a platform QR for payment. No confusion with personal UPI IDs. Very secure and disciplined system.",
    rating: 5,
    verified: true,
    color: "bg-rose-100 text-rose-700",
  },
  {
    name: "Vikram Singh",
    initials: "VS",
    role: "Golf Course Road",
    content: "Indiafy has become my go-to for daily needs. The delivery is fast, sellers are genuine, and prices are fair. Highly recommend!",
    rating: 5,
    verified: true,
    color: "bg-emerald-100 text-emerald-700",
  },
];

const ReviewCard = ({ review }) => (
  <div className="h-full bg-white rounded-card p-6 border border-brand-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
    {/* Stars */}
    <div>
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill="currentColor"
            className={i < review.rating ? "text-amber-400" : "text-gray-200"}
          />
        ))}
      </div>
      <p className="text-sm text-brand-primary font-medium leading-relaxed mb-6">
        "{review.content}"
      </p>
    </div>

    {/* Author */}
    <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${review.color}`}>
        {review.initials}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-brand-primary">{review.name}</span>
          {review.verified && (
            <CheckCircle size={13} className="text-brand-accent" />
          )}
        </div>
        <div className="flex items-center gap-1 text-brand-text-secondary">
          <MapPin size={10} />
          <span className="text-[11px] font-medium">{review.role}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const index = Math.round(
          scrollRef.current.scrollLeft / scrollRef.current.offsetWidth
        );
        setActiveIndex(index);
      }
    };

    const element = scrollRef.current;
    element?.addEventListener("scroll", handleScroll);

    const timer = setInterval(() => {
      if (element) {
        const maxScroll = element.scrollWidth - element.clientWidth;
        const nextScroll = element.scrollLeft + element.offsetWidth;
        element.scrollTo({
          left: nextScroll > maxScroll ? 0 : nextScroll,
          behavior: "smooth",
        });
      }
    }, 5000);

    return () => {
      element?.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="py-section-mobile md:py-section-tablet lg:py-20 bg-white" id="testimonials">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="section-heading mb-2">What Our Customers Say</h2>
          <p className="text-brand-text-secondary text-base font-medium">
            Real reviews from verified buyers
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <div
            ref={scrollRef}
            className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6"
            role="region"
            aria-label="Customer reviews carousel"
          >
            {reviews.map((review, index) => (
              <div key={index} className="w-full shrink-0 snap-center px-2">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-2" role="tablist">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={activeIndex === idx}
                aria-label={`Go to review ${idx + 1}`}
                onClick={() => {
                  scrollRef.current?.scrollTo({
                    left: idx * scrollRef.current.offsetWidth,
                    behavior: "smooth",
                  });
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-6 bg-brand-accent" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-5">
          {reviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
