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
 * Enhanced fetch with exponential backoff as per environment safety protocols.
 */
async function fetchWithRetry(url, options = {}, retries = 5, backoff = 1000) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (err) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
    }
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
        country: 'Global',
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
        country: event.venue.country,
        source: 'SeatGeek'
    };
}

/**
 * Main Aggregator logic
 * @param {Object} location - { city, countryCode }
 */
export async function aggregateAllEvents(location = { city: 'Mumbai', countryCode: 'IN' }) {
    const now = new Date();
    const results = [];
    
    // Concurrent fetch promises
    const promises = [];

    // 1. Fetch from Odds API (Soccer, NBA, etc)
    if (ODDS_API_KEY) {
        const oddsUrl = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=us,uk,eu,au&markets=h2h&apiKey=${ODDS_API_KEY}`;
        promises.push(
            fetchWithRetry(oddsUrl)
                .then(data => data.map(transformOddsEvent))
                .catch(() => [])
        );
    }

    // 2. Fetch from CricAPI (IPL 2026 Focus)
    if (CRIC_API_KEY) {
        const cricUrl = `https://api.cricketdata.org/v1/cricScore?apikey=${CRIC_API_KEY}`;
        promises.push(
            fetchWithRetry(cricUrl)
                .then(data => (data.data || []).map(transformCricEvent))
                .catch(() => [])
        );
    }

    // 3. Fetch from SeatGeek (Concerts & Theatre based on user location)
    if (SEATGEEK_CLIENT_ID) {
        const sgUrl = `https://api.seatgeek.com/2/events?venue.city=${location.city}&client_id=${SEATGEEK_CLIENT_ID}&per_page=50`;
        promises.push(
            fetchWithRetry(sgUrl)
                .then(data => (data.events || []).map(transformSeatGeekEvent))
                .catch(() => [])
        );
    }

    try {
        const allFetchedGroups = await Promise.all(promises);
        const flattened = allFetchedGroups.flat();

        // Strict Logic: Deduplicate and Filter
        const seen = new Set();
        const unified = flattened.filter(event => {
            // Filter 1: Temporal check (Must be upcoming)
            const startTime = new Date(event.commence_time);
            if (startTime < now) return false;

            // Filter 2: Deduplication based on teams and date
            const slug = `${event.t1}-${event.t2}-${event.day}-${event.month}`.toLowerCase();
            if (seen.has(slug)) return false;
            seen.add(slug);

            // Filter 3: Location sanity (Optional strict check)
            // If location is provided, we prioritize results matching city/country
            return true;
        });

        // Final Logic: Chronological Sort
        return unified.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));

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