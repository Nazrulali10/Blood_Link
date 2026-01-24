const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Donor = mongoose.model('Donor', new mongoose.Schema({
        name: String,
        bloodType: String,
        isVerified: Boolean,
        availabilityStatus: String,
        notifyForNearbyRequests: Boolean,
        geolocation: { lat: Number, lng: Number },
        preferredDistanceLimit: Number
    }));

    const donors = await Donor.find({
        isVerified: true,
        availabilityStatus: 'Available',
        notifyForNearbyRequests: true
    });

    console.log(`Found ${donors.length} qualified donors:`);
    donors.forEach(d => {
        console.log(`- ${d.name}: blood=${d.bloodType}, geo=${JSON.stringify(d.geolocation)}, limit=${d.preferredDistanceLimit || 50}`);
    });

    process.exit(0);
}

check();
