import React, { useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { Trophy } from 'lucide-react';

export default function SeriesRail() {
    const { liveMatches } = useAppStore();
    
    const seriesGroups = useMemo(() => {
        const groups = {};
        liveMatches.forEach(m => {
            if (m.league && !groups[m.league]) {
                groups[m.league] = m;
            }
        });
        return Object.values(groups).slice(0, 6);
    }, [liveMatches]);

    return (
        <div className="px-4 mb-16">
            <h2 className="text-2xl font-black text-[#1a1a1a] mb-6 flex items-center">
                <Trophy size={24} className="mr-2 text-yellow-500" /> Major Series
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {seriesGroups.map((group, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-4 rounded-[20px] shadow-sm hover:shadow-md transition-all text-center group cursor-pointer">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#E6F2D9] transition-colors">
                            <Trophy size={20} className="text-gray-400 group-hover:text-[#458731]" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 line-clamp-2">{group.league}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}