import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Receipt, 
    Banknote, 
    User, 
    Ticket, 
    ShoppingCart, 
    Settings, 
    MessageCircle,
    Bot,
    ChevronDown,
    X,
    Send
} from 'lucide-react';

export default function Support() {
    const navigate = useNavigate();
    
    // FEATURE 1: Live Search Engine State
    const [searchQuery, setSearchQuery] = useState('');
    
    // FEATURE 2: Accordion State Management
    const [expandedId, setExpandedId] = useState(null);
    
    // FEATURE 3: Virtual Assistant Toggle State
    const [isChatOpen, setIsChatOpen] = useState(false);

    // FEATURE 4: Strict 1:1 Category Filtering State
    const [activeCategory, setActiveCategory] = useState('All');

    // FEATURE 5: Real Content Mapping (Strictly matched to Viagogo screenshots)
    const buyerFaqs = [
        { id: 'b1', q: 'Accept your mobile transfer tickets', a: 'Check your email for a transfer offer link from the team or primary ticketer. Click the link to accept the tickets into your primary ticketing account.' },
        { id: 'b2', q: 'When will I get my tickets?', a: 'Sellers have until the end of the day on your estimated delivery date to send tickets. You will receive an email the moment they are transferred.' },
        { id: 'b3', q: 'Find the email with your mobile transfer tickets', a: 'Search your inbox (and spam/junk folders) for emails from the team, venue, or ticketing provider (like Ticketmaster or AXS).' },
        { id: 'b4', q: 'Order delivery status', a: 'You can track the live status of your order at any time by visiting the "My Orders" tab in your profile.' },
        { id: 'b5', q: 'Resell your parbet tickets', a: 'If you can no longer attend, you can easily resell your tickets by clicking "Sell" on your order details page.' },
        { id: 'b6', q: 'Log in as a guest with your access code', a: 'Use the access code provided in your confirmation email to securely view your order details without a registered account.' },
        { id: 'b7', q: 'The event is today and I still don\'t have my tickets', a: 'Please contact our urgent support line immediately. Our FanProtect Guarantee ensures you get in or get your money back.' },
        { id: 'b8', q: 'AXS ticket access and troubleshooting', a: 'Ensure you have the AXS mobile app installed and are logged in with the exact same email address used for your parbet purchase.' },
        { id: 'b9', q: 'Postponed, rescheduled, or canceled events', a: 'If an event is canceled, you will receive a full refund. If rescheduled, your tickets remain valid for the new date.' },
        { id: 'b10', q: 'Need to cancel a purchase', a: 'All sales are final. We cannot cancel or refund an order once it is placed. You can, however, resell your tickets on our platform.' }
    ];

    const sellerFaqs = [
        { id: 's1', q: 'Get paid for sold tickets', a: 'Payouts are processed 5-8 business days after the event occurs to ensure the buyer successfully attended.' },
        { id: 's2', q: 'Send or retransfer mobile transfer or AXS tickets', a: 'Log into your primary ticketing account and use the "Transfer" feature to send the tickets to the buyer\'s email address provided in your sale details.' },
        { id: 's3', q: 'Selling tickets on parbet', a: 'Click the "Sell" button, find your event, select your ticket details, set your price, and wait for a buyer!' },
        { id: 's4', q: 'Deliver tickets to buyers', a: 'Follow the specific delivery instructions provided when your tickets sold. Ensure you confirm the transfer in your parbet account.' },
        { id: 's5', q: 'parbet\'s fees to sell tickets', a: 'It is free to list tickets. A fulfillment fee is deducted from your payout only when your tickets successfully sell.' },
        { id: 's6', q: 'Ticket delivery deadlines', a: 'You must deliver the tickets by the "In-Hand Date" you selected during the listing process to avoid penalties.' },
        { id: 's7', q: 'List mobile transfer or AXS tickets', a: 'Select "Mobile Transfer" as your delivery method when creating your listing. You will transfer them only after they sell.' },
        { id: 's8', q: 'Deliver e-tickets and barcode tickets', a: 'Upload the original PDF files or enter the barcodes directly into your parbet sales page.' },
        { id: 's9', q: 'Preupload E-ticket and barcode tickets', a: 'Pre-uploading ensures instant delivery to the buyer, which makes your listing more attractive and often sell faster.' },
        { id: 's10', q: 'How to tell if your tickets sold on parbet', a: 'We will send you an email instantly. You can also monitor your active sales in the "My Sales" tab.' },
        { id: 's11', q: 'Don\'t see my listing on the site', a: 'Listings can take up to 15 minutes to appear on the interactive map. Check your "My Listings" tab to ensure it is active.' }
    ];

    // FEATURE 6: Live Search Filtering Logic
    const combinedFaqs = useMemo(() => [...buyerFaqs, ...sellerFaqs], []);
    
    const displayFaqs = useMemo(() => {
        if (!searchQuery.trim()) return null; // Null means show 2 columns
        return combinedFaqs.filter(faq => 
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, combinedFaqs]);

    // FEATURE 7: Framer Motion Staggered UI Engine
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
    };

    return (
        <div className="w-full font-sans bg-white relative min-h-screen">
            
            {/* FEATURE 8: 1:1 Dark Hero Search Banner */}
            <div 
                className="w-full h-[220px] md:h-[280px] bg-cover bg-center relative flex flex-col items-center justify-center px-4"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1540039155733-d7c22c2b0e3d?q=80&w=2000&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 w-full max-w-[800px] flex flex-col items-center">
                    <h1 className="text-white text-[28px] md:text-[36px] font-black tracking-tighter mb-6 text-center">
                        Welcome to parbet Support
                    </h1>
                    <div className="w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search parbet Support"
                            className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white rounded-full text-[15px] md:text-[16px] text-[#1a1a1a] outline-none shadow-lg focus:ring-2 focus:ring-[#458731] transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 pb-20">
                
                {/* FEATURE 9: 1:1 Quick Action Routing Cards */}
                <motion.div 
                    initial="hidden" animate="show" variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 -mt-8 relative z-20 mb-10"
                >
                    {[
                        { title: 'My Orders', icon: <Receipt size={32} className="text-[#458731]" />, path: '/profile/orders' },
                        { title: 'My Sales', icon: <Banknote size={32} className="text-[#458731]" />, path: '/profile/sales' },
                        { title: 'My Account', icon: <User size={32} className="text-[#458731]" />, path: '/profile/settings' }
                    ].map((card) => (
                        <motion.div 
                            key={card.title} variants={itemVariants}
                            onClick={() => navigate(card.path)}
                            className="bg-white rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-[#e2e2e2] p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all"
                        >
                            <div className="mb-4">{card.icon}</div>
                            <h3 className="text-[16px] font-bold text-[#1a1a1a]">{card.title}</h3>
                        </motion.div>
                    ))}
                </motion.div>

                {/* FEATURE 10: 1:1 Browse By Category Grid */}
                <motion.div initial="hidden" animate="show" variants={containerVariants} className="mb-12">
                    <motion.h2 variants={itemVariants} className="text-[20px] font-black text-[#333333] mb-4">Browse by Category</motion.h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { title: 'Where are my tickets?', icon: <Ticket size={24} className="text-[#458731]"/> },
                            { title: 'Buying', icon: <ShoppingCart size={24} className="text-[#458731]"/> },
                            { title: 'Selling', icon: <Banknote size={24} className="text-[#458731]"/> },
                            { title: 'Account & Settings', icon: <Settings size={24} className="text-[#458731]"/> }
                        ].map((cat) => (
                            <motion.button 
                                key={cat.title} variants={itemVariants}
                                onClick={() => setActiveCategory(cat.title)}
                                className={`flex items-center gap-3 p-4 rounded-[6px] border transition-colors ${activeCategory === cat.title ? 'border-[#458731] bg-[#eaf4d9]' : 'border-[#e2e2e2] bg-white hover:border-[#458731]'}`}
                            >
                                {cat.icon}
                                <span className="text-[14px] font-bold text-[#1a1a1a] text-left leading-tight">{cat.title}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* FEATURE 11: Dynamic Logic - Search Results vs 2-Column Split */}
                <div className="w-full">
                    {displayFaqs !== null ? (
                        <div className="w-full">
                            <h2 className="text-[20px] font-black text-[#333333] mb-6">Search Results</h2>
                            {displayFaqs.length > 0 ? (
                                <div className="space-y-2">
                                    {displayFaqs.map(faq => (
                                        <FaqItem key={faq.id} faq={faq} isExpanded={expandedId === faq.id} onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 border border-gray-200 rounded-[6px]">
                                    <p className="text-[#54626c]">No answers found for "{searchQuery}". Try a different keyword.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            {/* Left Column: Buyer */}
                            <div>
                                <h2 className="text-[20px] font-black text-[#333333] mb-6">Top Buyer Answers</h2>
                                <div className="space-y-1">
                                    {buyerFaqs.map(faq => (
                                        <FaqItem key={faq.id} faq={faq} isExpanded={expandedId === faq.id} onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)} />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Right Column: Seller */}
                            <div>
                                <h2 className="text-[20px] font-black text-[#333333] mb-6">Top Seller Answers</h2>
                                <div className="space-y-1">
                                    {sellerFaqs.map(faq => (
                                        <FaqItem key={faq.id} faq={faq} isExpanded={expandedId === faq.id} onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FEATURE 12: 1:1 Live Virtual Assistant Toggle (Floating FAB) */}
            <div className="fixed bottom-6 right-6 z-[60]">
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="absolute bottom-[70px] right-0 w-[320px] bg-white rounded-[12px] shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
                        >
                            <div className="bg-[#458731] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white">
                                    <Bot size={20} />
                                    <span className="font-bold text-[15px]">parbet Assistant</span>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 p-1 rounded"><X size={18}/></button>
                            </div>
                            <div className="h-[300px] bg-gray-50 p-4 overflow-y-auto flex flex-col gap-3">
                                <div className="bg-white p-3 rounded-lg border border-gray-200 text-[14px] text-[#1a1a1a] self-start max-w-[85%] rounded-tl-none shadow-sm">
                                    Hi there! I'm the parbet Virtual Assistant. How can I help you with your tickets today?
                                </div>
                            </div>
                            <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
                                <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[14px] outline-none" />
                                <button className="bg-[#458731] text-white p-2 rounded-full"><Send size={16} className="ml-0.5" /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="bg-[#458731] hover:bg-[#366a26] text-white rounded-[8px] flex items-center justify-between px-4 py-3 shadow-xl transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1 rounded"><Bot size={20} /></div>
                        <div className="text-left">
                            <p className="text-[14px] font-bold leading-tight">Virtual Assistant</p>
                            <p className="text-[11px] opacity-90 leading-tight">Available 24/7</p>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`ml-4 transition-transform duration-300 ${isChatOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
}

// Reusable FAQ Accordion Component
const FaqItem = ({ faq, isExpanded, onToggle }) => (
    <div className="border-b border-[#e2e2e2] last:border-0">
        <button 
            onClick={onToggle}
            className="w-full flex items-start text-left py-3.5 group"
        >
            <MessageCircle size={18} className="text-[#458731] mr-3 mt-0.5 shrink-0" strokeWidth={1.5} />
            <span className="text-[14px] text-[#1a1a1a] group-hover:underline flex-1">{faq.q}</span>
        </button>
        <AnimatePresence>
            {isExpanded && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <p className="text-[14px] text-[#54626c] pl-8 pb-4 pr-4 leading-relaxed">
                        {faq.a}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);