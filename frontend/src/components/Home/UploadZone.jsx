import React, { useRef } from 'react';

function UploadZone({ handleImageSelect, handleDetect, imagePreview, selectedImage, loading }) {
  const fileInputRef = useRef(null);

  const onZoneClick = (e) => {
    // Prevent the click from bubbling if they clicked the explicit button
    if (e) e.stopPropagation();
    
    if (!loading) {
      // Clear the input value so selecting the exact same file twice doesn't break React
      if (fileInputRef.current) fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Massive, Soft Dropzone */}
      <div 
        onClick={onZoneClick}
        className={`w-full max-w-3xl aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] overflow-hidden transition-all duration-300 flex flex-col items-center justify-center group relative ${
          imagePreview 
            ? 'bg-zinc-900 cursor-pointer border border-white/5 hover:border-white/20' 
            : 'bg-zinc-900/50 cursor-pointer border-2 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
        }`}
      >
        {imagePreview ? (
          <div className="relative w-full h-full p-3 sm:p-4 overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Selected subject" 
              /* CHANGED object-cover to object-contain HERE */
              className={`w-full h-full object-contain rounded-[1.5rem] transition-all duration-500 ${loading ? 'opacity-50 grayscale contrast-125' : 'opacity-100 group-hover:opacity-40'}`}
            />
            
            {/* Hover Overlay to clearly indicate it's clickable (Hidden during scan) */}
            {!loading && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                 <span className="bg-black/70 backdrop-blur-md text-white font-medium px-6 py-3 rounded-full text-sm border border-white/10 flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                   Click to swap image
                 </span>
              </div>
            )}

            {/* The Precision Scan Line (Only visible when loading) */}
            {loading && (
              <div className="absolute inset-x-4 inset-y-4 overflow-hidden rounded-[1.5rem] pointer-events-none z-20">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <p className="text-xl font-medium text-white mb-2">Select an image</p>
            <p className="text-zinc-500 text-sm max-w-xs">Supports high-resolution JPEG, PNG, WEBP, and HEIC files.</p>
          </div>
        )}
      </div>

      {/* Minimalist Action Controls */}
      <div className="w-full max-w-3xl flex justify-between items-center mt-6 px-2">
        {selectedImage && !loading ? (
           <button 
             onClick={onZoneClick}
             className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             Replace Image
           </button>
        ) : <div />}

        <button
          onClick={handleDetect}
          disabled={!selectedImage || loading}
          className={`px-8 py-3.5 rounded-full font-medium text-sm transition-all duration-300 ${
            !selectedImage || loading
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
          }`}
        >
          {loading ? 'Scanning...' : 'Run Analysis'}
        </button>
      </div>

      {/* Embedded Animation CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}

export default UploadZone;