import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Donation from '@/models/Donation';
import Request from '@/models/Request';
import Donor from '@/models/Donor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify if user is a donor
        const donor = await Donor.findOne({ email: session.user.email });
        if (!donor) {
            return NextResponse.json({ error: 'Only donors can donate' }, { status: 403 });
        }

        const { requestId } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return NextResponse.json({ error: 'Invalid Request ID' }, { status: 400 });
        }

        const request = await Request.findById(requestId);
        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Check compatibility
        const isCompatible = checkCompatibility(donor.bloodType, request.bloodType);
        if (!isCompatible) {
            return NextResponse.json({ error: 'Blood type mismatch. You cannot donate to this request.' }, { status: 400 });
        }

        // Check if already donated/requested
        const existingDonation = await Donation.findOne({
            requestId: request._id,
            donorId: donor._id
        });

        if (existingDonation) {
            return NextResponse.json({ error: 'You have already expressed interest in this request.' }, { status: 400 });
        }

        const newDonation = await Donation.create({
            requestId: request._id,
            donorId: donor._id,
            requesterId: request.creatorId,
            status: 'pending',
            bloodTypeMatch: true
        });

        return NextResponse.json({ message: 'Donation request sent successfully', donation: newDonation }, { status: 201 });

    } catch (error) {
        console.error('Error creating donation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function checkCompatibility(donorType, recipientType) {
    const compatibility = {
        'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        'O+': ['O+', 'A+', 'B+', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'A+': ['A+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'B+': ['B+', 'AB+'],
        'AB-': ['AB-', 'AB+'],
        'AB+': ['AB+']
    };

    return compatibility[donorType]?.includes(recipientType) || false;
}
