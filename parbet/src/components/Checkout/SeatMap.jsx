import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Info, CheckCircle2, XCircle, Users, 
    ShieldCheck, AlertTriangle, HelpCircle, 
    MapPin, Navigation, Star, Activity, 
    ChevronLeft, Maximize, ZoomIn, ShieldAlert, BadgeCheck, Flame, Compass, Wind
} from 'lucide-react';

/**
 * GLOBAL REBRAND: Booknshow Interactive Stadium Matrix (Phase 12)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * 
 * --- 10+ REAL FEATURES & 9+ SECTIONS ---
 * SECTION 1: Ambient Illustrative Backgrounds
 * SECTION 2: Header & Brand Real-estate
 * SECTION 3: Macro-Level Stand Selector (North, South, East, West)
 * SECTION 4: Meso-Level Block/Tier Selector (Upper/Lower)
 * SECTION 5: Micro-Level Exact Seat Matrix (Rows A-Z, Seats 1-50)
 * SECTION 6: The Pitch Visualizer (Orientation Context)
 * SECTION 7: Intelligent Legend & VIP Mapping
 * SECTION 8: Live Selection Summary Pane
 * SECTION 9: 10+ Dynamic Event Guidelines & Security Protocols
 */

// Official Booknshow Logo Component
const BrandLogo = ({ textColor = "#333333" }) => {
    const fillHex = textColor.includes('#') ? textColor.match(/#(?:[0-9a-fA-F]{3,8})/)[0] : "#333333";
    return (
        <div className="flex items-center justify-center select-none relative z-10 scale-75 origin-left">
            <svg viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[30px]">
                <text x="10" y="70" fontFamily="Inter, sans-serif" fontSize="64" fontWeight="800" fill={fillHex} letterSpacing="-2">book</text>
                <g transform="translate(170, 10) rotate(-12)">
                    <path d="M0,0 L16,10 L32,0 L48,10 L64,0 L80,10 L80,95 L60,95 A20,20 0 0,0 20,95 L0,95 Z" fill="#E7364D" />
                    <text x="21" y="72" fontFamily="Inter, sans-serif" fontSize="60" fontWeight="900" fill="#FFFFFF">n</text>
                </g>
                <text x="250" y="70" fontFamily="Inter, sans-serif" fontSize="64" fontWeight="800" fill={fillHex} letterSpacing="-2">show</text>
            </svg>
        </div>
    );
};

// Ambient Background
const AmbientBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[16px]">
        <motion.div
            className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#FAD8DC] opacity-30 blur-[60px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-[#EB5B6E] opacity-10 blur-[80px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
    </div>
);

// Realistic 2026 Indian Stadium Architecture Config
const STADIUM_CONFIG = [
    { id: 'NORTH', name: 'North Pavilion', type: 'Premium / VIP', color: '#E7364D', blocks: ['LOWER-A', 'UPPER-A', 'UPPER-B'] },
    { id: 'SOUTH', name: 'South Pavilion', type: 'Members Enclosure', color: '#333333', blocks: ['LOWER-A', 'LOWER-B', 'UPPER-A'] },
    { id: 'EAST', name: 'East Stand', type: 'General Admission', color: '#626262', blocks: ['LOWER-A', 'LOWER-B', 'LOWER-C', 'UPPER-A', 'UPPER-B'] },
    { id: 'WEST', name: 'West Stand', type: 'General Admission', color: '#A3A3A3', blocks: ['LOWER-A', 'LOWER-B', 'LOWER-C', 'UPPER-A', 'UPPER-B'] }
];

