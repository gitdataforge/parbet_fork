import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Globe, DollarSign, Loader2 } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

export default function Signup() {
    const navigate = useNavigate();

    // FEATURE 1: Core Form States
    const [loginEmail, setLoginEmail] = useState('');
    const [stayLoggedIn, setStayLoggedIn] = useState(true);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // FEATURE 2: Modal & Registration States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [regForm, setRegForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+91',
        phone: '',
        password: '',
        smsConsent: false,
        marketingConsent: false
    });
    const [regError, setRegError] = useState('');

    // FEATURE 3: Feedback Tab States (1:1 Viagogo Replica)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);

    // Email Regex Validator
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // FEATURE 4: Secure Google Authentication Integration
    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/profile');
        } catch (error) {
            console.error("Google Auth Error:", error);
            setRegError("Failed to authenticate with Google.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // FEATURE 5: EmailJS OTP Generation & Transmission Pipeline
    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setRegError('');

        if (!regForm.firstName || !regForm.lastName || !regForm.email || !regForm.phone || !regForm.password) {
            setRegError("Please fill in all required fields.");
            return;
        }
        if (!regForm.smsConsent) {
            setRegError("You must agree to receive SMS for verification.");
            return;
        }
        if (!isValidEmail(regForm.email)) {
            setRegError("Please enter a valid email address.");
            return;
        }
        if (regForm.password.length < 6) {
            setRegError("Password must be at least 6 characters.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Generate secure 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // 2. Stage the registration payload in local storage for the next step
            localStorage.setItem('parbet_pending_seller', JSON.stringify({
                ...regForm,
                verificationCode: otpCode,
                timestamp: Date.now()
            }));

            // 3. Transmit OTP via EmailJS
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    to_email: regForm.email,
                    to_name: regForm.firstName,
                    otp_code: otpCode,
                    reply_to: "support@parbet.com"
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            // 4. Route to Verification Step
            navigate('/auth/verify');
        } catch (error) {
            console.error("OTP Transmission Failed:", error);
            setRegError("Failed to send verification email. Please try again later.");
            setIsSubmitting(false);
        }
    };

    // FEATURE 6: Firestore Feedback Submission Logic
    const handleFeedbackSubmit = async () => {
        if (!feedbackRating) return;
        setIsFeedbackSubmitting(true);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-seller-app';

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'feedback'), {
                rating: feedbackRating,
                comment: feedbackText,
                source: 'signup_page',
                timestamp: serverTimestamp()
            });
            setFeedbackSuccess(true);
            setTimeout(() => {
                setIsFeedbackOpen(false);
                setFeedbackSuccess(false);
                setFeedbackRating(null);
                setFeedbackText('');
            }, 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsFeedbackSubmitting(false);
        }
    };

    // FEATURE 7: Main Login Action (Routes to password entry or alerts)
    const handleContinue = () => {
        if (isValidEmail(loginEmail)) {
            // In a full flow, this checks if email exists. For now, route to password entry phase
            navigate(`/auth/login?email=${encodeURIComponent(loginEmail)}`);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
            
            {/* FEATURE 8: 1:1 Viagogo Login Box Architecture */}
            <div className="w-full max-w-[400px] px-4 py-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <h1 className="text-[42px] font-black tracking-tighter leading-none cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                    </h1>
                </div>

                <h2 className="text-[28px] font-bold text-[#54626c] text-center mb-8">Sign in to parbet</h2>

                {/* Email Input */}
                <div className="mb-4">
                    <input 
                        type="email"
                        placeholder="Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full border border-[#cccccc] rounded-[4px] px-4 py-3.5 text-[15px] text-[#1a1a1a] outline-none focus:border-[#458731] transition-colors"
                    />
                </div>

                {/* Checkbox */}
                <div className="flex items-center mb-6 cursor-pointer" onClick={() => setStayLoggedIn(!stayLoggedIn)}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${stayLoggedIn ? 'bg-[#8cc63f] border-[#8cc63f]' : 'border border-[#cccccc]'}`}>
                        {stayLoggedIn && <Check size={14} className="text-white" strokeWidth={4} />}
                    </div>
                    <span className="text-[15px] text-[#1a1a1a]">Stay logged in</span>
                </div>

                {/* Continue Button */}
                <button 
                    onClick={handleContinue}
                    disabled={!loginEmail}
                    className={`w-full py-3.5 rounded-[4px] font-bold text-[16px] transition-all mb-6 ${loginEmail ? 'bg-[#e2e2e2] text-[#1a1a1a] hover:bg-[#d4d4d4]' : 'bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed'}`}
                >
                    Continue
                </button>

                {/* Legal Text */}
                <p className="text-[12px] text-[#54626c] text-center mb-6 leading-relaxed px-2">
                    By signing in or creating an account, you agree to our <a href="#" className="text-[#0064d2] hover:underline">user agreement</a> and acknowledge our <a href="#" className="text-[#0064d2] hover:underline">privacy policy</a>. You may receive SMS notifications from us and can opt out at any time.
                </p>

                {/* Guest Purchase / Facebook / Google Logic */}
                <button className="w-full py-3.5 bg-white border border-[#458731] rounded-[4px] text-[#458731] font-bold text-[15px] mb-4 hover:bg-[#f9fdf7] transition-colors">
                    Guest seller? Find your listing
                </button>

                {/* Replaced Facebook with Google as requested */}
                <button 
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full py-3.5 bg-white border border-[#cccccc] rounded-[4px] text-[#54626c] font-bold text-[15px] mb-8 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                >
                    {isGoogleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    )}
                    Log In with Google
                </button>

                <p className="text-center text-[15px] text-[#1a1a1a] font-medium mb-6">
                    New to Parbet? <button onClick={() => setIsCreateModalOpen(true)} className="text-[#0064d2] hover:underline">Create an account</button>
                </p>

                {/* Footer Configs */}
                <div className="border border-[#cccccc] rounded-[4px] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#cccccc] flex items-center text-[#54626c] text-[15px] hover:bg-gray-50 cursor-pointer">
                        <Globe size={18} className="mr-3" /> English (UK)
                    </div>
                    <div className="px-4 py-3 flex items-center text-[#54626c] text-[15px] hover:bg-gray-50 cursor-pointer">
                        <DollarSign size={18} className="mr-3" /> Rs. Indian Rupee
                    </div>
                </div>
            </div>

            {/* FEATURE 9: Exact Replica "Create account" Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[12px] w-full max-w-[600px] shadow-2xl overflow-hidden relative"
                        >
                            <div className="p-6 md:p-8">
                                <button 
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                
                                <h2 className="text-[24px] font-black text-[#1a1a1a] mb-6">Create account</h2>

                                {regError && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] font-bold rounded border border-red-100">
                                        {regError}
                                    </div>
                                )}

                                <form onSubmit={handleCreateAccount} className="space-y-4">
                                    <div className="border border-[#458731] rounded-[4px] relative focus-within:ring-1 focus-within:ring-[#458731]">
                                        <label className="absolute left-3 top-1.5 text-[11px] text-[#54626c]">First Name <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={regForm.firstName}
                                            onChange={(e) => setRegForm({...regForm, firstName: e.target.value})}
                                            className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-[15px] text-[#1a1a1a]"
                                        />
                                    </div>

                                    <div className="border border-[#cccccc] rounded-[4px] relative focus-within:border-[#458731] focus-within:ring-1 focus-within:ring-[#458731]">
                                        <label className="absolute left-3 top-1.5 text-[11px] text-[#54626c]">Last Name <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={regForm.lastName}
                                            onChange={(e) => setRegForm({...regForm, lastName: e.target.value})}
                                            className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-[15px] text-[#1a1a1a]"
                                        />
                                    </div>

                                    <div className="border border-[#cccccc] rounded-[4px] relative focus-within:border-[#458731] focus-within:ring-1 focus-within:ring-[#458731]">
                                        <label className="absolute left-3 top-1.5 text-[11px] text-[#54626c]">Email <span className="text-red-500">*</span></label>
                                        <input 
                                            type="email" 
                                            value={regForm.email}
                                            onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                                            className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-[15px] text-[#1a1a1a]"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-1/3 border border-[#cccccc] rounded-[4px] relative flex items-center px-3 bg-gray-50">
                                            <span className="text-[18px] mr-2">🇮🇳</span>
                                            <span className="text-[15px] text-[#1a1a1a] flex-1">+91</span>
                                            <span className="text-gray-400 text-[10px]">▼</span>
                                        </div>
                                        <div className="flex-1 border border-[#cccccc] rounded-[4px] relative focus-within:border-[#458731] focus-within:ring-1 focus-within:ring-[#458731]">
                                            <label className="absolute left-3 top-1.5 text-[11px] text-[#54626c]">Phone Number <span className="text-red-500">*</span></label>
                                            <input 
                                                type="tel" 
                                                value={regForm.phone}
                                                onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                                                className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-[15px] text-[#1a1a1a]"
                                            />
                                        </div>
                                    </div>

                                    <div className="border border-[#cccccc] rounded-[4px] relative focus-within:border-[#458731] focus-within:ring-1 focus-within:ring-[#458731]">
                                        <label className="absolute left-3 top-1.5 text-[11px] text-[#54626c]">Password <span className="text-red-500">*</span></label>
                                        <input 
                                            type="password" 
                                            value={regForm.password}
                                            onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                                            className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-[15px] text-[#1a1a1a]"
                                        />
                                    </div>

                                    <div className="flex items-start mt-6 mb-4 cursor-pointer" onClick={() => setRegForm({...regForm, smsConsent: !regForm.smsConsent})}>
                                        <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center mr-3 shrink-0 transition-colors ${regForm.smsConsent ? 'bg-[#8cc63f] border-[#8cc63f]' : 'border-[#cccccc]'}`}>
                                            {regForm.smsConsent && <Check size={14} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <span className="text-[14px] text-[#1a1a1a]">I agree to receive SMS from parbet for verification.<span className="text-red-500">*</span></span>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3.5 bg-[#e2e2e2] text-[#a0a0a0] font-bold rounded-[4px] text-[16px] hover:bg-[#d4d4d4] hover:text-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting && <Loader2 size={18} className="animate-spin text-[#1a1a1a]" />}
                                        Create Account
                                    </button>

                                    <div className="flex items-start mt-6 cursor-pointer" onClick={() => setRegForm({...regForm, marketingConsent: !regForm.marketingConsent})}>
                                        <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center mr-3 shrink-0 transition-colors ${regForm.marketingConsent ? 'bg-[#8cc63f] border-[#8cc63f]' : 'border-[#cccccc]'}`}>
                                            {regForm.marketingConsent && <Check size={14} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <span className="text-[14px] text-[#54626c]">Please keep me updated by email about the latest news, great deals and special offers</span>
                                    </div>
                                </form>
                            </div>
                            <div className="bg-gray-100 border-t border-[#e2e2e2] px-6 py-4 flex items-center text-[#54626c] text-[15px]">
                                Rs. Indian Rupee
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FEATURE 10: Interactive Exact-Replica Feedback Tab */}
            <div className="fixed right-0 top-[20%] z-[200] flex">
                {/* The vertical trigger button */}
                <div 
                    onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                    className="bg-[#458731] text-white w-10 h-28 cursor-pointer rounded-l-md flex items-center justify-center shadow-lg hover:w-11 transition-all"
                >
                    <span className="rotate-[-90deg] whitespace-nowrap font-bold text-[14px] tracking-wider">Feedback</span>
                </div>

                {/* The sliding feedback panel */}
                <AnimatePresence>
                    {isFeedbackOpen && (
                        <motion.div 
                            initial={{ x: 350, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 350, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-10 top-0 bg-white border border-[#1a1a1a] shadow-2xl w-[320px] rounded-bl-lg"
                        >
                            <div className="p-1 flex justify-end bg-gray-50 border-b border-[#e2e2e2]">
                                <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-500 hover:text-[#1a1a1a] p-1"><X size={16}/></button>
                            </div>
                            
                            {feedbackSuccess ? (
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-[#eaf4d9] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Check size={24} className="text-[#458731]" />
                                    </div>
                                    <p className="text-[15px] font-bold text-[#1a1a1a]">Thank you!</p>
                                    <p className="text-[13px] text-[#54626c] mt-1">Your feedback helps us improve.</p>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <p className="text-[15px] text-[#1a1a1a] mb-6 leading-relaxed">
                                        Please tell us more about your experience using this page to help us improve our website!
                                    </p>
                                    
                                    <div className="flex justify-between items-center mb-2 px-2">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button 
                                                key={num}
                                                onClick={() => setFeedbackRating(num)}
                                                className={`w-9 h-9 rounded-md flex items-center justify-center text-[14px] font-bold transition-colors ${feedbackRating === num ? 'bg-[#8cc63f] text-white' : 'bg-[#1a1a1a] text-white hover:bg-[#333333]'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[11px] text-[#54626c] mb-6">
                                        <span>Very Dissatisfied</span>
                                        <span>Very Satisfied</span>
                                    </div>

                                    <textarea 
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        maxLength={1000}
                                        placeholder="Please provide us more details here..."
                                        className="w-full h-32 border-none outline-none resize-none text-[14px] text-[#1a1a1a] placeholder-gray-400"
                                    />
                                    <div className="text-right text-[11px] text-[#1a1a1a] font-bold mb-4">
                                        {1000 - feedbackText.length}/1000 characters left
                                    </div>

                                    <p className="text-[13px] font-bold text-[#1a1a1a] mb-4 leading-tight">
                                        Please note we won't be able to reply to any questions submitted here
                                    </p>

                                    <button 
                                        onClick={handleFeedbackSubmit}
                                        disabled={!feedbackRating || isFeedbackSubmitting}
                                        className={`w-full py-3 rounded-[4px] font-bold text-[14px] transition-colors flex items-center justify-center gap-2 ${feedbackRating ? 'bg-[#e2e2e2] text-[#1a1a1a] hover:bg-[#d4d4d4]' : 'bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed'}`}
                                    >
                                        {isFeedbackSubmitting && <Loader2 size={16} className="animate-spin" />} Submit
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}