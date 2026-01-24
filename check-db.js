import dbConnect from "./src/lib/db.js";
import Request from "./src/models/Request.js";
import mongoose from "mongoose";

async function checkRequests() {
    try {
        await dbConnect();
        console.log("Connected to DB");
        const requests = await Request.find().sort({ createdAt: -1 }).limit(5);
        console.log("Last 5 requests:");
        requests.forEach(r => {
            console.log(`ID: ${r._id}, Patient: ${r.patientName}, CreatorId: ${r.creatorId}, CreatedAt: ${r.createdAt}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRequests();
