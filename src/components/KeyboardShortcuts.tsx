'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { showOnboarding } from '@/utils/toast';

export default function KeyboardShortcuts() {
  const { toggleLayersPanel, toggleAlertsPanel } = useStore();

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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleLayersPanel, toggleAlertsPanel]);

  return null;
}
