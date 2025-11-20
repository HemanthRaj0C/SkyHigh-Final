'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { showOnboarding } from '@/utils/toast';

export default function KeyboardShortcuts() {
  const { toggleLayersPanel, toggleAlertsPanel, toggleInfoPanel, setSelectedBody } = useStore();
  const [, setHelpOpen] = useState(false);

  useEffect(() => {
    // Show onboarding on mount (first visit only)
    showOnboarding();

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'l':
          toggleLayersPanel();
          break;
        case 'i':
          toggleAlertsPanel();
          break;
        case 'p':
          toggleInfoPanel();
          break;
        case 'f':
          // Toggle fullscreen
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        case '?':
          // Toggle help panel
          setHelpOpen((prev) => !prev);
          break;
        case 'escape':
          // Deselect planet
          setSelectedBody(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleLayersPanel, toggleAlertsPanel, toggleInfoPanel, setSelectedBody]);

  return null;
}
