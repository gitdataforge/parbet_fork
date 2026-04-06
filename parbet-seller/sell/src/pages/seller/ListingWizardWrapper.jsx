import React, { useState } from 'react';
import StepOne from '../../components/seller/listing/StepOne';
import StepTwo from '../../components/seller/listing/StepTwo';
import ExitDraftModal from '../../components/seller/listing/ExitDraftModal';
import { useNavigate } from 'react-router-dom';

export default function ListingWizardWrapper() {
  const [step, setStep] = useState(1);
  const [showExit, setShowExit] = useState(false);
  const nav = useNavigate();
  
  // Real State matching all strict fields requested
  const [listingData, setListingData] = useState({
    quantity: 'Ticket quantity', section: 'Section', row: '', firstSeat: '', lastSeat: '',
    missingReason: '', disclosures: [], ticketType: '', aboutSeller: '', ukTraderStatus: '',
    strategy: 'Balanced', faceValue: '', currency: 'US$', payoutMethod: '', termsAgreed: false
  });

  const handleChange = (field, value) => setListingData(prev => ({ ...prev, [field]: value }));

  const handleSaveAndExit = () => {
    // Real logic to save draft to Firestore would go here via the useInventory hook
    nav('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header bar matching screenshot 6,7,8 */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Step {step} of 2</p>
            <h1 className="text-3xl font-extrabold text-gray-900">
               {step === 1 ? 'Enter seat details' : 'Set your price and payout'}
            </h1>
          </div>
          <button onClick={() => setShowExit(true)} className="border border-gray-300 rounded-lg px-6 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Exit
          </button>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 w-full"><div className={`h-full bg-parbetGreen transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`} /></div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 pt-8">
        {step === 1 ? (
          <StepOne data={listingData} onChange={handleChange} />
        ) : (
          <StepTwo data={listingData} onChange={handleChange} />
        )}
      </div>

      {/* Floating Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto flex justify-end">
          <button 
            onClick={() => step === 1 ? setStep(2) : handleSaveAndExit()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            {step === 1 ? 'Continue' : 'Agree and Submit'}
          </button>
        </div>
      </div>

      {showExit && <ExitDraftModal onConfirm={handleSaveAndExit} onCancel={() => setShowExit(false)} />}
    </div>
  );
}