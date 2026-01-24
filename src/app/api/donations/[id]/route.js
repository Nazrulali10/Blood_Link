import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import Request from '@/models/Request';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        const donation = await Donation.findById(id);
        if (!donation) {
            return NextResponse.json({ message: "Donation not found" }, { status: 404 });
        }

        // Authorization check
        const isDonor = donation.donorId.toString() === session.user.id;
        const isRequester = donation.requesterId.toString() === session.user.id;

        if (!isDonor && !isRequester) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        // Status update logic
        if (status === 'accepted' && !isRequester) {
            return NextResponse.json({ message: "Only the requester can accept a donation" }, { status: 403 });
        }

        donation.status = status;
        await donation.save();

        // Side effect: Update the Request status
        if (status === 'accepted') {
            await Request.findByIdAndUpdate(donation.requestId, { status: 'in-progress' });
            // Optionally reject other pending donations for this request
            await Donation.updateMany(
                { requestId: donation.requestId, _id: { $ne: donation._id }, status: 'pending' },
                { status: 'rejected' }
            );
        } else if (status === 'completed') {
            await Request.findByIdAndUpdate(donation.requestId, { status: 'fulfilled' });
        } else if (status === 'cancelled') {
            // If the accepted donation is cancelled, set request back to pending
            const bloodRequest = await Request.findById(donation.requestId);
            if (bloodRequest.status === 'in-progress') {
                bloodRequest.status = 'pending';
                await bloodRequest.save();
            }
        }

        return NextResponse.json({ message: "Donation status updated", donation });
    } catch (error) {
        console.error("[API/DONATIONS/ID/PATCH] Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
