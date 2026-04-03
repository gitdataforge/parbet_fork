import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useStore';

const slides = [
    {
        title: "The best way\nto manage your bets",
        desc: "Parbet brings professional sports betting logic to a seamless, premium interface.",
        graphic: (
            <motion.svg viewBox="0 0 200 200" className="w-64 h-64 overflow-visible" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
                <motion.circle cx="70" cy="70" r="60" fill="none" stroke="#7000FF" strokeWidth="12" className="drop-shadow-[0_0_30px_rgba(112,0,255,0.6)]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                <motion.circle cx="130" cy="130" r="75" fill="none" stroke="#1D7AF2" strokeWidth="12" className="drop-shadow-[0_0_30px_rgba(29,122,242,0.6)]" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 1, ease: "easeInOut" }} />
            </motion.svg>
        )
    },
    {
        title: "Real-Time\nLive Odds",
        desc: "Experience instantaneous odds updates directly mapped to live match events.",
        graphic: (
            <motion.svg viewBox="0 0 200 200" className="w-56 h-56 overflow-visible">
                <motion.path d="M 20 150 L 70 90 L 110 110 L 170 40" fill="none" stroke="#1D7AF2" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_25px_rgba(29,122,242,0.8)]" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
                <motion.circle cx="170" cy="40" r="12" fill="#FFFFFF" className="drop-shadow-[0_0_20px_#1D7AF2]" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.svg>
        )
    },
    {
        title: "Bank-Grade\nSecurity",
        desc: "Your wallet is secured with end-to-end Firebase encryption and custom rules.",
        graphic: (
            <motion.svg viewBox="0 0 200 200" className="w-56 h-56 overflow-visible" animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <path d="M 100 20 L 30 50 L 30 110 C 30 160, 100 190, 100 190 C 100 190, 170 160, 170 110 L 170 50 Z" fill="none" stroke="#34D399" strokeWidth="10" strokeLinejoin="round" className="drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]" />
                <motion.path d="M 65 105 L 90 130 L 140 75" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_20px_#34D399]" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }} />
            </motion.svg>
        )
    },
    {
        title: "Lightning Fast\nTransactions",
        desc: "Deposit and withdraw instantly with our optimized global routing engine.",
        graphic: (
            <motion.svg viewBox="0 0 200 200" className="w-56 h-56 overflow-visible" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <motion.polygon points="110,20 40,110 100,110 90,180 160,90 100,90" fill="none" stroke="#4A90E2" strokeWidth="10" strokeLinejoin="round" className="drop-shadow-[0_0_35px_rgba(74,144,226,0.8)]" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </motion.svg>
        )
    },
    {
        title: "Targeted\nEsports Markets",
        desc: "Access niche markets and deep analytics for global Esports tournaments.",
        graphic: (
            <motion.svg viewBox="0 0 200 200" className="w-56 h-56 overflow-visible" animate={{ rotate: [0, 90, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                <circle cx="100" cy="100" r="80" fill="none" stroke="#FF3B30" strokeWidth="4" className="drop-shadow-[0_0_15px_rgba(255,59,48,0.5)]" />
                <circle cx="100" cy="100" r="45" fill="none" stroke="#FF3B30" strokeWidth="10" className="drop-shadow-[0_0_25px_rgba(255,59,48,0.8)]" />
                <circle cx="100" cy="100" r="12" fill="#FFFFFF" className="drop-shadow-[0_0_20px_#FF3B30]" />
                <path d="M 100 0 L 100 30 M 100 170 L 100 200 M 0 100 L 30 100 M 170 100 L 200 100" stroke="#FF3B30" strokeWidth="6" strokeLinecap="round" />
            </motion.svg>
        )
    },
    {
        title: "Global\nLeaderboards",
        desc: "Compete against thousands of players worldwide and claim top ranks.",
        graphic: (
            <motion.svg viewBox="0 0 200 200" className="w-56 h-56 overflow-visible">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#7000FF" strokeWidth="8" className="drop-shadow-[0_0_30px_rgba(112,0,255,0.6)]" />
                <motion.ellipse cx="100" cy="100" rx="45" ry="90" fill="none" stroke="#7000FF" strokeWidth="6" animate={{ rx: [45, 10, 45] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                <motion.ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="#7000FF" strokeWidth="6" animate={{ ry: [25, 5, 25] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                <circle cx="100" cy="100" r="8" fill="#FFFFFF" className="drop-shadow-[0_0_15px_#FFFFFF]" />
            </motion.svg>
        )
    },
    {
        title: "Claim Your\nWelcome Bonus",
        desc: "Get started today with a 100% match on your first Parbet deposit.",
        graphic: (
            <motion.svg viewBox="0 0 200 200" className="w-56 h-56 overflow-visible" animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <path d="M 40 40 L 160 40 L 140 100 C 140 150, 60 150, 60 100 Z" fill="none" stroke="#F4D03F" strokeWidth="10" strokeLinejoin="round" className="drop-shadow-[0_0_35px_rgba(244,208,63,0.8)]" />
                <path d="M 20 40 C 20 80, 40 90, 40 90 M 180 40 C 180 80, 160 90, 160 90 M 80 150 L 80 180 M 120 150 L 120 180 M 50 180 L 150 180" fill="none" stroke="#F4D03F" strokeWidth="8" strokeLinecap="round" className="drop-shadow-[0_0_20px_rgba(244,208,63,0.5)]" />
                <motion.circle cx="100" cy="70" r="18" fill="#FFFFFF" className="drop-shadow-[0_0_20px_#F4D03F]" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.svg>
        )
    }
];

export default function Onboarding() {
    const [index, setIndex] = useState(0);
    const setOnboarded = useAppStore(state => state.setOnboarded);

    const nextSlide = () => {
        if (index === slides.length - 1) setOnboarded();
        else setIndex(prev => prev + 1);
    };

    return (
        <div className="relative w-full max-w-[400px] mx-auto h-screen bg-brand-bg flex flex-col justify-between p-8 z-50 items-center text-center overflow-hidden">
            <div className="flex-1 flex flex-col justify-center items-center w-full">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: 50 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -50 }} 
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center w-full"
                    >
                        <div className="w-full flex justify-center mb-4">
                            {slides[index].graphic}
                        </div>
                        <h1 className="text-3xl font-black whitespace-pre-line mt-8 leading-tight">{slides[index].title}</h1>
                        <p className="text-brand-muted mt-4 text-sm leading-relaxed max-w-xs mx-auto">{slides[index].desc}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <div className="flex justify-between items-center pb-8 w-full px-2">
                <div className="flex space-x-2">
                    {slides.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-brand-primary' : 'w-2 bg-brand-cardHover'}`} />
                    ))}
                </div>
                <button onClick={nextSlide} className="w-14 h-14 rounded-full bg-brand-primary flex items-center justify-center shadow-[0_0_25px_rgba(29,122,242,0.5)] hover:scale-105 transition-transform">
                    <ArrowRight size={24} className="text-white" />
                </button>
            </div>
        </div>
    );
}