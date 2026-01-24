const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Assuming you use bcryptjs for passwords
require('dotenv').config({ path: '.env.local' });

// Using the same schema definition as in the debug script for simplicity
// ideally we import the model, but scripts behave better with standalone schema defs often
const DonorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    bloodType: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    availabilityStatus: { type: String, default: 'Available' },
    notifyForNearbyRequests: { type: Boolean, default: true },
    geolocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    role: { type: String, default: 'donor' },
    lastDonatedOn: { type: Date },
    eligibleToDonate: { type: Boolean, default: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
}, { timestamps: true });

const Donor = mongoose.models.Donor || mongoose.model('Donor', DonorSchema);

async function seedDonor() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Delete existing test donor if exists
        await Donor.deleteOne({ email: 'testdonor@example.com' });

        const hashedPassword = await bcrypt.hash('password123', 10);

        const newDonor = await Donor.create({
            name: "AI Verified Donor",
            email: "testdonor@example.com",
            phone: "+1234567890",
            password: hashedPassword,
            bloodType: "O-", // Universal donor, matches A- (requested) and everyone else
            isVerified: true,
            availabilityStatus: "Available",
            notifyForNearbyRequests: true,
            geolocation: {
                lat: 40.7128, // Example: New York
                lng: -74.0060
            },
            role: 'donor',
            eligibleToDonate: true,
            address: "123 Test St",
            city: "Test City"
        });

        console.log("Created Verified Donor:");
        console.log(`Name: ${newDonor.name}`);
        console.log(`Email: ${newDonor.email}`);
        console.log(`Blood Type: ${newDonor.bloodType}`);
        console.log(`Location: ${newDonor.geolocation.lat}, ${newDonor.geolocation.lng}`);
        console.log(`Verified: ${newDonor.isVerified}`);

    } catch (error) {
        console.error('Error seeding donor:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedDonor();
