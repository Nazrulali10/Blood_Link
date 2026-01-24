'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import DonorCard from '@/components/DonorCard';


export default function DonorsPage() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, verified, unverified
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDonors = async () => {
            try {
                const response = await fetch('/api/donors');
                if (!response.ok) throw new Error('Failed to fetch donors');
                const data = await response.json();
                setDonors(data);
            } catch (err) {
                console.error("Error fetching donors:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDonors();
    }, []);

    const [bloodFilter, setBloodFilter] = useState('all');

    const filteredDonors = donors.filter((donor) => {
        const matchesSearch = donor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.location?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (bloodFilter !== 'all' && donor.bloodGroup !== bloodFilter) return false;

        if (session?.user?.role === 'admin') {
            if (statusFilter === 'verified') return donor.verified;
            if (statusFilter === 'unverified') return !donor.verified;
        }

        return true;
    });

    return (
        <main className="min-h-screen bg-gray-50">


            {/* Header Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
                        Find Blood Donors
                    </h1>
                    <p className="text-gray-600 max-w-2xl text-lg">
                        Connect with verified blood donors in your area. Every donor here is a potential lifesaver ready to help.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, blood group, or location..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Admin Status Filter */}
                    {session?.user?.role === 'admin' && (
                        <div className="flex gap-2">
                            {['all', 'verified', 'unverified'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === filter
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Blood Type Filter */}
                    <div className="flex-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setBloodFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${bloodFilter === 'all'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                All Types
                            </button>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setBloodFilter(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${bloodFilter === type
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Donors Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mb-4" />
                        <p className="text-gray-500">Loading verified donors...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                        <h3 className="text-lg font-medium text-red-800">Error loading donors</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : filteredDonors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDonors.map((donor) => (
                            <DonorCard
                                key={donor.id}
                                donor={donor}
                                isAdmin={session?.user?.role === 'admin'}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No donors found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                    </div>
                )}
            </div>

        </main>
    );
}
