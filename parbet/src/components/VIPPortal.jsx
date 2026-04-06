import React, { useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { Crown } from 'lucide-react';

export default function VIPPortal() {
    const { liveMatches } = useAppStore();
    
    // Logic: RegEx search for premium access keywords
    const vipEvents = useMemo(() => {
        return liveMatches.filter(m => /vip|meet|hospitality|premium/i.test(m.league) || /vip|meet/i.test(m.t1)).slice(0, 4);
    }, [liveMatches]);

    if (vipEvents.length === 0) return null;

    return (
        <div className="bg-[#111] py-16 -mx-4 px-8 mb-16 border-y border-[#333]">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center"><Crown size={24} className="text-yellow-500 mr-3"/> VIP & Hospitality</h2>
            <div className="flex overflow-x-auto hide-scrollbar space-x-6">
                {vipEvents.map(e => (
                    <div key={e.id} className="min-w-[280px] bg-[#222] p-5 rounded-[20px] border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                        <span className="bg-yellow-500 text-black px-2 py-1 rounded text-[10px] font-black uppercase mb-3 inline-block">Exclusive</span>
                        <h3 className="text-white font-bold truncate">{e.t1}</h3>
                        <p className="text-yellow-500/80 text-xs font-medium mt-1">{e.league}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}