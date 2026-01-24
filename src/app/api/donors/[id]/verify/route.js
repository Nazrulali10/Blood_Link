
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donor from '@/models/Donor';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { verified } = await req.json();

        console.log(`[API/VERIFY] Verifying donor ${id} to status: ${verified}`);

        await dbConnect();

        const donor = await Donor.findByIdAndUpdate(
            id,
            { isVerified: verified },
            { new: true }
        );

        console.log(`[API/VERIFY] Update result:`, donor ? "Success" : "Not Found");

        if (!donor) {
            return NextResponse.json({ error: "Donor not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: `Donor ${verified ? 'verified' : 'unverified'} successfully`,
            donor
        });

    } catch (error) {
        console.error("Error updating donor verification:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
