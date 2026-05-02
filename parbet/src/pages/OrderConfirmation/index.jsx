import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, Ticket, MessageCircle, 
    ShieldCheck, Copy, Check, Loader2, AlertTriangle, HelpCircle, Compass
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import TicketUI from '../../components/TicketUI';
import { BooknshowLogo } from '../../components/Header'; // Reusing global vector logo

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 3 Order Confirmation)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Secure URL Parameter Extraction (Order/Payment ID)
 * FEATURE 2: Dynamic WhatsApp API Payload Generator (Rebranded)
 * FEATURE 3: Hardware-Accelerated Success Animations & Illustrative Background
 * FEATURE 4: Clipboard Copy Utility for Reference ID
 * FEATURE 5: Next Steps Timeline (5+ Sections Layout)
 * FEATURE 6: Responsive Mobile-First Completion UI
 * FEATURE 7: Strict Enterprise Palette Enforcement
 * FEATURE 8: Real-Time Firestore Transaction Interception
 * FEATURE 9: Native TicketUI Component Mounting
 * FEATURE 10: Failsafe Error Handling & Loading States
 */

// Illustrative ambient background for success screen
const SuccessBackgroundAnimation = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#FFFFFF] print:hidden">
        <motion.div
            className="absolute -top-[10%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[#FAD8DC] opacity-40 blur-[100px]"
            animate={{ x: [0, 30, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#FAD8DC] opacity-30 blur-[120px]"
            animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
    </div>
);

export default function OrderConfirmation() {
    const navigate = useNavigate();
    // Support both /order-confirmation/:id and /order-confirmation?id=... routing styles
    const { id: paramId } = useParams();
    const [searchParams] = useSearchParams();
    const orderId = paramId || searchParams.get('payment_id') || searchParams.get('id') || 'PENDING_VERIFICATION';

    const [copied, setCopied] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // FEATURE 8: Fetch Order Data from Firestore
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (orderId === 'PENDING_VERIFICATION') {
                setError('Invalid session or missing payment reference.');
                setIsLoading(false);
                return;
            }

            try {
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';
                const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
                
                // First try querying by paymentId (Razorpay or Manual ID)
                const q = query(ordersRef, where('paymentId', '==', orderId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setOrderData({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
                } else {
                    // Fallback: Check if the orderId is actually the document ID itself
                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setOrderData({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        throw new Error('Order verification failed. Record not found.');
                    }
                }
            } catch (err) {
                console.error("Secure Ledger Verification Failed:", err);
                setError(err.message || 'Unable to retrieve ticket payload. Please check your profile.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
        window.scrollTo(0, 0);
    }, [orderId]);

    // FEATURE 4: Clipboard Copy Utility
    const handleCopyId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // FEATURE 2: Dynamic WhatsApp API Payload Generator (Rebranded)
    const handleWhatsAppSupport = () => {
        const supportPhoneNumber = "919876543210"; // Update to Booknshow support line
        
        const message = `Hello Booknshow Support, 👋\n\nI just completed a booking and need some assistance with my tickets.\n\n*My Secure Reference ID:*\n\`${orderId}\`\n\nPlease let me know the delivery status of my order.\n\nThank you!`;
        const whatsappUrl = `https://wa.me/${supportPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    // FEATURE 3: Framer Motion Staggered Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF]">
                <Loader2 className="animate-spin text-[#E7364D] mb-4" size={48} />
                <h3 className="text-[16px] font-bold text-[#333333] tracking-widest uppercase">Minting Your E-Ticket</h3>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#333333] flex flex-col relative overflow-hidden">
            
            {/* Background Aesthetic */}
            <SuccessBackgroundAnimation />

            {/* Distraction-Free Header (SECTION 1) */}
            <div className="w-full bg-[#FFFFFF]/80 backdrop-blur-md border-b border-[#A3A3A3]/20 sticky top-0 z-40 px-4 py-4 md:px-8 shadow-sm print:hidden">
                <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                    <div onClick={() => navigate('/')} className="cursor-pointer flex items-center hover:opacity-80 transition-opacity">
                        <BooknshowLogo className="h-[28px] md:h-[32px]" />
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[600px] mx-auto px-4 py-12 z-10 flex flex-col items-center relative">
                
                <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible"
                    className="w-full flex flex-col items-center text-center"
                >
                    {error ? (
                        <div className="bg-[#FAD8DC]/30 border border-[#E7364D]/50 text-[#E7364D] p-6 rounded-[12px] flex flex-col items-center w-full mb-8 shadow-sm">
                            <AlertTriangle size={48} className="mb-4" />
                            <h3 className="text-[18px] font-black mb-2 text-[#333333]">Order Tracking Delayed</h3>
                            <p className="text-[14px] font-medium text-[#626262]">{error}</p>
                            <button onClick={() => navigate('/profile/orders')} className="mt-4 bg-[#E7364D] text-[#FFFFFF] px-6 py-3 rounded-[8px] font-bold text-[14px] hover:bg-[#EB5B6E] transition-colors shadow-md">
                                Check My Orders Tab
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Success Hero (SECTION 2) */}
                            <motion.div 
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="w-24 h-24 bg-[#E7364D] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(231,54,77,0.3)] mb-6 border-4 border-[#FFFFFF] print:hidden"
                            >
                                <CheckCircle2 size={48} className="text-[#FFFFFF]" strokeWidth={3} />
                            </motion.div>

                            <motion.h2 variants={itemVariants} className="text-[32px] md:text-[36px] font-black tracking-tight leading-tight mb-3 print:hidden text-[#333333]">
                                Payment Successful!
                            </motion.h2>
                            
                            <motion.p variants={itemVariants} className="text-[16px] text-[#626262] font-medium max-w-[400px] mb-10 leading-relaxed print:hidden">
                                Your transaction is secure and your tickets are officially reserved. We've sent a confirmation to your registered email.
                            </motion.p>

                            {/* FEATURE 9: Native TicketUI Rendering (SECTION 3) */}
                            <motion.div variants={itemVariants} className="w-full mb-10">
                                <TicketUI orderData={orderData} />
                            </motion.div>
                        </>
                    )}

                    <div className="w-full print:hidden">
                        
                        {/* Reference ID Card (SECTION 4) */}
                        <motion.div variants={itemVariants} className="w-full bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[16px] p-6 shadow-[0_4px_20px_rgba(51,51,51,0.05)] mb-8">
                            <p className="text-[12px] font-black text-[#A3A3A3] uppercase tracking-widest mb-3 text-left">Secure Reference ID</p>
                            <div className="flex items-center justify-between bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[8px] p-4">
                                <code className="text-[15px] font-black text-[#333333] tracking-wider break-all text-left">
                                    {orderId}
                                </code>
                                <button 
                                    onClick={handleCopyId}
                                    className="ml-4 p-2.5 bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[6px] hover:border-[#E7364D] transition-colors shrink-0 shadow-sm"
                                    title="Copy ID"
                                >
                                    {copied ? <Check size={18} className="text-[#E7364D]" /> : <Copy size={18} className="text-[#626262] hover:text-[#E7364D]" />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Next Steps Timeline (SECTION 5) */}
                        <motion.div variants={itemVariants} className="w-full bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[16px] p-6 shadow-[0_4px_20px_rgba(51,51,51,0.05)] text-left mb-8">
                            <h3 className="text-[18px] font-black mb-6 text-[#333333]">What happens next?</h3>
                            
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#E7364D] before:via-[#A3A3A3]/30 before:to-transparent">
                                <div className="relative flex items-start gap-4">
                                    <div className="absolute left-0 w-6 h-6 bg-[#E7364D] rounded-full border-4 border-[#FFFFFF] flex items-center justify-center shadow-sm z-10">
                                        <Check size={10} className="text-[#FFFFFF]"/>
                                    </div>
                                    <div className="pl-10">
                                        <h4 className="text-[15px] font-bold text-[#333333]">Order Confirmed</h4>
                                        <p className="text-[13px] text-[#626262] font-medium mt-1">Your payment has been locked safely in Booknshow Escrow.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                    <div className="absolute left-0 w-6 h-6 bg-[#F5F5F5] border-[#A3A3A3]/30 rounded-full border-4 flex items-center justify-center z-10"></div>
                                    <div className="pl-10">
                                        <h4 className="text-[15px] font-bold text-[#333333]">Seller Notified</h4>
                                        <p className="text-[13px] text-[#626262] font-medium mt-1">The seller has been instructed to verify the transfer of the tickets to your email address.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                    <div className="absolute left-0 w-6 h-6 bg-[#F5F5F5] border-[#A3A3A3]/30 rounded-full border-4 flex items-center justify-center z-10"></div>
                                    <div className="pl-10">
                                        <h4 className="text-[15px] font-bold text-[#333333]">Ticket Delivery</h4>
                                        <p className="text-[13px] text-[#626262] font-medium mt-1">You will receive an email from the venue or organizer to accept the final transfer.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons & Support (SECTION 6 & 7) */}
                        <motion.div variants={itemVariants} className="w-full space-y-4">
                            
                            <button 
                                onClick={() => navigate('/profile/orders')}
                                className="w-full bg-[#333333] text-[#FFFFFF] font-black py-4 rounded-[12px] text-[16px] shadow-[0_8px_20px_rgba(51,51,51,0.2)] hover:bg-[#E7364D] transition-all flex items-center justify-center gap-2"
                            >
                                <Ticket size={20} /> View My Bookings
                            </button>

                            <button 
                                onClick={() => navigate('/explore')}
                                className="w-full bg-[#FFFFFF] border-2 border-[#A3A3A3]/30 text-[#333333] font-bold py-4 rounded-[12px] text-[16px] shadow-sm hover:border-[#E7364D] hover:text-[#E7364D] hover:bg-[#FAD8DC]/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Compass size={20} /> Explore More Events
                            </button>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button 
                                    onClick={handleWhatsAppSupport}
                                    className="w-full bg-[#FAD8DC]/30 text-[#E7364D] border border-[#E7364D]/30 font-bold py-3.5 rounded-[12px] text-[14px] hover:bg-[#FAD8DC]/50 hover:border-[#E7364D] transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={18} /> Get Help
                                </button>
                                <button 
                                    onClick={() => navigate('/profile/faqs')}
                                    className="w-full bg-[#F5F5F5] text-[#626262] border border-[#A3A3A3]/20 font-bold py-3.5 rounded-[12px] text-[14px] hover:bg-[#A3A3A3]/10 hover:text-[#333333] transition-all flex items-center justify-center gap-2"
                                >
                                    <HelpCircle size={18} /> View FAQs
                                </button>
                            </div>

                        </motion.div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}