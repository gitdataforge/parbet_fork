import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Package, Calendar, MapPin, Loader2, AlertCircle, CheckCircle2, Ticket, Repeat } from 'lucide-react';
import { useMainStore } from '../../store/useMainStore';

/**
 * FEATURE 1: 1:1 Parbet Replica Empty State (Strict match to image_7e6838.png)
 * FEATURE 2: Current vs Past Dynamic Tab Routing Algorithm
 * FEATURE 3: Real-Time Order Hydration from Global Store
 * FEATURE 4: Hardware-Accelerated Tab Switching
 * FEATURE 5: Dynamic Order Rendering with E-Ticket triggers
 */

const formatDate = (isoString) => {
    if (!isoString) return 'Date TBA';
    const d = new Date(isoString);
    if (isNaN(d)) return 'Date TBA';
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Orders() {
    // FEATURE 1: State Management for 1:1 Sub-Tabs
    const [activeTab, setActiveTab] = useState('Current');
    
    // FEATURE 2: Real-Time Data Extraction
    const { orders, isLoadingOrders } = useMainStore();

    // FEATURE 3: Logical Data Filtering (Production Rules for Current vs Past)
    const filteredOrders = useMemo(() => {
        const now = new Date().getTime();
        return orders.filter(order => {
            const eventTime = new Date(order.commence_time || order.eventTimestamp || order.createdAt).getTime();
            const isPast = !isNaN(eventTime) && eventTime < now;
            
            if (activeTab === 'Current') {
                return !isPast;
            } else {
                return isPast;
            }
        });
    }, [orders, activeTab]);

    // FEATURE 4: Staggered Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans pb-20 pt-2"
        >
            {/* FEATURE 5: Strict Typography & Header Mapping */}
            <motion.h1 
                variants={itemVariants}
                className="text-[32px] font-black text-[#1a1a1a] mb-6 tracking-tighter leading-tight px-6 md:px-8"
            >
                Orders
            </motion.h1>
            
            {/* FEATURE 6: Interactive Tab Navigation Logic (Matches Screenshot Exactly) */}
            <motion.div variants={itemVariants} className="flex border-b border-[#e2e2e2] mb-8 px-6 md:px-8">
                {['Current', 'Past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-1 mr-8 text-[15px] font-bold transition-all relative ${
                            activeTab === tab 
                            ? 'text-[#427A1A]' 
                            : 'text-gray-500 hover:text-[#1a1a1a]'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#427A1A]"></div>
                        )}
                    </button>
                ))}
            </motion.div>

            <div className="px-6 md:px-8">
                {/* FEATURE 7: Real-Time Loading State Logic */}
                {isLoadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white">
                        <Loader2 className="animate-spin text-[#427A1A] mb-4" size={32} />
                        <p className="text-[#54626c] font-medium text-[14px]">Fetching order manifest...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    /* FEATURE 8: Populated Orders List (Real Logic) */
                    <div className="space-y-6">
                        <AnimatePresence>
                            {filteredOrders.map((order) => {
                                const isPending = order.status === 'pending_approval' || order.paymentMethod === 'bank_transfer';
                                return (
                                    <motion.div 
                                        key={order.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white border border-[#e2e2e2] rounded-[12px] overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
                                    >
                                        <div className={`px-5 py-2.5 flex items-center justify-between border-b ${isPending ? 'bg-orange-50 border-orange-100' : 'bg-[#f0f9f0] border-[#d4edda]'}`}>
                                            <div className="flex items-center gap-2">
                                                {isPending ? <AlertCircle size={16} className="text-orange-600" /> : <CheckCircle2 size={16} className="text-[#427A1A]" />}
                                                <span className={`text-[12px] font-black uppercase tracking-widest ${isPending ? 'text-orange-700' : 'text-[#427A1A]'}`}>
                                                    {isPending ? 'Reviewing Payment Proof' : 'Order Confirmed'}
                                                </span>
                                            </div>
                                            <span className="text-[12px] font-mono text-gray-500">
                                                Order #{order.paymentId ? order.paymentId.substring(0,8).toUpperCase() : order.id.substring(0,8).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 flex flex-col justify-between space-y-4">
                                                <div>
                                                    <h3 className="text-[18px] font-black text-[#1a1a1a] leading-tight mb-2">{order.eventName || 'Parbet Event'}</h3>
                                                    <div className="flex items-center text-[13px] text-[#54626c] font-medium mb-1">
                                                        <Calendar size={14} className="mr-2 text-gray-400" /> {formatDate(order.commence_time || order.eventTimestamp || order.createdAt)}
                                                    </div>
                                                    <div className="flex items-center text-[13px] text-[#54626c] font-medium">
                                                        <MapPin size={14} className="mr-2 text-gray-400" /> {order.eventLoc || 'Venue TBA'}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                                                    <button disabled={isPending} className={`px-5 py-2 rounded-[8px] text-[13px] font-bold transition-colors shadow-sm flex items-center ${isPending ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#427A1A] text-white hover:bg-[#2F6114]'}`}>
                                                        <Ticket size={16} className="mr-2" /> View E-Ticket
                                                    </button>
                                                    <button className="px-5 py-2 bg-white border border-[#e2e2e2] text-[#1a1a1a] text-[13px] font-bold rounded-[8px] hover:bg-gray-50 flex items-center shadow-sm">
                                                        <Repeat size={16} className="mr-2" /> Resell
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-[220px] bg-gray-50 rounded-[8px] border border-gray-100 p-4 flex flex-col justify-between">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Section / Tier</p>
                                                        <p className="text-[14px] font-bold text-[#1a1a1a]">{order.tierName || 'General Admission'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Quantity</p>
                                                        <p className="text-[14px] font-bold text-[#1a1a1a]">{order.quantity} Tickets</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* FEATURE 9 & 10: 1:1 Replica Troubleshooting & Empty State Mapping */
                    <motion.div variants={itemVariants} className="w-full flex flex-col">
                        <div className="w-full max-w-[800px] border border-[#e2e2e2] rounded-[8px] p-8 mb-10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-6">Don't see your orders? Here's what you can do:</h3>
                            
                            <div className="space-y-8">
                                <section>
                                    <p className="text-[14px] font-bold text-[#1a1a1a] mb-4">Check your email address</p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start text-[14px] text-[#1a1a1a] leading-normal">
                                            <ChevronRight size={18} className="text-[#458731] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                            Ensure the email used for purchase matches the email on this account
                                        </li>
                                        <li className="flex items-start text-[14px] text-[#1a1a1a] leading-normal">
                                            <ChevronRight size={18} className="text-[#458731] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                            If different, sign out and sign back in with the correct email
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <p className="text-[14px] font-bold text-[#1a1a1a] mb-4">If the email on this account is correct, you might have checked out as a guest</p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start text-[14px] text-[#1a1a1a] leading-normal">
                                            <ChevronRight size={18} className="text-[#458731] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                            Find your Guest Access Code in the order confirmation email
                                        </li>
                                        <li className="flex items-start text-[14px] text-[#1a1a1a] leading-normal">
                                            <ChevronRight size={18} className="text-[#458731] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                            Sign out, click 'Sign In', and select 'Guest Purchase? Find your order'
                                        </li>
                                        <li className="flex items-start text-[14px] text-[#1a1a1a] leading-normal">
                                            <ChevronRight size={18} className="text-[#458731] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                            Enter your email and access code to view your order
                                        </li>
                                    </ul>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}