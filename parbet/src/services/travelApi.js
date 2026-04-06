const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const AMADEUS_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
const AMADEUS_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;

/**
 * Calculates exact drive time using Mapbox Directions API
 */
export const getDriveTime = async (startLon, startLat, endLon, endLat) => {
    if (!MAPBOX_TOKEN) return null;
    try {
        const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startLon},${startLat};${endLon},${endLat}?access_token=${MAPBOX_TOKEN}`);
        const data = await res.json();
        const durationSeconds = data.routes[0]?.duration || 0;
        return Math.round(durationSeconds / 60); // Return in minutes
    } catch (err) {
        console.error("Mapbox error:", err);
        return null;
    }
};

/**
 * Authenticates with Amadeus and fetches live flight/hotel data
 */
const getAmadeusToken = async () => {
    if (!AMADEUS_KEY || !AMADEUS_SECRET) return null;
    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${AMADEUS_KEY}&client_secret=${AMADEUS_SECRET}`
    });
    const data = await res.json();
    return data.access_token;
};

export const fetchHotelOffers = async (lat, lon) => {
    const token = await getAmadeusToken();
    if (!token) return [];
    try {
        const res = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${lat}&longitude=${lon}&radius=5&radiusUnit=KM`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return data.data || [];
    } catch (err) {
        return [];
    }
};