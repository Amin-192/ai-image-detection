import React from 'react';

export default function DeleteModal({ isOpen, onClose, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md fade-in">
      {/* The Modal Card */}
      <div className="bg-[#0f1115] border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl slide-up">
        
        <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">Delete Record</h3>
        
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          This action is permanent. The source image, heatmap analysis, and confidence data will be wiped from our servers immediately.
        </p>
        
        <div className="flex justify-end gap-3 border-t border-zinc-800/50 pt-6">
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Deleting...
              </>
            ) : 'Confirm Deletion'}
          </button>
        </div>

      </div>
    </div>
  );
}