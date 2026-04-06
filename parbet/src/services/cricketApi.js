const CRIC_API_KEY = import.meta.env.VITE_CRIC_API_KEY;
const BASE_URL = 'https://api.cricapi.com/v1';

/**
 * Fetches real-time live match scores.
 * Strictly real data from CricketData.org.
 */
export const fetchLiveScores = async () => {
    if (!CRIC_API_KEY) return [];
    try {
        const response = await fetch(`${BASE_URL}/currentMatches?apikey=${CRIC_API_KEY}&offset=0`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("CricAPI Fetch Error:", error);
        return [];
    }
};