import React, { useEffect, useState } from 'react';
import { getDriveTime } from '../services/travelApi';
import { Car } from 'lucide-react';
import { useAppStore } from '../store/useStore';

export default function DriveTime({ venueLon, venueLat }) {
    const { strictLocation } = useAppStore();
    const [minutes, setMinutes] = useState(null);

    useEffect(() => {
        if (strictLocation.lon && venueLon) {
            getDriveTime(strictLocation.lon, strictLocation.lat, venueLon, venueLat).then(setMinutes);
        }
    }, [strictLocation, venueLon, venueLat]);

    if (!minutes) return null;

    return (
        <div className="flex items-center text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full w-max">
            <Car size={14} className="mr-2 text-[#458731]" />
            {minutes} mins drive from your location
        </div>
    );
}