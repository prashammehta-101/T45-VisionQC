# VisionQC

React + TypeScript + Vite + Tailwind CSS hero for an AI visual quality inspection product.

## Run locally

```sh
cd Frontend
npm install
npm run dev
```

Open the local URL printed by Vite. The hero is at `/`; the CTA opens `/inspection`.

```sh
npm run build
npm run lint
npm run preview
```

## Implementation

- `src/components/Hero.tsx`: hero, status, CTA, inspection visual, and illustrative overlays.
- `src/components/Navigation.tsx`: keyboard-accessible navigation with Escape and outside-click dismissal.
- `src/App.tsx`: routes and an explicitly labeled inspection workspace placeholder.
- `src/index.css`: reference-inspired composition, responsive styling, and reduced-motion support.
- `public/inspection-station.png`: generated industrial photography asset, served locally.

The hero uses illustrative readings; it does not request camera access or run inference. The inspection route is a placeholder for future model/camera integration.

Responsive styles cover desktop/tablet positioning and a stacked mobile layout at 700px and below. Browser visual checks at 1440, 1024, 768, and 390 pixels remain to be completed because no browser was available in the development session.

See `ASSET_NOTES.md` for image generation provenance and prompt.
