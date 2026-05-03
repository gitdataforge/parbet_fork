import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, 
    Clock, CheckCircle2, AlertCircle, Loader2, 
    History, IndianRupee, ChevronRight, Download, Landmark, ShieldCheck
} from 'lucide-react';
import { useMainStore } from '../../store/useMainStore';
import { useNavigate } from 'react-router-dom';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 8 Profile Wallet)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Ambient Illustrative Backgrounds
 * FEATURE 2: Secure Live Balance Sync from Gatekeeper Main Store
 * FEATURE 3: Real-time Transaction Ledger Extraction & Sorting
 * FEATURE 4: Dynamic Withdrawal Validation Engine
 * FEATURE 5: Staggered Hardware-Accelerated Animations
 * FEATURE 6: Financial Sub-stats Calculation (Total Withdrawn/Pending)
 * FEATURE 7: 1:1 Booknshow Enterprise Empty State & Typography
 * FEATURE 8: Payout Method Status Checker
 * FEATURE 9: Secure Processing Educational Banner
 * FEATURE 10: Interactive Loading States
 */

const formatDate = (timestamp) => {
    if (!timestamp) return 'Date TBA';
    const d = new Date(timestamp);
    if (isNaN(d)) return 'Date TBA';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const generateShortHash = (id) => {
    if (!id) return '00000000';
    return id.substring(0, 8).toUpperCase();
};

// SECTION 1: Ambient Illustrative Background
const AmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#FAD8DC] opacity-30 blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#EB5B6E] opacity-10 blur-[120px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
    </div>
);

