import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useStore';

const matches = [
    { id: 1, time: "64'", league: "UEFA Champions League", t1: "Paris St. Germain", t2: "FC Barcelona", s1: 2, s2: 1, odds: { o1: 2.315, ox: 4.851, o2: 4.001, ah1: 1.101, ah2: 9.216, o_ou: 1.5, u_ou: 8.214 } },
    { id: 2, time: "19:00", league: "UEFA Champions League", t1: "Manchester City", t2: "Chelsea", s1: 0, s2: 0, odds: { o1: 1.954, ox: 3.200, o2: 4.500, ah1: 1.850, ah2: 1.950, o_ou: 2.5, u_ou: 1.850 } },
    { id: 3, time: "88'", league: "Serie A", t1: "Fiorentina", t2: "AC Milan", s1: 3, s2: 1, odds: { o1: 1.050, ox: 15.00, o2: 55.00, ah1: "-", ah2: "-", o_ou: 4.5, u_ou: 1.100 } },
    { id: 4, time: "45'", league: "Premier League", t1: "Liverpool", t2: "Arsenal", s1: 1, s2: 1, odds: { o1: 2.500, ox: 3.100, o2: 2.800, ah1: 1.900, ah2: 1.950, o_ou: 3.5, u_ou: 2.100 } }
];

export default function Home() {
    const addToBetslip = useAppStore(state => state.addToBetslip);

    const handleOddsClick = (team, oddsVal, market) => {
        if(oddsVal !== "-") addToBetslip({ team, odds: oddsVal, market });
    };

    return (
        <div className="animate-fade-in w-full max-w-[1200px] mx-auto">
            {/* Filters Row */}
            <div className="flex space-x-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
                <button className="bg-brand-primary text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center whitespace-nowrap"><div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div> Live events</button>
                {['Football', 'Basketball', 'Tennis', 'American Football', 'E-Sports'].map(s => (
                    <button key={s} className="bg-brand-card border border-white/5 text-brand-muted hover:text-white px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors">{s}</button>
                ))}
            </div>

            {/* Match Grid Header */}
            <div className="bg-[#1A1C23] rounded-t-xl border border-white/5 p-3 flex text-[10px] font-bold text-brand-muted uppercase tracking-wider sticky top-0 z-10">
                <div className="w-2/5">Match</div>
                <div className="w-3/5 grid grid-cols-7 gap-1 text-center items-center">
                    <div>1</div><div>X</div><div>2</div>
                    <div className="col-span-2">A/1 &nbsp;&nbsp;&nbsp; A/2</div>
                    <div className="col-span-2">O &nbsp;&nbsp;&nbsp; U</div>
                </div>
            </div>

            {/* Match List */}
            <div className="space-y-1">
                {matches.map(m => (
                    <div key={m.id} className="bg-brand-card hover:bg-[#1E2129] border border-white/5 rounded-lg p-3 flex items-center transition-colors group">
                        {/* Match Info */}
                        <div className="w-2/5 flex pr-4">
                            <div className="flex flex-col items-center justify-center mr-3 w-8">
                                <Star size={12} className="text-brand-muted/30 hover:text-brand-neon cursor-pointer mb-1"/>
                                <span className={`text-[10px] font-bold ${m.time.includes("'") ? 'text-brand-red animate-pulse' : 'text-brand-muted'}`}>{m.time}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] text-brand-muted mb-1 flex items-center">{m.league} <ChevronRight size={10} className="mx-1"/> </p>
                                <div className="flex justify-between items-center"><span className="text-xs font-bold text-white">{m.t1}</span><span className="text-brand-neon text-xs font-bold">{m.s1}</span></div>
                                <div className="flex justify-between items-center mt-1"><span className="text-xs font-bold text-white">{m.t2}</span><span className="text-brand-neon text-xs font-bold">{m.s2}</span></div>
                            </div>
                        </div>

                        {/* Odds Grid */}
                        <div className="w-3/5 grid grid-cols-7 gap-1.5">
                            <button onClick={()=>handleOddsClick(m.t1, m.odds.o1, 'Match Winner')} className="odds-btn"><span></span><span className="odds-val">{m.odds.o1}</span></button>
                            <button onClick={()=>handleOddsClick('Draw', m.odds.ox, 'Match Winner')} className="odds-btn bg-[#22242B]"><span></span><span className="odds-val text-brand-muted">{m.odds.ox}</span></button>
                            <button onClick={()=>handleOddsClick(m.t2, m.odds.o2, 'Match Winner')} className="odds-btn"><span></span><span className="odds-val">{m.odds.o2}</span></button>
                            
                            <button onClick={()=>handleOddsClick(m.t1, m.odds.ah1, 'Asian Hcap')} className="odds-btn col-span-1"><span>-1.5</span><span className="odds-val">{m.odds.ah1}</span></button>
                            <button onClick={()=>handleOddsClick(m.t2, m.odds.ah2, 'Asian Hcap')} className="odds-btn col-span-1"><span>+1.5</span><span className="odds-val">{m.odds.ah2}</span></button>
                            
                            <button onClick={()=>handleOddsClick('Over', m.odds.o_ou, 'Total Goals')} className="odds-btn col-span-1"><span>2.5</span><span className="odds-val text-white">{m.odds.o_ou}</span></button>
                            <button onClick={()=>handleOddsClick('Under', m.odds.u_ou, 'Total Goals')} className="odds-btn col-span-1"><span>2.5</span><span className="odds-val text-white">{m.odds.u_ou}</span></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphics Block */}
            <div className="mt-6 flex space-x-4">
                <div className="flex-1 bg-gradient-to-r from-[#171A21] to-brand-bg rounded-xl border border-white/5 p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-20"><svg width="150" height="150" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" stroke="#1D7AF2" strokeWidth="20" fill="none"/></svg></div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-black text-white mb-1">Mollybet Pro Engine</h3>
                        <p className="text-xs text-brand-muted">Trade like a professional with direct API access.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}