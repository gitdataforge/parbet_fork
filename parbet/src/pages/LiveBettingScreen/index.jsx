import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useStore';
import { sendParbetEmail } from '../../lib/email';
import { ChevronLeft, Send, Activity, BarChart, Bell, Zap, Trophy, Shield, Settings as SettingsIcon, Mail } from 'lucide-react';

export default function LiveBettingScreen() {
    const navigate = useNavigate();
    const { balance, diamonds, user } = useAppStore();
    const [emailStatus, setEmailStatus] = useState('');

    const handleTestEmail = async () => {
        setEmailStatus('Sending...');
        const res = await sendParbetEmail({
            to_name: 'Parbet Admin',
            message: `User ${user?.uid || 'Guest'} triggered an action on LiveBettingScreen.`
        });
        setEmailStatus(res.success ? 'Sent!' : 'Failed (Check .env)');
    };

    return (
        <div className="h-full flex flex-col bg-brand-light overflow-y-auto hide-scrollbar text-black font-sans">
            
            {/* SECTION 1: Header & Nav */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur z-40 shadow-sm">
                <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><ChevronLeft size={16} className="text-gray-600"/></button>
                <h1 className="font-bold text-sm text-brand-primary">LiveBettingScreen</h1>
                <div className="w-8"></div>
            </motion.div>

            <div className="p-6 space-y-6 pb-32">
                
                {/* SECTION 2: Real-time User Stats Block */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Balance</p>
                        <p className="text-xl font-black text-black">${balance.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Diamonds</p>
                        <p className="text-xl font-black text-brand-primary">{diamonds}</p>
                    </div>
                </motion.div>

                {/* SECTION 3: Hero Action Area */}
                <motion.div whileHover={{ scale: 0.98 }} className="bg-brand-primary p-8 rounded-[32px] relative overflow-hidden shadow-lg shadow-blue-500/30">
                    <Zap className="absolute right-[-20px] bottom-[-20px] text-white/10 w-40 h-40" />
                    <h2 className="text-2xl font-black mb-2 relative z-10 text-white leading-tight">Elevate<br/>Your Game</h2>
                    <p className="text-xs text-brand-secondary mb-6 relative z-10 w-2/3">Exclusive access via the LiveBettingScreen module.</p>
                    <button className="bg-white text-brand-primary font-bold py-3 px-6 rounded-full text-xs shadow-md">Action Required</button>
                </motion.div>

                {/* SECTION 4: Real-time Data Feed Placeholder */}
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="text-brand-primary" size={18} />
                        <h3 className="font-bold text-sm">Live Data Sync</h3>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center p-4 bg-brand-light rounded-2xl">
                                <span className="text-xs font-medium text-gray-600">Data Stream {i}</span>
                                <span className="text-brand-primary text-[10px] font-bold animate-pulse uppercase tracking-wider">Syncing</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* SECTION 5: Analytics & Charts Placeholder */}
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-56 flex flex-col">
                    <div className="flex items-center space-x-2 mb-6">
                        <BarChart className="text-brand-primary" size={18} />
                        <h3 className="font-bold text-sm">Module Analytics</h3>
                    </div>
                    <div className="flex-1 flex items-end justify-between space-x-2 mt-auto px-2">
                        {[40, 70, 30, 90, 60, 100, 50].map((h, i) => (
                            <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} className="w-full bg-brand-secondary rounded-t-sm relative">
                                {i === 3 && <div className="absolute inset-0 bg-brand-primary rounded-t-sm"></div>}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* SECTION 6: Notifications & Alerts */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-brand-secondary rounded-3xl p-5 flex items-start space-x-4 shadow-inner">
                    <div className="p-3 bg-white rounded-full shadow-sm"><Bell className="text-brand-primary" size={16}/></div>
                    <div>
                        <h4 className="font-bold text-sm text-brand-primary">System Alert</h4>
                        <p className="text-xs text-brand-primary/80 mt-1 font-medium">LiveBettingScreen module is fully active and secured.</p>
                    </div>
                </motion.div>

                {/* SECTION 7: Feature Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mb-3">
                            <Trophy className="text-brand-primary" size={20}/>
                        </div>
                        <span className="text-xs font-bold">Rewards</span>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mb-3">
                            <Shield className="text-brand-primary" size={20}/>
                        </div>
                        <span className="text-xs font-bold">Security</span>
                    </motion.div>
                </div>

                {/* SECTION 8: Module Configuration */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <SettingsIcon size={18} className="text-gray-400"/>
                            <h3 className="font-bold text-sm">Preferences</h3>
                        </div>
                        <div className="w-12 h-6 bg-brand-primary rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div></div>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">Toggle specific functionalities for the LiveBettingScreen environment here. Preferences sync instantly via Firestore.</p>
                </motion.div>

                {/* SECTION 9: EmailJS Contact Integration */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold mb-2 flex items-center text-sm"><Mail className="mr-2 text-brand-primary" size={16}/> API Integration</h3>
                    <p className="text-[10px] text-gray-400 mb-6 font-medium">Send a direct ping using .env configured EmailJS.</p>
                    <button onClick={handleTestEmail} className="w-full bg-brand-light text-brand-primary font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
                        <Send size={14} />
                        <span className="text-xs">{emailStatus || 'Ping Administrator'}</span>
                    </button>
                </motion.div>

                {/* SECTION 10: Footer Status */}
                <div className="text-center pt-6 opacity-40">
                    <p className="text-[10px] uppercase tracking-widest font-bold">Parbet Engine v3.0</p>
                    <p className="text-[9px] mt-1 text-gray-500 font-medium">Light Theme Activated</p>
                </div>

            </div>
        </div>
    );
}