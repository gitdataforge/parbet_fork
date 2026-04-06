import React from 'react';
import { ShieldCheck, Info, Clock, UserCheck } from 'lucide-react';

export default function SafetyPanel({ type }) {
    const isStadium = type?.toLowerCase().includes('stadium');

    const rules = isStadium ? [
        { icon: ShieldCheck, text: "Strict Bag Policy: Clear bags only under 12x6x12 inches." },
        { icon: Clock, text: "Early Entry: Gates open 3 hours before kickoff." },
        { icon: UserCheck, text: "E-Tickets Only: Physical printed tickets will not be accepted." }
    ] : [
        { icon: ShieldCheck, text: "Age Restriction: Strictly 18+ valid ID required." },
        { icon: Clock, text: "Doors Open: 1 hour before scheduled showtime." },
        { icon: Info, text: "No Professional Cameras: Mobile photography permitted." }
    ];

    return (
        <div className="w-full bg-[#f8f9fa] rounded-[24px] p-6 mb-12 border border-gray-100">
            <h4 className="text-sm font-black text-[#1a1a1a] mb-5 uppercase tracking-widest flex items-center">
                <Info size={16} className="mr-2 text-[#458731]" /> Venue Entry Protocol
            </h4>
            <div className="space-y-4">
                {rules.map((rule, i) => (
                    <div key={i} className="flex items-start space-x-4">
                        <rule.icon size={18} className="text-[#458731] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600 font-medium leading-snug">{rule.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}