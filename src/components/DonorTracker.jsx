"use client";

import { useState, useEffect, useRef } from 'react';
import { database } from '@/lib/firebaseClient';
import { ref, set, remove, onDisconnect } from 'firebase/database';
import { MapPin, Navigation, StopCircle, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DonorTracker({ donationId }) {
    const [isTracking, setIsTracking] = useState(false);
    const [isMock, setIsMock] = useState(false);
    const [error, setError] = useState(null);
    const watchId = useRef(null);
    const mockInterval = useRef(null);

    const RAMNAD_COORDS = { lat: 9.3639, lng: 78.8395 };

    const startTracking = (useMock = false) => {
        if (!useMock && !navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setError(null);
        setIsTracking(true);
        setIsMock(useMock);

        const locationRef = ref(database, `locations/${donationId}`);
        onDisconnect(locationRef).remove();

        if (useMock) {
            console.log("[DonorTracker] Starting Mock Tracking (Ramnad)");
            // Simulate slight movement around Ramnad
            let angle = 0;
            mockInterval.current = setInterval(() => {
                const lat = RAMNAD_COORDS.lat + Math.sin(angle) * 0.001;
                const lng = RAMNAD_COORDS.lng + Math.cos(angle) * 0.001;
                angle += 0.2;

                set(locationRef, {
                    lat,
                    lng,
                    lastUpdated: Date.now(),
                    isMock: true
                });
            }, 3000);
        } else {
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
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }
    };

    const stopTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        if (mockInterval.current !== null) {
            clearInterval(mockInterval.current);
            mockInterval.current = null;
        }

        const locationRef = ref(database, `locations/${donationId}`);
        remove(locationRef);

        setIsTracking(false);
        setIsMock(false);
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

            <div className="flex flex-col gap-3">
                <button
                    onClick={isTracking ? stopTracking : () => startTracking(false)}
                    disabled={isTracking && isMock}
                    className={cn(
                        "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                        isTracking && !isMock
                            ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                            : "bg-[var(--primary)] text-white hover:bg-red-700 shadow-md hover:shadow-lg disabled:opacity-50"
                    )}
                >
                    {isTracking && !isMock ? (
                        <>
                            <StopCircle size={18} />
                            Stop Sharing Real Location
                        </>
                    ) : (
                        <>
                            <Navigation size={18} />
                            Start Sharing Live Location
                        </>
                    )}
                </button>

                {!isTracking && (
                    <button
                        onClick={() => startTracking(true)}
                        className="w-full py-2.5 rounded-xl font-semibold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Navigation size={16} />
                        Simulate Ramanathapuram (Test Mode)
                    </button>
                )}

                {isTracking && isMock && (
                    <button
                        onClick={stopTracking}
                        className="w-full py-3 rounded-xl font-bold bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        <StopCircle size={18} />
                        Stop Simulation
                    </button>
                )}
            </div>
        </div>
    );
}
