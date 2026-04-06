import React from 'react';

export default function Dashboard() {
  // Matching screenshot 10 (Profile Layout)
  const menuItems = ['Profile', 'My Orders', 'My Listings', 'My Sales', 'Payments', 'Settings', 'Wallet'];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in flex flex-col md:flex-row gap-8">
      {/* Sidebar Profile */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="flex flex-col items-center mb-8 border-b pb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-800 mb-4">TF</div>
          <h2 className="font-bold text-center">testsfsf<br/>fsggsggs</h2>
        </div>
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item} className={`p-3 cursor-pointer ${item === 'Profile' ? 'bg-parbetGreen text-white font-bold' : 'text-gray-700 hover:bg-gray-100'}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-extrabold mb-6">Profile</h1>
        
        <div className="border border-gray-200 bg-white rounded shadow-sm relative">
           <div className="absolute right-0 top-0 bg-parbetGreen text-white text-xs font-bold py-1 px-3 rounded-bl shadow" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>Feedback</div>
           <div className="p-6 border-b border-gray-100">
             <h3 className="font-bold mb-4">Orders</h3>
             <p className="text-sm text-gray-600 mb-6">You don't have any upcoming events scheduled right now</p>
             <button className="text-blue-600 text-sm hover:underline w-full text-center">View all orders</button>
           </div>
        </div>

        <div className="border border-gray-200 bg-white rounded shadow-sm">
           <div className="p-6 border-b border-gray-100">
             <h3 className="font-bold mb-4">Listings</h3>
             <p className="text-sm text-gray-600 mb-6">You don't have any listings right now</p>
             <button className="text-blue-600 text-sm hover:underline w-full text-center">View all listings</button>
           </div>
        </div>
        
        <div className="border border-gray-200 bg-white rounded shadow-sm">
           <div className="p-6">
             <h3 className="font-bold">Sales</h3>
           </div>
        </div>
      </div>
    </div>
  );
}