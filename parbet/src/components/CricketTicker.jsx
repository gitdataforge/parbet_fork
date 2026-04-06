import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchLiveScores } from '../services/cricketApi';

export default function CricketTicker() {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const load = async () => {
            const data = await fetchLiveScores();
            setScores(data.filter(m => m.matchStarted));
        };
        load();
        const interval = setInterval(load, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (scores.length === 0) return null;

    return (
        <div className="w-full bg-[#044d22] py-2 overflow-hidden border-b border-white/10 relative z-50">
            <motion.div 
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex whitespace-nowrap items-center space-x-12"
            >
                {scores.map((match, i) => (
                    <div key={i} className="flex items-center space-x-3 text-white text-xs font-bold uppercase tracking-wider">
                        <span className="text-[#8bc53f]">• LIVE</span>
                        <span>{match.name}:</span>
                        <span className="text-white/80">{match.status}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}