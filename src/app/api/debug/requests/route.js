import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Request from "@/models/Request";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (id) {
            const request = await Request.findById(id);
            return NextResponse.json(request);
        }
        const requests = await Request.find({}).sort({ createdAt: -1 }).limit(5);
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
