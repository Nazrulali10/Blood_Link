const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const DonorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bloodType: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    availabilityStatus: { type: String, default: 'Available' },
    notifyForNearbyRequests: { type: Boolean, default: true },
    geolocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
});

const Donor = mongoose.models.Donor || mongoose.model('Donor', DonorSchema);

async function checkDonors() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing in .env.local');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const donors = await Donor.find({});
        console.log(`Found ${donors.length} donors:`);
        donors.forEach(d => {
            console.log(`- [${d.bloodType}] ${d.name} | Verified: ${d.isVerified} | Has FCM Token: ${!!d.fcmToken} | Status: ${d.availabilityStatus}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDonors();
