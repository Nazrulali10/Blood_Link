"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from '@/lib/firebaseClient';
import { ref, onValue, off } from 'firebase/database';
import { Loader2, MapPin } from 'lucide-react';

// Using standard icons from a reliable CDN to ensure visibility
const DonorIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const DestinationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapController({ donorPos, destPos }) {
    const map = useMap();
    useEffect(() => {
        if (donorPos && destPos) {
            // Check if they are identical
            if (donorPos[0] === destPos[0] && donorPos[1] === destPos[1]) {
                console.log("[LiveMap] Positions are identical, zooming into single point.");
                map.setView(donorPos, 16);
            } else {
                console.log("[LiveMap] Fitting bounds to:", { donorPos, destPos });
                const bounds = L.latLngBounds([donorPos, destPos]);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        } else if (donorPos) {
            console.log("[LiveMap] Centering on donor:", donorPos);
            map.setView(donorPos, 15);
        } else if (destPos) {
            console.log("[LiveMap] Centering on destination:", destPos);
            map.setView(destPos, 15);
        }
    }, [donorPos, destPos, map]);
    return null;
}

export default function LiveMap({ donationId, destination, donorName }) {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log("[LiveMap] Props:", { donationId, destination, donorName });

    useEffect(() => {
        if (!donationId) return;

        const locationRef = ref(database, `locations/${donationId}`);

        const unsubscribe = onValue(locationRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.lat && data.lng) {
                setPosition([data.lat, data.lng]);
                setLoading(false);
            } else {
                setLoading(false);
                // Don't set error yet, might be waiting for first update
            }
        }, (err) => {
            console.error("Firebase error:", err);
            setError("Failed to connect to tracking service");
            setLoading(false);
        });

        return () => {
            off(locationRef);
            unsubscribe();
        };
    }, [donationId]);

    if (loading && !position) {
        return (
            <div className="h-[400px] w-full bg-gray-100 rounded-xl flex items-center justify-center flex-col gap-3">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                <p className="text-gray-500 font-medium">Waiting for donor&apos;s location...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[400px] w-full bg-red-50 rounded-xl flex items-center justify-center flex-col gap-3 border border-red-100">
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        );
    }

    const mapCenter = position || destination || [20.5937, 78.9629]; // India center as fallback

    return (
        <div className="h-[450px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative mb-4">
            <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {destination && (
                    <Marker position={destination} icon={DestinationIcon}>
                        <Popup>
                            <div className="text-center p-1">
                                <p className="font-bold text-blue-600">Hospital / Destination</p>
                                <p className="text-xs text-gray-500">Target Location</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {position && (
                    <Marker
                        position={
                            // If they are exactly the same, offset the donor slightly for visibility
                            destination && Math.abs(position[0] - destination[0]) < 0.0001 && Math.abs(position[1] - destination[1]) < 0.0001
                                ? [position[0] + 0.0003, position[1] + 0.0003]
                                : position
                        }
                        icon={DonorIcon}
                    >
                        <Popup>
                            <div className="text-center p-1">
                                <p className="font-bold text-red-600">{donorName || 'Donor'} (Live)</p>
                                <p className="text-xs text-gray-500">Updating real-time</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <MapController donorPos={position} destPos={destination} />
            </MapContainer>

            <div className="absolute top-4 right-4 z-[1000] bg-black/60 backdrop-blur-md p-3 rounded-lg text-[10px] text-white space-y-1">
                <p className="font-bold border-b border-white/20 pb-1 mb-1">Debug Info</p>
                <p>Dest: {destination ? `${destination[0].toFixed(4)}, ${destination[1].toFixed(4)}` : 'None'}</p>
                <p>Donor: {position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : 'Waiting...'}</p>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200 text-xs space-y-2">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="font-semibold text-gray-700">Donor Live Location</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-gray-700">Target Hospital</span>
                </div>
            </div>

            {!position && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="text-center p-6">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-900 font-bold mb-1">Donor hasn&apos;t started sharing yet</p>
                        <p className="text-gray-500 text-sm">Real-time updates will appear here once sharing begins.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
