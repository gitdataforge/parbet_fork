export const fetchUserCity = async () => {
    try {
        // Free, legal, zero-auth IP geolocation endpoint used to replicate Viagogo's zero-click localization
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) {
            throw new Error("Location fetch failed due to network or rate limit.");
        }
        
        const data = await response.json();
        
        // Return the strictly normalized object containing city, country code, and coordinates for the aggregator
        return {
            city: data.city || "Mumbai",
            state: data.region || "Maharashtra",
            countryCode: data.country_code || "IN",
            lat: data.latitude || 19.0760,
            lon: data.longitude || 72.8777
        };
    } catch (error) {
        console.error("Location API Error:", error);
        // Graceful fallback object ensures the Store and Aggregator don't crash on network failure
        return {
            city: "All Cities",
            state: "",
            countryCode: "IN", // Default to India for fallback feed
            lat: null,
            lon: null
        };
    }
};