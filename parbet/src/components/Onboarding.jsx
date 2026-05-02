import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, UserPlus, LogIn, SkipForward } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { BooknshowLogo } from './Header'; 

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 2 Onboarding)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: 21 High-End Animated Slides (Expanded per strict request)
 * FEATURE 2: Illustrative Ambient Background Animations
 * FEATURE 3: Strict Ticketing/Event Terminology
 * FEATURE 4: Native SVG Hardware-Accelerated Graphics
 * FEATURE 5: Explicit Skip, Login, and Signup Routing
 */

const SVGShape = ({ children }) => (
    <motion.svg viewBox="0 0 200 200" className="w-64 h-64 overflow-visible" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
        {children}
    </motion.svg>
);

// Illustrative ambient background
const BackgroundAnimation = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#FFFFFF]">
        <motion.div
            className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#FAD8DC] opacity-30 blur-[100px]"
            animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-[#FAD8DC] opacity-20 blur-[120px]"
            animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[#EB5B6E] opacity-10 blur-[80px]"
            animate={{ x: [0, 30, 0], y: [0, -30, 0], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
    </div>
);

// High-end custom graphic for the intro slide
const IntroGraphic = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#FFFFFF] p-6 rounded-2xl shadow-[0_20px_60px_rgba(231,54,77,0.15)] border border-[#FAD8DC] relative z-10"
        >
            <BooknshowLogo className="h-[48px] md:h-[64px]" />
        </motion.div>
        <motion.div 
            className="absolute inset-0 rounded-full border-2 border-[#E7364D] opacity-20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
    </div>
);

const slides = [
    { title: "Welcome to\nPremium Tickets", desc: "Experience a clean, seamless ticketing interface for the world's best live events.", graphic: <IntroGraphic /> },
    { title: "Real-Time Seat\nAvailability", desc: "Track live inventory and snag the best seats instantly before they sell out.", graphic: <SVGShape><motion.path d="M 20 150 L 70 90 L 110 110 L 170 40" fill="none" stroke="#EB5B6E" strokeWidth="10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} /></SVGShape> },
    { title: "Bank-Grade\nSecurity", desc: "Your transactions are locked down with enterprise-grade encryption and 2FA.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="50" fill="none" stroke="#333333" strokeWidth="16" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} /><motion.circle cx="100" cy="100" r="30" fill="#E7364D" /></SVGShape> },
    { title: "Lightning Fast\nCheckout", desc: "Secure your tickets in seconds with our optimized, lag-free booking engine.", graphic: <SVGShape><motion.path d="M 100 0 L 100 200 M 0 100 L 200 100" stroke="#FAD8DC" strokeWidth="8" animate={{ rotate: 45 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} /><circle cx="100" cy="100" r="20" fill="#E7364D" /></SVGShape> },
    { title: "Top Global\nEvents", desc: "From massive stadium sports and concerts to exclusive theatre premieres.", graphic: <SVGShape><motion.ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="#333333" strokeWidth="6" animate={{ ry: [30, 90, 30] }} transition={{ duration: 4, repeat: Infinity }} /><motion.ellipse cx="100" cy="100" rx="30" ry="90" fill="none" stroke="#E7364D" strokeWidth="4" animate={{ rx: [30, 90, 30] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} /></SVGShape> },
    { title: "Instant Digital\nDelivery", desc: "Get your E-Tickets delivered straight to your device immediately after purchase.", graphic: <SVGShape><motion.polygon points="100,20 180,180 20,180" fill="none" stroke="#EB5B6E" strokeWidth="10" animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} /></SVGShape> },
    { title: "Any Device,\nAnywhere", desc: "A flawless booking experience on mobile, tablet, or a wide desktop monitor.", graphic: <SVGShape><motion.rect x="40" y="40" width="120" height="120" rx="20" fill="none" stroke="#E7364D" strokeWidth="10" animate={{ rotate: 90 }} transition={{ duration: 3, repeat: Infinity }} /></SVGShape> },
    { title: "100% Buyer\nGuarantee", desc: "Every ticket is verified, authentic, and backed by our dedicated support team.", graphic: <SVGShape><motion.path d="M100 20 L120 70 L180 70 L130 110 L150 170 L100 130 L50 170 L70 110 L20 70 L80 70 Z" fill="none" stroke="#333333" strokeWidth="8" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} /></SVGShape> },
    { title: "Intelligent\nEvent Discovery", desc: "Find exactly what you want with our powerful search, filters, and smart AI recommendations.", graphic: <SVGShape><motion.circle cx="80" cy="80" r="40" fill="none" stroke="#E7364D" strokeWidth="10" /><motion.line x1="110" y1="110" x2="160" y2="160" stroke="#E7364D" strokeWidth="10" strokeLinecap="round" animate={{ x2: [160, 170, 160], y2: [160, 170, 160] }} transition={{ duration: 2, repeat: Infinity }} /></SVGShape> },
    { title: "Secure\nTicket Resale", desc: "Plans changed? List your tickets safely on our global verified marketplace.", graphic: <SVGShape><motion.path d="M 50 100 A 50 50 0 0 1 150 100 M 150 100 L 130 80 M 150 100 L 170 80 M 150 100 A 50 50 0 0 1 50 100 M 50 100 L 30 120 M 50 100 L 70 120" fill="none" stroke="#EB5B6E" strokeWidth="8" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /></SVGShape> },
    { title: "Instant\nAlerts", desc: "Never miss a show with real-time push and email notifications for your favorites.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="20" fill="#E7364D" animate={{ scale: [1, 3, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} /><circle cx="100" cy="100" r="20" fill="#E7364D" /></SVGShape> },
    { title: "Tailored to\nYour Region", desc: "Browse with local currency, language support, and events happening near your city.", graphic: <SVGShape><motion.line x1="100" y1="20" x2="100" y2="180" stroke="#A3A3A3" strokeWidth="4" /><motion.line x1="20" y1="100" x2="180" y2="100" stroke="#A3A3A3" strokeWidth="4" /><motion.circle cx="100" cy="100" r="80" fill="none" stroke="#333333" strokeWidth="8" /></SVGShape> },
    { title: "Interactive\nSeating Charts", desc: "Pick your exact seat using our high-fidelity venue maps before you buy.", graphic: <SVGShape><motion.rect x="30" y="80" width="40" height="40" rx="5" fill="#FAD8DC" animate={{ y: [80, 70, 80] }} transition={{ duration: 2, repeat: Infinity }} /><motion.rect x="80" y="80" width="40" height="40" rx="5" fill="#E7364D" animate={{ y: [80, 60, 80] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} /><motion.rect x="130" y="80" width="40" height="40" rx="5" fill="#EB5B6E" animate={{ y: [80, 75, 80] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} /></SVGShape> },
    { title: "VIP &\nHospitality", desc: "Upgrade your experience with exclusive VIP packages and backstage access.", graphic: <SVGShape><motion.polygon points="100,30 120,80 170,80 130,110 145,160 100,130 55,160 70,110 30,80 80,80" fill="#333333" animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} /></SVGShape> },
    { title: "Group\nBookings", desc: "Coordinate easily with friends and secure blocks of seats together.", graphic: <SVGShape><motion.circle cx="70" cy="100" r="30" fill="none" stroke="#E7364D" strokeWidth="8" /><motion.circle cx="130" cy="100" r="30" fill="none" stroke="#EB5B6E" strokeWidth="8" /><motion.circle cx="100" cy="70" r="30" fill="none" stroke="#FAD8DC" strokeWidth="8" /></SVGShape> },
    { title: "Price Drop\nTracking", desc: "Set price targets and let us automatically notify you when tickets hit your budget.", graphic: <SVGShape><motion.path d="M 20 100 Q 60 20 100 100 T 180 100" fill="none" stroke="#333333" strokeWidth="8" animate={{ d: ["M 20 100 Q 60 20 100 100 T 180 100", "M 20 100 Q 60 180 100 100 T 180 100", "M 20 100 Q 60 20 100 100 T 180 100"] }} transition={{ duration: 4, repeat: Infinity }} /></SVGShape> },
    { title: "Verified\nReviews", desc: "Read real feedback from previous attendees about venues and performers.", graphic: <SVGShape><motion.rect x="30" y="50" width="140" height="80" rx="10" fill="none" stroke="#A3A3A3" strokeWidth="8" /><motion.path d="M 70 130 L 100 160 L 130 130" fill="none" stroke="#A3A3A3" strokeWidth="8" /><motion.line x1="60" y1="80" x2="140" y2="80" stroke="#E7364D" strokeWidth="8" strokeLinecap="round" animate={{ x2: [60, 140, 60] }} transition={{ duration: 3, repeat: Infinity }} /></SVGShape> },
    { title: "24/7 Global\nSupport", desc: "Our multi-lingual customer service team is always here to help.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="60" fill="none" stroke="#626262" strokeWidth="8" /><motion.path d="M 100 40 A 60 60 0 0 1 160 100" fill="none" stroke="#E7364D" strokeWidth="12" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} originX={0.5} originY={0.5} /></SVGShape> },
    { title: "Loyalty\nRewards", desc: "Earn points on every purchase and unlock exclusive pre-sale access.", graphic: <SVGShape><motion.rect x="50" y="50" width="100" height="100" rx="20" fill="#FAD8DC" /><motion.circle cx="100" cy="100" r="30" fill="#E7364D" animate={{ scale: [1, 0.8, 1] }} transition={{ duration: 2, repeat: Infinity }} /></SVGShape> },
    { title: "Seamless App\nIntegration", desc: "Add tickets directly to your Apple or Google Wallet with one tap.", graphic: <SVGShape><motion.rect x="60" y="20" width="80" height="160" rx="15" fill="none" stroke="#333333" strokeWidth="8" /><motion.line x1="80" y1="160" x2="120" y2="160" stroke="#E7364D" strokeWidth="6" strokeLinecap="round" /></SVGShape> },
    { title: "Ready to\nEntertain?", desc: "Create your account securely and step into the world of live entertainment.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="80" fill="none" stroke="#E7364D" strokeWidth="8" animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }} /><circle cx="100" cy="100" r="15" fill="#333333"/></SVGShape> }
];

export default function Onboarding() {
    const [index, setIndex] = useState(0);
    const setOnboarded = useAppStore(state => state.setOnboarded);
    const navigate = useNavigate();

    // Handlers for Auth Routing
    const handleSkip = () => {
        setOnboarded();
        navigate('/explore');
    };

    const handleLogin = () => {
        setOnboarded();
        navigate('/login');
    };

    const handleSignup = () => {
        setOnboarded();
        navigate('/signup');
    };

    return (
        <div className="relative w-full h-screen bg-[#FFFFFF] flex flex-col justify-between px-6 py-8 md:p-12 z-50 items-center text-center overflow-hidden">
            <BackgroundAnimation />
            
            {/* Top Bar with Skip */}
            <div className="w-full max-w-5xl flex justify-end relative z-20">
                <button 
                    onClick={handleSkip}
                    className="flex items-center text-[#626262] font-bold text-[14px] hover:text-[#E7364D] transition-colors bg-[#FFFFFF]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#A3A3A3]/20 shadow-sm"
                >
                    Skip Intro <SkipForward size={14} className="ml-2" />
                </button>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-2xl relative z-10 px-4 md:px-0">
                <AnimatePresence mode="wait">
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex flex-col items-center w-full">
                        <div className="w-full flex justify-center mb-6 md:mb-12 h-48 md:h-64">{slides[index].graphic}</div>
                        <h1 className="text-3xl md:text-5xl font-black whitespace-pre-line mt-4 md:mt-8 leading-tight tracking-tight text-[#333333] drop-shadow-sm">{slides[index].title}</h1>
                        <p className="text-[#626262] mt-4 md:mt-6 text-[15px] md:text-[17px] font-medium leading-relaxed max-w-md mx-auto">{slides[index].desc}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {/* Bottom Navigation & Controls */}
            <div className="w-full max-w-md pb-4 md:pb-8 relative z-20">
                {/* Progress Indicators */}
                <div className="flex justify-center space-x-1.5 md:space-x-2 mb-8 flex-wrap gap-y-2 px-4">
                    {slides.map((_, i) => (
                        <div 
                            key={i} 
                            onClick={() => setIndex(i)}
                            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 cursor-pointer ${i === index ? 'w-8 md:w-10 bg-[#E7364D]' : 'w-2 md:w-3 bg-[#FAD8DC] hover:bg-[#EB5B6E]'}`} 
                        />
                    ))}
                </div>

                {/* Action Buttons */}
                {index < slides.length - 1 ? (
                    <button 
                        onClick={() => setIndex(i => i + 1)} 
                        className="w-full bg-[#FFFFFF] border-2 border-[#E7364D] text-[#E7364D] font-bold py-4 rounded-xl flex items-center justify-center hover:bg-[#FAD8DC]/20 transition-all shadow-sm"
                    >
                        <span>Continue</span><ArrowRight size={18} className="ml-2" />
                    </button>
                ) : (
                    <div className="flex flex-col space-y-3">
                        <button 
                            onClick={handleSignup} 
                            className="w-full bg-[#E7364D] text-[#FFFFFF] font-black py-4 rounded-xl flex items-center justify-center hover:scale-[1.02] hover:bg-[#EB5B6E] transition-all shadow-[0_8px_20px_rgba(231,54,77,0.3)]"
                        >
                            <UserPlus size={18} className="mr-2" /><span>CREATE ACCOUNT</span>
                        </button>
                        <button 
                            onClick={handleLogin} 
                            className="w-full bg-[#FFFFFF] border-2 border-[#A3A3A3]/30 text-[#333333] font-bold py-4 rounded-xl flex items-center justify-center hover:bg-[#FAD8DC]/20 hover:text-[#E7364D] hover:border-[#E7364D] transition-all"
                        >
                            <LogIn size={18} className="mr-2" /><span>LOG IN</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}