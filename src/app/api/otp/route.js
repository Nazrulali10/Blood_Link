export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OTP from '@/models/OTP';
import { sendEmail } from '@/utils/notifications';

console.log("[API/OTP] Module loaded");

export async function POST(req) {
    try {
        console.log("Mongo URI:", process.env.MONGODB_URI);
        console.log("🔥 OTP API HIT");
        await dbConnect();

        const body = await req.json();
        const { email, otp, type } = body;

        console.log(`[API/OTP] Received request: ${type} for ${email}`);

        if (type === 'send') {
            if (!email) {
                return NextResponse.json({ error: 'Email is required' }, { status: 400 });
            }

            // Generate OTP
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

            // Delete existing OTPs for this email to prevent spam/dupes
            await OTP.deleteMany({ email });

            // Create new OTP
            await OTP.create({ email, otp: generatedOtp });

            // Send actual email
            const emailSubject = "Your BloodLink OTP Verification Code";
            const emailHtml = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #dc2626;">BloodLink Verification</h2>
                    <p>Your OTP verification code is:</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h1 style="margin: 0; letter-spacing: 5px; color: #1f2937;">${generatedOtp}</h1>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `;

            await sendEmail(email, emailSubject, emailHtml).catch(e => console.error("OTP Email Error:", e));

            return NextResponse.json({ message: 'OTP sent successfully' });
        }

        if (type === 'verify') {
            if (!email || !otp) {
                return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
            }

            const record = await OTP.findOne({ email, otp });
            if (!record) {
                return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
            }

            // Should initiate registration or return success token
            // For now, we just verify it exists. We can verify it again in registration OR assume client flow (secure enough for prototype)
            // Clean up used OTP
            await OTP.deleteOne({ _id: record._id });

            return NextResponse.json({ message: 'OTP verified' });
        }

        return NextResponse.json({ error: 'Invalid type provided' }, { status: 400 });

    } catch (error) {
        console.error("OTP API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
