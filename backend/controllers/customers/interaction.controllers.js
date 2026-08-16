import { processInteractionBatch, getCombinedInterestProfile } from "../../services/interaction.service.js";

/**
 * @desc    Process a batch of interaction events
 * @route   POST /api/v1/indiafy/interactions/batch
 * @access  Public (accepts anonymous sessions)
 */
export const trackInteractions = async (req, res) => {
    try {
        const { events, sessionId, anonymousId } = req.body;
        
        // Ensure sessionId is present (usually sent by frontend InteractionStore)
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Session ID is required" });
        }

        // Customer ID if logged in (usually set by middleware if token exists, or sent in body)
        // We'll trust req.user if requiredLogin middleware was used, or req.body.customerId for hybrid
        let customerId = null;
        if (req.user && req.user._id) {
            customerId = req.user._id;
        }

        // Fire and forget: We don't need to block the client response
        processInteractionBatch(events, customerId, sessionId, anonymousId).catch(err => {
            console.error("Failed to process interaction batch:", err);
        });

        // Respond immediately to keep tracking fast
        return res.status(202).json({ success: true, message: "Batch queued for processing" });
    } catch (error) {
        console.error("Interaction Tracking Error:", error);
        return res.status(500).json({ success: false, message: "Failed to track interactions" });
    }
};

/**
 * @desc    Get aggregated interest profile for a session/customer (For testing/verification)
 * @route   GET /api/v1/indiafy/interactions/profile
 * @access  Public
 */
export const getProfile = async (req, res) => {
    try {
        const { sessionId, anonymousId } = req.query;
        let customerId = null;
        if (req.user && req.user._id) {
            customerId = req.user._id;
        }

        if (!sessionId && !anonymousId && !customerId) {
            return res.status(400).json({ success: false, message: "Identity required" });
        }

        const profile = await getCombinedInterestProfile(customerId, anonymousId, sessionId);
        
        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch interest profile" });
    }
};
