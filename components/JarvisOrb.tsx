import React from 'react';

interface JarvisOrbProps {
  isActive: boolean;
  state: 'idle' | 'listening' | 'speaking' | 'processing' | 'error';
}

const JarvisOrb: React.FC<JarvisOrbProps> = ({ isActive, state }) => {
  const getOrbColor = () => {
    switch (state) {
      case 'error': return 'bg-red-500 shadow-red-500/50';
      case 'listening': return 'bg-cyan-400 shadow-cyan-400/80';
      case 'speaking': return 'bg-blue-400 shadow-blue-400/80';
      case 'processing': return 'bg-purple-500 shadow-purple-500/50';
      default: return 'bg-cyan-900 shadow-cyan-900/30';
    }
  };

  const getRingColor = () => {
    switch(state) {
        case 'error': return 'border-red-500';
        default: return 'border-cyan-500';
    }
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Rotating Ring */}
      <div className={`absolute w-full h-full rounded-full border border-dashed ${getRingColor()} opacity-30 animate-spin-slow`}></div>
      <div className={`absolute w-[90%] h-[90%] rounded-full border border-dotted ${getRingColor()} opacity-20 animate-spin-slow duration-[5s] reverse`}></div>
      
      {/* Core Glow */}
      <div 
        className={`w-32 h-32 rounded-full transition-all duration-500 ${getOrbColor()} shadow-[0_0_60px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10`}
      >
        <div className={`absolute w-full h-full rounded-full bg-white opacity-10 ${isActive ? 'animate-pulse-fast' : ''}`}></div>
        
        {/* Inner Tech Details */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border border-white/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
        </div>
      </div>

      {/* Waveforms (Decorative) */}
      {isActive && (
        <>
            <div className="absolute w-40 h-40 border border-cyan-400/40 rounded-full animate-ping delay-75"></div>
            <div className="absolute w-40 h-40 border border-cyan-400/20 rounded-full animate-ping delay-300"></div>
        </>
      )}
    </div>
  );
};

export default JarvisOrb;
