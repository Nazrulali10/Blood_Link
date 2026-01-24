'use server';

import { addRequest } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function createRequestAction(formData) {
    const rawFormData = {
        patientName: formData.get('patientName'),
        bloodType: formData.get('bloodType'),
        units: parseInt(formData.get('units'), 10),
        urgency: formData.get('urgency'),
        hospitalName: formData.get('hospitalName'),
        address: formData.get('location'),
        location: formData.get('hospitalName') + ', ' + formData.get('location'),
        requesterName: formData.get('requesterName'),
        phone: formData.get('phone'),
        notes: formData.get('notes'),
        geolocation: {
            lat: formData.get('lat'),
            lng: formData.get('lng')
        }
    };

    // Create new request object
    const newRequest = {
        id: Date.now().toString(),
        patientName: rawFormData.patientName,
        bloodType: rawFormData.bloodType,
        location: rawFormData.location,
        urgency: rawFormData.urgency.charAt(0).toUpperCase() + rawFormData.urgency.slice(1),
        units: rawFormData.units,
        timePosted: 'Just now',
        distance: '0.1 km', // Mock distance
        geolocation: rawFormData.geolocation,
        ...rawFormData
    };

    addRequest(newRequest);
    revalidatePath('/');
}
