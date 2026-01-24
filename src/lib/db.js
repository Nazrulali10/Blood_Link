import mongoose from 'mongoose';

console.log("[LIB/DB] Module loaded");

const MONGODB_URI = process.env.MONGODB_URI

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (!MONGODB_URI) {
        console.error("MONGODB_URI is missing from environment variables");
        throw new Error('Please define the MONGODB_URI environment variable inside .env');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("MongoDB Connected Successfully");
            console.log("Connected to DB:", mongoose.connection.name);
            return mongoose;
        }).catch((err) => {
            console.error("MongoDB Connection Failed:", err);
            cached.promise = null; // Reset promise so we can retry
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
