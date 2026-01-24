"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, MapPin, Clock, Droplet, User, Phone, CheckCircle, AlertTriangle, Check, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RequestDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [request, setRequest] = useState(null);
    const [requester, setRequester] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [interests, setInterests] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(null); // ID of donation being updated
    const [currentUser, setCurrentUser] = useState(null);
    const [donationStatus, setDonationStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
    const [donationError, setDonationError] = useState("");

    const fetchRequestDetails = async () => {
        try {
            const res = await fetch(`/api/requests/${id}`);
            if (!res.ok) throw new Error('Failed to fetch request details');
            const data = await res.json();
            setRequest(data.request);
            setRequester(data.requester);
            setInterests(data.donations || []);

            // Check if current user is compatible donor
            if (session?.user) {
                const userRes = await fetch('/api/user/me');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setCurrentUser(userData);
                }
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchRequestDetails();
    }, [id, session]);

    const handleStatusUpdate = async (donationId, newStatus) => {
        setUpdatingStatus(donationId);
        try {
            const res = await fetch('/api/donations/update-status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ donationId, status: newStatus })
            });

            if (res.ok) {
                await fetchRequestDetails();
                if (newStatus === 'accepted') alert("Donation offer accepted!");
                if (newStatus === 'completed') alert("Request fulfilled! Thank you.");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An unexpected error occurred.");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const checkCompatibility = (donorType, recipientType) => {
        const compatibility = {
            'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            'O+': ['O+', 'A+', 'B+', 'AB+'],
            'A-': ['A-', 'A+', 'AB-', 'AB+'],
            'A+': ['A+', 'AB+'],
            'B-': ['B-', 'B+', 'AB-', 'AB+'],
            'B+': ['B+', 'AB+'],
            'AB-': ['AB-', 'AB+'],
            'AB+': ['AB+']
        };
        return compatibility[donorType]?.includes(recipientType) || false;
    };

    const handleDonate = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        if (currentUser?.role !== 'donor') {
            setDonationError("Only registered donors can donate. Please register as a donor.");
            return;
        }

        if (!checkCompatibility(currentUser.bloodType, request.bloodType)) {
            setDonationError(`Your blood type (${currentUser.bloodType}) is not compatible with ${request.bloodType}.`);
            return;
        }

        setDonationStatus('loading');
        setDonationError("");

        try {
            const res = await fetch('/api/donations/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: id })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send donation request');
            }

            setDonationStatus('success');
            // Optimistic update or just show success message
        } catch (err) {
            setDonationError(err.message);
            setDonationStatus('error');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!request) return <div className="min-h-screen flex items-center justify-center">Request not found</div>;

    const urgencyColors = {
        High: "bg-red-50 text-red-600 border-red-100",
        Medium: "bg-orange-50 text-orange-600 border-orange-100",
        Low: "bg-blue-50 text-blue-600 border-blue-100"
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Requests
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{request.patientName}</h1>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${request.geolocation?.lat && request.geolocation?.lng
                                        ? `${request.geolocation.lat},${request.geolocation.lng}`
                                        : encodeURIComponent(`${request.hospitalName}, ${request.location}`)
                                        }`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-[var(--primary)] hover:underline flex items-center gap-2 transition-colors cursor-pointer group"
                                >
                                    <MapPin className="w-4 h-4 group-hover:text-[var(--primary)] transition-colors" />
                                    {request.hospitalName}, {request.location}
                                </a>
                            </div>
                            <span className={cn("px-4 py-2 rounded-full text-sm font-bold border uppercase tracking-wider", urgencyColors[request.urgency])}>
                                {request.urgency} Urgency
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center text-2xl font-black text-[var(--primary)] shadow-sm">
                                    {request.bloodType}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Blood Type</p>
                                    <p className="text-gray-900 font-medium">Required</p>
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                    <Droplet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Units</p>
                                    <p className="text-gray-900 font-medium">{request.units} Units</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                Requester Details
                            </h3>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                {requester?.profileImage ? (
                                    <img src={requester.profileImage} alt={requester.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900">{requester?.name || request.requesterName}</p>
                                    <p className="text-sm text-gray-500">Posted on {new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {request.notes && (
                            <div className="mt-8">
                                <h3 className="font-bold text-gray-900 mb-2">Additional Notes</h3>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                    {request.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100">
                        {/* Requester View: Interests and Offers */}
                        {session?.user?.id === request.creatorId && interests.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-red-600" />
                                    Donation Offers Received
                                </h3>
                                <div className="space-y-4">
                                    {interests.map((interest) => (
                                        <div key={interest._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center font-bold text-[var(--primary)] border border-red-100">
                                                    {interest.donorId?.bloodType}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                                        {interest.donorId?.name}
                                                        {interest.donorId?.isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{interest.donorId?.phone || 'Contact provided after acceptance'}</p>
                                                    <div className="mt-1">
                                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                                            interest.status === 'pending' ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                                                                interest.status === 'accepted' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                                    interest.status === 'in-progress' ? "bg-purple-50 text-purple-600 border-purple-200" :
                                                                        interest.status === 'completed' ? "bg-green-50 text-green-600 border-green-200" :
                                                                            "bg-gray-50 text-gray-600 border-gray-200"
                                                        )}>
                                                            {interest.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto">
                                                {interest.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(interest._id, 'accepted')}
                                                            disabled={updatingStatus === interest._id}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2"
                                                        >
                                                            {updatingStatus === interest._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(interest._id, 'rejected')}
                                                            disabled={updatingStatus === interest._id}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-white text-red-600 border border-red-100 rounded-lg font-semibold text-sm hover:bg-red-50 transition flex items-center justify-center gap-2"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {interest.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(interest._id, 'in-progress')}
                                                        disabled={updatingStatus === interest._id}
                                                        className="flex-1 md:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                                    >
                                                        {updatingStatus === interest._id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                        Mark In Progress
                                                    </button>
                                                )}

                                                {interest.status === 'in-progress' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(interest._id, 'completed')}
                                                        disabled={updatingStatus === interest._id}
                                                        className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2"
                                                    >
                                                        {updatingStatus === interest._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                        Complete Donation
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Donor View: Expression of Interest */}
                        {session?.user?.id !== request.creatorId && (
                            donationStatus === 'success' ? (
                                <div className="bg-green-100 text-green-800 p-6 rounded-xl text-center border border-green-200">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                                    <h3 className="font-bold text-xl mb-2">Request Sent!</h3>
                                    <p>Thank you for your willingness to donate. The requester has been notified.</p>
                                    <Link href="/profile" className="inline-block mt-4 text-green-700 font-semibold underline">
                                        View in Profile
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {donationError && (
                                        <div className="mb-4 bg-red-100 text-red-700 p-4 rounded-lg flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p>{donationError}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {currentUser?.role === 'donor' ? (
                                            <button
                                                onClick={handleDonate}
                                                disabled={donationStatus === 'loading'}
                                                className="flex-1 py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {donationStatus === 'loading' ? 'Sending Request...' : 'Willing to Donate'}
                                            </button>
                                        ) : (
                                            <div className="w-full text-center p-4">
                                                {!session ? (
                                                    <p className="text-gray-500">Please <Link href="/login" className="text-[var(--primary)] font-bold">Log In</Link> to donate.</p>
                                                ) : (
                                                    <p className="text-gray-500">Only registered donors can donate.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
