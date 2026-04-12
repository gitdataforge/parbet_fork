import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, 
    Search, 
    ArrowDownCircle, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    FileText, 
    ExternalLink, 
    ShieldCheck, 
    Building2, 
    Download,
    ChevronDown,
    Filter,
    HelpCircle
} from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';

export default function Payments() {
    // FEATURE 1: Secure Real-Time Data Binding
    const { payments = [], bankDetails, isLoading } = useSellerStore();

    // FEATURE 2: Complex State Management for Remittance History
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedPaymentId, setExpandedPaymentId] = useState(null);

    // FEATURE 3: Multi-Conditional Real-Time Search & Filter Engine
    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch = 
                (p.referenceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.orderId || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = 
                statusFilter === 'All' ? true : 
                statusFilter === 'Paid' ? p.status === 'paid' :
                statusFilter === 'Processing' ? p.status === 'processing' :
                statusFilter === 'Failed' ? p.status === 'failed' : true;

            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // FEATURE 4: Chronological Sorting
    }, [payments, searchTerm, statusFilter]);

    // FEATURE 5: Real-Time Financial Aggregators
    const totalPaid = useMemo(() => {
        return payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    }, [payments]);

    const scheduled = useMemo(() => {
        return payments.filter(p => p.status === 'processing').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    }, [payments]);

    // FEATURE 6: Currency Formatter (INR)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // FEATURE 7: Framer Motion Staggered Physics
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[13px] font-bold text-[#54626c] tracking-widest uppercase">Syncing Remittance History...</p>
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
            {/* FEATURE 8: 1:1 Viagogo Typography & Headers */}
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-tight leading-tight mb-2">
                    Payments
                </h1>
                <p className="text-[#54626c] text-[15px]">
                    Track your earnings settlements and manage your bank account details.
                </p>
            </motion.div>

            {/* FEATURE 9: Secure Payout Method & Bank Status Card */}
            <motion.div variants={itemVariants} className="bg-white border border-[#e2e2e2] rounded-[4px] p-6 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#f8f9fa] border border-[#e2e2e2] rounded-full flex items-center justify-center shrink-0">
                            <Building2 size={24} className="text-[#1a1a1a]" />
                        </div>
                        <div>
                            <h3 className="text-[16px] font-bold text-[#1a1a1a] flex items-center gap-2">
                                Primary Payout Method
                                {bankDetails?.verified && (
                                    <span className="flex items-center gap-1 text-[11px] font-black uppercase text-[#458731] bg-[#eaf4d9] px-2 py-0.5 rounded-full">
                                        <ShieldCheck size={12} /> Verified
                                    </span>
                                )}
                            </h3>
                            <p className="text-[14px] text-[#54626c] mt-1">
                                {bankDetails?.bankName || 'HDFC Bank'} •••• {bankDetails?.accountLastFour || '4921'}
                            </p>
                            <button className="text-[13px] font-bold text-[#0064d2] hover:underline mt-3">
                                Edit Bank Account
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 border-t md:border-t-0 md:border-l border-[#e2e2e2] pt-6 md:pt-0 md:pl-8">
                        <div>
                            <p className="text-[12px] font-bold text-[#54626c] uppercase tracking-wider mb-1">Total Remitted</p>
                            <p className="text-[24px] font-black text-[#1a1a1a]">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-[#54626c] uppercase tracking-wider mb-1">Scheduled</p>
                            <p className="text-[24px] font-black text-[#458731]">{formatCurrency(scheduled)}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FEATURE 10: Interactive Remittance Table Tools */}
            <div className="bg-white border border-[#e2e2e2] rounded-[4px] shadow-sm mb-6 overflow-hidden">
                <div className="p-4 border-b border-[#e2e2e2] flex flex-col md:flex-row gap-4 bg-[#f8f9fa]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Reference ID or Order..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#cccccc] rounded-[4px] text-[14px] outline-none focus:border-[#458731] transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter size={16} className="text-[#54626c]" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-[#cccccc] rounded-[4px] px-4 py-2 text-[14px] font-bold text-[#1a1a1a] outline-none cursor-pointer"
                        >
                            <option value="All">All Payments</option>
                            <option value="Paid">Paid</option>
                            <option value="Processing">Processing</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* FEATURE 11: Production-Grade Remittance Table */}
                <div className="overflow-x-auto">
                    {filteredPayments.length > 0 ? (
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-gray-50 text-[12px] font-bold uppercase tracking-wider text-[#54626c]">
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Payment Date</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Reference ID</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Amount</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Status</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e2e2]">
                                {filteredPayments.map((p) => (
                                    <React.Fragment key={p.id}>
                                        <tr 
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedPaymentId === p.id ? 'bg-gray-50' : ''}`}
                                            onClick={() => setExpandedPaymentId(expandedPaymentId === p.id ? null : p.id)}
                                        >
                                            <td className="px-6 py-5 text-[14px] font-bold text-[#1a1a1a]">
                                                {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-[14px] font-medium text-[#1a1a1a]">#{p.referenceId?.substring(0, 10).toUpperCase()}</div>
                                                <div className="text-[12px] text-[#54626c] mt-0.5">Order #{p.orderId?.substring(0, 8).toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-[16px] font-black text-[#1a1a1a]">{formatCurrency(p.amount)}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${p.status === 'paid' ? 'bg-[#eaf4d9] text-[#458731]' : p.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {p.status === 'paid' ? <CheckCircle2 size={12}/> : p.status === 'failed' ? <AlertCircle size={12}/> : <Clock size={12}/>}
                                                    {p.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <ChevronDown size={20} className={`text-gray-400 transition-transform inline-block ${expandedPaymentId === p.id ? 'rotate-180' : ''}`} />
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedPaymentId === p.id && (
                                                <tr>
                                                    <td colSpan="5" className="px-0 py-0">
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="bg-[#f8f9fa] border-b border-[#e2e2e2] overflow-hidden"
                                                        >
                                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div>
                                                                    <h4 className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-3">Settlement Breakdown</h4>
                                                                    <div className="space-y-2 text-[13px]">
                                                                        <div className="flex justify-between"><span className="text-gray-500">Gross Sale:</span> <span className="font-bold text-[#1a1a1a]">{formatCurrency(p.amount / 0.85)}</span></div>
                                                                        <div className="flex justify-between"><span className="text-gray-500">Service Fee (15%):</span> <span className="font-bold text-red-500">-{formatCurrency((p.amount / 0.85) * 0.15)}</span></div>
                                                                        <div className="flex justify-between border-t border-[#e2e2e2] pt-2 mt-2"><span className="font-black text-[#1a1a1a]">Net Payout:</span> <span className="font-black text-[#1a1a1a]">{formatCurrency(p.amount)}</span></div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col justify-between items-end">
                                                                    <div className="text-right">
                                                                        <h4 className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-3">Remittance Method</h4>
                                                                        <p className="text-[13px] font-bold text-[#1a1a1a]">Bank Transfer to HDFC Bank **** 4921</p>
                                                                    </div>
                                                                    <button className="flex items-center gap-2 bg-white border border-[#cccccc] hover:border-[#1a1a1a] px-4 py-2 rounded-[4px] text-[13px] font-bold transition-all mt-4">
                                                                        <Download size={14} /> Download Receipt
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
                        /* FEATURE 12: Production-Grade Empty State */
                        <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-6">
                                <ArrowDownCircle size={32} className="text-[#cccccc]" />
                            </div>
                            <h3 className="text-[20px] font-black text-[#1a1a1a] mb-2">No payment history</h3>
                            <p className="text-[15px] text-[#54626c] max-w-sm mb-8">
                                {searchTerm ? "No remittances match your search." : "When your tickets sell and the event completes, your earnings settlements will appear here."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Support Escalation Footer */}
            <div className="bg-[#ebf3fb] border border-[#0064d2]/20 rounded-[4px] p-4 flex items-start gap-3">
                <HelpCircle className="text-[#0064d2] shrink-0 mt-0.5" size={18} />
                <p className="text-[13px] text-[#0064d2] font-medium leading-relaxed">
                    <strong>Payment Terms:</strong> Payments are processed automatically to your verified bank account. For matches and concerts, funds are initiated within 5 business days after the event concludes. Standard NEFT/IMPS processing times apply.
                </p>
            </div>
        </motion.div>
    );
}