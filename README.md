# 🌌 SkyHigh - Cosmos Explorer

An interactive 3D solar system visualization with real-time astronomical data and AI-powered assistance. Explore planets, track space events, and learn about our cosmic neighborhood in stunning detail.

## ✨ Features

### 🪐 Interactive 3D Solar System

- Realistic planetary orbits and textures
- Click planets to focus and explore
- Smooth camera transitions and controls
- Asteroid belt, comets, and spacecraft visualization
- Toggleable layers (planets, orbits, satellites, labels, etc.)

### 📊 Planet Information Panel

- Detailed facts for each celestial body
- Composition and atmospheric data
- Notable features and characteristics
- Links to relevant NASA and space APIs
- High-quality planet imagery

### 🚨 Astronomical Events & Alerts

- Real-time space weather updates
- Meteor shower tracking
- Solar storms and eclipses
- ISS flyover predictions
- Planetary events and conjunctions

### 🤖 Cosmos AI Chatbot

- Powered by Google Gemini
- Ask questions about space and astronomy
- Calculate distances and travel times
- Get recommendations for exploration
- Context-aware responses based on current view

### ⏱️ Time Controls

- Pause, speed up, or slow down orbital animations
- Custom speed slider (0x to 100x)
- Real-time orbital mechanics visualization

### 🎨 Beautiful UI/UX

- Dark space-themed interface
- Glassmorphism design elements
- Smooth animations and transitions
- Responsive panels and controls
- Keyboard shortcuts for power users

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) Google Gemini API key for AI chatbot

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/HemanthRaj0C/SkyHigh-Final.git
   cd SkyHigh-Final
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (Optional)

   ```bash
   cp .env.example .env
   ```

   Add your Gemini API key to `.env`:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

   Get your API key from: https://makersuite.google.com/app/apikey

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⌨️ Keyboard Shortcuts

| Key   | Action                         |
| ----- | ------------------------------ |
| `L`   | Toggle Layers Panel            |
| `I`   | Toggle Alerts Panel            |
| `P`   | Toggle Planet Info Panel       |
| `F`   | Toggle Fullscreen              |
| `?`   | Toggle Help Panel              |
| `Esc` | Deselect Planet / Close Panels |

## 🎮 Controls

- **Mouse Drag**: Orbit camera around solar system
- **Mouse Scroll**: Zoom in/out
- **Click Planet**: Focus camera and view detailed information
- **Time Control**: Adjust orbital animation speed

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **3D Graphics**: React Three Fiber + Three.js
- **3D Helpers**: @react-three/drei
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Notifications**: React Hot Toast
- **AI**: Google Gemini API

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Gemini AI chatbot endpoint
│   │   ├── events/        # Astronomical events API
│   │   └── planet/[name]/ # Planet data API
│   ├── globals.css        # Global styles & animations
│   ├── layout.tsx         # Root layout with Toaster
│   └── page.tsx           # Main page component
├── components/
│   ├── AlertsPanel.tsx    # Events & alerts sidebar
│   ├── ChatWidget.tsx     # AI chatbot interface
│   ├── HelpPanel.tsx      # Help & shortcuts guide
│   ├── KeyboardShortcuts.tsx  # Keyboard event handler
│   ├── LayersPanel.tsx    # Layer visibility controls
│   ├── PlanetInfoPanel.tsx    # Detailed planet info
│   ├── ResetViewButton.tsx    # Camera reset button
│   ├── SolarSystemScene.tsx   # Main 3D scene
│   └── TimeControls.tsx   # Animation speed control
├── data/
│   ├── events.ts          # Mock event data
│   └── planetData.ts      # Comprehensive planet info
├── store/
│   └── useStore.ts        # Zustand global state
└── utils/
    └── toast.tsx          # Toast notification helpers
```

## 🌟 Key Components

### SolarSystemScene

The main 3D visualization using React Three Fiber. Renders:

- Sun with emissive lighting
- 8 planets with realistic textures
- Orbital paths
- Asteroid belt
- Comets and spacecraft
- Smooth camera following for selected bodies

### PlanetInfoPanel

Displays comprehensive information when a celestial body is selected:

- Quick facts (diameter, distance, temperature, etc.)
- Composition and atmosphere
- Notable features
- Available APIs and data sources

### ChatWidget

AI-powered assistant using Google Gemini:

- Natural language understanding
- Context-aware responses
- Suggested questions
- Fallback responses when API is unavailable

### TimeControls

Control orbital animation speed:

- Preset speeds (pause, real-time, 5x, 10x, 50x)
- Custom speed slider (0x to 100x)
- Visual feedback for current speed

## 🔌 API Endpoints

### `/api/planet/[name]`

Get detailed information about a specific celestial body.

**Example**: `/api/planet/mars`

**Response**:

```json
{
  "name": "mars",
  "displayName": "Mars",
  "quickFacts": { ... },
  "composition": { ... },
  "notableFeatures": [...],
  "apis": [...],
  "liveData": {
    "currentPosition": { "x": ..., "y": ..., "z": ... },
    "distanceFromEarth": "...",
    "visibility": "..."
  }
}
```

### `/api/events`

Get current and upcoming astronomical events.

**Response**:

```json
{
  "events": [
    {
      "id": "...",
      "type": "meteor_shower",
      "title": "...",
      "startDate": "...",
      "status": "upcoming",
      "countdown": "..."
    }
  ],
  "lastUpdated": "...",
  "sources": [...]
}
```

### `/api/chat`

Chat with Cosmos AI assistant.

**Request**:

```json
{
  "messages": [{ "role": "user", "content": "How far is Mars?" }],
  "selectedBody": "mars"
}
```

## 🎨 Customization

### Adding New Planets/Bodies

Edit `src/components/SolarSystemScene.tsx` and add to `planetsData` array:

```typescript
{
  name: 'pluto',
  size: 0.2,
  distance: 68,
  orbitSpeed: 0.0001,
  texture: '/textures/pluto.jpg',
  color: '#B8A48D'
}
```

### Modifying Layer Options

Edit `src/components/LayersPanel.tsx` to add/remove layer toggles.

### Customizing Themes

Modify colors in `src/app/globals.css` and component Tailwind classes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- NASA for planetary textures and data
- Google Gemini for AI capabilities
- Three.js and React Three Fiber communities
- All space enthusiasts and contributors

## 📧 Contact

Created by Hemanth Raj - [@HemanthRaj0C](https://github.com/HemanthRaj0C)

---

**⭐ If you found this project interesting, please consider giving it a star!**

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
