import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Request from '@/models/Request';
import Requester from '@/models/Requester';
import dbConnect from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const session = await getServerSession(authOptions);
        const request = await Request.findById(id);

        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const requester = await Requester.findById(request.creatorId).select('name email phone profileImage');

        let donations = [];
        // If current user is the requester, also return donations
        if (session?.user?.id === request.creatorId.toString()) {
            const Donation = mongoose.models.Donation || (await import('@/models/Donation')).default;
            donations = await Donation.find({ requestId: id })
                .populate('donorId', 'name bloodType phone profileImage isVerified')
                .sort({ createdAt: -1 });
        }

        return NextResponse.json({ request, requester, donations }, { status: 200 });
    } catch (error) {
        console.error('Error fetching request details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
