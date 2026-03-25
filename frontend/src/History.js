import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from './supabase';   
import DeleteModal from './components/history/DeleteModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export default function History({ history, setHistory, historyLoading }) {
  const [filter, setFilter] = useState('all');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter logic
  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.classification.toLowerCase() === filter;
  });

  // Open the custom modal
  const openDeleteModal = (detectionId) => {
    setItemToDelete(detectionId);
    setModalOpen(true);
  };

  // Handle the actual API call
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.delete(`${API_URL}/history/${itemToDelete}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      // Remove from UI immediately
      setHistory(prev => prev.filter(item => item.detection_id !== itemToDelete));
      setModalOpen(false);
    } catch (err) {
      alert('Failed to delete history item.');
      console.error(err);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  if (historyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full fade-in">
        <svg className="animate-spin h-6 w-6 text-zinc-400 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Retrieving Archive</p>
      </div>
    );
  }

  return (
    <>
      {/* Our Custom Premium Modal */}
      <DeleteModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
        isDeleting={isDeleting} 
      />

      <div className="fade-in w-full min-h-[calc(100vh-80px)] px-4 md:px-8 lg:px-12 xl:px-16 py-8 flex flex-col">
        
        {/* Sticky-ish Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 border-b border-zinc-800/80 pb-6 w-full">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">Analysis Archive</h2>
            <p className="text-zinc-400 font-light text-base">Review, filter, and manage your historical pixel analyses.</p>
          </div>
          
          {/* Apple-style Segmented Control */}
          <div className="flex bg-[#0a0c10] p-1 rounded-xl border border-zinc-800/80 self-start lg:self-auto shadow-inner">
            {['all', 'real', 'fake'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 md:px-8 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === f 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f === 'all' ? 'All Records' : f === 'real' ? 'Authentic' : 'Synthetic'}
              </button>
            ))}
          </div>
        </div>

        {/* Expansive Empty State */}
        {(!history || history.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0c10]/50 border border-dashed border-zinc-800 rounded-3xl m-2 min-h-[50vh]">
            <svg className="w-12 h-12 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <h2 className="text-lg font-medium text-zinc-300 mb-1">No records found</h2>
            <p className="text-zinc-500 text-sm">Your analysis archive is currently empty.</p>
          </div>
        ) : (
          /* MASSIVE FLUID GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 md:gap-6 pb-12 w-full">
            {filteredHistory.map((item) => {
              const isReal = item.classification === 'Real';
              const dateStr = new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const conf = (item.confidence_score * 100).toFixed(1);
              
              return (
                <div key={item.detection_id} className="flex flex-col bg-[#0f1115] rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-zinc-500 transition-colors duration-300 shadow-lg">
                  
                  {/* Image Area */}
                  <div className="relative aspect-[4/3] bg-black overflow-hidden border-b border-zinc-800/80 group cursor-crosshair">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt="Scan" 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:opacity-100 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                    )}
                    <div className={`absolute top-3 left-3 px-3 py-1 backdrop-blur-md bg-black/60 border ${isReal ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'} rounded-full font-mono text-[10px] uppercase tracking-widest`}>
                      {item.classification}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Confidence</span>
                          <div className="text-2xl font-light tracking-tight text-white leading-none">{conf}<span className="text-sm text-zinc-500">%</span></div>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{dateStr}</span>
                      </div>

                      <div className="flex gap-[2px] h-1.5 w-full">
                        {[...Array(10)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-sm ${i < Math.round(conf/10) ? (isReal ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-zinc-800'}`}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Action Row - Triggers custom modal instead of window.confirm */}
                    <div className="mt-5 pt-3 border-t border-zinc-800/50 flex justify-between items-center">
                      <span className="font-mono text-[10px] text-zinc-600 tracking-wider">REF:{item.detection_id.split('-')[0]}</span>
                      
                      <button 
                        onClick={() => openDeleteModal(item.detection_id)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1.5 -mr-1.5 rounded hover:bg-rose-500/10 active:scale-95 flex items-center justify-center"
                        title="Delete Record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}