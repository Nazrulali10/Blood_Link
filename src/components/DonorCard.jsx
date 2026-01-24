
import Link from 'next/link';
import { MapPin, Droplet, Clock } from 'lucide-react';

export default function DonorCard({ donor, isAdmin }) {
    return (
        <Link href={`/donors/${donor.id}`} className="block">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                                {donor.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{donor.location}</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[var(--primary)] font-bold text-sm border border-red-100">
                            {donor.bloodGroup}
                        </div>
                    </div>

                    <div className="space-y-2 mb-6">
                        <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${donor.verified ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                            <div className={`w-2 h-2 rounded-full ${donor.verified ? 'bg-green-500' : 'bg-orange-500'}`} />
                            <span>{donor.verified ? 'Verified' : 'Unverified'}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-gray-50 text-center py-2.5 rounded-xl text-sm font-medium text-gray-600 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    {isAdmin ? 'View & Verify' : 'View Profile'}
                </div>
            </div>
        </Link>
    );
}
