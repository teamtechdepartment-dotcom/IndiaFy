import { useState, useMemo, useEffect, useRef } from "react";

// ─── GLOBAL STYLES ──────────────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

    .srp { font-family:'DM Sans',system-ui,sans-serif; background:#0a0f1a; color:#e4e8f0; min-height:100vh; }
    .mono { font-family:'DM Mono',monospace; }

    /* Stagger entrances */
    .s0{animation:up .45s .00s cubic-bezier(.22,1,.36,1) both}
    .s1{animation:up .45s .06s cubic-bezier(.22,1,.36,1) both}
    .s2{animation:up .45s .12s cubic-bezier(.22,1,.36,1) both}
    .s3{animation:up .45s .18s cubic-bezier(.22,1,.36,1) both}
    .s4{animation:up .45s .24s cubic-bezier(.22,1,.36,1) both}
    .s5{animation:up .45s .30s cubic-bezier(.22,1,.36,1) both}
    @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

    /* Card */
    .pcard{transition:transform .28s cubic-bezier(.22,1,.36,1),border-color .2s,box-shadow .28s;}
    .pcard:hover{transform:translateY(-4px);border-color:rgba(59,130,246,.4);box-shadow:0 0 0 1px rgba(59,130,246,.15),0 16px 40px rgba(0,0,0,.3);}
    .pcard:hover .cimg{transform:scale(1.07);}
    .cimg{transition:transform .5s cubic-bezier(.22,1,.36,1);}

    /* Range thumb */
    input[type=range]{-webkit-appearance:none;height:3px;border-radius:99px;outline:none;cursor:pointer;}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#3b82f6;cursor:pointer;box-shadow:0 0 0 3px rgba(59,130,246,.25);}

    /* Filter chip */
    .fchip{transition:all .18s;user-select:none;}
    .fchip:hover{border-color:rgba(59,130,246,.5);color:#93c5fd;}
    .fchip.on{background:rgba(59,130,246,.15);border-color:rgba(59,130,246,.5);color:#93c5fd;}

    /* Sort pill */
    .spill{transition:all .18s;}
    .spill:hover:not(.active){background:rgba(255,255,255,.06);}
    .spill.active{background:#3b82f6;color:#fff;}

    /* Wishlist */
    .wbtn{transition:transform .2s cubic-bezier(.34,1.56,.64,1),color .15s;}
    .wbtn:hover{transform:scale(1.3);}
    .wbtn.on{color:#ef4444;}

    /* Cart btn */
    .cbtn{transition:all .18s cubic-bezier(.22,1,.36,1);}
    .cbtn:hover{background:#3b82f6;color:#fff;border-color:#3b82f6;}
    .cbtn:active{transform:scale(.95);}
    .cbtn.done{background:#22c55e;border-color:#22c55e;color:#fff;}

    /* Pagination btn */
    .pgbtn{transition:all .18s;}
    .pgbtn:hover:not(:disabled){background:rgba(59,130,246,.15);border-color:rgba(59,130,246,.5);color:#93c5fd;}
    .pgbtn.cur{background:#3b82f6;border-color:#3b82f6;color:#fff;}

    /* Skeleton */
    .sk{background:linear-gradient(90deg,#141c2e 25%,#1a2540 50%,#141c2e 75%);background-size:200%;animation:sk 1.5s infinite;}
    @keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}

    /* Search bar glow on focus */
    .sq:focus-within{box-shadow:0 0 0 2px rgba(59,130,246,.4);}

    /* Highlight keyword */
    mark{background:rgba(59,130,246,.25);color:#93c5fd;border-radius:3px;padding:0 2px;}

    /* Scrollbar */
    .tscroll::-webkit-scrollbar{height:3px;width:3px;}
    .tscroll::-webkit-scrollbar-thumb{background:#1e2d45;border-radius:99px;}

    /* Empty state float */
    .float{animation:float 3s ease-in-out infinite;}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

    /* Tag remove */
    .xbtn{transition:background .15s;}
    .xbtn:hover{background:rgba(255,255,255,.15);}
  `}</style>
);

// ─── PRODUCT DATA ───────────────────────────────────────────────────────────
const ALL = [
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra 5G",
    brand: "Samsung",
    price: 124999,
    orig: 134999,
    rating: 4.8,
    reviews: 5621,
    seller: "Samsung SmartShop",
    dist: 1.2,
    eta: 15,
    img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    badge: "Best Seller",
    stock: true,
  },
  {
    id: 2,
    name: "Apple iPhone 15 Pro Max 256GB",
    brand: "Apple",
    price: 159900,
    orig: 174900,
    rating: 4.9,
    reviews: 8342,
    seller: "iZone Official",
    dist: 2.5,
    eta: 22,
    img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80",
    badge: "Top Rated",
    stock: true,
  },
  {
    id: 3,
    name: "OnePlus 12 5G Silky Black 12GB",
    brand: "OnePlus",
    price: 64999,
    orig: 74999,
    rating: 4.6,
    reviews: 3210,
    seller: "TechBazaar",
    dist: 0.8,
    eta: 12,
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    badge: "Hot Deal",
    stock: true,
  },
  {
    id: 4,
    name: "Xiaomi 14 5G Flagship Snapdragon 8",
    brand: "Xiaomi",
    price: 59999,
    orig: 69999,
    rating: 4.5,
    reviews: 2145,
    seller: "MiZone Store",
    dist: 3.1,
    eta: 32,
    img: "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=400&q=80",
    badge: null,
    stock: true,
  },
  {
    id: 5,
    name: "Google Pixel 8 Pro 12GB RAM 256GB",
    brand: "Google",
    price: 84999,
    orig: 99999,
    rating: 4.7,
    reviews: 1876,
    seller: "GadgetHub",
    dist: 4.2,
    eta: 45,
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    badge: "New",
    stock: true,
  },
  {
    id: 6,
    name: "Realme 12 Pro+ 5G 256GB Submarine Blue",
    brand: "Realme",
    price: 27999,
    orig: 34999,
    rating: 4.3,
    reviews: 987,
    seller: "QuickMart",
    dist: 1.5,
    eta: 18,
    img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80",
    badge: "Budget",
    stock: true,
  },
  {
    id: 7,
    name: "Nothing Phone (2a) 128GB 8GB RAM",
    brand: "Nothing",
    price: 22999,
    orig: 27999,
    rating: 4.4,
    reviews: 2034,
    seller: "TechBazaar",
    dist: 0.8,
    eta: 12,
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&q=80",
    badge: "New",
    stock: true,
  },
  {
    id: 8,
    name: "Motorola Edge 50 Ultra 512GB Black",
    brand: "Motorola",
    price: 57999,
    orig: 62999,
    rating: 4.5,
    reviews: 1243,
    seller: "MobilWorld",
    dist: 5.8,
    eta: 55,
    img: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80",
    badge: null,
    stock: false,
  },
  {
    id: 9,
    name: "Vivo X100 Pro 5G Asteroid Black 256GB",
    brand: "Vivo",
    price: 89999,
    orig: 99999,
    rating: 4.6,
    reviews: 891,
    seller: "VivoZone",
    dist: 2.9,
    eta: 28,
    img: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80",
    badge: null,
    stock: true,
  },
  {
    id: 10,
    name: "iQOO 12 5G 16GB + 512GB Monster Orange",
    brand: "iQOO",
    price: 54999,
    orig: 59999,
    rating: 4.7,
    reviews: 1567,
    seller: "iQOO Flagship",
    dist: 3.5,
    eta: 38,
    img: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80",
    badge: "Gaming",
    stock: true,
  },
  {
    id: 11,
    name: "Samsung Galaxy A55 5G 256GB Awesome Ice",
    brand: "Samsung",
    price: 38999,
    orig: 44999,
    rating: 4.4,
    reviews: 3120,
    seller: "Samsung SmartShop",
    dist: 1.2,
    eta: 15,
    img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80",
    badge: null,
    stock: true,
  },
  {
    id: 12,
    name: "iPhone 16 128GB Teal — Latest Model",
    brand: "Apple",
    price: 79900,
    orig: 79900,
    rating: 4.8,
    reviews: 2891,
    seller: "iZone Official",
    dist: 2.5,
    eta: 22,
    img: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&q=80",
    badge: "New",
    stock: true,
  },
];

const SORTS = [
  { k: "rel", l: "Relevance" },
  { k: "p_asc", l: "Price ↑" },
  { k: "p_desc", l: "Price ↓" },
  { k: "rating", l: "Top Rated" },
  { k: "eta", l: "Fastest" },
];

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const pct = (p, o) => Math.round(((o - p) / o) * 100);

// ─── ICON ──────────────────────────────────────────────────────────────────
const Ic = ({ d, c = "w-4 h-4", sw = 1.8, fill = false }) => (
  <svg
    className={c}
    fill={fill ? "currentColor" : "none"}
    stroke={fill ? "none" : "currentColor"}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d={d} />
  </svg>
);

// ─── STARS ─────────────────────────────────────────────────────────────────
const Stars = ({ r }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`w-3 h-3 ${s <= Math.round(r) ? "text-amber-400" : "text-white/10"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// ─── BADGE COLORS ───────────────────────────────────────────────────────────
const BC = {
  "Best Seller": "bg-amber-400/15 text-amber-400 border-amber-400/25",
  "Top Rated": "bg-blue-400/15 text-blue-400 border-blue-400/25",
  "Hot Deal": "bg-red-400/15 text-red-400 border-red-400/25",
  New: "bg-emerald-400/15 text-emerald-400 border-emerald-400/25",
  Budget: "bg-violet-400/15 text-violet-400 border-violet-400/25",
  Gaming: "bg-orange-400/15 text-orange-400 border-orange-400/25",
};

// ─── PRODUCT CARD ───────────────────────────────────────────────────────────
function PCard({ p, i, query }) {
  const [w, setW] = useState(false);
  const [a, setA] = useState(false);
  const dp = pct(p.price, p.orig);

  // Highlight query in name
  const highlight = (text, q) => {
    if (!q) return text;
    const re = new RegExp(
      `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(re);
    return parts.map((pt, idx) =>
      re.test(pt) ? <mark key={idx}>{pt}</mark> : pt,
    );
  };

  return (
    <div
      className={`pcard bg-[#101827] border border-white/[.07] rounded-2xl overflow-hidden cursor-pointer s${Math.min(i, 5)}`}
      style={{ animationDelay: `${i * 0.055}s` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0d1422]">
        <img
          src={p.img}
          alt={p.name}
          className="cimg w-full h-full object-cover"
        />
        {!p.stock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-bold text-white/60 border border-white/20 px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {p.badge && (
          <span
            className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${BC[p.badge]}`}
          >
            {p.badge}
          </span>
        )}
        {dp > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            -{dp}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setW((x) => !x);
          }}
          className={`wbtn absolute bottom-2.5 right-2.5 w-8 h-8 bg-[#0a0f1a]/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 ${w ? "on" : "text-white/30"}`}
        >
          <Ic
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            c="w-4 h-4"
            fill={w}
            sw={w ? 0 : 1.8}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
          {p.brand}
        </p>
        <h3
          className="text-sm font-semibold text-slate-200 leading-snug mb-2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {highlight(p.name, query)}
        </h3>

        <div className="flex items-center gap-1.5 mb-2.5">
          <Stars r={p.rating} />
          <span className="text-xs font-bold text-slate-300">{p.rating}</span>
          <span className="text-xs text-slate-600">
            ({p.reviews.toLocaleString()})
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-black text-white">
            {fmt(p.price)}
          </span>
          {dp > 0 && (
            <span className="text-xs text-slate-600 line-through">
              {fmt(p.orig)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <Ic
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
              c="w-3 h-3 shrink-0"
            />
            <span className="truncate">{p.seller}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Ic
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              c="w-3 h-3"
            />
            {p.dist} km
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1">
            <Ic
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0"
              c="w-3 h-3 text-emerald-400"
            />
            <span className="text-[10px] font-bold text-emerald-400">
              {p.eta} min
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!p.stock) return;
              setA(true);
              setTimeout(() => setA(false), 2000);
            }}
            disabled={!p.stock}
            className={`cbtn flex-1 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${a ? "done" : "border-white/10 text-slate-300"}`}
          >
            {a ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FILTER PANEL ───────────────────────────────────────────────────────────
function FilterPanel({ f, set }) {
  const sl = (key, val) => set((x) => ({ ...x, [key]: val }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Price */}
      <div className="relative group">
        <button
          className={`fchip flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#101827] border rounded-xl ${f.maxPrice < 200000 ? "on" : "border-white/10 text-slate-400"}`}
        >
          <Ic
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0"
            c="w-3.5 h-3.5"
          />
          Price{f.maxPrice < 200000 ? `: Under ${fmt(f.maxPrice)}` : ""}
          <Ic d="M19 9l-7 7-7-7" c="w-3 h-3" />
        </button>
        <div className="absolute top-full left-0 mt-2 bg-[#101827] border border-white/10 rounded-xl p-4 w-56 z-30 shadow-2xl hidden group-focus-within:block hover:block">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
            Max Price
          </p>
          <input
            type="range"
            min={10000}
            max={200000}
            step={5000}
            value={f.maxPrice}
            onChange={(e) => sl("maxPrice", +e.target.value)}
            className="w-full"
            style={{
              background: `linear-gradient(to right,#3b82f6 0%,#3b82f6 ${((f.maxPrice - 10000) / 190000) * 100}%,#1e2d45 ${((f.maxPrice - 10000) / 190000) * 100}%,#1e2d45 100%)`,
            }}
          />
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
            <span>₹10K</span>
            <span className="text-blue-400">{fmt(f.maxPrice)}</span>
            <span>₹2L</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            {[
              [10000, 30000, "Under ₹30K"],
              [30000, 80000, "₹30K–80K"],
              [80000, 200000, "₹80K+"],
            ].map(([mn, mx, lb]) => (
              <button
                key={lb}
                onClick={() =>
                  set((x) => ({ ...x, minPrice: mn, maxPrice: mx }))
                }
                className={`text-[9px] font-bold border rounded-lg py-1 transition-all ${f.minPrice === mn && f.maxPrice === mx ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "border-white/10 text-slate-500 hover:border-blue-400/30"}`}
              >
                {lb}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Distance */}
      <div className="relative group">
        <button
          className={`fchip flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#101827] border rounded-xl ${f.maxDist < 10 ? "on" : "border-white/10 text-slate-400"}`}
        >
          <Ic
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            c="w-3.5 h-3.5"
          />
          {f.maxDist < 10 ? `≤ ${f.maxDist} km` : "Distance"}
          <Ic d="M19 9l-7 7-7-7" c="w-3 h-3" />
        </button>
        <div className="absolute top-full left-0 mt-2 bg-[#101827] border border-white/10 rounded-xl p-4 w-48 z-30 shadow-2xl hidden group-focus-within:block hover:block">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
            Within
          </p>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={f.maxDist}
            onChange={(e) => sl("maxDist", +e.target.value)}
            className="w-full"
            style={{
              background: `linear-gradient(to right,#3b82f6 0%,#3b82f6 ${((f.maxDist - 0.5) / 9.5) * 100}%,#1e2d45 ${((f.maxDist - 0.5) / 9.5) * 100}%,#1e2d45 100%)`,
            }}
          />
          <p className="text-center text-sm font-black text-blue-400 mt-2">
            {f.maxDist} km
          </p>
        </div>
      </div>

      {/* Delivery time */}
      <div className="relative group">
        <button
          className={`fchip flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#101827] border rounded-xl ${f.maxEta < 999 ? "on" : "border-white/10 text-slate-400"}`}
        >
          <Ic d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" c="w-3.5 h-3.5" />
          {f.maxEta < 999 ? `< ${f.maxEta} min` : "Delivery Time"}
          <Ic d="M19 9l-7 7-7-7" c="w-3 h-3" />
        </button>
        <div className="absolute top-full left-0 mt-2 bg-[#101827] border border-white/10 rounded-xl p-3 z-30 shadow-2xl hidden group-focus-within:block hover:block min-w-[160px]">
          {[
            [15, "Express (≤15 min)"],
            [30, "Quick (≤30 min)"],
            [60, "Standard (≤60 min)"],
            [999, "Any"],
          ].map(([t, lb]) => (
            <button
              key={t}
              onClick={() => sl("maxEta", t)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all mb-1 last:mb-0 ${f.maxEta === t ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-white/5"}`}
            >
              {lb}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="relative group">
        <button
          className={`fchip flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#101827] border rounded-xl ${f.minRating > 0 ? "on" : "border-white/10 text-slate-400"}`}
        >
          <svg
            className="w-3.5 h-3.5 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {f.minRating > 0 ? `${f.minRating}+ Stars` : "Rating"}
          <Ic d="M19 9l-7 7-7-7" c="w-3 h-3" />
        </button>
        <div className="absolute top-full left-0 mt-2 bg-[#101827] border border-white/10 rounded-xl p-3 z-30 shadow-2xl hidden group-focus-within:block hover:block min-w-[160px]">
          {[
            [0, "All Ratings"],
            [3, "3+ Stars"],
            [4, "4+ Stars"],
            [4.5, "4.5+ Stars"],
          ].map(([r, lb]) => (
            <button
              key={r}
              onClick={() => sl("minRating", r)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all mb-1 last:mb-0 ${f.minRating === r ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-white/5"}`}
            >
              {lb}
            </button>
          ))}
        </div>
      </div>

      {/* In stock toggle */}
      <button
        onClick={() => set((x) => ({ ...x, stockOnly: !x.stockOnly }))}
        className={`fchip flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#101827] border rounded-xl ${f.stockOnly ? "on" : "border-white/10 text-slate-400"}`}
      >
        <Ic d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" c="w-3.5 h-3.5" />
        In Stock
      </button>
    </div>
  );
}

// ─── ACTIVE FILTER TAGS ──────────────────────────────────────────────────────
function ActiveTags({ f, set }) {
  const tags = [];
  if (f.maxPrice < 200000)
    tags.push({
      l: `Under ${fmt(f.maxPrice)}`,
      x: () => set((p) => ({ ...p, maxPrice: 200000, minPrice: 0 })),
    });
  if (f.maxDist < 10)
    tags.push({
      l: `≤ ${f.maxDist} km`,
      x: () => set((p) => ({ ...p, maxDist: 10 })),
    });
  if (f.maxEta < 999)
    tags.push({
      l: `< ${f.maxEta} min`,
      x: () => set((p) => ({ ...p, maxEta: 999 })),
    });
  if (f.minRating > 0)
    tags.push({
      l: `${f.minRating}+ ★`,
      x: () => set((p) => ({ ...p, minRating: 0 })),
    });
  if (f.stockOnly)
    tags.push({
      l: "In Stock",
      x: () => set((p) => ({ ...p, stockOnly: false })),
    });
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-[11px] text-slate-600 font-medium">Active:</span>
      {tags.map((t) => (
        <span
          key={t.l}
          className="flex items-center gap-1.5 text-[11px] font-semibold bg-blue-500/10 border border-blue-500/25 text-blue-400 pl-2.5 pr-1.5 py-1 rounded-full"
        >
          {t.l}
          <button
            onClick={t.x}
            className="xbtn w-4 h-4 rounded-full flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 transition-colors"
          >
            <Ic d="M6 18L18 6M6 6l12 12" c="w-2.5 h-2.5" sw={2.5} />
          </button>
        </span>
      ))}
      <button
        onClick={() =>
          set({
            maxPrice: 200000,
            minPrice: 0,
            maxDist: 10,
            maxEta: 999,
            minRating: 0,
            stockOnly: false,
          })
        }
        className="text-[11px] text-slate-600 hover:text-slate-300 transition-colors underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function Empty({ q, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center s0">
      <div className="float text-7xl mb-6">🔍</div>
      <h3 className="text-xl font-bold text-slate-300 mb-2">
        No results for <span className="text-blue-400">"{q}"</span>
      </h3>
      <p className="text-sm text-slate-600 mb-6 max-w-xs">
        Try different keywords, remove some filters, or expand your search area.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onClear}
          className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl transition-colors"
        >
          Clear Filters
        </button>
        <button className="text-sm font-semibold text-slate-400 bg-white/5 border border-white/10 hover:border-blue-400/30 px-5 py-2.5 rounded-xl transition-colors">
          Browse All
        </button>
      </div>
    </div>
  );
}

// ─── PAGINATION ──────────────────────────────────────────────────────────────
function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10 s5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="pgbtn w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Ic d="M15 19l-7-7 7-7" c="w-4 h-4" />
      </button>
      {nums.map((n, i) =>
        n === "…" ? (
          <span
            key={`e${i}`}
            className="w-9 h-9 flex items-center justify-center text-slate-600 text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`pgbtn w-9 h-9 rounded-xl border text-sm font-bold transition-all ${page === n ? "cur border-blue-500" : "border-white/10 text-slate-400"}`}
          >
            {n}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="pgbtn w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Ic d="M9 5l7 7-7 7" c="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── SEARCH RESULTS PAGE ─────────────────────────────────────────────────────
const QUERIES = [
  "smartphone",
  "wireless headphones",
  "laptop",
  "smartwatch",
  "tablet",
  "camera",
];
const PER_PAGE = 8;
const DF = {
  maxPrice: 200000,
  minPrice: 0,
  maxDist: 10,
  maxEta: 999,
  minRating: 0,
  stockOnly: false,
};

export default function SearchResultsPage() {
  const [query, setQuery] = useState("smartphone");
  const [draft, setDraft] = useState("smartphone");
  const [sort, setSort] = useState("rel");
  const [filt, setFilt] = useState(DF);
  const [page, setPage] = useState(1);
  const [view, setView] = useState("grid");
  const inputRef = useRef(null);

  const results = useMemo(() => {
    let list = ALL.filter((p) => {
      if (p.price < filt.minPrice || p.price > filt.maxPrice) return false;
      if (p.dist > filt.maxDist) return false;
      if (p.eta > filt.maxEta) return false;
      if (p.rating < filt.minRating) return false;
      if (filt.stockOnly && !p.stock) return false;
      return true;
    });
    switch (sort) {
      case "p_asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "p_desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "eta":
        list = [...list].sort((a, b) => a.eta - b.eta);
        break;
    }
    return list;
  }, [filt, sort]);

  const paginated = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = () => {
    setQuery(draft);
    setPage(1);
  };
  const clearFilters = () => {
    setFilt(DF);
    setPage(1);
  };

  return (
    <div className="srp">
      <G />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── SEARCH BAR ──────────────────────────────── */}
        <div className="s0 mb-8">
          <div className="sq flex items-center gap-3 bg-[#101827] border border-white/10 rounded-2xl px-4 py-3 max-w-2xl transition-all">
            <Ic
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
              c="w-5 h-5 text-slate-500 shrink-0"
            />
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none"
            />
            {draft && (
              <button
                onClick={() => {
                  setDraft("");
                  inputRef.current?.focus();
                }}
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                <Ic d="M6 18L18 6M6 6l12 12" c="w-4 h-4" sw={2} />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              Search
            </button>
          </div>

          {/* Quick searches */}
          <div className="flex flex-wrap gap-2 mt-3">
            {QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  setDraft(q);
                  setPage(1);
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${query === q ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "border-white/[.08] text-slate-500 hover:border-white/20 hover:text-slate-300"}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS HEADER ──────────────────────────── */}
        <div className="s1 flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black text-white">
              Results for{" "}
              <span className="mono text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-lg">
                "{query}"
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-300">
                {results.length}
              </span>{" "}
              products found
              {filt.maxDist < 10 && (
                <>
                  {" "}
                  within{" "}
                  <span className="text-blue-400 font-semibold">
                    {filt.maxDist} km
                  </span>
                </>
              )}{" "}
              · Koramangala, Bengaluru
            </p>
          </div>

          {/* Sort + view */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#101827] border border-white/[.07] rounded-xl p-1">
              {SORTS.map((s) => (
                <button
                  key={s.k}
                  onClick={() => {
                    setSort(s.k);
                    setPage(1);
                  }}
                  className={`spill text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${sort === s.k ? "active" : ""}`}
                >
                  {s.l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-[#101827] border border-white/[.07] rounded-xl p-1">
              {[
                [
                  "grid",
                  "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
                ],
                ["list", "M4 6h16M4 10h16M4 14h16M4 18h16"],
              ].map(([m, ic]) => (
                <button
                  key={m}
                  onClick={() => setView(m)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === m ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Ic d={ic} c="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── FILTER BAR ──────────────────────────────── */}
        <div className="s2 mb-2">
          <FilterPanel f={filt} set={setFilt} />
          <ActiveTags
            f={filt}
            set={(v) => {
              setFilt(v);
              setPage(1);
            }}
          />
        </div>

        {/* ── RESULTS GRID / LIST ─────────────────────── */}
        <div className="mt-6">
          {paginated.length === 0 ? (
            <Empty q={query} onClear={clearFilters} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map((p, i) => (
                <PCard key={p.id} p={p} i={i} query={query} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map((p, i) => (
                <div
                  key={p.id}
                  className={`pcard bg-[#101827] border border-white/[.07] rounded-2xl p-4 flex gap-4 cursor-pointer s${Math.min(i, 5)}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#0d1422] border border-white/[.05] shrink-0 relative">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="cimg w-full h-full object-cover"
                    />
                    {!p.stock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white/50">
                          OOS
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
                      {p.brand}
                    </p>
                    <h3
                      className="text-sm font-bold text-slate-200 leading-snug mt-0.5"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Stars r={p.rating} />
                      <span className="text-xs text-slate-400 font-bold">
                        {p.rating}
                      </span>
                      <span className="text-xs text-slate-600">
                        ({p.reviews.toLocaleString()})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-[11px] text-slate-500">
                      <span className="font-black text-base text-white">
                        {fmt(p.price)}
                      </span>
                      {pct(p.price, p.orig) > 0 && (
                        <>
                          <span className="line-through text-slate-600 text-xs">
                            {fmt(p.orig)}
                          </span>
                          <span className="text-blue-400 font-bold">
                            -{pct(p.price, p.orig)}%
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>{p.seller}</span>
                      <span>·</span>
                      <span>{p.dist} km</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">
                        {p.eta} min delivery
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-2 shrink-0">
                    {p.badge && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border text-center ${BC[p.badge]}`}
                      >
                        {p.badge}
                      </span>
                    )}
                    <button
                      disabled={!p.stock}
                      className="cbtn py-2 px-4 text-xs font-bold border border-white/10 text-slate-300 rounded-xl disabled:opacity-30"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PAGINATION ──────────────────────────────── */}
        <Pagination
          page={page}
          total={results.length}
          perPage={PER_PAGE}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Results count footer */}
        {results.length > 0 && (
          <p className="text-center text-xs text-slate-700 mt-4">
            Showing {(page - 1) * PER_PAGE + 1}–
            {Math.min(page * PER_PAGE, results.length)} of {results.length}{" "}
            results
          </p>
        )}
      </div>
    </div>
  );
}
