import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Donor from "@/models/Donor";

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // Fetch donor by ID, excluding password
        const donor = await Donor.findById(id).select('-password');

        if (!donor) {
            return NextResponse.json({ message: "Donor not found" }, { status: 404 });
        }

        // Format data to match frontend expectations
        const formattedDonor = {
            id: donor._id,
            name: donor.name,
            bloodGroup: donor.bloodType,
            location: `${donor.city}${donor.city && donor.state ? ', ' : ''}${donor.state}` || donor.address || 'N/A',
            availability: donor.availabilityStatus,
            lastDonation: donor.lastDonatedOn ? formatTimeAgo(donor.lastDonatedOn) : 'Never',
            profileImage: donor.profileImage,
            phone: donor.phone,
            email: donor.email,
            verified: donor.isVerified,
            bio: donor.bio || "No biography provided.",
            contact: donor.phone,
        };

        return NextResponse.json(formattedDonor);
    } catch (error) {
        console.error("[API/DONORS/ID] Error:", error);
        return NextResponse.json({
            message: "Failed to fetch donor",
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
