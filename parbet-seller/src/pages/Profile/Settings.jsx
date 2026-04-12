import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Shield, 
    Bell, 
    CreditCard, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight, 
    Lock, 
    Mail, 
    Phone, 
    Building, 
    Trash2,
    Loader2
} from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function Settings() {
    // FEATURE 1: Secure Data Injection
    const { user, updateProfileData, isLoading } = useSellerStore();

    // FEATURE 2: Tabbed Interface State Machine
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState(null);

    // FEATURE 3: Controlled Form State (Real-Time Binding)
    const [formData, setFormData] = useState({
        displayName: '',
        phone: '',
        email: '',
        company: '',
        gstin: '',
        emailNotifications: true,
        smsNotifications: false
    });

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                phone: user.phoneNumber || '',
                email: user.email || '',
                company: user.companyName || '',
                gstin: user.gstin || '',
                emailNotifications: user.notifications?.email ?? true,
                smsNotifications: user.notifications?.sms ?? false
            });
        }
    }, [user]);

    // FEATURE 4: Real-Time Profile Mutation Logic
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        
        try {
            await updateProfileData(formData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError("Failed to update profile. Please check your connection.");
        } finally {
            setIsSaving(false);
        }
    };

    // FEATURE 5: Firebase Password Reset Protocol
    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            alert(`A secure password reset link has been sent to ${user.email}`);
        } catch (err) {
            setError("Could not send reset email.");
        }
    };

    // FEATURE 6: Framer Motion Animation Physics
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const tabVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const tabs = [
        { id: 'general', label: 'General Info', icon: <User size={18}/> },
        { id: 'payouts', label: 'Payout Methods', icon: <CreditCard size={18}/> },
        { id: 'security', label: 'Security', icon: <Shield size={18}/> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18}/> }
    ];

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1a1a1a] mb-4" />
                <p className="text-[13px] font-bold text-[#54626c] tracking-widest uppercase">Syncing Account...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans max-w-[1000px] pb-20"
        >
            <div className="mb-8">
                <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-tight leading-tight mb-2">Settings</h1>
                <p className="text-[#54626c] text-[15px]">Manage your seller profile, verification status, and security preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Tab Selector */}
                <div className="lg:w-64 shrink-0">
                    <div className="flex flex-row lg:flex-col overflow-x-auto no-scrollbar gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-[4px] text-[14px] font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-[#1a1a1a] text-white' 
                                    : 'text-[#54626c] hover:bg-gray-100 hover:text-[#1a1a1a]'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white border border-[#e2e2e2] rounded-[4px] shadow-sm overflow-hidden min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'general' && (
                            <motion.div 
                                key="general"
                                variants={tabVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="p-6 md:p-8"
                            >
                                <h3 className="text-[18px] font-black text-[#1a1a1a] mb-6">Profile Information</h3>
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[13px] font-bold text-[#54626c] uppercase mb-2">Display Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                                <input 
                                                    type="text" 
                                                    value={formData.displayName}
                                                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-[#cccccc] rounded-[4px] text-[14px] focus:border-[#458731] outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-bold text-[#54626c] uppercase mb-2">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                                <input 
                                                    type="email" 
                                                    disabled
                                                    value={formData.email}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#e2e2e2] rounded-[4px] text-[14px] text-gray-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* FEATURE 7: Tax & Business Verification Section */}
                                    <div className="pt-6 border-t border-[#e2e2e2]">
                                        <h4 className="text-[14px] font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                                            <Building size={16}/> Business Details (Optional)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[13px] font-bold text-[#54626c] uppercase mb-2">Company Name</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.company}
                                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                                    className="w-full px-4 py-2.5 border border-[#cccccc] rounded-[4px] text-[14px] focus:border-[#458731] outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-[#54626c] uppercase mb-2">GSTIN Number</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.gstin}
                                                    onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                                                    placeholder="22AAAAA0000A1Z5"
                                                    className="w-full px-4 py-2.5 border border-[#cccccc] rounded-[4px] text-[14px] focus:border-[#458731] outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex items-center justify-between border-t border-[#e2e2e2]">
                                        <div className="flex items-center gap-2">
                                            {saveSuccess && (
                                                <motion.span initial={{opacity:0}} animate={{opacity:1}} className="text-[#458731] text-[13px] font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={16}/> Changes saved successfully
                                                </motion.span>
                                            )}
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={isSaving}
                                            className="bg-[#1a1a1a] text-white px-8 py-2.5 rounded-[4px] font-bold text-[14px] flex items-center gap-2 hover:bg-[#333333] transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'payouts' && (
                            <motion.div key="payouts" variants={tabVariants} initial="initial" animate="animate" className="p-6 md:p-8">
                                <h3 className="text-[18px] font-black text-[#1a1a1a] mb-2">Payout Methods</h3>
                                <p className="text-[14px] text-[#54626c] mb-8">Manage where you receive your ticket sales revenue.</p>
                                
                                <div className="space-y-4">
                                    {/* FEATURE 8: Active Bank Card Component */}
                                    <div className="border border-[#e2e2e2] rounded-[4px] p-5 flex items-center justify-between bg-[#f8f9fa]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white border border-[#e2e2e2] rounded-full flex items-center justify-center">
                                                <CreditCard size={20} className="text-[#1a1a1a]"/>
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-[#1a1a1a]">Bank Account •••• 4921</p>
                                                <p className="text-[12px] text-[#54626c]">HDFC Bank - Verified Primary</p>
                                            </div>
                                        </div>
                                        <button className="text-[13px] font-bold text-[#0064d2] hover:underline">Edit</button>
                                    </div>

                                    <button className="w-full py-4 border-2 border-dashed border-[#cccccc] rounded-[4px] text-[#54626c] font-bold text-[14px] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all flex items-center justify-center gap-2">
                                        + Add New Payout Method
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div key="security" variants={tabVariants} initial="initial" animate="animate" className="p-6 md:p-8">
                                <h3 className="text-[18px] font-black text-[#1a1a1a] mb-2">Security Settings</h3>
                                <p className="text-[14px] text-[#54626c] mb-8">Protect your account and managed your sessions.</p>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-[#e2e2e2] rounded-[4px]">
                                        <div className="flex items-start gap-4">
                                            <Lock size={20} className="text-[#54626c] mt-1"/>
                                            <div>
                                                <p className="text-[15px] font-bold text-[#1a1a1a]">Account Password</p>
                                                <p className="text-[13px] text-[#54626c]">Last changed 3 months ago</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handlePasswordReset}
                                            className="bg-white border border-[#cccccc] px-4 py-2 rounded-[4px] text-[13px] font-bold hover:border-[#1a1a1a] transition-all"
                                        >
                                            Reset Password
                                        </button>
                                    </div>

                                    {/* FEATURE 9: Account Deactivation Protocol */}
                                    <div className="pt-8 mt-12 border-t border-red-100">
                                        <h4 className="text-[14px] font-bold text-red-600 mb-2">Danger Zone</h4>
                                        <p className="text-[13px] text-[#54626c] mb-4">Once you deactivate your account, there is no going back. Please be certain.</p>
                                        <button className="flex items-center gap-2 text-red-600 font-bold text-[13px] hover:bg-red-50 px-4 py-2 rounded-[4px] border border-red-100">
                                            <Trash2 size={16}/> Deactivate Seller Account
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div key="notifications" variants={tabVariants} initial="initial" animate="animate" className="p-6 md:p-8">
                                <h3 className="text-[18px] font-black text-[#1a1a1a] mb-2">Notification Preferences</h3>
                                <p className="text-[14px] text-[#54626c] mb-8">Control how we contact you about sales and listings.</p>

                                {/* FEATURE 10: Multi-Channel Preference Engine */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-[#e2e2e2] rounded-[4px]">
                                        <div className="flex items-center gap-4">
                                            <Mail size={20} className="text-[#54626c]"/>
                                            <div>
                                                <p className="text-[14px] font-bold text-[#1a1a1a]">Email Notifications</p>
                                                <p className="text-[12px] text-[#54626c]">Get sale alerts and platform news</p>
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.emailNotifications}
                                            onChange={(e) => setFormData({...formData, emailNotifications: e.target.checked})}
                                            className="w-12 h-6 accent-[#458731] cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-[#e2e2e2] rounded-[4px]">
                                        <div className="flex items-center gap-4">
                                            <Phone size={20} className="text-[#54626c]"/>
                                            <div>
                                                <p className="text-[14px] font-bold text-[#1a1a1a]">SMS Alerts</p>
                                                <p className="text-[12px] text-[#54626c]">Instant mobile alerts for payouts</p>
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.smsNotifications}
                                            onChange={(e) => setFormData({...formData, smsNotifications: e.target.checked})}
                                            className="w-12 h-6 accent-[#458731] cursor-pointer"
                                        />
                                    </div>
                                    
                                    <button 
                                        onClick={handleSave}
                                        className="mt-6 bg-[#1a1a1a] text-white px-6 py-2 rounded-[4px] font-bold text-[13px]"
                                    >
                                        Update Preferences
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}