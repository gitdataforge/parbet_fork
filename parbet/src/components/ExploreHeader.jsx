import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Menu, Bell, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import SearchDropdown from './SearchDropdown';
import ViagogoFilterBar from './ViagogoFilterBar';

/**
 * FEATURE 1: Unified "Mega-Header" Architecture (Merges Top Nav with Filters)
 * FEATURE 2: 1:1 Viagogo Enterprise Desktop Layout (image_3f8e19)
 * FEATURE 3: 1:1 Viagogo Enterprise Mobile Layout (image_3f8a9c)
 * FEATURE 4: Sticky Context Retention (Filters stick to ceiling with navigation)
 * FEATURE 5: Isolated Search Expansion State
 * FEATURE 6: Hardware-Accelerated Mobile Drawer (Smooth off-canvas translation)
 * FEATURE 7: Background Scroll-Lock (Prevents body scroll when drawer is active)
 * FEATURE 8: Native Auth Redirection & Seller Bridge
 */

const UserProfileIcon = ({ onClick, isAuthenticated }) => (
    <div 
        onClick={onClick}
        className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-sm ${isAuthenticated ? 'bg-[#114C2A]' : 'bg-[#1a1a1a] md:bg-[#458731]'}`}
    >
        <User size={18} className="text-white fill-current" />
    </div>
);

export default function ExploreHeader() {
    const navigate = useNavigate();
    const { 
        isAuthenticated, 
        searchQuery, 
        setSearchQuery,
        isSearchExpanded,
        setSearchExpanded
    } = useAppStore();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [menuView, setMenuView] = useState('main'); 

    // FEATURE 7: Scroll Lock logic for mobile drawer
    useEffect(() => {
        if (mobileMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [mobileMenuOpen]);

    // Reset nested view when drawer closes
    useEffect(() => {
        if (!mobileMenuOpen) setTimeout(() => setMenuView('main'), 300);
    }, [mobileMenuOpen]);

    const handleNavigation = (path) => {
        setMobileMenuOpen(false); 
        if (isAuthenticated) navigate(path);
        else navigate('/login');
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            setSearchExpanded(false);
            e.target.blur();
        }
    };

    return (
        <header className="w-full bg-white sticky top-0 z-50 font-sans flex flex-col border-b border-gray-200 shadow-sm">
            
            {/* ROW 1: TOP NAV (Desktop & Mobile Base) */}
            <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4 relative z-50 bg-white">
                
                {/* MOBILE LEFT: Hamburger */}
                <div className="lg:hidden flex items-center">
                    <button onClick={() => setMobileMenuOpen(true)} className="focus:outline-none p-1 -ml-1">
                        <Menu size={24} className="text-[#1a1a1a]" strokeWidth={2} />
                    </button>
                </div>

                {/* LOGO */}
                <div className="flex-shrink-0 cursor-pointer flex items-center justify-center lg:justify-start" onClick={() => navigate('/')}>
                    <h1 className="text-[26px] md:text-[28px] font-black tracking-tighter text-[#1a1a1a] hover:text-[#458731] transition-colors">
                        parbet
                    </h1>
                </div>

                {/* DESKTOP SEARCH BAR (Exact Viagogo Styling) */}
                <div className="hidden lg:flex flex-1 max-w-[480px] ml-6 relative">
                    <div className={`relative flex items-center w-full border rounded-full px-4 py-2.5 bg-white transition-all duration-300 ${isSearchExpanded ? 'shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-gray-300' : 'border-gray-300 hover:border-gray-400 focus-within:border-[#1a1a1a] focus-within:shadow-[0_0_0_1px_#1a1a1a]'}`}>
                        <Search size={18} className="text-[#1a1a1a] mr-3" strokeWidth={2.5} />
                        <input 
                            type="text" 
                            placeholder="Search events, artists, teams and more" 
                            className="w-full outline-none text-[14px] font-medium text-[#1a1a1a] placeholder-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                            onFocus={() => setSearchExpanded(true)}
                            onBlur={() => setTimeout(() => setSearchExpanded(false), 200)}
                        />
                        {isSearchExpanded && <SearchDropdown />}
                    </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-4 md:gap-7 justify-end flex-1 lg:flex-none">
                    {/* Desktop Links */}
                    <nav className="hidden lg:flex items-center gap-6">
                        <span onClick={() => navigate('/explore')} className="text-[14px] font-bold text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">Explore</span>
                        <span onClick={() => window.location.href = 'https://parbet-seller-44902.web.app'} className="text-[14px] font-bold text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">Sell</span>
                        <span onClick={() => handleNavigation('/profile/settings')} className="text-[14px] font-bold text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">Favourites</span>
                        <span onClick={() => handleNavigation('/profile/orders')} className="text-[14px] font-bold text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">My Tickets</span>
                        <span onClick={() => handleNavigation('/profile')} className="text-[14px] font-bold text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">Profile</span>
                    </nav>
                    
                    {/* User & Bell */}
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex w-9 h-9 rounded-full bg-[#f0f2f5] items-center justify-center cursor-pointer hover:bg-[#e4e6eb] transition-colors">
                            <Bell size={18} className="text-[#1a1a1a]" />
                        </div>
                        <div className="lg:hidden flex w-8 h-8 rounded-full bg-[#f0f2f5] items-center justify-center cursor-pointer hover:bg-[#e4e6eb] transition-colors">
                            <Bell size={16} className="text-[#1a1a1a]" />
                        </div>
                        <UserProfileIcon 
                            isAuthenticated={isAuthenticated} 
                            onClick={() => handleNavigation('/profile')} 
                        />
                    </div>
                </div>
            </div>

            {/* ROW 2: MOBILE SEARCH BAR (Exact Mobile View) */}
            <div className="lg:hidden w-full px-4 pb-3 bg-white relative z-40">
                <div className="relative flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 w-full transition-all focus-within:border-[#1a1a1a] focus-within:shadow-[0_0_0_1px_#1a1a1a]">
                    <Search size={18} className="text-[#1a1a1a] mr-2" strokeWidth={2.5}/>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchSubmit}
                        onFocus={() => setSearchExpanded(true)}
                        onBlur={() => setTimeout(() => setSearchExpanded(false), 200)}
                        placeholder="Search events, artists, teams and more" 
                        className="bg-transparent outline-none flex-1 text-[14px] font-medium text-[#1a1a1a] placeholder-gray-500"
                    />
                    {isSearchExpanded && <SearchDropdown />}
                </div>
            </div>

            {/* ROW 3 & 4: VIAGOGO CATEGORIES & FILTER PILLS */}
            {/* Embedded seamlessly inside the sticky wrapper */}
            <div className="w-full relative z-30">
                <ViagogoFilterBar />
            </div>

            {/* MOBILE DRAWER OVERLAY */}
            <div className={`lg:hidden fixed inset-0 z-[999] ${mobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
                <div 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                />

                <div className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-white flex flex-col shadow-[20px_0_60px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0 min-h-[70px]">
                        {menuView === 'main' ? (
                            <>
                                <h2 className="text-[26px] font-black tracking-tighter text-[#1a1a1a]">parbet</h2>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <X size={24} className="text-gray-500" strokeWidth={2} />
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setMenuView('main')} className="flex items-center text-[#1a1a1a] font-black text-[18px] w-full">
                                <ChevronLeft size={24} className="mr-3 text-gray-500" />
                                {menuView === 'sell' ? 'Sell on Parbet' : 'My Tickets'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-white">
                        {menuView === 'main' && (
                            <ul className="flex flex-col w-full py-2">
                                {!isAuthenticated && (
                                    <li onClick={() => handleNavigation('/login')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                        Sign In
                                    </li>
                                )}
                                <li onClick={() => setMenuView('sell')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold flex justify-between items-center cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    Sell <ChevronRight size={20} className="text-gray-400" />
                                </li>
                                <li onClick={() => handleNavigation('/profile/settings')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    Favorites
                                </li>
                                <li onClick={() => setMenuView('tickets')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold flex justify-between items-center cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    My Tickets <ChevronRight size={20} className="text-gray-400" />
                                </li>
                                <li onClick={() => { setMobileMenuOpen(false); navigate('/explore'); }} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    Explore
                                </li>
                            </ul>
                        )}

                        {menuView === 'sell' && (
                            <ul className="flex flex-col w-full py-2">
                                <li onClick={() => window.location.href = 'https://parbet-seller-44902.web.app'} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    Sell Tickets
                                </li>
                                <li onClick={() => handleNavigation('/profile/orders')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    My Tickets
                                </li>
                                <li onClick={() => handleNavigation('/profile/sales')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    My Sales
                                </li>
                            </ul>
                        )}

                        {menuView === 'tickets' && (
                            <ul className="flex flex-col w-full py-2">
                                <li onClick={() => handleNavigation('/profile/orders')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    Orders
                                </li>
                                <li onClick={() => handleNavigation('/profile/listings')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    My Listings
                                </li>
                                <li onClick={() => handleNavigation('/profile/sales')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    My Sales
                                </li>
                                <li onClick={() => handleNavigation('/profile/payments')} className="px-6 py-[16px] text-[16px] text-[#1a1a1a] font-bold cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    Payments
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}