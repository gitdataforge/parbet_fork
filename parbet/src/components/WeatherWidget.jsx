import React, { useEffect, useState } from 'react';
import { CloudRain, Sun, Cloud } from 'lucide-react';
import { fetchVenueWeather } from '../services/weatherApi';

export default function WeatherWidget({ lat, lon }) {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        if (lat && lon) {
            fetchVenueWeather(lat, lon).then(setWeather);
        }
    }, [lat, lon]);

    if (!weather) return null;

    const isRain = weather.weather?.[0]?.main === 'Rain';

    return (
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${isRain ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[#E6F2D9] text-[#458731] border-[#C5E1A5]'}`}>
            {isRain ? <CloudRain size={12} /> : <Sun size={12} />}
            <span>{isRain ? 'Rain Alert' : 'Clear Skies'} • {weather.main?.temp}°C</span>
        </div>
    );
}