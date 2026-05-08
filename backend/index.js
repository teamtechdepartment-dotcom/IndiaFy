import 'dotenv/config';
import express from "express";
import { databaseConfig } from "./config/db.config.js";
import app from "./app.js";
import https from 'https';
import http from 'http';
import { initSocket } from './utils/socket.js';

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start listening FIRST so the process stays alive
server.listen(PORT, () => {
    console.log(`Server run on Port: ${PORT}`);
    // Then attempt DB connection with retry
    connectWithRetry();

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
    } catch (err) {
        console.error("DB connection attempt failed, retrying in 10s...");
        setTimeout(connectWithRetry, 10000);
    }
}
