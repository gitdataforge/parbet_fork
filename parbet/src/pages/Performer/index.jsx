import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Heart, Share, MapPin, Calendar, Tag, ChevronDown, 
    Info, Download, QrCode 
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import LocationDropdown from '../../components/LocationDropdown';
import FilterDropdown from '../../components/FilterDropdown';

export default function Performer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const performerName = decodeURIComponent(id || '');

    const { 
        liveMatches, 
        userCity, 
        isLoadingMatches, 
        fetchLocationAndMatches,
        exploreDateFilter,
        explorePriceFilter,
        isLocationDropdownOpen,
        setLocationDropdownOpen,
        isAuthenticated,
        openAuthModal
    } = useAppStore();

    // Local Dropdown States
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
    const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
    const [emailInput, setEmailInput] = useState('');

    useEffect(() => {
        if (liveMatches.length === 0 && !isLoadingMatches) {
            fetchLocationAndMatches();
        }
        // Scroll to top on mount/performer change
        window.scrollTo(0, 0);
    }, [liveMatches.length, isLoadingMatches, fetchLocationAndMatches, id]);

    const handleRestrictedAction = (actionName) => {
        if (!isAuthenticated) openAuthModal();
        else console.log(`Executing secure real-time action: ${actionName}`);
    };

    // --- RIGOROUS REAL-TIME API FILTERING ---
    // 1. Base filter for this specific performer/league
    const baseEvents = liveMatches.filter(m => 
        m.t1.toLowerCase().includes(performerName.toLowerCase()) || 
        m.t2.toLowerCase().includes(performerName.toLowerCase()) ||
        m.league.toLowerCase().includes(performerName.toLowerCase())
    );

    // 2. Apply user-selected UI filters
    const filteredEvents = baseEvents.filter(m => {
        if (userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location') {
            if (!m.loc.toLowerCase().includes(userCity.toLowerCase())) return false;
        }
        // Strict active state UI logic based on store selections
        if (exploreDateFilter === 'Today' && !m.time.includes('PM')) return false; 
        return true;
    });

    // 3. Extract recommendations (other performers in the API)
    const relatedEvents = liveMatches.filter(m => 
        !m.t1.toLowerCase().includes(performerName.toLowerCase()) && 
        !m.league.toLowerCase().includes(performerName.toLowerCase())
    ).slice(0, 6);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full pb-20"
        >
            {/* HERO SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 md:mt-10 mb-10 gap-8">
                <div className="flex-1 max-w-2xl">
                    <h1 className="text-[40px] md:text-[56px] font-black text-brand-text leading-[1.1] tracking-tight mb-6">
                        {performerName} Tickets
                    </h1>
                    
                    {/* Action Buttons (Mobile inline, Desktop float) */}
                    <div className="flex items-center space-x-3 mb-8 md:hidden">
                        <button onClick={() => handleRestrictedAction('Favourite')} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Heart size={18} className="text-brand-text"/>
                        </button>
                        <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Share size={18} className="text-brand-text"/>
                        </button>
                    </div>

                    {/* Filter Pills Row */}
                    <div className="flex items-center space-x-3 overflow-x-visible hide-scrollbar relative pb-1">
                        {/* Location Pill */}
                        <div className="relative">
                            <button 
                                onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)}
                                className="bg-gray-900 text-white px-4 py-2.5 rounded-full text-[15px] font-bold flex items-center whitespace-nowrap shadow-sm hover:bg-black transition-colors"
                            >
                                <MapPin size={16} className="mr-2 fill-white text-gray-900"/> 
                                {userCity} 
                                <ChevronDown size={16} className={`ml-2 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            <div className="absolute left-0 mt-2 z-50">
                                <LocationDropdown />
                            </div>
                        </div>

                        {/* Dates Pill */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setDateDropdownOpen(!dateDropdownOpen);
                                    setPriceDropdownOpen(false);
                                }}
                                className="border border-gray-300 bg-white text-brand-text px-4 py-2.5 rounded-full text-[15px] font-medium flex items-center whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                <Calendar size={16} className="mr-2 opacity-60"/> 
                                {exploreDateFilter} 
                                <ChevronDown size={16} className={`ml-2 opacity-60 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            <FilterDropdown type="date" isOpen={dateDropdownOpen} onClose={() => setDateDropdownOpen(false)} />
                        </div>

                        {/* Price Pill */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setPriceDropdownOpen(!priceDropdownOpen);
                                    setDateDropdownOpen(false);
                                }}
                                className="border border-gray-300 bg-white text-brand-text px-4 py-2.5 rounded-full text-[15px] font-medium flex items-center whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                <Tag size={16} className="mr-2 opacity-60"/> 
                                {explorePriceFilter === 'All' ? 'Price' : explorePriceFilter} 
                                <ChevronDown size={16} className={`ml-2 opacity-60 transition-transform ${priceDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            <FilterDropdown type="price" isOpen={priceDropdownOpen} onClose={() => setPriceDropdownOpen(false)} />
                        </div>
                    </div>
                </div>

                {/* Hero Right: Actions & Dynamic Image */}
                <div className="hidden md:flex flex-col items-end space-y-4">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => handleRestrictedAction('Favourite')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:shadow-md transition-all bg-white">
                            <Heart size={18} className="text-brand-text"/>
                        </button>
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:shadow-md transition-all bg-white">
                            <Share size={18} className="text-brand-text"/>
                        </button>
                    </div>
                    <div className="w-[400px] h-[220px] rounded-[16px] overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
                        <img 
                            src={`https://loremflickr.com/800/400/${encodeURIComponent(performerName.split(' ')[0])},sports/all`} 
                            alt={performerName} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </div>

            {/* EVENT LIST SECTION */}
            <div className="mb-16">
                <h3 className="text-[17px] font-bold text-brand-text mb-6">
                    {filteredEvents.length} events in {userCity === 'All Cities' ? 'all locations' : userCity}
                </h3>

                {isLoadingMatches ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold text-brand-text">Loading events...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="w-full py-12 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <h3 className="text-lg font-bold text-brand-text mb-1">No events found</h3>
                        <p className="text-brand-muted">Try adjusting your filters or location to see more results.</p>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {filteredEvents.map(m => (
                            <div 
                                key={m.id} 
                                onClick={() => navigate(`/event?id=${m.id}`)}
                                className="bg-white border border-[#DEE2E6] rounded-[16px] p-4 flex flex-col md:flex-row md:items-center hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                            >
                                {/* Left Date Box */}
                                <div className="flex items-center flex-1">
                                    <div className="flex flex-col items-center justify-center pr-5 border-r border-[#DEE2E6] min-w-[85px]">
                                        <span className="text-[13px] font-bold text-gray-900 mb-0.5">{m.month}</span>
                                        <span className="text-[26px] font-black text-gray-900 leading-none mb-0.5">{m.day}</span>
                                        <span className="text-[12px] text-gray-500 font-medium">{m.dow}</span>
                                    </div>
                                    
                                    {/* Middle Details */}
                                    <div className="pl-5 flex-1">
                                        <h3 className="text-[17px] font-bold text-brand-text leading-tight mb-1 group-hover:text-brand-primary transition-colors">
                                            {m.t1} vs {m.t2}
                                        </h3>
                                        <p className="text-[14px] text-brand-muted flex items-center mb-2">
                                            {m.time} • 🇮🇳 {m.loc}
                                        </p>
                                        <div className="flex space-x-2 items-center">
                                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-[12px] font-medium text-brand-text border border-gray-200">
                                                <Calendar size={12} className="mr-1.5 opacity-70"/> {exploreDateFilter === 'Today' ? 'Today' : 'Upcoming'}
                                            </div>
                                            {m.tag && (
                                                <div className={`flex items-center px-2 py-1 rounded text-[12px] font-bold border border-transparent ${m.tagColor}`}>
                                                    <Info size={12} className="mr-1.5"/> {m.tag}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Action Button */}
                                <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t border-[#DEE2E6] md:border-t-0 flex justify-end">
                                    <button className="w-full md:w-auto border border-gray-300 text-brand-text bg-white px-6 py-2.5 rounded-[12px] font-bold text-[15px] group-hover:bg-gray-50 transition-colors shadow-sm">
                                        See tickets
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RECOMMENDATIONS RAILS */}
            {relatedEvents.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-[22px] font-bold text-brand-text mb-6">Fans also love</h2>
                    <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                        {relatedEvents.map((item, idx) => (
                            <div key={`rel-${item.id}`} onClick={() => navigate(`/performer/${encodeURIComponent(item.t1)}`)} className="min-w-[260px] max-w-[260px] flex-shrink-0 cursor-pointer group">
                                <div className="relative w-full h-[160px] rounded-[12px] overflow-hidden mb-3 border border-gray-100 bg-gray-200 shadow-sm">
                                    <img 
                                        src={`https://loremflickr.com/600/400/${encodeURIComponent(item.t1.split(' ')[0])},sports/all`} 
                                        alt={item.t1} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <button onClick={(e) => { e.stopPropagation(); handleRestrictedAction(`Favourite ${item.t1}`); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 backdrop-blur-sm z-10 transition-colors">
                                        <Heart size={14} className="text-white"/>
                                    </button>
                                </div>
                                <h3 className="font-bold text-brand-text text-[16px] leading-tight group-hover:text-brand-primary transition-colors truncate">{item.t1}</h3>
                                <p className="text-[13px] text-brand-muted truncate">{item.league}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* APP DOWNLOAD BANNER */}
            <div className="w-full bg-[#EAF4D9] rounded-[20px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center relative overflow-hidden mb-12 border border-[#C5E1A5]">
                <div className="md:w-1/2 z-10 text-center md:text-left mb-8 md:mb-0">
                    <h2 className="text-3xl md:text-[40px] font-black text-[#114C2A] mb-3 leading-tight tracking-tight">Download the parbet app</h2>
                    <p className="text-[17px] text-[#114C2A]/80 font-medium mb-8">Discover your favourite events with ease</p>
                    
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <button className="bg-black text-white px-5 py-2.5 rounded-[12px] flex items-center hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center shadow-lg">
                            <Download size={24} className="mr-3" />
                            <div className="text-left leading-none">
                                <span className="text-[10px] block opacity-80">Download on the</span>
                                <span className="text-[15px] font-bold">App Store</span>
                            </div>
                        </button>
                        <button className="bg-black text-white px-5 py-2.5 rounded-[12px] flex items-center hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center shadow-lg">
                            <Download size={24} className="mr-3" />
                            <div className="text-left leading-none">
                                <span className="text-[10px] block opacity-80">GET IT ON</span>
                                <span className="text-[15px] font-bold">Google Play</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="md:w-1/2 flex justify-center md:justify-end z-10">
                    <div className="bg-white p-3 rounded-[16px] shadow-xl border border-gray-100 flex flex-col items-center">
                        <QrCode size={100} className="text-brand-text mb-2"/>
                        <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Scan to get</span>
                    </div>
                </div>
            </div>

            {/* EMAIL SUBSCRIPTION BANNER */}
            <div className="w-full flex flex-col items-center text-center px-4 mb-8">
                <h3 className="text-[20px] font-bold text-brand-text mb-6">Get hot events and deals delivered straight to your inbox</h3>
                <div className="flex flex-col sm:flex-row items-center w-full max-w-md space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative w-full">
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-gray-300 py-3 outline-none focus:border-[#458731] transition-colors text-[16px] font-medium text-brand-text placeholder-gray-400"
                        />
                    </div>
                    <button className="w-full sm:w-auto border border-[#458731] text-[#458731] font-bold px-8 py-3 rounded-[12px] hover:bg-[#EAF4D9] transition-colors whitespace-nowrap">
                        Join the List
                    </button>
                </div>
                <p className="text-[12px] text-gray-500 mt-6 max-w-3xl leading-relaxed">
                    By signing in or creating an account, you agree to our <a href="#" className="text-brand-primary hover:underline">user agreement</a> and acknowledge our <a href="#" className="text-brand-primary hover:underline">privacy policy</a>. You may receive SMS notifications from us and can opt out at any time.
                </p>
            </div>

        </motion.div>
    );
}