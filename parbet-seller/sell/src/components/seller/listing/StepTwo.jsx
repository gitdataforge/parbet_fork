import React from 'react';

export default function StepTwo({ data, onChange }) {
  // Logic & UI for step 2: Pricing Strategy
  return (
    <div className="animate-slide-up max-w-2xl space-y-10">
      
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Enter your price</h3>
        
        {/* Pricing Strategies */}
        <div className="space-y-3">
          {[
            { id: 'Quick', title: 'Quick sell strategy', desc: 'Price for strong visibility to attract buyers quickly', price: '$30' },
            { id: 'Balanced', title: 'Balanced strategy', desc: 'Get good visibility and a strong payout', price: '$40', badge: 'Most popular' },
            { id: 'Max', title: 'Max earnings strategy', desc: 'List higher to earn more - but it may take longer to sell', price: '$51' }
          ].map(s => (
            <div 
              key={s.id}
              onClick={() => onChange('strategy', s.id)}
              className={`border rounded-xl p-5 cursor-pointer flex justify-between items-center transition-all ${data.strategy === s.id ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-black bg-white'}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{s.title}</span>
                  {s.badge && <span className="bg-gray-200 text-xs font-bold px-2 py-1 rounded">{s.badge}</span>}
                </div>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{s.price}</div>
                <div className="text-xs text-gray-500">per ticket</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Calculation */}
      <div className="border-t pt-8 space-y-4">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
           <div>
             <p className="font-bold">Price buyers see: $50 per ticket</p>
             <p className="text-xs text-gray-500">Use this when comparing to other tickets on the event page</p>
           </div>
           <div className="text-right">
             <p className="text-xs text-gray-500">If all of your tickets sell, you'll earn</p>
             <p className="font-extrabold text-parbetGreen text-xl">US$ 71.36</p>
           </div>
        </div>
      </div>

      <div className="border-t pt-8 space-y-4">
        <h3 className="font-bold text-lg">What is the face value?</h3>
        <div className="flex gap-4 items-center">
           <span className="font-semibold">Face value</span>
           <div className="relative flex-1 max-w-[200px]">
             <span className="absolute left-3 top-3 font-semibold text-gray-500">US$</span>
             <input type="number" className="w-full border p-3 pl-12 rounded-lg outline-none focus:border-black" value={data.faceValue} onChange={e=>onChange('faceValue', e.target.value)} />
           </div>
        </div>
      </div>

      {/* Card on file / Fan Protect Guarantee */}
      <div className="border-t pt-8 space-y-4">
        <h3 className="font-bold text-lg">Credit or debit card</h3>
        <p className="text-sm text-gray-600">To provide our Fan Protect Guarantee, all sellers are required to have a valid credit or debit card on file.</p>
        <button className="text-blue-600 font-semibold text-sm hover:underline">+ Add card on file</button>
      </div>

      <div className="border-t pt-8 pb-12 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
           <input type="checkbox" className="mt-1 w-5 h-5 accent-black" checked={data.termsAgreed} onChange={e=>onChange('termsAgreed', e.target.checked)} />
           <span className="text-sm text-gray-700">I agree to parbet's Terms and Conditions. I confirm I own these tickets or have the right to be issued these tickets. If you are unable to deliver the correct tickets, parbet reserves the right to charge you the cost of replacing the tickets for your buyer.</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
           <input type="checkbox" className="mt-1 w-5 h-5 accent-black" />
           <span className="text-sm text-gray-700">Allow parbet to provide this information to the buyer if deemed necessary to fulfil my order</span>
        </label>
      </div>

    </div>
  );
}