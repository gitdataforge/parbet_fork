import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, ChevronDown, Tag, Ticket, MicVocal } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import LocationDropdown from './LocationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FEATURE 1: Precise 1:1 Enterprise UI Replication
 * FEATURE 2: Custom SVG Stroke Iconography
 * FEATURE 3: Horizontal Scrolling Category Chips
 * FEATURE 4: Strict Two-Row Architectural Layout
 * FEATURE 5: Dynamic State Pills (Green #458731 active states)
 * FEATURE 6: Fully Rendered & Functional Dropdown State Managers
 * FEATURE 7: Sub-pixel Font Anti-Aliasing
 */

export default function ViagogoFilterBar() {
    const { 
        userCity, 
        exploreCategory,
        setExploreCategory,
        isLocationDropdownOpen,
        setLocationDropdownOpen,
        exploreDateFilter,
        setExploreDateFilter,
        explorePriceFilter,
        setExplorePriceFilter
    } = useAppStore();

    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);

    const dateRef = useRef(null);
    const priceRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateRef.current && !dateRef.current.contains(event.target)) setIsDateOpen(false);
            if (priceRef.current && !priceRef.current.contains(event.target)) setIsPriceOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCleanCityName = (fullLocationString) => {
        if (!fullLocationString || fullLocationString === 'Loading...') return 'Detecting...';
        return fullLocationString.split(',')[0].trim();
    };

    const categories = [
        { id: 'All Events', label: 'All Events', icon: <Ticket strokeWidth={1.5} size={24} /> },
        { id: 'Sports', label: 'Sports', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><ellipse cx="12" cy="12" rx="5" ry="9" transform="rotate(45 12 12)"/><path d="M10 10l4 4"/><path d="M12 8l4 4"/><path d="M8 12l4 4"/></svg>
        ) },
        { id: 'Concerts', label: 'Concerts', icon: <MicVocal strokeWidth={1.5} size={24} /> },
        { id: 'Theater', label: 'Theater', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 9-9c0-5-4-9-9-9s-9 4-9 9Z"/><path d="M8 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/><path d="M16 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/></svg>
        ) },
        { id: 'Festivals', label: 'Festivals', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 18V5l12-2v13"/><path d="M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
        ) }
    ];

    const dateOptions = ['All dates', 'Today', 'This weekend', 'Next 7 days', 'This month'];
    const priceOptions = ['Price', 'Under ₹2000', 'Under ₹5000', 'Under ₹10000'];

    return (
        <div className="w-full bg-white z-20 relative font-sans">
            
            {/* ROW 1: SVG Category Links */}
            <div className="w-full border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="flex items-center space-x-6 md:space-x-10 overflow-x-auto hide-scrollbar pt-4">
                        {categories.map((cat) => {
                            const isActive = exploreCategory === cat.id || (exploreCategory === 'All Events' && cat.id === 'All Events');
                            return (
                                <div 
                                    key={cat.id}
                                    onClick={() => setExploreCategory(cat.id)}
                                    className={`flex flex-col items-center justify-center cursor-pointer min-w-max pb-3 border-b-[3px] transition-colors relative group ${isActive ? 'border-[#458731] text-[#458731]' : 'border-transparent text-[#54626c] hover:text-[#1a1a1a]'}`}
                                >
                                    <div className={`mb-1.5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#458731]' : 'text-gray-500 group-hover:text-[#1a1a1a]'}`}>
                                        {cat.icon}
                                    </div>
                                    <span className={`text-[14.5px] tracking-tight ${isActive ? 'font-medium' : 'font-normal'}`}>
                                        {cat.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ROW 2: Rounded Filter Pills */}
            <div className="w-full bg-white border-b border-gray-200 py-3.5 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center space-x-3 overflow-x-auto hide-scrollbar relative">
                    
                    {/* Location Dropdown Pill */}
                    <div className="relative shrink-0">
                        <button 
                            onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)} 
                            className={`px-4 py-1.5 h-[36px] rounded-full text-[14px] flex items-center justify-center whitespace-nowrap transition-colors border ${userCity && userCity !== 'All Cities' && userCity !== 'Global' ? 'bg-[#eaf4d9] border-[#8cc63f] text-[#114C2A] font-medium' : 'bg-white border-gray-300 text-[#1a1a1a] font-normal hover:bg-gray-50'}`}
                        >
                            <MapPin size={16} strokeWidth={2} className={`mr-2 ${userCity && userCity !== 'All Cities' && userCity !== 'Global' ? 'text-[#458731]' : 'text-[#54626c]'}`}/> 
                            {getCleanCityName(userCity)} 
                            <ChevronDown size={16} className={`ml-2 transition-transform ${userCity && userCity !== 'All Cities' && userCity !== 'Global' ? 'text-[#458731]' : 'text-[#54626c]'} ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        <LocationDropdown />
                    </div>

                    {/* Date Context Pill */}
                    <div className="relative shrink-0" ref={dateRef}>
                        <button 
                            onClick={() => setIsDateOpen(!isDateOpen)}
                            className={`px-4 py-1.5 h-[36px] rounded-full text-[14px] flex items-center justify-center whitespace-nowrap transition-colors border ${exploreDateFilter !== 'All dates' ? 'bg-[#eaf4d9] border-[#8cc63f] text-[#114C2A] font-medium' : 'bg-white border-gray-300 text-[#1a1a1a] font-normal hover:bg-gray-50'}`}
                        >
                            <Calendar size={16} strokeWidth={2} className={`mr-2 ${exploreDateFilter !== 'All dates' ? 'text-[#458731]' : 'text-[#54626c]'}`}/> 
                            {exploreDateFilter} 
                            <ChevronDown size={16} className={`ml-2 transition-transform ${exploreDateFilter !== 'All dates' ? 'text-[#458731]' : 'text-[#54626c]'} ${isDateOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        <AnimatePresence>
                            {isDateOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="absolute top-[110%] left-0 w-48 bg-white border border-gray-200 shadow-xl rounded-[12px] py-2 z-[100]"
                                >
                                    {dateOptions.map(opt => (
                                        <div 
                                            key={opt}
                                            onClick={() => { setExploreDateFilter(opt); setIsDateOpen(false); }}
                                            className={`px-5 py-2.5 text-[14px] cursor-pointer transition-colors ${exploreDateFilter === opt ? 'font-bold text-[#458731] bg-[#f8f9fa]' : 'text-[#1a1a1a] hover:bg-gray-50'}`}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Price Context Pill */}
                    <div className="relative shrink-0" ref={priceRef}>
                        <button 
                            onClick={() => setIsPriceOpen(!isPriceOpen)}
                            className={`px-4 py-1.5 h-[36px] rounded-full text-[14px] flex items-center justify-center whitespace-nowrap transition-colors border ${explorePriceFilter !== 'Price' ? 'bg-[#eaf4d9] border-[#8cc63f] text-[#114C2A] font-medium' : 'bg-white border-gray-300 text-[#1a1a1a] font-normal hover:bg-gray-50'}`}
                        >
                            <Tag size={16} strokeWidth={2} className={`mr-2 ${explorePriceFilter !== 'Price' ? 'text-[#458731]' : 'text-[#54626c]'}`}/> 
                            {explorePriceFilter} 
                            <ChevronDown size={16} className={`ml-2 transition-transform ${explorePriceFilter !== 'Price' ? 'text-[#458731]' : 'text-[#54626c]'} ${isPriceOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        <AnimatePresence>
                            {isPriceOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="absolute top-[110%] left-0 w-48 bg-white border border-gray-200 shadow-xl rounded-[12px] py-2 z-[100]"
                                >
                                    {priceOptions.map(opt => (
                                        <div 
                                            key={opt}
                                            onClick={() => { setExplorePriceFilter(opt); setIsPriceOpen(false); }}
                                            className={`px-5 py-2.5 text-[14px] cursor-pointer transition-colors ${explorePriceFilter === opt ? 'font-bold text-[#458731] bg-[#f8f9fa]' : 'text-[#1a1a1a] hover:bg-gray-50'}`}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}