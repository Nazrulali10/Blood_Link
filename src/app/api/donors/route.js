import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Donor from "@/models/Donor";

export async function GET() {
    try {
        await dbConnect();

        // Fetch all donors, excluding sensitive info like password
        const donors = await Donor.find({}).select('-password').sort({ createdAt: -1 });

        const formattedDonors = donors.map(donor => ({
            id: donor._id,
            name: donor.name,
            bloodGroup: donor.bloodType,
            location: `${donor.city}${donor.city && donor.state ? ', ' : ''}${donor.state}` || donor.address || 'N/A',
            availability: donor.availabilityStatus,
            lastDonation: donor.lastDonatedOn ? formatTimeAgo(donor.lastDonatedOn) : 'Never',
            profileImage: donor.profileImage,
            phone: donor.phone,
            email: donor.email,
            verified: donor.isVerified
        }));

        return NextResponse.json(formattedDonors);
    } catch (error) {
        console.error("[API/DONORS] Error:", error);
        return NextResponse.json({
            message: "Failed to fetch donors",
            error: error.message
        }, { status: 500 });
    }
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
}
