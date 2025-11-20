import { create } from 'zustand';

export type CelestialBody = 
  | 'sun' 
  | 'mercury' 
  | 'venus' 
  | 'earth' 
  | 'mars' 
  | 'jupiter' 
  | 'saturn' 
  | 'uranus' 
  | 'neptune'
  | 'moon'
  | 'ceres'
  | 'vesta'
  | 'pallas'
  | 'hygiea'
  | null;

interface LayersState {
  showUI: boolean;
  showPlanets: boolean;
  showAsteroids: boolean;
  showComets: boolean;
  showDwarfPlanets: boolean;
  showConstellations: boolean;
  showSpacecraft: boolean;
  showTrails: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  showIcons: boolean;
  showSatellites: boolean;
}

interface StoreState {
  // Selected celestial body
  selectedBody: CelestialBody;
  setSelectedBody: (body: CelestialBody) => void;

  // Layer visibility
  layers: LayersState;
  toggleLayer: (layer: keyof LayersState) => void;
  setLayer: (layer: keyof LayersState, value: boolean) => void;

  // Panel visibility
  showLayersPanel: boolean;
  showAlertsPanel: boolean;
  showInfoPanel: boolean;
  showChatWidget: boolean;
  toggleLayersPanel: () => void;
  toggleAlertsPanel: () => void;
  toggleInfoPanel: () => void;
  toggleChatWidget: () => void;

  // Time control
  timeSpeed: number; // 1 = real time, higher = faster
  setTimeSpeed: (speed: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Initial state
  selectedBody: null,
  setSelectedBody: (body) => set({ selectedBody: body }),

  // Initial layer state - everything visible
  layers: {
    showUI: true,
    showPlanets: true,
    showAsteroids: true,
    showComets: false,
    showDwarfPlanets: false,
    showConstellations: false,
    showSpacecraft: true,
    showTrails: false,
    showOrbits: true,
    showLabels: true,
    showIcons: true,
    showSatellites: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),
  setLayer: (layer, value) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: value,
      },
    })),

  // Initial panel visibility
  showLayersPanel: false,
  showAlertsPanel: false,
  showInfoPanel: false,
  showChatWidget: false,
  toggleLayersPanel: () => set((state) => ({ showLayersPanel: !state.showLayersPanel })),
  toggleAlertsPanel: () => set((state) => ({ showAlertsPanel: !state.showAlertsPanel })),
  toggleInfoPanel: () => set((state) => ({ showInfoPanel: !state.showInfoPanel })),
  toggleChatWidget: () => set((state) => ({ showChatWidget: !state.showChatWidget })),

  // Time control
  timeSpeed: 1,
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
}));