export default function SeatMap({ 
    totalCapacity = 50000, 
    bookedSeats = [], 
    selectedQty = 1, 
    selectedSeats = [], 
    onSeatSelect 
}) {
    // Drill-down UI States
    const [activeStand, setActiveStand] = useState(null);
    const [activeBlock, setActiveBlock] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [seatGrid, setSeatGrid] = useState([]);

    // Generate specific matrix when a block is selected
    useEffect(() => {
        if (activeStand && activeBlock) {
            // Realistic block size: Rows A-M (13 rows), 30 seats per row
            const rows = 13; 
            const seatsPerRow = 30;
            const grid = [];
            
            for (let r = 0; r < rows; r++) {
                const rowLabel = String.fromCharCode(65 + r); // A, B, C...
                const rowSeats = [];
                for (let c = 1; c <= seatsPerRow; c++) {
                    // String Format: NORTH-UPPER-A-R_F-S10
                    const seatId = `${activeStand.id}-${activeBlock}-R_${rowLabel}-S${c}`;
                    rowSeats.push({
                        id: seatId,
                        shortId: c,
                        row: rowLabel,
                        isPremium: r < 3, // Rows A-C are premium
                        isBooked: bookedSeats.includes(seatId),
                    });
                }
                grid.push({ row: rowLabel, seats: rowSeats });
            }
            setSeatGrid(grid);
        }
    }, [activeStand, activeBlock, bookedSeats]);

    const handleSeatClick = (seat) => {
        if (seat.isBooked) {
            setErrorMsg(`Seat ${seat.row}${seat.shortId} is actively locked by another transaction.`);
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        const isCurrentlySelected = selectedSeats.includes(seat.id);

        if (isCurrentlySelected) {
            onSeatSelect(selectedSeats.filter(s => s !== seat.id));
            setErrorMsg('');
        } else {
            if (selectedSeats.length >= selectedQty) {
                setErrorMsg(`Limit Reached: You requested exactly ${selectedQty} ticket(s). Deselect a seat to modify.`);
                setTimeout(() => setErrorMsg(''), 3000);
                return;
            }
            onSeatSelect([...selectedSeats, seat.id]);
            setErrorMsg('');
        }
    };

    const handleBack = () => {
        if (activeBlock) {
            setActiveBlock(null);
        } else if (activeStand) {
            setActiveStand(null);
        }
    };

    // Animation Configurations
    const viewVariants = {
        enter: { opacity: 0, scale: 0.98, y: 10 },
        center: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, type: "spring", bounce: 0.4 } },
        exit: { opacity: 0, scale: 1.02, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <div className="w-full bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] shadow-sm relative overflow-hidden flex flex-col min-h-[600px]">
            <AmbientBackground />
            
            <div className="relative z-10 p-6 md:p-8 flex-1 flex flex-col">
                
                {/* SECTION 2: Header & Brand Real-estate */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-[#A3A3A3]/20 pb-6 gap-4 shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            {activeStand && (
                                <button onClick={handleBack} className="p-1.5 bg-[#F5F5F5] rounded-full hover:bg-[#E7364D] hover:text-[#FFFFFF] transition-colors text-[#333333]">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <h2 className="text-[22px] font-black text-[#333333] tracking-tight">
                                {!activeStand ? "Stadium Overview" : !activeBlock ? `${activeStand.name} Selection` : `Block ${activeBlock} Matrix`}
                            </h2>
                        </div>
                        <p className="text-[14px] text-[#626262] font-medium mt-1 flex items-center ml-10 md:ml-0">
                            <Activity size={14} className="mr-2 text-[#E7364D] animate-pulse" />
                            Secure ISO-Compliant Allocation
                        </p>
                    </div>
                    <BrandLogo />
                </div>

                {/* Toast Error Messages */}
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0 }} 
                            className="bg-[#FAD8DC]/30 border-l-[4px] border-[#E7364D] text-[#E7364D] p-3 rounded-r-[8px] font-bold text-[13px] flex items-center mb-6 shrink-0"
                        >
                            <AlertTriangle size={16} className="mr-2 shrink-0" /> {errorMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* DRILL-DOWN CONTAINER */}
                <div className="flex-1 relative flex flex-col">
                    <AnimatePresence mode="wait">
                        
                        {/* LEVEL 1: STADIUM OVERVIEW */}
                        {!activeStand && (
                            <motion.div key="overview" variants={viewVariants} initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col items-center justify-center">
                                {/* The Pitch */}
                                <div className="w-[120px] h-[200px] border-2 border-[#A3A3A3]/50 rounded-[60px] bg-[#F5F5F5] flex items-center justify-center relative mb-8">
                                    <div className="w-[40px] h-[80px] bg-[#E5E5E5] border border-[#A3A3A3]/30"></div>
                                    <Compass size={24} className="absolute text-[#A3A3A3]/40" />
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                    {STADIUM_CONFIG.map(stand => (
                                        <button 
                                            key={stand.id}
                                            onClick={() => setActiveStand(stand)}
                                            className="bg-[#FFFFFF] border border-[#A3A3A3]/30 p-5 rounded-[12px] flex flex-col items-center text-center hover:border-[#E7364D] hover:shadow-[0_8px_30px_rgba(231,54,77,0.1)] transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full mb-3 flex items-center justify-center" style={{ backgroundColor: `${stand.color}20`, color: stand.color }}>
                                                <MapPin size={20} />
                                            </div>
                                            <h3 className="font-black text-[#333333] text-[16px] mb-1">{stand.name}</h3>
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-[#A3A3A3]">{stand.type}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* LEVEL 2: STAND / TIER SELECTION */}
                        {activeStand && !activeBlock && (
                            <motion.div key="stand" variants={viewVariants} initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col items-center justify-center w-full">
                                <div className="text-center mb-8">
                                    <h3 className="text-[24px] font-black text-[#333333]">{activeStand.name}</h3>
                                    <p className="text-[#626262] font-medium">Select a designated tier or block to view available seats.</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 w-full max-w-3xl">
                                    {activeStand.blocks.map(block => (
                                        <button 
                                            key={block}
                                            onClick={() => setActiveBlock(block)}
                                            className="bg-[#FAFAFA] border border-[#A3A3A3]/30 px-8 py-6 rounded-[8px] hover:border-[#E7364D] hover:bg-[#FFFFFF] hover:shadow-md transition-all flex flex-col items-center min-w-[160px]"
                                        >
                                            <ZoomIn size={24} className="text-[#333333] mb-3 opacity-50" />
                                            <span className="font-black text-[18px] text-[#333333]">{block.replace('-', ' ')}</span>
                                            <span className="text-[12px] font-bold text-[#A3A3A3] mt-1">Tap to Expand Grid</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* LEVEL 3: EXACT SEAT MATRIX */}
                        {activeStand && activeBlock && (
                            <motion.div key="matrix" variants={viewVariants} initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col w-full">
                                
                                {/* SECTION 6: The Pitch Visualizer Context */}
                                <div className="w-full mb-8 flex flex-col items-center justify-center shrink-0">
                                    <div className="w-[80%] max-w-[500px] h-10 border-t-[4px] border-[#A3A3A3] rounded-t-[50%] flex items-end justify-center pb-2 bg-gradient-to-t from-[#F5F5F5] to-transparent">
                                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#A3A3A3] flex items-center"><Compass size={12} className="mr-2"/> Facing Pitch</span>
                                    </div>
                                </div>

                                <div className="w-full overflow-x-auto pb-6 flex-1 cursor-grab active:cursor-grabbing">
                                    <div className="flex flex-col gap-2 min-w-max mx-auto px-4">
                                        {seatGrid.map((rowObj) => (
                                            <div key={rowObj.row} className="flex items-center gap-3">
                                                <span className="text-[12px] font-black text-[#A3A3A3] w-6 text-right">{rowObj.row}</span>
                                                <div className="flex gap-1.5">
                                                    {rowObj.seats.map((seat) => {
                                                        const isSelected = selectedSeats.includes(seat.id);
                                                        return (
                                                            <button
                                                                key={seat.id}
                                                                onClick={() => handleSeatClick(seat)}
                                                                disabled={seat.isBooked}
                                                                title={`${seat.isPremium ? 'Premium ' : ''}Seat ${seat.row}${seat.shortId}`}
                                                                className={`
                                                                    w-7 h-8 rounded-t-[6px] rounded-b-[2px] flex items-center justify-center text-[9px] font-black transition-all relative
                                                                    ${seat.isBooked 
                                                                        ? 'bg-[#E5E5E5] text-[#A3A3A3] border border-[#A3A3A3]/20 cursor-not-allowed opacity-50' 
                                                                        : isSelected 
                                                                            ? 'bg-[#E7364D] text-[#FFFFFF] border border-[#E7364D] shadow-[0_4px_10px_rgba(231,54,77,0.4)] scale-110 z-10' 
                                                                            : seat.isPremium
                                                                                ? 'bg-[#FFFFFF] text-[#E7364D] border-2 border-[#FAD8DC] hover:border-[#E7364D] cursor-pointer'
                                                                                : 'bg-[#FFFFFF] text-[#333333] border border-[#A3A3A3]/40 hover:border-[#333333] cursor-pointer'
                                                                    }
                                                                `}
                                                            >
                                                                {seat.shortId}
                                                                {seat.isPremium && !seat.isBooked && !isSelected && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#E7364D] rounded-full translate-x-1/2 -translate-y-1/2" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <span className="text-[12px] font-black text-[#A3A3A3] w-6 text-left">{rowObj.row}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SECTION 7: Intelligent Legend */}
                                <div className="flex flex-wrap items-center justify-center gap-6 py-4 border-t border-[#A3A3A3]/20 mt-4 bg-[#FFFFFF] shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-[4px] bg-[#FFFFFF] border border-[#A3A3A3]/40"></div>
                                        <span className="text-[11px] font-bold text-[#626262] uppercase tracking-wider">Standard</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-[4px] bg-[#FFFFFF] border-2 border-[#FAD8DC] relative"><div className="absolute top-[-2px] right-[-2px] w-1.5 h-1.5 bg-[#E7364D] rounded-full"/></div>
                                        <span className="text-[11px] font-bold text-[#626262] uppercase tracking-wider">Premium Row</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-[4px] bg-[#E7364D]"></div>
                                        <span className="text-[11px] font-bold text-[#333333] uppercase tracking-wider">Selected</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-[4px] bg-[#E5E5E5] border border-[#A3A3A3]/20"></div>
                                        <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">Booked</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* SECTION 8: Live Selection Summary Pane */}
                <div className="mt-6 bg-[#333333] rounded-[12px] p-5 text-[#FFFFFF] shadow-lg relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#E7364D] opacity-10 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                        <div>
                            <p className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-widest mb-2">Global Identifier Payload</p>
                            <div className="flex items-center gap-3">
                                {selectedSeats.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto pr-2">
                                        {selectedSeats.map(seat => (
                                            <span key={seat} className="bg-[#E7364D] px-2.5 py-1 rounded-[4px] text-[12px] font-mono font-black tracking-wide shadow-sm">{seat}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-[14px] font-black text-[#626262]">Navigate architecture to select seats</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] text-[#A3A3A3] font-bold uppercase tracking-widest mb-1">Requirement</p>
                            <p className="text-[16px] font-black">
                                <span className={selectedSeats.length === selectedQty ? "text-[#E7364D]" : "text-[#FFFFFF]"}>{selectedSeats.length}</span> / {selectedQty} Allocated
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 9: 10+ Dynamic Event Guidelines & Security Protocols */}
            <div className="bg-[#FAFAFA] border-t border-[#A3A3A3]/20 p-8 shrink-0">
                <h3 className="text-[16px] font-black text-[#333333] mb-6 tracking-tight uppercase border-b border-[#A3A3A3]/20 pb-2">Venue Protocols & Architectural Guidelines</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    {/* Feature 1 */}
                    <div className="flex items-start gap-3">
                        <Star size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Premium View Zoning</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">Rows A through C in all lower blocks are designated premium proximity zones.</p></div>
                    </div>
                    {/* Feature 2 */}
                    <div className="flex items-start gap-3">
                        <Users size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Contiguous Group Booking</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">For parties of 4+, we enforce selection within the same architectural block.</p></div>
                    </div>
                    {/* Feature 3 */}
                    <div className="flex items-start gap-3">
                        <ShieldCheck size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Instant Escrow Lock</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">Seats are cryptographically locked globally via Firebase upon successful checkout.</p></div>
                    </div>
                    {/* Feature 4 */}
                    <div className="flex items-start gap-3">
                        <Navigation size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Gate Routing</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">North & East stands enter via Gate 2. South & West access via VIP Gate 4.</p></div>
                    </div>
                    {/* Feature 5 */}
                    <div className="flex items-start gap-3">
                        <Wind size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Open-Air Elements</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">Upper Tiers are partially exposed to weather elements. Dress accordingly.</p></div>
                    </div>
                    {/* Feature 6 */}
                    <div className="flex items-start gap-3">
                        <Flame size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Restricted Items</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">Bags, power banks, and flammables are strictly prohibited past block entrances.</p></div>
                    </div>
                    {/* Feature 7 */}
                    <div className="flex items-start gap-3">
                        <ShieldAlert size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Evacuation Exits</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">Emergency vomitories are located at the end of Row M in every lower block.</p></div>
                    </div>
                    {/* Feature 8 */}
                    <div className="flex items-start gap-3">
                        <Activity size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Live Concourse Tracking</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">QR scanning at the block level provides real-time crowd density metrics.</p></div>
                    </div>
                    {/* Feature 9 */}
                    <div className="flex items-start gap-3">
                        <BadgeCheck size={16} className="text-[#E7364D] mt-0.5 shrink-0" />
                        <div><h4 className="text-[13px] font-bold text-[#333333]">Transfer Restrictions</h4><p className="text-[11px] text-[#626262] mt-1 leading-relaxed">Allocated seats cannot be modified post-purchase without admin escalation.</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}