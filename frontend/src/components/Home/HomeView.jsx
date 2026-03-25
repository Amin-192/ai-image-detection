import React from 'react';
import UploadZone from './UploadZone';
import DetectiveResult from './DetectiveResult';

function HomeView({
  handleImageSelect,
  handleDetect,
  imagePreview,
  selectedImage,
  result,
  metadata,
  loading,
  error
}) {
  return (
    <div className="relative min-h-[90vh] w-full flex flex-col items-center px-4 py-12 md:py-20 overflow-hidden">
      
      {/* Background Architectural Elements (Kills the empty void) */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden opacity-30">
        {/* Dotted Grid */}
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Faint floating UI elements to make it look technical */}
        <div className="absolute top-20 left-10 border border-white/10 rounded-lg p-3 bg-white/5 backdrop-blur-sm hidden lg:block">
          <p className="text-[10px] text-gray-500 font-mono">MODEL: RESNET-50</p>
          <p className="text-[10px] text-gray-500 font-mono">LAYERS: 50</p>
        </div>
        <div className="absolute bottom-40 right-10 border border-white/10 rounded-lg p-3 bg-white/5 backdrop-blur-sm hidden lg:block">
          <p className="text-[10px] text-gray-500 font-mono">STATUS: AWAITING INPUT</p>
          <p className="text-[10px] text-gray-500 font-mono">PIXEL_ANALYSIS: READY</p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        
        {/* High-End Typography Header */}
        <div className="text-center mb-12 w-full">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
            Authenticity, <span className="text-gray-500">Verified.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Upload any photograph. Our neural network analyzes pixel distribution and diffusion artifacts to instantly separate reality from AI synthesis.
          </p>
        </div>

        {/* Upload Zone Container */}
        <div className="w-full max-w-4xl bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-2 mb-8">
          <UploadZone
            handleImageSelect={handleImageSelect}
            handleDetect={handleDetect}
            imagePreview={imagePreview}
            selectedImage={selectedImage}
            loading={loading}
          />
        </div>

        {/* Clean Error State */}
        {error && (
          <div className="w-full max-w-2xl bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400 font-medium fade-in">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="w-full mt-4">
            <DetectiveResult
              result={result}
              metadata={metadata}
              imagePreview={imagePreview}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeView;