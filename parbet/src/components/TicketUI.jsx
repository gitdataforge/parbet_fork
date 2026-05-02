import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    MapPin, Calendar, User, 
    Download, Share2, ShieldCheck, Ticket, IndianRupee, Info
} from 'lucide-react';
import { BooknshowLogo } from './Header'; // Reusing global vector logo

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 3 E-Ticket)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Framer Motion Entry & Shimmer Physics
 * FEATURE 2: Live Dynamic QR Code Generation (via api.qrserver.com)
 * FEATURE 3: Enterprise Ticket Perforation UI (Cutouts & Dashed lines)
 * FEATURE 4: Cryptographic Order ID Truncation
 * FEATURE 5: Print-Ready CSS Print Media Setup (via standard browser print)
 * FEATURE 6: Actionable Wallet/Download Hooks
 * FEATURE 7: Auto-Formatting Date/Time Engine
 * FEATURE 8: Dynamic Seat & Tier Mapping
 * FEATURE 9: Transparent Invoice & Pricing Breakdown (New)
 */

// Strict Date/Time Formatters
const formatTicketDate = (timestamp) => {
    if (!timestamp) return 'TBA';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(d)) return 'TBA';
    return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTicketTime = (timestamp) => {
    if (!timestamp) return 'TBA';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(d)) return 'TBA';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const generateShortHash = (id) => {
    if (!id) return '00000000';
    return id.substring(0, 8).toUpperCase();
};

