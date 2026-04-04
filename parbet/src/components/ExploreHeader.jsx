import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, User, Menu, MapPin, Calendar, 
    ChevronDown, Ticket, Trophy, Mic, Drama, Tent, Tag 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useStore';
import SearchDropdown from './SearchDropdown';
import LocationDropdown from './LocationDropdown';
import FilterDropdown from './FilterDropdown';

export default function ExploreHeader() {
    const navigate = useNavigate();
    const { 
        isAuthenticated, 
        openAuthModal, 
        searchQuery, 
        setSearchQuery,
        isSearchExpanded,
        setSearchExpanded,
        userCity,
        exploreCategory,
        setExploreCategory,
        exploreDateFilter,
        explorePriceFilter,
        isLocationDropdownOpen,
        setLocationDropdownOpen
    } = useAppStore();

    // Local states for dropdown toggles
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
    const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);

    // Protected Route Handler
    const handleNavigation = (path) => {
        if (isAuthenticated) {
            navigate(path);
        } else {
            openAuthModal();
        }
    };

    const categories = [
        { name: 'All Events', icon: Ticket },
        { name: 'Sports', icon: Trophy },
        { name: 'Concerts', icon: Mic },
        { name: 'Theater', icon: Drama },
        { name: 'Festivals', icon: Tent }
    ];

    return (
        <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
            {/* Top Promotional Banner */}
            <div className="w-full bg-white py-2 text-center border-b border-gray-100 hidden md:block">
                <p className="text-[11px] text-gray-500 font-medium tracking-wide">
                    We're the world's largest secondary marketplace for tickets to live events. Prices are set by sellers and may be below or above face value.
                </p>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4 pb-4">
                
                {/* Top Row: Logo, Search Bar, and Right Navigation */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    
                    {/* Left: Logo & Search Bar */}
                    <div className="flex items-center w-full md:w-auto flex-1 gap-6 md:gap-8">
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <h1 
                                onClick={() => navigate('/')} 
                                className="text-3xl font-black tracking-tighter text-brand-text cursor-pointer hover:text-brand-primary transition-colors"
                            >
                                parbet
                            </h1>
                            {/* Mobile Hamburger */}
                            <div className="md:hidden flex items-center space-x-4">
                                {isAuthenticated ? (
                                    <div onClick={() => navigate('/dashboard')} className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center cursor-pointer">
                                        <User size={16} className="text-white"/>
                                    </div>
                                ) : (
                                    <button onClick={openAuthModal} className="text-sm font-bold text-brand-primary">Sign In</button>
                                )}
                                <Menu size={24} className="text-brand-text cursor-pointer"/>
                            </div>
                        </div>
                        
                        {/* Desktop Search Bar (Centered/Left-aligned) */}
                        <div className="hidden md:block relative max-w-lg w-full z-50">
                            <div className={`relative flex items-center bg-white border rounded-full px-4 py-2.5 w-full transition-all duration-300 ${isSearchExpanded ? 'shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-gray-200' : 'border-gray-300 hover:border-[#458731]'}`}>
                                <Search size={20} className="text-gray-400 mr-2 font-bold"/>
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchExpanded(true)}
                                    onBlur={() => setTimeout(() => setSearchExpanded(false), 200)}
                                    placeholder="Search events, artists, teams and more" 
                                    className="bg-transparent outline-none flex-1 text-sm text-brand-text placeholder-gray-500 font-medium"
                                />
                                <SearchDropdown />
                            </div>
                        </div>
                    </div>

                    {/* Right: Nav Links & Tertiary Location/Date Sub-nav */}
                    <div className="hidden md:flex flex-col items-end">
                        <nav className="flex items-center space-x-6 text-[15px] font-bold text-brand-text mb-2">
                            <button onClick={() => navigate('/explore')} className="hover:text-brand-primary transition-colors">Explore</button>
                            <button onClick={() => handleNavigation('/sell')} className="hover:text-brand-primary transition-colors">Sell</button>
                            <button onClick={() => handleNavigation('/dashboard')} className="hover:text-brand-primary transition-colors">Favourites</button>
                            <button onClick={() => handleNavigation('/dashboard')} className="hover:text-brand-primary transition-colors">My Tickets</button>
                            
                            <div className="flex items-center pl-2">
                                {isAuthenticated ? (
                                    <div onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 cursor-pointer hover:text-brand-primary transition-colors">
                                        <span>Sign In</span>
                                        <div className="w-8 h-8 rounded-full bg-[#114C2A] flex items-center justify-center">
                                            <User size={16} className="text-white"/>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={openAuthModal} className="flex items-center space-x-2 cursor-pointer group">
                                        <span className="group-hover:text-brand-primary transition-colors">Sign In</span>
                                        <div className="w-8 h-8 rounded-full bg-[#458731] flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <User size={16} className="text-white"/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </nav>
                        
                        {/* Tertiary Row: Quick selectors under navigation */}
                        <div className="flex items-center space-x-6 text-[13px] font-medium text-gray-500 pr-2">
                            <button onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)} className="flex items-center hover:text-brand-text transition-colors">
                                <MapPin size={14} className="mr-1.5"/> {userCity} <ChevronDown size={14} className="ml-1"/>
                            </button>
                            <button className="flex items-center hover:text-brand-text transition-colors">
                                <Calendar size={14} className="mr-1.5"/> {exploreDateFilter || 'All dates'} <ChevronDown size={14} className="ml-1"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden relative w-full mb-6 z-50">
                    <div className="relative flex items-center bg-white border border-gray-300 rounded-full px-4 py-2.5 w-full transition-all">
                        <Search size={20} className="text-gray-400 mr-2"/>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchExpanded(true)}
                            onBlur={() => setTimeout(() => setSearchExpanded(false), 200)}
                            placeholder="Search events, artists..." 
                            className="bg-transparent outline-none flex-1 text-sm font-medium"
                        />
                        <SearchDropdown />
                    </div>
                </div>

                {/* Bottom Row: Dynamic Categories & Filters */}
                <div className="flex flex-col">
                    {/* Categories Rail */}
                    <div className="flex items-center space-x-6 md:space-x-10 mb-5 overflow-x-auto hide-scrollbar border-b border-gray-200">
                        {categories.map((cat) => {
                            const isActive = exploreCategory === cat.name;
                            const Icon = cat.icon;
                            return (
                                <button 
                                    key={cat.name}
                                    onClick={() => setExploreCategory(cat.name)}
                                    className={`flex flex-col items-center pb-3 relative min-w-max transition-colors ${isActive ? 'text-[#458731]' : 'text-[#6A7074] hover:text-gray-900'}`}
                                >
                                    <Icon size={22} className="mb-1.5" strokeWidth={isActive ? 2 : 1.5} />
                                    <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                        {cat.name}
                                    </span>
                                    {isActive && (
                                        <motion.div 
                                            layoutId="exploreHeaderCategoryUnderline"
                                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#458731] rounded-t-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center space-x-3 overflow-x-visible hide-scrollbar relative pb-1">
                        {/* Location Dropdown Pill */}
                        <div className="relative">
                            <button 
                                onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)}
                                className="bg-[#E6F2D9] border border-[#C5E1A5] text-[#114C2A] px-4 py-2 rounded-full text-sm font-bold flex items-center whitespace-nowrap shadow-sm hover:bg-[#D9EBBF] transition-colors"
                            >
                                <MapPin size={16} className="mr-2"/> 
                                {userCity} 
                                <ChevronDown size={16} className={`ml-2 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            <LocationDropdown />
                        </div>

                        {/* Dates Dropdown Pill */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setDateDropdownOpen(!dateDropdownOpen);
                                    setPriceDropdownOpen(false);
                                }}
                                className={`border px-4 py-2 rounded-full text-sm font-medium flex items-center whitespace-nowrap shadow-sm transition-colors ${exploreDateFilter !== 'All dates' ? 'bg-gray-100 border-gray-400 text-brand-text' : 'bg-white border-gray-300 text-brand-text hover:bg-gray-50'}`}
                            >
                                <Calendar size={16} className="mr-2 opacity-60"/> 
                                {exploreDateFilter} 
                                <ChevronDown size={16} className={`ml-2 opacity-60 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            <FilterDropdown type="date" isOpen={dateDropdownOpen} onClose={() => setDateDropdownOpen(false)} />
                        </div>

                        {/* Price Dropdown Pill */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setPriceDropdownOpen(!priceDropdownOpen);
                                    setDateDropdownOpen(false);
                                }}
                                className={`border px-4 py-2 rounded-full text-sm font-medium flex items-center whitespace-nowrap shadow-sm transition-colors ${explorePriceFilter !== 'All' ? 'bg-gray-100 border-gray-400 text-brand-text' : 'bg-white border-gray-300 text-brand-text hover:bg-gray-50'}`}
                            >
                                <Tag size={16} className="mr-2 opacity-60"/> 
                                {explorePriceFilter === 'All' ? 'Price' : explorePriceFilter} 
                                <ChevronDown size={16} className={`ml-2 opacity-60 transition-transform ${priceDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            <FilterDropdown type="price" isOpen={priceDropdownOpen} onClose={() => setPriceDropdownOpen(false)} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}