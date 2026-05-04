import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, Ticket, Clock, Check, Lock, MapPin, 
    UploadCloud, Building, CheckCircle2, ShieldAlert, 
    Loader2, AlertTriangle, Info, Eye, Zap, X, ChevronDown, Smartphone,
    User, ShieldCheck, Activity
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import { useAppStore } from '../../store/useStore';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadEventImage } from '../../lib/pocketbase';
import { loadRazorpayScript } from '../../utils/razorpay';
import { sendTicketEmail } from '../../services/emailService.js';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 10 Checkout Engine)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * 
 * FEATURE 1: Exclusive Admin Zero-Pay Bypass & Sandbox (₹50) Testing (Expanded & Case-Insensitive)
 * FEATURE 2: Integrated Resend Email Dispatcher API call on success
 * FEATURE 3: Strict Route Isolation (Hidden Header/Footer)
 * FEATURE 4: Progressive Checkout Accordion with strict form locks
 * FEATURE 5: Dynamic Ticket Details Modal popup
 */

// High-Fidelity Inline SVG Replica of Official Booknshow Logo
const BooknshowLogo = ({ className = "", textColor = "text-[#333333]" }) => {
    // Dynamically extract the hex code if a Tailwind class is passed, ensuring reusability on dark backgrounds
    const fillHex = textColor.includes('#') ? textColor.match(/#(?:[0-9a-fA-F]{3,8})/)[0] : "#333333";
    
    return (
        <div className={`flex items-center justify-center select-none relative z-10 ${className}`}>
            <svg viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[40px] transform hover:scale-[1.02] transition-transform duration-300">
                <text x="10" y="70" fontFamily="Inter, sans-serif" fontSize="64" fontWeight="800" fill={fillHex} letterSpacing="-2">book</text>
                <g transform="translate(170, 10) rotate(-12)">
                    <path d="M0,0 L16,10 L32,0 L48,10 L64,0 L80,10 L80,95 L60,95 A20,20 0 0,0 20,95 L0,95 Z" fill="#E7364D"></path>
                    <text x="21" y="72" fontFamily="Inter, sans-serif" fontSize="60" fontWeight="900" fill="#FFFFFF">n</text>
                </g>
                <text x="250" y="70" fontFamily="Inter, sans-serif" fontSize="64" fontWeight="800" fill={fillHex} letterSpacing="-2">show</text>
            </svg>
        </div>
    );
};

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('eventId');
    const tierId = searchParams.get('tierId');
    const qtyParams = searchParams.get('qty') || '1';
    
    const navigate = useNavigate();
    const location = useLocation();

    const { 
        user, isAuthenticated, openAuthModal,
        checkoutStep, setCheckoutStep,
        checkoutFormData, updateCheckoutFormData,
        checkoutExpiration, cancelReservation, executePurchase,
        hydrateCheckoutPayload, startCheckoutTimer
    } = useAppStore();

    const [localListing, setLocalListing] = useState(location.state?.reservedListing || null);

    // Core UI States
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    
    // specific UI States
    const [isTimerStarted, setIsTimerStarted] = useState(false);
    const [priceLockedMsg, setPriceLockedMsg] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    
    // Form States
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [adminTestMode, setAdminTestMode] = useState('bypass'); // 'bypass' (0) or 'sandbox' (50)
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState('');
    const [timeLeft, setTimeLeft] = useState('10:00');
    const [selectedQty, setSelectedQty] = useState(Number(qtyParams));
    
    // Form Fields
    const [billingAddress, setBillingAddress] = useState({ country: 'India', address: '', city: '', state: '', postal: '' });

    // CRITICAL FIX: Bulletproof, Case-Insensitive Admin Array Matcher
    const isTestAdmin = useMemo(() => {
        if (!user?.email) return false;
        const normalizedUserEmail = user.email.trim().toLowerCase();
        const adminList = [
            'testcodecfg@gmail.com',
            'krishnamehta.gm@gmail.com',
            'jatinseth.op@gmail.com',
            'jachinfotech@gmail.com',
            'santhuprathipa@gmail.com'
        ];
        return adminList.some(adminEmail => adminEmail.toLowerCase() === normalizedUserEmail);
    }, [user?.email]);

    // Hardened Back Button Interception
    useEffect(() => {
        if (!localListing) return;
        const handleBackButton = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.history.pushState(null, null, window.location.pathname + window.location.search);
            window.history.pushState(null, null, window.location.pathname + window.location.search);
            setIsCancelModalOpen(true);
        };
        // Push state twice to ensure we securely trap the back navigation pop
        window.history.pushState(null, null, window.location.pathname + window.location.search);
        window.history.pushState(null, null, window.location.pathname + window.location.search);
        window.addEventListener('popstate', handleBackButton);
        return () => window.removeEventListener('popstate', handleBackButton);
    }, [localListing]);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false);
            openAuthModal();
            return;
        }

        const syncInventoryLock = async () => {
            try {
                setIsLoading(true);
                if (location.state && location.state.reservedListing) {
                    const payload = location.state.reservedListing;
                    setLocalListing(payload);
                    hydrateCheckoutPayload(payload);
                    setSelectedQty(payload.quantity);
                    if (user?.email && !checkoutFormData.contact.email) {
                        updateCheckoutFormData('contact', { email: user.email });
                    }
                    setIsLoading(false);
                    return;
                }

                if (!eventId || !tierId) { navigate('/'); return; }

                const docRef = doc(db, 'events', eventId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const eventData = docSnap.data();
                    const tierData = eventData.ticketTiers?.find(t => t.id === tierId);
                    if (!tierData) { setError('This ticket tier has expired.'); return; }
                    const requestedQty = Number(qtyParams);
                    if (tierData.quantity < requestedQty) { setError(`Only ${tierData.quantity} tickets remaining.`); return; }

                    const captureData = {
                        id: docSnap.id,
                        eventId: eventId,
                        tierId: tierId,
                        eventName: eventData.title || eventData.eventName,
                        eventLoc: `${eventData.stadium || eventData.loc}, ${eventData.location?.split(',')[0] || eventData.city}`,
                        price: Number(tierData.price),
                        quantity: requestedQty,
                        tierName: tierData.name,
                        sellerId: eventData.sellerId || 'system',
                        imageUrl: eventData.imageUrl,
                        maxQuantity: tierData.quantity
                    };

                    setLocalListing(captureData);
                    hydrateCheckoutPayload(captureData);
                    setSelectedQty(requestedQty);
                    if (user?.email && !checkoutFormData.contact.email) {
                        updateCheckoutFormData('contact', { email: user.email });
                    }
                } else {
                    setError('The event marketplace listing is no longer active.');
                }
            } catch (err) {
                setError('Establishment of secure checkout session failed. Please check network.');
            } finally {
                setIsLoading(false);
            }
        };

        syncInventoryLock();
    }, [eventId, tierId, qtyParams, isAuthenticated, user, location.state, hydrateCheckoutPayload]); 

    // Precision Timer Engine with Auto-Redirect
    useEffect(() => {
        if (!checkoutExpiration || !isTimerStarted) return;
        const interval = setInterval(() => {
            const diff = checkoutExpiration - Date.now();
            if (diff <= 0) {
                clearInterval(interval);
                alert("Your 10-minute reservation window has expired. Please select your tickets again.");
                handleExplicitCancel();
                return;
            }
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [checkoutExpiration, isTimerStarted]);

    const totals = useMemo(() => {
        if (!localListing) return { subtotal: 0, fees: 0, tax: 0, total: 0 };
        const subtotal = localListing.price * selectedQty;
        const fees = subtotal * 0.15; // 15% Platform Service Fee
        const tax = fees * 0.18;    // 18% GST
        return { subtotal, fees, tax, total: subtotal + fees + tax };
    }, [localListing, selectedQty]);

    // Proper route back to the event page on explicit cancel
    const handleExplicitCancel = () => {
        cancelReservation();
        navigate(eventId ? `/event?id=${eventId}` : '/');
    };

    const handleStartTimer = () => {
        startCheckoutTimer();
        setIsTimerStarted(true);
        setPriceLockedMsg(true);
        setTimeout(() => setPriceLockedMsg(false), 4000);
    };

    const handleReceiptUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const res = await uploadEventImage(file);
            setReceiptUrl(res.url);
        } catch (err) { 
            setError("Image upload to secure vault failed. Check your PocketBase connection."); 
        } finally { 
            setIsUploading(false); 
        }
    };

    // Form Validation Gates
    const handleProceedToBilling = () => {
        if (!checkoutFormData.contact.email || !checkoutFormData.delivery.phone) {
            setError("Please provide a valid email and phone number to continue.");
            return;
        }
        setError('');
        setCheckoutStep(2);
    };

    const handleProceedToPayment = () => {
        if (!billingAddress.address || !billingAddress.city || !billingAddress.state || !billingAddress.postal) {
            setError("Please fill in your complete billing address to proceed.");
            return;
        }
        setError('');
        setCheckoutStep(3);
    };

    /**
     * PHASE 10: DUAL PAYMENT PIPELINE (RAZORPAY + EXCLUSIVE ADMIN BYPASS)
     */
    const handleFinalPayment = async () => {
        if (isProcessingOrder) return;
        setIsProcessingOrder(true);
        setError('');

        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';
            const finalListingData = { ...localListing, quantity: selectedQty };

            // ==========================================
            // PATH A: EXCLUSIVE GOD-MODE ADMIN TEST BYPASS
            // ==========================================
            if (isTestAdmin) {
                const testPaymentId = `TEST_BYPASS_${Date.now()}`;
                const orderRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
                
                // Determine the mock payload amount based on toggle
                const targetAdminAmount = adminTestMode === 'sandbox' ? 50 : 0;
                
                const payload = {
                    id: orderRef.id,
                    buyerId: user.uid,
                    buyerEmail: checkoutFormData.contact.email,
                    buyerName: billingAddress.address || checkoutFormData.contact.email,
                    eventId: localListing.eventId,
                    eventName: localListing.eventName,
                    tierId: localListing.tierId,
                    quantity: selectedQty,
                    totalAmount: targetAdminAmount, // Dual-Tier Override
                    paymentMethod: 'admin_test_bypass',
                    paymentId: testPaymentId,
                    status: 'Paid',
                    createdAt: serverTimestamp()
                };

                // If testing the sandbox gateway physically, intercept here
                if (adminTestMode === 'sandbox') {
                    const isSdkLoaded = await loadRazorpayScript();
                    if (!isSdkLoaded) throw new Error("Payment initialization failed. Please disable your browser ad-blocker.");

                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                        amount: 50 * 100, // ₹50 exactly
                        currency: "INR",
                        name: "Booknshow Admin Sandbox",
                        description: `Sandbox #${testPaymentId}`,
                        handler: async (response) => {
                            try {
                                payload.paymentId = `TEST_BYPASS_R_${response.razorpay_payment_id}`;
                                await setDoc(orderRef, payload);
                                await executePurchase(payload.paymentId, 50, finalListingData);
                                sendTicketEmail(payload, checkoutFormData.contact.email, localListing);
                                navigate(`/checkout/success`, { state: { orderId: orderRef.id, event: localListing }});
                            } catch (err) { 
                                setError(`Sandbox Payment succeeded, but DB write failed: ${err.message}`); 
                                setIsProcessingOrder(false);
                            }
                        },
                        prefill: { email: checkoutFormData.contact.email, contact: checkoutFormData.delivery.phone },
                        theme: { color: "#E7364D" },
                        modal: { ondismiss: function() { setIsProcessingOrder(false); } }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', function (response){
                        setError(`Sandbox Failed: ${response.error.description}`);
                        setIsProcessingOrder(false);
                    });
                    rzp.open();
                    return; // Prevent fallthrough
                }

                // Standard Zero-Pay DB Execution
                await setDoc(orderRef, payload);
                await executePurchase(testPaymentId, 0, finalListingData);
                sendTicketEmail(payload, checkoutFormData.contact.email, localListing);
                navigate(`/checkout/success`, { state: { orderId: orderRef.id, event: localListing }});
                return;
            }

            // ==========================================
            // PATH B: STANDARD RAZORPAY PIPELINE
            // ==========================================
            if (paymentMethod === 'card') {
                const isSdkLoaded = await loadRazorpayScript();
                if (!isSdkLoaded) throw new Error("Payment initialization failed. Please disable your browser ad-blocker.");

                const pseudoOrderId = `order_${Date.now()}`;
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                    amount: Math.round(totals.total * 100),
                    currency: "INR",
                    name: "Booknshow Tickets",
                    description: `Order #${pseudoOrderId}`,
                    handler: async (response) => {
                        try {
                            const paymentId = response.razorpay_payment_id;
                            const orderRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
                            
                            const payload = {
                                id: orderRef.id,
                                buyerId: user.uid,
                                buyerEmail: checkoutFormData.contact.email,
                                buyerName: billingAddress.address || checkoutFormData.contact.email,
                                eventId: localListing.eventId,
                                eventName: localListing.eventName,
                                tierId: localListing.tierId,
                                quantity: selectedQty,
                                totalAmount: totals.total,
                                paymentMethod: 'razorpay',
                                paymentId: paymentId,
                                status: 'Paid',
                                createdAt: serverTimestamp()
                            };
                            
                            await setDoc(orderRef, payload);
                            await executePurchase(paymentId, totals.total, finalListingData);
                            sendTicketEmail(payload, checkoutFormData.contact.email, localListing);
                            navigate(`/checkout/success`, { state: { orderId: orderRef.id, event: localListing }});
                        } catch (err) { 
                            setError(`Payment succeeded, but inventory update failed: ${err.message}.`); 
                            setIsProcessingOrder(false);
                        }
                    },
                    prefill: { email: checkoutFormData.contact.email, contact: checkoutFormData.delivery.phone },
                    theme: { color: "#333333" },
                    modal: { ondismiss: function() { setIsProcessingOrder(false); } }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response){
                    setError(`Payment Failed: ${response.error.description}`);
                    setIsProcessingOrder(false);
                });
                rzp.open();
                
            } else {
                // ==========================================
                // PATH C: MANUAL BANK TRANSFER (Escrow)
                // ==========================================
                if (!receiptUrl) throw new Error("Transfer proof is mandatory for manual approval.");
                const orderRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
                const pseudoPaymentId = `manual_${Date.now()}`;

                await setDoc(orderRef, {
                    buyerId: user.uid,
                    buyerEmail: checkoutFormData.contact.email,
                    buyerName: billingAddress.address || checkoutFormData.contact.email,
                    eventId: localListing.eventId,
                    eventName: localListing.eventName,
                    tierId: localListing.tierId,
                    quantity: selectedQty,
                    totalAmount: totals.total,
                    paymentMethod: 'bank_transfer',
                    paymentId: pseudoPaymentId,
                    receiptUrl: receiptUrl,
                    status: 'Pending',
                    createdAt: serverTimestamp()
                });

                await executePurchase(pseudoPaymentId, totals.total, finalListingData);
                navigate('/profile/orders');
            }
        } catch (err) {
            setError(err.message);
            setIsProcessingOrder(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
            <Loader2 className="animate-spin text-[#E7364D] mb-4" size={48} />
            <h3 className="text-[16px] font-black text-[#333333] tracking-widest uppercase">Securing Inventory...</h3>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#333333] relative pb-20">
            
            {/* Initial Lock Modal */}
            <AnimatePresence>
                {!isTimerStarted && !isLoading && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#333333]/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FFFFFF] rounded-[16px] p-8 max-w-sm w-full shadow-2xl text-center border border-[#A3A3A3]/20">
                            <div className="w-16 h-16 bg-[#FAD8DC]/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E7364D]/20">
                                <Lock className="text-[#E7364D]" size={32} />
                            </div>
                            <h2 className="text-[22px] font-black text-[#333333] mb-3 leading-tight">You have 10 minutes to complete your purchase</h2>
                            <p className="text-[#626262] text-[15px] font-medium mb-8">The price of your tickets will be locked during this time.</p>
                            <button onClick={handleStartTimer} className="w-full bg-[#333333] text-[#FFFFFF] font-bold py-3.5 rounded-[8px] hover:bg-[#E7364D] transition-colors shadow-[0_4px_15px_rgba(231,54,77,0.3)]">Start Checkout</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Safety Cancel Modal */}
            <AnimatePresence>
                {isCancelModalOpen && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-[#333333]/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#FFFFFF] rounded-[16px] p-8 max-w-md w-full shadow-2xl text-center border border-[#A3A3A3]/20">
                            <h2 className="text-[24px] font-black text-[#333333] mb-3">Release Tickets?</h2>
                            <p className="text-[#626262] font-medium mb-8">Going back will release your tickets. Other fans will be able to buy them immediately.</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => setIsCancelModalOpen(false)} className="w-full bg-[#333333] text-[#FFFFFF] font-bold py-3.5 rounded-[8px] hover:bg-[#E7364D] transition-colors shadow-sm">No, Keep Reservation</button>
                                <button onClick={handleExplicitCancel} className="w-full bg-[#FFFFFF] text-[#E7364D] border border-[#E7364D] font-bold py-3.5 rounded-[8px] hover:bg-[#FAD8DC]/30 transition-colors">Yes, Cancel & Go Back</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ticket Details Modal */}
            <AnimatePresence>
                {detailsModalOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#333333]/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#FFFFFF] rounded-[12px] p-6 max-w-lg w-full shadow-2xl relative border border-[#A3A3A3]/20">
                            <button onClick={() => setDetailsModalOpen(false)} className="absolute top-4 right-4 text-[#A3A3A3] hover:text-[#333333] transition-colors">
                                <X size={24} />
                            </button>
                            <div className="flex justify-between items-start mb-6 pr-8">
                                <div>
                                    <p className="text-[12px] text-[#E7364D] font-bold uppercase tracking-widest mb-1">Live Event</p>
                                    <h3 className="font-black text-[20px] text-[#333333] leading-tight mb-1">{localListing?.eventName || 'Event Name'}</h3>
                                    <p className="text-[13px] text-[#626262] font-bold">Standard Admission Time</p>
                                    <p className="text-[13px] text-[#626262] font-medium">{localListing?.eventLoc || 'Venue, City'}</p>
                                </div>
                                <img src={localListing?.imageUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200"} alt="Event" className="w-20 h-14 object-cover rounded-[6px] border border-[#A3A3A3]/20" />
                            </div>
                            
                            <div className="inline-flex items-center bg-[#FAD8DC]/30 text-[#E7364D] border border-[#E7364D]/20 px-2.5 py-1 rounded-[4px] text-[12px] font-black uppercase tracking-widest mb-6">
                                <Smartphone size={14} className="mr-1.5" /> Booknshow E-Ticket
                            </div>

                            <h4 className="font-black text-[18px] mb-1 text-[#333333]">Tier: {localListing?.tierName || 'General Admission'}</h4>
                            <p className="text-[14px] text-[#626262] font-medium mb-6">{selectedQty} tickets reserved</p>

                            <div className="space-y-4 border-t border-[#A3A3A3]/20 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[8px] flex items-center justify-center shrink-0"><CheckCircle2 size={20} className="text-[#333333]" /></div>
                                    <span className="font-bold text-[14px] text-[#333333]">Guaranteed Entry</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[8px] flex items-center justify-center shrink-0"><Eye size={20} className="text-[#333333]" /></div>
                                    <span className="font-bold text-[14px] text-[#333333]">Unobstructed View</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[8px] flex items-center justify-center shrink-0"><Zap size={20} className="text-[#E7364D]" /></div>
                                    <span className="font-bold text-[14px] text-[#333333]">Instant Digital Delivery</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Price Lock Toast */}
            <AnimatePresence>
                {priceLockedMsg && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-[#333333] text-[#FFFFFF] px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 border border-[#A3A3A3]/30">
                        <Lock size={16} className="text-[#E7364D]" /> Inventory Locked for Checkout
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Distraction-Free Header */}
            <div className="w-full bg-[#FFFFFF] border-b border-[#A3A3A3]/20 pt-6 pb-4 flex justify-center items-center cursor-pointer shadow-sm" onClick={() => setIsCancelModalOpen(true)}>
                <BooknshowLogo textColor="text-[#333333]" />
            </div>

            {/* Two-Column Checkout Layout */}
            <div className="max-w-[1100px] mx-auto mt-8 px-4 flex flex-col lg:flex-row gap-12">
                
                {/* LEFT COLUMN: Forms */}
                <div className="flex-1 space-y-8">
                    {error && (
                        <div className="bg-[#FAD8DC]/30 border-l-[4px] border-[#E7364D] text-[#E7364D] p-4 rounded-r-[8px] font-bold flex items-center text-[14px]">
                            <AlertTriangle size={20} className="mr-3 shrink-0" /> {error}
                        </div>
                    )}

                    {/* Step 1: Contact Information */}
                    <div className="bg-[#FFFFFF] p-6 md:p-8 rounded-[12px] border border-[#A3A3A3]/20 shadow-sm">
                        <h2 className="text-[22px] font-black text-[#333333] mb-2 flex items-center"><User className="mr-2 text-[#E7364D]" size={22} /> 1. Contact Information</h2>
                        <p className="text-[14px] text-[#626262] font-medium mb-6">Where should we securely deliver your Booknshow tickets?</p>
                        
                        <div className="bg-[#F5F5F5] rounded-[8px] p-4 mb-6 border border-[#A3A3A3]/20">
                            <div className="mb-4">
                                <label className="text-[12px] text-[#A3A3A3] font-bold uppercase tracking-widest block mb-1">Email Address</label>
                                <input type="email" value={checkoutFormData.contact.email} onChange={(e) => updateCheckoutFormData('contact', { email: e.target.value })} className="w-full bg-transparent border-b border-[#A3A3A3]/40 focus:border-[#E7364D] outline-none py-1 font-black text-[#333333] transition-colors" />
                            </div>
                            <div>
                                <label className="text-[12px] text-[#A3A3A3] font-bold uppercase tracking-widest block mb-1">Mobile Phone</label>
                                <input type="tel" value={checkoutFormData.delivery.phone} onChange={(e) => updateCheckoutFormData('delivery', { phone: e.target.value })} className="w-full bg-transparent border-b border-[#A3A3A3]/40 focus:border-[#E7364D] outline-none py-1 font-black text-[#333333] transition-colors" />
                            </div>
                        </div>

                        {checkoutStep === 1 && (
                            <button onClick={handleProceedToBilling} className="w-full bg-[#333333] text-[#FFFFFF] font-bold py-4 rounded-[8px] hover:bg-[#E7364D] transition-colors text-[16px] shadow-[0_4px_15px_rgba(231,54,77,0.2)]">Continue to Billing</button>
                        )}
                    </div>

                    {/* Step 2: Billing Address */}
                    {checkoutStep >= 2 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FFFFFF] p-6 md:p-8 rounded-[12px] border border-[#A3A3A3]/20 shadow-sm">
                            <h2 className="text-[22px] font-black text-[#333333] mb-6 flex items-center"><MapPin className="mr-2 text-[#E7364D]" size={22}/> 2. Billing Address</h2>
                            <div className="space-y-4 mb-6">
                                <div className="border border-[#A3A3A3]/40 rounded-[8px] px-3 py-2 bg-[#FAFAFA] relative focus-within:border-[#E7364D] transition-colors">
                                    <label className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest block">Country</label>
                                    <select value={billingAddress.country} onChange={(e) => setBillingAddress({...billingAddress, country: e.target.value})} className="w-full bg-transparent outline-none text-[15px] font-black text-[#333333] appearance-none">
                                        <option value="India">India</option>
                                        <option value="US">United States</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] pointer-events-none" />
                                </div>
                                <div className="border border-[#A3A3A3]/40 rounded-[8px] px-3 py-3 bg-[#FAFAFA] focus-within:border-[#E7364D] transition-colors">
                                    <input type="text" placeholder="Full Address" value={billingAddress.address} onChange={(e) => setBillingAddress({...billingAddress, address: e.target.value})} className="w-full bg-transparent outline-none text-[15px] font-medium text-[#333333]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-[#A3A3A3]/40 rounded-[8px] px-3 py-3 bg-[#FAFAFA] focus-within:border-[#E7364D] transition-colors">
                                        <input type="text" placeholder="City" value={billingAddress.city} onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})} className="w-full bg-transparent outline-none text-[15px] font-medium text-[#333333]" />
                                    </div>
                                    <div className="border border-[#A3A3A3]/40 rounded-[8px] px-3 py-3 bg-[#FAFAFA] focus-within:border-[#E7364D] transition-colors">
                                        <input type="text" placeholder="State/Province" value={billingAddress.state} onChange={(e) => setBillingAddress({...billingAddress, state: e.target.value})} className="w-full bg-transparent outline-none text-[15px] font-medium text-[#333333]" />
                                    </div>
                                </div>
                                <div className="border border-[#A3A3A3]/40 rounded-[8px] px-3 py-3 bg-[#FAFAFA] focus-within:border-[#E7364D] transition-colors">
                                    <input type="text" placeholder="Postal Code" value={billingAddress.postal} onChange={(e) => setBillingAddress({...billingAddress, postal: e.target.value})} className="w-full bg-transparent outline-none text-[15px] font-medium text-[#333333]" />
                                </div>
                            </div>
                            {checkoutStep === 2 && (
                                <button onClick={handleProceedToPayment} className="w-full bg-[#333333] text-[#FFFFFF] font-bold py-4 rounded-[8px] hover:bg-[#E7364D] transition-colors text-[16px] shadow-[0_4px_15px_rgba(231,54,77,0.2)]">Continue to Payment</button>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Payment Method */}
                    {checkoutStep >= 3 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FFFFFF] p-6 md:p-8 rounded-[12px] border border-[#A3A3A3]/20 shadow-sm">
                            <h2 className="text-[22px] font-black text-[#333333] mb-6 flex items-center"><ShieldCheck className="mr-2 text-[#E7364D]" size={22}/> 3. Secure Payment</h2>
                            
                            {/* PHASE 10: Exclusive God-Mode UI Rendering */}
                            {isTestAdmin ? (
                                <div className="border border-[#E7364D]/50 rounded-[8px] overflow-hidden mb-6 bg-[#FAD8DC]/10">
                                    <div className="p-4 border-b border-[#E7364D]/20 flex items-center gap-3">
                                        <Lock className="text-[#E7364D]" size={20} />
                                        <div>
                                            <h4 className="font-black text-[15px] text-[#333333]">Admin Diagnostic Protocol Activated</h4>
                                            <p className="text-[12px] text-[#626262] font-medium">Bypassing standard commercial gateway requirements.</p>
                                        </div>
                                    </div>
                                    
                                    {/* Dual-Tier Admin Selector */}
                                    <div className="p-4 flex flex-col gap-3">
                                        <label onClick={() => setAdminTestMode('bypass')} className={`flex items-center p-3 cursor-pointer border rounded-[6px] transition-colors ${adminTestMode === 'bypass' ? 'border-[#E7364D] bg-[#FFFFFF]' : 'border-[#A3A3A3]/30 bg-[#FAFAFA]'}`}>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${adminTestMode === 'bypass' ? 'border-[#E7364D]' : 'border-[#A3A3A3]'}`}>
                                                {adminTestMode === 'bypass' && <div className="w-2 h-2 bg-[#E7364D] rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[14px] font-black text-[#333333] block">Absolute Zero-Pay Bypass</span>
                                                <span className="text-[12px] text-[#626262] font-medium">Test end-to-end routing completely free.</span>
                                            </div>
                                            <span className="font-black text-[#E7364D]">₹0</span>
                                        </label>
                                        
                                        <label onClick={() => setAdminTestMode('sandbox')} className={`flex items-center p-3 cursor-pointer border rounded-[6px] transition-colors ${adminTestMode === 'sandbox' ? 'border-[#E7364D] bg-[#FFFFFF]' : 'border-[#A3A3A3]/30 bg-[#FAFAFA]'}`}>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${adminTestMode === 'sandbox' ? 'border-[#E7364D]' : 'border-[#A3A3A3]'}`}>
                                                {adminTestMode === 'sandbox' && <div className="w-2 h-2 bg-[#E7364D] rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[14px] font-black text-[#333333] block">Live Gateway Sandbox Test</span>
                                                <span className="text-[12px] text-[#626262] font-medium">Verify Razorpay UI connectivity via test keys.</span>
                                            </div>
                                            <span className="font-black text-[#333333]">₹50</span>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-[#A3A3A3]/40 rounded-[8px] overflow-hidden mb-6">
                                    {/* Razorpay Option */}
                                    <label onClick={() => setPaymentMethod('card')} className={`flex items-center p-4 cursor-pointer border-b border-[#A3A3A3]/20 transition-colors ${paymentMethod === 'card' ? 'bg-[#FAFAFA]' : 'bg-[#FFFFFF] hover:bg-[#F5F5F5]'}`}>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${paymentMethod === 'card' ? 'border-[#E7364D]' : 'border-[#A3A3A3]/50'}`}>
                                            {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-[#E7364D] rounded-full" />}
                                        </div>
                                        <CreditCard size={24} className="text-[#333333] mr-3" />
                                        <span className="text-[15px] font-black text-[#333333]">Credit / Debit Card / UPI</span>
                                    </label>
                                    
                                    {/* Bank Transfer Option */}
                                    <label onClick={() => setPaymentMethod('bank_transfer')} className={`flex items-center p-4 cursor-pointer transition-colors ${paymentMethod === 'bank_transfer' ? 'bg-[#FAFAFA]' : 'bg-[#FFFFFF] hover:bg-[#F5F5F5]'}`}>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${paymentMethod === 'bank_transfer' ? 'border-[#E7364D]' : 'border-[#A3A3A3]/50'}`}>
                                            {paymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 bg-[#E7364D] rounded-full" />}
                                        </div>
                                        <Building size={24} className="text-[#333333] mr-3" />
                                        <span className="text-[15px] font-black text-[#333333]">Direct Bank Escrow</span>
                                    </label>
                                </div>
                            )}

                            {paymentMethod === 'bank_transfer' && !isTestAdmin && (
                                <div className="mb-6 p-5 border border-[#A3A3A3]/20 rounded-[8px] bg-[#F5F5F5]">
                                    <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-2 flex items-center"><Building size={14} className="mr-1.5"/> Escrow Trust Address</p>
                                    <h3 className="text-[18px] font-black text-[#333333] mb-4">booknshow.escrow@icici</h3>
                                    <div className="relative border-2 border-dashed border-[#A3A3A3]/50 rounded-[8px] p-6 flex flex-col items-center justify-center bg-[#FFFFFF] cursor-pointer hover:border-[#E7364D] transition-colors">
                                        <input type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        {isUploading ? <Loader2 className="animate-spin text-[#E7364D]" size={24} /> : receiptUrl ? <CheckCircle2 className="text-[#333333]" size={24} /> : <UploadCloud size={24} className="text-[#A3A3A3]" />}
                                        <p className="text-[13px] font-bold mt-2 text-[#626262]">{receiptUrl ? 'Cryptographic Proof Attached' : 'Upload Payment Screenshot'}</p>
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleFinalPayment} 
                                disabled={isProcessingOrder || (!isTestAdmin && paymentMethod === 'bank_transfer' && !receiptUrl) || isUploading}
                                className="w-full bg-[#333333] text-[#FFFFFF] font-black tracking-wide py-4 rounded-[8px] hover:bg-[#E7364D] transition-colors text-[16px] flex justify-center items-center disabled:opacity-50 shadow-[0_4px_20px_rgba(51,51,51,0.3)]"
                            >
                                {isProcessingOrder ? <Loader2 className="animate-spin mr-2" /> : null}
                                {isTestAdmin ? 'Execute Diagnostic Checkout' : 'Pay and Confirm Order'}
                            </button>
                            <p className="text-center text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-4 flex items-center justify-center"><Lock size={12} className="mr-1"/> 256-bit AES Encryption</p>
                        </motion.div>
                    )}
                </div>

                {/* RIGHT COLUMN: Sticky Order Summary */}
                <aside className="w-full lg:w-[400px]">
                    <div className="sticky top-10">
                        <div className="border border-[#A3A3A3]/20 rounded-[12px] bg-[#FFFFFF] overflow-hidden shadow-sm mb-6">
                            
                            {/* Embedded Timer */}
                            <div className="bg-[#FAFAFA] border-b border-[#A3A3A3]/20 py-3 px-5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-[#333333]" />
                                    <span className="text-[14px] font-black text-[#333333] uppercase tracking-wider">Time left to buy</span>
                                </div>
                                <span className="text-[16px] font-black text-[#E7364D] tabular-nums">{timeLeft}</span>
                            </div>
                            
                            <div className="p-6">
                                {/* Event Snapshot */}
                                <div className="flex justify-between items-start pb-5 border-b border-[#A3A3A3]/20 mb-5">
                                    <div className="pr-4">
                                        <p className="text-[11px] text-[#E7364D] font-bold uppercase tracking-widest mb-1">Live Event</p>
                                        <h3 className="font-black text-[18px] text-[#333333] leading-tight mb-2">{localListing?.eventName || 'Loading...'}</h3>
                                        <p className="text-[13px] font-medium text-[#626262] flex items-center"><MapPin size={14} className="mr-1"/> {localListing?.eventLoc || '---'}</p>
                                    </div>
                                    <img src={localListing?.imageUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200"} alt="Event" className="w-16 h-12 object-cover rounded-[6px] shrink-0 border border-[#A3A3A3]/20" />
                                </div>

                                {/* Section & Details */}
                                <div className="flex justify-between items-center pb-5 border-b border-[#A3A3A3]/20 mb-5">
                                    <div>
                                        <h4 className="font-black text-[15px] text-[#333333] mb-1">Tier: {localListing?.tierName || '---'}</h4>
                                        <p className="text-[13px] font-medium text-[#626262]">{selectedQty} Tickets Reserved</p>
                                    </div>
                                    <button onClick={() => setDetailsModalOpen(true)} className="bg-[#F5F5F5] text-[#333333] border border-[#A3A3A3]/30 text-[12px] font-black uppercase tracking-widest px-4 py-2 rounded-[6px] hover:text-[#E7364D] transition-colors">Details</button>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-2 mb-5">
                                    <div className="flex justify-between text-[14px] font-bold text-[#626262]">
                                        <span>Subtotal ({selectedQty} × ₹{Math.round(localListing?.price || 0).toLocaleString()})</span>
                                        <span className={isTestAdmin && adminTestMode === 'sandbox' ? "text-[#E7364D] line-through" : "text-[#333333]"}>₹{Math.round(totals.subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[14px] font-bold text-[#626262]">
                                        <span>Platform Fees & Tax</span>
                                        <span className={isTestAdmin && adminTestMode === 'sandbox' ? "text-[#E7364D] line-through" : "text-[#333333]"}>₹{Math.round(totals.fees + totals.tax).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[20px] font-black text-[#333333] pt-4 border-t border-[#A3A3A3]/20 mt-4">
                                        <span>Total</span>
                                        <span className={isTestAdmin ? "text-[#E7364D] line-through" : "text-[#333333]"}>₹{Math.round(totals.total).toLocaleString()}</span>
                                    </div>
                                    {isTestAdmin && (
                                        <div className="flex justify-between text-[20px] font-black text-[#E7364D]">
                                            <span className="flex items-center gap-2"><Activity size={18}/> Override Active</span>
                                            <span>₹{adminTestMode === 'sandbox' ? '50' : '0'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Interactive Quantity Selector */}
                                <div className="flex gap-3">
                                    <div className="relative w-24 shrink-0">
                                        <select 
                                            value={selectedQty}
                                            onChange={(e) => setSelectedQty(Number(e.target.value))}
                                            className="w-full border border-[#A3A3A3]/40 rounded-[6px] px-3 py-2.5 text-[15px] font-black text-[#333333] bg-[#FAFAFA] appearance-none outline-none focus:border-[#E7364D] cursor-pointer"
                                        >
                                            {[...Array(Math.min(10, localListing?.maxQuantity || 1))].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] pointer-events-none" />
                                    </div>
                                    <button className="flex-1 bg-[#F5F5F5] text-[#A3A3A3] border border-[#A3A3A3]/20 font-black uppercase tracking-widest text-[12px] rounded-[6px] cursor-not-allowed">
                                        Quantity Locked
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Guarantees */}
                        <div className="space-y-6 px-2">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#E7364D] flex items-center justify-center shrink-0 mt-0.5"><ShieldCheck size={16} className="text-[#FFFFFF]" /></div>
                                <div>
                                    <h4 className="font-black text-[14px] text-[#333333] mb-1">100% Institutional Guarantee</h4>
                                    <p className="text-[13px] text-[#626262] font-medium leading-relaxed">Every order is fully backed. Buy and sell with total confidence on Booknshow.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}