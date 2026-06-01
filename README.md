# AR Money Visualizer

A Progressive Web App (PWA) built with Vite, Three.js, and Tailwind CSS to calculate and visualize large physical volumes of cash (Hungarian Forint) in Augmented Reality (WebXR).

## Features
- **PWA Ready**: Installable on Android Chrome with offline capabilities.
- **WebXR Immersive AR**: Place virtual pallets of money on your floor.
- **Calculator Engine**: Translates arbitrary HUF amounts into physical pallet dimensions based on 20,000 HUF bill sizes.
- **Mobile First**: Clean Tailwind UI in Hungarian.

## Tech Stack
- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## Setup & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the local address in a WebXR-compatible browser (e.g. Chrome on Android) or use the WebXR API emulator extension in desktop Chrome.

## Deployment

The project is configured to automatically deploy to GitHub Pages via GitHub Actions.
Any push to the `main` branch will trigger the build and deploy workflow.

Note: The `base` path in `vite.config.ts` is set to `/AR_Money/`. If your repository is named differently, please update the base path.
