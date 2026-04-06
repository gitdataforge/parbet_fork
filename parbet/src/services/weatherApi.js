const WEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

/**
 * Fetches weather for specific coordinates.
 * Used for rain probability logic.
 */
export const fetchVenueWeather = async (lat, lon) => {
    if (!WEATHER_KEY || !lat || !lon) return null;
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`);
        return await response.json();
    } catch (error) {
        console.error("WeatherAPI Error:", error);
        return null;
    }
};