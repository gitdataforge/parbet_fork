import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useSellerStore } from '../../../store/useSellerStore';

export default function IPLHub() {
    const navigate = useNavigate();
    const { liveMatches, fetchLiveEvents, isLoadingEvents } = useSellerStore();

    // Trigger the real-time ESPN API network sync the moment the page loads
    useEffect(() => {
        fetchLiveEvents();
    }, [fetchLiveEvents]);

    // Strictly filter the global live matches to only show Indian/IPL related cricket events
    const iplEvents = useMemo(() => {
        return liveMatches.filter(event => 
            event.league?.toLowerCase().includes('premier league') ||
            event.league?.toLowerCase().includes('ipl') ||
            event.t1?.toLowerCase().includes('super') || 
            event.t1?.toLowerCase().includes('indians') ||
            event.t1?.toLowerCase().includes('challengers') ||
            event.t1?.toLowerCase().includes('kings') ||
            event.t1?.toLowerCase().includes('knight') ||
            event.t1?.toLowerCase().includes('capitals') ||
            event.country === 'IN' // Fallback to all Indian matches if ESPN API categorizes it broadly
        );
    }, [liveMatches]);

    // Helper function to extract exact date formats mimicking the Viagogo UI
    const formatEventDate = (isoString) => {
        const d = new Date(isoString);
        return {
            dayNum: d.getDate(),
            monthStr: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            timeStr: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
    };

    const handleSellClick = (event) => {
        // Route directly to the form with the real team pre-filled
        navigate(`/create-listing?q=${encodeURIComponent(event.t1)}`);
    };

    return (
        <div className="w-full min-h-screen bg-white font-sans flex flex-col">
            
            {/* 1:1 Replica Dark Stadium Hero Banner */}
            <div className="w-full h-[180px] md:h-[220px] bg-black relative overflow-hidden flex justify-center">
                {/* We use a high-quality stadium grass overlay, fading into the black background just like the screenshot */}
                <div 
                    className="w-full max-w-[1000px] h-full opacity-80"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop")',
                        backgroundPosition: 'center 40%',
                        backgroundSize: 'cover',
                        maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)'
                    }}
                ></div>
            </div>

            {/* Main Content Area */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 flex-1">
                
                {/* Title & Tabs Section */}
                <div className="mb-6">
                    <h1 className="text-[36px] md:text-[42px] font-black text-[#1a1a1a] tracking-tight mb-1">
                        Indian Premier League
                    </h1>
                    <p className="text-[18px] text-[#54626c] mb-6">
                        Sell tickets <span className="mx-1 text-gray-300">|</span> {isLoadingEvents ? '...' : iplEvents.length} upcoming events
                    </p>
                    
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button className="text-[#458731] border-b-4 border-[#458731] font-bold text-[15px] pb-3 mr-8">
                            Tickets
                        </button>
                        <button className="text-[#54626c] font-bold text-[15px] pb-3 hover:text-[#1a1a1a] transition-colors">
                            Parking
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex flex-wrap items-center gap-3 py-4">
                    <button className="border border-[#cccccc] hover:border-gray-400 rounded-full px-5 py-2 text-[14px] text-[#1a1a1a] font-medium flex items-center transition-colors">
                        All locations <ChevronDown size={16} className="ml-2 text-gray-500" />
                    </button>
                    <button className="border border-[#cccccc] hover:border-gray-400 rounded-full px-5 py-2 text-[14px] text-[#1a1a1a] font-medium flex items-center transition-colors">
                        All dates <ChevronDown size={16} className="ml-2 text-gray-500" />
                    </button>
                    <button className="border border-[#cccccc] hover:border-gray-400 rounded-full px-5 py-2 text-[14px] text-[#1a1a1a] font-medium flex items-center transition-colors">
                        Sort by date <ChevronDown size={16} className="ml-2 text-gray-500" />
                    </button>
                </div>

                {/* Empty State Text Replica */}
                {iplEvents.length === 0 && !isLoadingEvents && (
                    <div className="text-center py-8 text-[14px] text-[#1a1a1a]">
                        No events within <u className="cursor-pointer">50 miles</u> of <u className="cursor-pointer">your location</u> for <u className="cursor-pointer">all dates</u> <ChevronDown size={14} className="inline text-gray-500 align-middle"/>
                    </div>
                )}

                {/* Real-Time Data List Container */}
                <div className="mt-4 border border-[#e2e2e2] rounded-[8px] overflow-hidden mb-16 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    {/* List Header */}
                    <div className="bg-[#f8f9fa] border-b border-[#e2e2e2] px-6 py-4 text-[13px] text-[#54626c] font-medium">
                        <span className="font-bold text-[#1a1a1a]">{isLoadingEvents ? 'Loading' : iplEvents.length}</span> events in all locations
                    </div>

                    {/* List Body */}
                    {isLoadingEvents ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#458731] mb-3" size={32} />
                            <p className="text-[#54626c] font-medium">Syncing live sports network...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-[#e2e2e2]">
                            {iplEvents.map((event) => {
                                const dateInfo = formatEventDate(event.commence_time);
                                
                                return (
                                    <div 
                                        key={event.id} 
                                        onClick={() => handleSellClick(event)}
                                        className="flex flex-col md:flex-row py-5 px-6 hover:bg-[#f8f9fa] transition-colors cursor-pointer group"
                                    >
                                        {/* 1:1 Replica Date Column */}
                                        <div className="w-[100px] flex flex-col items-center md:items-start shrink-0 mb-3 md:mb-0">
                                            <div className="text-[22px] font-black text-[#1a1a1a] leading-none tracking-tight">
                                                {dateInfo.dayNum} {dateInfo.monthStr}
                                            </div>
                                            <div className="text-[12px] text-[#54626c] font-medium mt-1 uppercase tracking-wider">
                                                {dateInfo.dayStr} <br className="hidden md:block"/> {dateInfo.timeStr}
                                            </div>
                                        </div>

                                        {/* 1:1 Replica Event Details Column */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="text-[16px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors mb-1">
                                                {event.t1} {event.t2 ? `vs ${event.t2}` : ''}
                                            </h3>
                                            <p className="text-[14px] text-[#54626c]">
                                                {event.loc.split(',')[0]}
                                                <br />
                                                {event.loc.split(',').slice(1).join(',') || 'India'}
                                            </p>
                                        </div>

                                        {/* 1:1 Replica Sell Tickets Action */}
                                        <div className="shrink-0 flex items-center justify-start md:justify-end mt-4 md:mt-0">
                                            <span className="text-[#54626c] text-[14px] font-medium group-hover:text-[#458731] transition-colors">
                                                Sell Tickets
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}