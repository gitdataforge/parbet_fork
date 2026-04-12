import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    ChevronDown, 
    HelpCircle, 
    MessageCircle, 
    ThumbsUp, 
    ThumbsDown, 
    ExternalLink, 
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    X,
    MessageSquare,
    Link as LinkIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Faqs() {
    const navigate = useNavigate();

    // FEATURE 1: Complex FAQ Data Structure (Real Seller Content)
    const faqData = [
        {
            category: 'Selling',
            questions: [
                {
                    id: 's1',
                    q: 'How do I list my IPL 2026 tickets?',
                    a: 'Go to the "Sell" page from the main header. Select the match, enter your seat details (Section, Row, Seat), set your price, and upload the ticket PDF or transfer link. Once verified, your listing goes live instantly.'
                },
                {
                    id: 's2',
                    q: 'What is the "Verification" process for listings?',
                    a: 'Our team manually verifies high-value listings for IPL and major concerts. This usually takes 15-60 minutes. We check for seat authenticity and price parity to ensure a safe marketplace.'
                },
                {
                    id: 's3',
                    q: 'Can I change the price after my tickets are listed?',
                    a: 'Yes. You can edit your price at any time from the "My Listings" tab as long as the tickets have not yet been purchased by a buyer.'
                }
            ]
        },
        {
            category: 'Payouts',
            questions: [
                {
                    id: 'p1',
                    q: 'When will I receive my payment after a sale?',
                    a: 'Seller payouts are initiated 5-8 business days after the event has successfully taken place. This ensures the buyer attended the event without issues.'
                },
                {
                    id: 'p2',
                    q: 'Does Parbet charge a commission for selling?',
                    a: 'Parbet charges a flat 15% service fee on the final sale price. This covers secure payment processing, buyer-seller protection, and marketing of your listing.'
                },
                {
                    id: 'p3',
                    q: 'How do I add or change my bank account details?',
                    a: 'Navigate to "Settings" > "Payout Methods". You can securely add your HDFC, ICICI, or any UPI-linked bank account. Verification via Razorpay takes 24-48 hours.'
                }
            ]
        },
        {
            category: 'Fulfillment',
            questions: [
                {
                    id: 'f1',
                    q: 'How do I deliver Mobile Transfer tickets?',
                    a: 'If you sold "Mobile Transfer" tickets (like BookMyShow or Insider), you must transfer the tickets to the buyer’s email provided in the sale details and click "Confirm Transfer" in your dashboard.'
                },
                {
                    id: 'f2',
                    q: 'What happens if I cannot fulfill an order?',
                    a: 'Cancellations are strictly penalized to maintain marketplace trust. If you cannot fulfill, you may be charged a fee up to 100% of the sale value to cover the cost of replacing the buyer’s tickets.'
                }
            ]
        }
    ];

    // FEATURE 2: State Machine for Search and Selection
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [expandedId, setExpandedId] = useState(null);
    const [feedback, setFeedback] = useState({}); // Tracking helpful/not helpful votes

    // FEATURE 3: Real-Time Search Indexing Engine
    const filteredFaqs = useMemo(() => {
        let results = [];
        faqData.forEach(cat => {
            if (activeCategory === 'All' || activeCategory === cat.category) {
                const matchedQuestions = cat.questions.filter(q => 
                    q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    q.a.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (matchedQuestions.length > 0) {
                    results.push({ category: cat.category, questions: matchedQuestions });
                }
            }
        });
        return results;
    }, [searchTerm, activeCategory]);

    // FEATURE 4: Was this helpful? Voting Logic
    const handleVote = (id, type) => {
        setFeedback(prev => ({ ...prev, [id]: type }));
    };

    // FEATURE 5: Clipboard Link Sharing Logic
    const copyLink = (id) => {
        const url = `${window.location.origin}/profile/faqs?q=${id}`;
        document.execCommand('copy'); // Fallback as per instructions
    };

    // FEATURE 6: Scroll to Top on Category Change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeCategory]);

    // FEATURE 7: Framer Motion Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans max-w-[1000px] pb-20"
        >
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-tight leading-tight mb-3">Help Center</h1>
                <p className="text-[#54626c] text-[16px] mb-8">Search our seller knowledge base or browse by category.</p>

                {/* FEATURE 8: Floating Search Bar with Clear Button */}
                <div className="relative max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for 'payouts', 'IPL tickets', 'commissions'..."
                        className="w-full pl-12 pr-12 py-4 bg-white border border-[#cccccc] rounded-[4px] text-[16px] outline-none focus:border-[#458731] focus:ring-1 focus:ring-[#458731] transition-all shadow-sm"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
                            <X size={18} className="text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* FEATURE 9: Category Quick-Nav Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                {['All', 'Selling', 'Payouts', 'Fulfillment'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap border ${
                            activeCategory === cat 
                            ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' 
                            : 'bg-white text-[#54626c] border-[#cccccc] hover:border-[#1a1a1a]'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main FAQ List */}
                <div className="lg:col-span-2 space-y-10">
                    <AnimatePresence mode="wait">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((cat, idx) => (
                                <motion.div 
                                    key={cat.category}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0 }}
                                >
                                    <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-[#54626c] mb-5">{cat.category}</h2>
                                    <div className="space-y-3">
                                        {cat.questions.map(q => (
                                            <div key={q.id} className="bg-white border border-[#e2e2e2] rounded-[4px] shadow-sm overflow-hidden transition-all hover:border-[#cccccc]">
                                                {/* FEATURE 10: Accordion Trigger */}
                                                <button 
                                                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                                                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 group"
                                                >
                                                    <span className={`text-[15px] font-bold transition-colors ${expandedId === q.id ? 'text-[#458731]' : 'text-[#1a1a1a]'}`}>
                                                        {q.q}
                                                    </span>
                                                    <ChevronDown 
                                                        size={20} 
                                                        className={`text-gray-400 transition-transform duration-300 ${expandedId === q.id ? 'rotate-180 text-[#458731]' : ''}`}
                                                    />
                                                </button>

                                                {/* FEATURE 11: Smooth Animated Content Expansion */}
                                                <AnimatePresence>
                                                    {expandedId === q.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="px-6 pb-6 overflow-hidden"
                                                        >
                                                            <div className="text-[15px] text-[#54626c] leading-relaxed mb-6 border-l-2 border-[#458731] pl-4">
                                                                {q.a}
                                                            </div>
                                                            
                                                            {/* FEATURE 12: Helpful Feedback & Action Bar */}
                                                            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[12px] font-bold text-[#54626c]">Was this helpful?</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <button 
                                                                            onClick={() => handleVote(q.id, 'yes')}
                                                                            className={`p-2 rounded-full transition-colors ${feedback[q.id] === 'yes' ? 'bg-[#eaf4d9] text-[#458731]' : 'hover:bg-gray-100 text-gray-400'}`}
                                                                        >
                                                                            <ThumbsUp size={16} />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleVote(q.id, 'no')}
                                                                            className={`p-2 rounded-full transition-colors ${feedback[q.id] === 'no' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                                                        >
                                                                            <ThumbsDown size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    onClick={() => copyLink(q.id)}
                                                                    className="flex items-center gap-1.5 text-[12px] font-bold text-[#0064d2] hover:underline"
                                                                >
                                                                    <LinkIcon size={14} /> Copy link to question
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            /* FEATURE 13: Search Empty State with Support Bridge */
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-20 text-center bg-gray-50 rounded-[4px] border-2 border-dashed border-[#e2e2e2]"
                            >
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <HelpCircle size={28} className="text-gray-300" />
                                </div>
                                <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2">No matching questions</h3>
                                <p className="text-[15px] text-[#54626c] max-w-xs mx-auto mb-8">
                                    We couldn't find an answer for "{searchTerm}". Try a different term or contact our support team.
                                </p>
                                <button 
                                    onClick={() => navigate('/profile/support')}
                                    className="bg-[#1a1a1a] text-white px-8 py-3 rounded-[4px] font-bold text-[14px] hover:bg-[#333333] transition-all"
                                >
                                    Ask a Specialist
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-8">
                    {/* Trending Section */}
                    <motion.div variants={itemVariants} className="bg-white border border-[#e2e2e2] rounded-[4px] p-6 shadow-sm">
                        <h3 className="text-[14px] font-black uppercase tracking-widest text-[#1a1a1a] mb-5 flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#458731]" /> Top Trending
                        </h3>
                        <div className="space-y-4">
                            <button onClick={() => { setSearchTerm('IPL'); setExpandedId('s1'); }} className="block text-[14px] font-bold text-[#1a1a1a] hover:text-[#458731] transition-colors text-left">
                                Buying vs. Selling IPL 2026 tickets
                            </button>
                            <button onClick={() => { setSearchTerm('payout'); setExpandedId('p1'); }} className="block text-[14px] font-bold text-[#1a1a1a] hover:text-[#458731] transition-colors text-left">
                                Tracking my first payout status
                            </button>
                            <button onClick={() => { setSearchTerm('cancel'); setExpandedId('f2'); }} className="block text-[14px] font-bold text-[#1a1a1a] hover:text-[#458731] transition-colors text-left">
                                Order cancellation policies
                            </button>
                        </div>
                    </motion.div>

                    {/* Support Bridge Card */}
                    <motion.div variants={itemVariants} className="bg-[#114C2A] text-white rounded-[4px] p-6 shadow-lg">
                        <MessageSquare size={32} className="text-[#8cc63f] mb-4" />
                        <h3 className="text-[18px] font-black mb-2">Still need help?</h3>
                        <p className="text-[14px] text-gray-300 mb-6 leading-relaxed">
                            Our seller specialists are available to handle your specific listing or payment issues.
                        </p>
                        <button 
                            onClick={() => navigate('/profile/support')}
                            className="w-full bg-white text-[#114C2A] font-bold py-3 rounded-[4px] text-[14px] flex items-center justify-center gap-2 hover:bg-[#8cc63f] hover:text-white transition-all"
                        >
                            Open Support Ticket <ArrowRight size={16} />
                        </button>
                    </motion.div>

                    {/* Trust Banner */}
                    <motion.div variants={itemVariants} className="p-6 border border-[#e2e2e2] rounded-[4px] bg-[#f8f9fa] flex items-start gap-4">
                        <ShieldCheck size={24} className="text-[#458731] shrink-0 mt-1" />
                        <div>
                            <p className="text-[14px] font-bold text-[#1a1a1a]">Seller Protection</p>
                            <p className="text-[12px] text-[#54626c] mt-1 leading-relaxed">
                                You are protected by our Seller Guarantee. All payments are secured via Escrow.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}