import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    ShieldCheck, 
    AlertTriangle, 
    Ticket, 
    X, 
    Lock,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';

/**
 * FEATURE 1: Floating Persistent DOM Injection (Z-Index 50)
 * FEATURE 2: High-Precision Synchronized Countdown Engine
 * FEATURE 3: Dynamic Threat Color-Coding (Turns Red at < 2 minutes)
 * FEATURE 4: Explicit Inventory Release Protocol (cancelReservation)
 * FEATURE 5: Two-Step Cancellation Verification Modal
 * FEATURE 6: Framer Motion Hardware-Accelerated Transforms
 * FEATURE 7: Collapsible HUD (Minimizes to save screen real estate)
 * FEATURE 8: Session Cryptographic ID Display
 * FEATURE 9: Real-time Ticket Metadata Binding
 * FEATURE 10: Escrow Trust Badge Integrations
 * FEATURE 11: Responsive Docking (Bottom mobile, Top-Right desktop)
 */

export default function LockStatusOverlay() {
    const navigate = useNavigate();
    
    // Global Security State
    const { 
        isCheckoutLocked, 
        checkoutExpiration, 
        cancelReservation, 
        reservedListing,
        checkoutSessionId
    } = useAppStore();

    // Local UI States
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // FEATURE 2 & 3: Precision Countdown & Threat Color-Coding
    useEffect(() => {
        if (!isCheckoutLocked || !checkoutExpiration) return;

        const interval = setInterval(() => {
            const diff = checkoutExpiration - Date.now();
            
            // Auto-trigger cancellation if timer expires organically
            if (diff <= 0) {
                clearInterval(interval);
                handleExecuteCancel();
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            
            setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
            
            // Trigger Urgency Mode at 2 minutes remaining
            if (mins < 2 && !isUrgent) {
                setIsUrgent(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [checkoutExpiration, isCheckoutLocked, isUrgent]);

    // FEATURE 4: Explicit Release Protocol
    const handleExecuteCancel = () => {
        const eventId = reservedListing?.eventId;
        cancelReservation();
        setShowCancelConfirm(false);
        // Route back to event or home based on available data
        if (eventId) {
            navigate(`/event?id=${eventId}`);
        } else {
            navigate('/');
        }
    };

    // Do not render if the system is not locked
    if (!isCheckoutLocked || !reservedListing) return null;

    return (
        <>
            {/* FEATURE 1 & 11: Floating HUD Container */}
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:top-28 md:bottom-auto z-50 flex flex-col items-end pointer-events-none"
            >
                <div className={`w-full md:w-[340px] pointer-events-auto bg-white/95 backdrop-blur-xl border-[2px] rounded-[24px] shadow-2xl overflow-hidden transition-colors duration-500 ${isUrgent ? 'border-red-500 shadow-red-500/20' : 'border-[#1a1a1a] shadow-[#1a1a1a]/10'}`}>
                    
                    {/* Header Strip */}
                    <div 
                        onClick={() => setIsMinimized(!isMinimized)}
                        className={`px-5 py-3 flex items-center justify-between cursor-pointer transition-colors ${isUrgent ? 'bg-red-500 text-white' : 'bg-[#1a1a1a] text-white'}`}
                    >
                        <div className="flex items-center gap-2.5">
                            {isUrgent ? <AlertTriangle size={18} className="animate-pulse" /> : <Lock size={18} />}
                            <span className="font-black text-[13px] uppercase tracking-widest">
                                {isUrgent ? 'Expiring Soon' : 'Session Locked'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-mono font-black text-[16px] tracking-tight">{timeLeft}</span>
                            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                    </div>

                    {/* FEATURE 7: Collapsible Body */}
                    <AnimatePresence>
                        {!isMinimized && (
                            <motion.div 
                                initial={{ height: 0 }} 
                                animate={{ height: 'auto' }} 
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-white"
                            >
                                <div className="p-5 space-y-4">
                                    {/* Real-time Ticket Binding */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-[12px] bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                                            <Ticket size={24} className="text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[14px] font-black text-[#1a1a1a] leading-tight truncate">
                                                {reservedListing.eventName}
                                            </h4>
                                            <p className="text-[12px] font-bold text-[#8cc63f] mt-0.5 uppercase tracking-wide">
                                                {reservedListing.tierName} • x{reservedListing.quantity}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-mono mt-1">
                                                ID: {checkoutSessionId?.slice(0, 12)}...
                                            </p>
                                        </div>
                                    </div>

                                    {/* Security Badge */}
                                    <div className="flex items-center gap-2 bg-[#f8f9fa] border border-gray-100 p-2.5 rounded-[10px]">
                                        <ShieldCheck size={16} className="text-[#8cc63f] shrink-0" />
                                        <p className="text-[11px] font-bold text-gray-500 leading-tight">
                                            Inventory secured. Leaving this page without paying releases tickets to the public.
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2">
                                        <button 
                                            onClick={() => setShowCancelConfirm(true)}
                                            className="w-full py-2.5 rounded-[10px] border-2 border-gray-200 text-[#1a1a1a] font-black text-[13px] uppercase tracking-widest hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            Release Tickets
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* FEATURE 5: Two-Step Cancellation Verification Modal */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="bg-white rounded-[28px] p-8 max-w-[400px] w-full shadow-2xl border border-red-50 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                                <X className="text-red-500" size={40} />
                            </div>
                            <h2 className="text-[22px] font-black text-[#1a1a1a] mb-2">Are you sure?</h2>
                            <p className="text-[#54626c] font-medium text-[14px] mb-8 leading-relaxed px-4">
                                Canceling will immediately remove your hold on these tickets. You may not be able to get them back.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => setShowCancelConfirm(false)} 
                                    className="w-full bg-[#1a1a1a] text-white font-black py-4 rounded-[14px] shadow-lg hover:bg-black transition-colors"
                                >
                                    Resume Checkout
                                </button>
                                <button 
                                    onClick={handleExecuteCancel} 
                                    className="w-full bg-white text-red-600 border-[2px] border-red-100 font-black py-3.5 rounded-[14px] hover:bg-red-50 hover:border-red-200 transition-colors uppercase tracking-widest text-[13px]"
                                >
                                    Confirm Release
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}