import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, 
    Search, 
    ArrowDownCircle, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ExternalLink, 
    ShieldCheck, 
    Building2, 
    Download,
    ChevronDown,
    ChevronUp,
    Filter,
    HelpCircle,
    Wallet,
    Landmark,
    Smartphone,
    Lock,
    Loader2,
    Plus,
    FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSellerStore } from '../../store/useSellerStore';

export default function Payments() {
    // FEATURE 1: Secure Real-Time Data Binding & Dual Ledger
    const { 
        transactions = [], 
        bankDetails, 
        walletBalance, 
        pendingBalance,
        isLoading, 
        isSubmitting,
        saveBankDetails,
        requestWithdrawal,
        currency,
        isAdmin // Dynamic Multi-Admin Role State
    } = useSellerStore();

    // FEATURE 2: Complex State Management for Modals & Forms
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedTxId, setExpandedTxId] = useState(null);
    
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    
    // Form States
    const [payoutMethod, setPayoutMethod] = useState('bank'); // 'bank' or 'upi'
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [upiId, setUpiId] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [formError, setFormError] = useState('');

    // FEATURE 3: Dynamic Threshold Engine
    const minWithdrawalLimit = isAdmin ? 500 : 50000;

    // FEATURE 4: Multi-Conditional Real-Time Search & Filter Engine
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const searchTarget = `${t.id || ''} ${t.description || ''}`;
            const matchesSearch = searchTarget.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = 
                statusFilter === 'All' ? true : 
                statusFilter === 'Completed' ? t.status === 'completed' || t.status === 'paid' :
                statusFilter === 'Processing' ? t.status === 'processing' :
                statusFilter === 'Failed' ? t.status === 'failed' : true;

            return matchesSearch && matchesStatus;
        }).sort((a, b) => {
            const dateA = a.requestDate?.seconds ? a.requestDate.seconds * 1000 : a.requestDate;
            const dateB = b.requestDate?.seconds ? b.requestDate.seconds * 1000 : b.requestDate;
            return dateB - dateA;
        });
    }, [transactions, searchTerm, statusFilter]);

    // FEATURE 5: Financial Aggregators
    const totalWithdrawn = useMemo(() => {
        return transactions
            .filter(t => t.status === 'completed' || t.status === 'paid')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    }, [transactions]);

    // FEATURE 6: Strict Currency Formatter
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // FEATURE 7: Date Parsing Engine for Firestore Timestamps
    const formatDate = (val) => {
        if (!val) return 'N/A';
        const date = new Date(val.seconds ? val.seconds * 1000 : val);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // FEATURE 8: Local Excel Export using SheetJS
    const handleExport = () => {
        if (filteredTransactions.length === 0) return;
        
        const mappedData = filteredTransactions.map(t => ({
            'Transaction ID': t.id,
            'Date': formatDate(t.requestDate),
            'Type': t.type?.toUpperCase() || 'WITHDRAWAL',
            'Description': t.description || 'N/A',
            'Amount': formatCurrency(t.amount),
            'Currency': t.currency || 'INR',
            'Status': t.status?.toUpperCase() || 'PROCESSING',
            'Destination': t.bankDetailsSnapshot?.bankName 
                ? `${t.bankDetailsSnapshot.bankName} (*${t.bankDetailsSnapshot.accountLastFour})` 
                : (t.bankDetailsSnapshot?.upiId || 'N/A')
        }));

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        
        // Auto-size columns
        const colWidths = Object.keys(mappedData[0]).map(key => ({ wch: Math.max(key.length, 20) }));
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payouts');
        XLSX.writeFile(workbook, `Parbet_Payouts_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // FEATURE 9: Strict Regex Validation for RazorpayX Integration
    const handleSaveBankDetails = async (e) => {
        e.preventDefault();
        setFormError('');

        try {
            let payload = { payoutMethod };

            if (payoutMethod === 'bank') {
                if (accountNumber.length < 8) throw new Error("Account number must be at least 8 digits.");
                if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) throw new Error("Invalid IFSC Code format.");
                if (!bankName.trim() || !accountName.trim()) throw new Error("All bank details are required.");

                payload = {
                    ...payload,
                    bankName: bankName.trim(),
                    accountName: accountName.trim(),
                    accountNumber: accountNumber.trim(), // Sent to backend, never exposed fully to frontend again
                    accountLastFour: accountNumber.trim().slice(-4),
                    ifsc: ifscCode.toUpperCase(),
                    verified: false
                };
            } else {
                if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) throw new Error("Invalid UPI ID format.");
                if (!accountName.trim()) throw new Error("Account holder name is required.");

                payload = {
                    ...payload,
                    accountName: accountName.trim(),
                    upiId: upiId.trim(),
                    verified: false
                };
            }

            await saveBankDetails(payload);
            setIsBankModalOpen(false);
            // Reset Form
            setAccountName(''); setAccountNumber(''); setIfscCode(''); setBankName(''); setUpiId('');
        } catch (err) {
            setFormError(err.message);
        }
    };

    // FEATURE 10: Secure Withdrawal Request with Dynamic Threshold Limits
    const handleRequestWithdrawal = async (e) => {
        e.preventDefault();
        setFormError('');

        const amount = Number(withdrawAmount);
        
        try {
            if (!bankDetails) throw new Error("Please configure a payout method first.");
            if (isNaN(amount) || amount <= 0) throw new Error("Please enter a valid withdrawal amount.");
            if (amount < minWithdrawalLimit) throw new Error(`Minimum withdrawal amount is ${formatCurrency(minWithdrawalLimit)}.`);
            if (amount > walletBalance) throw new Error(`Insufficient available balance. Maximum allowed: ${formatCurrency(walletBalance)}`);

            await requestWithdrawal(amount);
            setIsWithdrawModalOpen(false);
            setWithdrawAmount('');
        } catch (err) {
            setFormError(err.message);
        }
    };

    // FEATURE 11: Framer Motion Staggered Physics
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#1a1a1a] mb-4" size={32} />
                <p className="text-[13px] font-bold text-[#54626c] tracking-widest uppercase">Syncing Remittance History...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans max-w-[1100px] pb-20 relative"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-tight leading-tight mb-2">
                        Wallet & Payouts
                    </h1>
                    <p className="text-[#54626c] text-[15px]">
                        Manage your available balance, request withdrawals, and configure RazorpayX payout accounts.
                    </p>
                </div>
            </motion.div>

            {/* Financial Ledger Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Available Balance */}
                <motion.div variants={itemVariants} className="bg-[#1a1a1a] rounded-[12px] p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Wallet size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-gray-400 text-[13px] font-bold uppercase tracking-widest mb-2">
                            Available Balance <HelpCircle size={14} title="Funds cleared and ready for withdrawal" className="cursor-help"/>
                        </div>
                        <div className="text-[40px] font-black leading-none mb-6">
                            {formatCurrency(walletBalance)}
                        </div>
                        <button 
                            onClick={() => setIsWithdrawModalOpen(true)}
                            disabled={walletBalance < minWithdrawalLimit}
                            className="bg-white text-[#1a1a1a] hover:bg-gray-100 px-6 py-3 rounded-[8px] font-black text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            Request Withdrawal
                        </button>
                        {walletBalance > 0 && walletBalance < minWithdrawalLimit && (
                            <p className="text-red-400 text-[12px] mt-2 font-medium">Minimum withdrawal is {formatCurrency(minWithdrawalLimit)}</p>
                        )}
                    </div>
                </motion.div>

                {/* Pending & Bank Details */}
                <motion.div variants={itemVariants} className="flex flex-col gap-6">
                    {/* Pending Clearance */}
                    <div className="bg-white border border-[#e2e2e2] rounded-[12px] p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-[#54626c] text-[12px] font-bold uppercase tracking-widest mb-1">
                                Pending Clearance <Clock size={14} className="text-orange-500" />
                            </div>
                            <div className="text-[24px] font-black text-[#1a1a1a]">{formatCurrency(pendingBalance)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[12px] font-bold text-[#54626c] uppercase tracking-widest mb-1">Total Withdrawn</div>
                            <div className="text-[18px] font-black text-[#458731]">{formatCurrency(totalWithdrawn)}</div>
                        </div>
                    </div>

                    {/* Payout Method Card */}
                    <div className="bg-white border border-[#e2e2e2] rounded-[12px] p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#f8f9fa] border border-[#e2e2e2] rounded-full flex items-center justify-center shrink-0">
                                    {bankDetails?.payoutMethod === 'upi' ? <Smartphone size={20} className="text-[#0064d2]" /> : <Landmark size={20} className="text-[#0064d2]" />}
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-black text-[#1a1a1a] flex items-center gap-2 mb-1">
                                        Primary Payout Route
                                        {bankDetails?.verified ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#458731] bg-[#eaf4d9] px-2 py-0.5 rounded-full">
                                                <ShieldCheck size={12} /> Verified
                                            </span>
                                        ) : bankDetails ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                                                <Clock size={12} /> Pending Verification
                                            </span>
                                        ) : null}
                                    </h3>
                                    
                                    {bankDetails ? (
                                        <>
                                            {bankDetails.payoutMethod === 'upi' ? (
                                                <p className="text-[14px] text-[#54626c] font-medium">{bankDetails.upiId}</p>
                                            ) : (
                                                <p className="text-[14px] text-[#54626c] font-medium">
                                                    {bankDetails.bankName} •••• {bankDetails.accountLastFour}
                                                </p>
                                            )}
                                            <p className="text-[12px] text-gray-400 mt-0.5">{bankDetails.accountName}</p>
                                        </>
                                    ) : (
                                        <p className="text-[13px] text-red-500 font-medium">No payout method configured.</p>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsBankModalOpen(true)}
                                className="text-[13px] font-bold text-[#0064d2] hover:bg-[#ebf3fb] px-3 py-1.5 rounded-[4px] transition-colors"
                            >
                                {bankDetails ? 'Edit' : 'Add Method'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Interactive Remittance Table Tools */}
            <motion.div variants={itemVariants} className="bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm mb-6 overflow-hidden">
                <div className="p-4 border-b border-[#e2e2e2] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#f8f9fa]">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search transactions..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-[#cccccc] rounded-[6px] text-[14px] outline-none focus:border-[#458731] transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter size={16} className="text-[#54626c]" />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white border border-[#cccccc] rounded-[6px] px-4 py-2 text-[14px] font-bold text-[#1a1a1a] outline-none cursor-pointer"
                            >
                                <option value="All">All Transactions</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                    </div>
                    <button 
                        onClick={handleExport}
                        disabled={filteredTransactions.length === 0}
                        className="flex items-center gap-2 bg-white border border-[#cccccc] hover:border-[#1a1a1a] text-[#1a1a1a] px-4 py-2 rounded-[6px] text-[13px] font-bold transition-all w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} /> Export Excel
                    </button>
                </div>

                {/* Production-Grade Remittance Table */}
                <div className="overflow-x-auto">
                    {filteredTransactions.length > 0 ? (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-white text-[11px] font-bold uppercase tracking-wider text-[#54626c]">
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Transaction ID</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Date</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Description</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Amount</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Status</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2] text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e2e2]">
                                {filteredTransactions.map((t) => (
                                    <React.Fragment key={t.id}>
                                        <tr 
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedTxId === t.id ? 'bg-gray-50' : ''}`}
                                            onClick={() => setExpandedTxId(expandedTxId === t.id ? null : t.id)}
                                        >
                                            <td className="px-6 py-4 text-[13px] font-mono font-bold text-[#1a1a1a]">
                                                {t.id.substring(0, 12).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-[#54626c] font-medium">
                                                {formatDate(t.requestDate)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[14px] font-bold text-[#1a1a1a] flex items-center gap-2">
                                                    {t.type === 'withdrawal' ? <ArrowDownCircle size={14} className="text-orange-500" /> : <CreditCard size={14}/>}
                                                    {t.type?.toUpperCase()}
                                                </div>
                                                <div className="text-[12px] text-[#54626c] mt-0.5 truncate max-w-[200px]">{t.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[15px] font-black text-[#1a1a1a]">{formatCurrency(t.amount)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    t.status === 'completed' || t.status === 'paid' ? 'bg-[#eaf4d9] text-[#458731]' : 
                                                    t.status === 'failed' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-orange-50 text-orange-600 border border-orange-200'
                                                }`}>
                                                    {t.status === 'completed' || t.status === 'paid' ? <CheckCircle2 size={12}/> : t.status === 'failed' ? <AlertCircle size={12}/> : <Clock size={12}/>}
                                                    {t.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-400">
                                                {expandedTxId === t.id ? <ChevronUp size={20} className="inline-block" /> : <ChevronDown size={20} className="inline-block" />}
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedTxId === t.id && (
                                                <tr>
                                                    <td colSpan="6" className="px-0 py-0">
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="bg-[#f8f9fa] border-b border-[#e2e2e2] overflow-hidden"
                                                        >
                                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px]">
                                                                <div>
                                                                    <h4 className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-3">Destination Details</h4>
                                                                    <div className="space-y-2 bg-white p-4 rounded-[6px] border border-[#e2e2e2]">
                                                                        <div className="flex justify-between"><span className="text-gray-500">Method</span> <span className="font-bold text-[#1a1a1a] uppercase">{t.bankDetailsSnapshot?.payoutMethod || 'BANK TRANSFER'}</span></div>
                                                                        
                                                                        {t.bankDetailsSnapshot?.payoutMethod === 'upi' ? (
                                                                            <div className="flex justify-between"><span className="text-gray-500">UPI ID</span> <span className="font-bold text-[#1a1a1a]">{t.bankDetailsSnapshot.upiId}</span></div>
                                                                        ) : (
                                                                            <>
                                                                                <div className="flex justify-between"><span className="text-gray-500">Bank</span> <span className="font-bold text-[#1a1a1a]">{t.bankDetailsSnapshot?.bankName || 'N/A'}</span></div>
                                                                                <div className="flex justify-between"><span className="text-gray-500">Account</span> <span className="font-bold text-[#1a1a1a]">**** {t.bankDetailsSnapshot?.accountLastFour || 'N/A'}</span></div>
                                                                                <div className="flex justify-between"><span className="text-gray-500">IFSC</span> <span className="font-bold text-[#1a1a1a]">{t.bankDetailsSnapshot?.ifsc || 'N/A'}</span></div>
                                                                            </>
                                                                        )}
                                                                        <div className="flex justify-between"><span className="text-gray-500">Beneficiary</span> <span className="font-bold text-[#1a1a1a]">{t.bankDetailsSnapshot?.accountName || 'N/A'}</span></div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-3">System Timeline</h4>
                                                                    <div className="space-y-4">
                                                                        <div className="flex gap-3">
                                                                            <div className="mt-1"><div className="w-2 h-2 rounded-full bg-[#458731]"></div></div>
                                                                            <div>
                                                                                <p className="font-bold text-[#1a1a1a] leading-none">Request Initiated</p>
                                                                                <p className="text-gray-400 text-[12px] mt-1">{formatDate(t.requestDate)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-3">
                                                                            <div className="mt-1"><div className={`w-2 h-2 rounded-full ${t.status === 'completed' || t.status === 'paid' ? 'bg-[#458731]' : t.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'}`}></div></div>
                                                                            <div>
                                                                                <p className="font-bold text-[#1a1a1a] leading-none">{t.status === 'completed' || t.status === 'paid' ? 'Funds Settled' : t.status === 'failed' ? 'Transfer Failed' : 'Pending Settlement'}</p>
                                                                                <p className="text-gray-400 text-[12px] mt-1">
                                                                                    {t.status === 'processing' ? 'Typically takes 2-4 business days' : formatDate(t.updatedAt || t.requestDate)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
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
                                <FileText size={32} className="text-[#cccccc]" />
                            </div>
                            <h3 className="text-[20px] font-black text-[#1a1a1a] mb-2">No transactions found</h3>
                            <p className="text-[15px] text-[#54626c] max-w-sm mb-8">
                                {searchTerm ? "No records match your search criteria." : "Your withdrawal history and ledger adjustments will appear here."}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Support Escalation Footer */}
            <motion.div variants={itemVariants} className="bg-[#ebf3fb] border border-[#0064d2]/20 rounded-[8px] p-5 flex items-start gap-4">
                <ShieldCheck className="text-[#0064d2] shrink-0 mt-0.5" size={24} />
                <div>
                    <p className="text-[14px] text-[#0064d2] font-black mb-1">Bank Grade Security via RazorpayX</p>
                    <p className="text-[13px] text-[#0064d2]/80 leading-relaxed font-medium">
                        Your banking data is securely encrypted and routed directly to our payment processing partners. We only store the last 4 digits of your account number in our database for ledger verification. Payouts are subject to standard NEFT/RTGS settlement cycles.
                    </p>
                </div>
            </motion.div>

            {/* MODAL: ADD/EDIT PAYOUT METHOD */}
            <AnimatePresence>
                {isBankModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/80 backdrop-blur-sm">
                        <motion.div 
                            variants={modalVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="bg-white rounded-[12px] w-full max-w-[500px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-[#e2e2e2] flex items-center justify-between bg-[#f8f9fa]">
                                <div>
                                    <h3 className="text-[20px] font-black text-[#1a1a1a]">Payout Configuration</h3>
                                    <p className="text-[13px] text-[#54626c] mt-1 flex items-center gap-1 font-medium"><Lock size={12}/> Secured by RazorpayX Integration</p>
                                </div>
                                <button onClick={() => setIsBankModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                            </div>
                            
                            <form onSubmit={handleSaveBankDetails} className="p-6">
                                {formError && (
                                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold rounded-[6px] flex items-center gap-2">
                                        <AlertCircle size={16} /> {formError}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label className="block text-[12px] font-bold text-[#54626c] uppercase tracking-wider mb-2">Select Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setPayoutMethod('bank')}
                                            className={`py-3 flex items-center justify-center gap-2 rounded-[6px] border text-[14px] font-bold transition-colors ${payoutMethod === 'bank' ? 'bg-[#ebf3fb] border-[#0064d2] text-[#0064d2]' : 'bg-white border-[#e2e2e2] text-[#54626c]'}`}
                                        >
                                            <Building2 size={18} /> Bank Transfer
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setPayoutMethod('upi')}
                                            className={`py-3 flex items-center justify-center gap-2 rounded-[6px] border text-[14px] font-bold transition-colors ${payoutMethod === 'upi' ? 'bg-[#ebf3fb] border-[#0064d2] text-[#0064d2]' : 'bg-white border-[#e2e2e2] text-[#54626c]'}`}
                                        >
                                            <Smartphone size={18} /> UPI Route
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#1a1a1a] mb-1.5">Account Holder Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={accountName}
                                            onChange={(e) => setAccountName(e.target.value)}
                                            placeholder="As per bank records"
                                            className="w-full px-4 py-3 bg-white border border-[#cccccc] rounded-[6px] text-[15px] outline-none focus:border-[#0064d2] transition-colors"
                                        />
                                    </div>

                                    {payoutMethod === 'bank' ? (
                                        <>
                                            <div>
                                                <label className="block text-[13px] font-bold text-[#1a1a1a] mb-1.5">Bank Name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                    placeholder="e.g. HDFC Bank"
                                                    className="w-full px-4 py-3 bg-white border border-[#cccccc] rounded-[6px] text-[15px] outline-none focus:border-[#0064d2] transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-[#1a1a1a] mb-1.5">Account Number</label>
                                                <input 
                                                    type="password" 
                                                    required
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value)}
                                                    placeholder="Enter exact account number"
                                                    className="w-full px-4 py-3 bg-white border border-[#cccccc] rounded-[6px] text-[15px] outline-none focus:border-[#0064d2] transition-colors font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-[#1a1a1a] mb-1.5">IFSC Code</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={ifscCode}
                                                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                                    placeholder="e.g. HDFC0001234"
                                                    className="w-full px-4 py-3 bg-white border border-[#cccccc] rounded-[6px] text-[15px] outline-none focus:border-[#0064d2] transition-colors uppercase font-mono"
                                                    maxLength={11}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-1.5">UPI ID (VPA)</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                                                placeholder="e.g. username@okicici"
                                                className="w-full px-4 py-3 bg-white border border-[#cccccc] rounded-[6px] text-[15px] outline-none focus:border-[#0064d2] transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-[#1a1a1a] hover:bg-black text-white py-3.5 rounded-[6px] font-black text-[15px] transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg"
                                    >
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                        Secure & Save Details
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: WITHDRAWAL REQUEST */}
            <AnimatePresence>
                {isWithdrawModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/80 backdrop-blur-sm">
                        <motion.div 
                            variants={modalVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="bg-white rounded-[12px] w-full max-w-[450px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-[#e2e2e2] flex items-center justify-between">
                                <h3 className="text-[20px] font-black text-[#1a1a1a]">Request Withdrawal</h3>
                                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                            </div>
                            
                            <form onSubmit={handleRequestWithdrawal} className="p-6">
                                {formError && (
                                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold rounded-[6px] flex items-center gap-2">
                                        <AlertCircle size={16} /> {formError}
                                    </div>
                                )}

                                <div className="mb-6 p-4 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] flex items-center justify-between">
                                    <span className="text-[13px] font-bold text-[#54626c]">Available Balance</span>
                                    <span className="text-[20px] font-black text-[#458731]">{formatCurrency(walletBalance)}</span>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Amount to Withdraw (INR)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-black text-[#1a1a1a]">₹</span>
                                        <input 
                                            type="number" 
                                            required
                                            min={minWithdrawalLimit}
                                            max={walletBalance}
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            placeholder={`Min. ${minWithdrawalLimit.toLocaleString()}`}
                                            className="w-full pl-10 pr-4 py-4 bg-white border border-[#cccccc] rounded-[6px] text-[24px] font-black outline-none focus:border-[#1a1a1a] transition-colors"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[12px] text-gray-500 font-medium">Min: {formatCurrency(minWithdrawalLimit)}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setWithdrawAmount(walletBalance)}
                                            className="text-[12px] font-bold text-[#0064d2] hover:underline"
                                        >
                                            Withdraw Max
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-8 p-4 border border-[#e2e2e2] rounded-[6px]">
                                    <p className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-2">Transfer Destination</p>
                                    {bankDetails?.payoutMethod === 'upi' ? (
                                        <p className="text-[14px] font-bold text-[#1a1a1a]">{bankDetails.upiId}</p>
                                    ) : (
                                        <p className="text-[14px] font-bold text-[#1a1a1a]">{bankDetails?.bankName} (**** {bankDetails?.accountLastFour})</p>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !withdrawAmount || Number(withdrawAmount) < minWithdrawalLimit}
                                    className="w-full bg-[#458731] hover:bg-[#3a7229] text-white py-4 rounded-[6px] font-black text-[15px] transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Withdrawal'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}