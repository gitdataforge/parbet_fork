import React from 'react';
import { Flame } from 'lucide-react';

export default function HypeScore({ favoritesCount }) {
    // Logic: Calculate Hype Index out of 10
    const score = Math.min((favoritesCount / 500) * 10, 9.9).toFixed(1);
    
    return (
        <div className="flex items-center bg-[#fff4e6] px-2.5 py-1 rounded-lg border border-orange-100">
            <Flame size={14} className="text-orange-500 mr-1" />
            <span className="text-orange-600 font-black text-xs">{score}/10 Hype</span>
        </div>
    );
}