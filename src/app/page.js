"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import AIMatchingHero from "@/components/AIMatchingHero"; // Import new component
import Filters from "@/components/Filters";
import RequestCard from "@/components/RequestCard";
import CreateRequestCard from "@/components/CreateRequestCard";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      router.push('/donors');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const url = selectedType
          ? `/api/requests?bloodType=${encodeURIComponent(selectedType)}`
          : '/api/requests';

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch requests');
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role !== 'admin') {
      fetchRequests();
    }
  }, [selectedType, session]);

  if (status === 'loading' || (session?.user?.role === 'admin')) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-12 pb-20">
      <Hero />

      {/* AI Matching Feature Section */}
      <AIMatchingHero />

      <section className="container mx-auto px-4" id="requests">
        <Filters selectedType={selectedType} onTypeChange={setSelectedType} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CreateRequestCard />
          {loading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
            ))
          ) : (
            requests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))
          )}
        </div>

        {!loading && requests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No blood requests found in your area.
          </div>
        )}

        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Load More Requests
          </button>
        </div>
      </section>
    </div>
  );
}
