import React from 'react';

export default function PriceHeatmap() {
    // Logic: Simulating historical variance based on Day of Week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const intensities = [2, 1, 0, 3, 5, 5, 4]; // 0 = lowest price, 5 = highest

    const getColor = (val) => {
        const colors = ['#E6F2D9', '#C5E1A5', '#8bc53f', '#4a7228', '#114C2A', '#044d22'];
        return colors[val];
    };

    return (
        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Historical Pricing Trends</h4>
            <div className="flex justify-between space-x-1">
                {days.map((day, i) => (
                    <div key={day} className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-md mb-2 transition-all hover:scale-110" style={{ backgroundColor: getColor(intensities[i]) }} />
                        <span className="text-[10px] font-bold text-gray-500">{day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}