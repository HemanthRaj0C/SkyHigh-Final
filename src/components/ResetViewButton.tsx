'use client';

import { useStore } from '@/store/useStore';

export default function ResetViewButton() {
  const { selectedBody, setSelectedBody } = useStore();
  
  if (!selectedBody) return null;
  
  const handleReset = () => {
    setSelectedBody(null);
  };
  
  return (
    <button
      onClick={handleReset}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-30 
                 bg-white/10 hover:bg-white/20 backdrop-blur-md 
                 text-white px-6 py-3 rounded-full 
                 border border-white/20 
                 transition-all duration-300 
                 shadow-lg hover:shadow-xl
                 flex items-center gap-2
                 font-medium"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M6 18L18 6M6 6l12 12" 
        />
      </svg>
      Reset View
    </button>
  );
}
