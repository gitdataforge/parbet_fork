const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

/**
 * Handles Spotify Client Credentials OAuth flow to fetch real artist tracks.
 */
const getAccessToken = async () => {
    if (!CLIENT_ID || !CLIENT_SECRET) return null;
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
};

export const fetchArtistTopTrack = async (artistName) => {
    const token = await getAccessToken();
    if (!token) return null;
    
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const searchData = await searchRes.json();
    const artistId = searchData.artists?.items[0]?.id;
    
    if (!artistId) return null;

    const trackRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const trackData = await trackRes.json();
    return trackData.tracks?.[0] || null;
};

export const fetchRelatedArtists = async (artistName) => {
    const token = await getAccessToken();
    if (!token) return [];
    
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const searchData = await searchRes.json();
    const artistId = searchData.artists?.items[0]?.id;

    if (!artistId) return [];

    const relatedRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const relatedData = await relatedRes.json();
    return relatedData.artists || [];
};