import mongoose from 'mongoose';

const DonorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    bloodType: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    lastDonatedOn: { type: Date },
    eligibleToDonate: { type: Boolean, default: false },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    geolocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    isVerified: { type: Boolean, default: false },
    role: { type: String, default: 'donor' },
    availabilityStatus: { type: String, default: 'Available', enum: ['Available', 'Unavailable'] },
    preferredDistanceLimit: { type: Number, default: 50 },
    pastDonationHistory: [{ type: String }],
    allowNotifications: { type: Boolean, default: true },
    notifyForNearbyRequests: { type: Boolean, default: true },
    fcmToken: { type: String },
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }],
}, { timestamps: true });

export default mongoose.models.Donor || mongoose.model('Donor', DonorSchema);
