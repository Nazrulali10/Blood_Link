import { cn } from '@/lib/utils';
import { Clock, MapPin, Droplet } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RequestCard({ request }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (session?.user?.id) {
            const fetchRole = async () => {
                const res = await fetch('/api/user/me');
                if (res.ok) {
                    const data = await res.json();
                    setUserRole(data.role);
                }
            };
            fetchRole();
        }
    }, [session]);

    const urgencyColors = {
        High: "bg-red-50 text-red-600 border-red-100",
        Medium: "bg-orange-50 text-orange-600 border-orange-100",
        Low: "bg-blue-50 text-blue-600 border-blue-100"
    };

    const handleDonateClick = (e) => {
        e.preventDefault();
        if (!session) {
            router.push('/login');
            return;
        }

        if (userRole !== 'donor') {
            alert("You must be registered as a donor to donate. Please update your profile or register as a donor.");
            return;
        }

        router.push(`/requests/${request._id}`);
    };

    return (
        <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div
                className="cursor-pointer"
                onClick={() => router.push(`/requests/${request._id}`)}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-xl">
                            {request.bloodType}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-none mb-1">{request.patientName}</h3>
                            <p className="text-sm text-gray-500 font-medium">{request.units} Units Required</p>
                        </div>
                    </div>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider", urgencyColors[request.urgency])}>
                        {request.urgency}
                    </span>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900 block">{request.location}</span>
                            <span className="text-gray-500">{request.distance || 'Nearby'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{request.timePosted}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleDonateClick}
                className="w-full py-3 rounded-lg bg-gray-50 text-[var(--foreground)] font-bold text-sm border border-transparent 
                group-hover:bg-[var(--primary)] group-hover:text-white transition-all active:scale-[0.98]"
            >
                Donate Now
            </button>
        </div>
    );
}

