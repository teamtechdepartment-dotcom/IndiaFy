// Indiafy Backend Server - Reloaded
import 'dotenv/config';
import express from "express";
import { databaseConfig } from "./config/db.config.js";
import app from "./app.js";
import https from 'https';
import http from 'http';
import { initSocket } from './utils/socket.js';
import { processEmailQueue } from './services/emailService.js';

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start listening FIRST so the process stays alive
server.listen(PORT, () => {
    console.log(`Server run on Port: ${PORT}`);
    // Then attempt DB connection with retry
    connectWithRetry();

    // Start background email queue processor (every 60s)
    setInterval(() => {
        processEmailQueue().catch(err => console.error("Error in background email queue:", err.message));
    }, 60000);

    // Self-pinging to keep server awake
    // Enable by setting SERVER_URL. Defaults to your Render URL. Interval is configurable via KEEP_ALIVE_INTERVAL_MS
    const url = process.env.SERVER_URL || "https://indiafy-1.onrender.com";
    if (url) {
        const protocol = url.startsWith('https') ? https : http;
        const intervalMs = Number(process.env.KEEP_ALIVE_INTERVAL_MS) || 3 * 60 * 1000; // default 3 minutes (180,000 ms)
        console.log(`Self-ping enabled for ${url}/health every ${intervalMs}ms`);
        setInterval(() => {
            protocol.get(`${url}/health`, (res) => {
                console.log(`Self-ping status: ${res.statusCode}`);
            }).on('error', (err) => {
                console.error(`Self-ping error: ${err.message}`);
            });
        }, intervalMs);
    }
});

async function connectWithRetry() {
    try {
        await databaseConfig();
        // Run seeder after successful connection
        if (process.env.NODE_ENV !== "production") {
            const { seedDatabase } = await import('./services/seeder.service.js');
            await seedDatabase(false);
        }

        // Run DB Migration to match new ACTIVE enums format
        const { default: SellerNode } = await import('./models/sellerNodes/sellerNode.model.js');
        const { default: SellerModel } = await import('./models/sellers/auth.model.js');

        await SellerNode.updateMany(
            { status: { $in: ["approved", "APPROVED"] } },
            { 
                $set: { 
                    status: "ACTIVE", 
                    isActive: true,
                    "approval.status": "APPROVED" 
                } 
            }
        );

        const activeNodes = await SellerNode.find({ status: "ACTIVE" });
        const sellerIds = activeNodes.map(n => n.seller);
        if (sellerIds.length > 0) {
            await SellerModel.updateMany(
                { _id: { $in: sellerIds } },
                { $set: { isApproved: true, status: "active" } }
            );
        }

        // Drop legacy unique index on SellerProfile.contact (was causing 500 errors)
        try {
            const { default: SellerProfile } = await import('./models/sellers/profile.model.js');
            const indexes = await SellerProfile.collection.indexes();
            const contactIndex = indexes.find(idx => idx.key && idx.key.contact && idx.unique);
            if (contactIndex) {
                await SellerProfile.collection.dropIndex(contactIndex.name);
                console.log("✅ Dropped legacy unique index on SellerProfile.contact");
            }
        } catch (indexErr) {
            // Index may already be dropped or not exist — safe to ignore
            if (!indexErr.message?.includes("index not found")) {
                console.warn("⚠️ Could not drop SellerProfile contact index:", indexErr.message);
            }
        }
    } catch (err) {
        console.error("DB connection attempt failed, retrying in 10s...", err.message);
        setTimeout(connectWithRetry, 10000);
    }
}
