import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const bloodType = searchParams.get('bloodType');

        const query = {
            status: { $in: ['pending', 'in-progress'] }
        };
        if (bloodType) {
            query.bloodType = bloodType;
        }

        const requests = await Request.find(query).sort({ createdAt: -1 });

        // Format for UI
        const formattedRequests = requests.map(req => ({
            ...req._doc,
            id: req._id,
            timePosted: formatTimeAgo(req.createdAt),
            distance: "Nearby"
        }));

        return NextResponse.json(formattedRequests);
    } catch (error) {
        console.error("[API/REQUESTS] Error:", error);
        return NextResponse.json({
            message: "Failed to fetch requests",
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
