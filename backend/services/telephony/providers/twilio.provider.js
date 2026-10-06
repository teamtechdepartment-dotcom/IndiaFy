import BaseTelephonyProvider from "./base.provider.js";

class TwilioTelephonyProvider extends BaseTelephonyProvider {
    init() {
        // Warning: Twilio is generally not recommended for India local presence
        // due to TRAI regulations preventing easy acquisition of local Indian numbers.
        console.log("[Telephony] Twilio provider adapter loaded (NOT RECOMMENDED FOR INDIA).");
    }

    async initiateCall(params) {
        throw new Error("Twilio adapter not fully implemented due to India numbering constraints.");
    }

    async getCallStatus(providerCallId) {
        throw new Error("Not implemented");
    }

    async hangupCall(providerCallId) {
        throw new Error("Not implemented");
    }

    verifyWebhookSignature(req) {
        // Twilio verification: HMAC SHA1
        throw new Error("Not implemented");
    }

    normalizeWebhook(payload) {
        throw new Error("Not implemented");
    }
}

export default TwilioTelephonyProvider;
