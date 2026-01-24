import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';

export async function GET() {
    try {
        await dbConnect();

        // Force refresh model if it's cached with old enum
        if (mongoose.models.Request) {
            delete mongoose.models.Request;
        }
        const RequestModel = mongoose.model('Request', mongoose.models.Request?.schema || Request.schema);

        // Check if any requests exist to avoid duplicates if needed, 
        // but user asked to insert it manually from code.
        const sampleRequest = {
            patientName: "John Doe",
            bloodType: "O+",
            units: 2,
            urgency: "High",
            hospitalName: "City Hospital",
            location: "Dhaka, Bangladesh",
            requesterName: "Jane Smith",
            phone: "+880 1234 567890",
            notes: "Immediate requirement for surgery",
            status: "pending"
        };

        const newRequest = await RequestModel.create(sampleRequest);

        return NextResponse.json({
            message: "Request created successfully",
            request: newRequest
        }, { status: 201 });

    } catch (error) {
        console.error("[API/SEED] Error:", error);
        return NextResponse.json({
            message: "Failed to create request",
            error: error.message
        }, { status: 500 });
    }
}
