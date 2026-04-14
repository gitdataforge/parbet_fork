import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, X, User, ShieldCheck, Check, Globe, DollarSign, LogOut, Terminal, Activity, FileText } from 'lucide-react';

/**
 * FEATURE: High-Fidelity Enterprise Layout
 * Strictly matching image_8dbe50.png, image_6188a6.png and image_6188e9.png design tokens.
 * Implements a permanent fix for navigation alignment and footer density.
 */
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
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // FEATURE: Body Scroll-Lock for Mobile Menu
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
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
        hidden: { opacity: 0, y: 8, transition: { duration: 0.15 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
    };

    const drawerVariants = {
        hidden: { x: '-100%', transition: { duration: 0.3, ease: 'easeInOut' } },
        visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-[#1a1a1a]">
            
            {/* ========================================= */}
            {/* GLOBAL HEADER (Sticky & Blurred) */}
            {/* ========================================= */}
            <header 
                className={`fixed top-0 left-0 right-0 h-[72px] bg-white/95 backdrop-blur-md z-40 transition-all duration-300 border-b border-[#f0f0f0] ${scrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : ''}`}
            >
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex justify-between items-center">
                    
                    {/* Brand Logo (Strict Left Alignment) */}
                    <Link to="/" className="flex items-center text-[30px] font-black tracking-[-1.8px] no-underline select-none">
                        <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                        <span className="ml-2.5 px-1.5 py-0.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[4px] text-[11px] font-mono font-bold text-[#54626c] uppercase tracking-wider leading-none">
                            api
                        </span>
                    </Link>

                    {/* Desktop Navigation (Strict Right Alignment) */}
                    <nav className="hidden md:flex h-full items-center gap-1">
                        <Link 
                            to="/status" 
                            className={`flex items-center gap-2 px-5 py-2 text-[14px] font-bold transition-colors ${location.pathname === '/status' ? 'text-[#8cc63f]' : 'text-[#1a1a1a] hover:text-[#8cc63f]'}`}
                        >
                            <Activity size={16} /> Status
                        </Link>
                        
                        {/* Docs Dropdown */}
                        <div 
                            className="relative h-full flex items-center px-5 cursor-pointer text-[14px] font-bold text-[#1a1a1a] hover:text-[#8cc63f] transition-colors"
                            onMouseEnter={() => handleMouseEnter('docs')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex items-center gap-2"><FileText size={16} /> Documentation</div>
                            <AnimatePresence>
                                {activeDropdown === 'docs' && (
                                    <motion.div 
                                        initial="hidden" animate="visible" exit="hidden" variants={dropdownVariants}
                                        className="absolute top-[72px] right-0 bg-white border border-[#f0f0f0] rounded-b-[8px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] py-3 min-w-[240px] z-50 flex flex-col"
                                    >
                                        <Link to="/docs#auth" className="px-6 py-3 text-[14px] font-bold text-[#54626c] hover:bg-[#f8f9fa] hover:text-[#8cc63f] transition-colors">Authentication API</Link>
                                        <Link to="/docs#tx" className="px-6 py-3 text-[14px] font-bold text-[#54626c] hover:bg-[#f8f9fa] hover:text-[#8cc63f] transition-colors">Transactions API</Link>
                                        <Link to="/docs#fulfillment" className="px-6 py-3 text-[14px] font-bold text-[#54626c] hover:bg-[#f8f9fa] hover:text-[#8cc63f] transition-colors">Fulfillment API</Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Developer Profile */}
                        <div 
                            className="relative h-full flex items-center pl-5 cursor-pointer"
                            onMouseEnter={() => handleMouseEnter('profile')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex items-center gap-3 pl-5 border-l border-[#f0f0f0]">
                                <span className="text-[14px] font-bold text-[#1a1a1a]">Developer</span>
                                <div className="w-10 h-10 bg-[#f2f7ef] rounded-full flex items-center justify-center border border-[#8cc63f]/10 shadow-sm">
                                    <User size={20} className="text-[#8cc63f]" />
                                </div>
                            </div>
                            <AnimatePresence>
                                {activeDropdown === 'profile' && (
                                    <motion.div 
                                        initial="hidden" animate="visible" exit="hidden" variants={dropdownVariants}
                                        className="absolute top-[72px] right-0 bg-white border border-[#f0f0f0] rounded-b-[8px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] py-4 min-w-[220px] z-50 flex flex-col"
                                    >
                                        <div className="px-6 pb-3 mb-2 border-b border-[#f0f0f0]">
                                            <p className="text-[11px] font-black text-[#9ca3af] uppercase tracking-widest">Admin Role</p>
                                            <p className="text-[13px] font-bold text-[#1a1a1a] truncate">testcodecfg@gmail.com</p>
                                        </div>
                                        <button onClick={handleLogout} className="px-6 py-3 text-[14px] font-black text-[#c21c3a] text-left hover:bg-[#fdf2f2] transition-colors w-full flex items-center gap-2">
                                            <LogOut size={16} /> Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav>

                    {/* Mobile Menu Trigger */}
                    <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-[#54626c] hover:text-[#8cc63f] transition-colors">
                        <Menu size={28} />
                    </button>
                </div>
            </header>

            {/* ========================================= */}
            {/* MOBILE SIDEBAR DRAWER */}
            {/* ========================================= */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div 
                            variants={drawerVariants} initial="hidden" animate="visible" exit="hidden"
                            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white z-[70] shadow-2xl flex flex-col md:hidden"
                        >
                            <div className="p-6 border-b border-[#f0f0f0] flex justify-between items-center">
                                <span className="text-[24px] font-black tracking-tighter text-[#54626c]">par<span className="text-[#8cc63f]">bet</span></span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#54626c]"><X size={24} /></button>
                            </div>
                            <div className="flex-grow py-6 flex flex-col gap-1">
                                <Link to="/" className="px-8 py-4 text-[16px] font-bold hover:bg-[#f8f9fa] hover:text-[#8cc63f]">Gateway Dashboard</Link>
                                <Link to="/status" className="px-8 py-4 text-[16px] font-bold hover:bg-[#f8f9fa] hover:text-[#8cc63f]">System Status</Link>
                                <Link to="/docs" className="px-8 py-4 text-[16px] font-bold hover:bg-[#f8f9fa] hover:text-[#8cc63f]">Documentation</Link>
                                <div className="h-[1px] bg-[#f0f0f0] my-4 mx-8" />
                                <button onClick={handleLogout} className="px-8 py-4 text-[16px] font-black text-[#c21c3a] text-left hover:bg-[#fdf2f2]">Sign out</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ========================================= */}
            {/* MAIN VIEWPORT */}
            {/* ========================================= */}
            <main className="flex-grow pt-[72px]">
                <div className="w-full h-full">
                    {children}
                </div>
            </main>

            {/* ========================================= */}
            {/* ENTERPRISE FOOTER (image_8dbe50.png Replica) */}
            {/* ========================================= */}
            <footer className="bg-white border-t border-[#f0f0f0] pt-16 pb-12 mt-20">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-12 mb-16">
                        
                        {/* Guarantee Column */}
                        <div className="flex flex-col">
                            <div className="flex items-start gap-4 mb-8">
                                <ShieldCheck size={42} className="text-[#8cc63f] shrink-0" strokeWidth={2.5} />
                                <div>
                                    <div className="text-[24px] font-black tracking-[-1.5px] text-[#54626c] leading-none">
                                        par<span className="text-[#8cc63f]">bet</span>
                                    </div>
                                    <div className="text-[13px] font-bold text-[#8cc63f] uppercase tracking-widest mt-1">enterprise guarantee</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-[15px] font-bold text-[#1a1a1a]">
                                    <Check size={18} className="text-[#8cc63f]" strokeWidth={3} /> Institutional Grade Security
                                </div>
                                <div className="flex items-center gap-3 text-[15px] font-bold text-[#1a1a1a]">
                                    <Check size={18} className="text-[#8cc63f]" strokeWidth={3} /> Real-Time Latency Monitoring
                                </div>
                                <div className="flex items-center gap-3 text-[15px] font-bold text-[#1a1a1a]">
                                    <Check size={18} className="text-[#8cc63f]" strokeWidth={3} /> 100% Endpoint Uptime
                                </div>
                            </div>
                        </div>

                        {/* Navigation Columns */}
                        <div>
                            <h3 className="text-[15px] font-black text-[#54626c] uppercase tracking-widest mb-8">Resources</h3>
                            <ul className="flex flex-col gap-5 text-[14px] font-bold text-[#1a1a1a]">
                                <li><Link to="/status" className="hover:text-[#8cc63f] transition-colors">API Status</Link></li>
                                <li><Link to="/docs" className="hover:text-[#8cc63f] transition-colors">Documentation</Link></li>
                                <li><a href="#" className="hover:text-[#8cc63f] transition-colors">Developer Portal</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[15px] font-black text-[#54626c] uppercase tracking-widest mb-8">Support</h3>
                            <ul className="flex flex-col gap-5 text-[14px] font-bold text-[#1a1a1a]">
                                <li><a href="#" className="hover:text-[#8cc63f] transition-colors">Help Centre</a></li>
                                <li><a href="#" className="hover:text-[#8cc63f] transition-colors">System Updates</a></li>
                                <li><a href="#" className="hover:text-[#8cc63f] transition-colors">Contact Support</a></li>
                            </ul>
                        </div>

                        {/* Global Locale Selectors */}
                        <div className="flex flex-col">
                            <h3 className="text-[15px] font-black text-[#1a1a1a] mb-8 leading-tight">Securing events all over the world</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="border border-[#e2e2e2] rounded-[6px] px-5 py-3.5 flex items-center justify-between bg-white hover:bg-[#f8f9fa] transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Globe size={18} className="text-[#1a1a1a]" />
                                        <span className="text-[14px] font-bold text-[#54626c] group-hover:text-[#1a1a1a]">English (Global)</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#8cc63f]" />
                                </button>
                                <button className="border border-[#e2e2e2] rounded-[6px] px-5 py-3.5 flex items-center justify-between bg-white hover:bg-[#f8f9fa] transition-all group">
                                    <div className="flex items-center gap-3">
                                        <DollarSign size={18} className="text-[#1a1a1a]" />
                                        <span className="text-[14px] font-bold text-[#54626c] group-hover:text-[#1a1a1a]">Indian Rupee (INR)</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#e2e2e2]" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Legal Baseline */}
                    <div className="pt-10 border-t border-[#f0f0f0] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="text-[12px] font-bold text-[#9ca3af] leading-relaxed uppercase tracking-tighter">
                            Copyright &copy; parbet Entertainment Inc 2026. All rights reserved.<br/>
                            Enterprise Infrastructure Tier: <span className="text-[#54626c]">v8.4.12-edge</span>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[12px] font-bold text-[#1a1a1a]">
                            <a href="#" className="hover:text-[#8cc63f] transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-[#8cc63f] transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-[#8cc63f] transition-colors">Cookie Management</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}