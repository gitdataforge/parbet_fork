import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MapPin } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import SearchDropdown from './SearchDropdown';
import NavHoverMenu from './NavHoverMenu';

// Strict 2-line animated hamburger component
const Hamburger = ({ isOpen, toggle }) => (
    <button onClick={toggle} className="relative w-6 h-5 flex flex-col justify-between items-center focus:outline-none z-50">
        <span className={`block h-0.5 w-full bg-brand-text transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
        <span className={`block h-0.5 w-full bg-brand-text transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
    </button>
);

export default function Header() {
    const navigate = useNavigate();
    const { 
        isAuthenticated, 
        openAuthModal, 
        searchQuery, 
        setSearchQuery,
        isSearchExpanded,
        setSearchExpanded,
        setExploreCategory,
        manualCity,
        userCity
    } = useAppStore();

    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Centralized navigation guard for protected routes
    const handleNavigation = (path) => {
        setMobileMenuOpen(false); // Close mobile menu on redirect
        if (isAuthenticated) {
            navigate(path);
        } else {
            openAuthModal();
        }
    };

    const topNavLinks = [
        { name: 'Sports', category: 'Sports' },
        { name: 'Concerts', category: 'Concerts' },
        { name: 'Theatre', category: 'Theater' }, // Matches global store category
        { name: 'Top Cities', category: 'Top Cities' } // Fixed: Triggers global volume aggregation
    ];

    return (
        <header className="w-full bg-white border-b border-brand-border sticky top-0 z-40">
            {/* Top Promotional Banner */}
            <div className="w-full bg-white py-2 text-center border-b border-gray-100 hidden md:block">
                <p className="text-xs text-brand-muted font-medium">
                    We're the world's largest secondary marketplace for tickets to live events. Prices are set by sellers and may be below or above face value.
                </p>
            </div>

            {/* Main Navigation Row */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between relative">
                
                {/* Mobile Top Row (Logo + Hamburger) */}
                <div className="w-full md:w-auto flex justify-between items-center mb-4 md:mb-0">
                    <div className="flex items-center space-x-6">
                        <h1 onClick={() => navigate('/')} className="text-3xl font-black tracking-tighter text-brand-text cursor-pointer hover:text-brand-primary transition-colors">
                            parbet
                        </h1>
                        {/* Fixed: Enforced strict relative positioning and high z-index stacking context */}
                        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-brand-text relative z-[200]">
                            {topNavLinks.map((link) => (
                                <div 
                                    key={link.name}
                                    className="relative py-2" // Padding extends hover bridge slightly
                                    onMouseEnter={() => setHoveredCategory(link.category)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <button 
                                        onClick={() => { 
                                            if (link.category) {
                                                setExploreCategory(link.category); 
                                                navigate('/explore'); 
                                            }
                                        }} 
                                        className={`transition-colors cursor-pointer ${hoveredCategory === link.category ? 'text-brand-primary' : 'hover:text-brand-primary'}`}
                                    >
                                        {link.name}
                                    </button>
                                    
                                    {/* Mount the interactive hover dropdown dynamically */}
                                    {link.category && (
                                        <NavHoverMenu 
                                            isOpen={hoveredCategory === link.category} 
                                            category={link.category}
                                            onMouseEnter={() => setHoveredCategory(link.category)}
                                            onMouseLeave={() => setHoveredCategory(null)}
                                        />
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                    <div className="md:hidden flex items-center space-x-4">
                        {/* Mobile Location Display */}
                        <div className="flex items-center text-[#114C2A] bg-[#EAF4D9] px-2.5 py-1.5 rounded-full border border-[#C5E1A5] shadow-sm">
                            <MapPin size={12} className="mr-1.5 opacity-80" />
                            <span className="text-[10px] font-bold uppercase tracking-wide truncate max-w-[70px]">
                                {manualCity || userCity || 'Loading...'}
                            </span>
                        </div>
                        {isAuthenticated ? (
                            <div 
                                onClick={() => handleNavigation('/dashboard')}
                                className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center cursor-pointer"
                            >
                                <User size={16} className="text-white"/>
                            </div>
                        ) : (
                            <button onClick={openAuthModal} className="text-sm font-bold text-brand-primary">Sign In</button>
                        )}
                        <Hamburger isOpen={mobileMenuOpen} toggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                    </div>
                </div>

                {/* Right Side Navigation (Desktop) */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-brand-text">
                    {/* Desktop Location Display */}
                    <div className="flex items-center text-[#114C2A] bg-[#EAF4D9] px-3 py-1.5 rounded-full cursor-default border border-[#C5E1A5] shadow-sm transition-all hover:bg-[#D9EBBF]">
                        <MapPin size={14} className="mr-2 opacity-80" />
                        <span className="text-[12px] font-bold uppercase tracking-wide">
                            {manualCity || userCity || 'Loading...'}
                        </span>
                    </div>

                    <button onClick={() => navigate('/explore')} className="hover:text-brand-primary transition-colors">Explore</button>
                    
                    <button onClick={() => handleNavigation('/sell')} className="hover:text-brand-primary transition-colors">Sell</button>
                    <button onClick={() => handleNavigation('/dashboard')} className="hover:text-brand-primary transition-colors">Favourites</button>
                    <button onClick={() => handleNavigation('/dashboard')} className="hover:text-brand-primary transition-colors">My Tickets</button>

                    <div className="flex items-center space-x-4 pl-2">
                        {isAuthenticated ? (
                            <div 
                                onClick={() => handleNavigation('/dashboard')}
                                className="flex items-center space-x-3 cursor-pointer"
                            >
                                <span className="font-bold">Profile</span>
                                <div className="w-9 h-9 rounded-full bg-[#114C2A] flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                    <User size={18} className="text-white"/>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button onClick={openAuthModal} className="font-bold hover:text-brand-primary transition-colors">Sign In</button>
                                <div onClick={openAuthModal} className="w-9 h-9 rounded-full bg-[#458731] flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform">
                                    <User size={18} className="text-white"/>
                                </div>
                            </>
                        )}
                    </div>
                </nav>
            </div>

            {/* Mobile Animated Dropdown */}
            <div className={`md:hidden absolute w-full bg-white border-b overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 shadow-lg border-brand-border' : 'max-h-0 border-transparent'}`}>
                <div className="flex flex-col p-4 space-y-4 font-semibold text-brand-text text-center">
                    <button onClick={() => { setMobileMenuOpen(false); navigate('/explore'); }}>Explore</button>
                    <button onClick={() => handleNavigation('/sell')}>Sell</button>
                    <button onClick={() => handleNavigation('/dashboard')}>My Tickets</button>
                    <button onClick={() => handleNavigation('/dashboard')}>Profile</button>
                </div>
            </div>

            {/* Floating Search Bar Section with Real-Time Dropdown */}
            <div className="max-w-3xl mx-auto px-4 pb-6 md:pb-8 relative z-50 w-full">
                <div className={`relative flex items-center bg-white border rounded-full px-5 py-3.5 w-full transition-all duration-300 ${isSearchExpanded ? 'shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-gray-200' : 'border-gray-300 shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus-within:shadow-[0_4px_25px_rgba(17,76,42,0.15)] focus-within:border-[#458731]'}`}>
                    <Search size={22} className="text-[#458731] mr-3 font-bold"/>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchExpanded(true)}
                        // Delay blur slightly to allow clicks on results
                        onBlur={() => setTimeout(() => setSearchExpanded(false), 200)}
                        placeholder="Search events, artists, teams and more" 
                        className="bg-transparent outline-none flex-1 text-base text-brand-text placeholder-gray-500 font-medium"
                    />
                    
                    {/* Absolute-positioned overlay dropdown exactly matching the input styling */}
                    <SearchDropdown />
                </div>
            </div>
        </header>
    );
}