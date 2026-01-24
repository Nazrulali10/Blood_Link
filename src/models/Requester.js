import mongoose from 'mongoose';

const RequesterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    role: { type: String, default: 'requester' },
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }],
}, { timestamps: true });

export default mongoose.models.Requester || mongoose.model('Requester', RequesterSchema);
