import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, CreditCard, Ticket, Clock, Check, 
    ChevronDown, ChevronRight, Lock, MapPin, Truck, 
    User, Mail, Phone, Info, Zap 
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { initiatePayUPayment } from '../../services/payuApi';

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
        checkoutExpiration, startCheckoutTimer, resetCheckoutTimer,
        userCurrency
    } = useAppStore();

    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(true);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

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
                    // Pre-fill email if user is logged in
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
                navigate('/'); // Redirect on timeout
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
        if (!listing) return { subtotal: 0, fees: 0, total: 0 };
        const subtotal = listing.price * (listing.quantity || 1);
        const fees = subtotal * 0.15; // 15% marketplace fee
        return {
            subtotal,
            fees,
            total: subtotal + fees
        };
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

    const handleFinalPayment = async () => {
        try {
            await initiatePayUPayment({
                totalAmount: totals.total,
                eventName: listing.eventName,
                firstName: checkoutFormData.contact.firstName,
                lastName: checkoutFormData.contact.lastName,
                email: checkoutFormData.contact.email,
                phone: checkoutFormData.contact.phone
            });
        } catch (err) {
            setError('Payment initialization failed. Please try again.');
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F6F8] pb-20">
            {/* 10-Minute Reservation Modal (image_e8432c.png) */}
            <AnimatePresence>
                {isTimerModalOpen && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[24px] p-8 max-w-md w-full text-center shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-[#EAF4D9] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock size={40} className="text-[#114C2A]" />
                            </div>
                            <h2 className="text-[26px] font-black text-brand-text mb-3">We've reserved your tickets!</h2>
                            <p className="text-gray-500 font-medium mb-8">
                                Due to high demand, we can only hold these tickets for 10 minutes. Please complete your purchase before the timer runs out.
                            </p>
                            <button 
                                onClick={handleStartCheckout}
                                className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl text-lg shadow-lg hover:bg-[#0c361d] transition-all"
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

            {/* Header with Timer */}
            <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-4 md:px-8 shadow-sm">
                <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                    <h1 onClick={() => navigate('/')} className="text-2xl font-black tracking-tighter text-brand-text cursor-pointer">parbet</h1>
                    <div className="flex items-center bg-red-50 text-[#E91E63] px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                        <Clock size={16} className="mr-2" />
                        <span className="text-[14px] font-black">{timeLeft || '10:00'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto mt-8 px-4 flex flex-col lg:flex-row gap-8">
                
                {/* LEFT COLUMN: The Steps Wizard */}
                <div className="flex-1 space-y-4">
                    
                    {/* STEP 1: Contact Info (image_f22984.png) */}
                    <CheckoutStep 
                        number={1} title="Contact Information" 
                        isActive={checkoutStep === 1} isDone={checkoutStep > 1}
                        onHeaderClick={() => checkoutStep > 1 && setCheckoutStep(1)}
                    >
                        <form onSubmit={handleStep1Submit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput 
                                    label="First Name" value={checkoutFormData.contact.firstName}
                                    onChange={(v) => updateCheckoutFormData('contact', { firstName: v })}
                                />
                                <FloatingInput 
                                    label="Last Name" value={checkoutFormData.contact.lastName}
                                    onChange={(v) => updateCheckoutFormData('contact', { lastName: v })}
                                />
                            </div>
                            <FloatingInput 
                                label="Email Address" type="email" value={checkoutFormData.contact.email}
                                onChange={(v) => updateCheckoutFormData('contact', { email: v })}
                            />
                            <div className="flex gap-3">
                                <div className="w-24">
                                    <FloatingInput label="Code" value={checkoutFormData.contact.countryCode} disabled />
                                </div>
                                <div className="flex-1">
                                    <FloatingInput 
                                        label="Phone Number" type="tel" value={checkoutFormData.contact.phone}
                                        onChange={(v) => updateCheckoutFormData('contact', { phone: v })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl mt-4 shadow-md">
                                Continue
                            </button>
                        </form>
                    </CheckoutStep>

                    {/* STEP 2: Delivery Method (image_f23147.png) */}
                    <CheckoutStep 
                        number={2} title="Delivery Method" 
                        isActive={checkoutStep === 2} isDone={checkoutStep > 2}
                        onHeaderClick={() => checkoutStep > 2 && setCheckoutStep(2)}
                    >
                        <div className="pt-4 space-y-6">
                            <div className="p-4 bg-[#F0F7FF] border border-[#D0E5FF] rounded-xl flex gap-4">
                                <Zap className="text-blue-600 shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold text-brand-text">Mobile Transfer</h4>
                                    <p className="text-[13px] text-gray-600 mt-1">
                                        These tickets will be transferred to your account via the official venue app.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <FloatingInput 
                                    label="Recipient Full Name" value={checkoutFormData.delivery.fullName}
                                    onChange={(v) => updateCheckoutFormData('delivery', { fullName: v })}
                                />
                                <FloatingInput 
                                    label="Recipient Phone" value={checkoutFormData.delivery.phone}
                                    onChange={(v) => updateCheckoutFormData('delivery', { phone: v })}
                                />
                            </div>
                            <button 
                                onClick={() => setCheckoutStep(3)}
                                className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl shadow-md"
                            >
                                Continue
                            </button>
                        </div>
                    </CheckoutStep>

                    {/* STEP 3: Billing Address (image_f2382d.png) */}
                    <CheckoutStep 
                        number={3} title="Delivery Address" 
                        isActive={checkoutStep === 3} isDone={checkoutStep > 3}
                        onHeaderClick={() => checkoutStep > 3 && setCheckoutStep(3)}
                    >
                        <div className="pt-4 space-y-4">
                            <div className="relative">
                                <label className="text-[11px] font-bold text-gray-400 absolute left-4 top-2 uppercase">Country</label>
                                <select 
                                    className="w-full p-4 pt-7 rounded-xl border border-gray-300 font-bold bg-white"
                                    value={checkoutFormData.address.country}
                                    onChange={(e) => updateCheckoutFormData('address', { country: e.target.value })}
                                >
                                    <option>India</option>
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                </select>
                            </div>
                            <FloatingInput 
                                label="Address Line 1" value={checkoutFormData.address.line1}
                                onChange={(v) => updateCheckoutFormData('address', { line1: v })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FloatingInput 
                                    label="City" value={checkoutFormData.address.city}
                                    onChange={(v) => updateCheckoutFormData('address', { city: v })}
                                />
                                <FloatingInput 
                                    label="ZIP / Postcode" value={checkoutFormData.address.zip}
                                    onChange={(v) => updateCheckoutFormData('address', { zip: v })}
                                />
                            </div>
                            <button 
                                onClick={() => setCheckoutStep(4)}
                                className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl shadow-md"
                            >
                                Continue
                            </button>
                        </div>
                    </CheckoutStep>

                    {/* STEP 4: Payment (image_f23452.png) */}
                    <CheckoutStep 
                        number={4} title="Payment Method" 
                        isActive={checkoutStep === 4} isDone={false}
                    >
                        <div className="pt-4 space-y-4">
                            <PaymentOption 
                                icon={<CreditCard size={20} />} label="Credit / Debit Card" 
                                description="Secure via PayU India" active
                            />
                            <PaymentOption 
                                icon={<img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" className="h-5" alt="PayPal" />} 
                                label="PayPal" description="Fast and secure global payment"
                            />
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                                <Lock size={24} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-[13px] text-gray-500 font-medium">
                                    Your payment information is encrypted and never stored on our servers.
                                </p>
                            </div>
                            <button 
                                onClick={handleFinalPayment}
                                className="w-full bg-[#458731] text-white font-black py-4 rounded-xl text-lg shadow-xl hover:bg-[#386d27] transition-all"
                            >
                                Buy Now • ₹{totals.total.toLocaleString()}
                            </button>
                        </div>
                    </CheckoutStep>
                </div>

                {/* RIGHT COLUMN: Order Summary (image_e843a3.png) */}
                <div className="w-full lg:w-[400px]">
                    <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden sticky top-24 shadow-lg">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-black text-brand-text mb-4">Order Summary</h2>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 border border-gray-200">
                                    <Ticket size={24} className="text-[#114C2A]" />
                                </div>
                                <div>
                                    <h3 className="font-black text-[16px] text-brand-text leading-tight">{listing?.eventName}</h3>
                                    <p className="text-[13px] text-gray-500 font-bold mt-1">{listing?.eventDate}</p>
                                    <p className="text-[13px] text-gray-400 font-medium truncate max-w-[200px]">{listing?.eventLoc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-[14px] font-bold text-gray-600">Quantity</span>
                                <span className="font-black text-brand-text">{listing?.quantity || 1} Ticket(s)</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[14px] font-medium text-gray-500">
                                    <span>Tickets subtotal</span>
                                    <span>₹{totals.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[14px] font-medium text-gray-500">
                                    <span>Booking fees</span>
                                    <span>₹{totals.fees.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[14px] font-medium text-gray-500">
                                    <span>Delivery</span>
                                    <span className="text-[#458731] font-bold uppercase">Free</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-[18px] font-black text-brand-text">Total Price</span>
                                    <span className="text-[22px] font-black text-[#114C2A]">₹{totals.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-[#F8F9FA] border-t border-gray-100">
                            <div className="flex items-center gap-2 text-[#114C2A] font-bold text-[12px]">
                                <ShieldCheck size={16} />
                                <span>Parbet Guarantee Included</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// UI HELPERS (STRICTLY REPLICATING IMAGE STYLES)
// ------------------------------------------------------------------

function CheckoutStep({ number, title, isActive, isDone, children, onHeaderClick }) {
    return (
        <div className={`bg-white border rounded-[20px] overflow-hidden transition-all duration-300 ${isActive ? 'border-[#114C2A] shadow-md ring-1 ring-[#114C2A]' : 'border-gray-200'}`}>
            <div 
                onClick={onHeaderClick}
                className={`p-5 flex items-center justify-between ${onHeaderClick ? 'cursor-pointer' : ''} ${isActive ? 'bg-white' : 'bg-gray-50/50'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[14px] transition-colors ${isDone ? 'bg-[#458731] text-white' : isActive ? 'bg-[#114C2A] text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {isDone ? <Check size={16} strokeWidth={3} /> : number}
                    </div>
                    <h3 className={`text-[17px] font-black ${isActive ? 'text-brand-text' : 'text-gray-400'}`}>{title}</h3>
                </div>
                {!isActive && !isDone && <ChevronRight size={20} className="text-gray-300" />}
                {isDone && <span className="text-[13px] font-bold text-[#458731]">Change</span>}
            </div>
            <motion.div 
                initial={false}
                animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                className="overflow-hidden px-5"
            >
                <div className="pb-6">
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
                className="w-full bg-white border border-gray-300 rounded-xl px-4 pt-6 pb-2 font-bold text-brand-text outline-none focus:border-[#114C2A] focus:ring-1 focus:ring-[#114C2A] transition-all placeholder-shown:pt-4 placeholder-shown:pb-4 disabled:bg-gray-50"
            />
            <label className="absolute left-4 top-2 text-[10px] font-black text-gray-400 uppercase tracking-wider transition-all pointer-events-none group-focus-within:text-[#114C2A]">
                {label}
            </label>
        </div>
    );
}

function PaymentOption({ icon, label, description, active }) {
    return (
        <div className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${active ? 'border-[#114C2A] bg-[#F0F7FF]' : 'border-gray-100 hover:border-gray-300'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#114C2A]' : 'border-gray-300'}`}>
                {active && <div className="w-2.5 h-2.5 bg-[#114C2A] rounded-full"></div>}
            </div>
            <div className="text-gray-700">{icon}</div>
            <div className="flex-1">
                <h4 className="font-bold text-[15px] text-brand-text">{label}</h4>
                <p className="text-[12px] text-gray-500 font-medium">{description}</p>
            </div>
        </div>
    );
}