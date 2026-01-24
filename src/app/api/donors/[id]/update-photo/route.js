import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Donor from "@/models/Donor";
import Requester from "@/models/Requester";
import cloudinary from "@/lib/cloudinary";

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const formData = await req.formData();

        const file = formData.get('profileImage');
        if (!file || typeof file === 'string') {
            return NextResponse.json({ message: "No image file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'auto',
                folder: 'donors'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        const profileImageUrl = uploadResponse.secure_url;

        // Try updating Donor first
        let user = await Donor.findByIdAndUpdate(
            id,
            { profileImage: profileImageUrl },
            { new: true }
        );

        // If not found in Donor, try Requester
        if (!user) {
            user = await Requester.findByIdAndUpdate(
                id,
                { profileImage: profileImageUrl },
                { new: true }
            );
        }

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile photo updated successfully",
            profileImage: profileImageUrl
        }, { status: 200 });
    } catch (error) {
        console.error("[API/DONORS/ID/UPDATE-PHOTO] Error:", error);
        return NextResponse.json({
            message: "Failed to update profile photo",
            error: error.message
        }, { status: 500 });
    }
}
