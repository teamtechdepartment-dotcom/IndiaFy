import { memo } from "react";

const CATEGORIES = [
  { id: "fruits", name: "Fruits", img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&q=80" },
  { id: "vegetables", name: "Vegetables", img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100&q=80" },
  { id: "dairy", name: "Dairy & Milk", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&q=80" },
  { id: "snacks", name: "Munchies", img: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&q=80" },
  { id: "drinks", name: "Cold Drinks", img: "https://images.unsplash.com/photo-1527960471264-932f2efcebea?w=100&q=80" },
  { id: "bakery", name: "Bakery", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&q=80" },
  { id: "personal_care", name: "Personal Care", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&q=80" },
  { id: "home", name: "Home Needs", img: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=100&q=80" }
];

function CategoryRow() {
  return (
    <div className="bg-white pb-3 pt-1">
      <div className="flex overflow-x-auto gap-4 px-3 hide-scrollbar snap-x">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center gap-2 shrink-0 snap-start cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-gray-700 text-center w-16 leading-tight group-hover:text-[#00B55D] transition-colors">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(CategoryRow);
