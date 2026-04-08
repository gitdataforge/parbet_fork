/**
 * LIVE SPORTS AGGREGATOR
 * 100% Real Data Pipeline. Zero Mock Data. Zero Simulations.
 * Connects directly to the public ESPN Cricket Scorepanel API.
 */

export const aggregateAllEvents = async ({ city, state, countryCode }) => {
    try {
        // Fetch real-time live and upcoming global cricket matches
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/cricket/scorepanel');
        
        if (!response.ok) {
            throw new Error('Failed to connect to the live sports network');
        }

        const data = await response.json();

        if (!data.events || data.events.length === 0) {
            return []; // No live events currently scheduled by the network
        }

        // Map the complex ESPN data schema into the precise Parbet/Viagogo layout schema
        const liveMatches = data.events.map(event => {
            const comp = event.competitions[0];
            
            // Extract real team names
            const homeTeam = comp.competitors.find(c => c.homeAway === 'home')?.team?.displayName || comp.competitors[0]?.team?.displayName || 'TBA';
            const awayTeam = comp.competitors.find(c => c.homeAway === 'away')?.team?.displayName || comp.competitors[1]?.team?.displayName || '';

            // Extract real dates and times
            const eventDate = new Date(comp.date);
            
            // Extract real venues
            const venue = comp.venue?.fullName || 'TBA Stadium';
            const eventCity = comp.venue?.address?.city || '';
            const locationString = eventCity ? `${venue}, ${eventCity}` : venue;

            // Determine proximity score (Ranks local events higher in the UI)
            let proximityScore = 1;
            if (city && eventCity && eventCity.toLowerCase().includes(city.toLowerCase())) {
                proximityScore = 5;
            }

            return {
                id: event.id,
                t1: homeTeam,
                t2: awayTeam,
                league: event.league?.name || event.season?.slug || 'International Cricket',
                commence_time: comp.date,
                month: eventDate.toLocaleDateString('en-US', { month: 'short' }),
                day: eventDate.getDate(),
                dow: eventDate.toLocaleDateString('en-US', { weekday: 'short' }),
                time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                loc: locationString,
                country: 'IN', // Enforcing India baseline for the current IPL/Cricket focus
                source: 'ESPN_Live_Network',
                proximityScore: proximityScore
            };
        });

        // Sort chronologically, prioritizing local proximity
        return liveMatches.sort((a, b) => {
            if (b.proximityScore !== a.proximityScore) {
                return b.proximityScore - a.proximityScore;
            }
            return new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime();
        });

    } catch (error) {
        console.error("Live API Aggregator Failed:", error);
        throw error; // Let the global store handle the fallback/error state
    }
};