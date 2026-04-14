import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../lib/firebase';
import { useAppStore } from '../../store/useStore';

// --- CUSTOM SVGS TO EXACTLY MATCH VIAGOGO UI ---

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] text-[#4a782b]">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

const MobileListIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#555555]">
        <circle cx="4" cy="6" r="1.5" />
        <rect x="8" y="5" width="14" height="2" rx="1" />
        <circle cx="4" cy="12" r="1.5" />
        <rect x="8" y="11" width="14" height="2" rx="1" />
        <circle cx="4" cy="18" r="1.5" />
        <rect x="8" y="17" width="14" height="2" rx="1" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#555555]">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default function ProfileHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAppStore();

    // Interaction States
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Scroll listener for border effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    // Secure Logout Logic
    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser(null); // Clear Zustand store
            navigate('/');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // --- DROPDOWN DATA (Exact match to screenshots) ---
    const sellLinks = [
        { label: 'Sell Tickets', path: 'https://parbet-seller-44902.web.app/' },
        { label: 'My Tickets', path: '/profile' },
        { label: 'My Sales', path: '/profile/sales' },
        { label: 'Season Ticket Wallet', path: '/profile/wallet' }
    ];

    const ticketsLinks = [
        { label: 'Orders', path: '/profile' },
        { label: 'My Listings', path: '/profile/listings' },
        { label: 'My Sales', path: '/profile/sales' },
        { label: 'Payments', path: '/profile/payments' }
    ];

    const profileLinks = [
        { label: 'My Hub', path: '/profile' },
        { label: 'Settings', path: '/profile/settings' },
        { label: 'Sign out', action: handleLogout }
    ];

    const mobileMenuLinks = [
        { label: 'Profile', path: '/profile' },
        { label: 'My Orders', path: '/profile' },
        { label: 'My Listings', path: '/profile/listings' },
        { label: 'My Sales', path: '/profile/sales' },
        { label: 'Payments', path: '/profile/payments' },
        { label: 'Settings', path: '/profile/settings' },
        { label: 'Wallet', path: '/profile/wallet' },
        { label: 'Customer Support', path: '/support' },
        { label: 'View FAQs', path: '/faq' },
    ];

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 w-full bg-white z-40 transition-shadow duration-200 ${isScrolled ? 'shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : 'border-b border-gray-200'}`}>
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
                    
                    {/* MOBILE LEFT: Menu Icon */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 focus:outline-none">
                            <MobileListIcon />
                        </button>
                    </div>

                    {/* LOGO (Center on Mobile, Left on Desktop) */}
                    <div className="flex-1 md:flex-none flex justify-center md:justify-start">
                        <Link to="/" className="flex items-center cursor-pointer">
                            <h1 className="text-[32px] md:text-[38px] font-black tracking-tighter leading-none select-none">
                                <span className="text-[#5f6368]">par</span><span className="text-[#8cc63f]">bet</span>
                            </h1>
                        </Link>
                    </div>

                    {/* DESKTOP RIGHT: Navigation & Dropdowns */}
                    <div className="hidden md:flex items-center h-full">
                        <Link to="/" className="px-5 h-full flex items-center text-[15px] font-bold text-[#111] hover:text-[#4a782b] transition-colors">
                            Buy
                        </Link>

                        {/* Sell Dropdown */}
                        <div 
                            className="relative h-full flex items-center px-5 cursor-pointer group"
                            onMouseEnter={() => setActiveDropdown('sell')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <span className={`text-[15px] font-bold transition-colors ${activeDropdown === 'sell' ? 'text-[#366a26]' : 'text-[#111]'}`}>
                                Sell
                            </span>
                            <AnimatePresence>
                                {activeDropdown === 'sell' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-[72px] left-0 w-[240px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] rounded-b-[4px] py-2 z-50 border border-gray-100"
                                    >
                                        {sellLinks.map((link, idx) => (
                                            <Link key={idx} to={link.path} className="block px-5 py-3 text-[15px] text-[#333] hover:bg-[#f8f9fa] hover:text-[#000] transition-colors">
                                                {link.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* My Tickets Dropdown */}
                        <div 
                            className="relative h-full flex items-center px-5 cursor-pointer group"
                            onMouseEnter={() => setActiveDropdown('tickets')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <span className={`text-[15px] font-bold transition-colors ${activeDropdown === 'tickets' ? 'text-[#366a26]' : 'text-[#111]'}`}>
                                My Tickets
                            </span>
                            <AnimatePresence>
                                {activeDropdown === 'tickets' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-[72px] left-0 w-[200px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] rounded-b-[4px] py-2 z-50 border border-gray-100"
                                    >
                                        {ticketsLinks.map((link, idx) => (
                                            <Link key={idx} to={link.path} className="block px-5 py-3 text-[15px] text-[#333] hover:bg-[#f8f9fa] hover:text-[#000] transition-colors">
                                                {link.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Dropdown */}
                        <div 
                            className="relative h-full flex items-center pl-5 cursor-pointer group"
                            onMouseEnter={() => setActiveDropdown('profile')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <span className={`text-[15px] font-bold transition-colors mr-3 ${activeDropdown === 'profile' ? 'text-[#366a26]' : 'text-[#111]'}`}>
                                Profile
                            </span>
                            <div className="w-[36px] h-[36px] bg-[#f2f7ef] rounded-full flex items-center justify-center">
                                <UserIcon />
                            </div>
                            
                            <AnimatePresence>
                                {activeDropdown === 'profile' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-[72px] right-0 w-[180px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] rounded-b-[4px] py-2 z-50 border border-gray-100"
                                    >
                                        {profileLinks.map((link, idx) => (
                                            link.action ? (
                                                <button key={idx} onClick={link.action} className="w-full text-left block px-5 py-3 text-[15px] text-[#333] hover:bg-[#f8f9fa] hover:text-[#000] transition-colors">
                                                    {link.label}
                                                </button>
                                            ) : (
                                                <Link key={idx} to={link.path} className="block px-5 py-3 text-[15px] text-[#333] hover:bg-[#f8f9fa] hover:text-[#000] transition-colors">
                                                    {link.label}
                                                </Link>
                                            )
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* MOBILE RIGHT: User Icon */}
                    <div className="md:hidden flex items-center">
                        <div className="w-[36px] h-[36px] bg-[#f2f7ef] rounded-full flex items-center justify-center">
                            <UserIcon />
                        </div>
                    </div>

                </div>
            </header>

            {/* --- MOBILE FULL-SCREEN MENU MODAL (Exact match to image_5307a9.png) --- */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden font-sans">
                        {/* Dimmed Background Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Close Button & Logo Area */}
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-4 left-4 flex items-center z-50"
                        >
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-md text-[#555] focus:outline-none"
                            >
                                <CloseIcon />
                            </button>
                            {/* Logo in background representation */}
                            <h1 className="ml-4 text-[34px] font-black tracking-tighter leading-none opacity-40 select-none">
                                <span className="text-white">par</span><span className="text-[#8cc63f]">bet</span>
                            </h1>
                        </motion.div>

                        {/* Menu Container Box */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="absolute top-[76px] left-4 right-4 bg-white rounded-[16px] shadow-2xl overflow-hidden py-2"
                        >
                            <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
                                {mobileMenuLinks.map((link, idx) => (
                                    <Link 
                                        key={idx} 
                                        to={link.path} 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-6 py-3.5 text-[16px] text-[#111] hover:bg-gray-50 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                
                                <div className="h-[1px] bg-gray-100 my-2 mx-6"></div>
                                
                                <Link 
                                    to="https://parbet-seller-44902.web.app/" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-6 py-3.5 text-[16px] text-[#111] hover:bg-gray-50 transition-colors"
                                >
                                    Sell
                                </Link>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full text-left block px-6 py-3.5 text-[16px] text-[#111] hover:bg-gray-50 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            {/* Spacer to prevent content from hiding behind fixed header */}
            <div className="h-[72px] w-full"></div>
        </>
    );
}