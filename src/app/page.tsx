'use client';

import dynamic from 'next/dynamic';
import ResetViewButton from '@/components/ResetViewButton';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import PlanetInfoPanel from '@/components/PlanetInfoPanel';
import ApodButton from '@/components/ApodButton';
import ControlPanel from '@/components/ControlPanel';
import TimeControls from '@/components/TimeControls';

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

      {/* Planet Info Panel - Right Side */}
      <PlanetInfoPanel />

      {/* Time Controls - Bottom Center */}
      <TimeControls />

      {/* APOD Button - Top Center */}
      <ApodButton />

      {/* Control Panel - Bottom Right (Layers, Info, Zoom, Fullscreen) */}
      <ControlPanel />
    </main>
  );
}
