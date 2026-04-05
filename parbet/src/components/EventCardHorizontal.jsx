import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, Info, Clock, MapPin } from 'lucide-react';

// Strict Relative Date Formatter to ensure the badge logic executes flawlessly within the isolated component
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
    if (diffDays <= 7) return 'This Week';
    return '';
};

export default function EventCardHorizontal({ event, onClick, isHottest = false }) {
    if (!event) return null;

    // Dynamically calculate the relative urgency label based on real API commence time
    const relativeLabel = getRelativeDateLabel(event.commence_time);

    return (
        <motion.div 
            onClick={onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.002, borderColor: '#ccc' }} 
            transition={{ duration: 0.2 }}
            className="bg-white border border-[#DEE2E6] rounded-[16px] p-4 flex flex-col md:flex-row md:items-center hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group w-full"
        >
            <div className="flex items-center flex-1">
                {/* Left Date Tear-off Box */}
                <div className="flex flex-col items-center justify-center pr-5 border-r border-[#DEE2E6] min-w-[85px]">
                    <span className="text-[13px] font-bold text-gray-900 mb-0.5 tracking-wide uppercase">{event.month}</span>
                    <span className="text-[26px] font-black text-gray-900 leading-none mb-0.5">{event.day}</span>
                    <span className="text-[12px] text-gray-500 font-medium">{event.dow}</span>
                </div>
                
                {/* Middle Event Details */}
                <div className="pl-5 flex-1">
                    <h3 className="text-[17px] font-bold text-[#1D2B36] leading-tight mb-1 group-hover:text-[#458731] transition-colors">
                        {event.t1} {event.t2 ? `vs ${event.t2}` : ''}
                    </h3>
                    <p className="text-[13px] text-gray-500 flex items-center mb-2 font-medium">
                        {event.time} <span className="mx-1.5 opacity-50">•</span> <MapPin size={12} className="mr-1 opacity-70"/> {event.loc}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 items-center mt-1">
                        {/* Dynamic Badge Rendering */}
                        {relativeLabel && (
                            <div className="flex items-center bg-[#EAF4D9] text-[#114C2A] border border-[#C5E1A5] px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider">
                                <Calendar size={12} className="mr-1.5 opacity-80"/> {relativeLabel}
                            </div>
                        )}
                        {isHottest && (
                            <div className="flex items-center bg-[#E6F2D9] text-[#114C2A] px-2 py-0.5 rounded-[4px] text-[11px] font-bold border border-[#C5E1A5]">
                                <Flame size={12} className="mr-1.5"/> Hottest event on our site <Info size={10} className="ml-1 opacity-60"/>
                            </div>
                        )}
                        {!isHottest && Math.random() > 0.5 && (
                            <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded-[4px] text-[11px] font-bold border border-blue-100">
                                <Clock size={12} className="mr-1.5"/> On sale soon
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Action Button */}
            <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t border-[#DEE2E6] md:border-t-0 flex justify-end shrink-0">
                <button className="w-full md:w-auto border border-gray-300 text-gray-900 bg-white px-5 py-2.5 rounded-[10px] font-bold text-[14px] group-hover:bg-gray-50 transition-colors shadow-sm">
                    See tickets
                </button>
            </div>
        </motion.div>
    );
}