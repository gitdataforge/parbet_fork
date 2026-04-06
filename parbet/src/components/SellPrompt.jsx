import React from 'react';
import { useAppStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function SellPrompt() {
    const { liveMatches } = useAppStore();
    const navigate = useNavigate();
    
    // Logic: Find highest volume event to prompt selling
    const topEvent = liveMatches[0];

    if (!topEvent) return null;

    return (
        <div className="bg-[#f8f9fa] rounded-[24px] p-6 md:p-8 border border-dashed border-gray-300 mt-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
                <h3 className="text-[#1a1a1a] font-black text-2xl mb-1">Have tickets for {topEvent.t1}?</h3>
                <p className="text-gray-500 font-medium">Demand is critically high. List them safely in 2 minutes.</p>
            </div>
            <button onClick={() => navigate('/sell')} className="bg-[#1a1a1a] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition-colors">
                Sell Tickets Now
            </button>
        </div>
    );
}