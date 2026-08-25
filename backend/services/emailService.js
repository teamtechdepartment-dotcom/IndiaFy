import nodemailer from "nodemailer";
import EmailQueue from "../models/notifications/emailQueue.model.js";

// Initialize SMTP transporter
const getTransporter = () => {
    const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
    const port = parseInt(process.env.SMTP_PORT || "587");
    // Fallbacks to default user/pass configured in the .env if direct credentials aren't set
    const user = process.env.SMTP_USER || process.env.companyEmail || ""; 
    const pass = process.env.SMTP_PASS || process.env.BREVO_API_KEY || "";

    if (!user || !pass || pass.startsWith("your_") || user.startsWith("your_")) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass
        },
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === "production" // Only enforce in production
        }
    });
};

/**
 * Queue an email for background sending.
 * Immediately attempts to send without blocking execution.
 */
export const queueEmail = async (to, subject, html) => {
    try {
        const queueItem = await EmailQueue.create({
            to,
            subject,
            html,
            status: "pending",
            nextAttemptAt: new Date()
        });

        // Trigger immediate send in background
        sendEmailDirect(queueItem._id).catch(err => {
            console.warn(`[Email Service] Immediate send failed for queue item ${queueItem._id}:`, err.message);
        });

        return queueItem;
    } catch (err) {
        console.warn("[Email Service] Failed to queue email:", err.message);
        // Do not throw error, never block store creation if email queue database operation fails
        return null;
    }
};

/**
 * Sends a queued email directly, handling status updates and retries.
 */
export const sendEmailDirect = async (queueItemId) => {
    const queueItem = await EmailQueue.findById(queueItemId);
    if (!queueItem || queueItem.status === "sent" || queueItem.status === "failed") {
        return;
    }

    const transporter = getTransporter();
    if (!transporter) {
        queueItem.status = "failed";
        queueItem.lastError = "SMTP credentials not configured or placeholder detected";
        await queueItem.save();
        console.warn(`[Email Service] Skipping email to ${queueItem.to}: SMTP credentials not configured.`);
        return;
    }

    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || `"Indiafy Admin" <${process.env.companyEmail || "noreply@indiafy.com"}>`,
            to: queueItem.to,
            subject: queueItem.subject,
            html: queueItem.html
        };

        // Try to send
        await transporter.sendMail(mailOptions);

        // Success -> Mark as sent
        queueItem.status = "sent";
        queueItem.attempts += 1;
        await queueItem.save();
        console.log(`[Email Service] Email sent successfully to ${queueItem.to}`);
    } catch (error) {
        console.warn(`[Email Service] Email sending error to ${queueItem.to}:`, error.message);
        
        queueItem.attempts += 1;
        queueItem.lastError = error.message;

        const isAuthError = error.responseCode === 535 || error.message.includes("535") || error.message.includes("Authentication failed") || error.message.includes("Invalid login");

        if (queueItem.attempts >= queueItem.maxAttempts || isAuthError) {
            queueItem.status = "failed";
            console.warn(`[Email Service] Email to ${queueItem.to} marked as failed (${isAuthError ? "Auth failure" : "Max retries reached"}).`);
        } else {
            queueItem.status = "retry";
            // Exponential backoff: retry in 5, 10, 20... minutes
            const backoffMinutes = 5 * Math.pow(2, queueItem.attempts - 1);
            queueItem.nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
            console.log(`[Email Service] Email queued for retry to ${queueItem.to} in ${backoffMinutes} minutes.`);
        }

        await queueItem.save();
    }
};

/**
 * Background worker to pick up retry/pending items and process them.
 */
export const processEmailQueue = async () => {
    try {
        const now = new Date();
        const items = await EmailQueue.find({
            status: { $in: ["pending", "retry"] },
            nextAttemptAt: { $lte: now }
        }).limit(10); // Process 10 emails per run

        if (items.length > 0) {
            for (const item of items) {
                await sendEmailDirect(item._id);
            }
        }
    } catch (error) {
        console.warn("[Email Service] Email queue process loop error:", error.message);
    }
};

