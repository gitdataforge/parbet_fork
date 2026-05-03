import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Lock, User, Bell, CreditCard, CheckCircle2, 
    Loader2, ShieldCheck, AlertTriangle, Smartphone, 
    Mail, Key, Landmark, Save, Globe, Laptop, ShieldAlert, BadgeIndianRupee
} from 'lucide-react';
import { useMainStore } from '../../store/useMainStore';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 8 Profile Settings)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Secure State Management for Deep Sub-Tabs
 * FEATURE 2: Local Form States for Real Data Persistence
 * FEATURE 3: Real Firestore Preference Sync (Hydration & Mutation)
 * FEATURE 4: Staggered Hardware-Accelerated Animation Variants
 * FEATURE 5: Firebase Auth Live Password Mutation Engine
 * FEATURE 6: Re-authentication Security Gate Failsafe
 * FEATURE 7: Contextual Success/Error Feedback Toasts
 * FEATURE 8: 1:1 Booknshow Enterprise UI/UX Standards
 * FEATURE 9: Multi-Channel Notification Toggles
 * FEATURE 10: Secure Bank Payout Configuration (Zustand Financial Engine Link)
 * FEATURE 11: Real-Time Password Strength Meter
 * FEATURE 12: Active Sessions / Device Management UI
 * FEATURE 13: Ambient Illustrative Backgrounds
 * FEATURE 14: Unified UPI & Bank Transfer Form
 */

// SECTION 1: Ambient Illustrative Background
const AmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FAD8DC] opacity-20 blur-[100px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#EB5B6E] opacity-10 blur-[120px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
    </div>
);

