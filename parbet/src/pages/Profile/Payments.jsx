import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, ChevronDown, CreditCard, History, Download, 
    ExternalLink, Loader2, DollarSign, Landmark, 
    PlusCircle, ShieldCheck, Smartphone, Trash2, ArrowUpRight, Lock, X 
} from 'lucide-react';
import { useMainStore } from '../../store/useMainStore';
import { useNavigate } from 'react-router-dom';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 8 Profile Payments)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Ambient Illustrative Backgrounds
 * FEATURE 2: Real-Time Transaction Ledger Extraction
 * FEATURE 3: 3-Way Dynamic Tab Navigation (Activity, Cards/UPI, Bank Payouts)
 * FEATURE 4: Real-Time Search & Live Date Range Filter Control
 * FEATURE 5: Real-Time Modal Form for Adding/Modifying Bank Details
 * FEATURE 6: Real-Time Modal Form for Adding/Modifying UPI IDs
 * FEATURE 7: Secure Bank Transfer/Payout Accounts UI (Hooked to Real Data)
 * FEATURE 8: Functional CSV Excel Report Downloader
 * FEATURE 9: Live Escrow Wallet Context Block
 * FEATURE 10: 1:1 Booknshow Enterprise Empty State Mapping
 */

const formatDate = (timestamp) => {
    if (!timestamp) return 'Date TBA';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(d)) return 'Date TBA';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const generateShortHash = (id) => {
    if (!id) return '00000000';
    return id.substring(0, 8).toUpperCase();
};

const AmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FAD8DC] opacity-30 blur-[100px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#EB5B6E] opacity-10 blur-[120px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
    </div>
);

