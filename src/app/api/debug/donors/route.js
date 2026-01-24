import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Donor from "@/models/Donor";

export async function GET() {
    try {
        await dbConnect();
        const donors = await Donor.find({});
        return NextResponse.json(donors);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
