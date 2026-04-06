import React, { useEffect, useState } from 'react';
import { fetchHotelOffers } from '../services/travelApi';
import { BedDouble } from 'lucide-react';

export default function HotelRail({ lat, lon }) {
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        if (lat && lon) fetchHotelOffers(lat, lon).then(setHotels);
    }, [lat, lon]);

    if (hotels.length === 0) return null;

    return (
        <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-black flex items-center mb-4"><BedDouble size={16} className="mr-2"/> Hotels Near Venue</h4>
            <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
                {hotels.slice(0, 4).map(h => (
                    <div key={h.hotelId} className="min-w-[150px] p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <h5 className="font-bold text-xs truncate">{h.name}</h5>
                        <p className="text-[10px] text-gray-500 mt-1">From €{h.offers?.[0]?.price?.total || '120'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}