import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Check, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Helper Component for exact Viagogo input styling with red asterisks
const CustomInput = ({ label, required, type = "text", value, onChange, ...props }) => (
    <div className="relative w-full mb-4">
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            className="w-full border border-[#cccccc] rounded-[6px] px-3 py-3.5 text-[15px] text-[#333] outline-none focus:border-[#114C2A] focus:ring-1 focus:ring-[#114C2A] transition-all bg-white"
            {...props}
        />
        {!value && (
            <div className="absolute left-3 top-3.5 text-[#767676] text-[15px] pointer-events-none flex items-center bg-transparent">
                {label} {required && <span className="text-[#d32f2f] ml-1">*</span>}
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

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
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
            navigate('/dashboard');
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
        <div className="min-h-screen bg-black/40 flex items-center justify-center py-12 px-4 relative font-sans">
            
            {/* Floating Green Feedback Tab (Exact Match from Screenshot) */}
            <div 
                className="fixed right-0 top-[30%] bg-[#458731] text-white text-[13px] font-bold py-3 px-1.5 rounded-l-[4px] cursor-pointer shadow-md hover:bg-[#366a26] transition-colors z-50 flex items-center justify-center"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
            >
                Feedback
            </div>

            {/* Main Centered Sign-Up Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-[580px] rounded-[12px] shadow-2xl overflow-hidden flex flex-col relative"
            >
                {/* Global Close Button (Routes back to Login) */}
                <button 
                    onClick={() => navigate('/login')} 
                    className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors z-10"
                >
                    <X size={24} strokeWidth={1.5} />
                </button>

                <div className="px-8 pt-8 pb-10 flex flex-col">
                    <h2 className="text-[24px] font-bold text-[#1a1a1a] mb-6 tracking-tight">Create account</h2>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-[#d32f2f] text-[13px] border border-red-200 rounded-[6px] font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUpSubmit} className="flex flex-col w-full">
                        <CustomInput label="First Name" required={true} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <CustomInput label="Last Name" required={true} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <CustomInput label="Email" required={true} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        
                        <div className="flex space-x-3 mb-4 w-full">
                            {/* Country Code Dropdown Fake */}
                            <div className="w-[140px] border border-[#cccccc] rounded-[6px] px-3 py-2 flex flex-col justify-center bg-gray-50/50 relative cursor-pointer hover:bg-gray-50 transition-colors shrink-0">
                                <span className="text-[10px] text-gray-500 font-medium">Country Code</span>
                                <div className="flex items-center justify-between mt-0.5">
                                    <div className="flex items-center">
                                        <span className="text-[16px] mr-2">🇮🇳</span> 
                                        <span className="text-[15px] text-[#333]">+91</span>
                                    </div>
                                    <ChevronDown size={14} className="text-gray-400"/>
                                </div>
                            </div>
                            
                            {/* Phone Input */}
                            <div className="flex-1 relative">
                                <input 
                                    type="tel" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    className="w-full h-full border border-[#cccccc] rounded-[6px] px-3 py-3.5 text-[15px] text-[#333] outline-none focus:border-[#114C2A] focus:ring-1 focus:ring-[#114C2A] transition-all bg-white"
                                />
                                {!phone && (
                                    <div className="absolute left-3 top-[18px] text-[#767676] text-[15px] pointer-events-none flex items-center bg-transparent">
                                        Phone Number <span className="text-[#d32f2f] ml-1">*</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <CustomInput label="Password" required={true} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                        {/* SMS Agreement Checkbox */}
                        <div className="flex items-start space-x-3 mb-6 mt-2 cursor-pointer" onClick={() => setAgreeSMS(!agreeSMS)}>
                            <div className={`w-[18px] h-[18px] mt-0.5 rounded-[4px] flex items-center justify-center transition-colors shrink-0 ${agreeSMS ? 'bg-[#8bc53f] border-[#8bc53f]' : 'border-2 border-gray-300 bg-white'}`}>
                                {agreeSMS && <Check size={12} className="text-white" strokeWidth={3}/>}
                            </div>
                            <span className="text-[13px] text-[#333] leading-snug">
                                I agree to receive SMS from parbet for verification.<span className="text-[#d32f2f] ml-1">*</span>
                            </span>
                        </div>

                        {/* Conditional Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading || !firstName || !lastName || !email || !phone || !password || !agreeSMS}
                            className={`w-full py-3.5 rounded-[8px] font-bold text-[15px] transition-colors mb-6 flex justify-center items-center ${(firstName && lastName && email && phone && password && agreeSMS) ? 'bg-[#8bc53f] text-white hover:bg-[#7cbd34] shadow-sm' : 'bg-[#e0e0e0] text-[#a6a6a6]'}`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Marketing Checkbox */}
                        <div className="flex items-start space-x-3 cursor-pointer" onClick={() => setKeepUpdated(!keepUpdated)}>
                            <div className={`w-[18px] h-[18px] mt-0.5 rounded-[4px] flex items-center justify-center transition-colors shrink-0 ${keepUpdated ? 'bg-[#8bc53f] border-[#8bc53f]' : 'border-2 border-gray-300 bg-white'}`}>
                                {keepUpdated && <Check size={12} className="text-white" strokeWidth={3}/>}
                            </div>
                            <span className="text-[13px] text-[#555] leading-snug pr-4">
                                Please keep me updated by email about the latest news, great deals and special offers
                            </span>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}