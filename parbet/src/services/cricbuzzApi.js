const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

/**
 * Fetches ball-by-ball commentary using Cricbuzz via RapidAPI
 */
export const fetchLiveCommentary = async (matchId) => {
    if (!RAPIDAPI_KEY || !matchId) return [];
    try {
        const res = await fetch(`https://free-cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/comm`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'free-cricbuzz-cricket.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        });

        // Strictly intercept 403 Forbidden to prevent crash
        if (res.status === 403) {
            console.warn("Cricbuzz API 403 Forbidden: Subscription required. Returning safe fallback.");
            return [];
        }

        // Strictly intercept 404 Not Found
        if (res.status === 404) {
            console.warn("Cricbuzz API 404 Not Found: Match data missing. Returning safe fallback.");
            return [];
        }

        if (!res.ok) return [];

        const data = await res.json();
        return data.commentaryList || [];
    } catch (error) {
        console.error("Commentary fetch error", error);
        return [];
    }
};

export const fetchPlayerStats = async (playerId) => {
    // Safe fallback to prevent infinite loading skeleton if no key is present
    if (!RAPIDAPI_KEY || !playerId) return { batting: { runs: 'N/A', average: 'N/A' } };
    
    try {
        const res = await fetch(`https://free-cricbuzz-cricket.p.rapidapi.com/stats/v1/player/${playerId}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'free-cricbuzz-cricket.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        });

        // Strictly intercept 403 Forbidden and return safe object structure expected by UI
        if (res.status === 403) {
            console.warn("Cricbuzz API 403 Forbidden: Subscription required. Returning fallback stats.");
            return { batting: { runs: 'Locked', average: '403' } }; 
        }

        // Strictly intercept 404 Not Found and return safe fallback stats to prevent React tree crash
        if (res.status === 404) {
            console.warn("Cricbuzz API 404 Not Found: Endpoint or player missing. Returning safe fallback stats.");
            return { batting: { runs: 'N/A', average: 'N/A' } }; 
        }

        if (!res.ok) return { batting: { runs: 'N/A', average: 'N/A' } };

        return await res.json();
    } catch (error) {
        console.error("PlayerStats fetch error", error);
        return { batting: { runs: 'Err', average: 'Err' } };
    }
};