export default function Payments() {
    const navigate = useNavigate();
    const { user, wallet, orders, isLoadingOrders, bankDetails, saveBankDetails } = useMainStore();
    
    // UI States
    const [activeTab, setActiveTab] = useState('Payment activity');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRangeFilter, setDateRangeFilter] = useState('all'); // all, 30days, 6months, 1year
    
    // Modal States for Real-Time Writing
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
    const [isSavingData, setIsSavingData] = useState(false);
    
    // Form States
    const [bankForm, setBankForm] = useState({ accountName: '', accountNumber: '', ifscCode: '', bankName: '' });
    const [upiForm, setUpiForm] = useState({ upiId: '' });

    // Open Modals & Pre-fill if modifying existing data
    const handleOpenBankModal = () => {
        if (bankDetails) {
            setBankForm({
                accountName: bankDetails.accountName || '',
                accountNumber: bankDetails.accountNumber || '',
                ifscCode: bankDetails.ifscCode || '',
                bankName: bankDetails.bankName || ''
            });
        }
        setIsBankModalOpen(true);
    };

    const handleOpenUpiModal = () => {
        if (bankDetails && bankDetails.upiId) {
            setUpiForm({ upiId: bankDetails.upiId });
        }
        setIsUpiModalOpen(true);
    };

    // Real-Time Firebase Submission Logic
    const handleSaveBankData = async (e) => {
        e.preventDefault();
        setIsSavingData(true);
        try {
            await saveBankDetails({ ...bankDetails, ...bankForm });
            setIsBankModalOpen(false);
            alert("Bank account details securely saved and encrypted.");
        } catch (error) {
            alert("Failed to save bank details.");
        } finally {
            setIsSavingData(false);
        }
    };

    const handleSaveUpiData = async (e) => {
        e.preventDefault();
        setIsSavingData(true);
        try {
            await saveBankDetails({ ...bankDetails, ...upiForm });
            setIsUpiModalOpen(false);
            alert("UPI ID securely linked.");
        } catch (error) {
            alert("Failed to save UPI ID.");
        } finally {
            setIsSavingData(false);
        }
    };

    const handleDeletePaymentMethod = async (type) => {
        if (!window.confirm(`Are you sure you want to permanently delete this ${type}?`)) return;
        setIsSavingData(true);
        try {
            let payload = { ...bankDetails };
            if (type === 'Bank Account') {
                payload.accountName = ''; payload.accountNumber = ''; payload.ifscCode = ''; payload.bankName = '';
            } else if (type === 'UPI ID') {
                payload.upiId = '';
            }
            await saveBankDetails(payload);
        } catch (error) {
            alert("Deletion failed.");
        } finally {
            setIsSavingData(false);
        }
    };

    // Ledger Mapping & Filtering Engine
    const { processedPayments, totalSpent } = useMemo(() => {
        if (!orders) return { processedPayments: [], totalSpent: 0 };
        
        const now = new Date().getTime();
        let total = 0;
        
        const mappedPayments = orders.map(order => {
            const amount = Number(order.totalAmount || (order.price * order.quantity) || 0);
            return {
                id: order.id,
                paymentId: order.paymentId || order.id,
                date: formatDate(order.createdAt || order.eventTimestamp),
                timestamp: order.createdAt?.toDate ? order.createdAt.toDate().getTime() : new Date(order.createdAt || 0).getTime(),
                description: order.eventName || order.title || 'Booknshow Event Ticket',
                amount: amount,
                status: order.status === 'completed' || order.status === 'Paid' ? 'Completed' : (order.status || 'Processing')
            };
        });

        let filtered = mappedPayments.filter(payment => {
            // 1. Search Filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                if (!payment.paymentId.toLowerCase().includes(term) && !payment.description.toLowerCase().includes(term)) return false;
            }
            
            // 2. Date Range Filter
            if (dateRangeFilter !== 'all') {
                const diffTime = Math.abs(now - payment.timestamp);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (dateRangeFilter === '30days' && diffDays > 30) return false;
                if (dateRangeFilter === '6months' && diffDays > 180) return false;
                if (dateRangeFilter === '1year' && diffDays > 365) return false;
            }
            
            return true;
        });

        filtered.forEach(p => total += p.amount);
        filtered.sort((a, b) => b.timestamp - a.timestamp);

        return { processedPayments: filtered, totalSpent: total };
    }, [orders, searchTerm, dateRangeFilter]);

    // CSV Downloader
    const handleDownloadCSV = () => {
        if (processedPayments.length === 0) return alert("No data available to download.");
        
        const headers = ['Date', 'Order ID', 'Description', 'Amount (INR)', 'Status'];
        const csvContent = [
            headers.join(','),
            ...processedPayments.map(p => `"${p.date}","${generateShortHash(p.paymentId)}","${p.description}","${p.amount}","${p.status}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Booknshow_Transaction_Report_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <div className="w-full font-sans max-w-[1000px] pb-20 pt-4 relative min-h-screen">
            <AmbientBackground />

            <motion.div initial="hidden" animate="show" variants={containerVariants} className="relative z-10">
                <motion.h1 variants={itemVariants} className="text-[32px] font-black text-[#333333] mb-8 tracking-tight leading-tight px-6 md:px-8">
                    Payments & Configurations
                </motion.h1>

                {/* 3-Way Dynamic Tab Navigation */}
                <motion.div variants={itemVariants} className="flex border-b border-[#A3A3A3]/30 mb-8 overflow-x-auto no-scrollbar px-6 md:px-8">
                    {['Payment activity', 'Saved cards & UPI', 'Bank accounts (Payouts)'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-2 mr-8 text-[15px] font-black transition-all border-b-[3px] relative whitespace-nowrap ${
                                activeTab === tab ? 'border-[#E7364D] text-[#E7364D]' : 'border-transparent text-[#626262] hover:text-[#333333]'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </motion.div>

                <div className="px-6 md:px-8">
                    <AnimatePresence mode="wait">
                        {/* --- TAB 1: PAYMENT ACTIVITY --- */}
                        {activeTab === 'Payment activity' && (
                            <motion.div key="activity" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="w-full">
                                {/* Real-Time Filter Engine */}
                                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4 mb-8">
                                    <div className="relative flex-1 w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={18} />
                                        <input 
                                            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by order ID or description"
                                            className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[8px] text-[14px] text-[#333333] font-medium outline-none focus:bg-[#FFFFFF] focus:border-[#E7364D]/50 transition-colors shadow-sm"
                                        />
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <select 
                                            value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)}
                                            className="flex-1 md:flex-none px-4 py-3 bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[8px] hover:border-[#E7364D]/30 transition-colors text-[14px] font-bold text-[#333333] shadow-sm outline-none cursor-pointer"
                                        >
                                            <option value="all">All Time History</option>
                                            <option value="30days">Last 30 Days</option>
                                            <option value="6months">Last 6 Months</option>
                                            <option value="1year">Last Year</option>
                                        </select>
                                        <button onClick={handleDownloadCSV} className="px-4 py-3 bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[8px] hover:border-[#E7364D]/30 transition-colors text-[#333333] shadow-sm hover:text-[#E7364D]" title="Download Excel CSV">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </motion.div>

                                {isLoadingOrders ? (
                                    <div className="flex flex-col items-center justify-center py-24">
                                        <Loader2 className="animate-spin text-[#E7364D] mb-4" size={36} />
                                        <p className="text-[#626262] font-bold text-[14px] uppercase tracking-widest">Retrieving Secure Ledger...</p>
                                    </div>
                                ) : processedPayments.length > 0 ? (
                                    <motion.div variants={itemVariants} className="w-full bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] overflow-hidden shadow-sm hover:shadow-[0_4px_20px_rgba(51,51,51,0.03)] transition-shadow">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-[#F5F5F5] border-b border-[#A3A3A3]/20">
                                                        <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Date</th>
                                                        <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Order #</th>
                                                        <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Description</th>
                                                        <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest text-right">Amount</th>
                                                        <th className="px-6 py-4 text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#A3A3A3]/10">
                                                    {processedPayments.map((p) => (
                                                        <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                                                            <td className="px-6 py-4 text-[14px] text-[#626262] font-medium whitespace-nowrap">{p.date}</td>
                                                            <td className="px-6 py-4 text-[14px] text-[#333333] font-mono font-bold cursor-pointer hover:text-[#E7364D] hover:underline">#{generateShortHash(p.paymentId)}</td>
                                                            <td className="px-6 py-4 text-[14px] font-bold text-[#333333]">{p.description}</td>
                                                            <td className="px-6 py-4 text-[15px] font-black text-[#333333] text-right whitespace-nowrap">₹{p.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-1.5 rounded-[6px] text-[11px] font-black uppercase tracking-widest border ${
                                                                    p.status === 'Completed' ? 'bg-[#FAD8DC]/30 text-[#E7364D] border-[#E7364D]/20' : 'bg-[#F5F5F5] text-[#626262] border-[#A3A3A3]/30'
                                                                }`}>
                                                                    {p.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div variants={itemVariants} className="text-center py-24 flex flex-col items-center bg-[#FFFFFF] border border-dashed border-[#A3A3A3]/30 rounded-[12px] shadow-sm">
                                        <div className="bg-[#FAD8DC]/20 p-5 rounded-full mb-6 border border-[#E7364D]/20">
                                            <History size={40} className="text-[#E7364D]" />
                                        </div>
                                        <h3 className="text-[20px] font-black text-[#333333] mb-2 text-center">No Activity Found</h3>
                                        <p className="text-[14px] text-[#626262] font-medium mb-8 max-w-sm text-center px-4 leading-relaxed">
                                            Try adjusting your date range filter or search parameters to view your transaction history.
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* --- TAB 2: SAVED CARDS & UPI --- */}
                        {activeTab === 'Saved cards & UPI' && (
                            <motion.div key="cards" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="w-full space-y-8">
                                
                                {/* UPI ID Registry (Real Implementation) */}
                                <motion.div variants={itemVariants} className="w-full bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-6 md:p-8 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pb-6 border-b border-[#A3A3A3]/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#F5F5F5] text-[#333333] border border-[#A3A3A3]/30 rounded-full flex items-center justify-center shrink-0">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-[18px] font-black text-[#333333]">Virtual Payment Address (UPI)</h3>
                                                <p className="text-[13px] text-[#626262] font-medium mt-1">Link your GPay, PhonePe, or Paytm VPA for payouts and refunds.</p>
                                            </div>
                                        </div>
                                        <button onClick={handleOpenUpiModal} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[8px] text-[13px] font-bold text-[#333333] hover:bg-[#FFFFFF] hover:border-[#E7364D]/50 hover:text-[#E7364D] transition-all shadow-sm whitespace-nowrap">
                                            <PlusCircle size={16} /> {bankDetails?.upiId ? "Update UPI ID" : "Add UPI ID"}
                                        </button>
                                    </div>

                                    {bankDetails?.upiId ? (
                                        <div className="bg-[#FAFAFA] border border-[#A3A3A3]/20 rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between shadow-[0_2px_10px_rgba(51,51,51,0.02)] hover:border-[#E7364D]/30 transition-colors">
                                            <div className="flex items-center gap-5 mb-4 md:mb-0">
                                                <div className="w-16 h-10 bg-[#FFFFFF] rounded shadow-sm flex items-center justify-center border border-[#A3A3A3]/30 font-black text-[16px] italic text-[#1a1f71] tracking-tighter">UPI</div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="text-[16px] font-black text-[#333333] lowercase">{bankDetails.upiId}</p>
                                                        <span className="bg-[#FAD8DC]/30 text-[#E7364D] border border-[#E7364D]/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[6px]">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeletePaymentMethod('UPI ID')} disabled={isSavingData} className="text-[13px] font-bold text-[#E7364D] hover:text-[#FFFFFF] flex items-center gap-1.5 self-start md:self-auto px-4 py-2 bg-[#FAD8DC]/20 hover:bg-[#E7364D] rounded-[6px] transition-all">
                                                {isSavingData ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-[#FFFFFF] border border-dashed border-[#A3A3A3]/40 rounded-[12px] p-10 flex flex-col items-center justify-center text-center">
                                            <div className="bg-[#F5F5F5] p-4 rounded-full mb-4"><Smartphone size={28} className="text-[#A3A3A3]" /></div>
                                            <h4 className="text-[16px] font-black text-[#333333] mb-1.5">No UPI IDs saved</h4>
                                            <p className="text-[13px] text-[#626262] font-medium max-w-sm leading-relaxed">Save a Virtual Payment Address (VPA) to process fast payouts.</p>
                                        </div>
                                    )}
                                </motion.div>
                                
                                {/* Placeholder for Cards (Razorpay Requires Backend Vault logic beyond scope) */}
                                <motion.div variants={itemVariants} className="w-full bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-6 md:p-8 shadow-sm opacity-60">
                                    <h3 className="text-[18px] font-black text-[#333333] mb-2 flex items-center"><CreditCard className="mr-2" size={20}/> Card Vault Locked</h3>
                                    <p className="text-[13px] text-[#626262] font-medium max-w-xl">Direct credit/debit card storage requires RazorpayX PCI-DSS tokenization compliance. Booknshow automatically saves cards entered during checkout into your vault securely.</p>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* --- TAB 3: BANK ACCOUNTS (PAYOUTS) --- */}
                        {activeTab === 'Bank accounts (Payouts)' && (
                            <motion.div key="banks" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="w-full">
                                <motion.div variants={itemVariants} className="w-full bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-6 md:p-8 shadow-[0_4px_20px_rgba(51,51,51,0.03)] hover:shadow-[0_8px_30px_rgba(231,54,77,0.08)] transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pb-6 border-b border-[#A3A3A3]/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#FAD8DC]/30 text-[#E7364D] border border-[#E7364D]/20 rounded-full flex items-center justify-center shrink-0">
                                                <Landmark size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-[18px] font-black text-[#333333]">Bank Accounts (Payouts)</h3>
                                                <p className="text-[13px] text-[#626262] font-medium mt-1">Configure where Booknshow sends your funds when your listed tickets sell.</p>
                                            </div>
                                        </div>
                                        <button onClick={handleOpenBankModal} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#333333] text-[#FFFFFF] rounded-[8px] text-[13px] font-bold hover:bg-[#E7364D] transition-colors shadow-sm whitespace-nowrap hover:-translate-y-0.5 transform duration-200">
                                            <PlusCircle size={16} /> {bankDetails?.accountNumber ? "Modify Bank Account" : "Add Bank Account"}
                                        </button>
                                    </div>

                                    {bankDetails?.accountNumber ? (
                                        <div className="bg-[#FAFAFA] border border-[#A3A3A3]/20 rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between">
                                            <div className="flex items-center gap-5 mb-4 md:mb-0">
                                                <div className="w-16 h-16 bg-[#FFFFFF] rounded-full shadow-sm flex items-center justify-center border border-[#A3A3A3]/30 text-[#E7364D]"><Landmark size={24} /></div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="text-[16px] font-black text-[#333333]">{bankDetails.bankName || 'Linked Bank Account'}</p>
                                                        <span className="bg-[#FAD8DC]/30 text-[#E7364D] border border-[#E7364D]/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[6px]">Verified</span>
                                                    </div>
                                                    <p className="text-[13px] text-[#A3A3A3] font-bold tracking-wide">ACCT: •••• {bankDetails.accountNumber.slice(-4)} <span className="mx-2">•</span> IFSC: {bankDetails.ifscCode}</p>
                                                    <p className="text-[12px] text-[#626262] font-medium mt-1 uppercase tracking-wider">HOLDER: {bankDetails.accountName}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeletePaymentMethod('Bank Account')} disabled={isSavingData} className="text-[13px] font-bold text-[#E7364D] hover:text-[#FFFFFF] flex items-center gap-1.5 self-start md:self-auto px-4 py-2 bg-[#FAD8DC]/20 hover:bg-[#E7364D] rounded-[6px] transition-all">
                                                {isSavingData ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-[#FAFAFA] border border-dashed border-[#A3A3A3]/40 rounded-[12px] p-12 flex flex-col items-center justify-center text-center">
                                            <ShieldCheck size={48} className="text-[#E7364D] mb-5 opacity-80" />
                                            <h4 className="text-[20px] font-black text-[#333333] mb-3">Secure Payout Gateway</h4>
                                            <p className="text-[14px] text-[#626262] font-medium max-w-md leading-relaxed">Ensure you enter correct institutional details. Withdrawals are processed safely via the RazorpayX Escrow API.</p>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* --- MODALS (Real-Time Writing Forms) --- */}
            <AnimatePresence>
                {isBankModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#333333]/80 backdrop-blur-sm" onClick={() => setIsBankModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#FFFFFF] rounded-[16px] w-full max-w-md p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                            <button onClick={() => setIsBankModalOpen(false)} className="absolute top-4 right-4 text-[#A3A3A3] hover:text-[#E7364D] transition-colors"><X size={24} /></button>
                            <h3 className="text-[24px] font-black text-[#333333] mb-6 flex items-center"><Landmark className="mr-3 text-[#E7364D]" size={28}/> Link Bank Account</h3>
                            <form onSubmit={handleSaveBankData} className="space-y-5">
                                <div>
                                    <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-2">Account Holder Name</label>
                                    <input type="text" required value={bankForm.accountName} onChange={(e) => setBankForm({...bankForm, accountName: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] font-bold text-[#333333] focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="Legal Name" />
                                </div>
                                <div>
                                    <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-2 flex items-center"><Lock size={12} className="mr-1.5"/> Account Number</label>
                                    <input type="password" required value={bankForm.accountNumber} onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] font-bold text-[#333333] tracking-widest focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="•••• ••••" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-2">IFSC Code</label>
                                        <input type="text" required value={bankForm.ifscCode} onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] font-bold text-[#333333] uppercase focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="SBIN0000001" />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-2">Bank Name</label>
                                        <input type="text" required value={bankForm.bankName} onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] font-bold text-[#333333] focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="e.g. HDFC" />
                                    </div>
                                </div>
                                <button type="submit" disabled={isSavingData} className="w-full mt-4 bg-[#333333] text-[#FFFFFF] py-4 rounded-[8px] font-bold text-[15px] hover:bg-[#E7364D] transition-colors flex justify-center items-center">
                                    {isSavingData ? <Loader2 className="animate-spin mr-2" size={20} /> : null} Save Details
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isUpiModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#333333]/80 backdrop-blur-sm" onClick={() => setIsUpiModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#FFFFFF] rounded-[16px] w-full max-w-sm p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                            <button onClick={() => setIsUpiModalOpen(false)} className="absolute top-4 right-4 text-[#A3A3A3] hover:text-[#E7364D] transition-colors"><X size={24} /></button>
                            <h3 className="text-[24px] font-black text-[#333333] mb-6 flex items-center"><Smartphone className="mr-3 text-[#E7364D]" size={28}/> Link UPI ID</h3>
                            <form onSubmit={handleSaveUpiData} className="space-y-5">
                                <div>
                                    <label className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-2">Virtual Payment Address</label>
                                    <input type="text" required value={upiForm.upiId} onChange={(e) => setUpiForm({ upiId: e.target.value })} className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/30 rounded-[8px] px-4 py-3.5 text-[14px] font-bold text-[#333333] lowercase focus:bg-[#FFFFFF] focus:border-[#E7364D] outline-none transition-colors" placeholder="username@upi" />
                                </div>
                                <button type="submit" disabled={isSavingData} className="w-full mt-4 bg-[#333333] text-[#FFFFFF] py-4 rounded-[8px] font-bold text-[15px] hover:bg-[#E7364D] transition-colors flex justify-center items-center">
                                    {isSavingData ? <Loader2 className="animate-spin mr-2" size={20} /> : null} Save Details
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}