class BaseTelephonyProvider {
    constructor() {
        if (new.target === BaseTelephonyProvider) {
            throw new Error("Cannot instantiate BaseTelephonyProvider directly.");
        }
    }

    /**
     * Initializes the provider with configuration.
     * Throws an error if required config is missing.
     */
    init() {
        throw new Error("init() must be implemented by provider");
    }

    /**
     * Initiates an outbound call.
     * @param {Object} params
     * @param {String} params.to - The destination phone number.
     * @param {String} params.from - The source phone number (provider number).
     * @param {String} params.callbackId - Internal SupportCallLog ID.
     * @param {String} params.agentId - The agent making the call.
     * @returns {Promise<Object>} - The normalized call result: { providerCallId, status }
     */
    async initiateCall(params) {
        throw new Error("initiateCall() must be implemented by provider");
    }

    /**
     * Fetches current call status from the provider.
     * @param {String} providerCallId - The provider's unique call ID.
     * @returns {Promise<String>} - Normalized status (calling, connected, completed, failed, missed)
     */
    async getCallStatus(providerCallId) {
        throw new Error("getCallStatus() must be implemented by provider");
    }

    /**
     * Hangs up an active call.
     * @param {String} providerCallId 
     */
    async hangupCall(providerCallId) {
        throw new Error("hangupCall() must be implemented by provider");
    }

    /**
     * Verifies if a webhook request actually came from the provider.
     * @param {Object} req - The Express request object.
     * @returns {Boolean}
     */
    verifyWebhookSignature(req) {
        throw new Error("verifyWebhookSignature() must be implemented by provider");
    }

    /**
     * Normalizes the provider's webhook payload into our internal schema.
     * @param {Object} payload - The raw webhook body.
     * @returns {Object} - { providerCallId, status, durationSeconds, metadata }
     */
    normalizeWebhook(payload) {
        throw new Error("normalizeWebhook() must be implemented by provider");
    }
}

export default BaseTelephonyProvider;
