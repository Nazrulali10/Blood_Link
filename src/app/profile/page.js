"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapPin, User, Phone, CheckCircle, Clock, AlertTriangle, FileText, Heart, X, Check, Pencil, Camera, Mail, Calendar, Droplet, Award, ChevronDown, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingPhoto, setUpdatingPhoto] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, donations
    const [donations, setDonations] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [donationInterests, setDonationInterests] = useState([]); // Interests on my requests
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            // Let the UI handle the redirect message
        } else if (status === 'authenticated') {
            fetchUserData();
        }
    }, [status]);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/user/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setUserRole(data.role);
                fetchUserRequests();
                fetchUserDonations();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRequests = async () => {
        try {
            const res = await fetch('/api/user/requests');
            if (res.ok) {
                const data = await res.json();
                setMyRequests(data);
            }
        } catch (err) {
            console.error("Error fetching requests:", err);
        }
    };

    const fetchUserDonations = async () => {
        try {
            // Donations I made
            const donorRes = await fetch('/api/profile/donations?role=donor'); // Using the new route
            if (donorRes.ok) {
                const data = await donorRes.json();
                setDonations(data.donations);
            }

            // Donation requests received (if I am a requester)
            // Ideally we should have a route for this, or filter from all donations
            // The previous route /api/profile/donations returns based on role. 
            // If I am a donor, it returns my donations. If I am a requester, it returns received donations.
            // Let's rely on the profile/donations route logic.

            const res = await fetch('/api/profile/donations');
            if (res.ok) {
                const data = await res.json();
                // If I am a donor, these are my donations.
                // If I am a requester, these are donations offered to me.
                setDonations(data.donations);
            }

        } catch (error) {
            console.error('Error fetching donations:', error);
        }
    };

    const handlePhotoUpdate = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        setUpdatingPhoto(true);
        const formData = new FormData();
        formData.append('profileImage', file); // Make sure backend expects 'profileImage' or 'file'

        // Assuming Backend endpoint for photo exists or adapting to what's available
        // In previous turns, we saw /api/donors/[id]/update-photo or similar.
        // Let's try a generic user update-photo if available, or just log for now if specific endpoint unknown.
        // For this task, assuming the endpoint exists or stubbing.

        try {
            // Using a hypothetical endpoint for now as implemented in previous tasks or standardizing
            const response = await fetch('/api/user/update-photo', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUser(prev => ({ ...prev, profileImage: data.imageUrl || data.profileImage }));
            }
        } catch (err) {
            console.error("Error updating photo:", err);
        } finally {
            setUpdatingPhoto(false);
        }
    };

    const handleStatusUpdate = async (donationId, newStatus) => {
        try {
            const res = await fetch('/api/donations/update-status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ donationId, status: newStatus })
            });

            if (res.ok) {
                fetchUserDonations();
                alert(`Status updated to ${newStatus}`);
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col">
                <h2 className="text-xl font-bold mb-4">Please Log In</h2>
                <Link href="/login" className="px-6 py-2 bg-red-600 text-white rounded-lg">Log In</Link>
            </div>
        )
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Profile not found</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-gray-400" />
                            )}
                            {updatingPhoto && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border cursor-pointer hover:bg-gray-50 transition-colors">
                            <Pencil className="w-4 h-4 text-gray-600" />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpdate} />
                        </label>
                        {user.bloodType && (
                            <div className="absolute -top-2 -right-2 bg-[var(--primary)] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md">
                                {user.bloodType}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 mb-6">
                            {user.role !== 'admin' && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {user.city || 'Location not set'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        {user.phone}
                                    </div>
                                </>
                            )}
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </div>

                            {user.role === 'donor' && (
                                <div className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border bg-red-50 text-red-600 border-red-200">
                                    Requester and Donor
                                </div>
                            )}
                            {user.role === 'requester' && (
                                <div className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border bg-blue-50 text-blue-600 border-blue-200">
                                    Requester only
                                </div>
                            )}
                            {user.role === 'admin' && (
                                <div className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border bg-purple-50 text-purple-600 border-purple-200">
                                    Administrator
                                </div>
                            )}
                        </div>

                        {user.role !== 'admin' && (
                            <div className="flex justify-center md:justify-start gap-3">
                                {/* Tabs Navigation */}
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={cn("px-4 py-2 rounded-lg font-medium transition-colors", activeTab === 'overview' ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('donations')}
                                    className={cn("px-4 py-2 rounded-lg font-medium transition-colors", activeTab === 'donations' ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                                >
                                    {userRole === 'donor' ? 'My Donations' : 'Received Requests'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Content for Admin (Simplified) */}
                {user.role === 'admin' ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-xl mb-4">Admin Profile Details</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Name</span>
                                <span className="font-medium">{user.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Email</span>
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Role</span>
                                <span className="font-medium capitalize">{user.role}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Tab Content for Non-Admins */
                    <>
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="font-bold text-xl mb-4">Personal Details</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-gray-500">Email</span>
                                            <span className="font-medium">{user.email}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-gray-500">Address</span>
                                            <span className="font-medium text-right">{user.address || 'Not set'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Only show requests section if they are a requester or have made requests */}
                                {myRequests.length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h2 className="font-bold text-xl mb-4">Your Blood Requests</h2>
                                        <div className="space-y-4">
                                            {myRequests.map(req => (
                                                <div key={req._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-bold">{req.patientName}</p>
                                                        <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={cn("text-xs font-bold px-2 py-1 rounded-full border",
                                                        req.status === 'fulfilled' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'donations' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {userRole === 'donor' ? 'My Donation History' : 'Donation Requests Received'}
                        </h2>

                        {donations.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Activity Yet</h3>
                                <p className="text-gray-500">
                                    {userRole === 'donor' ? "You haven't made any donation requests yet." : "You haven't received any donation offers yet."}
                                </p>
                            </div>
                        ) : (
                            donations.map((donation) => (
                                <div key={donation._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                                                donation.status === 'pending' ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                                                    donation.status === 'accepted' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                        donation.status === 'in-progress' ? "bg-purple-50 text-purple-600 border-purple-200" :
                                                            donation.status === 'completed' ? "bg-green-50 text-green-600 border-green-200" :
                                                                "bg-gray-50 text-gray-600 border-gray-200"
                                            )}>
                                                {donation.status}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(donation.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                                            {userRole === 'donor'
                                                ? `Request for: ${donation.requestId?.patientName || 'Patient'}`
                                                : `Donor: ${donation.donorId?.name || 'Anonymous'}`}
                                        </h3>

                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            {userRole === 'donor' ? (
                                                <>
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {donation.requestId?.hospitalName}, {donation.requestId?.location}
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-semibold text-[var(--primary)]">{donation.donorId?.bloodType}</span>
                                                    Donor • {donation.donorId?.phone || 'Contact hidden'}
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {/* Actions for Requester */}
                                        {userRole === 'requester' && donation.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(donation._id, 'accepted')}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition"
                                                >
                                                    Accept Donation
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(donation._id, 'rejected')}
                                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-sm hover:bg-red-100 transition"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {userRole === 'requester' && donation.status === 'accepted' && (
                                            <button
                                                onClick={() => handleStatusUpdate(donation._id, 'in-progress')}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition"
                                            >
                                                Mark In Progress
                                            </button>
                                        )}

                                        {userRole === 'requester' && donation.status === 'in-progress' && (
                                            <button
                                                onClick={() => handleStatusUpdate(donation._id, 'completed')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Complete Donation
                                            </button>
                                        )}

                                        {/* Actions for Donor */}
                                        {userRole === 'donor' && (donation.status === 'pending' || donation.status === 'accepted') && (
                                            <button
                                                onClick={() => handleStatusUpdate(donation._id, 'cancelled')}
                                                className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
                                            >
                                                Cancel Request
                                            </button>
                                        )}

                                        <Link
                                            href={donation.requestId ? `/requests/${donation.requestId._id}` : '#'}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
                                        >
                                            View Request
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
