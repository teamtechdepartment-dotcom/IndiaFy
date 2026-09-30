import React, { useEffect, memo, useMemo } from 'react';
import { useRecommendationStore } from '../../store/recommendationStore';
import { ProductSkeleton } from '../ui/skeletons/ProductSkeleton';
import ProductCard from '../Category/ProductCard';
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PersonalizedRecommendations = memo(() => {
    const { recommendations, loading, error, context, getRecommendations } = useRecommendationStore();
    const navigate = useNavigate();

    useEffect(() => {
        // Defer fetch to avoid blocking critical render
        const fetchRecommendations = () => {
            getRecommendations('', 10);
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(fetchRecommendations, { timeout: 2000 });
        } else {
            setTimeout(fetchRecommendations, 500);
        }
    }, [getRecommendations]);

    if (error) {
        return null; // Fallback behavior: hide gracefully
    }

    if (loading) {
        return (
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white border-b border-gray-100" role="status" aria-label="Loading recommendations">
                <div className="flex items-center gap-3 mb-4 pb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recommended For You</h2>
                </div>
                <ProductSkeleton count={5} variant="grid" />
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null; // Empty response handling
    }

    // Determine context-aware title
    let title = "Popular Picks";
    if (context) {
        if (context.hasSessionInterest || context.hasPersistentInterest) {
            title = "Recommended For You";
        } else if (context.hasLocation) {
            title = "Popular Near You";
        }
    }

    // Map backend response to ProductCard props
    const mappedProducts = useMemo(() => recommendations.map(p => ({
        id: p._id,
        name: p.productName,
        brand: p.brand || 'IndiaFy',
        img: p.productImage && p.productImage.length > 0 ? p.productImage[0] : (p.thumbnail || ''),
        price: p.attribute?.salePrice || 0,
        original: p.attribute?.mrpPrice || p.attribute?.salePrice || 0,
        rating: p.ratingAverage || 4.5,
        reviews: p.ratingCount || 0,
        badge: p.isBestseller ? "Best Seller" : (p.discountPercentage > 20 ? "Hot Deal" : null),
        eta: "30 mins",
    })), [recommendations]);

    return (
        <section className="bg-white px-2 py-4 border-b border-gray-100">
            <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
                <div className="flex items-center justify-between mb-4 pb-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
                    </div>
                    
                    <button
                        onClick={() => navigate("/search")}
                        className="flex items-center justify-center bg-[#065F46] text-white w-7 h-7 rounded-full hover:bg-[#047857] transition-colors shadow-sm"
                        aria-label="View All"
                    >
                        <ArrowRight size={16} />
                    </button>
                </div>
                
                <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
                    {mappedProducts.map((product) => (
                        <div key={product.id} className="flex-none w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] snap-start">
                            <ProductCard product={product} viewMode="grid" source="recommendation" surface="homepage_recommendation" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

PersonalizedRecommendations.displayName = 'PersonalizedRecommendations';

export default PersonalizedRecommendations;
