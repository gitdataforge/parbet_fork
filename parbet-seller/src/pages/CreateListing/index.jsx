import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, User, AlertCircle, Eye, 
    Smartphone, Ticket, FileText, QrCode, 
    X, Check, CreditCard, Loader2, ShieldAlert
} from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';
// FEATURE 1: Import the shared database mutator (to be created next)
import { useListingStore } from '../../store/useListingStore';

export default function CreateListing() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // FEATURE 2: Secure Identity Injection
    const { user } = useSellerStore();
    const { createListing, isLoading: isSubmitting, error: submitError, clearError } = useListingStore();

    // ==========================================
    // WIZARD STATE
    // ==========================================
    const [step, setStep] = useState(1);

    // ==========================================
    // STEP 1: EVENT DETAILS (Customizable)
    // ==========================================
    const [team1, setTeam1] = useState(searchParams.get('t1') || 'Mumbai Indians');
    const [team2, setTeam2] = useState(searchParams.get('t2') || 'Punjab Kings');
    const [stadium, setStadium] = useState('Wankhede Stadium');
    const [location, setLocation] = useState('Mumbai, Maharashtra, India');
    const [date, setDate] = useState('2026-04-16');
    const [time, setTime] = useState('19:30');
    const [views, setViews] = useState('148');
    const [tag1, setTag1] = useState('Good time to sell!');
    const [tag2, setTag2] = useState('This week');

    // ==========================================
    // STEP 1: SEAT & TICKET DETAILS
    // ==========================================
    const [quantity, setQuantity] = useState('');
    const [section, setSection] = useState('');
    const [row, setRow] = useState('');
    const [firstSeat, setFirstSeat] = useState('');
    const [lastSeat, setLastSeat] = useState('');
    const [activeDisclosures, setActiveDisclosures] = useState([]);
    
    const [ticketType, setTicketType] = useState('');
    const [readyToTransferUpload, setReadyToTransferUpload] = useState(true);
    const [storageLocation, setStorageLocation] = useState('');
    const [ukEurope, setUkEurope] = useState('');
    
    // ==========================================
    // STEP 2: PRICE & PAYOUT DETAILS
    // ==========================================
    const [priceStrategy, setPriceStrategy] = useState('balanced');
    const [perTicketPrice, setPerTicketPrice] = useState('48');
    const [faceValue, setFaceValue] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('');
    const [terms1, setTerms1] = useState(false);
    const [terms2, setTerms2] = useState(false);
    
    // Modal State
    const [showCardModal, setShowCardModal] = useState(false);
    const [cardAdded, setCardAdded] = useState(false);
    const [cardForm, setCardForm] = useState({ number: '', exp: '', cvv: '', name: '' });

    // ==========================================
    // ANIMATION & UTILITIES
    // ==========================================
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowNotification(true), 3500);
        return () => clearTimeout(timer);
    }, []);

    // Format Date matching Viagogo
    const formatEventDate = () => {
        const d = new Date(`${date}T${time}`);
        if (isNaN(d)) return 'Date/Time TBA';
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = d.getDate();
        const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
        const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return `${dayStr}, ${dayNum} ${monthStr} · ${timeStr}`;
    };

    const toggleDisclosure = (pill) => {
        if (pill === 'No disclosures') {
            setActiveDisclosures(['No disclosures']);
            return;
        }
        let updated = activeDisclosures.filter(d => d !== 'No disclosures');
        if (updated.includes(pill)) {
            updated = updated.filter(d => d !== pill);
        } else {
            updated.push(pill);
        }
        setActiveDisclosures(updated);
    };

    const calculateEarnings = () => {
        const price = parseFloat(perTicketPrice) || 0;
        const qty = parseInt(quantity) || 0;
        const payoutRate = 0.891875; 
        return (price * qty * payoutRate).toFixed(2);
    };

    const handleStrategyClick = (strategy, price) => {
        setPriceStrategy(strategy);
        setPerTicketPrice(price.toString());
    };

    const handleAddCardSubmit = () => {
        if(cardForm.number && cardForm.exp && cardForm.cvv && cardForm.name) {
            setCardAdded(true);
            setShowCardModal(false);
        }
    };

    // FEATURE 3: Standardized Global Database Payload Constructor
    const handleFinalSubmit = async () => {
        if (clearError) clearError();
        
        const payload = {
            // Core Identity
            sellerId: user?.uid || 'anonymous',
            sellerEmail: user?.email || '',
            
            // Event Details
            title: `${team1} vs ${team2}`,
            team1,
            team2,
            stadium,
            location,
            date,
            time,
            eventTimestamp: new Date(`${date}T${time}`).toISOString(),
            views: Number(views) || 0,
            tags: [tag1, tag2].filter(Boolean),
            
            // Ticket specific data (Mapped to array for Buyer compatibility)
            ticketType,
            ticketTiers: [
                {
                    id: crypto.randomUUID(),
                    name: `${section} ${row ? `- Row ${row}` : ''}`.trim() || 'General Admission',
                    price: Number(perTicketPrice),
                    quantity: Number(quantity),
                    seats: firstSeat && lastSeat ? `${firstSeat}-${lastSeat}` : 'Unreserved',
                    disclosures: activeDisclosures,
                    sold: 0
                }
            ],
            
            // Financials
            faceValue: faceValue ? Number(faceValue) : null,
            payoutMethod,
            storageLocation,
            
            // Metadata
            status: 'active',
            createdAt: new Date().toISOString()
        };

        try {
            await createListing(payload);
            navigate('/profile', { replace: true });
        } catch (err) {
            console.error("Failed to construct or push payload to shared ledger.");
        }
    };

    // Validation Checkers
    const isStep1Valid = team1 && stadium && date && quantity && ticketType;
    const isStep2Valid = perTicketPrice && payoutMethod && terms1 && cardAdded;

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col text-[#1a1a1a]">
            
            {/* ========================================== */}
            {/* MINIMALIST PROGRESS HEADER                 */}
            {/* ========================================== */}
            <div className="w-full bg-white sticky top-0 z-40 border-b border-[#e2e2e2]">
                <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-5 max-w-[1400px] mx-auto">
                    <div>
                        <p className="text-[13px] text-[#54626c] font-medium mb-1">Step {step} of 2</p>
                        <h1 className="text-[28px] md:text-[34px] font-black text-[#1a1a1a] tracking-tight leading-none">
                            {step === 1 ? 'Enter seat details' : 'Set your price and payout'}
                        </h1>
                    </div>
                    <button 
                        onClick={() => step === 2 ? setStep(1) : navigate(-1)} 
                        className="border border-[#cccccc] px-5 py-2.5 rounded-[8px] font-bold text-[14px] hover:bg-gray-50 transition-colors"
                    >
                        Exit
                    </button>
                </div>
                {/* Progress Line */}
                <div className="flex w-full h-[4px]">
                    <div className="bg-[#458731] transition-all duration-500 ease-in-out" style={{ width: step === 1 ? '50%' : '100%' }}></div>
                    <div className="bg-[#e2e2e2] transition-all duration-500 ease-in-out" style={{ width: step === 1 ? '50%' : '0%' }}></div>
                </div>
            </div>

            {/* ========================================== */}
            {/* MAIN SPLIT PANE LAYOUT                     */}
            {/* ========================================== */}
            <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-10 flex flex-col md:flex-row gap-10 lg:gap-16">
                
                {/* LEFT COLUMN: INTERACTIVE WIZARD */}
                <div className="flex-1 space-y-12">

                    {/* FEATURE 4: Global Error Interceptor */}
                    <AnimatePresence>
                        {submitError && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="bg-[#fdf2f2] border-l-4 border-[#c21c3a] p-4 flex items-center gap-3">
                                    <ShieldAlert className="text-[#c21c3a]" size={20} />
                                    <p className="text-[14px] font-bold text-[#c21c3a]">{submitError}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                            
                            {/* CUSTOMIZABLE EVENT DETAILS */}
                            <div className="space-y-4 bg-[#f9fdf7] border border-[#d2e8b0] rounded-[12px] p-6">
                                <h3 className="font-bold text-[#1a1a1a] text-[18px] flex items-center gap-2">
                                    <AlertCircle className="text-[#458731]" size={20} />
                                    Customize Event Details
                                </h3>
                                <p className="text-[14px] text-[#54626c] mb-4">Edit these fields to dynamically update your live listing preview.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Team 1" value={team1} onChange={(e) => setTeam1(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                    <input type="text" placeholder="Team 2" value={team2} onChange={(e) => setTeam2(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                    <input type="text" placeholder="Stadium" value={stadium} onChange={(e) => setStadium(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                    <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                    <input type="number" placeholder="People searching (Views)" value={views} onChange={(e) => setViews(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Tag 1" value={tag1} onChange={(e) => setTag1(e.target.value)} className="w-1/2 border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                        <input type="text" placeholder="Tag 2" value={tag2} onChange={(e) => setTag2(e.target.value)} className="w-1/2 border border-[#cccccc] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#458731]" />
                                    </div>
                                </div>
                            </div>

                            {/* Perks Section */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-[#1a1a1a] text-[16px]">Perks of selling on parbet</h3>
                                <div className="flex items-start gap-2 text-[#469e96] text-[14px]">
                                    <User size={16} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                                    <p><strong className="font-bold">You do not need to have received your tickets yet</strong> in order to sell them</p>
                                </div>
                                <div className="flex items-start gap-2 text-[#469e96] text-[14px]">
                                    <User size={16} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                                    <p><strong className="font-bold">Always free to list your tickets for sale</strong> unlike other sites</p>
                                </div>
                            </div>

                            {/* Seat Information */}
                            <div className="space-y-5">
                                <h3 className="font-bold text-[#1a1a1a] text-[16px]">Seat information</h3>
                                
                                <div className="relative">
                                    <select value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] appearance-none focus:outline-none focus:border-[#1a1a1a] cursor-pointer bg-white">
                                        <option value="" disabled>Ticket quantity</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <option key={num} value={num}>{num} {num === 1 ? 'ticket' : 'tickets'}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>

                                <div className="relative">
                                    <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] appearance-none focus:outline-none focus:border-[#1a1a1a] cursor-pointer bg-white">
                                        <option value="" disabled>Section</option>
                                        <option value="General Admission">General Admission</option>
                                        <option value="VIP Box">VIP Box</option>
                                        <option value="North Stand">North Stand</option>
                                        <option value="2">Section 2</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>

                                <input type="text" placeholder="Row" value={row} onChange={(e) => setRow(e.target.value)} className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a]" />

                                <div className="flex gap-4">
                                    <input type="text" placeholder="First seat" value={firstSeat} onChange={(e) => setFirstSeat(e.target.value)} className="w-1/2 border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a]" />
                                    <input type="text" placeholder="Last seat" value={lastSeat} onChange={(e) => setLastSeat(e.target.value)} className="w-1/2 border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a]" />
                                </div>
                            </div>

                            {/* Additional Details Section (Disclosures) */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-[#1a1a1a] text-[16px]">Additional details</h3>
                                <p className="text-[14px] text-[#54626c]">Do your seats have any features or restrictions?</p>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['No disclosures', 'Resale not allowed', 'Ticket and meal package', 'Paperless Tickets', 'Complimentary Food & Soft drinks', 'Food and Beverages Available for Purchase', '+ Add more'].map(pill => {
                                        const isActive = activeDisclosures.includes(pill);
                                        return (
                                            <button key={pill} onClick={() => toggleDisclosure(pill)} className={`px-4 py-2.5 rounded-full text-[13px] font-medium transition-colors border ${isActive ? 'border-[#1a1a1a] bg-white text-[#1a1a1a] shadow-inner' : 'border-[#cccccc] bg-white text-[#54626c] hover:border-[#a0a0a0]'}`}>
                                                {pill}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Ticket Type Section with STRICT Conditional UI */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-[#1a1a1a] text-[16px]">Ticket type</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { id: 'mobile_transfer', label: 'Mobile Ticket Transfer', icon: Smartphone },
                                        { id: 'paper', label: 'Paper Tickets', icon: Ticket },
                                        { id: 'eticket', label: 'E-Tickets', icon: FileText },
                                        { id: 'mobile_qr', label: 'Mobile QR Code', icon: QrCode },
                                    ].map(type => {
                                        const Icon = type.icon;
                                        const isSelected = ticketType === type.id;
                                        return (
                                            <div key={type.id} onClick={() => setTicketType(type.id)} className={`border rounded-[8px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isSelected ? 'border-[2px] border-[#1a1a1a] shadow-sm bg-[#fcfcfc]' : 'border-[#cccccc] hover:border-[#a0a0a0] bg-white'}`}>
                                                <Icon size={24} className={isSelected ? 'text-[#1a1a1a] mb-2' : 'text-[#54626c] mb-2'} />
                                                <span className={`text-[13px] font-medium ${isSelected ? 'text-[#1a1a1a]' : 'text-[#54626c]'}`}>{type.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* CONDITIONAL RENDERING BASED ON TICKET TYPE */}
                                {ticketType === 'mobile_transfer' && (
                                    <label className="flex items-start gap-3 mt-4 cursor-pointer">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${readyToTransferUpload ? 'bg-[#458731] border-[#458731]' : 'border-[#cccccc] bg-white'}`} onClick={() => setReadyToTransferUpload(!readyToTransferUpload)}>
                                            {readyToTransferUpload && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-medium text-[#1a1a1a]">I'm ready to transfer</p>
                                            <p className="text-[13px] text-[#54626c]">Transferring now boosts the visibility of your listing and increases your likelihood of selling</p>
                                        </div>
                                    </label>
                                )}

                                {(ticketType === 'eticket' || ticketType === 'mobile_qr') && (
                                    <label className="flex items-start gap-3 mt-4 cursor-pointer">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${readyToTransferUpload ? 'bg-[#458731] border-[#458731]' : 'border-[#cccccc] bg-white'}`} onClick={() => setReadyToTransferUpload(!readyToTransferUpload)}>
                                            {readyToTransferUpload && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-medium text-[#1a1a1a]">
                                                {ticketType === 'eticket' ? "I'm ready to upload" : "Ready to upload"}
                                            </p>
                                            <p className="text-[13px] text-[#54626c] mb-2">Uploading now boosts the visibility of your listing and increases your likelihood of selling</p>
                                            <button className="border border-[#cccccc] px-4 py-2 rounded-[8px] text-[13px] font-bold text-[#1a1a1a] hover:bg-gray-50">Upload Tickets</button>
                                        </div>
                                    </label>
                                )}
                            </div>

                            {/* Storage Section (Hidden for Paper Tickets & QR/E-Tickets) */}
                            {ticketType === 'mobile_transfer' && (
                                <div className="space-y-4 pt-6 border-t border-[#e2e2e2]">
                                    <h3 className="font-bold text-[#1a1a1a] text-[16px]">Where are your tickets stored?</h3>
                                    <div className="space-y-3">
                                        {['SeatGeek', 'Ticketmaster', 'Unknown', 'Other'].map(loc => (
                                            <label key={loc} className="flex items-center gap-3 cursor-pointer w-max">
                                                <input type="radio" name="storageLocation" value={loc} onChange={(e) => setStorageLocation(e.target.value)} className="w-4 h-4 accent-[#458731]" />
                                                <span className="text-[14px] text-[#1a1a1a]">{loc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* UK/Europe Section */}
                            <div className="space-y-4 pt-6 border-t border-[#e2e2e2]">
                                <h3 className="font-bold text-[#1a1a1a] text-[16px]">Selling to people in the United Kingdom or Europe?</h3>
                                <div className="space-y-4 mt-2 pb-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="ukEurope" value="normal" onChange={(e) => setUkEurope(e.target.value)} className="w-4 h-4 accent-[#458731]" />
                                        <span className="text-[14px] text-[#1a1a1a]">Normal seller (I am not a trader)</span>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="radio" name="ukEurope" value="trader" onChange={(e) => setUkEurope(e.target.value)} className="w-4 h-4 mt-1 accent-[#458731]" />
                                        <div>
                                            <span className="text-[14px] text-[#1a1a1a] block mb-1">Trader</span>
                                            <span className="text-[12px] text-[#54626c]">You sell tickets through a registered company, you are a sole trader, you have a VAT number or you pay people to sell tickets on your behalf.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                            
                            {/* SET YOUR PRICE Section */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-[#1a1a1a] text-[18px]">Enter your price</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Strategy 1: Quick Sell */}
                                    <div 
                                        onClick={() => handleStrategyClick('quick', 43)}
                                        className={`border rounded-[12px] p-5 cursor-pointer transition-all flex flex-col justify-between ${priceStrategy === 'quick' ? 'border-[#1a1a1a] border-[2px] shadow-sm' : 'border-[#cccccc] hover:border-[#a0a0a0]'}`}
                                    >
                                        <div>
                                            <h4 className="font-bold text-[#1a1a1a] text-[15px] mb-2">Quick sell strategy</h4>
                                            <p className="text-[13px] text-[#54626c] mb-3">Price for strong visibility to attract buyers quickly</p>
                                            <p className="text-[12px] font-bold text-[#458731]">80% of sellers who chose this option sold</p>
                                        </div>
                                        <p className="mt-4"><span className="text-[20px] font-black text-[#1a1a1a]">$43</span> <span className="text-[13px] text-[#54626c]">per ticket</span></p>
                                    </div>

                                    {/* Strategy 2: Balanced */}
                                    <div 
                                        onClick={() => handleStrategyClick('balanced', 48)}
                                        className={`border rounded-[12px] p-5 cursor-pointer transition-all flex flex-col justify-between relative ${priceStrategy === 'balanced' ? 'border-[#1a1a1a] border-[2px] shadow-sm' : 'border-[#cccccc] hover:border-[#a0a0a0]'}`}
                                    >
                                        <div className="absolute top-4 right-4 bg-[#e6f0ff] text-[#0064d2] text-[11px] font-bold px-2 py-0.5 rounded-full">Most popular</div>
                                        <div>
                                            <h4 className="font-bold text-[#1a1a1a] text-[15px] mb-2 pr-20">Balanced strategy</h4>
                                            <p className="text-[13px] text-[#54626c] mb-3">Get good visibility and a strong payout</p>
                                            <p className="text-[12px] font-bold text-[#458731]">75% of sellers who chose this option sold</p>
                                        </div>
                                        <p className="mt-4"><span className="text-[20px] font-black text-[#1a1a1a]">$48</span> <span className="text-[13px] text-[#54626c]">per ticket</span></p>
                                    </div>

                                    {/* Strategy 3: Max Earnings */}
                                    <div 
                                        onClick={() => handleStrategyClick('max', 54)}
                                        className={`border rounded-[12px] p-5 cursor-pointer transition-all flex flex-col justify-between ${priceStrategy === 'max' ? 'border-[#1a1a1a] border-[2px] shadow-sm' : 'border-[#cccccc] hover:border-[#a0a0a0]'}`}
                                    >
                                        <div>
                                            <h4 className="font-bold text-[#1a1a1a] text-[15px] mb-2">Max earnings strategy</h4>
                                            <p className="text-[13px] text-[#54626c] mb-3">List higher to earn more - but it may take longer to sell</p>
                                            <p className="text-[12px] font-bold text-[#458731]">70% of sellers who chose this option sold</p>
                                        </div>
                                        <p className="mt-4"><span className="text-[20px] font-black text-[#1a1a1a]">$54</span> <span className="text-[13px] text-[#54626c]">per ticket</span></p>
                                    </div>
                                </div>

                                <button className="text-[#0064d2] text-[13px] font-bold hover:underline">Compare similar tickets</button>

                                {/* Custom Price Input */}
                                <div className="relative mt-4">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#54626c]">US$</span>
                                    <input 
                                        type="number" 
                                        value={perTicketPrice} 
                                        onChange={(e) => setPerTicketPrice(e.target.value)}
                                        className="w-full border border-[#cccccc] rounded-[8px] p-4 pl-12 text-[15px] font-bold focus:outline-none focus:border-[#1a1a1a] transition-colors"
                                    />
                                    <span className="absolute left-4 top-2 text-[10px] text-[#54626c] uppercase font-bold tracking-wider">Per ticket</span>
                                </div>

                                {/* Dynamic Real-Time Calculator */}
                                <div className="bg-[#f8f9fa] rounded-[8px] p-4 text-center border border-[#e2e2e2]">
                                    <p className="text-[14px] text-[#1a1a1a]">If all of your tickets sell, you'll earn</p>
                                    <p className="text-[18px] font-black text-[#458731] mt-1 flex items-center justify-center gap-1">
                                        US$ {calculateEarnings()} <AlertCircle size={14} className="text-gray-400 cursor-pointer" />
                                    </p>
                                </div>
                            </div>

                            {/* FACE VALUE */}
                            <div className="space-y-4 pt-6 border-t border-[#e2e2e2]">
                                <h3 className="font-bold text-[#1a1a1a] text-[16px] flex items-center gap-1">
                                    What is the face value? <AlertCircle size={14} className="text-gray-400" />
                                </h3>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#54626c]">US$</span>
                                    <input 
                                        type="number" 
                                        value={faceValue} 
                                        onChange={(e) => setFaceValue(e.target.value)}
                                        className="w-full border border-[#cccccc] rounded-[8px] p-4 pl-12 text-[15px] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                                    />
                                    <span className="absolute left-4 top-2 text-[10px] text-[#54626c] uppercase font-bold tracking-wider">Face value</span>
                                </div>
                            </div>

                            {/* CREDIT OR DEBIT CARD */}
                            <div className="space-y-4 pt-6 border-t border-[#e2e2e2]">
                                <h3 className="font-bold text-[#1a1a1a] text-[16px]">Credit or debit card</h3>
                                <p className="text-[13px] text-[#54626c]">
                                    To provide our Fan Protect Guarantee, all sellers are required to have a valid credit or debit card on file. <span className="text-[#0064d2] cursor-pointer hover:underline">Learn more</span>
                                </p>
                                
                                {cardAdded ? (
                                    <div className="bg-[#f9fdf7] border border-[#d2e8b0] rounded-[8px] p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="text-[#458731]" />
                                            <div>
                                                <p className="text-[14px] font-bold text-[#1a1a1a]">Card Added Successfully</p>
                                                <p className="text-[12px] text-[#54626c]">Ending in ****</p>
                                            </div>
                                        </div>
                                        <Check className="text-[#458731]" />
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowCardModal(true)}
                                        className="w-full bg-[#111827] text-white font-bold text-[15px] py-4 rounded-[8px] hover:bg-black transition-colors"
                                    >
                                        Add Card On File
                                    </button>
                                )}
                            </div>

                            {/* PAYOUT METHOD */}
                            <div className="space-y-4 pt-6 border-t border-[#e2e2e2]">
                                <h3 className="font-bold text-[#1a1a1a] text-[16px]">Payout method</h3>
                                <div className="relative">
                                    <select 
                                        value={payoutMethod}
                                        onChange={(e) => setPayoutMethod(e.target.value)}
                                        className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] appearance-none focus:outline-none focus:border-[#1a1a1a] cursor-pointer bg-white"
                                    >
                                        <option value="" disabled>Select payout method</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="direct">Direct deposit</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* TERMS & CONDITIONS */}
                            <div className="space-y-4 pt-6 border-t border-[#e2e2e2] pb-10">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${terms1 ? 'bg-[#458731] border-[#458731]' : 'border-[#cccccc] bg-white'}`} onClick={() => setTerms1(!terms1)}>
                                        {terms1 && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <p className="text-[13px] text-[#54626c] leading-relaxed">
                                        I agree to parbet's <span className="text-[#0064d2] hover:underline">Terms and Conditions</span>. I confirm I own these tickets or have the right to be issued these tickets. If you are unable to deliver the correct tickets, parbet reserves the right to charge you the cost of replacing the tickets for your buyer.
                                    </p>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${terms2 ? 'bg-[#458731] border-[#458731]' : 'border-[#cccccc] bg-white'}`} onClick={() => setTerms2(!terms2)}>
                                        {terms2 && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <p className="text-[13px] text-[#54626c] leading-relaxed">
                                        Allow parbet to provide this information to the buyer if deemed necessary to fulfil my order
                                    </p>
                                </label>
                            </div>

                        </motion.div>
                    )}
                </div>

                {/* ========================================== */}
                {/* RIGHT COLUMN: STICKY EVENT SUMMARY CARD    */}
                {/* ========================================== */}
                <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 relative pb-24 md:pb-0">
                    <div className="sticky top-[120px] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 bg-white overflow-hidden">
                        {/* Cricket Image Overlay */}
                        <div className="w-full h-[180px] md:h-[220px] overflow-hidden bg-black p-3">
                            <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop" alt="Cricket Match" className="w-full h-full object-cover rounded-[8px] grayscale contrast-125 opacity-90"/>
                        </div>
                        
                        <div className="p-5 md:p-6">
                            <h2 className="text-[18px] md:text-[20px] font-black text-[#1a1a1a] leading-tight mb-2">
                                {team1} vs {team2}
                            </h2>
                            <p className="text-[14px] text-[#54626c] mb-1 truncate">{stadium} · {location}</p>
                            <p className="text-[14px] text-[#54626c] mb-4">{formatEventDate()}</p>
                            
                            {/* Dynamic Ticket Selection Readout */}
                            {(quantity || ticketType) && (
                                <div className="flex items-center gap-2 mb-4 text-[#1a1a1a] font-bold text-[14px]">
                                    <Ticket size={16} />
                                    {quantity || '0'}x {ticketType === 'paper' ? 'Paper tickets' : ticketType === 'eticket' ? 'E-Tickets' : ticketType === 'mobile_qr' ? 'Mobile QR' : 'Mobile Transfer'}
                                </div>
                            )}

                            {/* Dynamic Custom Tags */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#1a1a1a] bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-max">
                                    <Eye size={14} /> {views} people searching
                                </div>
                                {tag1 && <div className="text-[12px] font-bold text-[#1a1a1a] bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-max">{tag1}</div>}
                                {tag2 && <div className="text-[12px] font-bold text-[#1a1a1a] bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-max">{tag2}</div>}
                            </div>

                            {/* Dynamic Seat Summary Bottom Bar */}
                            <div className="w-full bg-[#f8f9fa] rounded-[8px] p-3 flex justify-between items-center mt-2 border border-[#e2e2e2]">
                                <div className="text-center w-1/3">
                                    <p className="text-[11px] text-[#54626c] uppercase tracking-wider mb-0.5">Section</p>
                                    <p className="text-[14px] font-bold text-[#1a1a1a] truncate">{section || '-'}</p>
                                </div>
                                <div className="text-center w-1/3 border-x border-[#e2e2e2]">
                                    <p className="text-[11px] text-[#54626c] uppercase tracking-wider mb-0.5">Row</p>
                                    <p className="text-[14px] font-bold text-[#1a1a1a] truncate">{row || '-'}</p>
                                </div>
                                <div className="text-center w-1/3">
                                    <p className="text-[11px] text-[#54626c] uppercase tracking-wider mb-0.5">Seats</p>
                                    <p className="text-[14px] font-bold text-[#1a1a1a] truncate">{firstSeat && lastSeat ? `${firstSeat}-${lastSeat}` : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* FLOATING "JUST SOLD" NOTIFICATION */}
                        <AnimatePresence>
                            {showNotification && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="absolute -bottom-10 md:-bottom-16 -left-4 md:-left-12 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-[12px] border border-gray-100 p-4 w-[320px] z-50 flex items-start gap-4"
                                >
                                    <button onClick={() => setShowNotification(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"><X size={16} /></button>
                                    <img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=150&auto=format&fit=crop" alt="Thumbnail" className="w-14 h-14 object-cover rounded-[6px] grayscale shrink-0 mt-1"/>
                                    <div className="flex-1 pr-4">
                                        <p className="text-[13px] font-bold text-[#1a1a1a] leading-tight mb-1">Tickets for {team1} vs {team2} were just purchased!</p>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[12px] text-[#54626c] leading-tight">Sachin Tendulkar<br/>Pavilion A</p>
                                            <div className="text-right">
                                                <p className="text-[14px] font-bold text-[#1a1a1a] leading-none">INR 5,655</p>
                                                <p className="text-[11px] text-[#54626c]">1 ticket</p>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-1 bg-[#eaf4d9] text-[#458731] border border-[#d2e8b0] rounded px-2 py-0.5 text-[11px] font-bold">
                                            <span>🔥</span> Just sold!
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* STICKY BOTTOM ACTION BAR                   */}
            {/* ========================================== */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#e2e2e2] p-4 flex justify-between items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-[1200px] mx-auto flex justify-between px-4">
                    {step === 2 ? (
                        <button onClick={() => setStep(1)} className="px-6 py-3.5 rounded-[8px] font-bold text-[15px] border border-[#cccccc] hover:bg-gray-50 transition-colors">
                            Back
                        </button>
                    ) : <div></div>}
                    
                    {/* FEATURE 5: Dynamic Final Submission Trigger */}
                    <button 
                        disabled={step === 1 ? !isStep1Valid : (!isStep2Valid || isSubmitting)}
                        onClick={() => step === 1 ? setStep(2) : handleFinalSubmit()}
                        className={`px-10 py-3.5 rounded-[8px] font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
                            (step === 1 ? isStep1Valid : isStep2Valid)
                            ? 'bg-[#458731] text-white hover:bg-[#3a7229] shadow-md cursor-pointer' 
                            : 'bg-[#e2e2e2] text-[#a0a0a0] cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Publishing...</>
                        ) : (
                            step === 1 ? 'Continue' : 'Create Listing'
                        )}
                    </button>
                </div>
            </div>

            {/* ========================================== */}
            {/* CARD DETAILS MODAL OVERLAY                 */}
            {/* ========================================== */}
            <AnimatePresence>
                {showCardModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-[500px] rounded-[16px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-[#e2e2e2]">
                                <div>
                                    <h2 className="text-[20px] font-black text-[#1a1a1a]">Card details</h2>
                                    <p className="text-[14px] text-[#54626c] mt-1">Enter your credit or debit card details</p>
                                </div>
                                <button onClick={() => setShowCardModal(false)} className="text-gray-400 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="relative">
                                    <input type="text" placeholder="Card number" value={cardForm.number} onChange={e => setCardForm({...cardForm, number: e.target.value})} className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a]" />
                                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <div className="flex gap-4">
                                    <input type="text" placeholder="Expiration date (MM/YY)" value={cardForm.exp} onChange={e => setCardForm({...cardForm, exp: e.target.value})} className="w-1/2 border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a]" />
                                    <div className="relative w-1/2">
                                        <input type="text" placeholder="Security code (CVV)" value={cardForm.cvv} onChange={e => setCardForm({...cardForm, cvv: e.target.value})} className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a]" />
                                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </div>
                                <input type="text" placeholder="Name on card" value={cardForm.name} onChange={e => setCardForm({...cardForm, name: e.target.value})} className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a]" />
                            </div>
                            
                            <div className="p-6 border-t border-[#e2e2e2] flex justify-end bg-[#f8f9fa]">
                                <button 
                                    onClick={handleAddCardSubmit}
                                    disabled={!(cardForm.number && cardForm.exp && cardForm.cvv && cardForm.name)}
                                    className={`px-8 py-3 rounded-[8px] font-bold text-[15px] ${cardForm.number && cardForm.exp && cardForm.cvv && cardForm.name ? 'bg-[#111827] text-white hover:bg-black' : 'bg-[#e2e2e2] text-[#a0a0a0] cursor-not-allowed'}`}
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}