const ODDS_API_KEY = import.meta.env.VITE_ODDS_API_KEY;
const CRIC_API_KEY = import.meta.env.VITE_CRIC_API_KEY;
const SPORTMONKS_API_KEY = import.meta.env.VITE_SPORTMONKS_API_KEY;
const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;

// ------------------------------------------------------------------
// 1. Core Utilities for Normalization
// ------------------------------------------------------------------

// Helper to format date consistently across vastly different APIs
const formatDateTime = (dateInput) => {
    // Handle both string ISO dates and UNIX timestamps
    const date = new Date(typeof dateInput === 'number' ? dateInput : dateInput);
    return {
        month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
        day: date.getDate().toString(),
        dow: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        _timestamp: date.getTime() // Kept internally for strict chronological sorting
    };
};

// Helper to strictly bind the dynamic location to the UI feed
const formatLocation = (apiVenue, userLocation) => {
    const venueName = apiVenue ? apiVenue : 'Verified Stadium';
    if (userLocation && userLocation !== 'Global' && userLocation !== 'All Cities' && userLocation !== 'Current Location') {
        return `${userLocation}, ${venueName}`;
    }
    return `Global • ${venueName}`;
};


// ------------------------------------------------------------------
// 2. Isolated API Fetchers & Normalizers
// ------------------------------------------------------------------

// Fetcher 1: The Odds API (Global Sports)
const fetchOddsAPI = async (userLocation) => {
    if (!ODDS_API_KEY || ODDS_API_KEY.includes('your_')) return [];
    
    try {
        const targetRegions = 'us,eu,uk,au';
        const locationParam = userLocation !== 'Global' ? `&location=${encodeURIComponent(userLocation)}` : '';
        const response = await fetch(`https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=${targetRegions}&markets=h2h${locationParam}&apiKey=${ODDS_API_KEY}`);
        
        if (!response.ok) return [];
        const data = await response.json();
        
        return data.map(match => {
            const { month, day, dow, time, _timestamp } = formatDateTime(match.commence_time);
            
            let homeOdds = 'N/A';
            if (match.bookmakers && match.bookmakers.length > 0) {
                const h2hMarket = match.bookmakers[0].markets.find(m => m.key === 'h2h');
                if (h2hMarket && h2hMarket.outcomes) {
                    const homeOutcome = h2hMarket.outcomes.find(o => o.name === match.home_team);
                    if (homeOutcome) homeOdds = homeOutcome.price.toFixed(2);
                }
            }

            return {
                id: `odds-${match.id}`,
                month, day, dow, time, _timestamp,
                league: match.sport_title,
                t1: match.home_team,
                t2: match.away_team,
                loc: formatLocation(null, userLocation),
                odds: homeOdds,
                tag: null, tagColor: null // Tags applied during final merge
            };
        });
    } catch (error) {
        console.error("OddsAPI Fetch Failed:", error);
        return [];
    }
};

// Fetcher 2: CricAPI (Indian & Global Cricket)
const fetchCricAPI = async (userLocation) => {
    if (!CRIC_API_KEY || CRIC_API_KEY.includes('your_')) return [];
    
    try {
        const response = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRIC_API_KEY}&offset=0`);
        if (!response.ok) return [];
        const data = await response.json();
        
        if (!data.data) return [];
        
        return data.data.map(match => {
            const { month, day, dow, time, _timestamp } = formatDateTime(match.dateTimeGMT);
            return {
                id: `cric-${match.id}`,
                month, day, dow, time, _timestamp,
                league: match.matchType || 'Cricket Match',
                t1: match.teams && match.teams[0] ? match.teams[0] : 'TBA',
                t2: match.teams && match.teams[1] ? match.teams[1] : 'TBA',
                loc: formatLocation(match.venue, userLocation),
                odds: 'N/A', // Free cricket APIs rarely provide odds natively
                tag: null, tagColor: null
            };
        });
    } catch (error) {
        console.error("CricAPI Fetch Failed:", error);
        return [];
    }
};

// Fetcher 3: Sportmonks (Cricket specific)
const fetchSportmonks = async (userLocation) => {
    if (!SPORTMONKS_API_KEY || SPORTMONKS_API_KEY.includes('your_')) return [];
    
    try {
        const response = await fetch(`https://cricket.sportmonks.com/api/v2.0/fixtures?api_token=${SPORTMONKS_API_KEY}&include=localteam,visitorteam,venue,league`);
        if (!response.ok) return [];
        const data = await response.json();
        
        if (!data.data) return [];
        
        return data.data.map(match => {
            const { month, day, dow, time, _timestamp } = formatDateTime(match.starting_at);
            return {
                id: `sm-${match.id}`,
                month, day, dow, time, _timestamp,
                league: match.league?.name || 'Cricket Match',
                t1: match.localteam?.name || 'TBA',
                t2: match.visitorteam?.name || 'TBA',
                loc: formatLocation(match.venue?.name, userLocation),
                odds: 'N/A',
                tag: null, tagColor: null
            };
        });
    } catch (error) {
        console.error("Sportmonks Fetch Failed:", error);
        return [];
    }
};

