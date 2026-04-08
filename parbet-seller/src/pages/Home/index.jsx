import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';
import SearchDropdown from '../../components/SearchDropdown';

export default function Home() {
    const { searchQuery, setSearchQuery, fetchLiveEvents } = useSellerStore();
    const navigate = useNavigate();

    // Fetch real-world ESPN API data the moment the seller lands on the page
    useEffect(() => {
        fetchLiveEvents();
    }, [fetchLiveEvents]);

    const handleSearch = (e) => {
        e.preventDefault();
        // Route to the Create Listing flow, passing the initial query if provided
        if (searchQuery.trim()) {
            navigate(`/create-listing?q=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate('/create-listing');
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-white font-sans overflow-hidden flex flex-col">
            
            {/* 1. TOPOGRAPHIC BACKGROUND SVG WAVES (1:1 Replica) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Left Side Wavy Contour Lines */}
                <svg className="absolute -left-64 md:-left-32 top-0 h-[80%] md:h-[120%] w-[800px] opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle cx="0" cy="50" r="20" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="0" cy="50" r="30" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="0" cy="50" r="40" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="0" cy="50" r="50" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="0" cy="50" r="60" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="0" cy="50" r="70" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="0" cy="50" r="80" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="0" cy="50" r="90" fill="none" stroke="#000" strokeWidth="0.2" />
                </svg>
                
                {/* Right Side Wavy Contour Lines */}
                <svg className="absolute -right-64 md:-right-32 bottom-0 h-[80%] md:h-[120%] w-[800px] opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle cx="100" cy="80" r="20" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="100" cy="80" r="30" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="100" cy="80" r="40" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="100" cy="80" r="50" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="100" cy="80" r="60" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="100" cy="80" r="70" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="100" cy="80" r="80" fill="none" stroke="#000" strokeWidth="0.2" />
                    <circle cx="100" cy="80" r="90" fill="none" stroke="#000" strokeWidth="0.2" />
                </svg>
            </div>

            {/* 2. MAIN HERO CONTENT */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-start pt-24 md:pt-36 px-4">
                
                {/* Bold Typography */}
                <h1 className="text-[40px] md:text-[56px] font-black text-[#1a1a1a] mb-3 tracking-tight text-center">
                    Sell your tickets
                </h1>
                
                {/* Subtext */}
                <p className="text-[16px] md:text-[18px] text-[#1a1a1a] font-medium mb-12 text-center max-w-2xl">
                    parbet is the world's largest secondary marketplace for tickets to live events
                </p>

                {/* Central Search Bar & Real-Time Dropdown Container */}
                <div className="relative w-full max-w-[800px]">
                    <form 
                        onSubmit={handleSearch}
                        className="w-full bg-white border border-[#cccccc] rounded-[8px] h-[56px] flex items-center px-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-gray-400 transition-all focus-within:border-[#458731] focus-within:ring-1 focus-within:ring-[#458731] group"
                    >
                        <Search size={20} className="text-gray-500 shrink-0 group-focus-within:text-[#458731]" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your event and start selling" 
                            className="flex-1 h-full outline-none text-[16px] text-[#1a1a1a] ml-3 placeholder-gray-500 bg-transparent"
                        />
                    </form>

                    {/* LIVE API SEARCH DROPDOWN */}
                    <SearchDropdown />
                </div>

                {/* 3. READY TO LIST CTA BLOCK */}
                <div className="mt-28 flex flex-col items-center text-center">
                    <h2 className="text-[28px] md:text-[32px] font-bold text-[#54626c] mb-6 tracking-tight">
                        Ready to list?
                    </h2>
                    <button 
                        onClick={() => navigate('/create-listing')}
                        className="bg-[#458731] hover:bg-[#366a26] text-white font-bold px-8 py-3.5 rounded-[8px] text-[16px] transition-colors shadow-sm"
                    >
                        Sell my tickets
                    </button>
                </div>

            </main>
        </div>
    );
}