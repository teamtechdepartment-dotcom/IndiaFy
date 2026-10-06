import BaseTelephonyProvider from "./base.provider.js";

class EdesyTelephonyProvider extends BaseTelephonyProvider {
    init() {
        // Warning: Edesy is a SaaS digital innovation platform (e.g. CRM, AI Voice Agents).
        // It is NOT a raw CPaaS telephony provider like Twilio/Exotel.
        // It does not fit the standard "make a raw PSTN call and handle webhook events" model natively.
        console.log("[Telephony] Edesy adapter loaded (INCOMPATIBLE).");
    }

    async initiateCall(params) {
        throw new Error("Edesy is not a CPaaS provider. Use Exotel or Plivo instead.");
    }

    async getCallStatus(providerCallId) {
        throw new Error("Not implemented");
    }

    async hangupCall(providerCallId) {
        throw new Error("Not implemented");
    }

    verifyWebhookSignature(req) {
        throw new Error("Not implemented");
    }

    normalizeWebhook(payload) {
        throw new Error("Not implemented");
    }
}

export default EdesyTelephonyProvider;
