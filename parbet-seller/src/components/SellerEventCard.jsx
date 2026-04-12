import React from 'react';
import { motion } from 'framer-motion';

export default function SellerEventCard({ event, onClick }) {
    // Strictly format the 100% real event time into the Viagogo UI layout
    const formatEventDate = (isoString) => {
        const d = new Date(isoString);
        return {
            dayNum: d.getDate(),
            monthStr: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            timeStr: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
    };

    const dateInfo = formatEventDate(event.commence_time);

    // Split the real venue string into Stadium and City/State
    const locationParts = event.loc ? event.loc.split(',') : ['TBA Stadium'];
    const venueName = locationParts[0].trim();
    const cityState = locationParts.length > 1 ? locationParts.slice(1).join(',').trim() : 'India';

    return (
        <motion.div 
            whileHover={{ backgroundColor: '#f8f9fa' }}
            whileTap={{ scale: 0.998 }}
            onClick={() => onClick(event)}
            className="flex flex-col md:flex-row py-5 px-6 border-b border-[#e2e2e2] last:border-b-0 cursor-pointer group bg-white transition-colors"
        >
            {/* 1:1 Replica Date Column (Left) */}
            <div className="w-[100px] flex flex-col items-center md:items-start shrink-0 mb-3 md:mb-0">
                <div className="text-[22px] font-black text-[#1a1a1a] leading-none tracking-tight">
                    {dateInfo.dayNum} {dateInfo.monthStr}
                </div>
                <div className="text-[12px] text-[#54626c] font-medium mt-1 uppercase tracking-wider text-center md:text-left">
                    {dateInfo.dayStr} <br className="hidden md:block"/> {dateInfo.timeStr}
                </div>
            </div>

            {/* 1:1 Replica Event & Venue Column (Center) */}
            <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-[16px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors mb-1">
                    {event.t1} {event.t2 ? `vs ${event.t2}` : ''}
                </h3>
                <p className="text-[14px] text-[#54626c] leading-snug">
                    {venueName}
                    <br />
                    {cityState}
                </p>
            </div>

            {/* 1:1 Replica Sell Tickets Action (Right) */}
            <div className="shrink-0 flex items-center justify-start md:justify-end mt-4 md:mt-0">
                <span className="text-[#54626c] text-[14px] font-medium group-hover:text-[#458731] transition-colors">
                    Sell Tickets
                </span>
            </div>
        </motion.div>
    );
}