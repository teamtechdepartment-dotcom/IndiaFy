import BaseTelephonyProvider from "./base.provider.js";
import crypto from "crypto";

class PlivoTelephonyProvider extends BaseTelephonyProvider {
    init() {
        this.authId = process.env.PLIVO_AUTH_ID;
        this.authToken = process.env.PLIVO_AUTH_TOKEN;
        this.phoneNumber = process.env.PLIVO_PHONE_NUMBER;

        console.log("[Telephony] Plivo provider adapter loaded.");
    }

    async initiateCall(params) {
        // Plivo uses POST /v1/Account/{auth_id}/Call/
        // Needs proper India data region and business KYC
        throw new Error("initiateCall() not implemented for Plivo yet.");
    }

    async getCallStatus(providerCallId) {
        throw new Error("getCallStatus() not implemented for Plivo yet.");
    }

    async hangupCall(providerCallId) {
        throw new Error("hangupCall() not implemented for Plivo yet.");
    }

    verifyWebhookSignature(req) {
        // Plivo V3 signature verification:
        // HMAC SHA256 of (BaseURL + "." + Nonce) using Auth Token, compared to X-Plivo-Signature-V3
        throw new Error("verifyWebhookSignature() not implemented for Plivo yet.");
    }

    normalizeWebhook(payload) {
        throw new Error("normalizeWebhook() not implemented for Plivo yet.");
    }
}

export default PlivoTelephonyProvider;
