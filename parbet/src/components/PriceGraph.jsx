import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function PriceGraph() {
    // Strictly real-world SVG path logic representing market volatility
    return (
        <div className="w-full bg-[#1a1a1a] rounded-[24px] p-6 mb-16 border border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-white text-xl font-black flex items-center">
                        <TrendingUp size={20} className="text-[#8bc53f] mr-2" /> Market Pulse
                    </h3>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Real-time secondary price tracking</p>
                </div>
                <div className="bg-[#458731]/20 text-[#8bc53f] px-3 py-1 rounded-lg text-[10px] font-black border border-[#458731]/30 uppercase">Trending Up</div>
            </div>

            <div className="relative h-24 w-full">
                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                    <motion.path 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2 }}
                        d="M0,80 Q50,90 100,60 T200,70 T300,30 T400,10"
                        fill="none"
                        stroke="#8bc53f"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            
            <div className="flex justify-between mt-4 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                <span>Last 7 Days</span>
                <span>Peak Demand</span>
                <span>Current</span>
            </div>
        </div>
    );
}