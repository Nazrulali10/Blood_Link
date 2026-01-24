import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    bloodType: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    units: { type: Number, required: true, min: 1 },
    urgency: { type: String, required: true },
    hospitalName: { type: String, required: true },
    location: { type: String, required: true },
    geolocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    requesterName: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'fulfilled', 'cancelled', 'in-progress'] },
    creatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

// Force delete if model already exists to pick up schema changes in dev
if (mongoose.models.Request) {
    delete mongoose.models.Request;
}

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
