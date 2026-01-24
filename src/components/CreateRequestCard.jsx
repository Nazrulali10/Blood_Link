"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function CreateRequestCard() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleClick = (e) => {
        if (!session) {
            e.preventDefault();
            alert("you should login");
            router.push('/login');
        } else {
            router.push('/create-request');
        }
    };

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer group flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-[var(--primary)] hover:bg-red-50/30 transition-all duration-300 h-full min-h-[280px]"
        >
            <div className="w-16 h-16 rounded-full bg-red-100 text-[var(--primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[var(--primary)] transition-colors">
                Create Request
            </h3>
            <p className="text-gray-500 text-center text-sm px-4">
                Need blood donation? Create a new request to find donors nearby.
            </p>
        </div>
    );
}
