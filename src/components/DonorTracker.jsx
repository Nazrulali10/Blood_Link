"use client";

import { useState, useEffect, useRef } from 'react';
import { database } from '@/lib/firebaseClient';
import { ref, set, remove, onDisconnect } from 'firebase/database';
import { MapPin, Navigation, StopCircle, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DonorTracker({ donationId }) {
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);
    const watchId = useRef(null);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setError(null);
        setIsTracking(true);

        const locationRef = ref(database, `locations/${donationId}`);
        onDisconnect(locationRef).remove();

        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                set(locationRef, {
                    lat: latitude,
                    lng: longitude,
                    lastUpdated: Date.now()
                }).catch(err => {
                    console.error("Firebase update error:", err);
                    setError("Failed to sync location");
                });
            },
            (err) => {
                console.error("Geolocation error:", err);
                let msg = "Failed to get your location";
                if (err.code === 1) msg = "Please allow location access to share your progress";
                setError(msg);
                stopTracking();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const stopTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }

        const locationRef = ref(database, `locations/${donationId}`);
        remove(locationRef);

        setIsTracking(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchId.current !== null) {
                stopTracking();
            }
        };
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isTracking ? "bg-green-100 text-green-600 animate-pulse" : "bg-gray-100 text-gray-400"
                    )}>
                        <Radio size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Live Location Sharing</h4>
                        <p className="text-xs text-gray-500">
                            {isTracking ? "Your location is being shared with the requester" : "Share your journey with the requester"}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-start gap-2 border border-red-100">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <button
                onClick={isTracking ? stopTracking : startTracking}
                className={cn(
                    "w-full p-2 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                    isTracking
                        ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                        : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg shadow-md"
                )}
            >
                {isTracking ? (
                    <>
                        <StopCircle size={18} />
                        Stop Sharing Location
                    </>
                ) : (
                    <>
                        <Navigation size={18} />
                        Start Sharing Live Location
                    </>
                )}
            </button>
        </div>
    );
}
