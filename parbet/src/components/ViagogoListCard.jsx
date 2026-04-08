import React from 'react';
import { Calendar, TrendingDown } from 'lucide-react';

// Strict Relative Date Formatter matched to Viagogo rules
const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) return 'Today';
    if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffTime = Math.abs(eventDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return 'This week';
    return '';
};

export default function ViagogoListCard({ event, onClick }) {
    if (!event) return null;

    const m = event;
    const relativeLabel = getRelativeDateLabel(m.commence_time);

    return (
        <div 
            onClick={onClick}
            className="bg-white border border-[#cccccc] rounded-[12px] p-4 flex flex-col md:flex-row md:items-center hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-gray-400 transition-all cursor-pointer group font-sans w-full"
        >
            <div className="flex items-center flex-1">
                {/* Left Date Tear-off Box */}
                <div className="flex flex-col items-center justify-center pr-5 md:pr-6 border-r border-[#cccccc] min-w-[80px]">
                    <span className="text-[13px] font-bold text-[#1a1a1a] uppercase">{m.month}</span>
                    <span className="text-[28px] font-black text-[#1a1a1a] leading-none my-0.5">{m.day}</span>
                    <span className="text-[12px] text-gray-500 font-medium">{m.dow}</span>
                </div>
                
                {/* Middle Event Details */}
                <div className="pl-5 md:pl-6 flex-1 min-w-0">
                    <h3 className="text-[16px] md:text-[18px] font-bold text-[#1a1a1a] leading-tight mb-1 truncate group-hover:text-[#114C2A] transition-colors">
                        {m.t1} {m.t2 ? `vs ${m.t2}` : ''}
                    </h3>
                    <p className="text-[13px] text-gray-500 flex items-center mb-2.5 truncate">
                        {m.time} • {m.country === 'IN' || m.loc.toLowerCase().includes('india') ? '🇮🇳 ' : ''}{m.loc}
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                        {relativeLabel && (
                            <div className="flex items-center bg-white border border-gray-200 text-[#333] px-2 py-0.5 rounded-[4px] text-[11px] font-bold shadow-sm">
                                <Calendar size={12} className="mr-1.5 opacity-60"/> {relativeLabel}
                            </div>
                        )}
                        <div className="flex items-center bg-[#EAF4D9] text-[#114C2A] px-2 py-0.5 rounded-[4px] text-[11px] font-bold border border-[#C5E1A5]">
                            <TrendingDown size={12} className="mr-1.5 text-[#114C2A]" strokeWidth={3}/> Prices below 30-day average
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Action Button */}
            <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t border-[#cccccc] md:border-t-0 flex justify-end shrink-0 md:pl-4">
                <button className="w-full md:w-auto border border-[#cccccc] text-[#1a1a1a] bg-white px-5 py-2 rounded-[8px] font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-sm">
                    See tickets
                </button>
            </div>
        </div>
    );
}