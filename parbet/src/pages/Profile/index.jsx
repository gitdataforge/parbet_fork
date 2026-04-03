import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useStore';
import { sendParbetEmail } from '../../lib/email';
import { ChevronLeft, Send, Activity, BarChart, Bell, Zap, Trophy, Shield, Settings as SettingsIcon, Mail } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const { balance, diamonds, user } = useAppStore();
    const [emailStatus, setEmailStatus] = useState('');

    const handleTestEmail = async () => {
        setEmailStatus('Sending...');
        const res = await sendParbetEmail({
            to_name: 'Parbet Admin',
            message: `User ${user?.uid || 'Guest'} triggered an action on Profile.`
        });
        setEmailStatus(res.success ? 'Sent!' : 'Failed (Check .env)');
    };

    return (
        <div className="h-full flex flex-col bg-brand-dark overflow-y-auto hide-scrollbar text-white">
            
            {/* SECTION 1: Header & Nav */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center p-6 border-b border-[#2A2A2A] sticky top-0 bg-brand-dark/90 backdrop-blur z-50">
                <button onClick={() => navigate('/')} className="p-2 bg-brand-card rounded-full border border-[#333]"><ChevronLeft size={20}/></button>
                <h1 className="font-bold text-lg text-brand-yellow">Profile</h1>
                <div className="w-10"></div>
            </motion.div>

            <div className="p-6 space-y-6 pb-24">
                
                {/* SECTION 2: Real-time User Stats Block */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-card p-4 rounded-2xl border border-[#333]">
                        <p className="text-xs text-gray-400">Live Balance</p>
                        <p className="text-xl font-bold text-white">${balance.toFixed(2)}</p>
                    </div>
                    <div className="bg-brand-card p-4 rounded-2xl border border-[#333]">
                        <p className="text-xs text-gray-400">Diamonds</p>
                        <p className="text-xl font-bold text-brand-yellow">{diamonds}</p>
                    </div>
                </motion.div>

                {/* SECTION 3: Hero Action Area */}
                <motion.div whileHover={{ scale: 0.98 }} className="bg-gradient-to-r from-brand-redDark to-brand-red p-6 rounded-3xl relative overflow-hidden">
                    <Zap className="absolute right-[-20px] bottom-[-20px] text-white/10 w-32 h-32" />
                    <h2 className="text-2xl font-black mb-2 relative z-10">Elevate Your Game</h2>
                    <p className="text-sm text-white/80 mb-4 relative z-10">Exclusive access via the Profile module.</p>
                    <button className="bg-brand-yellow text-black font-bold py-2 px-6 rounded-full text-sm">Action Required</button>
                </motion.div>

                {/* SECTION 4: Real-time Data Feed Placeholder */}
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="bg-brand-card rounded-2xl border border-[#333] p-5">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="text-brand-yellow" size={18} />
                        <h3 className="font-bold">Live Data Sync</h3>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center p-3 bg-[#111] rounded-xl border border-[#222]">
                                <span className="text-sm text-gray-300">Data Stream {i}</span>
                                <span className="text-brand-yellow text-xs animate-pulse">Syncing...</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* SECTION 5: Analytics & Charts Placeholder */}
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="bg-brand-card rounded-2xl border border-[#333] p-5 h-48 flex flex-col">
                    <div className="flex items-center space-x-2 mb-4">
                        <BarChart className="text-brand-yellow" size={18} />
                        <h3 className="font-bold">Module Analytics</h3>
                    </div>
                    <div className="flex-1 flex items-end justify-between space-x-2 mt-auto">
                        {[40, 70, 30, 90, 60, 100, 50].map((h, i) => (
                            <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} className="w-full bg-brand-yellow/80 rounded-t-sm" />
                        ))}
                    </div>
                </motion.div>

                {/* SECTION 6: Notifications & Alerts */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-brand-card rounded-2xl border border-brand-yellow/30 p-5 flex items-start space-x-4">
                    <div className="p-2 bg-brand-yellow/10 rounded-full"><Bell className="text-brand-yellow" size={20}/></div>
                    <div>
                        <h4 className="font-bold text-sm">System Alert</h4>
                        <p className="text-xs text-gray-400 mt-1">Profile module is fully active and secured by Firebase.</p>
                    </div>
                </motion.div>

                {/* SECTION 7: Feature Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div whileHover={{ y: -5 }} className="bg-brand-card p-4 rounded-xl border border-[#333] flex flex-col items-center justify-center text-center">
                        <Trophy className="text-brand-yellow mb-2" size={24}/>
                        <span className="text-xs font-bold">Rewards</span>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-brand-card p-4 rounded-xl border border-[#333] flex flex-col items-center justify-center text-center">
                        <Shield className="text-brand-yellow mb-2" size={24}/>
                        <span className="text-xs font-bold">Security</span>
                    </motion.div>
                </div>

                {/* SECTION 8: Module Configuration (Updated icon name) */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-brand-card rounded-2xl border border-[#333] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <SettingsIcon size={18} className="text-gray-400"/>
                            <h3 className="font-bold text-sm">Preferences</h3>
                        </div>
                        <div className="w-10 h-5 bg-brand-yellow rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full"></div></div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">Toggle specific functionalities for the Profile environment here. Preferences sync instantly via Firestore.</p>
                </motion.div>

                {/* SECTION 9: EmailJS Contact Integration */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-[#111] rounded-2xl border border-[#333] p-5">
                    <h3 className="font-bold mb-2 flex items-center"><Mail className="mr-2 text-brand-yellow" size={16}/> EmailJS Integration</h3>
                    <p className="text-xs text-gray-400 mb-4">Send a direct ping using .env configured EmailJS.</p>
                    <button onClick={handleTestEmail} className="w-full bg-brand-card border border-[#444] text-white py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#222]">
                        <Send size={14} />
                        <span>{emailStatus || 'Ping Administrator'}</span>
                    </button>
                </motion.div>

                {/* SECTION 10: Footer Status */}
                <div className="text-center pt-6 opacity-50">
                    <p className="text-[10px] uppercase tracking-widest">Parbet Engine v2.0</p>
                    <p className="text-[9px] mt-1 text-brand-yellow">Strict Mode Activated</p>
                </div>

            </div>
        </div>
    );
}