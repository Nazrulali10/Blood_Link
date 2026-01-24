"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Register() {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        profileImage: null,
        bloodType: '',
        lastDonatedOn: '',
        eligibleToDonate: false,
        address: '',
        city: '',
        state: '',
        pincode: '',
        geolocation: { lat: '', lng: '' },
        isVerified: false,
        role: 'donor',
        availabilityStatus: 'Available',
        preferredDistanceLimit: 50,
        pastDonationHistory: '',
        allowNotifications: true,
        notifyForNearbyRequests: true,
        fcmToken: '',
    });

    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || prev.name,
                email: session.user.email || prev.email,
            }));
            if (session.user.role === 'requester') {
                setIsTransitioning(true);
            }
        }
    }, [session, status]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (status === 'authenticated') {
                try {
                    const res = await fetch('/api/user/me');
                    if (res.ok) {
                        const data = await res.json();
                        setFormData(prev => ({
                            ...prev,
                            name: data.name || prev.name,
                            email: data.email || prev.email,
                            phone: data.phone || prev.phone || '',
                            address: data.address || prev.address || '',
                            city: data.city || prev.city || '',
                            state: data.state || prev.state || '',
                            pincode: data.pincode || prev.pincode || '',
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                }
            }
        };
        fetchUserData();
    }, [status]);

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGeolocationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            geolocation: { ...prev.geolocation, [name]: value }
        }));
    };

    const getGeoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        geolocation: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }));
                },
                (error) => {
                    alert("Error getting location: " + error.message);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Append basic fields
            Object.keys(formData).forEach(key => {
                if (key === 'geolocation') {
                    data.append('lat', formData.geolocation.lat);
                    data.append('lng', formData.geolocation.lng);
                } else if (key === 'profileImage') {
                    if (formData.profileImage) {
                        data.append('profileImage', formData.profileImage);
                    }
                } else {
                    data.append(key, formData[key]);
                }
            });

            const response = await fetch('/api/register-donor', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || "Registration Successful!");

                if (isTransitioning) {
                    // Sign out and redirect to login to ensure fresh session
                    await signOut({ callbackUrl: '/login' });
                } else {
                    router.push('/login'); // Redirect to login for new registrations
                }
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An error occurred during registration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isTransitioning ? 'Become a Donor' : 'Create your account'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isTransitioning ? (
                        "Complete your profile to start donating blood."
                    ) : (
                        <>
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                                Sign in
                            </Link>
                        </>
                    )}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* --- Personal Details --- */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4">Personal Details</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="mt-1">
                                        <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                    <div className="mt-1">
                                        <input id="email" name="email" type="email" required disabled={isTransitioning} value={formData.email} onChange={handleChange} className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${isTransitioning ? 'bg-gray-100' : ''}`} />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <div className="mt-1">
                                        <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                    </div>
                                </div>

                                {!isTransitioning && (
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                        <div className="mt-1">
                                            <input id="password" name="password" type="password" required={!isTransitioning} value={formData.password} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                        </div>
                                    </div>
                                )}

                                <div className="sm:col-span-2">
                                    <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">Profile Image</label>
                                    <div className="mt-1 flex items-center">
                                        <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                            {formData.profileImage ? (
                                                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            )}
                                        </span>
                                        <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleChange} className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Medical Information --- */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4">Medical Information</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">Blood Type</label>
                                    <div className="mt-1">
                                        <select id="bloodType" name="bloodType" required value={formData.bloodType} onChange={handleChange} className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm">
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
                                </div>

                                <div>
                                    <label htmlFor="lastDonatedOn" className="block text-sm font-medium text-gray-700">Last Donated On</label>
                                    <div className="mt-1">
                                        <input id="lastDonatedOn" name="lastDonatedOn" type="date" value={formData.lastDonatedOn} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input id="eligibleToDonate" name="eligibleToDonate" type="checkbox" checked={formData.eligibleToDonate} onChange={handleChange} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                                    <label htmlFor="eligibleToDonate" className="ml-2 block text-sm text-gray-900">
                                        I am currently eligible to donate blood
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* --- Address & Location --- */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4">Address & Location</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <div className="mt-1">
                                        <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                    <div className="mt-1">
                                        <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                    <div className="mt-1">
                                        <input id="state" name="state" type="text" value={formData.state} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                                    <div className="mt-1">
                                        <input id="pincode" name="pincode" type="text" value={formData.pincode} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                    </div>
                                </div>

                                {/* Geolocation */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Geolocation</label>
                                    <div className="flex space-x-2 mb-2">
                                        <button type="button" onClick={getGeoLocation} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                            Detect My Location
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative rounded-md shadow-sm">
                                            <input type="text" name="lat" id="lat" placeholder="Latitude" value={formData.geolocation.lat} onChange={handleGeolocationChange} className="focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                        </div>
                                        <div className="relative rounded-md shadow-sm">
                                            <input type="text" name="lng" id="lng" placeholder="Longitude" value={formData.geolocation.lng} onChange={handleGeolocationChange} className="focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* --- Preferences --- */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4">Preferences</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="preferredDistanceLimit" className="block text-sm font-medium text-gray-700">Preferred Distance Limit (km)</label>
                                    <div className="mt-1">
                                        <input id="preferredDistanceLimit" name="preferredDistanceLimit" type="number" min="1" value={formData.preferredDistanceLimit} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input id="allowNotifications" name="allowNotifications" type="checkbox" checked={formData.allowNotifications} onChange={handleChange} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                                    <label htmlFor="allowNotifications" className="ml-2 block text-sm text-gray-900">
                                        Allow Notifications
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input id="notifyForNearbyRequests" name="notifyForNearbyRequests" type="checkbox" checked={formData.notifyForNearbyRequests} onChange={handleChange} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                                    <label htmlFor="notifyForNearbyRequests" className="ml-2 block text-sm text-gray-900">
                                        Notify me for nearby blood requests
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
