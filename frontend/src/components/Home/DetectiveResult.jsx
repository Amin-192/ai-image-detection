import React from 'react';

function DetectiveResult({ result, metadata, imagePreview }) {
  const isReal = result.classification === 'Real';

  return (
    <div className="mt-12 space-y-8 slide-up">
      {/* Case File Header */}
      <div className={`border-l-4 ${isReal ? 'border-status-real' : 'border-status-fake'} pl-6`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{isReal ? '✅' : '🚨'}</span>
          <h3 className="text-2xl font-bold">
            {isReal ? 'Authentic Image Detected' : 'AI-Generated Content Detected'}
          </h3>
        </div>
        <p className="text-gray-400">
          {isReal 
            ? 'Our analysis indicates this image contains authentic photographic elements.'
            : 'Our analysis has detected artificial patterns consistent with AI generation.'}
        </p>
      </div>

      {/* Confidence Meter */}
      <div className={`bg-dark-card border ${isReal ? 'border-status-real/30' : 'border-status-fake/30'} rounded-2xl p-8`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400 font-medium">Confidence Level</span>
          <span className="text-3xl font-bold">{(result.confidence * 100).toFixed(1)}%</span>
        </div>
        
        <div className="relative h-4 bg-dark-input rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 ${isReal ? 'bg-status-real' : 'bg-status-fake'} transition-all duration-1000 ease-out`}
            style={{ width: `${result.confidence * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Low Confidence</span>
          <span>High Confidence</span>
        </div>
      </div>

      {/* Heatmap Analysis */}
      {metadata?.heatmap && (
        <div className="bg-dark-card border border-white/5 rounded-2xl p-8">
          <div className="mb-6">
            <h4 className="text-xl font-bold mb-2">🔥 Heat Map Analysis</h4>
            <p className="text-gray-400 text-sm">
              Red areas show where our AI focused its attention during analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400 font-medium">Original Image</p>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img
                  src={imagePreview}
                  alt="Original"
                  className="w-full h-[300px] object-cover"
                />
              </div>
            </div>

            {/* Heatmap */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400 font-medium">Attention Heatmap</p>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img
                  src={`data:image/png;base64,${metadata.heatmap}`}
                  alt="Heatmap"
                  className="w-full h-[300px] object-cover"
                />
              </div>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="mt-6 p-4 bg-dark-input/50 rounded-xl">
            <p className="text-sm text-gray-400 mb-3 font-medium">Interpreting the Heatmap:</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span>High attention - Key decision areas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span>Moderate attention</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span>Low attention</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Summary */}
      <div className="bg-dark-card border border-white/5 rounded-2xl p-8">
        <h4 className="text-xl font-bold mb-4">📋 Analysis Summary</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Verdict</p>
            <p className={`text-lg font-bold ${isReal ? 'text-status-real' : 'text-status-fake'}`}>
              {result.classification}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Raw Score</p>
            <p className="text-lg font-bold">{(result.raw_score * 100).toFixed(2)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Model Version</p>
            <p className="text-lg font-bold">ResNet-50</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetectiveResult;