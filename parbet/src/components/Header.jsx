import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MapPin, X } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import SearchDropdown from './SearchDropdown';
import NavHoverMenu from './NavHoverMenu';

// Strict 2-line animated hamburger component
const Hamburger = ({ isOpen, toggle }) => (
    <button onClick={toggle} className="relative w-6 h-5 flex flex-col justify-between items-center focus:outline-none z-[110]">
        <span className={`block h-0.5 w-full bg-brand-text transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
        <span className={`block h-0.5 w-full bg-brand-text transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
    </button>
);

// High-end Green User SVG Icon Component
const UserProfileIcon = ({ onClick, isAuthenticated }) => (
    <div 
        onClick={onClick}
        className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-sm ${isAuthenticated ? 'bg-brand-primary' : 'bg-[#458731]'}`}
    >
        <User size={20} className="text-white fill-current" />
    </div>
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
        setMobileMenuOpen(false); 
        if (isAuthenticated) {
            navigate(path);
        } else {
            openAuthModal();
        }
    };

    const topNavLinks = [
        { name: 'Sports', category: 'Sports' },
        { name: 'Concerts', category: 'Concerts' },
        { name: 'Theatre', category: 'Theater' }, 
        { name: 'Top Cities', category: 'Top Cities' }
    ];

    return (
        <header className="w-full bg-white border-b border-brand-border sticky top-0 z-50">
            {/* Top Promotional Banner */}
            <div className="w-full bg-white py-2 text-center border-b border-gray-100 hidden md:block">
                <p className="text-xs text-brand-muted font-medium px-4">
                    We're the world's largest secondary marketplace for tickets to live events. Prices are set by sellers and may be below or above face value.
                </p>
            </div>

            {/* Main Navigation Row */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between relative z-50 bg-white">
                
                {/* Logo & Desktop Links */}
                <div className="flex items-center space-x-6">
                    <h1 onClick={() => navigate('/')} className="text-3xl font-black tracking-tighter text-brand-text cursor-pointer hover:text-brand-primary transition-colors">
                        parbet
                    </h1>
                    <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-brand-text relative z-[200]">
                        {topNavLinks.map((link) => (
                            <div 
                                key={link.name}
                                className="relative py-2"
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

                {/* Right Side Tools */}
                <div className="flex items-center space-x-4 md:space-x-6">
                    {/* Location Badge */}
                    <div className="flex items-center text-[#114C2A] bg-[#EAF4D9] px-3 py-1.5 rounded-full border border-[#C5E1A5] shadow-sm transition-all hover:bg-[#D9EBBF] cursor-default">
                        <MapPin size={14} className="mr-2 opacity-80" />
                        <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-wide truncate max-w-[80px] md:max-w-none">
                            {manualCity || userCity || 'Detecting...'}
                        </span>
                    </div>

                    {/* Desktop Utility Links */}
                    <nav className="hidden md:flex items-center space-x-5 text-sm font-medium text-brand-text">
                        <button onClick={() => navigate('/explore')} className="hover:text-brand-primary transition-colors">Explore</button>
                        <button onClick={() => handleNavigation('/sell')} className="hover:text-brand-primary transition-colors">Sell</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="hover:text-brand-primary transition-colors">Favourites</button>
                    </nav>

                    {/* Authentication / Profile SVG Icon */}
                    <div className="flex items-center space-x-4">
                        <UserProfileIcon 
                            isAuthenticated={isAuthenticated} 
                            onClick={() => handleNavigation('/dashboard')} 
                        />
                        
                        {/* Mobile Hamburger */}
                        <div className="md:hidden">
                            <Hamburger isOpen={mobileMenuOpen} toggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay - Strictly z-[100] to cover search bar */}
            <div className={`md:hidden fixed inset-0 bg-white transition-transform duration-300 ease-in-out z-[100] ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex flex-col h-full pt-24 px-6 pb-10 overflow-y-auto">
                    {/* Custom Close Button in Mobile Overlay Top Right */}
                    <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2">
                        <X size={28} className="text-brand-text" />
                    </button>

                    <div className="flex flex-col space-y-6 text-center">
                        <h2 className="text-3xl font-black tracking-tighter text-brand-text mb-4">parbet</h2>
                        <button onClick={() => { setMobileMenuOpen(false); navigate('/explore'); }} className="text-xl font-bold text-brand-text">Explore</button>
                        <button onClick={() => handleNavigation('/sell')} className="text-xl font-bold text-brand-text">Sell</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="text-xl font-bold text-brand-text">My Tickets</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="text-xl font-bold text-brand-text">Favourites</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="text-xl font-bold text-brand-text">Profile</button>
                        
                        {!isAuthenticated && (
                            <button 
                                onClick={openAuthModal}
                                className="mt-4 bg-[#458731] text-white py-4 rounded-xl font-bold text-lg shadow-md"
                            >
                                Sign In / Register
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Search Bar Section - Strictly z-40 so it goes "back" when menu opens */}
            <div className={`max-w-3xl mx-auto px-4 pb-6 md:pb-8 relative z-40 w-full transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className={`relative flex items-center bg-white border rounded-full px-5 py-3.5 w-full transition-all duration-300 ${isSearchExpanded ? 'shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-gray-200' : 'border-gray-300 shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus-within:shadow-[0_4px_25px_rgba(17,76,42,0.15)] focus-within:border-[#458731]'}`}>
                    <Search size={22} className="text-[#458731] mr-3 font-bold"/>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchExpanded(true)}
                        onBlur={() => setTimeout(() => setSearchExpanded(false), 200)}
                        placeholder="Search events, artists, teams and more" 
                        className="bg-transparent outline-none flex-1 text-base text-brand-text placeholder-gray-500 font-medium"
                    />
                    <SearchDropdown />
                </div>
            </div>
        </header>
    );
}