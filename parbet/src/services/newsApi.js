const NEWS_KEY = import.meta.env.VITE_NEWS_API_KEY;

/**
 * Fetches news for performers.
 */
export const fetchPerformerNews = async (query) => {
    if (!NEWS_KEY) return [];
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=5&apiKey=${NEWS_KEY}`);
        const data = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error("NewsAPI Error:", error);
        return [];
    }
};