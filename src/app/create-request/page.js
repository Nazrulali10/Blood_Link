'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin, User, Phone, FileText, Droplet, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import DonorCard from '@/components/DonorCard';

export default function CreateRequest() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [geolocation, setGeolocation] = useState({ lat: '', lng: '' });
    const [userData, setUserData] = useState(null);
    const [bestMatch, setBestMatch] = useState(null);
    const [requestPublished, setRequestPublished] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/user/me')
                .then(res => res.json())
                .then(data => setUserData(data))
                .catch(err => console.error("Error fetching user data:", err));
        } else if (status === 'unauthenticated') {
            alert("you should login");
            router.push('/login');
        }
    }, [status, router]);

    const getGeoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGeolocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    alert("Error getting location: " + error.message);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleGeolocationChange = (e) => {
        const { name, value } = e.target;
        setGeolocation(prev => ({ ...prev, [name]: value }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            patientName: formData.get('patientName'),
            bloodType: formData.get('bloodType'),
            units: parseInt(formData.get('units'), 10),
            urgency: formData.get('urgency'),
            hospitalName: formData.get('hospitalName'),
            location: formData.get('location'),
            geolocation: {
                lat: parseFloat(formData.get('lat')) || null,
                lng: parseFloat(formData.get('lng')) || null
            },
            requesterName: formData.get('requesterName'),
            phone: formData.get('phone'),
            notes: formData.get('notes'),
        };

        try {
            const response = await fetch('/api/publish-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setRequestPublished(true);
                if (result.data && result.data.bestMatch) {
                    setBestMatch(result.data.bestMatch);
                }
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error publishing request:", error);
            alert("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    if (requestPublished) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-8 text-center space-y-6 animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Droplet className="w-8 h-8 text-green-600" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Request Published!</h2>
                        <p className="text-gray-600 mt-2">Your blood request has been broadcasted to nearby donors.</p>
                    </div>

                    {bestMatch ? (
                        <div className="bg-red-50 rounded-xl p-6 border border-red-100 text-left">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                Best Match Found!
                            </h3>
                            <DonorCard donor={bestMatch} />
                            <p className="text-sm text-gray-500 mt-3 text-center">
                                This donor is the closest match to your location and requirements.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <p className="text-gray-600">We are searching for donors nearby. You will be notified when someone accepts your request.</p>
                        </div>
                    )}

                    <Link
                        href="/"
                        className="block w-full py-3 px-4 bg-[var(--primary)] hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-8">
                    <Link href="/" className="text-sm text-gray-500 hover:text-[var(--primary)] transition-colors mb-4 inline-block">
                        &larr; Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Create Blood Request</h1>
                    <p className="text-gray-600 mt-2">Fill in the details below to request blood donation.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
                    {/* Patient Details */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                            <User className="w-5 h-5 text-[var(--primary)]" />
                            Patient Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Patient Name</label>
                                <input
                                    name="patientName"
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Blood Type Required</label>
                                <select
                                    name="bloodType"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all bg-white"
                                >
                                    <option value="">Select Blood Type</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Units Required</label>
                                <input
                                    name="units"
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="e.g., 2"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Urgency Level</label>
                                <select
                                    name="urgency"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all bg-white"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Location & Hospital */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[var(--primary)]" />
                            Location Details
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Hospital Name</label>
                                <input
                                    name="hospitalName"
                                    type="text"
                                    required
                                    placeholder="e.g., City General Hospital"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Address / Location</label>
                                <textarea
                                    name="location"
                                    required
                                    rows="2"
                                    placeholder="Enter full address or location link"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all resize-none"
                                ></textarea>
                            </div>

                            {/* Geolocation */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Geolocation Coordinates</label>
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                    <div className="w-full sm:w-1/3">
                                        <input
                                            type="text"
                                            name="lat"
                                            id="lat"
                                            placeholder="Latitude"
                                            value={geolocation.lat}
                                            onChange={handleGeolocationChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="w-full sm:w-1/3">
                                        <input
                                            type="text"
                                            name="lng"
                                            id="lng"
                                            placeholder="Longitude"
                                            value={geolocation.lng}
                                            onChange={handleGeolocationChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={getGeoLocation}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 whitespace-nowrap"
                                    >
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Detect Location
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-[var(--primary)]" />
                            Contact Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Requester Name</label>
                                <input
                                    name="requesterName"
                                    type="text"
                                    required
                                    defaultValue={userData?.name || ""}
                                    placeholder="Your Name"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    defaultValue={userData?.phone || ""}
                                    placeholder="+1 234 567 8900"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[var(--primary)]" />
                            Additional Information
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Note (Optional)</label>
                            <textarea
                                name="notes"
                                rows="4"
                                placeholder="Any special instructions or details..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[var(--primary)] outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Submit Action */}
                    <div className="pt-4 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-red-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? 'Publishing...' : 'Publish Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
