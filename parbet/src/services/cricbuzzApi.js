const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

/**
 * Fetches ball-by-ball commentary using Cricbuzz via RapidAPI
 */
export const fetchLiveCommentary = async (matchId) => {
    if (!RAPIDAPI_KEY || !matchId) return [];
    try {
        const res = await fetch(`https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/comm`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
            }
        });
        const data = await res.json();
        return data.commentaryList || [];
    } catch (error) {
        console.error("Commentary fetch error", error);
        return [];
    }
};

export const fetchPlayerStats = async (playerId) => {
    if (!RAPIDAPI_KEY || !playerId) return null;
    try {
        const res = await fetch(`https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/${playerId}`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
            }
        });
        return await res.json();
    } catch (error) {
        return null;
    }
};