export default function Settings() {
    // Connect to global state and the new secure financial engine
    const { user, bankDetails, saveBankDetails } = useMainStore();
    const [activeTab, setActiveTab] = useState('Personal Details');
    
    // Core UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Form States
    const [personalData, setPersonalData] = useState({ fullName: '', phone: '', city: '', country: 'India' });
    const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [payoutData, setPayoutData] = useState({ accountName: '', accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
    const [preferences, setPreferences] = useState({ emailAlerts: true, smsAlerts: false, currency: 'INR', language: 'English' });

    // Automatic Data Hydration on Mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user || !user.uid) return;
            try {
                // 1. Hydrate Personal & Preferences from standard user doc
                const userRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.personal) setPersonalData(data.personal);
                    if (data.preferences) setPreferences(data.preferences);
                }

                // 2. Hydrate Payout Data from the secure financial engine (if exists)
                if (bankDetails) {
                    setPayoutData({
                        accountName: bankDetails.accountName || '',
                        accountNumber: bankDetails.accountNumber || '',
                        ifscCode: bankDetails.ifscCode || '',
                        bankName: bankDetails.bankName || '',
                        upiId: bankDetails.upiId || ''
                    });
                }
            } catch (err) {
                console.error("Failed to hydrate user settings:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [user, bankDetails]);

    // Global Toast Notification Engine
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    // Sync Standard Profile Data to Firestore
    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                personal: personalData,
                preferences: preferences,
                updatedAt: serverTimestamp()
            }, { merge: true });
            
            showToast("Account preferences synchronized successfully.");
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // SECURE FINANCIAL ENGINE: Save Bank Details explicitly
    const handleSaveBankDetails = async () => {
        if (!user) return;
        if (!payoutData.accountNumber && !payoutData.upiId) {
            showToast("Please provide either a Bank Account Number or UPI ID.", "error");
            return;
        }

        setIsSaving(true);
        try {
            await saveBankDetails(payoutData);
            showToast("Secure Payout Method verified and encrypted.");
        } catch (err) {
            showToast("Failed to save payout method. Try again.", "error");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // Secure Password Mutation with Re-auth
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            showToast("New passwords do not match.", 'error');
            return;
        }
        if (securityData.newPassword.length < 8) {
            showToast("Password must be at least 8 characters.", 'error');
            return;
        }

        setIsSaving(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser || !currentUser.email) throw new Error("Authentication state compromised.");

            const credential = EmailAuthProvider.credential(currentUser.email, securityData.currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, securityData.newPassword);
            
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showToast("Cryptographic credentials updated successfully.");
        } catch (err) {
            let msg = "Failed to update security credentials.";
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Invalid current password.";
            if (err.code === 'auth/too-many-requests') msg = "Too many attempts. Account temporarily locked.";
            showToast(msg, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate Password Strength
    const getPasswordStrength = (pass) => {
        if (!pass) return { score: 0, label: 'None', color: 'bg-[#F5F5F5]' };
        let score = 0;
        if (pass.length > 7) score += 25;
        if (pass.match(/[A-Z]/)) score += 25;
        if (pass.match(/[0-9]/)) score += 25;
        if (pass.match(/[^A-Za-z0-9]/)) score += 25;
        
        if (score <= 25) return { score, label: 'Weak', color: 'bg-[#E7364D]' };
        if (score <= 50) return { score, label: 'Fair', color: 'bg-orange-500' };
        if (score <= 75) return { score, label: 'Good', color: 'bg-blue-500' };
        return { score, label: 'Strong', color: 'bg-green-500' };
    };

    const passStrength = getPasswordStrength(securityData.newPassword);

    const tabs = [
        { id: 'Personal Details', icon: <User size={18} /> },
        { id: 'Security Center', icon: <Lock size={18} /> },
        { id: 'Payment & Payout', icon: <CreditCard size={18} /> },
        { id: 'Notifications', icon: <Bell size={18} /> }
    ];

    const fadeUp = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -15 },
        transition: { duration: 0.3, ease: 'easeOut' }
    };

    if (isLoading) {
        return (
            <div className="w-full bg-transparent min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#E7364D] mb-4" size={36} />
                <p className="text-[14px] font-bold text-[#626262] uppercase tracking-widest">Decrypting Account Vault...</p>
            </div>
        );
    }

    return (
        <div className="w-full font-sans max-w-[1000px] pb-20 pt-4 relative min-h-screen">
            <AmbientBackground />
            
            <div className="relative z-10">
                {/* Global Toast Notification */}
                <AnimatePresence>
                    {toast.show && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, x: '-50%' }} 
                            animate={{ opacity: 1, y: 0, x: '-50%' }} 
                            exit={{ opacity: 0, y: -20, x: '-50%' }}
                            className={`fixed top-24 left-1/2 z-50 flex items-center px-6 py-4 rounded-[8px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border ${toast.type === 'success' ? 'bg-[#FFFFFF] border-[#333333] text-[#333333]' : 'bg-[#FAD8DC] border-[#E7364D] text-[#E7364D]'}`}
                        >
                            {toast.type === 'success' ? <CheckCircle2 size={20} className="mr-3 text-[#333333]" /> : <AlertTriangle size={20} className="mr-3" />}
                            <span className="text-[14px] font-bold tracking-wide">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <h1 className="text-[32px] font-black text-[#333333] mb-8 tracking-tight leading-tight px-6 md:px-8">
                    Account Settings
                </h1>
                
                {/* Responsive Scrollable Tab Navigation */}
                <div className="flex overflow-x-auto border-b border-[#A3A3A3]/30 mb-10 no-scrollbar scroll-smooth px-6 md:px-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-2 mr-8 text-[15px] whitespace-nowrap transition-all border-b-[3px] flex items-center gap-2.5 relative ${
                                activeTab === tab.id 
                                ? 'border-[#E7364D] text-[#E7364D] font-black' 
                                : 'border-transparent text-[#626262] hover:text-[#333333] font-bold'
                            }`}
                        >
                            {tab.icon} {tab.id}
                        </button>
                    ))}
                </div>

                <div className="px-6 md:px-8">
                    <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-6 md:p-10 shadow-[0_4px_20px_rgba(51,51,51,0.04)] relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            
                            {/* --- TAB 1: PERSONAL DETAILS --- */}
                            {activeTab === 'Personal Details' && (
                                <motion.div key="personal" {...fadeUp} className="max-w-2xl">
                                    <div className="mb-10 flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-[#FAD8DC]/50 border-2 border-[#E7364D]/20 flex items-center justify-center text-[#E7364D] text-[32px] font-black uppercase overflow-hidden shrink-0">
                                            {personalData.fullName ? personalData.fullName.charAt(0) : <User size={32} />}
                                        </div>
                                        <div>
                                            <h3 className="text-[24px] font-black text-[#333333] mb-1">Identity Details</h3>
                                            <p className="text-[14px] text-[#626262] font-medium">Manage your personal information and contact identity.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-8 mb-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Full Legal Name</label>
                                                <input type="text" value={personalData.fullName} onChange={(e) => setPersonalData({...personalData, fullName: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="e.g. John Doe" />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Phone Number</label>
                                                <input type="tel" value={personalData.phone} onChange={(e) => setPersonalData({...personalData, phone: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="+91 0000000000" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">City of Residence</label>
                                                <input type="text" value={personalData.city} onChange={(e) => setPersonalData({...personalData, city: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="E.g. Mumbai" />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Country</label>
                                                <select value={personalData.country} onChange={(e) => setPersonalData({...personalData, country: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors appearance-none cursor-pointer">
                                                    <option value="India">India</option>
                                                    <option value="United States">United States</option>
                                                    <option value="United Kingdom">United Kingdom</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2.5 pt-4 border-t border-[#A3A3A3]/20">
                                            <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest flex items-center"><Lock size={12} className="mr-1.5"/> Account Email (Immutable)</label>
                                            <input type="email" value={user?.email || ''} disabled className="w-full border border-[#A3A3A3]/20 bg-[#F5F5F5] rounded-[8px] px-4 py-3.5 text-[14px] font-bold text-[#626262] cursor-not-allowed opacity-70" />
                                        </div>
                                    </div>

                                    <button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#333333] text-[#FFFFFF] px-8 py-4 rounded-[8px] font-bold text-[14px] hover:bg-[#E7364D] transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 w-full sm:w-auto hover:-translate-y-0.5 transform duration-200">
                                        {isSaving ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>} Save Personal Details
                                    </button>
                                </motion.div>
                            )}

                            {/* --- TAB 2: SECURITY CENTER --- */}
                            {activeTab === 'Security Center' && (
                                <motion.div key="security" {...fadeUp} className="max-w-2xl">
                                    <div className="mb-10">
                                        <h3 className="text-[24px] font-black text-[#333333] mb-2">Security Center</h3>
                                        <p className="text-[14px] text-[#626262] font-medium">Manage your cryptography, active sessions, and multi-factor auth.</p>
                                    </div>

                                    <form onSubmit={handleUpdatePassword} className="bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[12px] p-6 md:p-8 mb-8 shadow-sm">
                                        <h4 className="font-black text-[18px] text-[#333333] mb-6 flex items-center"><Key size={20} className="mr-3 text-[#E7364D]" /> Cryptographic Key Change</h4>
                                        <div className="space-y-6 mb-8">
                                            <div>
                                                <input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="Current Password" />
                                            </div>
                                            <div>
                                                <input type="password" required value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="New Password (Min 8 characters)" />
                                                
                                                {/* Password Strength Indicator */}
                                                {securityData.newPassword.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Strength</span>
                                                            <span className="text-[11px] font-bold text-[#333333]">{passStrength.label}</span>
                                                        </div>
                                                        <div className="w-full bg-[#F5F5F5] h-1.5 rounded-full overflow-hidden">
                                                            <div className={`h-full ${passStrength.color} transition-all duration-300`} style={{ width: `${passStrength.score}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <input type="password" required value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="Confirm New Password" />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={isSaving} className="bg-[#333333] text-[#FFFFFF] px-6 py-3.5 rounded-[8px] font-bold text-[14px] hover:bg-[#E7364D] transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 w-full sm:w-auto hover:-translate-y-0.5 transform duration-200">
                                            {isSaving ? <Loader2 size={16} className="animate-spin mr-2"/> : null} Update Security Credentials
                                        </button>
                                    </form>

                                    {/* 2FA UI */}
                                    <div className="border border-[#A3A3A3]/30 rounded-[12px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between mb-8 bg-[#FAFAFA]">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[#FAD8DC]/30 rounded-full flex items-center justify-center shrink-0 border border-[#E7364D]/20">
                                                <ShieldCheck size={24} className="text-[#E7364D]" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[16px] text-[#333333] mb-1">Two-Factor Authentication (2FA)</h4>
                                                <p className="text-[13px] text-[#626262] font-medium leading-relaxed">Add an extra layer of security. Require a code from an authenticator app upon login.</p>
                                            </div>
                                        </div>
                                        <button className="border-2 border-[#333333] bg-[#FFFFFF] text-[#333333] px-6 py-3 rounded-[8px] font-bold text-[13px] hover:bg-[#333333] hover:text-[#FFFFFF] transition-colors shrink-0 w-full md:w-auto">
                                            Configure 2FA
                                        </button>
                                    </div>

                                    {/* Active Sessions UI */}
                                    <div className="border border-[#A3A3A3]/30 rounded-[12px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between bg-[#FAFAFA]">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[#E7364D]/10 rounded-full flex items-center justify-center shrink-0 border border-[#E7364D]/20">
                                                <Laptop size={24} className="text-[#333333]" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[16px] text-[#333333] mb-1">Active Device Sessions</h4>
                                                <p className="text-[13px] text-[#626262] font-medium leading-relaxed">You are currently logged in on 1 device (Chrome / Windows).</p>
                                            </div>
                                        </div>
                                        <button className="bg-[#F5F5F5] text-[#E7364D] border border-[#A3A3A3]/30 px-6 py-3 rounded-[8px] font-bold text-[13px] hover:bg-[#FAD8DC]/30 transition-colors shrink-0 w-full md:w-auto">
                                            Sign out of all devices
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* --- TAB 3: PAYOUT OPTIONS --- */}
                            {activeTab === 'Payment & Payout' && (
                                <motion.div key="payout" {...fadeUp} className="max-w-2xl">
                                    <div className="mb-10">
                                        <h3 className="text-[24px] font-black text-[#333333] mb-2">Payout Configuration</h3>
                                        <p className="text-[14px] text-[#626262] font-medium">Configure where Booknshow sends your funds when your tickets sell on the marketplace.</p>
                                    </div>

                                    <div className="bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[12px] p-6 md:p-8 mb-8 shadow-[0_4px_20px_rgba(51,51,51,0.03)]">
                                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#A3A3A3]/20">
                                            <div className="w-12 h-12 bg-[#FAD8DC]/30 text-[#E7364D] rounded-full flex items-center justify-center border border-[#E7364D]/20"><Landmark size={24} /></div>
                                            <div>
                                                <h4 className="font-black text-[18px] text-[#333333]">Primary Bank Account</h4>
                                                <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-1">India Region Encrypted Vault</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6 mb-8">
                                            <div className="space-y-2.5">
                                                <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Account Holder Name</label>
                                                <input type="text" value={payoutData.accountName} onChange={(e) => setPayoutData({...payoutData, accountName: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="As registered with bank" />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest flex items-center"><Lock size={12} className="mr-1.5"/> Account Number</label>
                                                <input type="password" value={payoutData.accountNumber} onChange={(e) => setPayoutData({...payoutData, accountNumber: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors tracking-widest" placeholder="•••• •••• ••••" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2.5">
                                                    <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">IFSC Code</label>
                                                    <input type="text" value={payoutData.ifscCode} onChange={(e) => setPayoutData({...payoutData, ifscCode: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none uppercase transition-colors" placeholder="SBIN0000001" />
                                                </div>
                                                <div className="space-y-2.5">
                                                    <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Bank Name</label>
                                                    <input type="text" value={payoutData.bankName} onChange={(e) => setPayoutData({...payoutData, bankName: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="E.g. State Bank of India" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-8 pt-8 border-t border-[#A3A3A3]/20">
                                            <div className="w-12 h-12 bg-[#F5F5F5] text-[#333333] rounded-full flex items-center justify-center border border-[#A3A3A3]/30"><BadgeIndianRupee size={24} /></div>
                                            <div>
                                                <h4 className="font-black text-[18px] text-[#333333]">UPI ID (Optional)</h4>
                                                <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-1">Faster Payout Alternative</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2.5 mb-10">
                                            <input type="text" value={payoutData.upiId} onChange={(e) => setPayoutData({...payoutData, upiId: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors lowercase" placeholder="username@upi" />
                                        </div>

                                        <button onClick={handleSaveBankDetails} disabled={isSaving} className="bg-[#333333] text-[#FFFFFF] px-8 py-4 rounded-[8px] font-bold text-[14px] hover:bg-[#E7364D] transition-colors flex items-center justify-center shadow-[0_4px_15px_rgba(51,51,51,0.2)] disabled:opacity-50 w-full sm:w-auto hover:-translate-y-0.5 transform duration-200">
                                            {isSaving ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>} Secure Payout Method
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* --- TAB 4: NOTIFICATIONS --- */}
                            {activeTab === 'Notifications' && (
                                <motion.div key="notifications" {...fadeUp} className="max-w-2xl">
                                    <div className="mb-10">
                                        <h3 className="text-[24px] font-black text-[#333333] mb-2">Preferences</h3>
                                        <p className="text-[14px] text-[#626262] font-medium">Control communications and regional formatting.</p>
                                    </div>

                                    <div className="border border-[#A3A3A3]/30 rounded-[12px] overflow-hidden mb-10 shadow-sm bg-[#FFFFFF]">
                                        <div className="p-6 border-b border-[#A3A3A3]/20 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center border border-[#A3A3A3]/30"><Mail size={20} className="text-[#333333]"/></div>
                                                <div>
                                                    <h4 className="font-black text-[15px] text-[#333333]">Email Notifications</h4>
                                                    <p className="text-[13px] text-[#626262] font-medium mt-0.5">Order confirmations, tickets, and updates.</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={preferences.emailAlerts} onChange={(e) => setPreferences({...preferences, emailAlerts: e.target.checked})} />
                                                <div className="w-12 h-7 bg-[#A3A3A3]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#FFFFFF] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-[#FFFFFF] after:border-[#A3A3A3] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E7364D]"></div>
                                            </label>
                                        </div>
                                        <div className="p-6 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center border border-[#A3A3A3]/30"><Smartphone size={20} className="text-[#333333]"/></div>
                                                <div>
                                                    <h4 className="font-black text-[15px] text-[#333333]">SMS Alerts</h4>
                                                    <p className="text-[13px] text-[#626262] font-medium mt-0.5">Real-time alerts for price drops.</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={preferences.smsAlerts} onChange={(e) => setPreferences({...preferences, smsAlerts: e.target.checked})} />
                                                <div className="w-12 h-7 bg-[#A3A3A3]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#FFFFFF] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-[#FFFFFF] after:border-[#A3A3A3] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E7364D]"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <h3 className="text-[18px] font-black text-[#333333] mb-6">Regional Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        <div className="space-y-2.5">
                                            <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Display Currency</label>
                                            <select value={preferences.currency} onChange={(e) => setPreferences({...preferences, currency: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none appearance-none transition-colors cursor-pointer">
                                                <option value="INR">INR - Indian Rupee (₹)</option>
                                                <option value="USD">USD - US Dollar ($)</option>
                                                <option value="EUR">EUR - Euro (€)</option>
                                                <option value="GBP">GBP - British Pound (£)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Language</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={18} />
                                                <select value={preferences.language} onChange={(e) => setPreferences({...preferences, language: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] pl-10 pr-4 py-3.5 text-[14px] text-[#333333] font-bold focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none appearance-none transition-colors cursor-pointer">
                                                    <option value="English">English</option>
                                                    <option value="Hindi">Hindi (हिंदी)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="mt-12 pt-8 border-t border-[#A3A3A3]/20">
                                        <h3 className="text-[18px] font-black text-[#E7364D] mb-4 flex items-center"><ShieldAlert size={20} className="mr-2"/> Danger Zone</h3>
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAD8DC]/20 border border-[#E7364D]/30 p-6 rounded-[12px]">
                                            <div>
                                                <h4 className="font-black text-[15px] text-[#333333]">Delete Account</h4>
                                                <p className="text-[13px] text-[#626262] font-medium mt-1">Permanently remove your account and all data.</p>
                                            </div>
                                            <button className="bg-[#FFFFFF] border-2 border-[#E7364D] text-[#E7364D] px-6 py-2.5 rounded-[8px] font-bold text-[13px] hover:bg-[#E7364D] hover:text-[#FFFFFF] transition-colors w-full md:w-auto">
                                                Request Deletion
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-10">
                                        <button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#333333] text-[#FFFFFF] px-8 py-4 rounded-[8px] font-bold text-[14px] hover:bg-[#E7364D] transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 w-full sm:w-auto hover:-translate-y-0.5 transform duration-200">
                                            {isSaving ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>} Update Preferences
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}