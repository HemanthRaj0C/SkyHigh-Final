'use client';

import dynamic from 'next/dynamic';
import ResetViewButton from '@/components/ResetViewButton';
import LayersPanel from '@/components/LayersPanel';
import AlertsPanel from '@/components/AlertsPanel';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import PlanetInfoPanel from '@/components/PlanetInfoPanel';
import ChatWidget from '@/components/ChatWidget';
import TimeControls from '@/components/TimeControls';
import HelpPanel from '@/components/HelpPanel';
import ApodButton from '@/components/ApodButton';

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
      <PlanetInfoPanel />

      {/* Chat Widget - Bottom Right */}
      <ChatWidget />

      {/* Time Controls - Bottom Center */}
      <TimeControls />

      {/* Help Panel - Top Right */}
      <HelpPanel />

      {/* APOD Button - Top Center */}
      <ApodButton />

      {/* Controls & Info - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 text-white/60 text-sm space-y-1">
        <p>Mouse: Orbit | Scroll: Zoom | Click: Select</p>
        <p>
          Keyboard: 
          <kbd className="px-1.5 py-0.5 ml-1 bg-white/10 rounded text-xs">L</kbd> Layers
          <kbd className="px-1.5 py-0.5 ml-2 bg-white/10 rounded text-xs">I</kbd> Alerts
          <kbd className="px-1.5 py-0.5 ml-2 bg-white/10 rounded text-xs">P</kbd> Info
          <kbd className="px-1.5 py-0.5 ml-2 bg-white/10 rounded text-xs">?</kbd> Help
        </p>
      </div>
    </main>
  );
}
