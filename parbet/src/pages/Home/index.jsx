import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Heart, RefreshCw, AlertCircle, Info, Download, QrCode, Navigation, ChevronDown, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import LocationDropdown from '../../components/LocationDropdown';

// Utility to strictly label dates based on the real-time API
const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return 'Upcoming';
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) return 'Today';
    if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) return 'This Week';
    return 'Upcoming';
};

export default function Home() {
    const navigate = useNavigate();
    const { 
        isAuthenticated, 
        openAuthModal,
        liveMatches,
        isLoadingMatches,
        apiError,
        userCity,
        userCountry,
        fetchLocationAndMatches,
        searchQuery,
        setSearchQuery,
        isLocationDropdownOpen,
        setLocationDropdownOpen,
        toggleFavorite
    } = useAppStore();

    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    // Dynamic Hero Carousel Data mapped to Performer routing
    const heroSlides = [
        {
            id: "world-cup-banner",
            title: "World Cup",
            bgLeft: "#043B1A",
            bgRight: "#76AC48",
            query: "World Cup",
            content: (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img src="https://images.unsplash.com/photo-1518605368461-1e1e10815183?auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover opacity-60 mix-blend-overlay" alt="World Cup" />
                    <div className="absolute right-[10%] flex items-center justify-center space-x-2 z-10 drop-shadow-2xl">
                        <span className="text-[80px] md:text-[120px] font-black text-white drop-shadow-lg">W</span>
                        <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-[0_0_40px_rgba(253,224,71,0.6)] flex items-center justify-center text-3xl md:text-4xl mt-2 md:mt-4">⚽</div>
                        <span className="text-[80px] md:text-[120px] font-black text-white drop-shadow-lg">RLD</span>
                    </div>
                </div>
            )
        },
        {
            id: "mumbai-indians-banner",
            title: "Mumbai Indians",
            bgLeft: "#043B1A",
            bgRight: "#0F265C",
            query: "Mumbai Indians",
            content: (
                <div className="absolute inset-0 right-0 pointer-events-none">
                    <img src="https://media.stubhubstatic.com/stubhub-v2-catalog/d_vgg-defaultLogo.jpg/q_auto:low,f_auto,c_fill,g_face,w_1300,h_650/categories/24966/6397111?auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover opacity-70 mix-blend-overlay" alt="MI"/>
                </div>
            )
        },
        {
            id: "circoloco-banner",
            title: "Circoloco",
            bgLeft: "#043B1A",
            bgRight: "#4A001F",
            query: "Circoloco",
            content: (
                <div className="absolute inset-0 right-0 pointer-events-none">
                     <img src="https://images.unsplash.com/photo-1540039155732-678a1bc231cd?auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover opacity-70 mix-blend-overlay" alt="Concert"/>
                </div>
            )
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // Strict Location Fetching Initialization
    useEffect(() => {
        if (liveMatches.length === 0) {
            fetchLocationAndMatches();
        }
    }, [fetchLocationAndMatches, liveMatches.length]);

    const handleRestrictedAction = (actionName, eventObj = null) => {
        if (!isAuthenticated) {
            openAuthModal();
        } else {
            if (eventObj && actionName.includes('Favourite')) {
                toggleFavorite(eventObj);
            }
        }
    };

    const goToEvent = (id) => {
        navigate(`/event?id=${id}`);
    };

    // --- REAL-TIME FUNCTIONAL FILTERING ---
    const filteredMatches = useMemo(() => {
        return liveMatches.filter(m => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return m.t1.toLowerCase().includes(q) || 
                   m.t2?.toLowerCase().includes(q) || 
                   m.league.toLowerCase().includes(q);
        });
    }, [liveMatches, searchQuery]);

    const recents = filteredMatches.slice(0, 4);
    const recommended = filteredMatches.slice(1, 5);
    const popular = filteredMatches.slice(2, 6);
    const comedy = filteredMatches.slice(3, 7);

    return (
        <div className="animate-fade-in w-full pb-20 overflow-x-hidden">
            
            {/* 1. DYNAMIC HERO CAROUSEL */}
            <div className="relative w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden mb-6 group bg-gray-100 shadow-sm border border-gray-200">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentHeroIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 flex"
                    >
                        <div 
                            className="relative w-[60%] md:w-1/3 h-full z-20 flex flex-col justify-center px-6 md:px-12"
                            style={{ 
                                backgroundColor: heroSlides[currentHeroIndex].bgLeft,
                                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' 
                            }}
                        >
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-md">
                                {heroSlides[currentHeroIndex].title}
                            </h2>
                            {/* Routes specifically to the Deep-Dive Performer Page */}
                            <button 
                                onClick={() => navigate(`/performer/${encodeURIComponent(heroSlides[currentHeroIndex].query)}`)}
                                className="border border-[#458731] text-white hover:bg-[#458731] w-max px-5 py-2 md:px-6 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-colors shadow-sm"
                            >
                                See Tickets
                            </button>
                        </div>
                        
                        <div 
                            className="absolute top-0 bottom-0 right-0 w-3/4 z-10"
                            style={{ backgroundColor: heroSlides[currentHeroIndex].bgRight }}
                        >
                            {heroSlides[currentHeroIndex].content}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <button 
                    onClick={() => handleRestrictedAction(`Favourite ${heroSlides[currentHeroIndex].title}`)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-sm z-30"
                >
                    <Heart size={16} className="text-white"/>
                </button>

                <div className="absolute bottom-6 left-6 md:left-12 flex space-x-2.5 z-30">
                    {heroSlides.map((_, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setCurrentHeroIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentHeroIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>

            {/* 2. REPOSITIONED TOP CATEGORIES FILTERS WITH INTERACTIVE DROPDOWN */}
            <div className="flex items-center space-x-3 mb-10 overflow-x-visible hide-scrollbar pb-2 relative">
                <div className="w-10 h-10 rounded-[10px] bg-[#458731] flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm">
                    <Navigation size={18} className="text-white fill-white -rotate-45" />
                </div>
                
                <div className="relative">
                    <button 
                        onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)}
                        className="bg-[#E6F2D9] border border-[#C5E1A5] text-[#114C2A] px-4 py-2 rounded-[10px] text-sm font-bold flex items-center whitespace-nowrap shadow-sm hover:bg-[#D9EBBF] transition-colors"
                    >
                        <MapPin size={16} className="mr-2"/> 
                        {userCity !== 'Loading...' ? `${userCity}, ${userCountry}` : 'Detecting Location...'} 
                        <ChevronDown size={16} className={`ml-2 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    <LocationDropdown />
                </div>

                <button className="bg-white border border-gray-300 text-brand-text px-4 py-2 rounded-[10px] text-sm font-medium flex items-center whitespace-nowrap hover:bg-gray-50 transition-colors shadow-sm">
                    <Calendar size={16} className="mr-2 opacity-50"/> All dates <ChevronDown size={16} className="ml-2 opacity-50"/>
                </button>

                <div className="h-6 w-px bg-gray-300 mx-2 flex-shrink-0"></div>

                <button onClick={() => setSearchQuery('')} className={`px-5 py-2 rounded-[10px] text-sm font-bold whitespace-nowrap shadow-sm transition-colors ${!searchQuery ? 'bg-[#E6F2D9] border border-[#C5E1A5] text-[#114C2A]' : 'bg-white border border-gray-300 text-brand-text hover:bg-gray-50'}`}>All types</button>
                <button onClick={() => setSearchQuery('League')} className={`px-5 py-2 rounded-[10px] text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${searchQuery === 'League' ? 'bg-[#E6F2D9] border border-[#C5E1A5] text-[#114C2A]' : 'bg-white border border-gray-300 text-brand-text hover:bg-gray-50'}`}>Sports</button>
                <button onClick={() => setSearchQuery('Concert')} className={`px-5 py-2 rounded-[10px] text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${searchQuery === 'Concert' ? 'bg-[#E6F2D9] border border-[#C5E1A5] text-[#114C2A]' : 'bg-white border border-gray-300 text-brand-text hover:bg-gray-50'}`}>Concerts</button>
            </div>

            {/* 3. SPOTIFY BANNER */}
            <div className="w-full bg-black rounded-[14px] p-5 md:p-6 mb-12 flex flex-col md:flex-row justify-between items-center text-white cursor-pointer hover:bg-gray-900 transition-colors shadow-lg">
                <div className="flex items-center mb-4 md:mb-0 space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="black"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.36.18.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z"/></svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Spotify</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[17px] leading-tight">Connect your Spotify account and sync your favorite artists</h3>
                        <p className="text-[13px] text-gray-400 mt-0.5">Discover events from who you actually listen to</p>
                    </div>
                </div>
                <button className="bg-[#1DB954] text-black font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#1ed760] transition-colors w-full md:w-auto shadow-sm">
                    Connect Spotify
                </button>
            </div>

            {filteredMatches.length === 0 && !isLoadingMatches && !apiError && (
                <div className="w-full text-center py-12 bg-gray-50 rounded-xl border border-gray-200 mb-12">
                    <h3 className="text-xl font-bold text-brand-text mb-2">No events found in {userCity}</h3>
                    <p className="text-brand-muted font-medium">Try adjusting your location or refreshing the live data feed.</p>
                </div>
            )}

            {/* 4. RECENTLY VIEWED RAIL */}
            {recents.length > 0 && (
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-brand-text">Recently viewed</h2>
                        <button className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm font-bold text-brand-text hover:bg-gray-50 transition-colors shadow-sm">Edit</button>
                    </div>
                    <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                        {recents.map((item) => (
                            <div key={`recent-${item.id}`} onClick={() => goToEvent(item.id)} className="min-w-[280px] max-w-[280px] flex-shrink-0 cursor-pointer group">
                                <div className="relative w-full h-[160px] rounded-[10px] overflow-hidden mb-3 border border-gray-100 bg-gray-200">
                                    <img src={`https://loremflickr.com/600/400/${encodeURIComponent(item.league.split(' ')[0])},sports/all`} alt={item.t1} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <button onClick={(e) => { e.stopPropagation(); handleRestrictedAction(`Favourite`, item); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 backdrop-blur-sm z-10 transition-colors">
                                        <Heart size={14} className="text-white"/>
                                    </button>
                                </div>
                                <h3 className="font-bold text-brand-text text-[17px] leading-tight group-hover:underline truncate">{item.t1} {item.t2 ? `vs ${item.t2}` : ''}</h3>
                                <p className="text-[13px] text-brand-muted truncate">{item.league}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 5. RECOMMENDED FOR YOU RAIL (Location Bound) */}
            {recommended.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-brand-text mb-6">Recommended in {userCity !== 'Loading...' ? userCity : 'your area'}</h2>
                    <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                        {recommended.map((item) => (
                            <div key={`rec-${item.id}`} onClick={() => goToEvent(item.id)} className="min-w-[240px] max-w-[240px] flex-shrink-0 cursor-pointer group">
                                <div className="relative w-full h-[180px] rounded-[10px] overflow-hidden mb-3 border border-gray-100 bg-gray-200">
                                    <img src={`https://loremflickr.com/600/400/${encodeURIComponent(item.league.split(' ')[0])},sports/all`} alt={item.t1} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <button onClick={(e) => { e.stopPropagation(); handleRestrictedAction(`Favourite`, item); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 backdrop-blur-sm z-10 transition-colors">
                                        <Heart size={14} className="text-white"/>
                                    </button>
                                </div>
                                <h3 className="font-bold text-brand-text text-base leading-tight group-hover:underline mb-1 truncate">{item.t1} {item.t2 ? `vs ${item.t2}` : ''}</h3>
                                <p className="text-[13px] text-brand-muted font-medium">{item.dow}, {item.day} {item.month} • {item.time}</p>
                                <p className="text-[13px] font-bold text-brand-muted truncate">📍 {item.loc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 6. POPULAR CATEGORIES RAIL */}
            {popular.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-brand-text mb-6">Popular in {userCountry || 'India'}</h2>
                    <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                        {popular.map((item) => (
                            <div key={`pop-${item.id}`} onClick={() => goToEvent(item.id)} className="min-w-[260px] max-w-[260px] flex-shrink-0 cursor-pointer group relative h-[180px] rounded-[10px] overflow-hidden border border-gray-100 bg-gray-200 shadow-sm">
                                <img src={`https://loremflickr.com/600/400/${encodeURIComponent(item.league.split(' ')[0])},sports/all`} alt={item.league} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                                    <h3 className="font-bold text-white text-lg leading-tight drop-shadow-md truncate">{item.league}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 7. ARTIST TOUR SUBSCRIPTION BANNER */}
            <div className="w-full border border-gray-200 rounded-[10px] p-5 mb-12 flex flex-col md:flex-row justify-between items-center bg-white cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-6 mb-4 md:mb-0 w-full md:w-auto">
                    <div className="flex -space-x-4">
                        <div className="w-14 h-14 rounded-full border-2 border-white bg-gray-200 z-30 overflow-hidden"><img src="https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" alt="Artist" /></div>
                        <div className="w-14 h-14 rounded-full border-2 border-white bg-gray-300 z-20 overflow-hidden"><img src="https://images.unsplash.com/photo-1514361598106-897108422325?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" alt="Artist" /></div>
                        <div className="w-14 h-14 rounded-full border-2 border-white bg-gray-400 z-10 overflow-hidden"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" alt="Artist" /></div>
                    </div>
                    <h3 className="font-bold text-lg md:text-xl text-brand-text">Discover when your favourite artists are on tour</h3>
                </div>
                <button className="bg-[#212529] text-white font-bold px-8 py-3 rounded-lg text-sm hover:bg-black transition-colors w-full md:w-auto shadow-sm">
                    Subscribe
                </button>
            </div>

            {/* 8. UPCOMING NEAR YOU RAIL */}
            {comedy.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-brand-text mb-6">Upcoming Near {userCity !== 'Loading...' ? userCity : 'You'}</h2>
                    <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                        {comedy.map((item) => (
                            <div key={`comedy-${item.id}`} onClick={() => goToEvent(item.id)} className="min-w-[240px] max-w-[240px] flex-shrink-0 cursor-pointer group">
                                <div className="relative w-full h-[180px] rounded-[10px] overflow-hidden mb-3 border border-gray-100 bg-gray-200">
                                    <img src={`https://loremflickr.com/600/400/${encodeURIComponent(item.league.split(' ')[0])},sports/all`} alt={item.t1} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <button onClick={(e) => { e.stopPropagation(); handleRestrictedAction(`Favourite`, item); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 backdrop-blur-sm z-10 transition-colors">
                                        <Heart size={14} className="text-white"/>
                                    </button>
                                </div>
                                <h3 className="font-bold text-brand-text text-base leading-tight group-hover:underline mb-1 truncate">{item.t1} {item.t2 ? `vs ${item.t2}` : ''}</h3>
                                <p className="text-[13px] text-brand-muted font-medium">{item.dow}, {item.day} {item.month} • {item.time}</p>
                                <p className="text-[13px] font-bold text-brand-muted truncate">📍 {item.loc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 9. THE ODDS API REAL-TIME INTEGRATION (FULL LIST) */}
            <div className="mb-16">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-brand-text tracking-tight">Live Sports in {userCity !== 'Loading...' ? userCity : 'your area'}</h2>
                </div>

                <div className="flex space-x-3 mb-6 overflow-x-auto hide-scrollbar pb-2">
                    <button onClick={() => fetchLocationAndMatches(userCity)} className="bg-white border border-brand-border text-[#458731] px-5 py-2.5 rounded-[10px] text-sm font-bold flex items-center whitespace-nowrap hover:bg-[#E6F2D9] transition-colors shadow-sm">
                        <RefreshCw size={14} className={`mr-2 ${isLoadingMatches ? 'animate-spin' : ''}`}/> Refresh Local Feed
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    {apiError && (
                        <div className="w-full bg-red-50 border border-red-200 rounded-[12px] p-6 flex flex-col items-center justify-center text-center">
                            <AlertCircle size={32} className="text-brand-red mb-3" />
                            <h3 className="font-bold text-lg text-brand-text mb-1">Local Feed Offline</h3>
                            <p className="text-sm text-brand-muted">{apiError}</p>
                        </div>
                    )}

                    {isLoadingMatches && !apiError && (
                        <div className="w-full border border-brand-border rounded-[12px] p-12 flex flex-col items-center justify-center bg-gray-50">
                            <div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-bold text-brand-text">Aggregating verified events for {userCity}...</p>
                        </div>
                    )}

                    {!isLoadingMatches && !apiError && filteredMatches.map(m => (
                        <motion.div 
                            whileHover={{ scale: 1.002, borderColor: '#ccc' }} 
                            key={`list-${m.id}`} 
                            onClick={() => goToEvent(m.id)}
                            className="bg-white border border-[#DEE2E6] rounded-[12px] p-4 flex flex-col md:flex-row md:items-center hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex flex-1 items-center">
                                <div className="flex flex-col items-center justify-center pr-4 md:pr-6 border-r border-[#DEE2E6] min-w-[70px]">
                                    <span className="text-xs font-bold text-brand-text">{m.month}</span>
                                    <span className="text-2xl font-black text-brand-text my-0">{m.day}</span>
                                    <span className="text-xs text-brand-muted">{m.dow}</span>
                                </div>
                                
                                <div className="pl-4 md:pl-6 flex-1">
                                    <h3 className="text-[17px] font-bold text-brand-text leading-tight mb-1">{m.t1} {m.t2 ? `vs ${m.t2}` : ''}</h3>
                                    <p className="text-[13px] text-brand-muted flex items-center mb-2 font-medium">
                                        {m.time} • 📍 {m.loc}
                                    </p>
                                    <div className="flex space-x-2 items-center">
                                        {/* Dynamic Relative Date Logic */}
                                        <div className="flex items-center text-brand-text bg-gray-100 px-2.5 py-1 rounded text-[11px] font-bold border border-[#DEE2E6] uppercase tracking-wider">
                                            <Calendar size={12} className="mr-1.5 opacity-60"/> {getRelativeDateLabel(m.commence_time)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0 flex flex-col items-end w-full md:w-auto border-t border-[#DEE2E6] md:border-t-0 pt-4 md:pt-0">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); goToEvent(m.id); }}
                                    className="w-full md:w-auto bg-[#114C2A] text-white rounded-[10px] px-6 py-2.5 font-bold text-sm hover:bg-[#0c361d] transition-colors shadow-sm"
                                 >
                                     See tickets
                                 </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 10. APP DOWNLOAD BANNER */}
            <div className="w-full bg-[#E6F2D9] rounded-[16px] overflow-hidden p-8 md:p-12 flex flex-col md:flex-row justify-between items-center relative min-h-[200px] shadow-sm border border-[#D9EBBF]">
                <div className="md:w-1/2 z-10 mb-8 md:mb-0 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-[#114C2A] mb-2 tracking-tight">Download the parbet app</h2>
                    <p className="text-lg text-[#114C2A]/80 font-medium">Discover your favourite events with ease</p>
                </div>
                
                <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px]">
                    <div className="absolute w-[150px] h-[280px] bg-black rounded-3xl border-[6px] border-gray-800 shadow-2xl rotate-[-15deg] translate-x-10 translate-y-10 overflow-hidden">
                        <div className="w-full h-full bg-[#E6F2D9] opacity-50"></div>
                    </div>
                    <div className="absolute w-[150px] h-[280px] bg-black rounded-3xl border-[6px] border-gray-800 shadow-2xl rotate-[15deg] translate-x-24 -translate-y-4 overflow-hidden">
                         <div className="w-full h-full bg-[#458731] opacity-50"></div>
                    </div>
                </div>

                <div className="flex items-center space-x-4 z-10">
                    <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center hover:bg-gray-900 transition-colors h-[50px] shadow-lg">
                        <Download size={24} className="mr-2" />
                        <div className="text-left leading-none">
                            <span className="text-[10px] block opacity-80">Download on the</span>
                            <span className="text-sm font-bold">App Store</span>
                        </div>
                    </button>
                    <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center hover:bg-gray-900 transition-colors h-[50px] shadow-lg">
                        <Download size={24} className="mr-2" />
                        <div className="text-left leading-none">
                            <span className="text-[10px] block opacity-80">GET IT ON</span>
                            <span className="text-sm font-bold">Google Play</span>
                        </div>
                    </button>
                    <div className="hidden md:flex bg-white p-2 rounded-xl h-[50px] items-center justify-center border border-gray-200 shadow-sm">
                        <QrCode size={36} className="text-black"/>
                    </div>
                </div>
            </div>

        </div>
    );
}