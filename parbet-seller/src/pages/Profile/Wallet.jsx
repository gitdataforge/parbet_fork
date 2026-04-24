import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet as WalletIcon, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Search, 
    Filter, 
    Download, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Info,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    History,
    Banknote,
    Loader2,
    ShieldCheck,
    Building2,
    Smartphone,
    Receipt
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSellerStore } from '../../store/useSellerStore';

export default function Wallet() {
    // FEATURE 1: Secure Data Extraction & Dynamic Role Checking
    const { 
        walletBalance = 0, 
        pendingBalance = 0, 
        transactions = [], 
        isLoading,
        isSubmitting,
        requestWithdrawal,
        bankDetails,
        currency,
        isAdmin // Dynamic Multi-Admin Role State
    } = useSellerStore();

    // FEATURE 2: Complex Transaction State Machine
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');
    const [expandedTxId, setExpandedTxId] = useState(null);

    // FEATURE 3: Dynamic Threshold Engine
    const minWithdrawalLimit = isAdmin ? 500 : 50000;

    // FEATURE 4: Real-Time Search & Multi-Type Filter Engine
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const searchTarget = `${tx.id || ''} ${tx.description || ''}`;
            const matchesSearch = searchTarget.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = 
                typeFilter === 'All' ? true :
                typeFilter === 'Sale' ? tx.type === 'sale' :
                typeFilter === 'Withdrawal' ? tx.type === 'withdrawal' : true;
            
            return matchesSearch && matchesType;
        }).sort((a, b) => {
            const dateA = a.requestDate?.seconds ? a.requestDate.seconds * 1000 : a.requestDate || a.date;
            const dateB = b.requestDate?.seconds ? b.requestDate.seconds * 1000 : b.requestDate || b.date;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        }); // Chronological Pipeline Sorting
    }, [transactions, searchTerm, typeFilter]);

    // FEATURE 5: Currency Formatting (Strict INR)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // FEATURE 6: Date Parsing Engine for Firestore Timestamps
    const formatDate = (val) => {
        if (!val) return 'N/A';
        const date = new Date(val.seconds ? val.seconds * 1000 : val);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // FEATURE 7: Secure Razorpay Withdrawal Logic with Dynamic Limits
    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawError('');
        setWithdrawSuccess(false);

        const amount = Number(withdrawAmount);
        
        try {
            if (!bankDetails) throw new Error("A verified payout method is required. Please configure your bank details in Payments.");
            if (isNaN(amount) || amount <= 0) throw new Error("Please enter a valid withdrawal amount.");
            if (amount < minWithdrawalLimit) throw new Error(`Minimum withdrawal limit is ${formatCurrency(minWithdrawalLimit)}.`);
            if (amount > walletBalance) throw new Error(`Insufficient funds. Available balance is ${formatCurrency(walletBalance)}.`);

            await requestWithdrawal(amount);
            setWithdrawSuccess(true);
            setWithdrawAmount('');
            setTimeout(() => setWithdrawSuccess(false), 6000);
        } catch (err) {
            setWithdrawError(err.message);
            console.error("Withdrawal pipeline blocked:", err);
        }
    };

    // FEATURE 8: Local Excel Export using SheetJS
    const handleExport = () => {
        if (filteredTransactions.length === 0) return;
        
        const mappedData = filteredTransactions.map(t => ({
            'Transaction ID': t.id,
            'Date': formatDate(t.requestDate || t.date),
            'Type': t.type?.toUpperCase() || 'WITHDRAWAL',
            'Description': t.description || 'N/A',
            'Amount': formatCurrency(t.amount),
            'Currency': t.currency || 'INR',
            'Status': t.status?.toUpperCase() || 'PROCESSING'
        }));

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const colWidths = Object.keys(mappedData[0]).map(key => ({ wch: Math.max(key.length, 20) }));
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Wallet_Ledger');
        XLSX.writeFile(workbook, `Parbet_Wallet_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // FEATURE 9: Framer Motion Physics for Financial Cards
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#1a1a1a] mb-4" />
                <p className="text-[13px] font-bold text-[#54626c] tracking-widest uppercase">Syncing Financial Ledger...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans max-w-[1100px] pb-20"
        >
            {/* FEATURE 10: Contextual Header */}
            <div className="mb-8">
                <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-tight leading-tight mb-2">Wallet</h1>
                <p className="text-[#54626c] text-[15px]">Manage your earnings, track settlements, and instantly withdraw funds to your bank account.</p>
            </div>

            {/* FEATURE 11: Real-Time Balance Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Available Balance Card */}
                <motion.div variants={cardVariants} className="bg-[#1a1a1a] rounded-[12px] p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <WalletIcon size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Available to Withdraw</span>
                            <WalletIcon size={20} className="text-[#8cc63f]" />
                        </div>
                        <h2 className="text-[40px] font-black tracking-tight leading-none mb-6">{formatCurrency(walletBalance)}</h2>
                    </div>
                    <div className="relative z-10 mt-8">
                        <p className="text-[12px] text-gray-400 mb-1 flex items-center gap-1.5 font-bold">
                            <CheckCircle2 size={14} className="text-[#8cc63f]" /> Auto-Settlement Enabled via Razorpay
                        </p>
                    </div>
                </motion.div>

                {/* Pending Balance Card */}
                <motion.div variants={cardVariants} className="bg-white border border-[#e2e2e2] rounded-[12px] p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[12px] font-bold uppercase tracking-widest text-[#54626c]">Pending Clearance</span>
                            <Clock size={20} className="text-orange-500" />
                        </div>
                        <h2 className="text-[36px] font-black text-[#1a1a1a] tracking-tight">{formatCurrency(pendingBalance)}</h2>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[12px] text-orange-600 bg-orange-50 border border-orange-100 px-4 py-2 rounded-[6px] font-bold">
                        <Info size={16} /> Funds clear 5-8 days post-event.
                    </div>
                </motion.div>

                {/* Lifetime Earnings Card */}
                <motion.div variants={cardVariants} className="bg-white border border-[#e2e2e2] rounded-[12px] p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[12px] font-bold uppercase tracking-widest text-[#54626c]">Lifetime Revenue</span>
                            <TrendingUp size={20} className="text-[#458731]" />
                        </div>
                        <h2 className="text-[36px] font-black text-[#1a1a1a] tracking-tight">
                            {formatCurrency(transactions.filter(t => t.type === 'sale').reduce((acc, curr) => acc + curr.amount, 0))}
                        </h2>
                    </div>
                    <div className="mt-8">
                        <p className="text-[13px] text-[#54626c] font-bold">From {transactions.filter(t => t.type === 'sale').length} confirmed sales</p>
                    </div>
                </motion.div>
            </div>

            {/* FEATURE 12: Interactive Secure Withdrawal Form */}
            <motion.div variants={cardVariants} className="bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm mb-10 overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 w-full">
                        <h3 className="text-[18px] font-black text-[#1a1a1a] mb-2">Initiate Withdrawal</h3>
                        <p className="text-[14px] text-[#54626c] mb-6">Enter the amount to transfer. Funds are remitted to your configured payout method instantly via IMPS/NEFT.</p>
                        
                        {/* Dynamic Payment Route Display */}
                        <div className="flex items-center justify-between bg-[#f8f9fa] p-4 rounded-[6px] border border-[#e2e2e2] mb-6">
                            <div className="flex items-center gap-3">
                                {bankDetails?.payoutMethod === 'upi' ? <Smartphone size={24} className="text-[#0064d2]" /> : <Building2 size={24} className="text-[#0064d2]" />}
                                <div>
                                    <p className="text-[13px] font-black text-[#1a1a1a]">
                                        {bankDetails?.payoutMethod === 'upi' ? bankDetails.upiId : `${bankDetails?.bankName || 'Bank'} (*${bankDetails?.accountLastFour || 'XXXX'})`}
                                    </p>
                                    <p className="text-[12px] text-[#54626c] font-medium">Primary Destination Route</p>
                                </div>
                            </div>
                            {bankDetails?.verified ? (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#458731] bg-[#eaf4d9] px-2 py-1 rounded-[4px]">
                                    <ShieldCheck size={12} /> Verified
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-[4px]">
                                    <Clock size={12} /> Pending KYC
                                </span>
                            )}
                        </div>

                        {withdrawError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold rounded-[6px] flex items-center gap-2">
                                <AlertCircle size={18} className="shrink-0" /> {withdrawError}
                            </div>
                        )}

                        <form onSubmit={handleWithdraw} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-black text-gray-400">₹</span>
                                <input 
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder={`Enter amount (Min. ${minWithdrawalLimit.toLocaleString()})`}
                                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#cccccc] rounded-[6px] text-[18px] font-black outline-none focus:border-[#0064d2] transition-all"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting || !withdrawAmount || Number(withdrawAmount) < minWithdrawalLimit}
                                className="bg-[#1a1a1a] hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black px-8 py-3.5 rounded-[6px] transition-all flex items-center justify-center gap-2 shadow-md w-full sm:w-auto shrink-0"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                                Withdraw Funds
                            </button>
                        </form>
                        
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-[12px] text-[#54626c] font-bold">Max Available: {formatCurrency(walletBalance)}</span>
                            <button 
                                type="button" 
                                onClick={() => setWithdrawAmount(walletBalance)}
                                className="text-[12px] font-black text-[#0064d2] hover:underline"
                            >
                                Withdraw Max Balance
                            </button>
                        </div>

                        <AnimatePresence>
                            {withdrawSuccess && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0 }}
                                    className="mt-6 p-4 bg-[#eaf4d9] border border-[#458731]/20 text-[#458731] text-[14px] font-bold rounded-[6px] flex items-start gap-3"
                                >
                                    <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> 
                                    <div>
                                        <p>Withdrawal requested successfully!</p>
                                        <p className="text-[12px] font-medium mt-1">Razorpay has initiated the IMPS/NEFT transfer. Funds will reflect in 2-24 business hours.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <div className="w-full md:w-72 bg-[#f8f9fa] p-6 rounded-[8px] border border-[#e2e2e2] shrink-0">
                        <h4 className="text-[12px] font-black uppercase tracking-widest text-[#1a1a1a] mb-5 flex items-center gap-2">
                            <Banknote size={16} className="text-[#0064d2]" /> Limits & Speeds
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-[#54626c] font-bold">Daily Limit</span>
                                <span className="font-black text-[#1a1a1a]">No Limit</span>
                            </div>
                            <div className="w-full h-[1px] bg-[#e2e2e2]"></div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-[#54626c] font-bold">Min. Payout</span>
                                <span className="font-black text-[#1a1a1a]">{formatCurrency(minWithdrawalLimit)}</span>
                            </div>
                            <div className="w-full h-[1px] bg-[#e2e2e2]"></div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-[#54626c] font-bold">Gateway Fee</span>
                                <span className="font-black text-[#458731]">FREE</span>
                            </div>
                            <div className="w-full h-[1px] bg-[#e2e2e2]"></div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-[#54626c] font-bold">Processing Time</span>
                                <span className="font-black text-[#1a1a1a]">2-24 Hours</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FEATURE 13: Production-Grade Transaction Ledger */}
            <div className="bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-[#e2e2e2] flex flex-col md:flex-row gap-4 bg-[#f8f9fa] items-center">
                    <div className="flex items-center gap-2 text-[#1a1a1a] font-black text-[18px] mr-auto">
                        <History size={20} className="text-[#0064d2]" /> Account Ledger
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search transactions..."
                                className="w-full md:w-56 pl-10 pr-4 py-2.5 bg-white border border-[#cccccc] rounded-[6px] text-[14px] outline-none focus:border-[#1a1a1a]"
                            />
                        </div>
                        <select 
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-white border border-[#cccccc] rounded-[6px] px-4 py-2.5 text-[14px] font-bold text-[#1a1a1a] outline-none cursor-pointer"
                        >
                            <option>All Types</option>
                            <option>Sale</option>
                            <option>Withdrawal</option>
                        </select>
                        <button 
                            onClick={handleExport}
                            disabled={filteredTransactions.length === 0}
                            className="flex items-center justify-center gap-2 bg-white border border-[#cccccc] hover:border-[#1a1a1a] px-4 py-2.5 rounded-[6px] text-[14px] font-bold text-[#1a1a1a] transition-colors disabled:opacity-50"
                        >
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {filteredTransactions.length > 0 ? (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-white text-[11px] font-black uppercase tracking-widest text-[#54626c]">
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Transaction ID</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Description</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Amount</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Status</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2] text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e2e2]">
                                {filteredTransactions.map((tx) => (
                                    <React.Fragment key={tx.id}>
                                        <tr 
                                            onClick={() => setExpandedTxId(expandedTxId === tx.id ? null : tx.id)}
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer group ${expandedTxId === tx.id ? 'bg-gray-50' : ''}`}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="text-[13px] font-mono font-bold text-[#1a1a1a]">#{tx.id?.substring(0, 12).toUpperCase()}</div>
                                                <div className="text-[12px] text-[#54626c] mt-0.5 font-medium">{formatDate(tx.requestDate || tx.date)}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${tx.type === 'sale' ? 'bg-[#eaf4d9] text-[#458731] border-[#458731]/20' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                                        {tx.type === 'sale' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                    </div>
                                                    <div className="text-[14px] font-bold text-[#1a1a1a] truncate max-w-[250px]">{tx.description || 'System Transfer'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`text-[16px] font-black ${tx.type === 'sale' ? 'text-[#458731]' : 'text-[#1a1a1a]'}`}>
                                                    {tx.type === 'sale' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    tx.status === 'completed' || tx.status === 'paid' ? 'bg-[#eaf4d9] text-[#458731]' : 
                                                    tx.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {tx.status === 'completed' || tx.status === 'paid' ? <CheckCircle2 size={12}/> : tx.status === 'failed' ? <AlertCircle size={12}/> : <Clock size={12}/>}
                                                    {tx.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right text-gray-400">
                                                {expandedTxId === tx.id ? <ChevronUp size={20} className="inline-block" /> : <ChevronDown size={20} className="inline-block" />}
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedTxId === tx.id && (
                                                <tr>
                                                    <td colSpan="5" className="p-0">
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="bg-[#f8f9fa] border-b border-[#e2e2e2] overflow-hidden"
                                                        >
                                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px]">
                                                                <div>
                                                                    <h4 className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-3">Transaction Metadata</h4>
                                                                    <div className="space-y-2 bg-white p-4 rounded-[6px] border border-[#e2e2e2]">
                                                                        <div className="flex justify-between"><span className="text-gray-500 font-bold">Type</span> <span className="font-black text-[#1a1a1a] uppercase">{tx.type}</span></div>
                                                                        <div className="flex justify-between"><span className="text-gray-500 font-bold">Reference ID</span> <span className="font-mono font-bold text-[#1a1a1a]">{tx.id}</span></div>
                                                                        <div className="flex justify-between"><span className="text-gray-500 font-bold">Processing Fee</span> <span className="font-black text-[#458731]">FREE</span></div>
                                                                    </div>
                                                                </div>
                                                                {tx.type === 'withdrawal' && (
                                                                    <div>
                                                                        <h4 className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-3">Razorpay Route</h4>
                                                                        <div className="space-y-2 bg-white p-4 rounded-[6px] border border-[#e2e2e2]">
                                                                            <div className="flex justify-between"><span className="text-gray-500 font-bold">Beneficiary</span> <span className="font-black text-[#1a1a1a]">{tx.bankDetailsSnapshot?.accountName || 'N/A'}</span></div>
                                                                            <div className="flex justify-between"><span className="text-gray-500 font-bold">Destination</span> <span className="font-black text-[#1a1a1a]">{tx.bankDetailsSnapshot?.payoutMethod === 'upi' ? tx.bankDetailsSnapshot?.upiId : `${tx.bankDetailsSnapshot?.bankName} (*${tx.bankDetailsSnapshot?.accountLastFour})`}</span></div>
                                                                            <div className="flex justify-between"><span className="text-gray-500 font-bold">Network</span> <span className="font-black text-[#0064d2]">IMPS / NEFT</span></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="md:col-span-2 flex justify-end">
                                                                    <button className="flex items-center gap-2 text-[13px] font-black text-[#0064d2] hover:underline">
                                                                        <Receipt size={16} /> View Official Receipt
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-24 px-6 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-6">
                                <History size={32} className="text-[#cccccc]" />
                            </div>
                            <h3 className="text-[20px] font-black text-[#1a1a1a] mb-2">Ledger is empty</h3>
                            <p className="text-[15px] text-[#54626c] max-w-md font-medium leading-relaxed">
                                {searchTerm ? "No transactions match your current search or filter criteria." : "Your financial history will appear here once you make a sale or request a withdrawal."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Compliance Footer */}
            <div className="bg-[#f0f9ff] border border-[#0064d2]/20 rounded-[8px] p-5 flex items-start gap-4">
                <ShieldCheck className="text-[#0064d2] shrink-0 mt-0.5" size={24} />
                <div>
                    <p className="text-[14px] text-[#0064d2] font-black mb-1">RazorpayX Enterprise Compliance</p>
                    <p className="text-[13px] text-[#0064d2]/80 leading-relaxed font-bold">
                        All wallet balances are held in a secure nodal account regulated by the RBI. Payouts are routed directly through RazorpayX infrastructure ensuring immediate IMPS/NEFT settlement to your verified destination.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}