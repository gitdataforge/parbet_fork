import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useStore';

export default function NavHoverMenu({ isOpen, category, onMouseEnter, onMouseLeave }) {
    const navigate = useNavigate();
    const { liveMatches, setSearchQuery, userCity } = useAppStore();

    // Dynamically extract unique performers/cities based on the hovered category strictly from the API
    const getCategoryPerformers = () => {
        if (!liveMatches || liveMatches.length === 0) return [];
        
        let locationFiltered = liveMatches;

        // Apply strict location filter FIRST, UNLESS the category is 'Top Cities' or 'All Cities' is selected
        const isValidCity = userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location';
        
        if (category !== 'Top Cities' && isValidCity) {
            // Strictly check if the event's location string includes the user's city
            locationFiltered = liveMatches.filter(m => m.loc.toLowerCase().includes(userCity.toLowerCase()));
        }

        let finalFiltered = [];
        const resultsSet = new Set();

        // 1. Sports: Local Teams + Local Stadiums
        if (category === 'Sports') {
            finalFiltered = locationFiltered.filter(m => !m.league.toLowerCase().includes('music') && !m.league.toLowerCase().includes('politics'));
            finalFiltered.forEach(m => {
                if (m.t1) resultsSet.add(m.t1);
                if (m.t2) resultsSet.add(m.t2);
                
                // Extract stadium name (Usually follows a comma or '•' in our normalized loc string)
                if (m.loc) {
                    const locParts = m.loc.split(/,|•/);
                    const stadium = locParts.length > 1 ? locParts[locParts.length - 1].trim() : m.loc.trim();
                    if (stadium && stadium !== 'Verified Venue' && stadium !== 'Verified Stadium') {
                        resultsSet.add(stadium);
                    }
                }
            });
        } 
        // 2. Concerts: Local Musical Artists
        else if (category === 'Concerts') {
            finalFiltered = locationFiltered.filter(m => m.league.toLowerCase().includes('music') || m.league.toLowerCase().includes('concert'));
            finalFiltered.forEach(m => {
                if (m.t1) resultsSet.add(m.t1);
                if (m.t2) resultsSet.add(m.t2);
            });
        } 
        // 3. Theatre: Local Theatre/Broadway Shows
        else if (category === 'Theatre' || category === 'Theater') {
            finalFiltered = locationFiltered.filter(m => m.league.toLowerCase().includes('theatre') || m.league.toLowerCase().includes('theater') || m.league.toLowerCase().includes('broadway'));
            finalFiltered.forEach(m => {
                if (m.t1) resultsSet.add(m.t1);
            });
        } 
        // 4. Top Cities: Global City Aggregation based on Event Volume
        else if (category === 'Top Cities') {
            const cityCounts = {};
            liveMatches.forEach(m => {
                if (m.loc) {
                    // Extract city name strictly (assumes first string before comma/bullet)
                    const city = m.loc.split(/,|•/)[0].trim();
                    if (city && city !== 'Global' && city !== 'Current Location') {
                        cityCounts[city] = (cityCounts[city] || 0) + 1;
                    }
                }
            });
            
            // Sort cities by sheer event volume (descending) and inject top 8
            const sortedCities = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a]);
            sortedCities.slice(0, 8).forEach(city => resultsSet.add(city));
        }

        // Return Top 8 strictly real mapped results to maintain UI balance
        return Array.from(resultsSet).slice(0, 8); 
    };

    const performers = getCategoryPerformers();

    const handleSelect = (performer) => {
        setSearchQuery(performer);
        // If it's a city selection, update the global location and search
        if (category === 'Top Cities') {
            // (Optional future implementation: dispatch setLocation(performer) here if required globally)
            navigate('/explore');
        } else {
            navigate('/explore');
        }
        onMouseLeave(); // Close menu upon selection
    };

    return (
        <AnimatePresence>
            {isOpen && performers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    // CRITICAL FIX: z-[200], solid background, clean boundaries
                    className="absolute top-full mt-2 w-auto min-w-[260px] max-w-[340px] bg-white rounded-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-200 py-3 z-[200] overflow-hidden cursor-default"
                >
                    {/* Invisible bridge to prevent mouse leave gap drops */}
                    <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
                    
                    {/* Category Label Header for clarity */}
                    <div className="px-5 pb-2 mb-1 border-b border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {category === 'Top Cities' ? 'Trending Global Destinations' : `Popular in ${userCity && userCity !== 'All Cities' ? userCity : 'Your Area'}`}
                        </span>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto hide-scrollbar pt-1">
                        {performers.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(item)}
                                className="w-full text-left px-5 py-2.5 text-[15px] font-medium text-[#3B4248] hover:bg-[#F4F6F8] hover:text-[#114C2A] transition-colors truncate block"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}