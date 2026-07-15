/**
 * PasswordStrength.jsx
 * ─────────────────────────────────────────────────────────────
 * Visual password-strength indicator.
 * Grades from 0 (empty) to 4 (strong) based on:
 *   +1  length ≥ 8
 *   +1  contains uppercase AND lowercase
 *   +1  contains a digit
 *   +1  contains a special character (@$!%*?&)
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";

const LEVELS = [
  { label: "Too weak",  color: "bg-red-400",    text: "text-red-500" },
  { label: "Weak",      color: "bg-orange-400",  text: "text-orange-500" },
  { label: "Fair",      color: "bg-yellow-400",  text: "text-yellow-600" },
  { label: "Good",      color: "bg-emerald-400", text: "text-emerald-600" },
  { label: "Strong",    color: "bg-emerald-500", text: "text-emerald-700" },
];

const calcStrength = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  return score;
};

const PasswordStrength = ({ password, className = "" }) => {
  const score = useMemo(() => calcStrength(password), [password]);
  const level = LEVELS[score];

  if (!password) return null;

  return (
    <div className={`mt-2 space-y-1.5 ${className}`} aria-live="polite">
      {/* Segment bars */}
      <div className="flex gap-1" role="presentation">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden"
          >
            <motion.div
              className={`h-full rounded-full ${score >= i ? level.color : "bg-transparent"}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: score >= i ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>
        ))}
      </div>

      {/* Label */}
      <p className={`text-[11px] font-semibold ${level.text}`}>
        Password strength: {level.label}
      </p>
    </div>
  );
};

export default PasswordStrength;
