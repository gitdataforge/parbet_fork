import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchLiveCommentary } from '../services/cricbuzzApi';

export default function CricketCommentary({ matchId }) {
    const [commentary, setCommentary] = useState([]);

    useEffect(() => {
        if (matchId) fetchLiveCommentary(matchId).then(setCommentary);
    }, [matchId]);

    if (!commentary.length) return null;

    return (
        <div className="w-full bg-[#1a1a1a] border-y border-white/10 py-3 overflow-hidden mt-8">
            <motion.div 
                animate={{ x: [0, -2000] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="flex whitespace-nowrap space-x-12"
            >
                {commentary.slice(0, 10).map((c, i) => (
                    <div key={i} className="text-white text-sm font-medium flex items-center">
                        <span className="text-[#8bc53f] font-black mr-2 text-xs">{c.over}</span>
                        {c.commText?.replace(/<[^>]*>?/gm, '')}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}