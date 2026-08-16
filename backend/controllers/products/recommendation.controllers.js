import { getRecommendations } from "../../services/recommendation.service.js";

/**
 * @desc    Get personalized product recommendations
 * @route   GET /api/v1/recommendations
 * @access  Public (optional login)
 */
export const getPersonalizedRecommendations = async (req, res) => {
    try {
        const { latitude, longitude, sessionId, anonymousId, searchQuery, limit } = req.query;
        
        let customerId = null;
        // Securely extract authenticated user ID
        if (req.user && req.user._id) {
            customerId = req.user._id;
        }

        let parsedLimit = limit ? parseInt(limit, 10) : 20;
        if (isNaN(parsedLimit) || parsedLimit <= 0) parsedLimit = 20;
        if (parsedLimit > 50) parsedLimit = 50;

        const recommendations = await getRecommendations({
            latitude,
            longitude,
            sessionId,
            anonymousId,
            customerId,
            searchQuery,
            limit: parsedLimit
        });

        return res.status(200).json({
            success: true,
            data: recommendations.products,
            context: recommendations.context
        });
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate recommendations"
        });
    }
};
