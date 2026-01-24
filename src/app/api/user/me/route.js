import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Requester from "@/models/Requester";
import Donor from "@/models/Donor";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        await dbConnect();

        let userData = null;

        if (session.user.role === 'requester') {
            userData = await Requester.findOne({ email: session.user.email }).select("-password");
        } else if (session.user.role === 'donor') {
            userData = await Donor.findOne({ email: session.user.email }).select("-password");
        } else if (session.user.role === 'admin') {
            // Import Admin model dynamically or ensure it's imported at the top
            const Admin = (await import("@/models/Admin")).default;
            userData = await Admin.findOne({ email: session.user.email }).select("-password");
        } else {
            // Fallback: try finding in both if role is missing/unknown
            userData = await Requester.findOne({ email: session.user.email }).select("-password") ||
                await Donor.findOne({ email: session.user.email }).select("-password");
        }

        if (!userData) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(userData);
    } catch (error) {
        console.error("[API/USER/ME] Error:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
