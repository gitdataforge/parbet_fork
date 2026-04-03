import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useAppStore } from '../store/useStore';

const SVGShape = ({ children, color }) => (
    <motion.svg viewBox="0 0 200 200" className="w-64 h-64 overflow-visible" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
        {children}
    </motion.svg>
);

const slides = [
    { title: "Pro Sportsbook\nArchitecture", desc: "Experience a dense, trading-grade interface designed for high-volume bettors.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="70" fill="none" stroke="#1D7AF2" strokeWidth="12" className="drop-shadow-[0_0_30px_rgba(29,122,242,0.6)]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} /></SVGShape> },
    { title: "Real-Time\nLive Odds Grid", desc: "Instantaneous updates for Asian Handicaps and Over/Under lines.", graphic: <SVGShape><motion.path d="M 20 150 L 70 90 L 110 110 L 170 40" fill="none" stroke="#22C55E" strokeWidth="10" className="drop-shadow-[0_0_25px_rgba(34,197,94,0.8)]" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} /></SVGShape> },
    { title: "Mollybet\nTrade Engine", desc: "Mirrored functionality of the world's leading sports trading software.", graphic: <SVGShape><motion.polygon points="100,20 180,180 20,180" fill="none" stroke="#D9F950" strokeWidth="10" className="drop-shadow-[0_0_30px_rgba(217,249,80,0.8)]" animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} /></SVGShape> },
    { title: "Bank-Grade\n2FA Security", desc: "Secured via strict Firebase rules and OTPAuth TOTP authentication.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="50" fill="none" stroke="#7000FF" strokeWidth="16" className="drop-shadow-[0_0_40px_rgba(112,0,255,0.8)]" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} /></SVGShape> },
    { title: "Lightning Fast\nExecution", desc: "One-click bet placement with zero latency via global edge routing.", graphic: <SVGShape><motion.path d="M 100 0 L 100 200 M 0 100 L 200 100" stroke="#FF3B30" strokeWidth="8" className="drop-shadow-[0_0_20px_rgba(255,59,48,0.8)]" animate={{ rotate: 45 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} /></SVGShape> },
    { title: "Global\nLiquidity", desc: "Aggregated odds from top global bookmakers in one interface.", graphic: <SVGShape><motion.ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="#1D7AF2" strokeWidth="6" animate={{ ry: [30, 90, 30] }} transition={{ duration: 4, repeat: Infinity }} /></SVGShape> },
    { title: "Customizable\nDashboards", desc: "Tailor your layout, timezone, and price formats perfectly.", graphic: <SVGShape><motion.rect x="40" y="40" width="120" height="120" fill="none" stroke="#22C55E" strokeWidth="10" animate={{ rotate: 90 }} transition={{ duration: 3, repeat: Infinity }} /></SVGShape> },
    { title: "Secure Your\nBankroll", desc: "Sign up now and lock down your account with real 2-Factor Authentication.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="80" fill="none" stroke="#D9F950" strokeWidth="8" animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }} /><circle cx="100" cy="100" r="10" fill="#FFF"/></SVGShape> }
];

export default function Onboarding() {
    const [index, setIndex] = useState(0);
    const setOnboarded = useAppStore(state => state.setOnboarded);

    return (
        <div className="relative w-full h-screen bg-brand-bg flex flex-col justify-between p-8 z-50 items-center text-center overflow-hidden">
            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md">
                <AnimatePresence mode="wait">
                    <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center w-full">
                        <div className="w-full flex justify-center mb-8 h-64">{slides[index].graphic}</div>
                        <h1 className="text-4xl font-black whitespace-pre-line mt-8 leading-tight tracking-tight text-white">{slides[index].title}</h1>
                        <p className="text-brand-muted mt-4 text-sm leading-relaxed max-w-xs mx-auto">{slides[index].desc}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <div className="w-full max-w-md pb-8">
                <div className="flex justify-center space-x-2 mb-8">
                    {slides.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-brand-primary' : 'w-2 bg-brand-panel border border-white/10'}`} />))}
                </div>
                {index < slides.length - 1 ? (
                    <button onClick={() => setIndex(i => i + 1)} className="w-full bg-brand-panel border border-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors">
                        <span>Continue</span><ArrowRight size={18} className="ml-2 text-brand-muted" />
                    </button>
                ) : (
                    <button onClick={() => setOnboarded()} className="w-full bg-brand-neon text-black font-black py-4 rounded-xl flex items-center justify-center hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(217,249,80,0.3)]">
                        <Play size={18} className="mr-2" fill="currentColor" /><span>GET STARTED</span>
                    </button>
                )}
            </div>
        </div>
    );
}