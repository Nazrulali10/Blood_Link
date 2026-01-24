export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OTP from '@/models/OTP';

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

            // Send Email (Mock)
            console.log(`[MOCK EMAIL SERVICE] Sending OTP ${generatedOtp} to ${email}`);

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
