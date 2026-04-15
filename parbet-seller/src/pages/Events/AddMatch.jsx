import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, MapPin, Ticket, Image as ImageIcon, Plus, Trash2, 
    ShieldAlert, CheckCircle2, Loader2, Info, Trophy, Tag, AlignLeft 
} from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';
// We import useEventStore which we will create in the very next step
import { useEventStore } from '../../store/useEventStore';

/**
 * FEATURE 1: Strict Auth Guard Interceptor
 * FEATURE 2: Dynamic Firestore Payload Constructor
 * FEATURE 3: Real-Time Dynamic Ticket Tiers Engine (Add/Remove Categories)
 * FEATURE 4: Live Image URL Preview & Fallback Handlers
 * FEATURE 5: Hardware-Accelerated 60fps Form Transitions
 * FEATURE 6: Native Timezone & Future-Date Validation
 * FEATURE 7: Financial Integrity Checks (No negative prices/inventory)
 * FEATURE 8: Sticky Responsive Submission Action Bar
 * FEATURE 9: Comprehensive Error Boundary & UI Feedback
 * FEATURE 10: Clean Enterprise White-Theme UI Alignment
 */
export default function AddMatch() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useSellerStore();
    const { addEvent, isLoading: submitting, error: submitError, clearError } = useEventStore();

    // FEATURE 1: Auth Guard
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login', { replace: true });
        }
    }, [user, authLoading, navigate]);

    // FEATURE 2 & 5: Form State Architecture
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        sportCategory: 'Cricket',
        date: '',
        time: '',
        venueName: '',
        venueCity: '',
        imageUrl: ''
    });

    // FEATURE 3: Dynamic Ticket Tiers Engine
    const [ticketTiers, setTicketTiers] = useState([
        { id: crypto.randomUUID(), name: 'General Admission', price: '', quantity: '' }
    ]);

    const [localError, setLocalError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (localError) setLocalError('');
        if (submitError) clearError();
    };

    const handleTierChange = (id, field, value) => {
        setTicketTiers(prev => prev.map(tier => 
            tier.id === id ? { ...tier, [field]: value } : tier
        ));
    };

    const addTicketTier = () => {
        setTicketTiers(prev => [
            ...prev, 
            { id: crypto.randomUUID(), name: '', price: '', quantity: '' }
        ]);
    };

    const removeTicketTier = (id) => {
        if (ticketTiers.length === 1) {
            setLocalError("You must have at least one ticket tier.");
            return;
        }
        setTicketTiers(prev => prev.filter(tier => tier.id !== id));
    };

    // FEATURE 7 & 9: Strict Validation Engine
    const validatePayload = () => {
        if (!formData.title.trim() || !formData.venueName.trim() || !formData.venueCity.trim() || !formData.date || !formData.time) {
            return "Please fill out all required match and venue details.";
        }

        const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
        if (selectedDateTime <= new Date()) {
            return "Event date and time must be in the future.";
        }

        for (let i = 0; i < ticketTiers.length; i++) {
            const tier = ticketTiers[i];
            if (!tier.name.trim()) return `Ticket tier #${i + 1} is missing a name.`;
            if (Number(tier.price) <= 0) return `Price for ${tier.name || `tier #${i+1}`} must be greater than 0.`;
            if (Number(tier.quantity) <= 0) return `Inventory for ${tier.name || `tier #${i+1}`} must be at least 1.`;
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validatePayload();
        if (validationError) {
            setLocalError(validationError);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Construct Shared Firestore Schema
        const payload = {
            ...formData,
            sellerId: user.uid,
            sellerEmail: user.email,
            searchKeywords: formData.title.toLowerCase().split(' '),
            ticketTiers: ticketTiers.map(({ name, price, quantity }) => ({
                name: name.trim(),
                price: Number(price),
                quantity: Number(quantity),
                sold: 0
            })),
            status: 'active',
            createdAt: new Date().toISOString(),
            eventTimestamp: new Date(`${formData.date}T${formData.time}`).toISOString()
        };

        try {
            await addEvent(payload);
            navigate('/profile/listings', { state: { success: "Match successfully published to the live market!" } });
        } catch (err) {
            console.error("Failed to push event to shared ledger.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const displayError = localError || submitError;

    if (authLoading || !user) return <div className="min-h-screen bg-[#f8f9fa]" />;

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-32 font-sans text-[#1a1a1a]">
            
            {/* Header */}
            <div className="bg-white border-b border-[#e2e2e2] sticky top-0 z-40">
                <div className="max-w-[800px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-[24px] font-black tracking-tight">Create Match Listing</h1>
                        <p className="text-[13px] font-bold text-[#54626c] uppercase tracking-widest mt-0.5">Global Market Distribution</p>
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-[14px] font-bold text-[#54626c] hover:text-[#1a1a1a] transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <main className="max-w-[800px] mx-auto px-6 mt-8">
                
                {/* Dynamic Error Boundary */}
                <AnimatePresence>
                    {displayError && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, y: -10 }} 
                            animate={{ opacity: 1, height: 'auto', y: 0 }} 
                            exit={{ opacity: 0, height: 0 }} 
                            className="mb-8 overflow-hidden"
                        >
                            <div className="bg-[#fdf2f2] border border-[#fecaca] p-4 rounded-[8px] flex items-start gap-3 shadow-sm">
                                <ShieldAlert className="text-[#c21c3a] shrink-0 mt-0.5" size={20} />
                                <div className="text-[14px] font-bold text-[#c21c3a] leading-relaxed">{displayError}</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION 1: Core Details */}
                    <div className="bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm overflow-hidden">
                        <div className="bg-[#fcfcfc] border-b border-[#e2e2e2] px-6 py-4 flex items-center gap-3">
                            <Trophy size={20} className="text-[#8cc63f]" />
                            <h2 className="text-[16px] font-black uppercase tracking-widest text-[#1a1a1a]">Match Intelligence</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[13px] font-black text-[#54626c] uppercase tracking-widest mb-2">Match Title (Teams)</label>
                                <input 
                                    type="text" name="title" value={formData.title} onChange={handleInputChange} 
                                    placeholder="e.g., India vs Australia - World Cup Final" 
                                    className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] text-[15px] font-bold text-[#1a1a1a] focus:bg-white focus:border-[#8cc63f] focus:ring-4 focus:ring-[#8cc63f]/10 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[13px] font-black text-[#54626c] uppercase tracking-widest mb-2">Sport Category</label>
                                    <select 
                                        name="sportCategory" value={formData.sportCategory} onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] text-[15px] font-bold text-[#1a1a1a] focus:bg-white focus:border-[#8cc63f] outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Cricket">Cricket</option>
                                        <option value="Football">Football</option>
                                        <option value="Tennis">Tennis</option>
                                        <option value="Basketball">Basketball</option>
                                        <option value="Esports">Esports</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-black text-[#54626c] uppercase tracking-widest mb-2 flex items-center justify-between">
                                        <span>Cover Image URL</span>
                                        <span className="text-[10px] text-[#9ca3af]">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                                        <input 
                                            type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} 
                                            placeholder="https://..." 
                                            className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] text-[15px] font-bold text-[#1a1a1a] focus:bg-white focus:border-[#8cc63f] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* FEATURE 4: Live Image Preview */}
                            {formData.imageUrl && (
                                <div className="w-full h-[160px] bg-[#f8f9fa] rounded-[8px] border border-[#e2e2e2] overflow-hidden relative">
                                    <img 
                                        src={formData.imageUrl} 
                                        alt="Match Preview" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center -z-10 text-[12px] font-bold text-[#9ca3af]">Invalid Image URL</div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[13px] font-black text-[#54626c] uppercase tracking-widest mb-2">Description</label>
                                <textarea 
                                    name="description" value={formData.description} onChange={handleInputChange} rows="3"
                                    placeholder="Add match details, stadium rules, or special instructions..." 
                                    className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] text-[15px] font-medium text-[#1a1a1a] focus:bg-white focus:border-[#8cc63f] focus:ring-4 focus:ring-[#8cc63f]/10 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Logistics */}
                    <div className="bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm overflow-hidden">
                        <div className="bg-[#fcfcfc] border-b border-[#e2e2e2] px-6 py-4 flex items-center gap-3">
                            <Calendar size={20} className="text-[#8cc63f]" />
                            <h2 className="text-[16px] font-black uppercase tracking-widest text-[#1a1a1a]">Logistics & Venue</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[13px] font-black text-[#54626c] uppercase tracking-widest mb-2">Date</label>
                                <input 
                                    type="date" name="date" value={formData.date} onChange={handleInputChange} 
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] text-[15px] font-bold text-[#1a1a1a] focus:bg-white focus:border-[#8cc63f] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-black text-[#54626c] uppercase tracking-widest mb-2">Kickoff Time (Local)</label>
                                <input 
                                    type="time" name="time" value={formData.time} onChange={handleInputChange} 
                                    className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] text-[15px] font-bold text-[#1a1a1a] focus:bg-white focus:border-[#8cc63f] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-black text-[#54626c] uppercase tracking-widest mb-2">Stadium / Venue Name</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                                    <input 
                                        type="text" name="venueName" value={formData.venueName} onChange={handleInputChange} placeholder="e.g., Wankhede Stadium"
                                        className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] text-[15px] font-bold text-[#1a1a1a] focus:bg-white focus:border-[#8cc63f] outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-black text-[#54626c] uppercase tracking-widest mb-2">City</label>
                                <input 
                                    type="text" name="venueCity" value={formData.venueCity} onChange={handleInputChange} placeholder="e.g., Mumbai, IND"
                                    className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded-[8px] text-[15px] font-bold text-[#1a1a1a] focus:bg-white focus:border-[#8cc63f] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Dynamic Ticket Inventory Engine */}
                    <div className="bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm overflow-hidden">
                        <div className="bg-[#fcfcfc] border-b border-[#e2e2e2] px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Ticket size={20} className="text-[#8cc63f]" />
                                <h2 className="text-[16px] font-black uppercase tracking-widest text-[#1a1a1a]">Ticket Tiers & Pricing</h2>
                            </div>
                            <button 
                                type="button" onClick={addTicketTier}
                                className="flex items-center gap-1.5 text-[13px] font-black text-[#0064d2] hover:text-[#1d4ed8] transition-colors"
                            >
                                <Plus size={16} /> Add Tier
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <AnimatePresence>
                                {ticketTiers.map((tier, index) => (
                                    <motion.div 
                                        key={tier.id}
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-[#f8f9fa] p-4 rounded-[8px] border border-[#e2e2e2]"
                                    >
                                        <div className="w-full md:flex-1">
                                            <label className="block text-[11px] font-black text-[#54626c] uppercase tracking-widest mb-1.5">Tier Name</label>
                                            <input 
                                                type="text" value={tier.name} onChange={(e) => handleTierChange(tier.id, 'name', e.target.value)}
                                                placeholder="e.g., VIP North Stand"
                                                className="w-full px-3 py-2.5 bg-white border border-[#e2e2e2] rounded-[6px] text-[14px] font-bold text-[#1a1a1a] focus:border-[#8cc63f] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="w-full md:w-[140px]">
                                            <label className="block text-[11px] font-black text-[#54626c] uppercase tracking-widest mb-1.5">Price (₹)</label>
                                            <input 
                                                type="number" value={tier.price} onChange={(e) => handleTierChange(tier.id, 'price', e.target.value)}
                                                placeholder="0.00" min="1"
                                                className="w-full px-3 py-2.5 bg-white border border-[#e2e2e2] rounded-[6px] text-[14px] font-bold text-[#1a1a1a] focus:border-[#8cc63f] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="w-full md:w-[120px]">
                                            <label className="block text-[11px] font-black text-[#54626c] uppercase tracking-widest mb-1.5">Inventory</label>
                                            <input 
                                                type="number" value={tier.quantity} onChange={(e) => handleTierChange(tier.id, 'quantity', e.target.value)}
                                                placeholder="Qty" min="1"
                                                className="w-full px-3 py-2.5 bg-white border border-[#e2e2e2] rounded-[6px] text-[14px] font-bold text-[#1a1a1a] focus:border-[#8cc63f] outline-none transition-all"
                                            />
                                        </div>
                                        <button 
                                            type="button" onClick={() => removeTicketTier(tier.id)}
                                            className="mt-6 p-2.5 text-[#9ca3af] hover:text-[#c21c3a] hover:bg-[#fdf2f2] rounded-[6px] transition-colors self-end md:self-auto"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* FEATURE 8: Sticky Submission Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-white md:bg-transparent border-t md:border-none border-[#e2e2e2] p-4 md:p-0 z-50">
                        <div className="max-w-[800px] mx-auto flex items-center justify-between gap-4">
                            <div className="hidden md:flex items-center gap-2 text-[13px] font-bold text-[#54626c]">
                                <Info size={16} className="text-[#0064d2]" /> Data pushes instantly to the buyer homepage.
                            </div>
                            <button 
                                type="submit" disabled={submitting}
                                className={`w-full md:w-auto px-10 py-4 rounded-[8px] text-[16px] font-black flex items-center justify-center gap-2 transition-all shadow-lg ${submitting ? 'bg-[#458731] text-white opacity-80 cursor-wait' : 'bg-[#8cc63f] hover:bg-[#458731] text-white active:scale-95'}`}
                            >
                                {submitting ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : <><CheckCircle2 size={18} /> Publish Match to Market</>}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}