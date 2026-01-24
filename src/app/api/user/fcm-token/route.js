import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donor from "@/models/Donor";
import Requester from "@/models/Requester";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { fcmToken } = await req.json();

        if (!fcmToken) {
            return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
        }

        const userId = session.user.id;
        const role = session.user.role;

        console.log(`[API/FCM] Updating token for ${role} ${userId}`);

        let updatedUser;
        if (role === 'donor') {
            updatedUser = await Donor.findByIdAndUpdate(userId, { fcmToken }, { new: true });
        } else {
            updatedUser = await Requester.findByIdAndUpdate(userId, { fcmToken }, { new: true });
        }

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Token updated" });

    } catch (error) {
        console.error("Error updating FCM token:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
