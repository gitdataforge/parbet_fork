import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, User, AlertCircle, Eye, 
    Smartphone, Ticket, FileText, QrCode, 
    X, Check 
} from 'lucide-react';

export default function CreateListing() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // DYNAMIC URL PARAMETERS (Real Data Pipeline)
    const eventName = searchParams.get('eventName') || 'Mumbai Indians vs Punjab Kings';
    const venue = searchParams.get('venue') || 'Wankhede Stadium, Mumbai, Maharashtra, India';
    const rawDate = searchParams.get('date') || new Date(Date.now() + 864000000).toISOString();

    // INTERACTIVE FORM STATE
    const [quantity, setQuantity] = useState('');
    const [section, setSection] = useState('');
    const [row, setRow] = useState('');
    const [firstSeat, setFirstSeat] = useState('');
    const [lastSeat, setLastSeat] = useState('');
    const [noSeatReason, setNoSeatReason] = useState('');
    const [activeDisclosures, setActiveDisclosures] = useState([]);
    const [ticketType, setTicketType] = useState('');
    const [readyToTransfer, setReadyToTransfer] = useState(true);
    const [storageLocation, setStorageLocation] = useState('');
    const [aboutYou, setAboutYou] = useState('');
    const [ukEurope, setUkEurope] = useState('');
    
    // ANIMATION STATE
    const [showNotification, setShowNotification] = useState(false);

    // Trigger the "Just Sold" notification animation after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowNotification(true);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    // Format Date matching Viagogo (e.g., "Thu, 16 Apr · 19:30")
    const formatEventDate = (isoString) => {
        const d = new Date(isoString);
        if (isNaN(d)) return 'TBA';
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

    // Form Validation Logic for Continue Button
    const isFormValid = quantity !== '' && ticketType !== '';

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col text-[#1a1a1a]">
            
            {/* 1. CUSTOM MINIMALIST PROGRESS HEADER */}
            <div className="w-full bg-white sticky top-0 z-40">
                <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-5 max-w-[1400px] mx-auto">
                    <div>
                        <p className="text-[13px] text-[#54626c] font-medium mb-1">Step 1 of 2</p>
                        <h1 className="text-[28px] md:text-[34px] font-black text-[#1a1a1a] tracking-tight leading-none">
                            Enter seat details
                        </h1>
                    </div>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="border border-[#cccccc] px-5 py-2.5 rounded-[8px] font-bold text-[14px] hover:bg-gray-50 transition-colors"
                    >
                        Exit
                    </button>
                </div>
                {/* 50% Progress Line */}
                <div className="flex w-full h-[4px]">
                    <div className="bg-[#458731] w-1/2"></div>
                    <div className="bg-[#e2e2e2] w-1/2"></div>
                </div>
            </div>

            {/* 2. SPLIT PANE LAYOUT CONTAINER */}
            <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-10 flex flex-col md:flex-row gap-10 lg:gap-16">
                
                {/* LEFT COLUMN: INTERACTIVE FORM */}
                <div className="flex-1 space-y-12">
                    
                    {/* Perks Section */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-[#1a1a1a] text-[16px]">Perks of selling on parbet</h3>
                        <div className="flex items-start gap-2 text-[#469e96] text-[14px]">
                            <User size={16} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                            <p><strong className="font-bold">You do not need to have received your tickets yet</strong> in order to sell them on parbet</p>
                        </div>
                        <div className="flex items-start gap-2 text-[#469e96] text-[14px]">
                            <User size={16} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                            <p><strong className="font-bold">Always free to list your tickets for sale on parbet</strong> unlike other sites</p>
                        </div>
                    </div>

                    {/* Seat Information Section */}
                    <div className="space-y-5">
                        <h3 className="font-bold text-[#1a1a1a] text-[16px]">Seat information</h3>
                        
                        {/* Custom Selects */}
                        <div className="relative">
                            <select 
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] appearance-none focus:outline-none focus:border-[#1a1a1a] transition-colors cursor-pointer bg-white"
                            >
                                <option value="" disabled>Ticket quantity</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num} {num === 1 ? 'ticket' : 'tickets'}</option>
                                ))}
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select 
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] appearance-none focus:outline-none focus:border-[#1a1a1a] transition-colors cursor-pointer bg-white"
                            >
                                <option value="" disabled>Section</option>
                                <option value="General Admission">General Admission</option>
                                <option value="VIP Box">VIP Box</option>
                                <option value="North Stand">North Stand</option>
                                <option value="South Pavilion">South Pavilion</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>

                        <input 
                            type="text" 
                            placeholder="Row" 
                            value={row}
                            onChange={(e) => setRow(e.target.value)}
                            className="w-full border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                        />

                        <div className="flex gap-4">
                            <input 
                                type="text" 
                                placeholder="First seat" 
                                value={firstSeat}
                                onChange={(e) => setFirstSeat(e.target.value)}
                                className="w-1/2 border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                            <input 
                                type="text" 
                                placeholder="Last seat" 
                                value={lastSeat}
                                onChange={(e) => setLastSeat(e.target.value)}
                                className="w-1/2 border border-[#cccccc] rounded-[8px] p-4 text-[15px] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                            />
                        </div>

                        {/* Unable to provide seats radio */}
                        <div className="pt-4 space-y-3">
                            <h4 className="font-bold text-[#1a1a1a] text-[15px]">If you are unable to provide seating information please select a reason why:</h4>
                            <p className="text-[13px] text-[#54626c] leading-relaxed">
                                You are required to provide section, row and seat information if this information is available to you at the time of listing. If you do not have all of this information at present, you may list your tickets, but you must update your listing once you have this information. Listings can be updated using My Account.
                            </p>
                            <div className="space-y-2.5 mt-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="noSeatReason" 
                                        value="primary_site"
                                        onChange={(e) => setNoSeatReason(e.target.value)}
                                        className="w-4 h-4 accent-[#458731]" 
                                    />
                                    <span className="text-[14px]">The primary site has not provided me with this information</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="noSeatReason" 
                                        value="other"
                                        onChange={(e) => setNoSeatReason(e.target.value)}
                                        className="w-4 h-4 accent-[#458731]" 
                                    />
                                    <span className="text-[14px]">Other</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details Section (Disclosures) */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-[#1a1a1a] text-[16px]">Additional details</h3>
                        <p className="text-[14px] text-[#54626c]">Do your seats have any features or restrictions?</p>
                        
                        <div className="bg-[#f2f7fa] rounded-[8px] p-4 mt-2">
                            <div className="flex items-center gap-2 text-[#0064d2] font-bold text-[14px] mb-2">
                                <AlertCircle size={18} />
                                Ticket disclosures to know before you sell
                            </div>
                            <p className="text-[13px] text-[#1a1a1a] leading-relaxed">
                                If any of the options below apply to your tickets, select all that apply. If your tickets have a disclosure not listed here, stop and <span className="text-[#0064d2] cursor-pointer hover:underline">contact us</span>. If none apply, select No disclosures to continue.
                            </p>
                        </div>

                        {/* Interactive Pill Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {[
                                'No disclosures', 'Resale not allowed', 'Ticket and meal package', 
                                'Paperless Tickets', 'Complimentary Food & Soft drinks', 
                                'Food and Beverages Available for Purchase', '+ Add more'
                            ].map(pill => {
                                const isActive = activeDisclosures.includes(pill);
                                return (
                                    <button
                                        key={pill}
                                        onClick={() => toggleDisclosure(pill)}
                                        className={`px-4 py-2.5 rounded-full text-[13px] font-medium transition-colors border ${
                                            isActive 
                                            ? 'border-[#1a1a1a] bg-white text-[#1a1a1a] shadow-inner' 
                                            : 'border-[#cccccc] bg-white text-[#54626c] hover:border-[#a0a0a0]'
                                        }`}
                                    >
                                        {pill}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ticket Type Section */}
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
                                    <div 
                                        key={type.id}
                                        onClick={() => setTicketType(type.id)}
                                        className={`border rounded-[8px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                            isSelected 
                                            ? 'border-[2px] border-[#1a1a1a] shadow-sm bg-[#fcfcfc]' 
                                            : 'border-[#cccccc] hover:border-[#a0a0a0] bg-white'
                                        }`}
                                    >
                                        <Icon size={24} className={isSelected ? 'text-[#1a1a1a] mb-2' : 'text-[#54626c] mb-2'} />
                                        <span className={`text-[13px] font-medium ${isSelected ? 'text-[#1a1a1a]' : 'text-[#54626c]'}`}>
                                            {type.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <label className="flex items-start gap-3 mt-4 cursor-pointer">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                readyToTransfer ? 'bg-[#458731] border-[#458731]' : 'border-[#cccccc] bg-white'
                            }`} onClick={() => setReadyToTransfer(!readyToTransfer)}>
                                {readyToTransfer && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-[#1a1a1a]">I'm ready to transfer</p>
                                <p className="text-[13px] text-[#54626c]">Transferring now boosts the visibility of your listing and increases your likelihood of selling</p>
                            </div>
                        </label>
                    </div>

                    {/* Where are your tickets stored Section */}
                    <div className="space-y-4 pt-6 border-t border-[#e2e2e2]">
                        <h3 className="font-bold text-[#1a1a1a] text-[16px]">Where are your tickets stored?</h3>
                        <div className="space-y-3">
                            {['SeatGeek', 'Ticketmaster', 'Unknown', 'Other'].map(loc => (
                                <label key={loc} className="flex items-center gap-3 cursor-pointer w-max">
                                    <input 
                                        type="radio" 
                                        name="storageLocation" 
                                        value={loc}
                                        onChange={(e) => setStorageLocation(e.target.value)}
                                        className="w-4 h-4 accent-[#458731]" 
                                    />
                                    <span className="text-[14px] text-[#1a1a1a]">{loc}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* About You Section (Consumer Rights Act) */}
                    <div className="space-y-4 pt-6 border-t border-[#e2e2e2]">
                        <h3 className="font-bold text-[#1a1a1a] text-[16px]">About you</h3>
                        <p className="text-[13px] text-[#54626c] leading-relaxed">
                            If you work for parbet, or are the organiser of this event, you are required by section 90(6) of the Consumer Rights Act to select it below:
                        </p>
                        <div className="space-y-4 mt-2">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="radio" name="aboutYou" value="organiser" onChange={(e) => setAboutYou(e.target.value)} className="w-4 h-4 mt-1 accent-[#458731]" />
                                <div>
                                    <span className="text-[14px] text-[#1a1a1a] block mb-1">Event organiser</span>
                                    <span className="text-[12px] text-[#54626c]">You are responsible for organising or managing the event, or receive some or all of the revenue from the event, or a person who is acting on behalf of one of the above</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="aboutYou" value="employed" onChange={(e) => setAboutYou(e.target.value)} className="w-4 h-4 accent-[#458731]" />
                                <span className="text-[14px] text-[#1a1a1a]">Employed by parbet</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="aboutYou" value="neither" onChange={(e) => setAboutYou(e.target.value)} className="w-4 h-4 accent-[#458731]" />
                                <span className="text-[14px] text-[#1a1a1a]">Neither of these</span>
                            </label>
                        </div>
                    </div>

                    {/* UK/Europe Section */}
                    <div className="space-y-4 pt-6 border-t border-[#e2e2e2]">
                        <h3 className="font-bold text-[#1a1a1a] text-[16px]">Selling to people in the United Kingdom or Europe?</h3>
                        <p className="text-[13px] text-[#54626c] leading-relaxed">
                            In order to sell to customer in the United Kingdom or Europe you must select if any of the below apply to you:
                        </p>
                        <div className="space-y-4 mt-2 pb-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="ukEurope" value="normal" onChange={(e) => setUkEurope(e.target.value)} className="w-4 h-4 accent-[#458731]" />
                                <span className="text-[14px] text-[#1a1a1a]">Normal seller (I am not a trader)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="radio" name="ukEurope" value="trader" onChange={(e) => setUkEurope(e.target.value)} className="w-4 h-4 mt-1 accent-[#458731]" />
                                <div>
                                    <span className="text-[14px] text-[#1a1a1a] block mb-1">Trader</span>
                                    <span className="text-[12px] text-[#54626c]">You sell tickets through a registered company, you are a sole trader, you have a VAT number or you pay people to sell tickets on your behalf; you regularly sell tickets with the intention of making profit (on parbet or elsewhere); or you are paid to sell tickets</span>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="radio" name="ukEurope" value="not_provide" onChange={(e) => setUkEurope(e.target.value)} className="w-4 h-4 mt-1 accent-[#458731]" />
                                <div>
                                    <span className="text-[14px] text-[#1a1a1a] block mb-1">I prefer not to provide this information</span>
                                    <span className="text-[12px] text-[#54626c]">Your listings will not be purchasable by buyers on parbet UK or any European parbet domain</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                </div>

                {/* RIGHT COLUMN: STICKY EVENT SUMMARY CARD */}
                <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 relative pb-24 md:pb-0">
                    <div className="sticky top-[120px] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 bg-white overflow-hidden">
                        {/* High Quality Grayscale Cricket Image representing the aesthetic */}
                        <div className="w-full h-[180px] md:h-[220px] overflow-hidden bg-black p-3">
                            <img 
                                src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop" 
                                alt="Cricket Match" 
                                className="w-full h-full object-cover rounded-[8px] grayscale contrast-125 opacity-90"
                            />
                        </div>
                        
                        <div className="p-5 md:p-6">
                            <h2 className="text-[18px] md:text-[20px] font-black text-[#1a1a1a] leading-tight mb-2">
                                {eventName}
                            </h2>
                            <p className="text-[14px] text-[#54626c] mb-1 truncate">{venue}</p>
                            <p className="text-[14px] text-[#54626c] mb-4">{formatEventDate(rawDate)}</p>
                            
                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#1a1a1a] bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-max">
                                <Eye size={14} />
                                251 people searching
                            </div>
                        </div>

                        {/* FLOATING "JUST SOLD" NOTIFICATION (Framer Motion) */}
                        <AnimatePresence>
                            {showNotification && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="absolute -bottom-10 md:-bottom-16 -left-4 md:-left-12 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-[12px] border border-gray-100 p-4 w-[320px] z-50 flex items-start gap-4"
                                >
                                    <button 
                                        onClick={() => setShowNotification(false)}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                                    >
                                        <X size={16} />
                                    </button>
                                    
                                    <img 
                                        src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=150&auto=format&fit=crop" 
                                        alt="Thumbnail" 
                                        className="w-14 h-14 object-cover rounded-[6px] grayscale shrink-0 mt-1"
                                    />
                                    
                                    <div className="flex-1 pr-4">
                                        <p className="text-[13px] font-bold text-[#1a1a1a] leading-tight mb-1">
                                            Tickets for {eventName} were just purchased!
                                        </p>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[12px] text-[#54626c] leading-tight">
                                                Sachin Tendulkar<br/>Pavilion A
                                            </p>
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

            {/* 3. STICKY BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#e2e2e2] p-4 flex justify-end z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-[1200px] mx-auto flex justify-end px-4">
                    <button 
                        disabled={!isFormValid}
                        className={`px-10 py-3.5 rounded-[8px] font-bold text-[15px] transition-all ${
                            isFormValid 
                            ? 'bg-[#458731] text-white hover:bg-[#3a7229] shadow-md cursor-pointer' 
                            : 'bg-[#e2e2e2] text-[#a0a0a0] cursor-not-allowed'
                        }`}
                    >
                        Continue
                    </button>
                </div>
            </div>

        </div>
    );
}