import SellerNode from '../models/sellerNodes/sellerNode.model.js';
import mongoose from 'mongoose';

/**
 * Service for handling geospatial queries and location intelligence.
 */
class LocationService {
    /**
     * Finds seller nodes within a given radius using MongoDB geospatial queries.
     * @param {Number} latitude - The user's latitude
     * @param {Number} longitude - The user's longitude
     * @param {Number} radiusMeters - The search radius in meters (default 5000m)
     * @returns {Promise<Array>} List of seller nodes with distance information
     */
    async getNearbySellerNodes(latitude, longitude, radiusMeters = 5000) {
        const lat = Number(latitude);
        const lng = Number(longitude);

        // Validate coordinates
        if (isNaN(lat) || lat < -90 || lat > 90) return [];
        if (isNaN(lng) || lng < -180 || lng > 180) return [];
        if (isNaN(radiusMeters) || radiusMeters <= 0) radiusMeters = 5000;

        try {
            const nearbyNodes = await SellerNode.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [lng, lat]
                        },
                        distanceField: "distanceMeters",
                        maxDistance: radiusMeters,
                        spherical: true,
                        query: {
                            status: "ACTIVE",
                            isDeactivated: false
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        distanceMeters: 1
                    }
                }
            ]);

            return nearbyNodes;
        } catch (error) {
            console.error("LocationService error: getNearbySellerNodes failed", error);
            // Fallback in case the index is missing or other db error occurs
            return [];
        }
    }
}

export default new LocationService();
