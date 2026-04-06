import React, { useEffect, useState } from 'react';
import { fetchRelatedArtists } from '../services/spotifyApi';

export default function RelatedArtists({ baseArtist }) {
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (baseArtist) fetchRelatedArtists(baseArtist).then(res => setRelated(res.slice(0, 5)));
    }, [baseArtist]);

    if (related.length === 0) return null;

    return (
        <div className="w-full bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mt-8">
            <h3 className="text-lg font-black mb-4 text-[#1a1a1a]">Fans of {baseArtist} also love</h3>
            <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
                {related.map(artist => (
                    <div key={artist.id} className="flex flex-col items-center min-w-[80px]">
                        <img src={artist.images[0]?.url} alt={artist.name} className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200 shadow-sm" />
                        <span className="text-[11px] font-bold text-center line-clamp-1">{artist.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}