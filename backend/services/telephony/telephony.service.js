import MockTelephonyProvider from "./providers/mock.provider.js";
import ExotelTelephonyProvider from "./providers/exotel.provider.js";
// import TwilioTelephonyProvider from "./providers/twilio.provider.js"; // Future implementation

class TelephonyService {
    constructor() {
        this.enabled = process.env.TELEPHONY_ENABLED === "true";
        this.providerName = process.env.TELEPHONY_PROVIDER || "mock";
        this.provider = null;

        if (this.enabled) {
            this._initializeProvider();
        }
    }

    _initializeProvider() {
        switch (this.providerName.toLowerCase()) {
            case "mock":
                this.provider = new MockTelephonyProvider();
                break;
            case "exotel":
                this.provider = new ExotelTelephonyProvider();
                break;
            // case "twilio":
            //     this.provider = new TwilioTelephonyProvider();
            //     break;
            default:
                throw new Error(`[Telephony] Unknown provider specified: ${this.providerName}`);
        }
        
        // This will throw if required env variables are missing for the specific provider
        this.provider.init();
    }

    isEnabled() {
        return this.enabled;
    }

    async initiateCall(params) {
        if (!this.enabled) {
            return {
                providerCallId: null,
                status: "telephony_disabled"
            };
        }
        return await this.provider.initiateCall(params);
    }

    async getCallStatus(providerCallId) {
        if (!this.enabled) return null;
        return await this.provider.getCallStatus(providerCallId);
    }

    async hangupCall(providerCallId) {
        if (!this.enabled) return false;
        return await this.provider.hangupCall(providerCallId);
    }

    verifyWebhookSignature(req) {
        if (!this.enabled) return false;
        return this.provider.verifyWebhookSignature(req);
    }

    normalizeWebhook(payload) {
        if (!this.enabled) return null;
        return this.provider.normalizeWebhook(payload);
    }
}

// Export a singleton instance
const telephonyService = new TelephonyService();
export default telephonyService;
