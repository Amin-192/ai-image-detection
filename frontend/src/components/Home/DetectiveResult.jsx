import React from 'react';

function DetectiveResult({ result, metadata, imagePreview }) {
  const isReal = result.classification === 'Real';
  const conf = (result.confidence * 100).toFixed(1);

  return (
    <div className="w-full mt-12 slide-up font-sans mb-20">
      
      {/* 1. The Verdict Header - Massive, clear, and instantly readable */}
      <div className={`border-l-4 pl-6 md:pl-8 py-2 ${isReal ? 'border-emerald-500' : 'border-rose-500'} bg-white/[0.02] border-y border-r border-white/5 p-6 md:p-10 rounded-r-2xl`}>
        <p className="font-mono text-sm md:text-base text-zinc-400 mb-3 tracking-widest uppercase">
          Final Verdict
        </p>
        <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 ${isReal ? 'text-emerald-400' : 'text-rose-500'}`}>
          {isReal ? 'Authentic Photo' : 'AI-Generated'}
        </h2>
        <p className="text-lg md:text-xl text-zinc-300 max-w-3xl leading-relaxed font-light">
          {isReal
            ? "Analysis confirms natural pixel distribution and sensor noise consistent with a physical camera. No generative anomalies detected."
            : "Structural inconsistencies and diffusion artifacts detected. High probability of algorithmic generation."}
        </p>
      </div>

      {/* 2. The Data Readouts - Clear groupings in flat, techy cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
        
        {/* Confidence Index */}
        <div className="bg-[#0f1115] border border-zinc-800 p-6 md:p-8 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="font-mono text-sm text-zinc-400 mb-2 uppercase tracking-wider">Confidence Index</p>
            <div className="text-4xl md:text-5xl font-bold text-white mb-6">
              {conf}<span className="text-2xl text-zinc-500 font-medium">%</span>
            </div>
          </div>
          
          {/* Segmented Bar - Techy but very easy to read */}
          <div className="space-y-2">
            <div className="flex gap-1 h-3 w-full">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm ${i < Math.round(conf/10) ? (isReal ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-zinc-800'}`}
                ></div>
              ))}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              <span>Uncertain</span>
              <span>Absolute</span>
            </div>
          </div>
        </div>

        {/* Raw Score */}
        <div className="bg-[#0f1115] border border-zinc-800 p-6 md:p-8 rounded-2xl flex flex-col justify-center">
          <p className="font-mono text-sm text-zinc-400 mb-2 uppercase tracking-wider">Raw Output Score</p>
          <div className="text-3xl font-medium text-zinc-200">
            {(result.raw_score).toFixed(4)}
          </div>
          <p className="mt-4 text-sm text-zinc-500 font-light">
            Base neural network activation value prior to binary classification threshold.
          </p>
        </div>

        {/* Architecture */}
        <div className="bg-[#0f1115] border border-zinc-800 p-6 md:p-8 rounded-2xl flex flex-col justify-center">
          <p className="font-mono text-sm text-zinc-400 mb-2 uppercase tracking-wider">Architecture</p>
          <div className="text-3xl font-medium text-zinc-200">
            ResNet-50
          </div>
          <p className="mt-4 text-sm text-zinc-500 font-light">
            50-layer Convolutional Neural Network processing 224x224 spatial dimensions.
          </p>
        </div>

      </div>

      {/* 3. The Visual Evidence - Side by side, distinctly labeled */}
      {metadata?.heatmap && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
          {/* Source Image */}
          <div className="bg-[#0f1115] border border-zinc-800 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="font-mono text-sm text-zinc-300 font-semibold tracking-wider uppercase">Source Input</span>
              <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">RGB</span>
            </div>
            <div className="rounded-xl overflow-hidden bg-black border border-zinc-800 relative group">
              {/* Grayscale effect with a clear helper badge */}
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-[10px] uppercase font-mono px-3 py-1 rounded-full opacity-100 group-hover:opacity-0 transition-opacity z-10">
                Hover to reveal color
              </div>
              <img 
                src={imagePreview} 
                alt="Source" 
                className="w-full aspect-video md:aspect-[4/3] object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
              />
            </div>
          </div>

          {/* Heatmap Image */}
          <div className="bg-[#0f1115] border border-zinc-800 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="font-mono text-sm text-zinc-300 font-semibold tracking-wider uppercase">Attention Map</span>
              <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                Grad-CAM
              </span>
            </div>
            <div className="rounded-xl overflow-hidden bg-black border border-zinc-800">
              <img 
                src={`data:image/png;base64,${metadata.heatmap}`} 
                alt="Heatmap" 
                className="w-full aspect-video md:aspect-[4/3] object-cover" 
              />
            </div>
          </div>

        </div>
      )}
      
    </div>
  );
}

export default DetectiveResult;