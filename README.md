# LineReport PWA (Prototype)

This is a ready-to-run prototype of the Line Report PWA.

## What's included
- React + Vite app
- PWA manifest and service worker (public/manifest.json, public/service-worker.js)
- icons generated from your uploaded image (public/icons/)
- Local storage per-user records
- Camera/gallery photo input
- Export to Excel using SheetJS (xlsx)
- Merge all users demo export

## How to run locally
1. Install Node.js (>=18) and npm
2. In project folder:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:5173 in your browser (use Safari on iPhone for PWA install)

## How to deploy to Vercel (quick)
1. Push this repository to GitHub
2. In Vercel, click "Add Project" and import the GitHub repo
3. Use default build settings (Framework: Vite). Vercel will auto-deploy.
4. Visit the Vercel URL (https) and open it in Safari on iPhone, then "Add to Home Screen"

## Note about images
Icons were generated from your uploaded file at:
/mnt/data/A_digital_photograph_of_an_iPhone_with_a_black_fro.png

Icons are in `public/icons/`:
- icon-192.png
- icon-512.png
- icon-1024.png

