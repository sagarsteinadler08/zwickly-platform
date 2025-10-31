import React from 'react';

interface EQIGaugeChartProps {
  score: number;
  grade: string;
  trend: string;
}

export const EQIGaugeChart: React.FC<EQIGaugeChartProps> = ({ score, grade, trend }) => {
  // Calculate rotation for needle (0-180 degrees)
  const rotation = (score / 100) * 180;
  
  // Determine color based on score
  let color = 'text-red-400';
  let bgColor = 'from-red-500/20 to-red-600/10';
  if (score >= 85) {
    color = 'text-emerald-400';
    bgColor = 'from-emerald-500/20 to-emerald-600/10';
  } else if (score >= 70) {
    color = 'text-cyan-400';
    bgColor = 'from-cyan-500/20 to-cyan-600/10';
  } else if (score >= 60) {
    color = 'text-amber-400';
    bgColor = 'from-amber-500/20 to-amber-600/10';
  }

  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center">
      {/* Gauge Background */}
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Color segments */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-gradient-to-t from-red-500/30 to-transparent rounded-bl-full"></div>
          <div className="flex-1 bg-gradient-to-t from-amber-500/30 to-transparent"></div>
          <div className="flex-1 bg-gradient-to-t from-cyan-500/30 to-transparent"></div>
          <div className="flex-1 bg-gradient-to-t from-emerald-500/30 to-transparent rounded-br-full"></div>
        </div>
        
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom transition-transform duration-1000"
          style={{ 
            transform: `translateX(-50%) rotate(${rotation - 90}deg)`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
        </div>
        
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-2 border-white rounded-full"></div>
      </div>

      {/* Score Display */}
      <div className="mt-4 text-center">
        <div className={`text-4xl font-bold ${color}`}>{score.toFixed(1)}</div>
        <div className="text-sm text-slate-400">EQI Score</div>
        <div className="flex items-center gap-2 mt-2 justify-center">
          <span className={`text-lg font-semibold ${color}`}>Grade: {grade}</span>
          <span className="text-xs text-emerald-400">{trend}</span>
        </div>
      </div>
    </div>
  );
};

