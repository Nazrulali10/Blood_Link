import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
        required: true
    },
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requester',
        required: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled']
    },
    bloodTypeMatch: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
