import React, { useEffect, useState, useMemo } from 'react';
import { useRecommendationStore } from '../../../store/recommendationStore';
import { ProductSkeleton } from '../ui/skeletons/ProductSkeleton';
import ProductCard from '../Category/ProductCard';

export default function SearchRecommendations({ query, organicIds = new Set() }) {
    const { recommendations, loading, error, getRecommendations, clearRecommendations } = useRecommendationStore();
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            clearRecommendations();
            return;
        }
        // Fetch recommendations restricted to 10 items initially on search page to allow deduplication buffer
        getRecommendations(debouncedQuery, 10);
    }, [debouncedQuery, getRecommendations, clearRecommendations]);

    // Ensure we don't leak memory with intervals or timers
    useEffect(() => {
        return () => clearRecommendations();
    }, [clearRecommendations]);

    // Deduplicate against organic search results (already visible on the page)
    const filteredRecommendations = useMemo(() => {
        if (!recommendations) return [];
        return recommendations.filter(p => !organicIds.has(p._id)).slice(0, 5); // display max 5
    }, [recommendations, organicIds]);

    if (error || !debouncedQuery || debouncedQuery.length < 2) {
        return null; // Fail gracefully
    }

    if (loading) {
        return (
            <div className="w-full mb-8 border-b border-gray-200 pb-8" role="status" aria-label="Loading search recommendations">
                <h2 className="text-xl font-bold text-[#212121] mb-4">Personalized Search Matches</h2>
                <ProductSkeleton count={4} variant="grid" />
            </div>
        );
    }

    if (!filteredRecommendations || filteredRecommendations.length === 0) {
        return null;
    }

    const mappedProducts = filteredRecommendations.map(p => ({
        id: p._id,
        name: p.productName,
        brand: p.brand || 'Brand',
        img: p.productImage && p.productImage.length > 0 ? p.productImage[0] : (p.thumbnail || ''),
        price: p.attribute?.salePrice || 0,
        original: p.attribute?.mrpPrice || p.attribute?.salePrice || 0,
        rating: p.ratingAverage || 0,
        reviews: p.ratingCount || 0,
        badge: "Top Pick"
    }));

    return (
        <div className="w-full mb-8 border-b border-gray-200 pb-8 bg-blue-50/30 p-4 rounded-xl">
            <h2 className="text-xl font-bold text-[#2874F0] mb-4 flex items-center gap-2">
                <span className="text-xl">✨</span> Top Personalized Matches
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mappedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode="grid" source="recommendation" surface="search_recommendation" />
                ))}
            </div>
        </div>
    );
}
