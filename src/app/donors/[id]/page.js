'use client';

import { useState, useEffect, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Calendar, Droplet, CheckCircle, XCircle, ArrowLeft, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import Footer from '@/components/Footer';

export default function DonorProfilePage({ params }) {
    const { data: session } = useSession();
    const router = useRouter();
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const [donor, setDonor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDonor = async () => {
            try {
                const response = await fetch(`/api/donors/${id}`);
                if (response.status === 404) {
                    setError('not_found');
                    return;
                }
                if (!response.ok) throw new Error('Failed to fetch donor details');
                const data = await response.json();
                setDonor(data);
            } catch (err) {
                console.error("Error fetching donor:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDonor();
    }, [id]);

    const handleLocationClick = () => {
        if (!donor.location) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donor.location)}`;
        window.open(url, '_blank');
    };

    const handleVerificationToggle = async () => {
        try {
            const newStatus = !donor.verified;
            const res = await fetch(`/api/donors/${id}/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified: newStatus })
            });

            if (res.ok) {
                setDonor({ ...donor, verified: newStatus });
            } else {
                alert("Failed to update verification status");
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error updating status");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading donor profile...</p>
            </main>
        );
    }

    if (error === 'not_found') {
        notFound();
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link href="/donors" className="bg-[var(--primary)] text-white px-6 py-2 rounded-xl font-medium">
                    Back to Donors
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Link
                    href="/donors"
                    className="inline-flex items-center text-gray-600 hover:text-[var(--primary)] mb-6 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Donors
                </Link>

                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 relative">
                        <div className="absolute -bottom-16 left-8 md:left-12">
                            {donor.profileImage ? (
                                <img
                                    src={donor.profileImage}
                                    alt={donor.name}
                                    className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-4xl font-bold text-[var(--primary)]">
                                    {donor.bloodGroup}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="pt-20 pb-8 px-8 md:px-12">
                        {/* Name + Availability */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{donor.name}</h1>
                                    <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-lg shadow-sm">
                                        {donor.bloodGroup}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLocationClick}
                                    className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary)] transition-colors group/loc mb-3"
                                >
                                    <MapPin className="w-5 h-5 text-gray-400 group-hover/loc:animate-bounce group-hover/loc:text-[var(--primary)]" />
                                    <span className="hover:underline">{donor.location}</span>
                                </button>
                                <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-red-50 text-red-600 border-red-200">
                                    Requester and Donor
                                </div>
                            </div>

                            {/* Admin Actions */}
                            {session?.user?.role === 'admin' ? (
                                <div className="flex gap-3">
                                    <a
                                        href={`tel:${donor.phone}`}
                                        className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                                        title="Call Donor"
                                    >
                                        <Phone className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={`mailto:${donor.email}`}
                                        className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 transition-colors"
                                        title="Email Donor"
                                    >
                                        <Mail className="w-5 h-5" />
                                    </a>
                                    <button
                                        onClick={handleVerificationToggle}
                                        className={`h-10 px-4 rounded-full font-medium flex items-center gap-2 transition-colors ${donor.verified
                                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                            : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                                            }`}
                                    >
                                        {donor.verified ? (
                                            <>
                                                <XCircle className="w-5 h-5" />
                                                Unverify
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-5 h-5" />
                                                Verify
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${donor.availability === 'Available'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                        }`}>
                                    {donor.availability === 'Available' ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <XCircle className="w-5 h-5" />
                                    )}
                                    {donor.availability}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <span className="block text-gray-500 text-sm mb-1">Last Donation</span>
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <Calendar className="w-5 h-5 text-[var(--primary)]" />
                                    {donor.lastDonation || 'No record'}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <span className="block text-gray-500 text-sm mb-1">Status</span>
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    {donor.verified ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-blue-500" />
                                            Verified Donor
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-5 h-5 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center">
                                                <XCircle className="w-4 h-4 text-gray-400" />
                                            </span>
                                            Unverified
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <span className="block text-gray-500 text-sm mb-1">Response Rate</span>
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <Droplet className="w-5 h-5 text-[var(--primary)]" />
                                    High
                                </div>
                            </div>
                        </div>

                        {/* About + Contact */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                                <p className="text-gray-600 leading-relaxed">{donor.bio || 'No bio provided.'}</p>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[var(--primary)]/30 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                                Phone
                                            </span>
                                            <span className="text-gray-900 font-medium">{donor.phone}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[var(--primary)]/30 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                                Email
                                            </span>
                                            <span className="text-gray-900 font-medium">{donor.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
