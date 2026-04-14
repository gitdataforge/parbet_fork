import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, X, User, ShieldCheck, Check, Globe, DollarSign } from 'lucide-react';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuthStore();
    
    // UI State Architecture
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const timeoutRef = useRef(null);

    // FEATURE: Scroll Physics Engine
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // FEATURE: Body Scroll-Lock for Mobile Menu
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    // FEATURE: Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // FEATURE: Secure Logout Pipeline
    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    // FEATURE: Debounced Hover Engine for Desktop Dropdowns
    const handleMouseEnter = (menu) => {
        clearTimeout(timeoutRef.current);
        setActiveDropdown(menu);
    };
    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    // Animation Variants
    const dropdownVariants = {
        hidden: { opacity: 0, y: 5, transition: { duration: 0.1 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
    };

    const drawerVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-[#1a1a1a]">
            
            {/* ========================================= */}
            {/* DESKTOP HEADER (Hidden on Mobile) */}
            {/* ========================================= */}
            <header 
                className={`fixed top-0 left-0 right-0 h-[72px] bg-white z-40 transition-shadow duration-200 border-b border-[#e2e2e2] hidden md:block ${scrolled ? 'shadow-sm' : ''}`}
            >
                <div className="max-w-[1200px] mx-auto px-8 h-full flex justify-between items-center">
                    
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center text-[32px] font-black tracking-[-1.5px] no-underline">
                        <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                        <span className="ml-2 mt-2 px-1.5 py-0.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[4px] text-[14px] font-mono font-bold text-[#54626c] tracking-normal leading-none">
                            / api
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="flex h-full items-center">
                        <Link to="/status" className="h-full flex items-center px-5 text-[15px] font-bold text-[#1a1a1a] hover:text-[#458731] transition-colors">
                            Status
                        </Link>
                        
                        {/* Docs Dropdown */}
                        <div 
                            className="relative h-full flex items-center px-5 cursor-pointer text-[15px] font-bold text-[#1a1a1a] hover:text-[#458731] transition-colors"
                            onMouseEnter={() => handleMouseEnter('docs')}
                            onMouseLeave={handleMouseLeave}
                        >
                            Documentation
                            <AnimatePresence>
                                {activeDropdown === 'docs' && (
                                    <motion.div 
                                        initial="hidden" animate="visible" exit="hidden" variants={dropdownVariants}
                                        className="absolute top-[72px] left-0 bg-white border border-t-0 border-[#e2e2e2] rounded-b-[4px] shadow-lg py-2 min-w-[200px] z-50 flex flex-col"
                                    >
                                        <Link to="/docs#sendVerification" className="px-6 py-3 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f8f9fa] hover:text-[#458731] transition-colors whitespace-nowrap">Authentication API</Link>
                                        <Link to="/docs#createOrder" className="px-6 py-3 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f8f9fa] hover:text-[#458731] transition-colors whitespace-nowrap">Transactions API</Link>
                                        <Link to="/docs#sendTicketEmail" className="px-6 py-3 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f8f9fa] hover:text-[#458731] transition-colors whitespace-nowrap">Fulfillment API</Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Dropdown */}
                        <div 
                            className="relative h-full flex items-center pl-5 cursor-pointer text-[15px] font-bold text-[#1a1a1a] hover:text-[#458731] transition-colors"
                            onMouseEnter={() => handleMouseEnter('profile')}
                            onMouseLeave={handleMouseLeave}
                        >
                            Developer
                            <div className="w-9 h-9 bg-[#f2f7ef] rounded-full flex items-center justify-center ml-3">
                                <User size={20} className="text-[#458731]" />
                            </div>
                            <AnimatePresence>
                                {activeDropdown === 'profile' && (
                                    <motion.div 
                                        initial="hidden" animate="visible" exit="hidden" variants={dropdownVariants}
                                        className="absolute top-[72px] right-0 bg-white border border-t-0 border-[#e2e2e2] rounded-b-[4px] shadow-lg py-2 min-w-[200px] z-50 flex flex-col"
                                    >
                                        <Link to="/" className="px-6 py-3 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f8f9fa] hover:text-[#458731] transition-colors">Developer Hub</Link>
                                        <Link to="/docs" className="px-6 py-3 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f8f9fa] hover:text-[#458731] transition-colors">API Keys</Link>
                                        <button onClick={handleLogout} className="px-6 py-3 text-[15px] font-bold text-[#c21c3a] text-left hover:bg-[#fdf2f2] transition-colors w-full">Sign out</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav>
                </div>
            </header>

            {/* ========================================= */}
            {/* MOBILE HEADER (Hidden on Desktop) */}
            {/* ========================================= */}
            <header className="fixed top-0 left-0 right-0 h-[64px] bg-white z-40 border-b border-[#e2e2e2] md:hidden">
                <div className="px-4 h-full flex justify-between items-center">
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-[#54626c]">
                        <Menu size={28} />
                    </button>
                    
                    <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center text-[28px] font-black tracking-[-1.5px] no-underline">
                        <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                        <span className="ml-1 mt-1 px-1 py-0.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[4px] text-[10px] font-mono font-bold text-[#54626c] leading-none">
                            / api
                        </span>
                    </Link>

                    <div onClick={() => setMobileMenuOpen(true)} className="w-8 h-8 bg-[#f2f7ef] rounded-full flex items-center justify-center cursor-pointer">
                        <User size={18} className="text-[#458731]" />
                    </div>
                </div>
            </header>

            {/* ========================================= */}
            {/* MOBILE SLIDE DRAWER */}
            {/* ========================================= */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                        onClick={(e) => { if(e.target === e.currentTarget) setMobileMenuOpen(false); }}
                    >
                        <motion.button 
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#e2e2e2] text-[#54626c] z-[51]"
                        >
                            <X size={20} />
                        </motion.button>
                        
                        <motion.div 
                            variants={drawerVariants} initial="hidden" animate="visible" exit="hidden"
                            className="absolute top-[76px] left-4 right-4 bg-white rounded-[12px] shadow-2xl overflow-hidden flex flex-col border border-[#e2e2e2] max-h-[calc(100vh-100px)] py-2"
                        >
                            <div className="overflow-y-auto overflow-x-hidden flex flex-col">
                                <Link to="/" className="px-6 py-3.5 text-[16px] font-medium text-[#1a1a1a] active:bg-[#f8f9fa] active:text-[#458731]">API Gateway Home</Link>
                                <Link to="/status" className="px-6 py-3.5 text-[16px] font-medium text-[#1a1a1a] active:bg-[#f8f9fa] active:text-[#458731]">System Status</Link>
                                <div className="h-[1px] bg-[#e2e2e2] mx-6 my-2"></div>
                                <span className="px-6 py-2 text-[12px] font-black text-[#54626c] uppercase tracking-wider">Documentation</span>
                                <Link to="/docs#sendVerification" className="px-6 py-3.5 text-[15px] font-medium text-[#1a1a1a] active:bg-[#f8f9fa] active:text-[#458731]">Authentication API</Link>
                                <Link to="/docs#createOrder" className="px-6 py-3.5 text-[15px] font-medium text-[#1a1a1a] active:bg-[#f8f9fa] active:text-[#458731]">Transactions API</Link>
                                <div className="h-[1px] bg-[#e2e2e2] mx-6 my-2"></div>
                                <button onClick={handleLogout} className="px-6 py-3.5 text-[16px] font-bold text-[#c21c3a] text-left active:bg-[#fdf2f2] w-full">Sign out</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========================================= */}
            {/* MAIN CONTENT AREA */}
            {/* ========================================= */}
            <main className="flex-1 pt-[64px] md:pt-[72px]">
                {children}
            </main>

            {/* ========================================= */}
            {/* 1:1 REPLICA ENTERPRISE FOOTER */}
            {/* ========================================= */}
            <footer className="border-t border-[#e2e2e2] pt-10 pb-16 mt-16 bg-white">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-10 mb-10">
                        
                        {/* Guarantee Box */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3 mb-2">
                                <ShieldCheck size={32} className="text-[#8cc63f]" strokeWidth={2.5} />
                                <div className="leading-none">
                                    <span className="text-[20px] font-black tracking-[-1px] text-[#54626c]">par<span className="text-[#8cc63f]">bet</span></span><br/>
                                    <span className="text-[13px] font-medium text-[#54626c]">guarantee</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-2.5 text-[14px] font-black text-[#54626c]">
                                    <Check size={18} className="text-[#8cc63f] mt-0.5 shrink-0" strokeWidth={3} /> World class security checks
                                </div>
                                <div className="flex items-start gap-2.5 text-[14px] font-black text-[#54626c]">
                                    <Check size={18} className="text-[#8cc63f] mt-0.5 shrink-0" strokeWidth={3} /> Transparent pricing
                                </div>
                                <div className="flex items-start gap-2.5 text-[14px] font-black text-[#54626c]">
                                    <Check size={18} className="text-[#8cc63f] mt-0.5 shrink-0" strokeWidth={3} /> 100% order guarantee
                                </div>
                            </div>
                        </div>

                        {/* Company Links */}
                        <div className="flex flex-col">
                            <h3 className="text-[16px] font-black text-[#54626c] mb-5">Our Company</h3>
                            <ul className="flex flex-col gap-4">
                                <li><a href="#" className="text-[14px] font-medium text-[#1a1a1a] hover:text-[#458731] hover:underline">About Us</a></li>
                                <li><a href="#" className="text-[14px] font-medium text-[#1a1a1a] hover:text-[#458731] hover:underline">Partners</a></li>
                                <li><a href="#" className="text-[14px] font-medium text-[#1a1a1a] hover:text-[#458731] hover:underline">Corporate Service</a></li>
                            </ul>
                        </div>

                        {/* Support Links */}
                        <div className="flex flex-col">
                            <h3 className="text-[16px] font-black text-[#54626c] mb-5">Have Questions?</h3>
                            <ul className="flex flex-col gap-4">
                                <li><a href="#" className="text-[14px] font-medium text-[#1a1a1a] hover:text-[#458731] hover:underline">Help Centre / Contact Us</a></li>
                                <li><a href="#" className="text-[14px] font-medium text-[#1a1a1a] hover:text-[#458731] hover:underline">API Integration Guide</a></li>
                            </ul>
                        </div>

                        {/* Locale Selectors */}
                        <div className="flex flex-col">
                            <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-4">Live events all over the world</h3>
                            <div className="flex flex-col gap-3">
                                <button className="border border-[#e2e2e2] rounded-[4px] px-4 py-3 flex items-center gap-3 bg-white hover:bg-[#f8f9fa] text-[#54626c] text-[14px] transition-colors text-left">
                                    <strong className="text-[#1a1a1a] font-black w-8">US</strong> United States
                                </button>
                                <button className="border border-[#e2e2e2] rounded-[4px] px-4 py-3 flex items-center gap-3 bg-white hover:bg-[#f8f9fa] text-[#54626c] text-[14px] transition-colors text-left">
                                    <Globe size={18} className="text-[#1a1a1a] w-8" /> English (UK)
                                </button>
                                <button className="border border-[#e2e2e2] rounded-[4px] px-4 py-3 flex items-center gap-3 bg-white hover:bg-[#f8f9fa] text-[#54626c] text-[14px] transition-colors text-left">
                                    <DollarSign size={18} className="text-[#1a1a1a] w-8" /> Indian Rupee
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Legal Footer Text */}
                    <div className="border-t border-[#e2e2e2] pt-6 text-[12px] text-[#54626c] leading-relaxed font-medium">
                        Copyright &copy; parbet Entertainment Inc 2026 <a href="#" className="text-[#458731] font-bold hover:underline ml-1">Company Details</a><br/>
                        Use of this web site constitutes acceptance of the <a href="#" className="text-[#458731] font-bold hover:underline mx-1">Terms and Conditions</a> and <a href="#" className="text-[#458731] font-bold hover:underline mx-1">Privacy Policy</a> and <a href="#" className="text-[#458731] font-bold hover:underline mx-1">Cookies Policy</a><br/>
                        <a href="#" className="text-[#458731] font-bold hover:underline">Do Not Share My Personal Information/Your Privacy Choices</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}