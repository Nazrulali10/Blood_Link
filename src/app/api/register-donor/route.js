import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Donor from "@/models/Donor";
import Requester from "@/models/Requester";
import cloudinary from "@/lib/cloudinary";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();

        const file = formData.get('profileImage');
        let profileImageUrl = "";

        if (file && typeof file !== 'string') {
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
            profileImageUrl = uploadResponse.secure_url;
        }

        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');
        const bloodType = formData.get('bloodType');
        const lastDonatedOn = formData.get('lastDonatedOn');
        const eligibleToDonate = formData.get('eligibleToDonate') === 'true';
        const address = formData.get('address');
        const city = formData.get('city');
        const state = formData.get('state');
        const pincode = formData.get('pincode');
        const lat = formData.get('lat');
        const lng = formData.get('lng');
        const role = formData.get('role') || 'donor';
        const availabilityStatus = formData.get('availabilityStatus') || 'Available';
        const preferredDistanceLimit = parseInt(formData.get('preferredDistanceLimit')) || 50;
        const allowNotifications = formData.get('allowNotifications') === 'true';
        const notifyForNearbyRequests = formData.get('notifyForNearbyRequests') === 'true';
        const fcmToken = formData.get('fcmToken');

        if (!name || !email || !phone || !bloodType) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Check if email already exists as a Donor
        const existingDonor = await Donor.findOne({ email });
        if (existingDonor) {
            return NextResponse.json({ message: "Email already registered as a donor" }, { status: 400 });
        }

        // Check if user is an existing Requester
        const existingRequester = await Requester.findOne({ email });

        if (!existingRequester && !password) {
            return NextResponse.json({ message: "Password is required for new registration" }, { status: 400 });
        }

        let hashedPassword;
        if (existingRequester) {
            // Use their existing hashed password
            hashedPassword = existingRequester.password;
        } else {
            // New user registration, hash the provided password
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const newDonor = new Donor({
            _id: existingRequester ? existingRequester._id : undefined,
            name,
            email,
            phone,
            password: hashedPassword,
            profileImage: profileImageUrl || (existingRequester ? existingRequester.profileImage : ""),
            bloodType,
            lastDonatedOn: lastDonatedOn ? new Date(lastDonatedOn) : null,
            eligibleToDonate,
            address,
            city,
            state,
            pincode,
            geolocation: {
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null,
            },
            role,
            availabilityStatus,
            preferredDistanceLimit,
            allowNotifications,
            notifyForNearbyRequests,
            fcmToken,
        });

        if (existingRequester) {
            // Remove from Requester collection before saving to Donor to avoid conflicts if any
            await Requester.findByIdAndDelete(existingRequester._id);
        }

        await newDonor.save();

        return NextResponse.json({
            message: existingRequester ? "Account transitioned to Donor successfully" : "Donor registered successfully",
            donor: newDonor
        }, { status: 201 });
    } catch (error) {
        console.error("Error registering donor:", error);
        return NextResponse.json({ message: "Failed to register donor", error: error.message }, { status: 500 });
    }
}
