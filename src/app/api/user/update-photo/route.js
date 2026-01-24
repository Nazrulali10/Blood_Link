import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Donor from "@/models/Donor";
import Requester from "@/models/Requester";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('profileImage'); // Changed from 'file' to 'profileImage' to match usage

        // If the frontend sends 'file' key, we should check that too, but profile.js sends 'profileImage'
        // formData.append('profileImage', file); in profile.js

        if (!file || typeof file === 'string') {
            return NextResponse.json({ message: "No image file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'auto',
                folder: 'users' // generic folder
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        const profileImageUrl = uploadResponse.secure_url;

        // Update user based on session email
        let user = await Donor.findOneAndUpdate(
            { email: session.user.email },
            { profileImage: profileImageUrl },
            { new: true }
        );

        if (!user) {
            user = await Requester.findOneAndUpdate(
                { email: session.user.email },
                { profileImage: profileImageUrl },
                { new: true }
            );
        }

        if (!user) {
            return NextResponse.json({ message: "User record not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile photo updated successfully",
            imageUrl: profileImageUrl, // for profile.js compatibility
            profileImage: profileImageUrl
        }, { status: 200 });

    } catch (error) {
        console.error("[API/USER/UPDATE-PHOTO] Error:", error);
        return NextResponse.json({
            message: "Failed to update profile photo",
            error: error.message
        }, { status: 500 });
    }
}
