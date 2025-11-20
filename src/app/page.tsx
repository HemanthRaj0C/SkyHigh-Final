'use client';

import dynamic from 'next/dynamic';
import ResetViewButton from '@/components/ResetViewButton';
import LayersPanel from '@/components/LayersPanel';
import AlertsPanel from '@/components/AlertsPanel';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';

const SolarSystemScene = dynamic(() => import('@/components/SolarSystemScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-white">
      <p>Loading Solar System...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      {/* Keyboard Shortcuts & Onboarding */}
      <KeyboardShortcuts />

      {/* 3D Canvas - will contain the solar system scene */}
      <div id="canvas-container" className="absolute inset-0 w-full h-full">
        <SolarSystemScene />
      </div>

      {/* Reset View Button - Top Center (shows when planet is selected) */}
      <ResetViewButton />

      {/* Layers Panel - Left Side */}
      <LayersPanel />

      {/* Alerts Panel - Right Side */}
      <AlertsPanel />

      {/* Planet Info Panel - Right Side */}
      <div className="absolute right-0 top-0 bottom-0 z-10">
        {/* Planet info panel will go here */}
      </div>

      {/* Chat Widget - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-20">
        {/* Chat widget will go here */}
      </div>

      {/* Controls & Info - Bottom */}
      <div className="absolute bottom-4 left-4 z-10 text-white/60 text-sm space-y-1">
        <p>Mouse: Orbit | Scroll: Zoom | Click: Select</p>
        <p>
          Keyboard: 
          <kbd className="px-1.5 py-0.5 ml-1 bg-white/10 rounded text-xs">L</kbd> Layers
          <kbd className="px-1.5 py-0.5 ml-2 bg-white/10 rounded text-xs">I</kbd> Alerts
        </p>
      </div>
    </main>
  );
}
