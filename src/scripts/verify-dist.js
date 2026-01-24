function deg2rad(deg) { return deg * (Math.PI / 180); }
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const req = { lat: 13.0776, lng: 80.2917 };
const donor = { lat: 12.6165, lng: 79.9747 };

const dist = calculateDistance(req.lat, req.lng, donor.lat, donor.lng);
console.log(`Distance: ${dist.toFixed(2)} km`);
if (dist > 50) console.log("Outside 50km limit");
else console.log("Inside 50km limit");
