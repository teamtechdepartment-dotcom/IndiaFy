import 'dotenv/config';
import express from "express";
import { databaseConfig } from "./config/db.config.js";
import app from "./app.js";

const PORT = process.env.PORT || 8000;

// Start listening FIRST so the process stays alive
app.listen(PORT, () => {
    console.log(`Server run on Port: ${PORT}`);
    // Then attempt DB connection with retry
    connectWithRetry();
});

async function connectWithRetry() {
    try {
        await databaseConfig();
    } catch (err) {
        console.error("DB connection attempt failed, retrying in 10s...");
        setTimeout(connectWithRetry, 10000);
    }
}
