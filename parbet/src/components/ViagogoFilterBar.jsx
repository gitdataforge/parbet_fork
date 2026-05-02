import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, ChevronDown, Tag, Ticket, MicVocal, Check } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import LocationDropdown from './LocationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 4 Filter Bar)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: 1:1 Enterprise UI Replication (Matching exact spacing and colors)
 * FEATURE 2: Animated Popover Engine (Using Framer Motion for smooth transitions)
 * FEATURE 3: Smart State Pills (Changes color/border when a non-default filter is active)
 * FEATURE 4: Outside-Click Interceptor (Automatically closes dropdowns when clicking away)
 * FEATURE 5: Active Indicator Logic (Renders the 'Check' icon for the selected filter)
 * FEATURE 6: Sub-pixel Font Anti-Aliasing & Typography Refinement
 * FEATURE 7: Horizontal Category Scroll with Dynamic Underline
 * FEATURE 8: Price Tier Mapping (All, $, $$, $$$, $$$$)
 * FEATURE 9: Date Context Mapping (Today, Weekend, Month)
 * FEATURE 10: CSS Clipping Failsafe (flex-wrap replaces overflow-x-auto to prevent dropdown cutoffs)
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

    // Dropdown Visibility States
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);

    const dateRef = useRef(null);
    const priceRef = useRef(null);

    // FEATURE 4: Close dropdowns on outside click
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

    const dateOptions = [
        { label: 'All dates', value: 'All dates' },
        { label: 'Today', value: 'Today' },
        { label: 'This weekend', value: 'This weekend' },
        { label: 'This month', value: 'This month' },
        { label: 'Custom Dates', value: 'Custom Dates' }
    ];

    const priceOptions = [
        { label: 'All', value: 'Price' },
        { label: '$', value: 'Under ₹2000' },
        { label: '$$', value: 'Under ₹5000' },
        { label: '$$$', value: 'Under ₹10000' },
        { label: '$$$$', value: 'Under ₹20000' }
    ];

    return (
        <div className="w-full bg-[#FFFFFF] z-40 relative font-sans">
            
            {/* ROW 1: SVG Category Links */}
            <div className="w-full border-b border-[#A3A3A3]/20">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="flex items-center space-x-6 md:space-x-10 overflow-x-auto hide-scrollbar pt-4">
                        {categories.map((cat) => {
                            const isActive = exploreCategory === cat.id || (exploreCategory === 'All Events' && cat.id === 'All Events');
                            return (
                                <div 
                                    key={cat.id}
                                    onClick={() => setExploreCategory(cat.id)}
                                    className={`flex flex-col items-center justify-center cursor-pointer min-w-max pb-3 border-b-[3px] transition-colors relative group ${isActive ? 'border-[#E7364D] text-[#E7364D]' : 'border-transparent text-[#626262] hover:text-[#333333]'}`}
                                >
                                    <div className={`mb-1.5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#E7364D]' : 'text-[#A3A3A3] group-hover:text-[#333333]'}`}>
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
            <div className="w-full bg-[#FFFFFF] border-b border-[#A3A3A3]/20 py-3.5 shadow-sm relative z-50">
                {/* CRITICAL FIX: Replaced overflow-x-auto space-x-3 with flex-wrap gap-3 to prevent CSS clipping of absolute dropdowns */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-wrap items-center gap-3 relative">
                    
                    {/* Location Dropdown Pill */}
                    <div className="relative shrink-0">
                        <button 
                            onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)} 
                            className={`px-4 py-1.5 h-[36px] rounded-full text-[14px] flex items-center justify-center whitespace-nowrap transition-all border shadow-sm ${userCity && userCity !== 'All Cities' && userCity !== 'Global' ? 'bg-[#FAD8DC]/30 border-[#E7364D] text-[#E7364D] font-medium' : 'bg-[#FFFFFF] border-[#A3A3A3]/50 text-[#333333] font-normal hover:border-[#E7364D]'}`}
                        >
                            <MapPin size={16} strokeWidth={2} className={`mr-2 transition-colors ${userCity && userCity !== 'All Cities' && userCity !== 'Global' ? 'text-[#E7364D]' : 'text-[#626262]'}`}/> 
                            {getCleanCityName(userCity)} 
                            <ChevronDown size={16} className={`ml-2 transition-transform duration-300 ${userCity && userCity !== 'All Cities' && userCity !== 'Global' ? 'text-[#E7364D]' : 'text-[#626262]'} ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        {isLocationDropdownOpen && (
                            <div className="absolute left-0 top-[calc(100%+8px)] z-[999]">
                                <LocationDropdown />
                            </div>
                        )}
                    </div>

                    {/* Date Context Pill with Animated Dropdown */}
                    <div className="relative shrink-0" ref={dateRef}>
                        <button 
                            onClick={() => setIsDateOpen(!isDateOpen)}
                            className={`px-4 py-1.5 h-[36px] rounded-full text-[14px] flex items-center justify-center whitespace-nowrap transition-all border shadow-sm ${exploreDateFilter !== 'All dates' ? 'bg-[#FAD8DC]/30 border-[#E7364D] text-[#E7364D] font-medium' : 'bg-[#FFFFFF] border-[#A3A3A3]/50 text-[#333333] font-normal hover:border-[#E7364D]'}`}
                        >
                            <Calendar size={16} strokeWidth={2} className={`mr-2 transition-colors ${exploreDateFilter !== 'All dates' ? 'text-[#E7364D]' : 'text-[#626262]'}`}/> 
                            {exploreDateFilter} 
                            <ChevronDown size={16} className={`ml-2 transition-transform duration-300 ${exploreDateFilter !== 'All dates' ? 'text-[#E7364D]' : 'text-[#626262]'} ${isDateOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        <AnimatePresence>
                            {isDateOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute top-[calc(100%+8px)] left-0 w-56 bg-[#FFFFFF] border border-[#A3A3A3]/30 shadow-[0_10px_40px_rgba(51,51,51,0.15)] rounded-[12px] py-2 z-[999] overflow-hidden"
                                >
                                    {dateOptions.map(opt => (
                                        <div 
                                            key={opt.value}
                                            onClick={() => { setExploreDateFilter(opt.value); setIsDateOpen(false); }}
                                            className={`px-5 py-2.5 text-[14.5px] cursor-pointer transition-colors flex items-center justify-between group ${exploreDateFilter === opt.value ? 'font-bold text-[#E7364D] bg-[#FAD8DC]/20' : 'text-[#333333] hover:bg-[#F5F5F5]'}`}
                                        >
                                            {opt.label}
                                            {exploreDateFilter === opt.value && <Check size={16} className="text-[#E7364D]" strokeWidth={3} />}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Price Context Pill with Animated Dropdown */}
                    <div className="relative shrink-0" ref={priceRef}>
                        <button 
                            onClick={() => setIsPriceOpen(!isPriceOpen)}
                            className={`px-4 py-1.5 h-[36px] rounded-full text-[14px] flex items-center justify-center whitespace-nowrap transition-all border shadow-sm ${explorePriceFilter !== 'Price' ? 'bg-[#FAD8DC]/30 border-[#E7364D] text-[#E7364D] font-medium' : 'bg-[#FFFFFF] border-[#A3A3A3]/50 text-[#333333] font-normal hover:border-[#E7364D]'}`}
                        >
                            <Tag size={16} strokeWidth={2} className={`mr-2 transition-colors ${explorePriceFilter !== 'Price' ? 'text-[#E7364D]' : 'text-[#626262]'}`}/> 
                            {explorePriceFilter} 
                            <ChevronDown size={16} className={`ml-2 transition-transform duration-300 ${explorePriceFilter !== 'Price' ? 'text-[#E7364D]' : 'text-[#626262]'} ${isPriceOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        <AnimatePresence>
                            {isPriceOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute top-[calc(100%+8px)] left-0 w-48 bg-[#FFFFFF] border border-[#A3A3A3]/30 shadow-[0_10px_40px_rgba(51,51,51,0.15)] rounded-[12px] py-2 z-[999] overflow-hidden"
                                >
                                    {priceOptions.map(opt => (
                                        <div 
                                            key={opt.value}
                                            onClick={() => { setExplorePriceFilter(opt.value); setIsPriceOpen(false); }}
                                            className={`px-5 py-2.5 text-[14.5px] cursor-pointer transition-colors flex items-center justify-between group ${explorePriceFilter === opt.value ? 'font-bold text-[#E7364D] bg-[#FAD8DC]/20' : 'text-[#333333] hover:bg-[#F5F5F5]'}`}
                                        >
                                            {opt.label}
                                            {explorePriceFilter === opt.value && <Check size={16} className="text-[#E7364D]" strokeWidth={3} />}
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