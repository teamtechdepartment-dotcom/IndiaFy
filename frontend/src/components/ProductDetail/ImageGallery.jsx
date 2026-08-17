/* eslint-disable react/prop-types */
import { memo, useState } from "react";
import { Heart, Share2 } from "lucide-react";

function ImageGallery({ images, productName = "Product" }) {
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 h-full">
      {/* Thumbnail Strip */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto custom-scrollbar lg:w-16 shrink-0 order-2 lg:order-1 px-1 py-1">
        {images.map((img, i) => (
          <button
            key={i}
            onMouseEnter={() => setActiveImg(i)}
            onClick={() => setActiveImg(i)}
            className={`w-14 h-14 shrink-0 rounded border-2 p-1 bg-white transition-all ${
              activeImg === i ? "border-[#2874F0]" : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <img src={img} alt={`${productName} thumbnail ${i + 1}`} className="w-full h-full object-contain" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 bg-white border border-gray-200 rounded flex items-center justify-center p-4 min-h-[300px] lg:min-h-[500px] group order-1 lg:order-2 overflow-hidden cursor-crosshair">
        <img
          src={images[activeImg]}
          alt={productName}
          className="max-w-full max-h-full object-contain group-hover:scale-150 transition-transform duration-500 ease-out origin-center"
        />
        
        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-[#ff4343] hover:shadow-md transition-all">
            <Heart size={18} />
          </button>
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-[#2874F0] hover:shadow-md transition-all">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ImageGallery);
