import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, Ticket, MessageCircle, Download, 
    ChevronRight, ShieldCheck, Mail, ArrowRight, Copy, Check, Loader2, AlertTriangle
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import TicketUI from '../../components/TicketUI';

/**
 * FEATURE 1: Secure URL Parameter Extraction (Order/Payment ID)
 * FEATURE 2: Dynamic WhatsApp API Payload Generator
 * FEATURE 3: Hardware-Accelerated Success Animations
 * FEATURE 4: Clipboard Copy Utility for Reference ID
 * FEATURE 5: Next Steps Timeline
 * FEATURE 6: Responsive Mobile-First Completion UI
 * FEATURE 7: Strict Enterprise Palette Enforcement
 * FEATURE 8: Real-Time Firestore Transaction Interception
 * FEATURE 9: Native TicketUI Component Mounting
 * FEATURE 10: Failsafe Error Handling & Loading States
 */

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
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
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

    // FEATURE 2: Dynamic WhatsApp API Payload Generator
    const handleWhatsAppSupport = () => {
        // REPLACE this with the client's actual WhatsApp Business Number
        const supportPhoneNumber = "919876543210"; 
        
        const message = `Hello Parbet Support, 👋\n\nI just completed a booking and need some assistance with my tickets.\n\n*My Secure Reference ID:*\n\`${orderId}\`\n\nPlease let me know the delivery status of my order.\n\nThank you!`;
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa]">
                <Loader2 className="animate-spin text-[#427A1A] mb-4" size={48} />
                <h3 className="text-[16px] font-bold text-[#1a1a1a] tracking-widest uppercase">Minting Your E-Ticket</h3>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#1a1a1a] flex flex-col relative overflow-hidden">
            
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#eaf4d9] to-[#f8f9fa] z-0 print:hidden"></div>

            {/* Distraction-Free Header */}
            <div className="w-full bg-white/80 backdrop-blur-md border-b border-[#e2e2e2] sticky top-0 z-40 px-4 py-4 md:px-8 shadow-sm print:hidden">
                <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                    <h1 onClick={() => navigate('/')} className="text-[24px] font-black tracking-tighter text-[#1a1a1a] cursor-pointer flex items-center">
                        <ShieldCheck size={28} className="mr-2 text-[#8cc63f]" /> par<span className="text-[#8cc63f]">bet</span>
                    </h1>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[600px] mx-auto px-4 py-12 z-10 flex flex-col items-center">
                
                <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible"
                    className="w-full flex flex-col items-center text-center"
                >
                    {error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-[12px] flex flex-col items-center w-full mb-8">
                            <AlertTriangle size={48} className="mb-4" />
                            <h3 className="text-[18px] font-black mb-2">Order Tracking Delayed</h3>
                            <p className="text-[14px] font-medium">{error}</p>
                            <button onClick={() => navigate('/profile/orders')} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-[8px] font-bold text-[14px] hover:bg-red-700">
                                Check My Orders Tab
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Success Icon */}
                            <motion.div 
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="w-24 h-24 bg-[#8cc63f] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(140,198,63,0.3)] mb-6 border-4 border-white print:hidden"
                            >
                                <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
                            </motion.div>

                            <motion.h2 variants={itemVariants} className="text-[32px] md:text-[36px] font-black tracking-tight leading-tight mb-3 print:hidden">
                                Payment Successful!
                            </motion.h2>
                            
                            <motion.p variants={itemVariants} className="text-[16px] text-[#54626c] font-medium max-w-[400px] mb-10 leading-relaxed print:hidden">
                                Your transaction is secure and your tickets are officially reserved. We've sent a confirmation to your registered email.
                            </motion.p>

                            {/* FEATURE 9: Native TicketUI Rendering */}
                            <motion.div variants={itemVariants} className="w-full mb-10">
                                <TicketUI orderData={orderData} />
                            </motion.div>
                        </>
                    )}

                    <div className="w-full print:hidden">
                        {/* Reference ID Card */}
                        <motion.div variants={itemVariants} className="w-full bg-white border border-[#e2e2e2] rounded-[16px] p-6 shadow-sm mb-8">
                            <p className="text-[12px] font-black text-[#9ca3af] uppercase tracking-widest mb-2 text-left">Secure Reference ID</p>
                            <div className="flex items-center justify-between bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] p-4">
                                <code className="text-[15px] font-black text-[#1a1a1a] tracking-wider break-all text-left">
                                    {orderId}
                                </code>
                                <button 
                                    onClick={handleCopyId}
                                    className="ml-4 p-2 bg-white border border-[#e2e2e2] rounded-[6px] hover:border-[#8cc63f] transition-colors shrink-0"
                                    title="Copy ID"
                                >
                                    {copied ? <Check size={18} className="text-[#8cc63f]" /> : <Copy size={18} className="text-[#54626c]" />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Next Steps Timeline */}
                        <motion.div variants={itemVariants} className="w-full bg-white border border-[#e2e2e2] rounded-[16px] p-6 shadow-sm text-left mb-8">
                            <h3 className="text-[18px] font-black mb-6">What happens next?</h3>
                            
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#8cc63f] before:via-[#e2e2e2] before:to-transparent">
                                <div className="relative flex items-start gap-4">
                                    <div className="absolute left-0 w-6 h-6 bg-[#8cc63f] rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10"><Check size={10} className="text-white"/></div>
                                    <div className="pl-10">
                                        <h4 className="text-[15px] font-bold text-[#1a1a1a]">Order Confirmed</h4>
                                        <p className="text-[13px] text-[#54626c] font-medium mt-1">Your payment has been locked safely in Parbet Escrow.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                    <div className="absolute left-0 w-6 h-6 bg-[#e2e2e2] rounded-full border-4 border-white flex items-center justify-center z-10"></div>
                                    <div className="pl-10">
                                        <h4 className="text-[15px] font-bold text-[#1a1a1a]">Seller Notified</h4>
                                        <p className="text-[13px] text-[#54626c] font-medium mt-1">The seller has been instructed to verify the transfer of the tickets to your email address.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                    <div className="absolute left-0 w-6 h-6 bg-[#e2e2e2] rounded-full border-4 border-white flex items-center justify-center z-10"></div>
                                    <div className="pl-10">
                                        <h4 className="text-[15px] font-bold text-[#1a1a1a]">Ticket Delivery</h4>
                                        <p className="text-[13px] text-[#54626c] font-medium mt-1">You will receive an email from the venue (e.g., Ticketmaster or Insider) to accept the final transfer.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div variants={itemVariants} className="w-full space-y-4">
                            <button 
                                onClick={() => navigate('/profile/orders')}
                                className="w-full bg-[#1a1a1a] text-white font-black py-4 rounded-[12px] text-[16px] shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <Ticket size={20} /> View All My Orders
                            </button>

                            {/* FEATURE 2: WhatsApp Support Button */}
                            <button 
                                onClick={handleWhatsAppSupport}
                                className="w-full bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 font-black py-4 rounded-[12px] text-[16px] hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={20} /> WhatsApp Customer Support
                            </button>
                        </motion.div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}