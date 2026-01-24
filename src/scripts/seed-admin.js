const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

// Define Admin Schema directly to avoid import issues with mixed ES6/CommonJS
const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedAdmin() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        console.log("Connected to DB:", mongoose.connection.name);

        // Delete existing admins
        await Admin.deleteMany({});
        console.log('Cleared existing admins');

        // Create new admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await Admin.create({
            name: 'Super Admin',
            email: 'admin@bloodlink.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Admin created successfully:');
        console.log('Email: admin@bloodlink.com');
        console.log('Password: admin123');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
