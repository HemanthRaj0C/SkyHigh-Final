'use client';

import dynamic from 'next/dynamic';
import ResetViewButton from '@/components/ResetViewButton';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import PlanetInfoPanel from '@/components/PlanetInfoPanel';
import ChatWidget from '@/components/ChatWidget';
import TimeControls from '@/components/TimeControls';
import HelpPanel from '@/components/HelpPanel';
import ApodButton from '@/components/ApodButton';
import ControlPanel from '@/components/ControlPanel';

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
      {/* <TimeControls /> */}

      {/* Help Panel - Top Right */}
      <HelpPanel />

      {/* APOD Button - Top Center */}
      <ApodButton />

      {/* Control Panel - Bottom Right (Layers, Info, Zoom, Fullscreen) */}
      <ControlPanel />
    </main>
  );
}
