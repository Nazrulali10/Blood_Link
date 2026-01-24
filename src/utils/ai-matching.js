import Donor from '@/models/Donor';

/**
 * Calculates distance between two coordinates in km using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Compatible blood types chart
 */
const CAN_RECEIVE_FROM = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'O+': ['O+', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
    'A-': ['A-', 'O-'],
    'O-': ['O-'], // Universal Donor
    'B-': ['B-', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-']
};

export async function findMatchingDonors(request) {
    try {
        console.log(`[AI Matching] Starting search for request: ${request._id}`);
        const { bloodType, geolocation, urgency } = request;

        // 1. Filter by Blood Type Compatibility
        const compatibleTypes = CAN_RECEIVE_FROM[bloodType] || [];
        console.log(`[AI Matching] Compatible blood types for ${bloodType}:`, compatibleTypes);

        // 2. Base Query: Compatible types + Eligible to donate + Notifications enabled
        // Note: In a real app, we'd also check 'lastDonatedOn' vs current date > 56 days
        const query = {
            bloodType: { $in: compatibleTypes },
            isVerified: true,
            availabilityStatus: 'Available',
            // eligibleToDonate: true, // You might want to uncomment this if you enforce it strictly
            notifyForNearbyRequests: true,
        };
        console.log(`[AI Matching] Querying donors with:`, JSON.stringify(query));

        const potentialDonors = await Donor.find(query);

        if (potentialDonors.length === 0) {
            console.log("[AI Matching] No donors found with the above query.");
            // Debug: check if any exist with just blood type
            const bloodMatches = await Donor.countDocuments({ bloodType: { $in: compatibleTypes } });
            console.log(`[AI Matching] Debug: Found ${bloodMatches} donors with compatible blood type (ignoring verification/status).`);
        } else {
            console.log(`[AI Matching] Found ${potentialDonors.length} potential donors based on blood type/status.`);
        }

        // 3. Filter and Rank by Distance (Geospatial AI)
        const matches = potentialDonors.map(donor => {
            let distance = Infinity;

            console.log(`[AI Matching] Checking donor: ${donor.name} (${donor.bloodType})`);
            console.log(`[AI Matching] Donor Geo:`, donor.geolocation);
            console.log(`[AI Matching] Request Geo:`, geolocation);

            // Check if donor has valid geolocation
            if (donor.geolocation && donor.geolocation.lat && donor.geolocation.lng &&
                geolocation && geolocation.lat && geolocation.lng) {

                distance = calculateDistance(
                    geolocation.lat, geolocation.lng,
                    donor.geolocation.lat, donor.geolocation.lng
                );
                console.log(`[AI Matching] Calculated distance: ${distance.toFixed(2)} km`);
            } else {
                console.log(`[AI Matching] Could not calculate distance (missing geo data)`);
            }

            return {
                donor,
                distance
            };
        }).filter(match => {
            const limit = match.donor.preferredDistanceLimit || 50;
            console.log(`[AI Matching] Filtering ${match.donor.name}: distance=${match.distance}, limit=${limit}`);

            if (match.distance !== Infinity) {
                const isWithinLimit = match.distance <= limit;
                console.log(`[AI Matching] Is within limit? ${isWithinLimit}`);
                return isWithinLimit;
            }

            console.log(`[AI Matching] Including donor with Infinity distance (no geo)`);
            return true;
        });

        // 4. Ranking (Sort by distance)
        matches.sort((a, b) => a.distance - b.distance);

        console.log(`[AI Matching] Final matched donors: ${matches.length}`);
        return matches;

    } catch (error) {
        console.error("[AI Matching] Error finding donors:", error);
        return [];
    }
}
