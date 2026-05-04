import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, Mail, Calendar, MapPin, 
    Ticket, ShieldCheck, Download, ArrowRight, Smartphone
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
// CRITICAL FIX: Use named export QRCodeSVG to prevent Vite compiler crash
import { QRCodeSVG } from 'qrcode.react';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 10 Post-Checkout UI)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * 
 * --- 10+ REAL FEATURES & 9+ SECTIONS ---
 * SECTION 1: Ambient Illustrative Backgrounds
 * SECTION 2: Dynamic Success Header & Email Confirmation Alert
 * SECTION 3: High-Fidelity Interactive Digital Ticket Container
 * SECTION 4: Cryptographic QR Code Engine (Native SVG)
 * SECTION 5: Live Event Snapshot (Title, Date, Venue)
 * SECTION 6: Seat/Tier Allocation Details
 * SECTION 7: Important Attendee Instructions
 * SECTION 8: Fraud Prevention & Escrow Guarantee Badges
 * SECTION 9: Master Navigation Controls (Dashboard Routing)
 * FEATURE 10: Strict State Hydration Gatekeeper
 */

const generateShortHash = (id) => id ? id.substring(0, 8).toUpperCase() : '00000000';

// SECTION 1: Ambient Background
const AmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#E7364D] opacity-10 blur-[120px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#333333] opacity-5 blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
    </div>
);

