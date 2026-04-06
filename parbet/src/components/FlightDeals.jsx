import React from 'react';
import { Plane } from 'lucide-react';

export default function FlightDeals({ destination }) {
    // Logic: Appears dynamically for out-of-state "City Hub" portals
    return (
        <div className="bg-[#E6F2D9] text-[#114C2A] p-3 rounded-xl flex items-center justify-between mt-4 border border-[#C5E1A5]">
            <div className="flex items-center font-bold text-xs"><Plane size={14} className="mr-2"/> Fly to {destination}</div>
            <span className="font-black text-sm">Check Deals →</span>
        </div>
    );
}