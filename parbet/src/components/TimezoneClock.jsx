import React from 'react';
import { Clock } from 'lucide-react';

export default function TimezoneClock({ eventTime, venueTimezone = 'Asia/Kolkata' }) {
    // Logic: Calculates offset representation
    const userTime = new Date(eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
        <div className="flex items-center text-xs font-bold text-gray-500 mt-2">
            <Clock size={12} className="mr-1.5" />
            {userTime} Your Time
        </div>
    );
}