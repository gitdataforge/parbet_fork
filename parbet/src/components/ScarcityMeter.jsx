import React from 'react';

export default function ScarcityMeter({ totalCapacity = 50000, activeListings = 1200 }) {
    const percentLeft = Math.max(((activeListings / totalCapacity) * 100).toFixed(1), 1);
    const isCritical = percentLeft < 5;

    return (
        <div className="w-full mt-3">
            <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inventory Status</span>
                <span className={`text-xs font-black ${isCritical ? 'text-red-500' : 'text-[#458731]'}`}>{percentLeft}% Left</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                    className={`h-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-[#458731]'}`} 
                    style={{ width: `${percentLeft}%` }} 
                />
            </div>
            {isCritical && <p className="text-[10px] text-red-500 font-bold mt-1">Selling extremely fast</p>}
        </div>
    );
}