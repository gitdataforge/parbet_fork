import React from 'react';
import { motion } from 'framer-motion';

export default function LivePulseGlobe() {
    return (
        <div className="w-full bg-[#041a0d] rounded-[32px] p-10 mb-16 flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/5 shadow-2xl">
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                    Global <span className="text-[#8bc53f]">Purchase Pulse</span>
                </h2>
                <p className="text-white/40 font-medium mb-10 max-w-md mx-auto">Real-time marketplace activity across the Parbet network.</p>
            </div>

            <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
                {/* Abstract SVG Globe Representation */}
                <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
                    <path d="M40 100 Q100 20 160 100 T40 100" fill="none" stroke="white" strokeWidth="0.5" />
                </svg>

                {/* Animated Pings representing live sales hotspots */}
                {[
                    { t: "20%", l: "30%", d: 0 },
                    { t: "45%", l: "70%", d: 1.2 },
                    { t: "70%", l: "40%", d: 0.8 },
                    { t: "30%", l: "60%", d: 2.1 }
                ].map((p, i) => (
                    <div key={i} style={{ top: p.t, left: p.l }} className="absolute">
                        <motion.div 
                            animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: p.d }}
                            className="w-4 h-4 bg-[#8bc53f] rounded-full"
                        />
                        <div className="w-2 h-2 bg-[#8bc53f] rounded-full absolute top-1 left-1" />
                    </div>
                ))}
            </div>
        </div>
    );
}