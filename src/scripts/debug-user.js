const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const AdminSchema = new mongoose.Schema({ email: String });
const RequesterSchema = new mongoose.Schema({ email: String });
const DonorSchema = new mongoose.Schema({ email: String });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Requester = mongoose.models.Requester || mongoose.model('Requester', RequesterSchema);
const Donor = mongoose.models.Donor || mongoose.model('Donor', DonorSchema);

async function checkUser() {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB:', mongoose.connection.name);

        const email = 'admin@bloodlink.com';
        console.log(`Checking for ${email} in all collections...`);

        const admin = await Admin.findOne({ email });
        console.log('Found in Admin:', !!admin);

        const requester = await Requester.findOne({ email });
        console.log('Found in Requester:', !!requester);
        if (requester) {
            console.log("!!! FOUND IN REQUESTER - Removing...");
            await Requester.deleteOne({ email });
            console.log("Removed from Requester.");
        }

        const donor = await Donor.findOne({ email });
        console.log('Found in Donor:', !!donor);
        if (donor) {
            console.log("!!! FOUND IN DONOR - Removing...");
            await Donor.deleteOne({ email });
            console.log("Removed from Donor.");
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkUser();
