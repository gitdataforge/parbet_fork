import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Check, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { BooknshowLogo } from '../../components/Header'; // Reusing global vector logo

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 2 Signup)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Booknshow Registration Pipeline
 * FEATURE 2: High-End SVG Verification Checkboxes
 * FEATURE 3: Seamless Form Validation & Feedback
 */

// Helper Component for exact input styling (Rebranded)
const CustomInput = ({ label, required, type = "text", value, onChange, ...props }) => (
    <div className="relative w-full mb-4">
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            className="w-full border border-[#A3A3A3] rounded-[6px] px-3 py-3.5 text-[15px] text-[#333333] outline-none focus:border-[#E7364D] focus:ring-1 focus:ring-[#E7364D] transition-all bg-[#FFFFFF] placeholder-[#A3A3A3]"
            {...props}
        />
        {!value && (
            <div className="absolute left-3 top-3.5 text-[#A3A3A3] text-[15px] pointer-events-none flex items-center bg-transparent">
                {label} {required && <span className="text-[#E7364D] ml-1">*</span>}
            </div>
        )}
    </div>
);

export default function Signup() {
    const navigate = useNavigate();
    const { isAuthenticated, setUser, setOnboarded } = useAppStore();
    
    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [agreeSMS, setAgreeSMS] = useState(false);
    const [keepUpdated, setKeepUpdated] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/explore'); // Rebranded default route
        }
    }, [isAuthenticated, navigate]);

    // Secure Firestore 6-Segment Path Sync
    const syncUserToFirestore = async (user, additionalData = {}) => {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                balance: 0,
                favorites: [],
                createdAt: new Date().toISOString(),
                ...additionalData
            });
        } else if (Object.keys(additionalData).length > 0) {
            await updateDoc(userRef, additionalData);
        }
    };

    // Handle Sign Up Submission
    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email || !phone || !password || !agreeSMS) {
            return setError('Please fill all required fields and agree to SMS verification.');
        }
        setLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const fullName = `${firstName} ${lastName}`;
            
            await updateProfile(userCredential.user, { displayName: fullName });
            await syncUserToFirestore(userCredential.user, { displayName: fullName, phone });
            
            setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                name: fullName,
                photo: ''
            });
            setOnboarded();
            navigate('/explore'); // Rebranded default route post-signup
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center py-12 px-4 relative font-sans">
            
            {/* Floating Feedback Tab (Rebranded) */}
            <div 
                className="fixed right-0 top-[30%] bg-[#333333] text-[#FFFFFF] text-[13px] font-bold py-3 px-1.5 rounded-l-[4px] cursor-pointer shadow-md hover:bg-[#E7364D] transition-colors z-50 flex items-center justify-center"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
            >
                Feedback
            </div>

            {/* Main Centered Sign-Up Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FFFFFF] w-full max-w-[580px] rounded-[12px] shadow-[0_10px_40px_rgba(51,51,51,0.08)] overflow-hidden flex flex-col relative border border-[#A3A3A3]/20"
            >
                {/* Global Close Button (Routes back to Login) */}
                <button 
                    onClick={() => navigate('/login')} 
                    className="absolute top-5 right-5 text-[#A3A3A3] hover:text-[#E7364D] transition-colors z-10"
                >
                    <X size={24} strokeWidth={1.5} />
                </button>

                <div className="px-8 pt-8 pb-10 flex flex-col">
                    
                    <div className="mb-6 self-start cursor-pointer" onClick={() => navigate('/')}>
                        <BooknshowLogo className="h-[32px]" />
                    </div>
                    
                    <h2 className="text-[24px] font-bold text-[#333333] mb-6 tracking-tight">Create account</h2>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-[#FAD8DC]/30 text-[#E7364D] text-[13px] border border-[#E7364D]/50 rounded-[6px] font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUpSubmit} className="flex flex-col w-full">
                        <CustomInput label="First Name" required={true} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <CustomInput label="Last Name" required={true} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <CustomInput label="Email" required={true} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        
                        <div className="flex space-x-3 mb-4 w-full">
                            {/* Country Code Dropdown Fake */}
                            <div className="w-[140px] border border-[#A3A3A3] rounded-[6px] px-3 py-2 flex flex-col justify-center bg-[#F5F5F5] relative cursor-pointer hover:border-[#E7364D] transition-colors shrink-0">
                                <span className="text-[10px] text-[#A3A3A3] font-medium">Country Code</span>
                                <div className="flex items-center justify-between mt-0.5">
                                    <div className="flex items-center">
                                        <span className="text-[16px] mr-2">🇮🇳</span> 
                                        <span className="text-[15px] text-[#333333]">+91</span>
                                    </div>
                                    <ChevronDown size={14} className="text-[#A3A3A3]"/>
                                </div>
                            </div>
                            
                            {/* Phone Input */}
                            <div className="flex-1 relative">
                                <input 
                                    type="tel" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    className="w-full h-full border border-[#A3A3A3] rounded-[6px] px-3 py-3.5 text-[15px] text-[#333333] outline-none focus:border-[#E7364D] focus:ring-1 focus:ring-[#E7364D] transition-all bg-[#FFFFFF]"
                                />
                                {!phone && (
                                    <div className="absolute left-3 top-[18px] text-[#A3A3A3] text-[15px] pointer-events-none flex items-center bg-transparent">
                                        Phone Number <span className="text-[#E7364D] ml-1">*</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <CustomInput label="Password" required={true} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                        {/* SMS Agreement Checkbox */}
                        <div className="flex items-start space-x-3 mb-6 mt-2 cursor-pointer group" onClick={() => setAgreeSMS(!agreeSMS)}>
                            <div className={`w-[18px] h-[18px] mt-0.5 rounded-[4px] flex items-center justify-center transition-colors shrink-0 ${agreeSMS ? 'bg-[#E7364D] border-[#E7364D]' : 'border-2 border-[#A3A3A3] bg-[#FFFFFF] group-hover:border-[#E7364D]'}`}>
                                {agreeSMS && <Check size={12} className="text-[#FFFFFF]" strokeWidth={3}/>}
                            </div>
                            <span className="text-[13px] text-[#333333] leading-snug group-hover:text-[#E7364D] transition-colors">
                                I agree to receive SMS from Booknshow for verification.<span className="text-[#E7364D] ml-1">*</span>
                            </span>
                        </div>

                        {/* Conditional Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading || !firstName || !lastName || !email || !phone || !password || !agreeSMS}
                            className={`w-full py-3.5 rounded-[8px] font-bold text-[15px] transition-all mb-6 flex justify-center items-center ${(firstName && lastName && email && phone && password && agreeSMS) ? 'bg-[#E7364D] text-[#FFFFFF] hover:bg-[#EB5B6E] shadow-sm' : 'bg-[#F5F5F5] text-[#A3A3A3] border border-[#A3A3A3]/20'}`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></div>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Marketing Checkbox */}
                        <div className="flex items-start space-x-3 cursor-pointer group" onClick={() => setKeepUpdated(!keepUpdated)}>
                            <div className={`w-[18px] h-[18px] mt-0.5 rounded-[4px] flex items-center justify-center transition-colors shrink-0 ${keepUpdated ? 'bg-[#E7364D] border-[#E7364D]' : 'border-2 border-[#A3A3A3] bg-[#FFFFFF] group-hover:border-[#E7364D]'}`}>
                                {keepUpdated && <Check size={12} className="text-[#FFFFFF]" strokeWidth={3}/>}
                            </div>
                            <span className="text-[13px] text-[#626262] leading-snug pr-4 group-hover:text-[#E7364D] transition-colors">
                                Please keep me updated by email about the latest news, great deals and special offers from Booknshow
                            </span>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}