import React, { useEffect, memo, useMemo } from 'react';
import { useRecommendationStore } from '../../../store/recommendationStore';
import { ProductSkeleton } from '../ui/skeletons/ProductSkeleton';
import ProductCard from '../Category/ProductCard';

const PersonalizedRecommendations = memo(() => {
    const { recommendations, loading, error, context, getRecommendations } = useRecommendationStore();

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
            <div className="py-12 max-w-7xl mx-auto px-4 bg-white mt-4" role="status" aria-label="Loading recommendations">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold text-[#212121]">Recommended For You</h2>
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
        brand: p.brand || 'Brand',
        img: p.productImage && p.productImage.length > 0 ? p.productImage[0] : (p.thumbnail || ''),
        price: p.attribute?.salePrice || 0,
        original: p.attribute?.mrpPrice || p.attribute?.salePrice || 0,
        rating: p.ratingAverage || 0,
        reviews: p.ratingCount || 0,
        badge: p.isBestseller ? "Best Seller" : (p.discountPercentage > 20 ? "Hot Deal" : null)
    })), [recommendations]);

    return (
        <section className="py-12 max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-[#212121]">{title}</h2>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mappedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode="grid" source="recommendation" surface="homepage_recommendation" />
                ))}
            </div>
        </section>
    );
});

PersonalizedRecommendations.displayName = 'PersonalizedRecommendations';

export default PersonalizedRecommendations;
