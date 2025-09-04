import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen min-w-full bg-gradient-to-b from-[#2B2832] to-[#201D24] flex flex-col items-center justify-center text-white">
      {/* Animated Book Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-32 bg-gradient-to-br from-white/20 to-white/10 rounded-lg border border-white/30 backdrop-blur-sm shadow-2xl">
          {/* Book Cover */}
          <div className="w-full h-full bg-gradient-to-br from-blue-400/40 to-purple-600/40 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse transform -skew-x-12 animate-shimmer"></div>
            
            {/* Book lines */}
            <div className="flex flex-col items-center space-y-1 z-10">
              <div className="w-12 h-1 bg-white/60 rounded animate-pulse"></div>
              <div className="w-8 h-1 bg-white/40 rounded animate-pulse delay-100"></div>
              <div className="w-10 h-1 bg-white/50 rounded animate-pulse delay-200"></div>
            </div>
          </div>
          
          {/* Book spine */}
          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-white/30 to-white/10 rounded-l-lg"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-4 -left-4 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute -top-2 -right-2 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce delay-500"></div>
        <div className="absolute -bottom-2 -left-2 w-1 h-1 bg-white/60 rounded-full animate-bounce delay-700"></div>
      </div>

      {/* Loading Text with Typewriter Effect */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 animate-pulse">Loading Book Details</h2>
        <div className="flex items-center justify-center space-x-1">
          <span className="text-lg text-white/80">Please wait</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
        <div className="h-full bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-pulse transform origin-left animate-progress"></div>
      </div>

      {/* Loading Steps */}
      <div className="mt-8 text-center text-sm text-white/60">
        <div className="animate-fade-in-out">Fetching book information...</div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(0.9); }
        }
        
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;