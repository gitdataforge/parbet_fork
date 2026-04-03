import React from 'react';
import { ChevronLeft, Bell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Discovery() {
    const navigate = useNavigate();
    return (
        <div className="h-full bg-brand-light overflow-y-auto pb-32 hide-scrollbar animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex justify-between items-center">
                <button onClick={()=>navigate('/')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><ChevronLeft size={16} className="text-gray-600"/></button>
                <h1 className="text-sm font-bold text-black">Calendar</h1>
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><Bell size={14} className="text-gray-500"/></button>
            </div>

            <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-black mb-4">Calendar & Tasks</h2>
                
                {/* Legend */}
                <div className="flex space-x-6 mb-6">
                    <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-black"></div><span className="text-[10px] font-medium text-gray-500">Class Date</span></div>
                    <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-[#82B1FF]"></div><span className="text-[10px] font-medium text-gray-500">Holl Date</span></div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-8 bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
                    {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                        let isSelected = day >= 1 && day <= 4;
                        let isHatched = day === 10 || day === 21 || day === 28;
                        let isCurrent = day === 29;
                        let bgClass = "bg-transparent text-gray-700 font-medium";
                        
                        if (isSelected) bgClass = "bg-brand-secondary text-brand-primary font-bold";
                        if (isCurrent) bgClass = "bg-brand-primary text-white font-bold shadow-md shadow-blue-500/30";
                        
                        return (
                            <div key={day} className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs transition-all ${bgClass} ${isHatched ? 'border border-dashed border-gray-300 text-gray-300 bg-gray-50' : ''}`}>
                                {day.toString().padStart(2, '0')}
                            </div>
                        )
                    })}
                </div>

                {/* Specials Filter */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-black">Today Specials</h2>
                    <button className="text-xs text-brand-primary font-bold flex items-center">See All <ArrowRight size={12} className="ml-1"/></button>
                </div>

                <div className="flex space-x-3 overflow-x-auto hide-scrollbar mb-6 -mx-6 px-6 pb-2">
                    <button className="bg-brand-primary text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-blue-500/20 whitespace-nowrap">Today</button>
                    <button className="bg-white text-gray-500 border border-gray-200 px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap">Yesterday</button>
                    <button className="bg-white text-gray-500 border border-gray-200 px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap">Next 7 days</button>
                </div>

                {/* Empty State Banner */}
                <div className="bg-brand-secondary rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 w-8 h-1 bg-gray-300 rounded-b-lg"></div>
                    <p className="text-brand-primary text-sm font-medium mb-4 mt-2">No tasks for today</p>
                    <button className="bg-brand-primary text-white px-6 py-3 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-transform">Add tasks</button>
                </div>
            </div>
        </div>
    )
}