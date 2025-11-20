# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: (Optional) Setup Gemini API Key

1. Get your free API key from: https://makersuite.google.com/app/apikey
2. Create a `.env` file in the root directory
3. Add: `GEMINI_API_KEY=your_api_key_here`

**Note**: The app works without the API key using fallback responses!

## Step 3: Run Development Server

```bash
npm run dev
```

## Step 4: Open Browser

Navigate to: http://localhost:3000

---

## 🎮 First Steps

1. **Explore the Solar System**: Use your mouse to drag and zoom
2. **Click a Planet**: Focus camera and view detailed information
3. **Press L**: Toggle the Layers panel to customize your view
4. **Press I**: Check astronomical events and alerts
5. **Click Chat Icon**: Ask Cosmos AI anything about space
6. **Adjust Time**: Use the time control to speed up orbits

---

## ⌨️ Essential Shortcuts

- `L` - Layers Panel
- `I` - Alerts Panel
- `P` - Planet Info Panel
- `F` - Fullscreen
- `?` - Help & Shortcuts
- `Esc` - Deselect / Close

---

## 🐛 Troubleshooting

### Black screen or loading forever?

- Check browser console for errors
- Ensure all dependencies are installed: `npm install`
- Try clearing browser cache

### 3D scene not rendering?

- WebGL must be enabled in your browser
- Try a different browser (Chrome/Firefox recommended)

### Chat not working?

- Chat works with fallback responses even without API key
- To enable Gemini AI, add `GEMINI_API_KEY` to `.env`

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🎨 Want to Customize?

**Change planet textures**: Replace images in `public/textures/`

**Modify planet data**: Edit `src/data/planetData.ts`

**Add new events**: Update `src/data/events.ts`

**Customize colors**: Edit Tailwind classes in components

---

## 🌟 Enjoy Exploring the Cosmos!

For detailed documentation, see the full README.md
