/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useMemo, useEffect, useRef } from "react";
import WebsiteNavbar from "../../components/WebsiteNavbar";

// ─── GLOBAL STYLES ──────────────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

    /* Fixed overflow:hidden to overflow-x:hidden to prevent scroll locking & dropdown clipping */
    .srp { font-family:'DM Sans',system-ui,sans-serif; background:#ffffff; color:#0f172a; min-height:100vh; position:relative; overflow-x:hidden; }
    .mono { font-family:'DM Mono',monospace; }

    /* Stagger entrances - hidden heavy animations on mobile per user constraints */
    @media (min-width: 768px) {
      .s0{animation:up .45s .00s cubic-bezier(.22,1,.36,1) both}
      .s1{animation:up .45s .06s cubic-bezier(.22,1,.36,1) both}
      .s2{animation:up .45s .12s cubic-bezier(.22,1,.36,1) both}
      .s3{animation:up .45s .18s cubic-bezier(.22,1,.36,1) both}
      .s4{animation:up .45s .24s cubic-bezier(.22,1,.36,1) both}
      .s5{animation:up .45s .30s cubic-bezier(.22,1,.36,1) both}
      @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    }

    /* Card */
    .pcard{transition:all .3s cubic-bezier(.22,1,.36,1);}
    .pcard:hover{transform:translateY(-4px); border-color:#d1fae5; box-shadow: 0 20px 40px -10px rgba(16,185,129,0.1), 0 10px 20px -5px rgba(0,0,0,0.05);}
    .pcard:hover .cimg{transform:scale(1.08);}
    .cimg{transition:transform .7s cubic-bezier(.22,1,.36,1);}

    /* Range thumb */
    input[type=range]{-webkit-appearance:none;height:4px;border-radius:99px;outline:none;cursor:pointer;}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#10b981;cursor:pointer;box-shadow:0 0 0 4px rgba(16,185,129,.2); border: 2px solid white;}

    /* Filter chip */
    .fchip{transition:all .2s;user-select:none;}
    .fchip:hover{border-color:#10b981;color:#047857;}
    .fchip.on{background:#ecfdf5;border-color:#a7f3d0;color:#059669;}

    /* Sort pill */
    .spill{transition:all .2s;}
    .spill:hover:not(.active){background:#f4f4f5; color:#0f172a;}
    .spill.active{background:#10b981;color:#fff; box-shadow: 0 4px 10px rgba(16,185,129,0.3);}

    /* Wishlist */
    .wbtn{transition:transform .2s cubic-bezier(.34,1.56,.64,1),color .15s, background .2s;}
    .wbtn:hover{transform:scale(1.15);}
    .wbtn.on{color:#ef4444; fill: #ef4444;}

    /* Cart btn */
    .cbtn{transition:all .2s cubic-bezier(.22,1,.36,1);}
    .cbtn:hover:not(:disabled){background:#f8fafc;}
    .cbtn:active:not(:disabled){transform:scale(.97);}

    /* Pagination btn */
    .pgbtn{transition:all .2s;}
    .pgbtn:hover:not(:disabled){background:#ecfdf5;border-color:#a7f3d0;color:#059669;}
    .pgbtn.cur{background:#10b981;border-color:#10b981;color:#fff; box-shadow: 0 4px 10px rgba(16,185,129,0.25);}

    /* Skeleton */
    .sk{background:linear-gradient(90deg,#f4f4f5 25%,#e4e4e7 50%,#f4f4f5 75%);background-size:200%;animation:sk 1.5s infinite;}
    @keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}

    /* Search bar glow on focus */
    .sq:focus-within{box-shadow:0 0 0 3px rgba(16,185,129,.2); border-color:#10b981;}

    /* Highlight keyword */
    mark{background:#d1fae5;color:#065f46;border-radius:4px;padding:0 4px;font-weight:900;}

    /* Scrollbar */
    .tscroll::-webkit-scrollbar{height:4px;width:4px;}
    .tscroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px;}
    .tscroll::-webkit-scrollbar-thumb:hover{background:#94a3b8;}

    /* Empty state float */
    .float{animation:float 4s ease-in-out infinite;}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}

    /* Tag remove */
    .xbtn{transition:background .2s;}
    .xbtn:hover{background:rgba(16,185,129,.3);}

    /* No scrollbar utility */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
    img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
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
    img: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80",
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
const Ic = ({ d, c = "w-4 h-4", sw = 2, fill = false }) => (
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
        className={`w-3 h-3 md:w-[14px] md:h-[14px] ${s <= Math.round(r) ? "text-emerald-500" : "text-zinc-200"}`}
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
  "Best Seller": "bg-amber-50 text-amber-600 border-amber-200",
  "Top Rated": "bg-blue-50 text-blue-600 border-blue-200",
  "Hot Deal": "bg-red-50 text-red-600 border-red-200",
  New: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Budget: "bg-violet-50 text-violet-600 border-violet-200",
  Gaming: "bg-orange-50 text-orange-600 border-orange-200",
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
      "gi"
    );
    const parts = text.split(re);
    return parts.map((pt, idx) =>
      re.test(pt) ? <mark key={idx}>{pt}</mark> : pt
    );
  };

  return (
    <div
      className={`pcard bg-white border border-zinc-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col cursor-pointer s${Math.min(i, 5)}`}
      style={{ animationDelay: `${i * 0.055}s` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 border-b border-zinc-50">
        <img loading="lazy" decoding="async"
          src={p.img}
          alt={p.name}
          className="cimg w-full h-full object-cover"
        />
        {!p.stock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-[10px] font-black uppercase text-slate-900 border-2 border-slate-900 px-3 py-1.5 rounded-full bg-white/50">
              Out of Stock
            </span>
          </div>
        )}
        {p.badge && (
          <span
            className={`absolute top-3 md:top-4 left-3 md:left-4 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${BC[p.badge]}`}
          >
            {p.badge}
          </span>
        )}
        {dp > 0 && (
          <span className="absolute top-3 md:top-4 right-3 md:right-4 bg-emerald-100 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
            -{dp}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setW((x) => !x);
          }}
          className={`wbtn absolute bottom-3 md:bottom-4 right-3 md:bottom-4 w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md border border-slate-100 ${w ? "on" : "text-slate-400 hover:text-red-500"}`}
        >
          <Ic
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            c="w-4 h-4 md:w-[18px] md:h-[18px]"
            fill={w}
            sw={w ? 0 : 2}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">
          {p.brand}
        </p>
        <h3
          className="text-sm md:text-base font-bold text-slate-900 leading-snug mb-2 flex-1"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {highlight(p.name, query)}
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <Stars r={p.rating} />
          <span className="text-[10px] md:text-xs font-black text-slate-900">{p.rating}</span>
          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">
            ({p.reviews.toLocaleString()})
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg md:text-xl font-black text-slate-900">
            {fmt(p.price)}
          </span>
          {dp > 0 && (
            <span className="text-[10px] md:text-xs font-bold text-slate-400 line-through">
              {fmt(p.orig)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-4 gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <Ic
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
              c="w-[14px] h-[14px] shrink-0 text-slate-400"
            />
            <span className="truncate">{p.seller}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 uppercase tracking-wider">
            <Ic
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              c="w-[14px] h-[14px] text-slate-400"
            />
            {p.dist} km
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-zinc-50">
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-1 text-emerald-600">
              <Ic
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0"
                c="w-3.5 h-3.5"
              />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                {p.eta} min
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!p.stock) return;
              setA(true);
            }}
            disabled={!p.stock}
            className={`cbtn px-4 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              a
                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-white border-slate-900 text-slate-900 hover:bg-slate-50"
            }`}
          >
            {a ? "Added" : "Add"}
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
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {/* Price */}
      <div className="relative group">
        <button
          className={`fchip flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-white border rounded-full ${f.maxPrice < 200000 ? "on" : "border-zinc-200 text-slate-600"}`}
        >
          <Ic
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0"
            c="w-3.5 h-3.5 md:w-4 md:h-4"
          />
          Price{f.maxPrice < 200000 ? `: <${fmt(f.maxPrice)}` : ""}
          <Ic d="M19 9l-7 7-7-7" c="w-3 h-3 md:w-3.5 md:h-3.5 ml-1 transition-transform group-focus-within:-rotate-180 group-hover:-rotate-180" />
        </button>
        <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-2xl p-5 w-64 z-[110] shadow-2xl hidden group-focus-within:block hover:block">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">
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
              background: `linear-gradient(to right,#10b981 0%,#10b981 ${((f.maxPrice - 10000) / 190000) * 100}%,#e4e4e7 ${((f.maxPrice - 10000) / 190000) * 100}%,#e4e4e7 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mt-3">
            <span>₹10K</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{fmt(f.maxPrice)}</span>
            <span>₹2L</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-100">
            {[
              [10000, 30000, "< ₹30K"],
              [30000, 80000, "₹30K–80K"],
              [80000, 200000, "₹80K+"],
            ].map(([mn, mx, lb]) => (
              <button
                key={lb}
                onClick={() =>
                  set((x) => ({ ...x, minPrice: mn, maxPrice: mx }))
                }
                className={`text-[9px] font-black uppercase tracking-wider border rounded-xl py-1.5 transition-all ${f.minPrice === mn && f.maxPrice === mx ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-zinc-50 border-zinc-200 text-slate-500 hover:border-emerald-200"}`}
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
          className={`fchip flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-white border rounded-full ${f.maxDist < 10 ? "on" : "border-zinc-200 text-slate-600"}`}
        >
          <Ic
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            c="w-3.5 h-3.5 md:w-4 md:h-4"
          />
          {f.maxDist < 10 ? `≤ ${f.maxDist} km` : "Distance"}
          <Ic d="M19 9l-7 7-7-7" c="w-3 h-3 md:w-3.5 md:h-3.5 ml-1 transition-transform group-focus-within:-rotate-180 group-hover:-rotate-180" />
        </button>
        {/* Adjusted left-1/2 -translate-x-1/2 for mobile so it centers instead of overflowing left/right */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-2xl p-5 w-56 z-[110] shadow-2xl hidden group-focus-within:block hover:block">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">
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
              background: `linear-gradient(to right,#10b981 0%,#10b981 ${((f.maxDist - 0.5) / 9.5) * 100}%,#e4e4e7 ${((f.maxDist - 0.5) / 9.5) * 100}%,#e4e4e7 100%)`,
            }}
          />
          <p className="text-center text-sm font-black text-emerald-600 mt-3 bg-emerald-50 py-1 rounded-lg border border-emerald-100">
            {f.maxDist} km
          </p>
        </div>
      </div>

      {/* Delivery time */}
      <div className="relative group">
        <button
          className={`fchip flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-white border rounded-full ${f.maxEta < 999 ? "on" : "border-zinc-200 text-slate-600"}`}
        >
          <Ic d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" c="w-3.5 h-3.5 md:w-4 md:h-4" />
          {f.maxEta < 999 ? `< ${f.maxEta} min` : "Time"}
          <Ic d="M19 9l-7 7-7-7" c="w-3 h-3 md:w-3.5 md:h-3.5 ml-1 transition-transform group-focus-within:-rotate-180 group-hover:-rotate-180" />
        </button>
        {/* Changed to right-0 for mobile to prevent cutoff off-screen */}
        <div className="absolute top-full right-0 md:left-0 md:right-auto mt-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-2xl p-3 z-[110] shadow-2xl hidden group-focus-within:block hover:block min-w-[200px]">
          {[
            [15, "Express (≤15 min)"],
            [30, "Quick (≤30 min)"],
            [60, "Standard (≤60 min)"],
            [999, "Any Time"],
          ].map(([t, lb]) => (
            <button
              key={t}
              onClick={() => sl("maxEta", t)}
              className={`w-full text-left px-4 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all mb-1 last:mb-0 ${f.maxEta === t ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:bg-zinc-50"}`}
            >
              {lb}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="relative group">
        <button
          className={`fchip flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-white border rounded-full ${f.minRating > 0 ? "on" : "border-zinc-200 text-slate-600"}`}
        >
          <svg
            className={`w-3.5 h-3.5 md:w-4 md:h-4 ${f.minRating > 0 ? "text-emerald-500" : "text-slate-400"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {f.minRating > 0 ? `${f.minRating}+ Stars` : "Rating"}
          <Ic d="M19 9l-7 7-7-7" c="w-3 h-3 md:w-3.5 md:h-3.5 ml-1 transition-transform group-focus-within:-rotate-180 group-hover:-rotate-180" />
        </button>
        <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-2xl p-3 z-[110] shadow-2xl hidden group-focus-within:block hover:block min-w-[180px]">
          {[
            [0, "All Ratings"],
            [3, "3+ Stars"],
            [4, "4+ Stars"],
            [4.5, "4.5+ Stars"],
          ].map(([r, lb]) => (
            <button
              key={r}
              onClick={() => sl("minRating", r)}
              className={`w-full text-left px-4 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all mb-1 last:mb-0 ${f.minRating === r ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:bg-zinc-50"}`}
            >
              {lb}
            </button>
          ))}
        </div>
      </div>

      {/* In stock toggle */}
      <button
        onClick={() => set((x) => ({ ...x, stockOnly: !x.stockOnly }))}
        className={`fchip flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-white border rounded-full ${f.stockOnly ? "on" : "border-zinc-200 text-slate-600"}`}
      >
        <Ic d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" c="w-3.5 h-3.5 md:w-4 md:h-4" />
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
      l: `< ${fmt(f.maxPrice)}`,
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
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active:</span>
      {tags.map((t) => (
        <span
          key={t.l}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-700 pl-3 pr-1.5 py-1.5 rounded-full shadow-sm"
        >
          {t.l}
          <button
            onClick={t.x}
            className="xbtn w-5 h-5 rounded-full flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
          >
            <Ic d="M6 18L18 6M6 6l12 12" c="w-3 h-3" sw={2.5} />
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
        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors ml-2 underline underline-offset-4 decoration-2 decoration-slate-200 hover:decoration-slate-900"
      >
        Clear all
      </button>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function Empty({ q, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center s0 bg-zinc-50 rounded-[2rem] border border-zinc-100">
      <div className="float text-7xl mb-6">🔍</div>
      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
        No results for <span className="text-emerald-600 italic">"{q}"</span>
      </h3>
      <p className="text-sm md:text-base text-slate-500 mb-8 max-w-sm font-medium px-4">
        Try different keywords, remove some filters, or expand your search area.
      </p>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        <button
          onClick={onClear}
          className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 px-6 py-3 md:py-4 rounded-full transition-all"
        >
          Clear Filters
        </button>
        <button className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 bg-white border-2 border-slate-200 hover:border-slate-900 hover:text-slate-900 px-6 py-3 md:py-4 rounded-full transition-all">
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
    <div className="flex items-center justify-center gap-2 mt-12 md:mt-16 s5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="pgbtn w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-zinc-200 flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed bg-white"
      >
        <Ic d="M15 19l-7-7 7-7" c="w-4 h-4 md:w-5 md:h-5" sw={2.5} />
      </button>
      {nums.map((n, i) =>
        n === "…" ? (
          <span
            key={`e${i}`}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-slate-400 text-sm font-black"
          >
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`pgbtn w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 text-sm font-black transition-all ${page === n ? "cur border-emerald-500" : "border-zinc-200 text-slate-600 bg-white"}`}
          >
            {n}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="pgbtn w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-zinc-200 flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed bg-white"
      >
        <Ic d="M9 5l7 7-7 7" c="w-4 h-4 md:w-5 md:h-5" sw={2.5} />
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
      <WebsiteNavbar />

      {/* Background Blobs - Hidden on Mobile for Performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 hidden md:block opacity-70">
        <div className="absolute top-[-10%] right-[10%] w-[40vw] h-[40vw] bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[100px]" />
      </div>

      {/* Added pt-24 md:pt-32 to prevent Navbar from overlapping the search container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-6 md:pt-32 md:pb-16 relative z-[1]">
        {/* ── SEARCH BAR ──────────────────────────────── */}
        <div className="s0 mb-8 md:mb-12">
          <div className="sq flex items-center gap-2 md:gap-3 bg-white border-2 border-zinc-100 rounded-full px-4 md:px-6 py-3 md:py-4 max-w-2xl transition-all shadow-sm">
            <Ic
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
              c="w-5 h-5 text-emerald-500 shrink-0"
              sw={2.5}
            />
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search verified products…"
              className="flex-1 bg-transparent text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium text-sm md:text-base focus:outline-none w-full"
            />
            {draft && (
              <button
                onClick={() => {
                  setDraft("");
                  inputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors shrink-0"
              >
                <Ic d="M6 18L18 6M6 6l12 12" c="w-3.5 h-3.5" sw={2.5} />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="bg-slate-900 hover:bg-emerald-500 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-5 md:px-6 py-2.5 md:py-3 rounded-full transition-colors shrink-0 shadow-md"
            >
              Search
            </button>
          </div>

          {/* Quick searches */}
          <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-5 items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mr-1">Trending:</span>
            {QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  setDraft(q);
                  setPage(1);
                }}
                className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-4 py-1.5 md:py-2 rounded-full border transition-all ${query === q ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" : "bg-white border-zinc-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50"}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS HEADER ──────────────────────────── */}
        <div className="s1 flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6 md:mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Results for{" "}
              <span className="text-emerald-600 italic">"{query}"</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-2 font-medium">
              <span className="font-black text-slate-900">
                {results.length}
              </span>{" "}
              products found
              {filt.maxDist < 10 && (
                <>
                  {" "}
                  within{" "}
                  <span className="text-emerald-600 font-black">
                    {filt.maxDist} km
                  </span>
                </>
              )}{" "}
              · Koramangala, Bengaluru
            </p>
          </div>

          {/* Sort + view */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-full p-1.5 shadow-sm">
              {SORTS.map((s) => (
                <button
                  key={s.k}
                  onClick={() => {
                    setSort(s.k);
                    setPage(1);
                  }}
                  className={`spill text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-2 md:px-4 md:py-2.5 rounded-full transition-all ${sort === s.k ? "active" : "text-slate-500"}`}
                >
                  {s.l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-1.5 shadow-sm hidden sm:flex">
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
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all ${view === m ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900 hover:bg-slate-200/50"}`}
                >
                  <Ic d={ic} c="w-4 h-4" sw={2.5} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── FILTER BAR ──────────────────────────────── */}
        <div className="s2 mb-6 md:mb-8 bg-zinc-50/50 backdrop-blur-md p-4 md:p-5 rounded-[1.5rem] border border-zinc-100 relative z-[100] shadow-sm">
          <div className="flex items-center gap-2 mb-3 md:hidden">
            <Ic d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" c="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Filters</span>
          </div>
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
        <div className="mt-8 md:mt-10 relative z-0">
          {paginated.length === 0 ? (
            <Empty q={query} onClear={clearFilters} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {paginated.map((p, i) => (
                <PCard key={p.id} p={p} i={i} query={query} />
              ))}
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {paginated.map((p, i) => (
                <div
                  key={p.id}
                  className={`pcard bg-white border border-zinc-100 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex gap-4 md:gap-6 cursor-pointer s${Math.min(i, 5)} hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-xl md:rounded-3xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0 relative">
                    <img loading="lazy" decoding="async"
                      src={p.img}
                      alt={p.name}
                      className="cimg w-full h-full object-cover"
                    />
                    {!p.stock && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-900 uppercase border-2 border-slate-900 px-2 py-1 rounded-full bg-white/50">
                          OOS
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
                      {p.brand}
                    </p>
                    <h3
                      className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 leading-snug mb-2"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                      <Stars r={p.rating} />
                      <span className="text-[10px] md:text-xs text-slate-900 font-black">
                        {p.rating}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">
                        ({p.reviews.toLocaleString()} Reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 flex-wrap text-[10px] md:text-xs font-bold text-slate-500 mt-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-lg md:text-2xl text-slate-900">
                          {fmt(p.price)}
                        </span>
                        {pct(p.price, p.orig) > 0 && (
                          <>
                            <span className="line-through text-slate-400">
                              {fmt(p.orig)}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                              -{pct(p.price, p.orig)}%
                            </span>
                          </>
                        )}
                      </div>
                      <span className="hidden sm:inline text-zinc-300">|</span>
                      <span className="flex items-center gap-1 uppercase tracking-wider"><Ic d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" c="w-3.5 h-3.5" /> {p.seller}</span>
                      <span className="hidden sm:inline text-zinc-300">|</span>
                      <span className="flex items-center gap-1 uppercase tracking-wider"><Ic d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" c="w-3.5 h-3.5" /> {p.dist} km</span>
                      <span className="hidden sm:inline text-zinc-300">|</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                        <Ic d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" c="w-3.5 h-3.5" /> {p.eta} min
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end gap-3 shrink-0 ml-2 hidden sm:flex">
                    {p.badge && (
                      <span
                        className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border text-center ${BC[p.badge]}`}
                      >
                        {p.badge}
                      </span>
                    )}
                    <button
                      disabled={!p.stock}
                      className="cbtn py-3 px-6 md:px-8 text-[10px] md:text-xs font-black uppercase tracking-widest border-2 border-slate-900 text-slate-900 rounded-full disabled:opacity-40 hover:bg-slate-50 bg-white shadow-sm mt-auto"
                    >
                      Add to Cart
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
          <p className="text-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 mt-8 md:mt-12">
            Showing {(page - 1) * PER_PAGE + 1}–
            {Math.min(page * PER_PAGE, results.length)} of {results.length}{" "}
            results
          </p>
        )}
      </div>
    </div>
  );
}