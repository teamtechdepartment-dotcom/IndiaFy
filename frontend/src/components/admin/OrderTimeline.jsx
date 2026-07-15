import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const steps = ["Order Placed", "Processing", "Shipped", "Delivered"];

export default function OrderTimeline({ status }) {
  const activeIndex = steps.indexOf(status);

  return (
    <div className="space-y-3 sm:space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index <= activeIndex;

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="flex items-start sm:items-center gap-3 sm:gap-4"
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <CheckCircle size={16} className="sm:hidden" />
              <CheckCircle size={18} className="hidden sm:block" />
            </div>

            <p
              className={`font-medium text-sm sm:text-base ${
                isCompleted ? "text-black" : "text-gray-400"
              }`}
            >
              {step}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
