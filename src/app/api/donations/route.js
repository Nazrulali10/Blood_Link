import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import Request from '@/models/Request';
import Donor from '@/models/Donor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { requestId } = await req.json();

        // 1. Get the request details
        const bloodRequest = await Request.findById(requestId);
        if (!bloodRequest) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }

        // 2. Get the donor details
        const donor = await Donor.findById(session.user.id);
        if (!donor) {
            return NextResponse.json({ message: "Only registered donors can donate" }, { status: 403 });
        }

        // 3. Check for existing interest
        const existingDonation = await Donation.findOne({ requestId, donorId: donor._id });
        if (existingDonation) {
            return NextResponse.json({ message: "You have already expressed interest in this request" }, { status: 400 });
        }

        // 4. Validate blood type match
        const bloodTypeMatch = donor.bloodType === bloodRequest.bloodType;
        if (!bloodTypeMatch) {
            return NextResponse.json({ message: "Invalid to donate: Blood type does not match" }, { status: 400 });
        }

        // 5. Create donation entry
        const donation = await Donation.create({
            requestId,
            donorId: donor._id,
            requesterId: bloodRequest.creatorId,
            status: 'pending',
            bloodTypeMatch
        });

        return NextResponse.json({ message: "Interest expressed successfully", donation }, { status: 201 });
    } catch (error) {
        console.error("[API/DONATIONS/POST] Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const requestId = searchParams.get('requestId');
        const role = searchParams.get('role'); // 'donor' or 'requester'

        let query = {};

        if (requestId) {
            query.requestId = requestId;
        }

        if (role === 'donor') {
            query.donorId = session.user.id;
        } else if (role === 'requester') {
            query.requesterId = session.user.id;
        } else if (!requestId) {
            // If no specific role or requestId, find both
            query = {
                $or: [
                    { donorId: session.user.id },
                    { requesterId: session.user.id }
                ]
            };
        }

        const donations = await Donation.find(query)
            .populate('requestId')
            .populate('donorId', '-password')
            .populate('requesterId', '-password')
            .sort({ createdAt: -1 });

        return NextResponse.json(donations);
    } catch (error) {
        console.error("[API/DONATIONS/GET] Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

