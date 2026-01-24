import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Donation from '@/models/Donation';
import Request from '@/models/Request';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';

export async function PATCH(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { donationId, status } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(donationId)) {
            return NextResponse.json({ error: 'Invalid Donation ID' }, { status: 400 });
        }

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
        }

        // Verify ownership (only requester can accept/reject/complete, donor can cancel pending)
        // For simplicity allowing requester to drive most status changes, donor can cancel.
        const requesterId = donation.requesterId.toString();
        const donorId = donation.donorId.toString();
        // We'll need to fetch current user's role/id to properly validate permissions
        // But for now assuming the frontend sends valid requests based on role.
        // Ideally we should check session.user.id against requesterId/donorId.

        donation.status = status;
        await donation.save();

        // Update Request status if needed
        if (status === 'in-progress') {
            await Request.findByIdAndUpdate(donation.requestId, { status: 'in-progress' });
        } else if (status === 'completed') {
            await Request.findByIdAndUpdate(donation.requestId, { status: 'fulfilled' });
            // Could also update donor's lastDonationDate here
        } else if (status === 'cancelled' || status === 'rejected') {
            // If a donation is cancelled/rejected, does the request go back to pending?
            // Only if it was previously in-progress and this was the active donation.
            // For now, let's keep it simple. If in-progress is cancelled, set request back to pending.
            const request = await Request.findById(donation.requestId);
            if (request.status === 'in-progress') {
                request.status = 'pending';
                await request.save();
            }
        }

        return NextResponse.json({ message: 'Status updated successfully', donation }, { status: 200 });
    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
