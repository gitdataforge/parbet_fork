import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // STRICT FIX: Added AnimatePresence
import { Loader2, ArrowLeft, MailCheck, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function VerifyCode() {
    const navigate = useNavigate();
    
    // FEATURE 1: Secure Session State Retrieval
    const [pendingData, setPendingData] = useState(null);

    // FEATURE 2: 6-Digit Auto-Advancing State Machine
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    // FEATURE 3: Anti-Spam & Submission States
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [isResending, setIsResending] = useState(false);

    // FEATURE 4: Lifecycle Security Guard (Prevents URL bypassing)
    useEffect(() => {
        const storedData = localStorage.getItem('parbet_pending_seller');
        if (!storedData) {
            navigate('/auth/signup');
            return;
        }
        
        const parsed = JSON.parse(storedData);
        // If they are already verified, push them to the next step
        if (parsed.verified) {
            navigate('/auth/set-password');
            return;
        }
        setPendingData(parsed);

        // Auto-focus the first input on load
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [navigate]);

    // FEATURE 5: Anti-Spam Countdown Physics
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // FEATURE 6: Input Auto-Advance & Backspace Logic
    const handleChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return; // Only allow numbers

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-advance
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace auto-retreat
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // FEATURE 7: Native Paste Event Handler (Extracts 6 digits)
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
        if (!pastedData) return;

        const newCode = [...code];
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        setCode(newCode);
        
        // Focus the next empty input or the last one
        const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
        inputRefs.current[nextIndex].focus();
    };

    // FEATURE 8: Real-Time OTP Validation Engine
    const handleVerify = async (e) => {
        e.preventDefault();
        const enteredCode = code.join('');
        
        if (enteredCode.length !== 6) {
            setError("Please enter the full 6-digit code.");
            return;
        }

        setIsVerifying(true);
        setError('');

        // Simulated network delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));

        if (enteredCode === pendingData.verificationCode) {
            // Success: Update session payload and vault to password setup
            const updatedData = { ...pendingData, verified: true };
            localStorage.setItem('parbet_pending_seller', JSON.stringify(updatedData));
            navigate('/auth/set-password');
        } else {
            setError("Invalid verification code. Please check your email and try again.");
            setIsVerifying(false);
            // Clear inputs on failure
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        }
    };

    // FEATURE 9: EmailJS Resend Pipeline
    const handleResend = async () => {
        if (resendTimer > 0 || isResending) return;
        setIsResending(true);
        setError('');

        try {
            // Generate fresh OTP
            const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Update local storage payload
            const updatedData = { ...pendingData, verificationCode: newOtpCode, timestamp: Date.now() };
            localStorage.setItem('parbet_pending_seller', JSON.stringify(updatedData));
            setPendingData(updatedData);

            // Retransmit via EmailJS
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    to_email: pendingData.email,
                    to_name: pendingData.firstName,
                    otp_code: newOtpCode,
                    reply_to: "support@parbet.com"
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            setResendTimer(60); // Restart anti-spam timer
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } catch (err) {
            console.error("Resend Failed:", err);
            setError("Failed to resend the code. Please try again later.");
        } finally {
            setIsResending(false);
        }
    };

    // FEATURE 10: Framer Motion Error Shaking Physics
    const shakeAnimation = {
        shake: {
            x: [0, -10, 10, -10, 10, -5, 5, 0],
            transition: { duration: 0.4 }
        }
    };

    if (!pendingData) return null; // Wait for redirect if no data

    const isCodeComplete = code.every(digit => digit !== '');

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans relative">
            <div className="w-full max-w-[400px] px-4 py-8">
                
                {/* Back Button */}
                <button 
                    onClick={() => {
                        localStorage.removeItem('parbet_pending_seller');
                        navigate('/auth/signup');
                    }}
                    className="flex items-center text-[#0064d2] text-[14px] font-bold hover:underline mb-8"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Signup
                </button>

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <h1 className="text-[42px] font-black tracking-tighter leading-none cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                    </h1>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#eaf4d9] rounded-full flex items-center justify-center mx-auto mb-4">
                        <MailCheck size={32} className="text-[#458731]" />
                    </div>
                    <h2 className="text-[28px] font-bold text-[#1a1a1a] mb-2">Verify your email</h2>
                    <p className="text-[15px] text-[#54626c] leading-relaxed">
                        We've sent a secure 6-digit code to<br/>
                        <strong className="text-[#1a1a1a]">{pendingData.email}</strong>
                    </p>
                </div>

                {/* FEATURE 11: Error Rendering */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            variants={shakeAnimation}
                            animate="shake"
                            className="mb-6 p-3 bg-red-50 text-red-600 text-[13px] font-bold rounded border border-red-100 flex items-center justify-center gap-2"
                        >
                            <AlertCircle size={16} /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleVerify}>
                    <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 md:w-14 md:h-16 border border-[#cccccc] rounded-[4px] text-center text-[24px] font-black text-[#1a1a1a] outline-none focus:border-[#458731] focus:ring-1 focus:ring-[#458731] transition-all bg-white"
                            />
                        ))}
                    </div>

                    <button 
                        type="submit"
                        disabled={isVerifying || !isCodeComplete}
                        className={`w-full py-3.5 rounded-[4px] font-bold text-[16px] transition-all mb-6 flex items-center justify-center gap-2 ${isCodeComplete ? 'bg-[#1a1a1a] text-white hover:bg-[#333333]' : 'bg-[#e2e2e2] text-[#a0a0a0] cursor-not-allowed'}`}
                    >
                        {isVerifying && <Loader2 size={18} className="animate-spin" />}
                        Verify & Continue
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-[14px] text-[#54626c] font-medium">
                        Didn't receive the code?{' '}
                        {resendTimer > 0 ? (
                            <span className="text-[#1a1a1a]">Resend in {resendTimer}s</span>
                        ) : (
                            <button 
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-[#0064d2] font-bold hover:underline"
                            >
                                {isResending ? 'Sending...' : 'Resend Code'}
                            </button>
                        )}
                    </p>
                </div>

            </div>
        </div>
    );
}