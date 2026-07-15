import { useEffect, useState } from "react";
import { Store, Package, Clock } from "lucide-react";
import { motion } from "framer-motion";

function AnimatedCounter({ target, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 1200;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <span className="text-sm font-black text-zinc-900 tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

const STATS = [
  { icon: Store, label: "Stores Open", value: 12, suffix: "" },
  { icon: Package, label: "Products Available", value: 500, suffix: "+" },
  { icon: Clock, label: "Avg. Delivery", value: 30, prefix: "under ", suffix: " min" },
];

export default function DeliveryBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-r from-brand-accent/5 via-emerald-50 to-brand-accent/5 border-b border-emerald-100/60"
    >
      <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex items-center justify-center gap-6 sm:gap-10 overflow-x-auto no-scrollbar">
        {STATS.map((stat, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-6 h-6 rounded-full bg-brand-accent/10 flex items-center justify-center">
              <stat.icon size={12} className="text-brand-accent" />
            </div>
            <div className="flex flex-col leading-none">
              <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
