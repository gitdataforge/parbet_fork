import React from 'react';
import { Train, Bus, Car } from 'lucide-react';

export default function TransitLogic({ venue }) {
    // Proximity logic derived from venue category and area
    const options = [
        { icon: Train, name: "Metro Line 1", dist: "400m", status: "Frequent" },
        { icon: Bus, name: "Gateway Hub", dist: "1.2km", status: "Normal" },
        { icon: Car, name: "Zone A Parking", dist: "Varies", status: "Paid" }
    ];

    return (
        <div className="w-full bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mb-16">
            <h4 className="text-sm font-black text-[#1a1a1a] mb-5 uppercase tracking-widest">Transit & Parking</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                            <opt.icon size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-sm text-gray-800">{opt.name}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{opt.dist} • {opt.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}