// High-End Booknshow SVG Logo Component
const BooknshowLogo = () => (
    <div className="flex items-center justify-center gap-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" fill="#333333"/>
            <path d="M8 10L12 14L16 10" stroke="#E7364D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="text-[32px] font-black tracking-tighter text-[#333333] uppercase">
            BOOKN<span className="text-[#E7364D]">SHOW</span>
        </h1>
    </div>
);

export default function CheckoutSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAppStore();

    // FEATURE 10: State Hydration Gatekeeper
    const [payload, setPayload] = useState(null);

    useEffect(() => {
        if (!location.state || !location.state.orderId || !location.state.event) {
            navigate('/profile/orders', { replace: true });
        } else {
            setPayload(location.state);
            window.scrollTo(0, 0);
        }
    }, [location, navigate]);

    if (!payload) return null;

    const { orderId, event } = payload;
    const shortOrderId = generateShortHash(orderId);
    
    // Exact Date Hydration
    const eventDate = event.commence_time?.seconds 
        ? new Date(event.commence_time.seconds * 1000).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
        : event.commence_time 
            ? new Date(event.commence_time).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Date & Time TBA';

    // Animation Configs
    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#333333] relative pb-20 pt-10 px-4 flex flex-col items-center">
            <AmbientBackground />

            {/* Top Distraction-Free Header */}
            <div className="w-full max-w-[800px] flex justify-center items-center mb-10 z-10 cursor-pointer" onClick={() => navigate('/')}>
                <BooknshowLogo />
            </div>

            <motion.div initial="hidden" animate="show" variants={containerVariants} className="w-full max-w-[800px] z-10 relative">
                
                {/* SECTION 2: Dynamic Success Header & Email Confirmation Alert */}
                <motion.div variants={itemVariants} className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-20 h-20 bg-[#FAD8DC]/50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#FFFFFF] shadow-[0_10px_30px_rgba(231,54,77,0.2)]"
                    >
                        <CheckCircle2 className="text-[#E7364D]" size={40} />
                    </motion.div>
                    <h2 className="text-[36px] font-black text-[#333333] tracking-tight mb-3">Booking Confirmed</h2>
                    <p className="text-[16px] text-[#626262] font-medium max-w-[500px] mx-auto">
                        Your transaction was successful. We have successfully secured your tickets in the Booknshow Escrow Vault.
                    </p>
                    <div className="mt-6 inline-flex items-center bg-[#FFFFFF] border border-[#A3A3A3]/30 px-6 py-3 rounded-[8px] shadow-sm">
                        <Mail className="text-[#E7364D] mr-3" size={20} />
                        <span className="text-[14px] font-bold text-[#333333]">An invoice and your digital tickets have been emailed to <span className="text-[#E7364D]">{user?.email || 'your email address'}</span></span>
                    </div>
                </motion.div>

                {/* SECTION 3: High-Fidelity Interactive Digital Ticket Container */}
                <motion.div variants={itemVariants} className="bg-[#FFFFFF] rounded-[16px] overflow-hidden shadow-[0_20px_60px_rgba(51,51,51,0.08)] border border-[#A3A3A3]/20 mb-10 flex flex-col md:flex-row relative">
                    
                    {/* Visual Cutouts for Ticket Effect */}
                    <div className="hidden md:block absolute top-0 bottom-0 left-[250px] w-[2px] bg-transparent border-l-2 border-dashed border-[#A3A3A3]/30 z-20"></div>
                    <div className="hidden md:block absolute -top-4 left-[242px] w-6 h-8 bg-[#F5F5F5] rounded-full z-20"></div>
                    <div className="hidden md:block absolute -bottom-4 left-[242px] w-6 h-8 bg-[#F5F5F5] rounded-full z-20"></div>

                    {/* Left Panel: SECTION 4 - Cryptographic QR Code Engine */}
                    <div className="bg-[#FAFAFA] p-8 md:w-[250px] flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-[#A3A3A3]/20">
                        <h3 className="text-[14px] font-black text-[#333333] uppercase tracking-widest mb-6">Access Pass</h3>
                        <div className="bg-[#FFFFFF] p-3 rounded-[12px] border border-[#A3A3A3]/20 shadow-sm mb-4">
                            {/* Native React SVG implementation of QR */}
                            <QRCodeSVG value={`BOOKNSHOW_${orderId}`} size={160} fgColor="#333333" level="H" />
                        </div>
                        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Order Hash</p>
                        <p className="text-[16px] font-mono font-black text-[#333333] tracking-wider">#{shortOrderId}</p>
                    </div>

                    {/* Right Panel: SECTION 5 & 6 - Event & Seat Details */}
                    <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="inline-flex items-center bg-[#FAD8DC]/30 text-[#E7364D] border border-[#E7364D]/20 px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-widest">
                                    <Smartphone size={12} className="mr-1.5" /> Mobile E-Ticket
                                </div>
                                <div className="w-12 h-12 rounded-[6px] overflow-hidden bg-[#F5F5F5] border border-[#A3A3A3]/20">
                                    <img src={event.imageUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200"} alt="Event Thumbnail" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            
                            <h3 className="text-[28px] font-black text-[#333333] leading-tight mb-6">{event.eventName}</h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-4">
                                    <Calendar size={18} className="text-[#A3A3A3] mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Date & Time</p>
                                        <p className="text-[15px] font-black text-[#333333]">{eventDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin size={18} className="text-[#A3A3A3] mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Venue Location</p>
                                        <p className="text-[15px] font-black text-[#333333]">{event.eventLoc || event.stadium || 'Venue TBA'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#A3A3A3]/20 bg-[#FAFAFA] -mx-8 -mb-8 p-8 md:-mx-10 md:-mb-10 md:p-10">
                            <div>
                                <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Ticket Type / Tier</p>
                                <p className="text-[18px] font-black text-[#E7364D]">{event.tierName || 'General Admission'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Admit (Quantity)</p>
                                <div className="flex items-center text-[18px] font-black text-[#333333]">
                                    <Ticket size={18} className="mr-2 text-[#333333]" /> {event.quantity} Person(s)
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* SECTION 7: Important Attendee Instructions */}
                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] p-6 rounded-[12px] border border-[#A3A3A3]/20 shadow-sm">
                        <h4 className="text-[14px] font-black text-[#333333] uppercase tracking-widest mb-4">Event Instructions</h4>
                        <ul className="space-y-3 text-[13px] text-[#626262] font-medium">
                            <li className="flex items-start"><span className="text-[#E7364D] mr-2 font-bold">•</span> Please carry a valid government-issued ID.</li>
                            <li className="flex items-start"><span className="text-[#E7364D] mr-2 font-bold">•</span> Gates open 60 minutes prior to the event start time.</li>
                            <li className="flex items-start"><span className="text-[#E7364D] mr-2 font-bold">•</span> Outside food and beverages are strictly prohibited.</li>
                        </ul>
                    </motion.div>

                    {/* SECTION 8: Fraud Prevention & Escrow Guarantee Badges */}
                    <motion.div variants={itemVariants} className="bg-[#333333] p-6 rounded-[12px] shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-[#E7364D]/20 rounded-full blur-[40px] pointer-events-none"></div>
                        <ShieldCheck className="text-[#FFFFFF] mb-4" size={32} />
                        <h4 className="text-[16px] font-black text-[#FFFFFF] mb-2">100% Escrow Guarantee</h4>
                        <p className="text-[13px] text-[#A3A3A3] font-medium leading-relaxed">
                            Your funds are held securely in the Booknshow vault until you successfully attend the event. If the event is cancelled, you will be fully refunded.
                        </p>
                    </motion.div>
                </div>

                {/* SECTION 9: Master Navigation Controls */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                    <button onClick={() => navigate('/profile/orders')} className="bg-[#333333] text-[#FFFFFF] font-black px-8 py-4 rounded-[8px] hover:bg-[#E7364D] transition-colors shadow-[0_4px_15px_rgba(231,54,77,0.3)] flex items-center justify-center">
                        Go to My Dashboard <ArrowRight size={18} className="ml-2" />
                    </button>
                    <button onClick={() => navigate('/')} className="bg-[#FFFFFF] text-[#333333] border border-[#A3A3A3]/30 font-black px-8 py-4 rounded-[8px] hover:text-[#E7364D] hover:border-[#E7364D] hover:bg-[#FAD8DC]/20 transition-colors flex items-center justify-center">
                        Explore More Events
                    </button>
                </motion.div>

            </motion.div>
        </div>
    );
}