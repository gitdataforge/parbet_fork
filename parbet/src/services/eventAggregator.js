/**
 * src/services/eventAggregator.js
 * * Master Controller for Parbet 2026 Multi-API Orchestration.
 * Aggregates data from The Odds API, CricAPI, and SeatGeek.
 * Strictly handles deduplication, normalization, and temporal filtering.
 */

const ODDS_API_KEY = import.meta.env.VITE_ODDS_API_KEY || '';
const CRIC_API_KEY = import.meta.env.VITE_CRIC_API_KEY || '';
const SEATGEEK_CLIENT_ID = import.meta.env.VITE_SEATGEEK_CLIENT_ID || '';

/**
 * Enhanced fetch with exponential backoff and strict early-exit auth checks.
 */
async function fetchWithRetry(url, options = {}, retries = 5, backoff = 1000) {
    let response;
    
    try {
        response = await fetch(url, options);
    } catch (networkError) {
        // Handle pure network failures (e.g., DNS issues, ERR_CONNECTION_RESET)
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw networkError;
    }

    // Strict early-exit condition: Do not retry if the API explicitly rejects our authentication
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error(`Critical Auth Error (${response.status}): Aborting retry loop for ${url}`);
        }
        
        // For other HTTP errors (like 429 Too Many Requests or 500 Server Error), continue retrying
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
}

/**
 * Normalizes Odds API data structure
 */
function transformOddsEvent(match) {
    const date = new Date(match.commence_time);
    return {
        id: match.id,
        t1: match.home_team,
        t2: match.away_team,
        league: match.sport_title,
        commence_time: match.commence_time,
        dow: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        loc: "Verified Venue", // Odds API doesn't provide specific venue without extra calls
        country: 'GLOBAL', // Allowed to pass geo-fences for international sports
        source: 'OddsAPI'
    };
}

/**
 * Normalizes CricAPI (CricketData.org) structure for IPL 2026 and International Cricket
 */
function transformCricEvent(match) {
    const date = new Date(match.dateTimeGMT);
    const teams = match.name.split(' vs ');
    return {
        id: match.id,
        t1: teams[0] || 'Team A',
        t2: teams[1] || 'Team B',
        league: match.series_id || 'Cricket',
        commence_time: match.dateTimeGMT,
        dow: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        loc: match.venue || 'Cricket Stadium',
        country: 'IN',
        source: 'CricAPI'
    };
}

/**
 * Normalizes SeatGeek data structure for Concerts, Theatre, and Global Events
 */
function transformSeatGeekEvent(event) {
    const date = new Date(event.datetime_utc);
    return {
        id: `sg_${event.id}`,
        t1: event.performers[0]?.name || event.title,
        t2: event.performers.length > 1 ? event.performers[1].name : null,
        league: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        commence_time: event.datetime_utc,
        dow: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        loc: `${event.venue.city}, ${event.venue.name}`,
        country: event.venue.country || 'US',
        source: 'SeatGeek'
    };
}

/**
 * Main Aggregator logic
 * @param {Object} location - { city, countryCode }
 */
export async function aggregateAllEvents(location = { city: 'Mumbai', countryCode: 'IN' }) {
    const results = [];
    
    // Concurrent fetch promises
    const promises = [];

    // 1. Fetch from Odds API (Soccer, NBA, etc)
    if (ODDS_API_KEY) {
        const oddsUrl = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=us,uk,eu,au&markets=h2h&apiKey=${ODDS_API_KEY}`;
        promises.push(
            fetchWithRetry(oddsUrl)
                .then(data => data.map(transformOddsEvent))
                .catch((err) => {
                    console.warn("OddsAPI Data Dropped:", err.message);
                    return [];
                })
        );
    }

    // 2. Fetch from CricAPI (IPL 2026 Focus)
    if (CRIC_API_KEY) {
        const cricUrl = `https://api.cricketdata.org/v1/cricScore?apikey=${CRIC_API_KEY}`;
        promises.push(
            fetchWithRetry(cricUrl)
                .then(data => (data.data || []).map(transformCricEvent))
                .catch((err) => {
                    console.warn("CricAPI Data Dropped:", err.message);
                    return [];
                })
        );
    }

    // 3. Fetch from SeatGeek (Concerts & Theatre based on user location)
    if (SEATGEEK_CLIENT_ID) {
        // We strictly pass the user's city to SeatGeek to pull local venue data
        const sgUrl = `https://api.seatgeek.com/2/events?venue.city=${encodeURIComponent(location.city)}&client_id=${SEATGEEK_CLIENT_ID}&per_page=50`;
        promises.push(
            fetchWithRetry(sgUrl)
                .then(data => (data.events || []).map(transformSeatGeekEvent))
                .catch((err) => {
                    console.warn("SeatGeek Data Dropped:", err.message);
                    return [];
                })
        );
    }

    try {
        const allFetchedGroups = await Promise.all(promises);
        const flattened = allFetchedGroups.flat();

        // Strict Logic: Deduplicate, Temporal Fencing, and Geo-Fencing
        const seen = new Set();
        const unified = flattened.filter(event => {
            // Filter 1: Strict Temporal check (Must be upcoming)
            // Any event from the past is immediately dropped
            const startTime = new Date(event.commence_time).getTime();
            if (startTime < Date.now()) return false;

            // Filter 2: Deduplication based on teams and date
            const slug = `${event.t1}-${event.t2}-${event.day}-${event.month}`.toLowerCase();
            if (seen.has(slug)) return false;
            seen.add(slug);

            // Filter 3: Strict Location/Country Payload Filtering
            // Discard foreign events (e.g., USA/UK events) if the user is in a different country (e.g., India)
            if (location && location.countryCode) {
                const userCountry = location.countryCode.toUpperCase();
                const eventCountry = (event.country || '').toUpperCase();
                
                // Allow 'GLOBAL' tagged international events, but strictly filter local venue events
                if (eventCountry && eventCountry !== 'GLOBAL' && eventCountry !== userCountry) {
                    return false;
                }
            }

            return true;
        });

        // Final Logic: Chronological Sort to surface the most immediate events first
        return unified.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());

    } catch (error) {
        console.error("Aggregation Critical Failure:", error);
        return [];
    }
}

/**
 * Filter utility for Performer Deep Dives (e.g. Mumbai Indians)
 */
export function filterEventsByPerformer(events, performerName, filters = {}) {
    return events.filter(e => {
        const isParticipant = e.t1.toLowerCase().includes(performerName.toLowerCase()) || 
                             (e.t2 && e.t2.toLowerCase().includes(performerName.toLowerCase()));
        
        if (!isParticipant) return false;

        // Apply dynamic tabs (Home/Away, Opponents, Price etc)
        if (filters.homeOnly && !e.t1.toLowerCase().includes(performerName.toLowerCase())) return false;
        if (filters.awayOnly && e.t1.toLowerCase().includes(performerName.toLowerCase())) return false;
        if (filters.opponent && !e.t1.toLowerCase().includes(filters.opponent.toLowerCase()) && 
            !e.t2?.toLowerCase().includes(filters.opponent.toLowerCase())) return false;

        return true;
    });
}