import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import Request from '@/models/Request';
import Donor from "@/models/Donor";
import Requester from "@/models/Requester";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { findMatchingDonors } from '@/utils/ai-matching';
import { sendEmail, sendPushNotification } from '@/utils/notifications';

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const body = await req.json();
        let bestMatch = null;

        // Add creatorId if user is logged in
        console.log("[API/PUBLISH-REQUEST] Session:", session);
        console.log("[API/PUBLISH-REQUEST] Session user:", session?.user);

        if (session?.user?.id) {
            try {
                body.creatorId = new mongoose.Types.ObjectId(session.user.id);
                console.log("[API/PUBLISH-REQUEST] Cast creatorId successfully:", body.creatorId);
            } catch (oidErr) {
                console.error("[API/PUBLISH-REQUEST] Error casting ID:", oidErr);
                body.creatorId = session.user.id; // Fallback
            }
        } else {
            console.error("[API/PUBLISH-REQUEST] Warning: No user ID in session. Session exists:", !!session);
        }

        const newRequest = await Request.create(body);
        console.log("[API/PUBLISH-REQUEST] Created Request:", {
            id: newRequest._id,
            patient: newRequest.patientName,
            creatorId: newRequest.creatorId,
            creatorIdType: typeof newRequest.creatorId
        });

        // Sync to user's requests array
        if (body.creatorId) {
            const userId = body.creatorId;
            const userRole = session?.user?.role;
            console.log("[API/PUBLISH-REQUEST] Syncing to", userRole, "record:", userId);

            if (userRole === 'donor') {
                await Donor.findByIdAndUpdate(userId, { $push: { requests: newRequest._id } });
            } else if (userRole === 'requester') {
                await Requester.findByIdAndUpdate(userId, { $push: { requests: newRequest._id } });
            }
        }

        // --- AI MATCHING & NOTIFICATIONS ---
        try {
            const matches = await findMatchingDonors(newRequest);
            if (matches.length > 0) {
                console.log(`[API/PUBLISH-REQUEST] Processing ${matches.length} matches...`);

                const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                const emailSubject = `URGENT: ${newRequest.bloodType} Blood Needed Nearby!`;

                // Update bestMatch for frontend
                const topMatch = matches[0];
                bestMatch = {
                    id: topMatch.donor._id,
                    name: topMatch.donor.name,
                    bloodGroup: topMatch.donor.bloodType,
                    location: `${topMatch.donor.city}${topMatch.donor.city && topMatch.donor.state ? ', ' : ''}${topMatch.donor.state}` || topMatch.donor.address || 'Matching Location',
                    distance: topMatch.distance !== Infinity ? `${topMatch.distance.toFixed(1)} km` : 'Nearby',
                    verified: topMatch.donor.isVerified,
                    availability: topMatch.donor.availabilityStatus,
                    profileImage: topMatch.donor.profileImage
                };

                const pushTitle = `Urgent: ${newRequest.bloodType} Blood Needed!`;
                const pushBody = `${newRequest.units} units required at ${newRequest.hospitalName}.`;
                const pushTokens = [];

                await Promise.all(matches.map(async (m) => {
                    // 1. Email
                    if (m.donor.email) {
                        const emailHtml = `
                            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                                <h2 style="color: #dc2626;">Urgent Blood Request</h2>
                                <p>Hello,</p>
                                <p>A patient nearby needs your help. You are identified as a potential match.</p>
                                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0;">
                                    <p style="margin: 5px 0;"><strong>Blood Type:</strong> ${newRequest.bloodType}</p>
                                    <p style="margin: 5px 0;"><strong>Units:</strong> ${newRequest.units}</p>
                                    <p style="margin: 5px 0;"><strong>Hospital:</strong> ${newRequest.hospitalName}</p>
                                </div>
                                <p><a href="${baseUrl}/requests/${newRequest._id}" style="display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px;">View Request Details</a></p>
                                <p>Login to BloodLink to respond.</p>
                            </div>
                        `;
                        await sendEmail(m.donor.email, emailSubject, emailHtml).catch(e => console.error("Email fail:", e));
                    }
                    // 2. Push Token
                    if (m.donor.fcmToken) {
                        pushTokens.push(m.donor.fcmToken);
                    }
                }));

                if (pushTokens.length > 0) {
                    await sendPushNotification(pushTokens, pushTitle, pushBody, { requestId: newRequest._id.toString() }).catch(e => console.error("Push fail:", e));
                }
            }
        } catch (e) {
            console.error("[API/PUBLISH-REQUEST] Matching/Notification failed:", e);
        }

        return NextResponse.json({
            success: true,
            message: "Request published and donors notified successfully",
            data: {
                request: newRequest,
                bestMatch: bestMatch
            }
        }, { status: 201 });
    } catch (error) {
        console.error("[API/PUBLISH-REQUEST] Error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to publish request",
            error: error.message
        }, { status: 500 });
    }
}
