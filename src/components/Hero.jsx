"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Heart } from 'lucide-react';
import { Geologica } from "next/font/google";


const geologica = Geologica({ subsets: ["latin"] });

export default function Hero() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleProtectedClick = (e, path) => {
        if (!session) {
            e.preventDefault();
            alert("you should login");
            router.push('/login');
        }
    };

    return (
        <section className={`${geologica.className} relative py-12 lg:py-20 overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-red-50 rounded-full filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-green-50 rounded-full filter blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-4 text-center max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[var(--primary)] text-sm font-medium mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
                    </span>
                    Live Blood Requests Available
                </div>

                <h1 className="text-3xl md:text-3xl lg:text-5xl font-black text-[var(--foreground)] leading-tight mb-4">
                    Connecting Blood Donors with <br className="hidden md:block" />
                    <span className="text-[var(--primary)]">Those in Need — Faster</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                    Instant blood matching using real-time location.
                    Every second counts when saving a life. Join our community today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/create-request"
                        onClick={(e) => handleProtectedClick(e, '/create-request')}
                        className="w-full sm:w-auto px-6 py-3 bg-[var(--primary)] text-white rounded-[var(--radius)] font-bold text-lg hover:bg-red-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Request Blood
                    </Link>
                    <Link
                        href="/become-donor"
                        className="w-full sm:w-auto px-6 py-3 bg-white text-[var(--foreground)] border border-gray-200 rounded-[var(--radius)] font-bold text-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                    >
                        <Heart className="w-5 h-5 text-[var(--primary)] group-hover:fill-[var(--primary)] transition-colors" />
                        Become a Donor
                    </Link>
                </div>

                <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Verified Donors
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        Secure & Private
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div>
                        24/7 Support
                    </div>
                </div>
            </div>
        </section>
    );
}
