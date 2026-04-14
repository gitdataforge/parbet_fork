import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

/**
 * FEATURE: Administrative Perimeter Guard
 * This is a Higher-Order Component (HOC) that wraps protected routes.
 * It enforces the strict access policy: testcodecfg@gmail.com ONLY.
 */
export default function AdminGuard({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAdmin, loading, logout } = useAuthStore();

    useEffect(() => {
        // FEATURE: Real-Time Interception Logic
        if (!loading) {
            if (!user) {
                // Not logged in: Route to auth portal
                navigate('/login', { state: { from: location }, replace: true });
            } else if (!isAdmin) {
                // Logged in with wrong email: Trigger immediate session purge
                console.error("CRITICAL SECURITY: Unauthorized account detected. Evicting session.");
                logout().then(() => {
                    navigate('/login', { 
                        state: { error: 'Unauthorized Access: Access is restricted to admin@parbet.com' }, 
                        replace: true 
                    });
                });
            }
        }
    }, [user, isAdmin, loading, navigate, location, logout]);

    // SECTION 1: High-Fidelity Branding Loading State
    // Strictly matches the white-theme design from image_6188a6.png
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4">
                <div className="relative flex flex-col items-center">
                    {/* Animated Brand Spinner */}
                    <div className="w-12 h-12 border-4 border-[#f3f3f3] border-t-[#8cc63f] rounded-full animate-spin"></div>
                    
                    {/* Security Handshake Message */}
                    <div className="mt-6 text-center">
                        <p className="text-[#1a1a1a] font-bold text-[15px] tracking-tight">
                            Verifying Security Credentials
                        </p>
                        <p className="text-[#54626c] text-[13px] mt-1 font-medium">
                            Establishing encrypted connection...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // SECTION 2: Perimeter Clearance
    // Only renders the protected content if the identity is strictly confirmed
    return isAdmin ? <>{children}</> : null;
}