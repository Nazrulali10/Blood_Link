import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import Request from "@/models/Request";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!['pending', 'fulfilled', 'cancelled', 'in-progress'].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        console.log(`[API/REQUEST-STATUS] Updating request ${id} to ${status} for user ${session.user.id}`);

        // Find the request and ensure it belongs to the user
        const requestId = new mongoose.Types.ObjectId(id);
        const userId = new mongoose.Types.ObjectId(session.user.id);

        const request = await Request.findOne({ _id: requestId, creatorId: userId });

        if (!request) {
            console.error(`[API/REQUEST-STATUS] Request not found or unauthorized. ID: ${id}, User: ${session.user.id}`);
            return NextResponse.json({ message: "Request not found or unauthorized" }, { status: 404 });
        }

        request.status = status;
        await request.save();

        console.log(`[API/REQUEST-STATUS] Updated successfully`);
        return NextResponse.json({ message: "Status updated successfully", request });
    } catch (error) {
        console.error("[API/REQUEST-STATUS] Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
