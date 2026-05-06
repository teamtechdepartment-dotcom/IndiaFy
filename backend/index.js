import 'dotenv/config';
import express from "express";
import { databaseConfig } from "./config/db.config.js";
import app from "./app.js";
import https from 'https';
import http from 'http';

const PORT = process.env.PORT || 8000;

// Start listening FIRST so the process stays alive
app.listen(PORT, () => {
    console.log(`Server run on Port: ${PORT}`);
    // Then attempt DB connection with retry
    connectWithRetry();

    // Self-pinging to keep server awake (optional)
    // Enable by setting SERVER_URL. Interval is configurable via KEEP_ALIVE_INTERVAL_MS
    const url = process.env.SERVER_URL;
    if (url) {
        const protocol = url.startsWith('https') ? https : http;
        const intervalMs = Number(process.env.KEEP_ALIVE_INTERVAL_MS) || 5 * 60 * 1000; // default 5 minutes
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