export default function Wallet() {
    const navigate = useNavigate();

    // Secure State Management
    const { wallet, isLoadingWallet, orders, user, bankDetails, requestWithdrawal } = useMainStore();
    
    // UI States
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    
    // Security Gate
    const hasPayoutMethod = !!bankDetails;

    // Real-time Transaction & Stats Computation
    const { transactions, stats } = useMemo(() => {
        if (!orders) return { transactions: [], stats: { pending: 0, withdrawn: 0, credits: 0 } };

        let pending = 0;
        let withdrawn = 0;
        let credits = 0;

        const mappedTransactions = orders.map(order => {
            const amount = Number(order.totalAmount || (order.price * order.quantity) || 0);
            
            // Calculate stats based on status
            if (order.status === 'completed' || order.status === 'Paid') {
                withdrawn += amount;
            } else if (order.status !== 'cancelled' && order.status !== 'refunded') {
                pending += amount;
            } else if (order.status === 'refunded') {
                credits += amount;
            }

            return {
                id: order.id,
                paymentId: order.paymentId || order.id,
                date: formatDate(order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : order.createdAt || order.eventTimestamp),
                timestamp: order.createdAt?.toDate ? order.createdAt.toDate().getTime() : new Date(order.createdAt || 0).getTime(),
                description: order.eventName || order.title || 'Booknshow Ticket Sale',
                amount: amount,
                type: order.status === 'refunded' ? 'Credit' : 'Payout',
                status: order.status === 'completed' || order.status === 'Paid' ? 'Processed' : 'Pending Escrow'
            };
        });

        // Sort chronological
        mappedTransactions.sort((a, b) => b.timestamp - a.timestamp);

        return { transactions: mappedTransactions, stats: { pending, withdrawn, credits } };
    }, [orders]);

    // Withdrawal Engine (Hooks to Zustand Main Store)
    const handleWithdrawalRequest = async () => {
        if (!hasPayoutMethod) {
            navigate('/profile/settings');
            return;
        }
        
        const balance = wallet?.balance || 0;
        if (balance <= 0) return;

        setIsWithdrawing(true);
        try {
            await requestWithdrawal(balance);
            alert('Withdrawal request initiated successfully. Escrow hold active.');
        } catch (error) {
            console.error("Withdrawal Error:", error);
            alert(error.message || 'Failed to initiate withdrawal. Please try again.');
        } finally {
            setIsWithdrawing(false);
        }
    };

    // Animation Config
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
    };

    return (
        <div className="w-full font-sans max-w-[1000px] pb-20 pt-4 relative min-h-screen">
            <AmbientBackground />

            <motion.div 
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="relative z-10 px-6 md:px-8"
            >
                {/* Header */}
                <motion.h1 
                    variants={itemVariants}
                    className="text-[32px] font-black text-[#333333] mb-2 tracking-tight leading-tight"
                >
                    Escrow Wallet
                </motion.h1>
                <motion.p variants={itemVariants} className="text-[#626262] text-[15px] font-medium mb-8">
                    Manage your earnings, refunds, and view your secure withdrawal ledger.
                </motion.p>

                {/* Live Balance Hero Card */}
                <motion.div 
                    variants={itemVariants}
                    className="w-full bg-[#333333] rounded-[16px] p-8 md:p-10 text-[#FFFFFF] mb-10 shadow-[0_10px_40px_rgba(51,51,51,0.15)] relative overflow-hidden"
                >
                    {/* Visual Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#E7364D]/20 rounded-full -mr-20 -mt-20 blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FAD8DC]/10 rounded-full -ml-10 -mb-10 blur-[40px] pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2.5">
                                <WalletIcon size={24} className="text-[#E7364D]" />
                                <span className="text-[13px] font-bold uppercase tracking-[2px] opacity-80">Available Escrow</span>
                            </div>
                            <div className="bg-[#FFFFFF]/10 backdrop-blur-md border border-[#FFFFFF]/20 px-3 py-1.5 rounded-[8px] text-[11px] font-black uppercase tracking-widest flex items-center">
                                <ShieldCheck size={14} className="mr-1.5 text-[#E7364D]" /> Secured Vault
                            </div>
                        </div>

                        {isLoadingWallet ? (
                            <div className="flex items-center gap-4 py-4 mb-8">
                                <Loader2 className="animate-spin text-[#E7364D]" size={40} />
                                <span className="text-[28px] font-black opacity-50 tracking-tight">Syncing encrypted funds...</span>
                            </div>
                        ) : (
                            <h2 className="text-[56px] md:text-[80px] font-black tracking-tighter mb-10 leading-none flex items-start">
                                <span className="text-[#E7364D] mr-2 text-[40px] md:text-[60px] mt-2">{wallet?.currency || '₹'}</span>
                                {(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h2>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleWithdrawalRequest}
                                disabled={(wallet?.balance || 0) <= 0 || isLoadingWallet || isWithdrawing}
                                className="bg-[#E7364D] hover:bg-[#EB5B6E] disabled:bg-[#FFFFFF]/10 disabled:text-[#FFFFFF]/30 disabled:cursor-not-allowed text-[#FFFFFF] font-bold py-4 px-8 rounded-[8px] text-[15px] transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(231,54,77,0.3)] hover:-translate-y-0.5"
                            >
                                {isWithdrawing ? <Loader2 className="animate-spin" size={18} /> : <ArrowUpRight size={18} />}
                                {isWithdrawing ? 'Processing Request...' : 'Withdraw Funds'}
                            </button>
                            
                            {!hasPayoutMethod && (
                                <button 
                                    onClick={() => navigate('/profile/settings')}
                                    className="bg-transparent border-2 border-[#FFFFFF]/30 hover:border-[#FFFFFF] hover:bg-[#FFFFFF]/10 text-[#FFFFFF] font-bold py-4 px-8 rounded-[8px] text-[15px] transition-all flex items-center justify-center gap-2"
                                >
                                    <Landmark size={18} /> Link Bank Account
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Financial Stats Sub-Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#333333]"></div>
                        <div className="flex items-center justify-between mb-4 pl-2">
                            <span className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-wider">Pending Escrow</span>
                            <div className="w-8 h-8 bg-[#F5F5F5] rounded-full flex items-center justify-center border border-[#A3A3A3]/30"><Clock size={16} className="text-[#333333]" /></div>
                        </div>
                        <p className="text-[28px] font-black text-[#333333] pl-2">{wallet?.currency || '₹'} {stats.pending.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#E7364D]"></div>
                        <div className="flex items-center justify-between mb-4 pl-2">
                            <span className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-wider">Total Withdrawn</span>
                            <div className="w-8 h-8 bg-[#FAD8DC]/30 rounded-full flex items-center justify-center border border-[#E7364D]/20"><CheckCircle2 size={16} className="text-[#E7364D]" /></div>
                        </div>
                        <p className="text-[28px] font-black text-[#333333] pl-2">{wallet?.currency || '₹'} {stats.withdrawn.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#A3A3A3]"></div>
                        <div className="flex items-center justify-between mb-4 pl-2">
                            <span className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-wider">Refund Credits</span>
                            <div className="w-8 h-8 bg-[#F5F5F5] rounded-full flex items-center justify-center border border-[#A3A3A3]/30"><AlertCircle size={16} className="text-[#626262]" /></div>
                        </div>
                        <p className="text-[28px] font-black text-[#333333] pl-2">{wallet?.currency || '₹'} {stats.credits.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </motion.div>
                </div>

                {/* Transaction History Ledger */}
                <motion.div variants={itemVariants} className="w-full mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h3 className="text-[20px] font-black text-[#333333] flex items-center gap-2">
                            <History size={20} className="text-[#E7364D]" /> Transaction Ledger
                        </h3>
                        <button className="text-[#333333] text-[14px] font-bold hover:text-[#E7364D] hover:bg-[#FAD8DC]/20 flex items-center bg-[#F5F5F5] border border-[#A3A3A3]/20 px-4 py-2.5 rounded-[8px] w-max transition-colors">
                            <Download size={16} className="mr-2" /> Download CSV
                        </button>
                    </div>

                    <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] overflow-hidden shadow-sm">
                        {transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F5F5F5] border-b border-[#A3A3A3]/20">
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Ref ID</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Description</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest text-right">Amount</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#A3A3A3]/10">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-[#FAFAFA] transition-colors">
                                                <td className="px-6 py-5 text-[14px] text-[#626262] font-medium whitespace-nowrap">{tx.date}</td>
                                                <td className="px-6 py-5 text-[14px] font-mono font-bold text-[#333333] cursor-pointer hover:text-[#E7364D] hover:underline">#{generateShortHash(tx.paymentId)}</td>
                                                <td className="px-6 py-5 text-[14px] font-bold text-[#333333]">{tx.description}</td>
                                                <td className="px-6 py-5 text-[15px] font-black text-[#333333] text-right whitespace-nowrap">
                                                    {tx.type === 'Credit' ? '+' : ''}{wallet?.currency || '₹'} {tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1.5 rounded-[6px] text-[11px] font-black uppercase tracking-widest border ${
                                                        tx.status === 'Processed' ? 'bg-[#FAD8DC]/30 text-[#E7364D] border-[#E7364D]/20' : 'bg-[#F5F5F5] text-[#626262] border-[#A3A3A3]/30'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center text-center px-5">
                                <div className="w-20 h-20 bg-[#FAD8DC]/20 border border-[#E7364D]/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <History size={32} className="text-[#E7364D]" />
                                </div>
                                <h4 className="text-[20px] font-black text-[#333333] mb-2">No transactions yet</h4>
                                <p className="text-[14px] text-[#626262] font-medium max-w-sm leading-relaxed mb-8">
                                    Your sales payouts, bank withdrawals, and account credits will automatically populate this cryptographic ledger.
                                </p>
                                <button onClick={() => navigate('/profile/sales')} className="bg-[#333333] text-[#FFFFFF] font-bold py-3.5 px-8 rounded-[8px] text-[14px] hover:bg-[#E7364D] transition-colors shadow-sm">
                                    View Sales Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Real-time Security Notice */}
                <motion.div 
                    variants={itemVariants}
                    className="p-6 bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] flex items-start gap-5 shadow-[0_4px_20px_rgba(51,51,51,0.03)]"
                >
                    <div className="bg-[#F5F5F5] p-3 rounded-full border border-[#A3A3A3]/30 shrink-0 mt-0.5">
                        <ShieldCheck size={24} className="text-[#333333]" />
                    </div>
                    <div>
                        <p className="text-[16px] font-black text-[#333333] mb-1.5">Bank-Grade Encrypted Infrastructure</p>
                        <p className="text-[14px] text-[#626262] font-medium leading-relaxed max-w-3xl">
                            Your funds are protected by institutional-grade Escrow. Automated withdrawals are processed securely and reflect in your linked primary bank account within 3-5 business days depending on standard banking cycles.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}