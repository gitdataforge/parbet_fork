import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, X } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import SearchDropdown from './SearchDropdown';
import NavHoverMenu from './NavHoverMenu';

// Strict 2-line animated hamburger component
const Hamburger = ({ isOpen, toggle }) => (
    <button onClick={toggle} className="relative w-6 h-5 flex flex-col justify-between items-center focus:outline-none z-[110]">
        <span className={`block h-0.5 w-full bg-[#1a1a1a] transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
        <span className={`block h-0.5 w-full bg-[#1a1a1a] transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
    </button>
);

// High-end Green User SVG Icon Component
const UserProfileIcon = ({ onClick, isAuthenticated }) => (
    <div 
        onClick={onClick}
        className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-sm ${isAuthenticated ? 'bg-[#114C2A]' : 'bg-[#458731]'}`}
    >
        <User size={20} className="text-white fill-current" />
    </div>
);

export default function Header() {
    const navigate = useNavigate();
    const { 
        isAuthenticated, 
        searchQuery, 
        setSearchQuery,
        isSearchExpanded,
        setSearchExpanded,
        setExploreCategory
    } = useAppStore();

    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    /**
     * STRICT NAVIGATION GUARD
     * Redirects to standalone /login page for all unauthenticated requests.
     */
    const handleNavigation = (path) => {
        setMobileMenuOpen(false); 
        if (isAuthenticated) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    // STRICT CONTENT REPLICATION: Cricket & Kabaddi Focus
    const topNavLinks = [
        { name: 'Cricket', category: 'Sports' },
        { name: 'Kabaddi', category: 'Sports' },
        { name: 'Tournaments', category: 'Sports' }, 
        { name: 'Top Cities', category: 'Top Cities' }
    ];

    return (
        <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
            {/* Top Promotional Banner (Exact Viagogo Copy) */}
            <div className="w-full bg-white py-2.5 text-center border-b border-gray-200 hidden md:block">
                <p className="text-[13px] text-gray-500 font-medium px-4">
                    We're the world's largest secondary marketplace for tickets to live events. Prices are set by sellers and may be below or above face value.
                </p>
            </div>

            {/* Main Navigation Row */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-5 flex items-center justify-between relative z-50 bg-white">
                
                {/* Logo & Desktop Links (Left Aligned) */}
                <div className="flex items-center space-x-8">
                    <h1 onClick={() => navigate('/')} className="text-[28px] font-black tracking-tighter text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">
                        parbet
                    </h1>
                    <nav className="hidden lg:flex items-center space-x-6 text-[15px] font-medium text-[#1a1a1a] relative z-[200]">
                        {topNavLinks.map((link) => (
                            <div 
                                key={link.name}
                                // HITBOX OPTIMIZATION: py-3 provides the physical bridge to the dropdown
                                className="relative py-3 cursor-pointer"
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
                                    className={`transition-colors pointer-events-none ${hoveredCategory === link.category ? 'text-[#458731]' : 'hover:text-[#458731]'}`}
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

                {/* Right Side Tools (Right Aligned) */}
                <div className="flex items-center space-x-5 md:space-x-6">
                    {/* Desktop Utility Links */}
                    <nav className="hidden lg:flex items-center space-x-6 text-[15px] font-medium text-[#1a1a1a]">
                        <button onClick={() => navigate('/explore')} className="hover:text-[#458731] transition-colors">Explore</button>
                        <button onClick={() => handleNavigation('/sell')} className="hover:text-[#458731] transition-colors">Sell</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="hover:text-[#458731] transition-colors">Favorites</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="hover:text-[#458731] transition-colors whitespace-nowrap">My Tickets</button>
                        {!isAuthenticated && (
                            <button onClick={() => navigate('/login')} className="hover:text-[#458731] transition-colors whitespace-nowrap">Sign In</button>
                        )}
                    </nav>

                    {/* Authentication / Profile SVG Icon */}
                    <div className="flex items-center space-x-4">
                        <UserProfileIcon 
                            isAuthenticated={isAuthenticated} 
                            onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/login')} 
                        />
                        
                        {/* Mobile Hamburger */}
                        <div className="lg:hidden">
                            <Hamburger isOpen={mobileMenuOpen} toggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Search Bar Section - Centered Wide Pill Below Nav */}
            <div className={`max-w-[850px] mx-auto px-4 pb-6 md:pb-8 relative z-40 w-full transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className={`relative flex items-center bg-white border rounded-full px-5 py-3.5 w-full transition-all duration-300 ${isSearchExpanded ? 'shadow-[0_10px_30px_rgba(0,0,0,0.12)] border-gray-300' : 'border-gray-200 shadow-sm focus-within:shadow-[0_8px_25px_rgba(0,0,0,0.08)] focus-within:border-[#458731]'}`}>
                    <Search size={22} className="text-[#458731] mr-3 font-bold"/>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchExpanded(true)}
                        onBlur={() => setTimeout(() => setSearchExpanded(false), 200)}
                        placeholder="Search events, artists, teams and more" 
                        className="bg-transparent outline-none flex-1 text-[16px] text-[#1a1a1a] placeholder-gray-500 font-medium"
                    />
                    <SearchDropdown />
                </div>
            </div>

            {/* Mobile Menu Overlay - Isolated Standalone Experience */}
            <div className={`lg:hidden fixed inset-0 bg-white transition-transform duration-300 ease-in-out z-[100] ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex flex-col h-full pt-24 px-6 pb-10 overflow-y-auto">
                    <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2">
                        <X size={28} className="text-[#1a1a1a]" />
                    </button>

                    <div className="flex flex-col space-y-6 text-center">
                        <h2 className="text-3xl font-black tracking-tighter text-[#1a1a1a] mb-4">parbet</h2>
                        <button onClick={() => { setMobileMenuOpen(false); navigate('/explore'); }} className="text-xl font-bold text-[#1a1a1a]">Explore</button>
                        <button onClick={() => handleNavigation('/sell')} className="text-xl font-bold text-[#1a1a1a]">Sell</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="text-xl font-bold text-[#1a1a1a]">My Tickets</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="text-xl font-bold text-[#1a1a1a]">Favorites</button>
                        <button onClick={() => handleNavigation('/dashboard')} className="text-xl font-bold text-[#1a1a1a]">Profile</button>
                        
                        {!isAuthenticated && (
                            <button 
                                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                                className="mt-4 bg-[#458731] text-white py-4 rounded-xl font-bold text-lg shadow-md"
                            >
                                Sign In / Register
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}