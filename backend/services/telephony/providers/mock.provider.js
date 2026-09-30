import BaseTelephonyProvider from "./base.provider.js";
import crypto from "crypto";

class MockTelephonyProvider extends BaseTelephonyProvider {
    init() {
        console.log("[Telephony] Mock provider initialized.");
    }

    async initiateCall(params) {
        console.log(`[Telephony Mock] initiateCall to ${params.to} for callback ${params.callbackId}`);
        return {
            providerCallId: `mock_${crypto.randomBytes(8).toString("hex")}`,
            status: "calling",
        };
    }

    async getCallStatus(providerCallId) {
        return "connected";
    }

    async hangupCall(providerCallId) {
        console.log(`[Telephony Mock] hangupCall ${providerCallId}`);
        return true;
    }

    verifyWebhookSignature(req) {
        // In a real mock test, you might accept everything or use a dummy secret
        return true;
    }

    normalizeWebhook(payload) {
        // Assume the payload is whatever we send in our test requests
        return {
            providerCallId: payload.providerCallId,
            status: payload.status,
            durationSeconds: payload.duration || 0,
            metadata: payload,
        };
    }
}

export default MockTelephonyProvider;
