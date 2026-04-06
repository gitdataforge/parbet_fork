import React from 'react';

export default function StepOne({ data, onChange }) {
  // UI perfectly matching screenshots 6, 7, and 8
  return (
    <div className="animate-slide-up flex flex-col md:flex-row gap-8">
      {/* Left Column: Forms */}
      <div className="flex-1 space-y-10">
        
        {/* Perks Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">Perks of selling on parbet</h3>
          <p className="text-sm flex items-start gap-2"><span className="text-teal-500">👤</span> <span><span className="text-teal-500 font-semibold">You do not need to have received your tickets yet</span> in order to sell them on parbet</span></p>
          <p className="text-sm flex items-start gap-2"><span className="text-teal-500">👤</span> <span><span className="text-teal-500 font-semibold">Always free to list your tickets for sale on parbet</span> unlike other sites</span></p>
        </div>

        {/* Seat Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Seat information</h3>
          <div className="space-y-4">
            <select className="w-full border border-gray-300 rounded-lg p-4 outline-none focus:border-black appearance-none bg-white" value={data.quantity} onChange={e=>onChange('quantity', e.target.value)}>
              <option>Ticket quantity</option>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select className="w-full border border-gray-300 rounded-lg p-4 outline-none focus:border-black appearance-none bg-white" value={data.section} onChange={e=>onChange('section', e.target.value)}>
              <option>Section</option>
              <option value="VIP">VIP</option>
              <option value="General">General Admission</option>
            </select>
            <input type="text" placeholder="Row" className="w-full border border-gray-300 rounded-lg p-4 outline-none focus:border-black" value={data.row} onChange={e=>onChange('row', e.target.value)} />
            <div className="flex gap-4">
              <input type="text" placeholder="First seat" className="w-1/2 border border-gray-300 rounded-lg p-4 outline-none focus:border-black" value={data.firstSeat} onChange={e=>onChange('firstSeat', e.target.value)} />
              <input type="text" placeholder="Last seat" className="w-1/2 border border-gray-300 rounded-lg p-4 outline-none focus:border-black" value={data.lastSeat} onChange={e=>onChange('lastSeat', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Missing Info Rules */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">If you are unable to provide seating information please select a reason why:</h3>
          <p className="text-sm text-gray-500">You are required to provide section, row and seat information if this information is available to you at the time of listing. If you do not have all of this information at present, you may list your tickets, but you must update your listing once you have this information. Listings can be updated using My Account.</p>
          <div className="space-y-3">
             <label className="flex items-center gap-3 cursor-pointer">
               <input type="radio" name="missing" value="Primary site" onChange={e=>onChange('missingReason', e.target.value)} className="w-5 h-5 accent-black" />
               <span>The primary site has not provided me with this information</span>
             </label>
             <label className="flex items-center gap-3 cursor-pointer">
               <input type="radio" name="missing" value="Other" onChange={e=>onChange('missingReason', e.target.value)} className="w-5 h-5 accent-black" />
               <span>Other</span>
             </label>
          </div>
        </div>

        {/* Disclosures */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Additional details</h3>
          <p className="text-gray-600">Do your seats have any features or restrictions?</p>
          <div className="bg-gray-50 p-5 rounded-xl space-y-4">
            <h4 className="font-bold text-blue-800 flex items-center gap-2"><span>!</span> Ticket disclosures to know before you sell</h4>
            <p className="text-sm text-gray-600">If any of the options below apply to your tickets, select all that apply. If your tickets have a disclosure not listed here, stop and <a href="#" className="text-blue-600 hover:underline">contact us</a>. If none apply, select No disclosures to continue.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {['No disclosures', 'Resale not allowed', 'Paperless Tickets', 'Ticket and meal package', 'Aisle seat', 'Actual 4th row of section', '+ Add more'].map(d => (
              <button 
                key={d} 
                onClick={() => {
                  const arr = data.disclosures.includes(d) ? data.disclosures.filter(x => x !== d) : [...data.disclosures, d];
                  onChange('disclosures', arr);
                }}
                className={`border rounded-full px-4 py-2 text-sm transition-colors ${data.disclosures.includes(d) ? 'border-black bg-gray-100 font-semibold' : 'border-gray-300 hover:border-black bg-white'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Type */}
        <div className="space-y-4 border-t pt-8">
          <h3 className="font-bold text-lg">Ticket type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={()=>onChange('ticketType', 'Paper')} className={`border rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors ${data.ticketType === 'Paper' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-black bg-white'}`}>
              <div className="w-6 h-8 bg-black rounded-sm relative"><div className="absolute top-1/2 left-0 w-full h-px bg-white border-t border-dashed"></div></div>
              <span className="font-semibold text-sm">Paper Tickets</span>
            </button>
            <button onClick={()=>onChange('ticketType', 'E')} className={`border rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors ${data.ticketType === 'E' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-black bg-white'}`}>
              <div className="w-6 h-8 border-2 border-black rounded relative"><div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold">PDF</div></div>
              <span className="font-semibold text-sm">E-Tickets</span>
            </button>
          </div>
        </div>

        {/* About You - CRA 90(6) */}
        <div className="space-y-4 border-t pt-8">
          <h3 className="font-bold text-lg">About you</h3>
          <p className="text-sm text-gray-500">If you work for parbet, or are the organiser of this event, you are required by section 90(6) of the Consumer Rights Act to select it below:</p>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="about" value="Organiser" onChange={e=>onChange('aboutSeller', e.target.value)} className="mt-1 w-5 h-5 accent-black" />
              <div>
                <span className="block font-medium">Event organiser</span>
                <span className="text-sm text-gray-500 block mt-1">You are responsible for organising or managing the event, or receive some or all of the revenue from the event, or a person who is acting on behalf of one of the above</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="about" value="Employed" onChange={e=>onChange('aboutSeller', e.target.value)} className="w-5 h-5 accent-black" />
              <span className="font-medium">Employed by parbet</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="about" value="Neither" onChange={e=>onChange('aboutSeller', e.target.value)} className="w-5 h-5 accent-black" />
              <span className="font-medium">Neither of these</span>
            </label>
          </div>
        </div>

        {/* UK/Europe Trading Rules */}
        <div className="space-y-4 border-t pt-8 pb-8">
          <h3 className="font-bold text-lg">Selling to people in the United Kingdom or Europe?</h3>
          <p className="text-sm text-gray-500">In order to sell to customer in the United Kingdom or Europe you must select if any of the below apply to you:</p>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="uk" value="Normal" onChange={e=>onChange('ukTraderStatus', e.target.value)} className="w-5 h-5 accent-black" />
              <span className="font-medium">Normal seller (I am not a trader)</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="uk" value="Trader" onChange={e=>onChange('ukTraderStatus', e.target.value)} className="mt-1 w-5 h-5 accent-black" />
              <div>
                <span className="block font-medium">Trader</span>
                <span className="text-sm text-gray-500 block mt-1">You sell tickets through a registered company, you are a sole trader, you have a VAT number or you pay people to sell tickets on your behalf; you regularly sell tickets with the intention of making profit (on parbet or elsewhere); or you are paid to sell tickets</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="uk" value="PreferNot" onChange={e=>onChange('ukTraderStatus', e.target.value)} className="mt-1 w-5 h-5 accent-black" />
              <div>
                <span className="block font-medium">I prefer not to provide this information</span>
                <span className="text-sm text-gray-500 block mt-1">Your listings will not be purchasable by buyers on parbet UK or any European parbet domain</span>
              </div>
            </label>
          </div>
        </div>

      </div>

      {/* Right Column: Sticky Event Summary matching screenshot */}
      <div className="w-full md:w-80 hidden md:block">
        <div className="sticky top-40 bg-white border border-gray-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] p-4 rounded-2xl">
          <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=600" alt="Stadium" className="w-full h-40 object-cover rounded-xl mb-4" />
          <h2 className="font-extrabold text-lg leading-tight mb-2">Kolkata Knight Riders vs Punjab Kings</h2>
          <p className="text-sm text-gray-500 mb-1">Eden Gardens · Kolkata, West Bengal, India</p>
          <p className="text-sm text-gray-500 mb-4">Mon, 06 Apr · 19:30</p>
          <span className="border border-gray-200 text-gray-800 text-xs font-bold py-1 px-3 rounded-md">Tomorrow</span>
        </div>
      </div>
    </div>
  );
}