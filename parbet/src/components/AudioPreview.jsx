import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Music } from 'lucide-react';
import { fetchArtistTopTrack } from '../services/spotifyApi';

export default function AudioPreview({ artistName }) {
    const [track, setTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (artistName) fetchArtistTopTrack(artistName).then(setTrack);
    }, [artistName]);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (!track?.preview_url) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (!track?.preview_url) return null;

    return (
        <div className="absolute top-3 left-3 z-20">
            <audio ref={audioRef} src={track.preview_url} onEnded={() => setIsPlaying(false)} />
            <button 
                onClick={togglePlay}
                className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
                {isPlaying ? <Pause size={16} fill="white" className="text-white"/> : <Play size={16} fill="white" className="text-white ml-1"/>}
            </button>
        </div>
    );
}