import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, X, Menu, ChevronRight, ChevronLeft, TrendingUp, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useStore';
import SearchDropdown from './SearchDropdown';
import NavHoverMenu from './NavHoverMenu';

/**
 * FEATURE 1: Strict Keyword Enforcement Engine (Locks queries to IPL, Cricket, Kabaddi, World Cup)
 * FEATURE 2: Dynamic Auto-Correction (Intercepts invalid searches and defaults to approved categories)
 * FEATURE 3: Quick-Filter Dynamic Pills (One-tap strict category execution)
 * FEATURE 4: Isolated Profile Routing (Hides global search on profile paths)
 * FEATURE 5: Hardware-Accelerated Mobile Drawer (Smooth off-canvas translation)
 * FEATURE 6: Cross-Network Seller Bridge (Secure routing to parbet-seller)
 * FEATURE 7: Glassmorphism Header Overlays (backdrop-blur-md)
 * FEATURE 8: Keyboard Accessibility Trap (Enter key interception)
 * FEATURE 9: Nested Drawer Navigation (Sub-menus for Sell/Tickets)
 * FEATURE 10: Visual Focus Rings (Custom #8cc63f input states)
 * FEATURE 11: Ghost-Hover Prevention (Strict exact-name state tracking)
 * FEATURE 12: Z-Index Stacking Context Resolution (Drawer detached from header blur context)
 * FEATURE 13: Background Scroll-Lock (Prevents body scroll when drawer is active)
 * FEATURE 14: Isolated Route-Based Desktop Header (1:1 UI replication for /explore)
 * FEATURE 15: Deep-Nested Dropdown Navigations (Sell, My Tickets, Profile, Notifications)
 */

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
    const location = useLocation(); 
    const { 
        isAuthenticated, 
        searchQuery, 
        setSearchQuery,
        isSearchExpanded,
        setSearchExpanded,
        setExploreCategory
    } = useAppStore();

    // UI ISOLATION LOGIC: Strictly identify route contexts
    const isProfilePage = location.pathname.startsWith('/profile');
    const isExplorePage = location.pathname === '/explore';

    const [hoveredName, setHoveredName] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [menuView, setMenuView] = useState('main'); 

    // FEATURE 13: Scroll Lock logic for mobile drawer
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileMenuOpen]);

    // Reset nested view when drawer closes
    useEffect(() => {
        if (!mobileMenuOpen) {
            setTimeout(() => setMenuView('main'), 300);
        }
    }, [mobileMenuOpen]);

    const handleNavigation = (path) => {
        setMobileMenuOpen(false); 
        if (isAuthenticated) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    // STRICT CONTENT REPLICATION: Locked to authorized global categories
    const topNavLinks = [
        { name: 'IPL', category: 'IPL' },
        { name: 'Cricket', category: 'Cricket' },
        { name: 'Kabaddi', category: 'Kabaddi' }, 
        { name: 'World Cup', category: 'World Cup' }
    ];

    // FEATURE 1 & 2: Strict Search Interceptor
    const handleStrictSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            const q = searchQuery.toLowerCase();
            const allowed = ['ipl', 'cricket', 'kabaddi', 'world cup'];
            const isValid = allowed.some(valid => q.includes(valid));
            
            // Auto-correct invalid searches to ensure strict marketplace integrity
            if (!isValid && q.trim() !== '') {
                setSearchQuery('IPL'); 
            }
            
            navigate('/explore');
            setSearchExpanded(false);
            e.target.blur();
        }
    };

    return (
        <>
            <header className={`w-full ${isExplorePage ? 'bg-white' : 'bg-white/95 backdrop-blur-md'} border-b border-gray-200 sticky top-0 z-40 font-sans`}>
                
                {/* 1. TOP DISCLAIMER BANNER (Isolated: Hidden on Profile and Explore Pages) */}
                {!isProfilePage && !isExplorePage && (
                    <div className="w-full bg-white py-2 border-b border-gray-100 text-center">
                        <p className="text-[11px] md:text-[13px] text-gray-500 font-medium px-4 leading-tight">
                            We're the world's largest secondary marketplace for tickets to live events. Prices are set by sellers and may be below or above face value.
                        </p>
                    </div>
                )}

                {/* FEATURE 14: ISOLATED EXPLORE PAGE DESKTOP NAV (Exact 1:1 UI Replication) */}
                {isExplorePage && (
                    <div className="hidden lg:flex max-w-[1400px] mx-auto px-6 py-3 items-center justify-between relative z-50">
                        {/* Interactive Logo */}
                        <div className="flex-shrink-0 cursor-pointer mr-6" onClick={() => navigate('/')}>
                            <h1 className="text-[28px] font-black tracking-tighter text-[#1a1a1a] flex items-center">
                                par<span className="text-[#8cc63f]">bet</span>
                            </h1>
                        </div>

                        {/* Inline Search Bar */}
                        <div className="flex-1 max-w-[480px] mr-auto relative">
                            <div className="flex items-center w-full border border-gray-300 rounded-[8px] px-4 py-2.5 bg-white transition-all hover:border-gray-400 focus-within:border-black focus-within:shadow-[0_0_0_1px_black]">
                                <Search size={20} className="text-gray-600 mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Search events, artists, teams and more" 
                                    className="w-full outline-none text-[15px] font-medium text-[#1a1a1a] placeholder-gray-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleStrictSearchSubmit}
                                />
                            </div>
                        </div>

                        {/* Right-Aligned Action Links & Nested Dropdowns */}
                        <nav className="flex items-center gap-7">
                            <span onClick={() => navigate('/explore')} className="text-[15px] font-bold text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">Explore</span>
                            
                            {/* Sell Nested Dropdown */}
                            <div className="relative group py-4 cursor-pointer">
                                <span className="text-[15px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors">Sell</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-8px] w-48 bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 py-2 z-[100]">
                                    <div onClick={() => window.location.href = 'https://parbet-seller-44902.web.app'} className="px-5 py-2.5 text-[15px] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors">Sell Tickets</div>
                                    <div onClick={() => handleNavigation('/profile/orders')} className="px-5 py-2.5 text-[15px] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors">My Tickets</div>
                                    <div onClick={() => handleNavigation('/profile/sales')} className="px-5 py-2.5 text-[15px] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors">My Sales</div>
                                </div>
                            </div>

                            {/* Favorites Action Link */}
                            <span onClick={() => handleNavigation('/profile/settings')} className="text-[15px] font-bold text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">Favourites</span>

                            {/* My Tickets Nested Dropdown */}
                            <div className="relative group py-4 cursor-pointer">
                                <span className="text-[15px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors">My Tickets</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-8px] w-48 bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 py-2 z-[100]">
                                    <div onClick={() => handleNavigation('/profile/orders')} className="px-5 py-2.5 text-[15px] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors">Orders</div>
                                    <div onClick={() => handleNavigation('/profile/listings')} className="px-5 py-2.5 text-[15px] text-[#458731] hover:bg-[#f5f5f5] transition-colors">My Listings</div>
                                    <div onClick={() => handleNavigation('/profile/sales')} className="px-5 py-2.5 text-[15px] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors">My Sales</div>
                                    <div onClick={() => handleNavigation('/profile/payments')} className="px-5 py-2.5 text-[15px] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors">Payments</div>
                                </div>
                            </div>

                            {/* Profile Nested Dropdown */}
                            <div className="relative group py-4 cursor-pointer">
                                <span className="text-[15px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors">Profile</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-8px] w-48 bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 py-2 z-[100]">
                                    <div onClick={() => handleNavigation('/profile')} className="px-5 py-2.5 text-[15px] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors">My Hub</div>
                                    <div onClick={() => handleNavigation('/profile/settings')} className="px-5 py-2.5 text-[15px] text-[#458731] hover:bg-[#f5f5f5] transition-colors">Settings</div>
                                    <div onClick={() => navigate('/login')} className="px-5 py-2.5 text-[15px] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors">Sign out</div>
                                </div>
                            </div>

                            {/* User Avatar & Notification Bell Indicators */}
                            <div className="flex items-center gap-3 ml-2">
                                <div onClick={() => handleNavigation('/profile')} className="w-10 h-10 rounded-full bg-[#f0f2f5] flex items-center justify-center cursor-pointer hover:bg-[#e4e6eb] transition-colors">
                                    <User size={18} className="text-[#1a1a1a] fill-current" />
                                </div>
                                <div className="relative group py-4 cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-[#f0f2f5] flex items-center justify-center hover:bg-[#e4e6eb] transition-colors">
                                        <Bell size={18} className="text-[#1a1a1a]" />
                                    </div>
                                    <div className="absolute top-full right-0 mt-[-8px] w-72 bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 flex flex-col z-[100] overflow-hidden cursor-default">
                                        <div className="px-5 py-4 border-b border-gray-100 font-bold text-[16px] text-[#1a1a1a]">Notifications</div>
                                        <div className="py-12 flex flex-col items-center justify-center text-gray-500 gap-3">
                                            <Bell size={32} className="text-gray-400" />
                                            <span className="text-[15px] font-medium text-[#54626c]">No notifications</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                )}

                {/* 2. MAIN LOGO & NAV ROW (Hidden on Desktop Explore, shown on all standard pages & mobile views) */}
                <div className={`${isExplorePage ? 'lg:hidden' : ''} max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between relative z-50 bg-transparent`}>
                    
                    {/* MOBILE VIEW: Left Hamburger */}
                    <div className="lg:hidden w-10 flex justify-start">
                        <button onClick={() => setMobileMenuOpen(true)} className="focus:outline-none">
                            <Menu size={26} className="text-gray-600" strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* DESKTOP VIEW: Left Aligned Logo & Links */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <h1 onClick={() => navigate('/')} className="text-[28px] font-black tracking-tighter text-[#1a1a1a] cursor-pointer hover:text-[#458731] transition-colors">
                            parbet
                        </h1>
                        <nav className="flex items-center space-x-6 text-[15px] font-medium text-[#1a1a1a] relative z-[200]">
                            {topNavLinks.map((link) => (
                                <div 
                                    key={link.name}
                                    className="relative py-3 cursor-pointer"
                                    onMouseEnter={() => setHoveredName(link.name)}
                                    onMouseLeave={() => setHoveredName(null)}
                                >
                                    <button 
                                        onClick={() => { 
                                            if (link.category) {
                                                setExploreCategory(link.category); 
                                                navigate('/explore'); 
                                            }
                                        }} 
                                        className={`transition-colors pointer-events-none ${hoveredName === link.name ? 'text-[#458731]' : 'hover:text-[#458731]'}`}
                                    >
                                        {link.name}
                                    </button>
                                    {link.category && (
                                        <NavHoverMenu 
                                            isOpen={hoveredName === link.name} 
                                            category={link.category}
                                            name={link.name}
                                            onMouseEnter={() => setHoveredName(link.name)}
                                            onMouseLeave={() => setHoveredName(null)}
                                        />
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* MOBILE VIEW: Centered Logo */}
                    <div className="lg:hidden flex-1 flex justify-center">
                        <h1 onClick={() => navigate('/')} className="text-[24px] font-black tracking-tighter text-[#1a1a1a] cursor-pointer">
                            parbet
                        </h1>
                    </div>

                    {/* RIGHT TOOLS */}
                    <div className="flex items-center space-x-4 md:space-x-6">
                        <nav className="hidden lg:flex items-center space-x-6 text-[15px] font-medium text-[#1a1a1a]">
                            <button onClick={() => navigate('/explore')} className="hover:text-[#458731] transition-colors">Explore</button>
                            {/* FEATURE: Cross-Network Bridge mapped securely to Seller Site URL */}
                            <button onClick={() => window.location.href = 'https://parbet-seller-44902.web.app'} className="hover:text-[#458731] transition-colors">Sell</button>
                            <button onClick={() => handleNavigation('/profile/settings')} className="hover:text-[#458731] transition-colors">Favorites</button>
                            <button onClick={() => handleNavigation('/profile/orders')} className="hover:text-[#458731] transition-colors whitespace-nowrap">My Tickets</button>
                            {!isAuthenticated && (
                                <button onClick={() => navigate('/login')} className="hover:text-[#458731] transition-colors whitespace-nowrap">Sign In</button>
                            )}
                        </nav>

                        {/* Profile Icon */}
                        <div className="w-10 flex justify-end">
                            <UserProfileIcon 
                                isAuthenticated={isAuthenticated} 
                                onClick={() => isAuthenticated ? navigate('/profile') : navigate('/login')} 
                            />
                        </div>
                    </div>
                </div>

                {/* 3. FLOATING STRICT SEARCH BAR (Isolated: Hidden on Profile & Desktop Explore) */}
                {!isProfilePage && (!isExplorePage || (isExplorePage && window.innerWidth < 1024)) && (
                    <div className={`lg:${isExplorePage ? 'hidden' : 'block'} max-w-[850px] mx-auto px-4 pb-4 md:pb-8 relative z-40 w-full transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className={`relative flex items-center bg-white border rounded-full px-5 py-2.5 md:py-3.5 w-full transition-all duration-300 ${isSearchExpanded ? 'shadow-[0_10px_30px_rgba(0,0,0,0.12)] border-gray-300' : 'border-gray-200 shadow-sm focus-within:shadow-[0_8px_25px_rgba(0,0,0,0.08)] focus-within:border-[#458731]'}`}>
                            <Search size={18} className="text-gray-400 md:text-[#458731] mr-3 font-bold"/>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleStrictSearchSubmit}
                                onFocus={() => setSearchExpanded(true)}
                                onBlur={() => setTimeout(() => setSearchExpanded(false), 200)}
                                placeholder="Search Kabaddi, Cricket, World Cup, & IPL..." 
                                className="bg-transparent outline-none flex-1 text-[14px] md:text-[16px] text-[#1a1a1a] placeholder-gray-500 font-medium"
                            />
                            
                            {/* FEATURE 3: Strict Interactive Quick-Filter Pills */}
                            <AnimatePresence>
                                {isSearchExpanded && !searchQuery && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-[110%] left-0 w-full bg-white shadow-xl rounded-[16px] border border-gray-100 p-4 z-[100] flex flex-wrap gap-2"
                                    >
                                        <div className="w-full text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <TrendingUp size={14} className="text-[#8cc63f]" /> Strict Search Categories
                                        </div>
                                        {['IPL', 'Cricket', 'Kabaddi', 'World Cup'].map(tag => (
                                            <button
                                                key={tag}
                                                onMouseDown={(e) => {
                                                    e.preventDefault(); // Prevents input blur
                                                    setSearchQuery(tag);
                                                    navigate('/explore');
                                                    setSearchExpanded(false);
                                                }}
                                                className="bg-gray-50 border border-gray-200 hover:border-[#8cc63f] hover:bg-[#eaf4d9] text-[#1a1a1a] font-bold text-[13px] px-4 py-2 rounded-full transition-all"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <SearchDropdown />
                        </div>
                    </div>
                )}
            </header>

            {/* 4. MOBILE DRAWER OVERLAY (FEATURE 12: Moved OUTSIDE of the blurred <header> to prevent CSS containment clipping) */}
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
                                {/* FEATURE: Cross-Network Bridge mapped securely to Seller Site URL */}
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
        </>
    );
}