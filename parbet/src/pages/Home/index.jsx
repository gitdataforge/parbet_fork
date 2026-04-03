import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Search, Play, User, Share } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const { balance, diamonds } = useAppStore();

    return (
        <div className="h-full flex flex-col relative pb-24 overflow-y-auto hide-scrollbar animate-fade-in">
            <div className="flex justify-between items-center px-6 pt-12 pb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-800 border border-[#333] flex items-center justify-center"><User className="text-white/50" /></div>
                    <div className="flex flex-col"><span className="text-xs text-gray-400">Hey,</span><span className="text-lg font-bold">Markus</span></div>
                </div>
                <div className="flex items-center bg-brand-card rounded-full px-4 py-2 border border-[#333]">
                    <span className="text-sm font-bold mr-2">{diamonds}</span><div className="w-3 h-3 bg-brand-yellow rotate-45"></div>
                </div>
            </div>
            <div className="px-6 mt-4">
                <motion.div onClick={() => navigate('/discovery')} className="relative w-full h-[320px] rounded-[32px] overflow-hidden bg-gradient-to-br from-[#2A1B1B] to-brand-dark border border-[#2A2A2A] p-6 cursor-pointer shadow-2xl">
                     <h1 className="text-3xl font-bold leading-tight relative z-10">Make Your<br/>Bet Special</h1>
                     <div className="absolute bottom-6 left-6 z-10">
                         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 w-32 border border-white/20 mb-6">
                            <div className="text-2xl font-bold">500$</div>
                            <div className="text-[10px] text-gray-300 mt-1">for first bet<br/>is 70%</div>
                        </div>
                        <button className="bg-brand-yellow text-black px-5 py-3 rounded-full text-sm font-bold flex items-center space-x-2"><Play size={14} fill="currentColor"/><span>Get Started</span></button>
                     </div>
                </motion.div>
                <div className="mt-8 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Balance</span>
                    <span className="text-2xl font-bold text-white">${balance.toFixed(2)}</span>
                </div>
                <button onClick={() => navigate('/wallet')} className="w-full mt-4 bg-brand-card py-4 rounded-xl font-bold text-gray-300 border border-[#333]">View All Modules (60+)</button>
            </div>
        </div>
    );
}