import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchPlayerStats } from '../services/cricbuzzApi';
import { User } from 'lucide-react';

export default function PlayerStats({ playerId, name }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (playerId) fetchPlayerStats(playerId).then(setStats);
    }, [playerId]);

    return (
        <motion.div whileHover={{ y: -5 }} className="w-[200px] bg-white rounded-[20px] p-4 shadow-lg border border-gray-100 relative group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <User size={20} className="text-[#458731]" />
            </div>
            <h4 className="font-black text-[#1a1a1a] text-sm">{name}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Top Player</p>
            {stats ? (
                <div className="bg-[#E6F2D9] rounded-lg p-2 flex justify-between">
                    <span className="text-xs font-bold text-[#114C2A]">Runs: {stats.batting?.runs || 'N/A'}</span>
                    <span className="text-xs font-bold text-[#114C2A]">Avg: {stats.batting?.average || 'N/A'}</span>
                </div>
            ) : (
                <div className="h-6 w-full bg-gray-100 animate-pulse rounded-lg" />
            )}
        </motion.div>
    );
}