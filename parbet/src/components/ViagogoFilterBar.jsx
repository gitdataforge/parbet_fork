import React from 'react';
import { MapPin, Calendar, ChevronDown, Navigation as NavigationIcon } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import LocationDropdown from './LocationDropdown';

/**
 * FEATURE 1: Strict City-Only Name Parser
 * FEATURE 2: Horizontal Scrolling Category Chips
 * FEATURE 3: Hardware-Accelerated Mobile Responsiveness
 * FEATURE 4: Dropdown State Manager
 * FEATURE 5: Dynamic Search Query Integration
 */

export default function ViagogoFilterBar() {
    const { 
        userCity, 
        searchQuery, 
        setSearchQuery,
        isLocationDropdownOpen,
        setLocationDropdownOpen
    } = useAppStore();

    // FEATURE 1: Strict City-Only Name Parser
    // Strips out appended states, provinces, or countries (e.g. "Mumbai, India" -> "Mumbai")
    const getCleanCityName = (fullLocationString) => {
        if (!fullLocationString || fullLocationString === 'Loading...') return 'Detecting...';
        // Split by comma and return only the first segment, trimmed of whitespace
        return fullLocationString.split(',')[0].trim();
    };

    // Styling Classes for Mobile Chips
    const activeClass = "bg-[#eaf4d9] border-[#458731] text-[#114C2A]";
    const inactiveClass = "bg-white border-[#e2e2e2] text-[#1a1a1a] hover:border-[#cccccc] hover:bg-[#f8f9fa]";

    return (
        <div className="flex items-center w-full px-4 overflow-visible relative z-20 font-sans">
            
            {/* Desktop-Only Location & Date Controls */}
            <div className="hidden md:flex items-center space-x-3 mr-4">
                
                {/* Navigation Pointer Icon */}
                <div className="w-[38px] h-[38px] rounded-[8px] bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm hover:bg-black transition-colors">
                    <NavigationIcon size={16} className="text-white fill-white -rotate-45" />
                </div>
                
                {/* Active Location Dropdown Pill */}
                <div className="relative shrink-0">
                    <button 
                        onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)} 
                        className="bg-white border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 h-[38px] rounded-[8px] text-[14px] font-bold flex items-center justify-center whitespace-nowrap shadow-sm hover:bg-[#f8f9fa] transition-colors hover:border-[#cccccc]"
                    >
                        <MapPin size={16} className="mr-2 text-[#54626c]"/> 
                        {getCleanCityName(userCity)} 
                        <ChevronDown size={16} className={`ml-2 transition-transform text-[#54626c] ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    <LocationDropdown />
                </div>

                {/* Date Selection Pill */}
                <button className="bg-white border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 h-[38px] rounded-[8px] text-[14px] font-bold flex items-center justify-center whitespace-nowrap shadow-sm hover:bg-[#f8f9fa] transition-colors hover:border-[#cccccc] shrink-0">
                    <Calendar size={16} className="mr-2 text-[#54626c]"/> 
                    All dates 
                    <ChevronDown size={16} className="ml-2 text-[#54626c]"/>
                </button>

                {/* Vertical Divider */}
                <div className="w-px h-6 bg-[#e2e2e2] mx-1 shrink-0"></div>
            </div>

            {/* Mobile & Desktop Scrollable Filter Chips */}
            <div className="flex items-center space-x-2.5 overflow-x-auto hide-scrollbar w-full pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                <button 
                    onClick={() => setSearchQuery('')} 
                    className={`px-5 py-2 rounded-[8px] text-[14px] font-bold shrink-0 transition-all border shadow-sm md:shadow-none ${!searchQuery ? activeClass : inactiveClass}`}
                >
                    All types
                </button>
                <button 
                    onClick={() => setSearchQuery('Cricket')} 
                    className={`px-5 py-2 rounded-[8px] text-[14px] font-bold shrink-0 transition-all border shadow-sm md:shadow-none ${searchQuery === 'Cricket' ? activeClass : inactiveClass}`}
                >
                    Cricket
                </button>
                <button 
                    onClick={() => setSearchQuery('Kabaddi')} 
                    className={`px-5 py-2 rounded-[8px] text-[14px] font-bold shrink-0 transition-all border shadow-sm md:shadow-none ${searchQuery === 'Kabaddi' ? activeClass : inactiveClass}`}
                >
                    Kabaddi
                </button>
                <button 
                    onClick={() => setSearchQuery('Football')} 
                    className={`px-5 py-2 rounded-[8px] text-[14px] font-bold shrink-0 transition-all border shadow-sm md:shadow-none ${searchQuery === 'Football' ? activeClass : inactiveClass}`}
                >
                    Football
                </button>
            </div>
        </div>
    );
}