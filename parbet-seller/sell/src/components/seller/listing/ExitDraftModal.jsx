import React from 'react';

export default function ExitDraftModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-6">
        <h2 className="text-2xl font-bold">Save and Exit?</h2>
        <p className="text-gray-600">Your progress will be saved securely as a draft in your dashboard. You can resume listing at any time.</p>
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button onClick={onCancel} className="font-semibold text-gray-600 hover:text-black">Cancel</button>
          <button onClick={onConfirm} className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800">Save Draft</button>
        </div>
      </div>
    </div>
  );
}