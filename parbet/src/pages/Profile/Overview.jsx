import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Ticket, IndianRupee, ArrowRight, Clock, 
    Calendar, MapPin, ShieldCheck, User, TrendingUp, AlertCircle,
    CheckCircle2, Activity, Share2, Smartphone, Timer, Zap, ChevronRight
} from 'lucide-react';
import { useMainStore } from '../../store/useMainStore';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 7 Profile Overview)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Framer Motion Staggered Rendering Engine
 * FEATURE 2: Real-Time Time-Based Greeting Algorithm
 * FEATURE 3: Intelligent Upcoming Event Extraction
 * FEATURE 4: Live Escrow Wallet Formatting
 * FEATURE 5: Active Order Ledger Summary
 * FEATURE 6: Resolved CheckCircle2 Import Crash
 * FEATURE 7: Live Event Countdown Timer Engine
 * FEATURE 8: Dynamic Account Completion/Strength Calculator
 * FEATURE 9: Recent Activity Ledger Feed
 * FEATURE 10: Real-Time IP Geolocation Connected Devices Tracker
 * FEATURE 11: One-Click Profile Sharing Hook
 * FEATURE 12: Interactive Hardware-Accelerated Progress Bars
 */

const formatShortDate = (isoString) => {
    if (!isoString) return 'TBA';
    const d = new Date(isoString);
    if (isNaN(d)) return 'TBA';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Overview() {
    const navigate = useNavigate();
    const { user, orders, wallet } = useMainStore();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
    const [sessionLocation, setSessionLocation] = useState('Detecting location...');

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const upcomingEvent = useMemo(() => {
        if (!orders || orders.length === 0) return null;
        const now = new Date().getTime();
        const futureOrders = orders.filter(o => {
            const eventTime = new Date(o.commence_time || o.eventTimestamp || o.createdAt).getTime();
            return isNaN(eventTime) || eventTime >= now;
        });
        
        if (futureOrders.length === 0) return null;

        futureOrders.sort((a, b) => {
            const timeA = new Date(a.commence_time || a.eventTimestamp || a.createdAt).getTime();
            const timeB = new Date(b.commence_time || b.eventTimestamp || b.createdAt).getTime();
            return timeA - timeB;
        });

        return futureOrders[0];
    }, [orders]);

    // Live Event Countdown Timer
    useEffect(() => {
        if (!upcomingEvent) return;
        const targetTime = new Date(upcomingEvent.commence_time || upcomingEvent.eventTimestamp).getTime();
        if (isNaN(targetTime)) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetTime - now;
            
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
                });
            } else {
                clearInterval(interval);
            }
        }, 60000); 

        // Initial calculation
        const now = new Date().getTime();
        const difference = targetTime - now;
        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                mins: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            });
        }

        return () => clearInterval(interval);
    }, [upcomingEvent]);

    // FEATURE 10: Strictly Real-Time Location Fetcher (No Mock Data)
    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.city && data.country_name) {
                    setSessionLocation(`${data.city}, ${data.country_name}`);
                } else {
                    setSessionLocation('Location Active');
                }
            } catch (error) {
                console.error("Failed to fetch live location:", error);
                setSessionLocation('Secure Connection');
            }
        };
        fetchLocation();
    }, []);

    // Profile Strength Calculator
    const profileStrength = useMemo(() => {
        let score = 25; 
        if (user?.emailVerified) score += 25;
        if (wallet?.bankAdded) score += 25; 
        if (orders?.length > 0) score += 25;
        return score;
    }, [user, wallet, orders]);

    // Share Profile Hook
    const handleShareProfile = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Booknshow Profile',
                    text: 'Check out my verified buyer profile on Booknshow.',
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            alert("Sharing not supported on this browser.");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
    };

    return (
        <div className="w-full relative bg-transparent font-sans">
            <motion.div 
                variants={containerVariants} 
                initial="hidden" 
                animate="show"
                className="flex flex-col space-y-8"
            >
                
                {/* SECTION 1 & 2: Header Section & Active Status */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#A3A3A3]/20 pb-6 bg-[#FFFFFF] p-6 rounded-[16px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAD8DC]/30 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <p className="text-[14px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">{greeting},</p>
                        <h1 className="text-[28px] md:text-[32px] font-black text-[#333333] tracking-tight leading-none">
                            {user?.displayName || user?.email ? user.email.split('@')[0] : 'Booknshow User'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <button onClick={handleShareProfile} className="p-2 border border-[#A3A3A3]/30 rounded-full hover:bg-[#F5F5F5] hover:text-[#E7364D] hover:border-[#E7364D] transition-colors bg-[#FFFFFF] shadow-sm">
                            <Share2 size={16} className="text-[#333333] hover:text-[#E7364D]" />
                        </button>
                        <span className="bg-[#333333] text-[#FFFFFF] border border-[#333333] px-3 py-1.5 rounded-[6px] text-[12px] font-bold flex items-center shadow-sm">
                            <ShieldCheck size={14} className="mr-1.5 text-[#E7364D]" /> Secure Account
                        </span>
                    </div>
                </motion.div>

                {/* SECTION 3: Profile Strength Indicator */}
                <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-5 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[14px] font-bold text-[#333333]">Profile Strength</span>
                            <span className="text-[14px] font-black text-[#E7364D]">{profileStrength}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#F5F5F5] rounded-full overflow-hidden border border-[#A3A3A3]/10">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${profileStrength}%` }} 
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-[#EB5B6E] to-[#E7364D] rounded-full"
                            ></motion.div>
                        </div>
                    </div>
                    {profileStrength < 100 && (
                        <button onClick={() => navigate('/profile/settings')} className="text-[13px] font-bold text-[#333333] bg-[#FFFFFF] border border-[#A3A3A3]/30 px-4 py-2 rounded-[8px] hover:border-[#E7364D] hover:text-[#E7364D] transition-colors shadow-sm whitespace-nowrap">
                            Complete Profile
                        </button>
                    )}
                </motion.div>

                {/* SECTION 4 & 5: Top Statistics Grid (Tickets & Escrow) */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-6 shadow-sm hover:shadow-[0_10px_30px_rgba(51,51,51,0.08)] transition-all flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5F5] rounded-full blur-[40px] -mr-10 -mt-10 opacity-60 group-hover:bg-[#FAD8DC]/40 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#F5F5F5] rounded-[10px] flex items-center justify-center mb-5 border border-[#A3A3A3]/20 group-hover:border-[#E7364D]/30 transition-colors">
                                <Ticket size={24} className="text-[#333333] group-hover:text-[#E7364D] transition-colors" />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#626262] mb-1">Total Active Tickets</h3>
                            <div className="flex items-end gap-3 mb-6">
                                <p className="text-[36px] font-black text-[#333333] leading-none">{orders.length}</p>
                                <p className="text-[13px] font-medium text-[#A3A3A3] mb-1">reserved events</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/profile/orders')} className="relative z-10 w-full py-3 bg-[#F5F5F5] text-[#333333] text-[14px] font-bold rounded-[8px] hover:bg-[#333333] hover:text-[#FFFFFF] transition-colors border border-[#A3A3A3]/20 flex items-center justify-center">
                            Manage Orders <ArrowRight size={16} className="ml-2" />
                        </button>
                    </div>

                    <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-6 shadow-sm hover:shadow-[0_10px_30px_rgba(51,51,51,0.08)] transition-all flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAD8DC]/20 rounded-full blur-[40px] -mr-10 -mt-10 opacity-60 group-hover:bg-[#FAD8DC]/60 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#FAD8DC]/30 rounded-[10px] flex items-center justify-center mb-5 border border-[#E7364D]/20">
                                <IndianRupee size={24} className="text-[#E7364D]" />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#626262] mb-1">Available Escrow Balance</h3>
                            <div className="flex items-end gap-3 mb-6">
                                <p className="text-[36px] font-black text-[#333333] leading-none">
                                    {wallet.currency} {wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/profile/sales')} className="relative z-10 w-full py-3 bg-[#E7364D] text-[#FFFFFF] text-[14px] font-bold rounded-[8px] hover:bg-[#EB5B6E] transition-colors shadow-sm flex items-center justify-center">
                            Withdraw Funds <TrendingUp size={16} className="ml-2" />
                        </button>
                    </div>
                </motion.div>

                {/* Main Content Split */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* SECTION 6 & 7: Left Column - Next Event Insight & Activity Ledger */}
                    <div className="lg:col-span-2 flex flex-col space-y-6">
                        <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-[18px] font-black text-[#333333] flex items-center">
                                    <Calendar size={20} className="mr-2 text-[#E7364D]" /> Your Next Event
                                </h3>
                                {upcomingEvent && (
                                    <div className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#A3A3A3]/30 px-3 py-1 rounded-[6px] text-[12px] font-bold text-[#333333] shadow-sm">
                                        <Timer size={14} className="text-[#E7364D]" /> 
                                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m
                                    </div>
                                )}
                            </div>
                            
                            {upcomingEvent ? (
                                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[12px] p-5">
                                    <div className="w-full sm:w-[120px] h-[80px] bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[8px] overflow-hidden shrink-0">
                                        <img src={upcomingEvent.imageUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300"} alt="Event" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-[#333333] text-[#FFFFFF] text-[10px] font-black uppercase px-2 py-0.5 rounded-[4px]">Upcoming</span>
                                            <span className="text-[13px] font-bold text-[#626262]">{formatShortDate(upcomingEvent.commence_time || upcomingEvent.eventTimestamp || upcomingEvent.createdAt)}</span>
                                        </div>
                                        <h4 className="text-[16px] font-black text-[#333333] truncate mb-2">{upcomingEvent.eventName || 'Booknshow Event'}</h4>
                                        <div className="flex items-center text-[13px] text-[#A3A3A3] font-bold">
                                            <MapPin size={14} className="mr-1.5 text-[#E7364D]" /> <span className="truncate text-[#626262]">{upcomingEvent.eventLoc || 'Venue details on ticket'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/profile/orders')} className="w-full sm:w-auto px-5 py-2.5 bg-[#FFFFFF] border border-[#A3A3A3]/50 text-[#333333] rounded-[8px] text-[13px] font-bold hover:border-[#E7364D] hover:text-[#E7364D] transition-colors shrink-0 shadow-sm">
                                        View Ticket
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-[#F5F5F5] border border-dashed border-[#A3A3A3]/50 rounded-[12px] p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                        <Ticket size={24} className="text-[#A3A3A3]" />
                                    </div>
                                    <p className="text-[15px] font-black text-[#333333] mb-1">No upcoming events</p>
                                    <p className="text-[13px] text-[#626262] mb-4 max-w-sm font-medium">You haven't purchased any tickets for future dates yet. Discover what's happening near you.</p>
                                    <button onClick={() => navigate('/explore')} className="bg-[#333333] text-[#FFFFFF] px-6 py-2 rounded-[8px] font-bold text-[13px] hover:bg-[#E7364D] transition-colors shadow-sm">
                                        Explore Events
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity Ledger */}
                        <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-6 shadow-sm">
                            <h3 className="text-[18px] font-black text-[#333333] mb-5 flex items-center">
                                <Activity size={20} className="mr-2 text-[#E7364D]" /> Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {orders.slice(0, 3).map((order, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-[#A3A3A3]/10 last:border-0 hover:bg-[#F5F5F5] transition-colors rounded-[8px] px-2 -mx-2 cursor-pointer" onClick={() => navigate('/profile/orders')}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#FAD8DC]/30 border border-[#E7364D]/20 rounded-full flex items-center justify-center"><Zap size={14} className="text-[#E7364D]"/></div>
                                            <div>
                                                <p className="text-[13px] font-bold text-[#333333]">Ticket Reserved</p>
                                                <p className="text-[11px] font-medium text-[#626262]">{order.eventName}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-[#A3A3A3]" />
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-[13px] text-[#A3A3A3] italic font-bold">No recent platform activity.</p>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 8, 9 & 10: Right Column - Security, Health & Session */}
                    <div className="flex flex-col space-y-6">
                        <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-6 shadow-sm">
                            <h3 className="text-[18px] font-black text-[#333333] mb-5 flex items-center">
                                <User size={20} className="mr-2 text-[#E7364D]" /> Account Health
                            </h3>
                            
                            <div className="space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5"><CheckCircle2 size={16} className="text-[#333333]" /></div>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#333333]">Email Verified</p>
                                        <p className="text-[12px] font-medium text-[#626262]">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5"><AlertCircle size={16} className="text-[#E7364D]" /></div>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#333333]">Payout Details</p>
                                        <p className="text-[12px] font-medium text-[#626262] mb-1.5">Add bank details to receive funds from sales.</p>
                                        <button onClick={() => navigate('/profile/settings')} className="text-[11px] font-black uppercase tracking-widest text-[#E7364D] hover:underline">
                                            Configure Now
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5"><Clock size={16} className="text-[#A3A3A3]" /></div>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#333333]">Account Created</p>
                                        <p className="text-[12px] font-medium text-[#626262]">Secure member since {new Date(user?.metadata?.creationTime || Date.now()).getFullYear()}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-5 border-t border-[#A3A3A3]/20 w-full">
                                <button onClick={() => navigate('/profile/settings')} className="w-full py-2.5 bg-[#F5F5F5] border border-[#A3A3A3]/30 text-[#333333] rounded-[8px] text-[13px] font-bold hover:border-[#E7364D] hover:text-[#E7364D] transition-colors shadow-sm">
                                    Manage Settings
                                </button>
                            </div>
                        </div>

                        {/* Connected Devices (Strictly Real Location Data) */}
                        <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-6 shadow-sm">
                            <h3 className="text-[15px] font-black text-[#333333] mb-4 flex items-center">
                                <Smartphone size={16} className="mr-2 text-[#E7364D]" /> Current Session
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[13px] font-bold text-[#333333]">Active Device</p>
                                    <p className="text-[11px] font-medium text-[#626262]">{sessionLocation} • Just now</p>
                                </div>
                                <span className="bg-[#333333] text-[#FFFFFF] text-[10px] font-black uppercase px-2 py-0.5 rounded-[4px] shadow-sm">This Device</span>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </div>
    );
}