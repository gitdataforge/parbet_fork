import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, CreditCard, Ticket, Clock, Check, 
    ChevronDown, ChevronRight, ChevronUp, Lock, MapPin, Truck, 
    User, Mail, Phone, Info, Zap, UploadCloud, FileText, Building, 
    CheckCircle2, ShieldAlert, Navigation
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { initiatePayUPayment } from '../../services/payuApi';
import { uploadToCloudinary } from '../../services/cloudinaryApi';

// Internal components for modular layout
import EmailConfirmationModal from '../../components/EmailConfirmationModal';

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const listingId = searchParams.get('listingId');
    const navigate = useNavigate();
    
    const { 
        user, balance, isAuthenticated, openAuthModal,
        checkoutStep, setCheckoutStep,
        checkoutFormData, updateCheckoutFormData,
        checkoutExpiration, startCheckoutTimer, resetCheckoutTimer
    } = useAppStore();

    // Data States
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(true);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    // FEATURE 1: Advanced Checkout States
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'paypal' | 'bank_transfer'
    const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
    
    // FEATURE 2: Cloudinary Upload States
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState('');
    const [receiptUrl, setReceiptUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    // 1. Initial Load & Auth Check
    useEffect(() => {
        if (!isAuthenticated) return openAuthModal();
        if (!listingId) return navigate('/');

        const fetchListing = async () => {
            try {
                const docRef = doc(db, 'listings', listingId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setListing({ id: docSnap.id, ...docSnap.data() });
                    if (user?.email && !checkoutFormData.contact.email) {
                        updateCheckoutFormData('contact', { email: user.email });
                    }
                } else {
                    setError('Listing no longer available.');
                }
            } catch (err) {
                setError('Failed to load secure checkout.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [listingId, isAuthenticated]);

    // 2. Countdown Timer Logic
    useEffect(() => {
        if (!checkoutExpiration) return;
        const interval = setInterval(() => {
            const diff = checkoutExpiration - Date.now();
            if (diff <= 0) {
                clearInterval(interval);
                resetCheckoutTimer();
                navigate('/'); // FEATURE 3: Idle Session Protection Routing
                return;
            }
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [checkoutExpiration]);

    // 3. Price Calculations
    const totals = useMemo(() => {
        if (!listing) return { subtotal: 0, fees: 0, tax: 0, total: 0 };
        const subtotal = listing.price * (listing.quantity || 1);
        const fees = subtotal * 0.15; // 15% marketplace fee
        const tax = fees * 0.18; // 18% GST on fees
        return { subtotal, fees, tax, total: subtotal + fees + tax };
    }, [listing]);

    const handleStartCheckout = () => {
        setIsTimerModalOpen(false);
        startCheckoutTimer();
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        setIsEmailModalOpen(true);
    };

    const handleEmailConfirm = () => {
        setIsEmailModalOpen(false);
        setCheckoutStep(2);
    };

    // FEATURE 4: Real-time Cloudinary Receipt Upload Logic
    const handleReceiptSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setReceiptFile(file);
        setReceiptPreview(URL.createObjectURL(file));
        setIsUploading(true);
        setError('');

        try {
            const result = await uploadToCloudinary(file, `receipts/${user.uid}`);
            setReceiptUrl(result.url);
        } catch (err) {
            console.error("Upload Error:", err);
            setError('Failed to upload receipt to secure server. Please try again.');
            setReceiptFile(null);
            setReceiptPreview('');
        } finally {
            setIsUploading(false);
        }
    };

    // Secure Order Finalization
    const handleFinalPayment = async () => {
        setIsProcessingOrder(true);
        try {
            if (paymentMethod === 'card') {
                await initiatePayUPayment({
                    totalAmount: totals.total,
                    eventName: listing.eventName,
                    firstName: checkoutFormData.contact.firstName,
                    lastName: checkoutFormData.contact.lastName,
                    email: checkoutFormData.contact.email,
                    phone: checkoutFormData.contact.phone
                });
            } else if (paymentMethod === 'bank_transfer') {
                if (!receiptUrl) throw new Error("Please upload the payment receipt before finalizing.");
                
                // Write manual transfer order to Firestore
                const newOrderRef = doc(collection(db, 'orders'));
                await setDoc(newOrderRef, {
                    orderId: newOrderRef.id,
                    buyerId: user.uid,
                    sellerId: listing.sellerId || 'system',
                    listingId: listing.id,
                    eventName: listing.eventName,
                    totalAmount: totals.total,
                    status: 'pending_verification', // Requires admin verification
                    receiptUrl: receiptUrl,
                    createdAt: serverTimestamp(),
                    deliveryData: checkoutFormData.delivery,
                    addressData: checkoutFormData.address
                });
                
                resetCheckoutTimer();
                navigate(`/order-confirmation/${newOrderRef.id}`);
            }
        } catch (err) {
            setError(err.message || 'Payment initialization failed. Please try again.');
        } finally {
            setIsProcessingOrder(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F6F8] pb-20 relative overflow-hidden">
            
            {/* SECTION 1: Animated High-End SVG Topography Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.svg 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 w-full h-full opacity-[0.03]" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="checkoutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#114C2A', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#458731', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    {[...Array(20)].map((_, i) => (
                        <motion.path
                            key={i}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 5 + i * 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                            d={`M-200 ${150 + i * 50} Q 400 ${-50 + i * 80} 800 ${350 + i * 30} T 1800 ${150 + i * 70}`}
                            fill="none" stroke="url(#checkoutGrad)" strokeWidth={1 + (i % 2)}
                        />
                    ))}
                </motion.svg>
            </div>

            <AnimatePresence>
                {isTimerModalOpen && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white rounded-[24px] p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#EAF4D9]">
                                <motion.div 
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: 10, ease: 'linear' }}
                                    className="h-full bg-[#114C2A]"
                                />
                            </div>
                            <div className="w-20 h-20 bg-[#EAF4D9] rounded-full flex items-center justify-center mx-auto mb-6 mt-2 relative">
                                <Clock size={40} className="text-[#114C2A]" />
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border-2 border-dashed border-[#114C2A]/30 rounded-full" />
                            </div>
                            <h2 className="text-[26px] font-black text-brand-text mb-3">We've reserved your tickets!</h2>
                            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                Due to high demand, we can only hold these tickets for <strong>10 minutes</strong>. Please complete your purchase before the timer runs out.
                            </p>
                            <button 
                                onClick={handleStartCheckout}
                                className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                            >
                                Continue to checkout
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <EmailConfirmationModal 
                isOpen={isEmailModalOpen} 
                onConfirm={handleEmailConfirm} 
                onCancel={() => setIsEmailModalOpen(false)} 
            />

            {/* Header with Sticky Timer */}
            <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 px-4 py-4 md:px-8 shadow-sm">
                <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                    <h1 onClick={() => navigate('/')} className="text-2xl font-black tracking-tighter text-[#114C2A] cursor-pointer flex items-center">
                        <ShieldCheck size={28} className="mr-2" /> parbet
                    </h1>
                    <div className="flex items-center bg-red-50 text-[#E91E63] px-4 py-2 rounded-full border border-red-100 shadow-sm">
                        <Clock size={18} className="mr-2 animate-pulse" />
                        <span className="text-[15px] font-black tracking-wider">{timeLeft || '10:00'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto mt-8 px-4 flex flex-col lg:flex-row gap-8 relative z-10">
                
                {/* LEFT COLUMN: The Steps Wizard */}
                <div className="flex-1 space-y-5">

                    {/* Global Error Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl font-bold flex items-center shadow-sm">
                                <ShieldAlert size={20} className="mr-3 shrink-0" /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <CheckoutStep 
                        number={1} title="Contact Information" 
                        isActive={checkoutStep === 1} isDone={checkoutStep > 1}
                        onHeaderClick={() => checkoutStep > 1 && setCheckoutStep(1)}
                    >
                        <form onSubmit={handleStep1Submit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput label="First Name" value={checkoutFormData.contact.firstName} onChange={(v) => updateCheckoutFormData('contact', { firstName: v })} />
                                <FloatingInput label="Last Name" value={checkoutFormData.contact.lastName} onChange={(v) => updateCheckoutFormData('contact', { lastName: v })} />
                            </div>
                            <FloatingInput label="Email Address" type="email" value={checkoutFormData.contact.email} onChange={(v) => updateCheckoutFormData('contact', { email: v })} />
                            <div className="flex gap-3">
                                <div className="w-24"><FloatingInput label="Code" value={checkoutFormData.contact.countryCode} disabled /></div>
                                <div className="flex-1"><FloatingInput label="Phone Number" type="tel" value={checkoutFormData.contact.phone} onChange={(v) => updateCheckoutFormData('contact', { phone: v })} /></div>
                            </div>
                            <button type="submit" className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl mt-4 shadow-md hover:bg-[#0c361d] transition-colors">Continue</button>
                        </form>
                    </CheckoutStep>

                    <CheckoutStep 
                        number={2} title="Delivery Method" 
                        isActive={checkoutStep === 2} isDone={checkoutStep > 2}
                        onHeaderClick={() => checkoutStep > 2 && setCheckoutStep(2)}
                    >
                        <div className="pt-4 space-y-6">
                            <div className="p-5 bg-[#F0F7FF] border border-[#D0E5FF] rounded-xl flex gap-4 shadow-inner">
                                <Zap className="text-blue-600 shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="font-black text-brand-text text-[16px]">Mobile Ticket Transfer</h4>
                                    <p className="text-[14px] text-gray-600 mt-1 font-medium leading-relaxed">
                                        These tickets will be transferred directly to your email via the official venue application (e.g., Ticketmaster, AXS).
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <FloatingInput label="Recipient Full Name (Must match ID)" value={checkoutFormData.delivery.fullName} onChange={(v) => updateCheckoutFormData('delivery', { fullName: v })} />
                                <FloatingInput label="Recipient Mobile Phone" value={checkoutFormData.delivery.phone} onChange={(v) => updateCheckoutFormData('delivery', { phone: v })} />
                            </div>
                            <button onClick={() => setCheckoutStep(3)} className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl shadow-md hover:bg-[#0c361d] transition-colors">Continue</button>
                        </div>
                    </CheckoutStep>

                    <CheckoutStep 
                        number={3} title="Billing Address" 
                        isActive={checkoutStep === 3} isDone={checkoutStep > 3}
                        onHeaderClick={() => checkoutStep > 3 && setCheckoutStep(3)}
                    >
                        <div className="pt-4 space-y-4">
                            <div className="relative group">
                                <label className="text-[11px] font-black text-gray-400 absolute left-4 top-2 uppercase tracking-widest z-10 transition-colors group-focus-within:text-[#114C2A]">Country</label>
                                <select 
                                    className="w-full p-4 pt-7 rounded-xl border border-gray-300 font-bold bg-white text-gray-900 outline-none focus:border-[#114C2A] focus:ring-1 focus:ring-[#114C2A] relative appearance-none"
                                    value={checkoutFormData.address.country}
                                    onChange={(e) => updateCheckoutFormData('address', { country: e.target.value })}
                                >
                                    <option>India</option>
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                    <option>United Arab Emirates</option>
                                </select>
                                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <FloatingInput label="Address Line 1" value={checkoutFormData.address.line1} onChange={(v) => updateCheckoutFormData('address', { line1: v })} />
                            <div className="grid grid-cols-2 gap-4">
                                <FloatingInput label="City" value={checkoutFormData.address.city} onChange={(v) => updateCheckoutFormData('address', { city: v })} />
                                <FloatingInput label="ZIP / Postcode" value={checkoutFormData.address.zip} onChange={(v) => updateCheckoutFormData('address', { zip: v })} />
                            </div>
                            <button onClick={() => setCheckoutStep(4)} className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl shadow-md hover:bg-[#0c361d] transition-colors">Continue</button>
                        </div>
                    </CheckoutStep>

                    <CheckoutStep 
                        number={4} title="Payment Method" 
                        isActive={checkoutStep === 4} isDone={checkoutStep > 4}
                        onHeaderClick={() => checkoutStep > 4 && setCheckoutStep(4)}
                    >
                        <div className="pt-4 space-y-4">
                            <div onClick={() => setPaymentMethod('card')} className="w-full text-left">
                                <PaymentOption 
                                    icon={<CreditCard size={24} />} label="Credit / Debit Card" 
                                    description="Instant processing via PayU India." active={paymentMethod === 'card'}
                                />
                            </div>
                            <div onClick={() => setPaymentMethod('paypal')} className="w-full text-left">
                                <PaymentOption 
                                    icon={<img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" className="h-6 rounded-md" alt="PayPal" />} 
                                    label="PayPal Gateway" description="Fast and secure global payments." active={paymentMethod === 'paypal'}
                                />
                            </div>
                            <div onClick={() => setPaymentMethod('bank_transfer')} className="w-full text-left">
                                <PaymentOption 
                                    icon={<Building size={24} />} label="Manual Bank / UPI Transfer" 
                                    description="Zero processing fees. Requires receipt upload." active={paymentMethod === 'bank_transfer'}
                                />
                            </div>
                            
                            <button 
                                onClick={() => paymentMethod === 'bank_transfer' ? setCheckoutStep(5) : handleFinalPayment()}
                                disabled={isProcessingOrder}
                                className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl text-lg shadow-xl hover:bg-[#0c361d] transition-all disabled:opacity-70 mt-6"
                            >
                                {isProcessingOrder ? 'Processing...' : paymentMethod === 'bank_transfer' ? 'Continue to Transfer Proof' : `Pay ₹${totals.total.toLocaleString()}`}
                            </button>
                        </div>
                    </CheckoutStep>

                    {/* SECTION 2: Cloudinary Upload Dropzone (Step 5) */}
                    <AnimatePresence>
                        {checkoutStep === 5 && paymentMethod === 'bank_transfer' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                <CheckoutStep number={5} title="Transfer Proof Required" isActive={true} isDone={false}>
                                    <div className="pt-4 space-y-6">
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                                            <h4 className="font-black text-gray-900 text-lg mb-2">Parbet Escrow Account</h4>
                                            <p className="text-gray-500 font-medium text-[14px] mb-4">Please transfer <strong className="text-gray-900">₹{totals.total.toLocaleString()}</strong> to the following UPI ID or Bank Account.</p>
                                            <div className="bg-white border border-gray-300 p-3 rounded-lg inline-block font-mono text-[16px] font-bold text-[#114C2A] tracking-wider">
                                                parbet.escrow@icici
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <input 
                                                type="file" accept="image/*,.pdf" onChange={handleReceiptSelect} disabled={isUploading}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
                                            />
                                            <div className={`w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all relative ${receiptPreview ? 'border-[#114C2A] bg-[#114C2A]/5' : 'border-gray-300 bg-gray-50 group-hover:border-[#114C2A] group-hover:bg-[#114C2A]/5'}`}>
                                                {isUploading ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin mb-4"></div>
                                                        <p className="font-bold text-[#114C2A]">Encrypting & Uploading...</p>
                                                    </div>
                                                ) : receiptPreview ? (
                                                    <div className="flex flex-col items-center">
                                                        <CheckCircle2 size={48} className="text-[#458731] mb-3" />
                                                        <p className="font-bold text-gray-900">Receipt Attached Successfully</p>
                                                        <p className="text-[12px] text-gray-500 font-medium mt-1">Powered by Cloudinary CDN</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-400 group-hover:text-[#114C2A] transition-colors">
                                                        <UploadCloud size={48} className="mb-4" />
                                                        <h4 className="font-black text-[16px] text-gray-700">Click or Drag to upload receipt</h4>
                                                        <p className="text-[13px] font-medium mt-2">Supports JPG, PNG, or PDF (Max 5MB)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleFinalPayment}
                                            disabled={!receiptUrl || isProcessingOrder}
                                            className="w-full bg-[#458731] text-white font-black py-4 rounded-xl text-lg shadow-xl hover:bg-[#386d27] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                        >
                                            {isProcessingOrder ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify & Complete Order'}
                                        </button>
                                    </div>
                                </CheckoutStep>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT COLUMN: Summary & Sections */}
                <div className="w-full lg:w-[420px] space-y-6">
                    
                    {/* Order Summary */}
                    <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-xl sticky top-24">
                        <div className="p-6 border-b border-gray-100 bg-[#114C2A] text-white">
                            <h2 className="text-xl font-black mb-4">Order Summary</h2>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-sm">
                                    <Ticket size={28} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-[18px] leading-tight">{listing?.eventName}</h3>
                                    <p className="text-[13px] text-green-100 font-bold mt-1">{listing?.eventDate}</p>
                                    <p className="text-[13px] text-green-200 font-medium truncate max-w-[200px] flex items-center mt-0.5"><MapPin size={12} className="mr-1"/> {listing?.eventLoc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 bg-white">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-[15px] font-bold text-gray-700">Quantity Selected</span>
                                <span className="font-black text-[16px] text-[#114C2A] bg-[#EAF4D9] px-3 py-1 rounded-lg">{listing?.quantity || 1} Ticket(s)</span>
                            </div>
                            
                            {/* FEATURE 4: Advanced Cost Breakdown Accordion */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                                    className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-gray-700">Cost Breakdown</span>
                                    {showFeeBreakdown ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                                </button>
                                <AnimatePresence>
                                    {showFeeBreakdown && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-gray-50 border-t border-gray-100">
                                            <div className="p-4 space-y-3">
                                                <div className="flex justify-between text-[14px] font-medium text-gray-600">
                                                    <span>Base Price (x{listing?.quantity || 1})</span>
                                                    <span>₹{totals.subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-[14px] font-medium text-gray-600">
                                                    <span>Platform Fees (15%)</span>
                                                    <span>₹{Math.round(totals.fees).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-[14px] font-medium text-gray-600">
                                                    <span>Estimated Taxes (GST)</span>
                                                    <span>₹{Math.round(totals.tax).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-[14px] font-bold text-[#458731]">
                                                    <span>Digital Delivery</span>
                                                    <span className="uppercase">Free</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                <div>
                                    <span className="text-[14px] font-bold text-gray-500 block uppercase tracking-wider">Total Due</span>
                                    <span className="text-[28px] font-black text-brand-text leading-none mt-1 block">₹{Math.round(totals.total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Trust & Safety Guarantee Panel */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#EAF4D9] rounded-full flex items-center justify-center text-[#114C2A]">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="font-black text-[18px] text-gray-900">Parbet 100% Guarantee</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start text-[13px] font-medium text-gray-600">
                                <Check size={16} className="text-[#458731] mr-2 shrink-0 mt-0.5" /> Authentic tickets delivered in time for the event.
                            </li>
                            <li className="flex items-start text-[13px] font-medium text-gray-600">
                                <Check size={16} className="text-[#458731] mr-2 shrink-0 mt-0.5" /> Full refund if the event is canceled and not rescheduled.
                            </li>
                            <li className="flex items-start text-[13px] font-medium text-gray-600">
                                <Check size={16} className="text-[#458731] mr-2 shrink-0 mt-0.5" /> Secure transactions backed by enterprise encryption.
                            </li>
                        </ul>
                    </div>

                    {/* SECTION 4: Post-Purchase Delivery Timeline */}
                    <div className="bg-gray-900 rounded-2xl p-6 shadow-sm text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <h3 className="font-black text-[16px] mb-6 flex items-center"><Navigation size={18} className="mr-2 text-green-400"/> What happens next?</h3>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-green-400 before:via-green-500/20 before:to-transparent">
                            <div className="relative flex items-center gap-4 pl-8 md:pl-0 md:justify-center">
                                <div className="absolute left-0 md:left-1/2 md:-ml-3.5 w-7 h-7 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center shadow-lg z-10"><Check size={12} className="text-white"/></div>
                                <div className="md:w-1/2 md:pr-8 text-left md:text-right hidden md:block"></div>
                                <div className="md:w-1/2 md:pl-8 text-left">
                                    <h4 className="text-[14px] font-bold">Payment Secured</h4>
                                    <p className="text-[12px] text-gray-400 font-medium">Funds locked in escrow.</p>
                                </div>
                            </div>
                            <div className="relative flex items-center gap-4 pl-8 md:pl-0 md:justify-center">
                                <div className="absolute left-0 md:left-1/2 md:-ml-3.5 w-7 h-7 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center z-10"><div className="w-2 h-2 bg-gray-500 rounded-full"></div></div>
                                <div className="md:w-1/2 md:pr-8 text-left md:text-right hidden md:block">
                                    <h4 className="text-[14px] font-bold">Seller Notified</h4>
                                    <p className="text-[12px] text-gray-400 font-medium">Transfer process initiated.</p>
                                </div>
                                <div className="md:w-1/2 md:pl-8 text-left md:hidden">
                                    <h4 className="text-[14px] font-bold">Seller Notified</h4>
                                    <p className="text-[12px] text-gray-400 font-medium">Transfer process initiated.</p>
                                </div>
                            </div>
                            <div className="relative flex items-center gap-4 pl-8 md:pl-0 md:justify-center">
                                <div className="absolute left-0 md:left-1/2 md:-ml-3.5 w-7 h-7 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center z-10"><div className="w-2 h-2 bg-gray-500 rounded-full"></div></div>
                                <div className="md:w-1/2 md:pr-8 text-left md:text-right hidden md:block"></div>
                                <div className="md:w-1/2 md:pl-8 text-left">
                                    <h4 className="text-[14px] font-bold">Tickets Sent</h4>
                                    <p className="text-[12px] text-gray-400 font-medium">Check email for venue link.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// UI HELPERS
// ------------------------------------------------------------------

function CheckoutStep({ number, title, isActive, isDone, children, onHeaderClick }) {
    return (
        <div className={`bg-white border rounded-[20px] overflow-hidden transition-all duration-300 relative ${isActive ? 'border-[#114C2A] shadow-lg ring-2 ring-[#114C2A]/20 z-20' : 'border-gray-200 z-10'}`}>
            <div 
                onClick={onHeaderClick}
                className={`p-6 flex items-center justify-between ${onHeaderClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${isActive ? 'bg-white' : 'bg-gray-50/50'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px] transition-colors ${isDone ? 'bg-[#458731] text-white shadow-md' : isActive ? 'bg-[#114C2A] text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                        {isDone ? <Check size={20} strokeWidth={3} /> : number}
                    </div>
                    <h3 className={`text-[19px] font-black tracking-tight ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{title}</h3>
                </div>
                {!isActive && !isDone && <ChevronRight size={24} className="text-gray-300" />}
                {isDone && <span className="text-[14px] font-bold text-[#458731] uppercase tracking-wider hover:underline">Edit</span>}
            </div>
            <motion.div 
                initial={false}
                animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                className="overflow-hidden px-6"
            >
                <div className="pb-8">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

function FloatingInput({ label, type = 'text', value, onChange, disabled }) {
    return (
        <div className="relative group">
            <input 
                type={type} value={value} disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 pt-7 pb-3 font-bold text-gray-900 outline-none focus:border-[#114C2A] focus:ring-4 focus:ring-[#114C2A]/10 transition-all placeholder-shown:pt-5 placeholder-shown:pb-5 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <label className="absolute left-4 top-2.5 text-[11px] font-black text-gray-400 uppercase tracking-widest transition-all pointer-events-none group-focus-within:text-[#114C2A]">
                {label}
            </label>
        </div>
    );
}

function PaymentOption({ icon, label, description, active }) {
    return (
        <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${active ? 'border-[#114C2A] bg-[#F0F7FF] shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-[#114C2A]' : 'border-gray-300'}`}>
                {active && <div className="w-3 h-3 bg-[#114C2A] rounded-full"></div>}
            </div>
            <div className="text-gray-700 shrink-0 bg-white p-2 rounded-lg shadow-sm border border-gray-100">{icon}</div>
            <div className="flex-1">
                <h4 className={`font-black text-[16px] leading-tight ${active ? 'text-[#114C2A]' : 'text-gray-800'}`}>{label}</h4>
                <p className="text-[13px] text-gray-500 font-medium mt-0.5">{description}</p>
            </div>
        </div>
    );
}