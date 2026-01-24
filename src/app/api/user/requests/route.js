import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import Request from "@/models/Request";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            console.error("[API/USER/REQUESTS] Error: No user ID in session");
            return NextResponse.json({ message: "No user ID in session" }, { status: 400 });
        }

        const userId = new mongoose.Types.ObjectId(session.user.id);
        console.log("[API/USER/REQUESTS] Fetching for userId:", userId);

        // Find requests where creatorId matches
        const requests = await Request.find({ creatorId: userId }).sort({ createdAt: -1 });
        console.log("[API/USER/REQUESTS] Found requests count for user:", requests.length);

        if (requests.length === 0) {
            const allRequests = await Request.find().limit(5);
            console.log("[API/USER/REQUESTS] DIAGNOSTIC - Any 5 requests in DB:");
            allRequests.forEach(r => {
                console.log(`- Request: ${r.patientName}, CreatorId: ${r.creatorId}, Type: ${typeof r.creatorId}, Raw: ${JSON.stringify(r.creatorId)}`);
            });
        }

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching user requests:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
