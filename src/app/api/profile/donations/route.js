import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Donation from '@/models/Donation';
import Donor from '@/models/Donor';
import Requester from '@/models/Requester';
import Request from '@/models/Request';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Determine if user is donor or requester to filter correctly
        let role = 'unknown';
        let userId = null;

        const donor = await Donor.findOne({ email: session.user.email });
        if (donor) {
            role = 'donor';
            userId = donor._id;
        } else {
            const requester = await Requester.findOne({ email: session.user.email });
            if (requester) {
                role = 'requester';
                userId = requester._id;
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        let query = {};
        if (role === 'donor') {
            query = { donorId: userId };
        } else {
            query = { requesterId: userId };
        }

        const donations = await Donation.find(query)
            .populate('requestId')
            .populate('donorId', 'name bloodType phone profileImage')
            .populate('requesterId', 'name phone profileImage')
            .sort({ createdAt: -1 });

        return NextResponse.json({ donations, role, userId }, { status: 200 });

    } catch (error) {
        console.error('Error fetching donations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
