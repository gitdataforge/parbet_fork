import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useStore';

// Newly Created Exact-Match Components
import ViagogoHeroCarousel from '../../components/ViagogoHeroCarousel';
import ViagogoFilterBar from '../../components/ViagogoFilterBar';
import ViagogoEventCard from '../../components/ViagogoEventCard';
import ViagogoCategoryCard from '../../components/ViagogoCategoryCard';

// Real-time Cloudinary Auto-Optimization Utility
const optimizeImage = (url, width = 1200) => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com')) return url;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
    return `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto,w_${width}/${encodeURIComponent(url)}`;
};

export default function Home() {
    const navigate = useNavigate();
    const { 
        isAuthenticated,
        liveMatches,
        fetchLocationAndMatches,
        searchQuery,
        setLocationDropdownOpen,
        setSearchQuery,
        toggleFavorite
    } = useAppStore();

    // Initial Data Fetch
    useEffect(() => {
        if (liveMatches.length === 0) fetchLocationAndMatches();
    }, [fetchLocationAndMatches, liveMatches.length]);

    // STRICT CRICKET & KABADDI CONTENT FILTERING
    const sportsMatches = useMemo(() => {
        return liveMatches.filter(m => {
            if (!searchQuery) {
                const str = `${m.t1} ${m.t2} ${m.league} ${m.sport}`.toLowerCase();
                return str.includes('cricket') || str.includes('ipl') || str.includes('t20') || str.includes('icc') || str.includes('test') || str.includes('odi') || str.includes('kabaddi') || str.includes('pkl');
            }
            const q = searchQuery.toLowerCase();
            const str = `${m.t1} ${m.t2} ${m.league} ${m.sport}`.toLowerCase();
            return str.includes(q) && (str.includes('cricket') || str.includes('ipl') || str.includes('t20') || str.includes('icc') || str.includes('test') || str.includes('odi') || str.includes('kabaddi') || str.includes('pkl'));
        });
    }, [liveMatches, searchQuery]);

    // Grouping by League/Tournament for Rails
    const groupedEvents = useMemo(() => {
        const groups = {};
        sportsMatches.forEach(e => {
            const key = e.league || e.t1;
            if (!groups[key]) groups[key] = { id: e.id, name: key, imageId: e.t1, events: [] };
            groups[key].events.push(e);
        });

        return Object.values(groups).map(g => {
            g.events.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
            const first = g.events[0];
            const formatDateStr = (dStr) => {
                const d = new Date(dStr);
                return `${d.toLocaleDateString('en-US', {weekday: 'short'})}, ${d.toLocaleDateString('en-US', {month: 'short'})} ${d.getDate()} • ${d.toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit'})}`;
            };
            return { ...g, dateStr: formatDateStr(first.commence_time), count: g.events.length, firstEventId: first.id };
        });
    }, [sportsMatches]);

    // Filter specifically for the Pro Kabaddi bottom rail
    const kabaddiGroups = useMemo(() => {
        return groupedEvents.filter(g => g.name.toLowerCase().includes('kabaddi') || g.name.toLowerCase().includes('pkl'));
    }, [groupedEvents]);

    // STRICT ROUTING GUARD: Redirects to /login instead of triggering a modal
    const handleRestrictedAction = (e, obj) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            toggleFavorite(obj);
        }
    };

    // Exactly replicated Viagogo Event Rail utilizing the new ViagogoEventCard Component
    const EventRail = ({ title, groups }) => {
        const scrollRef = useRef(null);
        const scroll = (direction) => {
            if (scrollRef.current) scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
        };
        if (groups.length === 0) return null;

        return (
            <div className="mb-14 relative group">
                <h2 className="text-[24px] font-bold text-[#1a1a1a] mb-5 tracking-tight">{title}</h2>
                <div className="relative">
                    <div ref={scrollRef} className="flex overflow-x-auto hide-scrollbar space-x-5 pb-4 snap-x">
                        {groups.map((g, idx) => (
                            <ViagogoEventCard 
                                key={idx} 
                                group={g} 
                                onClick={() => navigate(`/event?id=${g.firstEventId}`)} 
                            />
                        ))}
                    </div>
                    <button onClick={() => scroll('right')} className="absolute -right-5 top-[40%] -translate-y-1/2 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:scale-105 transition-transform z-10 hidden lg:flex opacity-0 group-hover:opacity-100">
                        <ChevronDown size={24} className="-rotate-90" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-white pb-20 font-sans">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                {/* 1. HERO CAROUSEL */}
                <ViagogoHeroCarousel />

                {/* 2. FILTER BAR */}
                <ViagogoFilterBar />

                {/* 3. DARK PROMO BANNER (1:1 Spotify UI Replica) */}
                <div className="w-full bg-black rounded-[12px] p-5 md:p-6 mb-12 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:shadow-xl transition-shadow">
                    <div className="flex items-center w-full md:w-auto justify-center md:justify-start mb-4 md:mb-0 space-x-5">
                        <div className="flex items-center space-x-3">
                            <svg viewBox="0 0 24 24" width="40" height="40" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.36.18.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z"/></svg>
                            <span className="font-bold text-[24px] text-white tracking-tight">Spotify</span>
                        </div>
                        <div className="hidden md:block border-l border-gray-700 pl-5">
                            <h3 className="font-bold text-[16px] text-white leading-tight">Connect your Spotify account and sync your favorite sports podcasts</h3>
                            <p className="text-[14px] text-gray-400 mt-0.5">Discover matches from teams you actually listen to</p>
                        </div>
                    </div>
                    <button className="bg-[#1ed760] text-black font-bold px-6 py-2.5 rounded-[20px] text-[14px] hover:bg-[#1cdf5f] transition-colors w-full md:w-auto">
                        Connect Spotify
                    </button>
                </div>

                {/* 4. JUST FOR YOU RAIL */}
                <EventRail title="Just for You" groups={groupedEvents} />

                {/* 5. POPULAR CATEGORIES GRID */}
                <div className="mb-14">
                    <h2 className="text-[24px] font-bold text-[#1a1a1a] mb-5 tracking-tight">Popular categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'T20 Cricket', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80' },
                            { name: 'Test Matches', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80' },
                            { name: 'Pro Kabaddi', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80' },
                            { name: 'IPL 2026', img: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=600&q=80' }
                        ].map((cat, idx) => (
                            <ViagogoCategoryCard 
                                key={idx} 
                                name={cat.name} 
                                img={cat.img} 
                                onClick={() => { setLocationDropdownOpen(false); setSearchQuery(cat.name.split(' ')[0]); }} 
                            />
                        ))}
                    </div>
                </div>

                {/* 6. PRO KABADDI RAIL */}
                {kabaddiGroups.length > 0 && (
                    <EventRail title="Pro Kabaddi" groups={kabaddiGroups} />
                )}

                {/* 7. APP DOWNLOAD BANNER (1:1 Replica) */}
                <div className="w-full bg-[#eff4eb] rounded-[16px] p-8 md:p-10 mb-16 flex flex-col md:flex-row justify-between items-center relative overflow-hidden mt-6">
                    <div className="md:w-1/2 z-10 mb-8 md:mb-0">
                        <h2 className="text-[28px] md:text-[32px] font-black text-[#1a1a1a] mb-2 leading-tight tracking-tight">Download the parbet app</h2>
                        <p className="text-[16px] text-gray-600 font-medium">Discover your favourite events with ease</p>
                    </div>
                    
                    {/* Simulated Phone Mockups */}
                    <div className="absolute left-1/2 md:left-auto md:right-1/3 bottom-0 transform -translate-x-1/2 md:translate-x-0 w-[200px] h-[150px] md:w-[300px] md:h-[200px] z-0 opacity-20 md:opacity-100 pointer-events-none">
                         <div className="absolute bottom-[-50px] right-0 w-[140px] h-[280px] bg-white rounded-[20px] border-4 border-gray-800 shadow-xl rotate-[15deg] transform scale-75 md:scale-100"></div>
                         <div className="absolute bottom-[-20px] right-[80px] w-[140px] h-[280px] bg-white rounded-[20px] border-4 border-gray-800 shadow-2xl -rotate-[10deg] transform scale-75 md:scale-100"></div>
                    </div>

                    <div className="flex items-center space-x-4 z-10 w-full md:w-auto justify-center md:justify-end">
                        <div className="flex flex-col space-y-3">
                            <button className="bg-black text-white px-4 py-2 rounded-[8px] flex items-center space-x-2 hover:bg-gray-800 transition-colors w-[140px] justify-center shadow-md">
                                <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px]">Download on the</span>
                                    <span className="text-[13px] font-bold">App Store</span>
                                </div>
                            </button>
                            <button className="bg-black text-white px-4 py-2 rounded-[8px] flex items-center space-x-2 hover:bg-gray-800 transition-colors w-[140px] justify-center shadow-md">
                                <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px]">GET IT ON</span>
                                    <span className="text-[13px] font-bold">Google Play</span>
                                </div>
                            </button>
                        </div>
                        <div className="bg-white p-2 rounded-[8px] hidden md:block border border-gray-200 shadow-sm">
                            {/* Simulated QR Code */}
                            <div className="w-[84px] h-[84px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover bg-center"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}