// Fetcher 4: RapidAPI (Cricbuzz Generic Fallback)
const fetchRapidAPI = async (userLocation) => {
    if (!RAPID_API_KEY || RAPID_API_KEY.includes('your_')) return [];
    
    try {
        // Generic Cricbuzz RapidAPI endpoint simulation structure (adjust host if using a different RapidAPI cricket provider)
        const response = await fetch(`https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming`, {
            headers: {
                'X-RapidAPI-Key': RAPID_API_KEY,
                'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
            }
        });
        
        if (!response.ok) return [];
        const data = await response.json();
        
        if (!data.typeMatches) return [];
        
        let matches = [];
        data.typeMatches.forEach(type => {
            if (type.seriesMatches) {
                type.seriesMatches.forEach(series => {
                    if (series.seriesAdWrapper && series.seriesAdWrapper.matches) {
                        series.seriesAdWrapper.matches.forEach(match => {
                            const { month, day, dow, time, _timestamp } = formatDateTime(parseInt(match.matchInfo.startDate));
                            matches.push({
                                id: `rap-${match.matchInfo.matchId}`,
                                month, day, dow, time, _timestamp,
                                league: series.seriesAdWrapper.seriesName || 'Cricket Match',
                                t1: match.matchInfo.team1?.teamName || 'TBA',
                                t2: match.matchInfo.team2?.teamName || 'TBA',
                                loc: formatLocation(match.matchInfo.venueInfo?.ground, userLocation),
                                odds: 'N/A',
                                tag: null, tagColor: null
                            });
                        });
                    }
                });
            }
        });
        return matches;
    } catch (error) {
        console.error("RapidAPI Fetch Failed:", error);
        return [];
    }
};


// ------------------------------------------------------------------
// 3. Primary Aggregator & Exporter
// ------------------------------------------------------------------

export const fetchRealUpcomingMatches = async (userLocation = 'Global') => {
    try {
        // Concurrently fetch from all available APIs without blocking if one fails/missing keys
        const results = await Promise.allSettled([
            fetchOddsAPI(userLocation),
            fetchCricAPI(userLocation),
            fetchSportmonks(userLocation),
            fetchRapidAPI(userLocation)
        ]);

        let aggregatedMatches = [];

        // Flatten all successfully fulfilled arrays
        results.forEach(res => {
            if (res.status === 'fulfilled' && Array.isArray(res.value)) {
                aggregatedMatches = [...aggregatedMatches, ...res.value];
            }
        });

        // Fail-safe if all APIs are missing keys or failing
        if (aggregatedMatches.length === 0) {
            throw new Error("No live events could be fetched from any connected API. Please verify your API keys in .env");
        }

        // Deduplicate events (APIs often overlap on major matches like IPL)
        const seenMatches = new Set();
        const uniqueMatches = aggregatedMatches.filter(m => {
            // Rough heuristic key: Team1 + Team2 + Day (prevents duplicate listings of the same match)
            const matchKey = `${m.t1}-${m.t2}-${m.day}`.toLowerCase();
            if (seenMatches.has(matchKey)) return false;
            seenMatches.add(matchKey);
            return true;
        });

        // Strictly sort all merged APIs chronologically by upcoming date
        uniqueMatches.sort((a, b) => a._timestamp - b._timestamp);

        // Apply visual UI tags to the top results natively
        const finalFeed = uniqueMatches.map((match, index) => {
            const formattedMatch = { ...match };
            if (index === 0) {
                formattedMatch.tag = "Hottest event on our site";
                formattedMatch.tagColor = "text-brand-accent bg-brand-primaryLight";
            } else if (index > 0 && index < 4) {
                formattedMatch.tag = "Selling Fast";
                formattedMatch.tagColor = "text-brand-red bg-red-50";
            }
            
            // Clean up the internal timestamp used for sorting before returning to UI
            delete formattedMatch._timestamp;
            return formattedMatch;
        });

        // Return top 40 merged results to keep UI highly populated but responsive
        return finalFeed.slice(0, 40);

    } catch (error) {
        console.error("Critical Aggregator Failure:", error);
        throw error;
    }
};