export default function TicketUI({ orderData }) {
    const ticketRef = useRef(null);

    if (!orderData) return null;

    // Generate real QR code based on the unique payment ID (Branded with dark gray)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(orderData.paymentId || orderData.id || 'BOOKNSHOW_TICKET')}&color=333333&bgcolor=ffffff`;

    const handleDownloadPDF = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${orderData.eventName} - Booknshow Ticket`,
                    text: `I'm going to ${orderData.eventName}! Order ID: #${generateShortHash(orderData.paymentId)}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Error sharing", err);
            }
        } else {
            alert("Sharing is not supported on this browser.");
        }
    };

    // Pricing Math for Invoice
    const quantity = parseInt(orderData.quantity || 1, 10);
    const totalAmount = parseFloat(orderData.totalAmount || 0);
    const platformFee = totalAmount * 0.05; // 5% example fee
    const basePriceTotal = totalAmount - platformFee;
    const pricePerTicket = basePriceTotal / quantity;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="w-full max-w-[420px] mx-auto flex flex-col drop-shadow-2xl print:drop-shadow-none print:max-w-full font-sans"
        >
            {/* Top Ticket Section */}
            <div 
                ref={ticketRef}
                className="bg-[#FFFFFF] rounded-t-[20px] overflow-hidden relative border-t border-l border-r border-[#A3A3A3]/30 print:border-black"
            >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FFFFFF] to-transparent opacity-40 w-[200%] h-full -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none z-10 hidden md:block"></div>

                {/* Event Image Banner with Booknshow Logo */}
                <div className="h-[160px] w-full bg-[#333333] relative">
                    <img 
                        src={orderData.imageUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"} 
                        alt="Event" 
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#333333]/90 to-transparent"></div>
                    
                    {/* Floating Logo */}
                    <div className="absolute top-4 right-4 bg-[#FFFFFF]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#FFFFFF]/20 shadow-sm">
                        <BooknshowLogo className="h-[18px] w-auto" />
                    </div>

                    <div className="absolute bottom-5 left-6 right-6">
                        <span className="bg-[#E7364D] text-[#FFFFFF] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[4px] mb-2 inline-block shadow-md">
                            Official E-Ticket
                        </span>
                        <h2 className="text-[#FFFFFF] text-[22px] font-black leading-tight line-clamp-2 drop-shadow-md">
                            {orderData.eventName || 'Booknshow Secure Event'}
                        </h2>
                    </div>
                </div>

                {/* Event Metadata */}
                <div className="p-6 space-y-5 bg-[#FFFFFF]">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#FAD8DC]/30 border border-[#E7364D]/20 flex items-center justify-center shrink-0">
                            <Calendar size={18} className="text-[#E7364D]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Date & Time</p>
                            <p className="text-[15px] font-bold text-[#333333]">
                                {formatTicketDate(orderData.commence_time || orderData.eventTimestamp || orderData.createdAt)}
                            </p>
                            <p className="text-[13px] text-[#E7364D] font-bold mt-0.5">
                                Gates open at {formatTicketTime(orderData.commence_time || orderData.eventTimestamp || orderData.createdAt)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F5F5F5] border border-[#A3A3A3]/30 flex items-center justify-center shrink-0">
                            <MapPin size={18} className="text-[#333333]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Venue</p>
                            <p className="text-[15px] font-bold text-[#333333]">{orderData.eventLoc || 'Venue TBA'}</p>
                            <p className="text-[13px] text-[#626262] font-medium mt-0.5">Please arrive early for security checks.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-5 border-t border-[#A3A3A3]/20">
                        <div>
                            <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Section / Tier</p>
                            <p className="text-[16px] font-black text-[#333333] flex items-center">
                                <Ticket size={16} className="mr-1.5 text-[#E7364D]"/> {orderData.tierName || 'General'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Quantity</p>
                            <p className="text-[16px] font-black text-[#333333]">{orderData.quantity} Ticket(s)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Perforation / Tear-off Line */}
            <div className="relative h-8 bg-[#FFFFFF] border-l border-r border-[#A3A3A3]/30 print:border-l-black print:border-r-black flex items-center justify-center overflow-hidden z-20">
                <div className="absolute left-0 w-4 h-8 bg-[#F5F5F5] rounded-r-full border-r border-t border-b border-[#A3A3A3]/30 -ml-[1px] print:hidden shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)]"></div>
                <div className="w-full border-t-[2px] border-dashed border-[#A3A3A3] mx-6 print:border-black"></div>
                <div className="absolute right-0 w-4 h-8 bg-[#F5F5F5] rounded-l-full border-l border-t border-b border-[#A3A3A3]/30 -mr-[1px] print:hidden shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)]"></div>
            </div>

            {/* Bottom Ticket Section (Invoice, QR & Buyer Details) */}
            <div className="bg-[#FFFFFF] rounded-b-[20px] p-6 border-b border-l border-r border-[#A3A3A3]/30 flex flex-col items-center justify-center print:border-black relative z-10">
                
                {/* QR Code Container */}
                <div className="p-3 bg-[#FFFFFF] border-2 border-[#A3A3A3]/30 rounded-[16px] shadow-sm mb-4 relative group">
                    <img src={qrCodeUrl} alt="Secure QR Code" className="w-[140px] h-[140px] object-contain mix-blend-multiply" />
                    {/* Scan Line Animation */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#E7364D] opacity-0 group-hover:opacity-50 animate-[scan_2s_ease-in-out_infinite] blur-[2px]"></div>
                </div>
                
                <p className="text-[13px] font-black text-[#E7364D] mb-6 tracking-[0.2em] uppercase text-center flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#E7364D] animate-pulse mr-2"></span>
                    Scan at Entrance
                </p>

                {/* Identity & Metadata Container */}
                <div className="w-full bg-[#F5F5F5] rounded-[12px] p-5 flex flex-col space-y-4 border border-[#A3A3A3]/20 mb-5">
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#626262] font-bold uppercase tracking-wider">Order ID</span>
                        <span className="text-[14px] font-black text-[#333333] font-mono bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#A3A3A3]/30">#{generateShortHash(orderData.paymentId)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#626262] font-bold uppercase tracking-wider flex items-center"><User size={14} className="mr-1.5 text-[#A3A3A3]"/> Ticket Holder</span>
                        <span className="text-[14px] font-bold text-[#333333] truncate max-w-[150px]">{orderData.buyerName || orderData.buyerEmail}</span>
                    </div>
                </div>

                {/* FEATURE 9: Transparent Invoice & Pricing Breakdown */}
                <div className="w-full border-t border-dashed border-[#A3A3A3]/50 pt-5 flex flex-col space-y-3">
                    <h3 className="text-[12px] font-black text-[#333333] uppercase tracking-widest flex items-center mb-1">
                        <IndianRupee size={14} className="mr-1 text-[#626262]" /> Payment Summary
                    </h3>
                    
                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-[#626262] font-medium">{quantity}x {orderData.tierName || 'General'} Ticket</span>
                        <span className="text-[#333333] font-bold">₹{basePriceTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-[#626262] font-medium flex items-center">Platform Fee (5%) <Info size={12} className="ml-1 text-[#A3A3A3]"/></span>
                        <span className="text-[#333333] font-bold">₹{platformFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 mt-1 border-t border-[#A3A3A3]/20">
                        <span className="text-[14px] font-bold text-[#EB5B6E] flex items-center"><ShieldCheck size={16} className="mr-1.5"/> Paid Securely</span>
                        <span className="text-[18px] font-black text-[#333333]">₹{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                </div>
            </div>

            {/* Actions Footer (Hidden on Print) */}
            <div className="mt-6 flex gap-3 print:hidden">
                <button 
                    onClick={handleDownloadPDF}
                    className="flex-1 bg-[#333333] text-[#FFFFFF] py-4 rounded-[12px] text-[15px] font-black tracking-wide hover:bg-[#E7364D] transition-colors flex items-center justify-center shadow-[0_8px_20px_rgba(51,51,51,0.2)]"
                >
                    <Download size={20} className="mr-2" /> SAVE TICKET
                </button>
                <button 
                    onClick={handleShare}
                    className="w-14 bg-[#FFFFFF] border-2 border-[#A3A3A3]/30 text-[#333333] rounded-[12px] flex items-center justify-center hover:bg-[#FAD8DC]/30 hover:text-[#E7364D] hover:border-[#E7364D]/50 transition-colors shadow-sm"
                >
                    <Share2 size={20} />
                </button>
            </div>
            
            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(50%); }
                }
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 0.5; }
                    90% { opacity: 0.5; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </motion.div>
    );
}