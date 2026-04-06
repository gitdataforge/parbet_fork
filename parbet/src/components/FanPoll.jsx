import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useStore';

export default function FanPoll({ match }) {
    const [voted, setVoted] = useState(null);
    const [stats, setStats] = useState({ t1: 50, t2: 50 });

    const handleVote = (side) => {
        if (voted) return;
        setVoted(side);
        // Logic to simulate real distribution - in production this writes to Firestore
        setStats(side === 't1' ? { t1: 65, t2: 35 } : { t1: 42, t2: 58 });
    };

    return (
        <div className="w-full bg-white border border-gray-200 rounded-[24px] p-6 mb-12 shadow-sm">
            <div className="text-center mb-6">
                <h3 className="text-xl font-black text-[#1a1a1a]">Who will win?</h3>
                <p className="text-sm text-gray-500 font-medium">Join 2,400+ fans voting live</p>
            </div>
            
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => handleVote('t1')}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all ${voted === 't1' ? 'border-[#458731] bg-[#E6F2D9]' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <span className="block font-black text-lg">{match.t1}</span>
                    {voted && <span className="text-[#458731] font-black">{stats.t1}%</span>}
                </button>
                <div className="text-gray-300 font-black">VS</div>
                <button 
                    onClick={() => handleVote('t2')}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all ${voted === 't2' ? 'border-[#458731] bg-[#E6F2D9]' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <span className="block font-black text-lg">{match.t2}</span>
                    {voted && <span className="text-[#458731] font-black">{stats.t2}%</span>}
                </button>
            </div>
            {voted && <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.t1}%` }} className="h-full bg-[#458731]" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.t2}%` }} className="h-full bg-gray-300" />
            </div>}
        </div>
    );
}