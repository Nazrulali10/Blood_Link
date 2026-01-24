import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

// Initialize Firebase Admin (Singleton)
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            console.log("[Notifications] Firebase Admin initialized successfully.");
        } else {
            console.warn("[Notifications] Firebase credentials missing. Push notifications will be skipped.");
        }
    } catch (error) {
        console.error("[Notifications] Error initializing Firebase Admin:", error);
    }
}

// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail(to, subject, html) {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("[Notifications] SMTP credentials missing. Email skipped.");
            return false;
        }

        const info = await transporter.sendMail({
            from: `"BloodLink AI" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`[Notifications] Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("[Notifications] Error sending email:", error);
        return false;
    }
}

export async function sendPushNotification(tokens, title, body, data = {}) {
    try {
        if (!tokens || tokens.length === 0) return;

        // Filter out invalid/empty tokens
        const validTokens = tokens.filter(t => t && t.length > 10);
        if (validTokens.length === 0) return;

        if (!admin.apps.length) {
            console.warn("[Notifications] Firebase not initialized. Push skipped.");
            return;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: data,
            tokens: validTokens,
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log(`[Notifications] Push sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);

        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(validTokens[idx]);
                }
            });
            console.log('[Notifications] List of tokens that caused failures: ' + failedTokens);
        }

        return response;
    } catch (error) {
        console.error("[Notifications] Error sending push notification:", error);
        return null;
    }
}
