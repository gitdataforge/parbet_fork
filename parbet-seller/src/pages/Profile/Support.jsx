import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, 
    PhoneCall, 
    Mail, 
    Clock, 
    ShieldCheck, 
    ChevronDown, 
    Info, 
    Loader2, 
    CheckCircle2,
    Ticket,
    ShoppingBag,
    ArrowRight,
    HeadphonesIcon
} from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Support() {
    // FEATURE 1: Secure Data Extraction for Transaction Context
    const { user, listings = [], sales = [] } = useSellerStore();
    
    // FEATURE 2: Support Logic State Machine
    const [selectedContextId, setSelectedContextId] = useState('general');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState(null);
    
    // FEATURE 3: Real-Time Operating Hours Logic (9 AM - 9 PM IST)
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => {
        const hour = new Date().getHours();
        setIsOpen(hour >= 9 && hour < 21);
    }, []);

    // FEATURE 4: Aggregated Transaction Context (Listings + Sales)
    const contextOptions = useMemo(() => {
        const options = [{ id: 'general', label: 'General Inquiry (No specific transaction)' }];
        
        sales.forEach(sale => {
            options.push({ 
                id: sale.id, 
                label: `Sale #${sale.id.substring(0,8).toUpperCase()} - ${sale.eventName}`,
                type: 'sale'
            });
        });

        listings.filter(l => l.status === 'active').forEach(listing => {
            options.push({ 
                id: listing.id, 
                label: `Active Listing: ${listing.eventName}`,
                type: 'listing'
            });
        });

        return options;
    }, [sales, listings]);

    // FEATURE 5: Secure Firestore Ticket Submission Pipeline
    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!subject || !message) return;
        
        setIsSubmitting(true);
        setError(null);

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-seller-app';

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'support_tickets'), {
                sellerId: user?.uid || 'anonymous',
                sellerEmail: user?.email || 'N/A',
                contextId: selectedContextId,
                subject,
                message,
                status: 'open',
                priority: 'high',
                timestamp: serverTimestamp(),
                domain: 'seller_support'
            });

            setIsSubmitting(false);
            setSubmitSuccess(true);
            setSubject('');
            setMessage('');
            setSelectedContextId('general');
            
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (err) {
            setError("Failed to transmit support ticket. Please try again.");
            setIsSubmitting(false);
        }
    };

    // FEATURE 6: Framer Motion Staggered Physics
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans max-w-[1000px] pb-20"
        >
            {/* FEATURE 7: 1:1 Viagogo Typography & Headers */}
            <motion.h1 
                variants={itemVariants}
                className="text-[32px] font-black text-[#1a1a1a] mb-2 tracking-tighter leading-tight"
            >
                Seller Support
            </motion.h1>
            <motion.p variants={itemVariants} className="text-[#54626c] text-[15px] mb-8">
                Get specialized assistance for your listings, sales, and payouts.
            </motion.p>

            {/* FEATURE 8: Contextual Selection Engine */}
            <motion.div variants={itemVariants} className="w-full bg-white border border-[#e2e2e2] rounded-[4px] p-6 md:p-8 mb-8 shadow-sm">
                <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-4">Select a Listing or Sale for context</h2>
                <div className="relative w-full md:w-2/3">
                    <select 
                        value={selectedContextId}
                        onChange={(e) => setSelectedContextId(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#cccccc] rounded-[4px] px-4 py-3 text-[15px] text-[#1a1a1a] outline-none focus:border-[#458731] focus:ring-1 focus:ring-[#458731] transition-all font-medium"
                    >
                        {contextOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Direct Contact Cards */}
                <motion.div variants={containerVariants} className="lg:col-span-1 space-y-4">
                    {/* FEATURE 9: Live Chat Card with Simulated Wait Logic */}
                    <motion.div variants={itemVariants} className="bg-white border border-[#e2e2e2] rounded-[4px] p-6 hover:border-[#1a1a1a] hover:shadow-md transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#1a1a1a] transition-colors">
                            <MessageSquare size={24} className="text-[#1a1a1a] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-1">Seller Chat</h3>
                        <p className="text-[13px] text-[#54626c] mb-4">Chat with a seller specialist.</p>
                        <div className="flex items-center text-[13px] font-bold text-[#458731]">
                            <Clock size={14} className="mr-1.5" /> Wait: &lt; 5 mins
                        </div>
                    </motion.div>

                    {/* FEATURE 10: Dynamic Operating Hours Indicator */}
                    <motion.div variants={itemVariants} className="bg-white border border-[#e2e2e2] rounded-[4px] p-6 hover:border-[#1a1a1a] hover:shadow-md transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#1a1a1a] transition-colors">
                            <PhoneCall size={24} className="text-[#1a1a1a] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-1">Callback Request</h3>
                        <p className="text-[13px] text-[#54626c] mb-4">Request a phone call back.</p>
                        <div className={`flex items-center text-[13px] font-bold ${isOpen ? 'text-[#458731]' : 'text-orange-500'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${isOpen ? 'bg-[#458731]' : 'bg-orange-500'}`} />
                            {isOpen ? 'Priority Line Open' : 'Offline - Starts 9 AM'}
                        </div>
                    </motion.div>

                    {/* FAQ Quick Link */}
                    <motion.div variants={itemVariants} className="bg-[#f8f9fa] border border-[#e2e2e2] rounded-[4px] p-6 flex items-center gap-4">
                        <HeadphonesIcon size={24} className="text-[#54626c]" />
                        <div>
                            <p className="text-[14px] font-bold text-[#1a1a1a]">Self-Serve FAQ</p>
                            <button className="text-[12px] text-[#0064d2] font-bold hover:underline">Browse Help Articles</button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Column: Secure Email Form */}
                <motion.div variants={itemVariants} className="lg:col-span-2 relative">
                    <AnimatePresence mode="wait">
                        {submitSuccess ? (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full bg-white border border-[#458731] rounded-[4px] p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]"
                            >
                                <div className="w-16 h-16 bg-[#eaf4d9] rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 size={32} className="text-[#458731]" />
                                </div>
                                <h2 className="text-[24px] font-black text-[#1a1a1a] mb-2 tracking-tight">Ticket Created</h2>
                                <p className="text-[15px] text-[#54626c] max-w-md mb-8">
                                    Your high-priority support ticket has been logged. A specialist will contact you at <strong>{user?.email}</strong> shortly.
                                </p>
                                <button 
                                    onClick={() => setSubmitSuccess(false)}
                                    className="text-[#458731] font-bold text-[14px] hover:underline flex items-center"
                                >
                                    Send another request <ArrowRight size={16} className="ml-1.5" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full bg-white border border-[#e2e2e2] rounded-[4px] shadow-sm overflow-hidden"
                            >
                                <div className="bg-[#f8f9fa] border-b border-[#e2e2e2] px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Mail size={18} className="text-[#1a1a1a] mr-2" />
                                        <h3 className="text-[15px] font-bold text-[#1a1a1a]">Log a Priority Ticket</h3>
                                    </div>
                                    <div className="flex items-center text-[12px] font-bold text-[#54626c] uppercase tracking-wider">
                                        <ShieldCheck size={14} className="mr-1" /> Secure Channel
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitTicket} className="p-6 md:p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[13px] font-bold text-[#54626c] uppercase mb-2">Seller Email</label>
                                            <input 
                                                type="email" 
                                                disabled
                                                value={user?.email || ''}
                                                className="w-full bg-[#f8f9fa] border border-[#e2e2e2] rounded-[4px] px-4 py-2.5 text-[14px] text-[#54626c] cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-bold text-[#54626c] uppercase mb-2">Account ID</label>
                                            <input 
                                                type="text" 
                                                disabled
                                                value={user?.uid?.substring(0, 12).toUpperCase() || ''}
                                                className="w-full bg-[#f8f9fa] border border-[#e2e2e2] rounded-[4px] px-4 py-2.5 text-[14px] text-[#54626c] cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-bold text-[#54626c] uppercase mb-2">Primary Subject</label>
                                        <div className="relative">
                                            <select 
                                                required
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full appearance-none border border-[#cccccc] rounded-[4px] px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#458731] transition-all"
                                            >
                                                <option value="" disabled>What is the issue about?</option>
                                                <option value="Payout Delay">Payout & Financial Delay</option>
                                                <option value="Listing Verification">Listing Verification Status</option>
                                                <option value="Sale Cancellation">Buyer Issue / Sale Cancellation</option>
                                                <option value="Security">Account Security & Access</option>
                                                <option value="Technical">Technical Error / API Issue</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-bold text-[#54626c] uppercase mb-2">Message Details</label>
                                        <textarea 
                                            required
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Please describe the issue. If referring to a specific sale, please include details here."
                                            className="w-full h-32 border border-[#cccccc] rounded-[4px] px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#458731] transition-all resize-none shadow-sm"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-[4px] text-[13px] font-medium">
                                            <AlertCircle size={16} /> {error}
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={isSubmitting || !subject || !message}
                                        className="w-full bg-[#1a1a1a] text-white py-4 rounded-[4px] font-bold text-[15px] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="animate-spin" size={20} /> Transmitting...</>
                                        ) : (
                                            'Log Support Ticket'
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Support Trust Strip */}
            <motion.div variants={itemVariants} className="mt-12 p-6 bg-white border border-[#e2e2e2] rounded-[4px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <ShieldCheck size={32} className="text-[#458731]" />
                    <div>
                        <p className="text-[15px] font-bold text-[#1a1a1a]">Parbet Seller Protection</p>
                        <p className="text-[13px] text-[#54626c]">All support requests are encrypted and handled by verified staff.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Info size={16} className="text-gray-400 mt-0.5" />
                    <p className="text-[12px] text-[#54626c] max-w-[300px]">
                        Our average response time for sellers is <strong>4 hours</strong>. Urgent sale issues are prioritized.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}