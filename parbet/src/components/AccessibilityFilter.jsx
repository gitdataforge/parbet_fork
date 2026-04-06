import React from 'react';
import { Accessibility } from 'lucide-react';

export default function AccessibilityFilter() {
    return (
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-xs shadow-sm hover:bg-blue-100 transition-colors w-max mt-4">
            <Accessibility size={14} /> <span>ADA Compliant Venues Only</span>
        </button>
    );
}