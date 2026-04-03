import React from 'react';
import { motion } from 'framer-motion';
import { Settings, MoreVertical, Calendar } from 'lucide-react';

export default function Home() {
    return (
        <div className="h-full bg-brand-light overflow-y-auto pb-32 hide-scrollbar animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-black">Schedule</h1>
                <div className="flex space-x-2">
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><Settings size={14} className="text-gray-500"/></button>
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><MoreVertical size={14} className="text-gray-500"/></button>
                </div>
            </div>
            
            {/* Month Selector */}
            <div className="px-6 mb-6 flex justify-between items-center">
                <h2 className="text-sm font-medium text-gray-500">February</h2>
                <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center bg-white"><Calendar size={14} className="text-gray-500"/></button>
            </div>

            {/* Date Pill Scroller */}
            <div className="mb-8 bg-white mx-6 rounded-[32px] p-4 shadow-sm flex justify-between items-center">
                {['M','T','W','T','F','S','S'].map((day, i) => {
                    const isActive = i === 3;
                    return (
                        <div key={i} className="flex flex-col items-center">
                            <div className={`w-1 h-1 rounded-full mb-1 ${isActive ? 'bg-brand-primary' : 'bg-transparent'}`}></div>
                            <span className="text-[10px] text-gray-400 mb-2 font-medium">{day}</span>
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${isActive ? 'bg-brand-primary text-white shadow-md shadow-blue-500/30' : 'bg-[#F4F7FB] text-gray-600'}`}>
                                {10 + i}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Tasks List */}
            <div className="px-6 space-y-6">
                {[1,2,3].map((item, i) => (
                    <div key={i}>
                        <p className="text-[10px] text-center text-gray-400 mb-2 font-medium">08:36</p>
                        <motion.div whileHover={{ scale: 0.98 }} className={`p-5 rounded-[24px] relative overflow-hidden shadow-sm border border-gray-100 ${i === 0 ? 'bg-brand-secondary' : 'bg-white'}`}>
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${i === 0 ? 'bg-brand-primary' : 'bg-brand-secondary'}`}></div>
                            <div className="flex justify-between items-start mb-2 ml-2">
                                <h3 className="font-bold text-sm text-black">Student Write Notes :</h3>
                                <button className="p-1"><MoreVertical size={14} className="text-gray-400"/></button>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed ml-2 pr-4">We need to coordinate a call with managment to understand how can start wireframes.</p>
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
}