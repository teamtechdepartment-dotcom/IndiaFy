import ExotelTelephonyProvider from "../services/telephony/providers/exotel.provider.js";
import axios from "axios";
import crypto from "crypto";
import { jest } from "@jest/globals";

describe("ExotelTelephonyProvider", () => {
    let provider;

    
    const validEnv = {
        EXOTEL_API_KEY: "test_key",
        EXOTEL_API_TOKEN: "test_token",
        EXOTEL_ACCOUNT_SID: "test_sid",
        EXOTEL_EXOPHONE: "0987654321",
        EXOTEL_BASE_URL: "https://api.in.exotel.com"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(axios, "post").mockImplementation(() => Promise.resolve());
        jest.spyOn(axios, "get").mockImplementation(() => Promise.resolve());
        process.env = { ...process.env, ...validEnv };
    });

    describe("Initialization", () => {
        it("should initialize successfully with valid credentials", () => {
            provider = new ExotelTelephonyProvider();
            expect(() => provider.init()).not.toThrow();
            expect(provider.apiKey).toBe("test_key");
        });

        it("should fail initialization if missing credentials", () => {
            delete process.env.EXOTEL_API_KEY;
            provider = new ExotelTelephonyProvider();
            expect(() => provider.init()).toThrow("Missing Exotel credentials");
        });

        it("should fail initialization if EXOTEL_BASE_URL is not HTTPS", () => {
            process.env.EXOTEL_BASE_URL = "http://api.in.exotel.com";
            provider = new ExotelTelephonyProvider();
            expect(() => provider.init()).toThrow("Base URL must be HTTPS");
        });
    });

    describe("initiateCall", () => {
        beforeEach(() => {
            provider = new ExotelTelephonyProvider();
            provider.init();
        });

        it("should make correct HTTP request to Exotel API", async () => {
            axios.post.mockResolvedValueOnce({
                data: { Call: { Sid: "call_123", Status: "queued" } }
            });

            const result = await provider.initiateCall({
                to: "1234567890",
                from: "SupportSystem",
                callbackId: "cb_123",
                agentId: "agent_1"
            });

            expect(axios.post).toHaveBeenCalledTimes(1);
            
            const [url, data, config] = axios.post.mock.calls[0];
            
            // correct endpoint
            expect(url).toBe("https://api.in.exotel.com/v1/Accounts/test_sid/Calls/connect.json");
            
            // correct authentication
            const expectedAuth = Buffer.from("test_key:test_token").toString('base64');
            expect(config.headers["Authorization"]).toBe(`Basic ${expectedAuth}`);
            
            // correct outbound payload (form data)
            expect(data).toContain("From=0987654321"); // correct caller ID / From
            expect(data).toContain("To=1234567890"); // destination derived from backend callback
            expect(data).toContain("CallerId=0987654321");
            expect(data).toContain("CustomField=cb_123");

            // response normalization & queued mapping
            expect(result).toEqual({
                providerCallId: "call_123",
                status: "calling",
                direction: "outbound",
                metadata: { Sid: "call_123", Status: "queued" } // credentials never exposed in returned data
            });
        });

        it("should throw if provider HTTP error", async () => {
            axios.post.mockRejectedValueOnce({
                response: { data: { message: "Account limit exceeded" } }
            });

            await expect(provider.initiateCall({ to: "1234567890" })).rejects.toThrow("Account limit exceeded");
        });

        it("should throw if malformed provider response", async () => {
            axios.post.mockResolvedValueOnce({ data: { something: "else" } });
            await expect(provider.initiateCall({ to: "1234567890" })).rejects.toThrow("Malformed provider response");
        });
    });

    describe("Status Mapping", () => {
        beforeEach(() => {
            provider = new ExotelTelephonyProvider();
            provider.init();
        });

        it("should map queued to calling", () => {
            expect(provider._mapStatus("queued")).toBe("calling");
        });

        it("should map in-progress to connected", () => {
            expect(provider._mapStatus("in-progress")).toBe("connected");
        });

        it("should map completed to completed", () => {
            expect(provider._mapStatus("completed")).toBe("completed");
        });

        it("should map failed to failed", () => {
            expect(provider._mapStatus("failed")).toBe("failed");
        });

        it("should map busy to failed", () => {
            expect(provider._mapStatus("busy")).toBe("failed");
        });

        it("should map no-answer to missed", () => {
            expect(provider._mapStatus("no-answer")).toBe("missed");
        });

        it("should map unknown status to unknown", () => {
            expect(provider._mapStatus("weird-status")).toBe("unknown");
        });
    });

    describe("Webhook Verification", () => {
        beforeEach(() => {
            provider = new ExotelTelephonyProvider();
            provider.init();
        });

        it("should successfully verify a valid webhook signature", () => {
            const payload = "CallSid=123&Status=completed";
            const signature = crypto.createHmac("sha256", "test_token").update(payload).digest("hex");
            
            const req = {
                headers: { "x-exotel-signature": `sha256=${signature}` },
                rawBody: payload
            };

            expect(provider.verifyWebhookSignature(req)).toBe(true);
        });

        it("should fail verification for invalid webhook/authentication", () => {
            const req = {
                headers: { "x-exotel-signature": `sha256=wrong_signature` },
                rawBody: "payload"
            };

            expect(provider.verifyWebhookSignature(req)).toBe(false);
        });
    });

    describe("normalizeWebhook", () => {
        beforeEach(() => {
            provider = new ExotelTelephonyProvider();
            provider.init();
        });

        it("should normalize webhook payload and ignore recording URL", () => {
            const payload = {
                CallSid: "call_999",
                Status: "completed",
                Duration: "45",
                RecordingUrl: "http://example.com/recording.mp3"
            };

            const normalized = provider.normalizeWebhook(payload);
            expect(normalized.providerCallId).toBe("call_999");
            expect(normalized.status).toBe("completed");
            expect(normalized.durationSeconds).toBe(45);
            
            // no recording URL persisted/mapped in normalized primary fields
            expect(normalized.recordingUrl).toBeUndefined();
        });
    });
});
