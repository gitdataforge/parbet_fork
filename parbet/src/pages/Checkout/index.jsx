import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Ticket } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { doc, getDoc, runTransaction, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const listingId = searchParams.get('listingId');
    const navigate = useNavigate();
    
    const { user, balance, isAuthenticated, openAuthModal } = useAppStore();
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) return openAuthModal();
        if (!listingId) return navigate('/');

        const fetchListing = async () => {
            try {
                const docRef = doc(db, 'listings', listingId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setListing({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Listing not found or has been removed.');
                }
            } catch (err) {
                setError('Failed to load secure checkout.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [listingId, isAuthenticated]);

    const handlePayment = async () => {
        if (!user) return openAuthModal();
        if (balance < listing.price) return setError('Insufficient wallet balance. Please add funds.');
        
        setIsProcessing(true);
        setError('');

        try {
            // Atomic Transaction to ensure security
            await runTransaction(db, async (transaction) => {
                const buyerRef = doc(db, 'users', user.uid);
                const sellerRef = doc(db, 'users', listing.sellerId);
                const listingRef = doc(db, 'listings', listingId);

                const buyerDoc = await transaction.get(buyerRef);
                const listingDoc = await transaction.get(listingRef);

                if (!buyerDoc.exists() || buyerDoc.data().balance < listing.price) throw new Error("Insufficient funds.");
                if (listingDoc.data().status !== 'active') throw new Error("This ticket was just sold to someone else.");

                // Deduct Buyer
                transaction.update(buyerRef, { balance: buyerDoc.data().balance - listing.price });
                
                // Credit Seller (or create if missing)
                const sellerDoc = await transaction.get(sellerRef);
                if (sellerDoc.exists()) transaction.update(sellerRef, { balance: sellerDoc.data().balance + listing.price });
                else transaction.set(sellerRef, { balance: listing.price });
                
                // Mark Sold
                transaction.update(listingRef, { status: 'sold' });

                // Create Order Receipt
                const orderRef = doc(collection(db, 'orders'));
                transaction.set(orderRef, {
                    listingId, eventId: listing.eventId, eventName: listing.eventName,
                    buyerId: user.uid, sellerId: listing.sellerId, price: listing.price,
                    createdAt: new Date().toISOString()
                });
            });

            // On success, redirect to dashboard to view ticket
            navigate('/dashboard');

        } catch (err) {
            console.error("Transaction failed:", err);
            setError(err.message || 'Transaction failed due to network error.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin"></div></div>;
    if (error && !listing) return <div className="min-h-screen p-10 font-bold text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto w-full animate-fade-in pt-6 pb-20">
            <div className="flex items-center space-x-2 mb-8 text-[#114C2A] font-bold">
                <ShieldCheck size={24} />
                <h1 className="text-2xl">Secure Checkout</h1>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm border border-red-200">{error}</div>}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Order Summary */}
                <div className="flex-1 bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-brand-text mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
                    <div className="flex items-start mb-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4"><Ticket className="text-gray-400"/></div>
                        <div>
                            <h3 className="font-bold text-lg text-brand-text">{listing.eventName}</h3>
                            <p className="text-sm text-brand-muted">{listing.eventDate} • {listing.eventLoc}</p>
                            <p className="text-sm font-bold text-brand-text mt-2 bg-gray-50 inline-block px-2 py-1 rounded">Section {listing.section} • Qty {listing.quantity}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                        <div className="flex justify-between text-brand-muted font-medium"><span>Ticket Price</span><span>₹{listing.price.toLocaleString()}</span></div>
                        <div className="flex justify-between text-brand-muted font-medium"><span>Service Fee</span><span>₹0.00</span></div>
                        <div className="flex justify-between text-xl font-black text-brand-text pt-3 border-t border-gray-100 mt-3"><span>Total</span><span>₹{listing.price.toLocaleString()}</span></div>
                    </div>
                </div>

                {/* Right: Payment */}
                <div className="w-full md:w-[350px]">
                    <div className="bg-[#114C2A] rounded-[20px] p-6 text-white shadow-lg mb-4">
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-medium text-white/80">Wallet Balance</span>
                            <WalletIcon />
                        </div>
                        <h2 className="text-3xl font-black mb-1">₹{balance.toLocaleString()}</h2>
                        {balance < listing.price && <p className="text-sm text-red-300 font-bold mt-2 bg-red-900/30 px-3 py-1 rounded-md inline-block">Insufficient Funds</p>}
                    </div>

                    <button 
                        onClick={handlePayment}
                        disabled={isProcessing || balance < listing.price}
                        className="w-full bg-[#212529] text-white font-bold py-4 rounded-xl hover:bg-black transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isProcessing ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Pay Now'}
                    </button>
                    <p className="text-xs text-center text-brand-muted font-medium mt-4 flex items-center justify-center">
                        <ShieldCheck size={14} className="mr-1"/> Processed securely via Smart Contract
                    </p>
                </div>
            </div>
        </div>
    );
}

function WalletIcon() {
    return <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}