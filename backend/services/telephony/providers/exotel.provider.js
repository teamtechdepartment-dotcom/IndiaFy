import BaseTelephonyProvider from "./base.provider.js";
import crypto from "crypto";
import axios from "axios";

class ExotelTelephonyProvider extends BaseTelephonyProvider {
    init() {
        this.apiKey = process.env.EXOTEL_API_KEY;
        this.apiToken = process.env.EXOTEL_API_TOKEN;
        this.accountSid = process.env.EXOTEL_ACCOUNT_SID;
        this.exophone = process.env.EXOTEL_EXOPHONE;
        this.baseUrl = process.env.EXOTEL_BASE_URL || "https://api.in.exotel.com";

        if (!this.apiKey || !this.apiToken || !this.accountSid || !this.exophone) {
            throw new Error("[Telephony] Missing Exotel credentials in environment variables.");
        }

        try {
            const url = new URL(this.baseUrl);
            if (url.protocol !== "https:") {
                throw new Error("Base URL must be HTTPS");
            }
        } catch (e) {
            if (e.message === "Base URL must be HTTPS") throw e;
            throw new Error("[Telephony] Invalid EXOTEL_BASE_URL");
        }

        console.log("[Telephony] Exotel provider adapter initialized.");
    }

    async initiateCall(params) {
        const auth = Buffer.from(`${this.apiKey}:${this.apiToken}`).toString('base64');
        const url = `${this.baseUrl}/v1/Accounts/${this.accountSid}/Calls/connect.json`;

        const formData = new URLSearchParams();
        formData.append("From", this.exophone); 
        formData.append("To", params.to);
        formData.append("CallerId", this.exophone);
        if (params.callbackId) {
            formData.append("CustomField", params.callbackId);
        }

        try {
            const response = await axios.post(url, formData.toString(), {
                headers: {
                    "Authorization": `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            const call = response.data?.Call;
            if (!call) {
                throw new Error("Malformed provider response");
            }

            return {
                providerCallId: call.Sid,
                status: this._mapStatus(call.Status),
                direction: "outbound",
                metadata: call // Not exposing credentials here
            };
        } catch (error) {
            console.error("[Telephony] Exotel initiateCall failed:", error.message);
            if (error.message === "Malformed provider response") throw error;
            throw new Error(error.response?.data?.message || "Exotel HTTP error");
        }
    }

    async getCallStatus(providerCallId) {
        const auth = Buffer.from(`${this.apiKey}:${this.apiToken}`).toString('base64');
        const url = `${this.baseUrl}/v1/Accounts/${this.accountSid}/Calls/${providerCallId}.json`;

        try {
            const response = await axios.get(url, {
                headers: {
                    "Authorization": `Basic ${auth}`
                }
            });
            const call = response.data?.Call;
            if (!call) return "unknown";
            return this._mapStatus(call.Status);
        } catch (error) {
            console.error("[Telephony] Exotel getCallStatus failed:", error.message);
            return "unknown";
        }
    }

    async hangupCall(providerCallId) {
        throw new Error("not supported by current adapter");
    }

    verifyWebhookSignature(req) {
        const signature = req.headers["x-exotel-signature"];
        if (!signature) return false;

        let payload = req.rawBody || ""; 
        if (!payload && req.body && typeof req.body === 'string') {
            payload = req.body;
        } else if (!payload && req.body && typeof req.body === 'object') {
            payload = new URLSearchParams(req.body).toString();
        }

        const expectedSignature = crypto.createHmac("sha256", this.apiToken)
                                        .update(payload)
                                        .digest("hex");
        
        const expectedHeader = `sha256=${expectedSignature}`;
        
        try {
            const sigBuf = Buffer.from(signature);
            const expectedBuf = Buffer.from(expectedHeader);
            if (sigBuf.length !== expectedBuf.length) return false;
            return crypto.timingSafeEqual(sigBuf, expectedBuf);
        } catch (e) {
            return false;
        }
    }

    normalizeWebhook(payload) {
        const providerCallId = payload.CallSid;
        const status = this._mapStatus(payload.Status);
        const durationSeconds = payload.Duration ? parseInt(payload.Duration, 10) : 0;

        return {
            providerCallId,
            status,
            durationSeconds,
            metadata: payload
        };
    }

    _mapStatus(exotelStatus) {
        if (!exotelStatus) return "unknown";
        switch(exotelStatus.toLowerCase()) {
            case "queued": return "calling";
            case "in-progress": return "connected";
            case "completed": return "completed";
            case "failed": return "failed";
            case "busy": return "failed";
            case "no-answer": return "missed";
            default: return "unknown";
        }
    }
}

export default ExotelTelephonyProvider;