/**
 * Generate standard HTML templates.
 */
export const getOnboardingTemplate = ({ sellerName, storeName, nodeType, phone, email, address, documentLinks }) => {
    const docsList = Object.entries(documentLinks)
        .map(([name, url]) => {
            const formattedName = name.replace(/([A-Z])/g, " $1").trim().toUpperCase();
            return `<li><strong>${formattedName}:</strong> <a href="${url}" target="_blank" style="color: #3B82F6;">View Document</a></li>`;
        })
        .join("");

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #0F172A; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; margin-bottom: 20px;">New Seller Application Received</h2>
            <p style="font-size: 14px; color: #475569;">A new merchant has submitted an onboarding application on the Indiafy platform. Please review the details below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f8fafc;">
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Seller Name</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${sellerName}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Store Name</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${storeName}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Node Type</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${nodeType.replace(/_/g, " ")}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Phone</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${phone}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${email}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Address</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${address}</td>
                </tr>
            </table>

            <h3 style="color: #0F172A; margin-top: 24px;">Uploaded Verification Documents</h3>
            <ul style="padding-left: 20px; line-height: 1.6; font-size: 13px; color: #334155;">
                ${docsList}
            </ul>

            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <p style="font-size: 11px; color: #94a3b8;">This email was auto-generated by the Indiafy Compliance System.</p>
            </div>
        </div>
    `;
};

export const getApprovalTemplate = ({ sellerName, storeName }) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #ECFDF5; border-radius: 50%; padding: 12px;">
                    <span style="font-size: 32px; color: #10B981;">🎉</span>
                </div>
            </div>
            <h2 style="color: #10B981; text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">Your Store Has Been Approved!</h2>
            <p style="font-size: 14px; color: #334155; line-height: 1.5;">Dear ${sellerName},</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.5;">We are thrilled to inform you that your application for <strong>${storeName}</strong> has been audited and approved by the Indiafy compliance board.</p>
            
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; font-weight: bold; color: #475569;">UNLOCKED CAPABILITIES:</p>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
                    <li>Access your Seller Dashboard Console</li>
                    <li>Add/import products and manage listings</li>
                    <li>Update inventory stock parameters</li>
                    <li>Fulfill incoming orders</li>
                </ul>
            </div>

            <p style="font-size: 14px; color: #334155; line-height: 1.5;">Please log in to your dashboard to activate your inventory listings and set up operating hours.</p>

            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <p style="font-size: 11px; color: #94a3b8;">Indiafy Merchant Services & Compliance Board</p>
            </div>
        </div>
    `;
};

export const getRejectionTemplate = ({ sellerName, storeName, reason }) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #FEF2F2; border-radius: 50%; padding: 12px;">
                    <span style="font-size: 32px; color: #EF4444;">⚠️</span>
                </div>
            </div>
            <h2 style="color: #EF4444; text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">Your Seller Application Was Rejected</h2>
            <p style="font-size: 14px; color: #334155; line-height: 1.5;">Dear ${sellerName},</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.5;">We regret to inform you that your application for <strong>${storeName}</strong> could not be verified at this time.</p>
            
            <div style="background-color: #FEF2F2; border: 1px solid #FEE2E2; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; font-weight: bold; color: #B91C1C;">REASON FOR REJECTION:</p>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #B91C1C; line-height: 1.5; font-style: italic;">
                    "${reason}"
                </p>
            </div>

            <p style="font-size: 14px; color: #334155; line-height: 1.5;">If you believe this was in error or you have corrected the documents, please contact support or re-apply from the seller portal.</p>

            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <p style="font-size: 11px; color: #94a3b8;">Indiafy Merchant Services & Compliance Board</p>
            </div>
        </div>
    `;
};
