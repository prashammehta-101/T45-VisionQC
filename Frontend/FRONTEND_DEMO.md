# VisionQC frontend demo

The landing route renders the existing Hero unchanged, followed by the product story and interactive workflow. The `/inspection` route opens the same workflow directly. Demo state is shared across these routes for the current browser session.

## Run and check

```sh
npm install
npm run dev
npm run test
npm run lint
npm run build
```

Motion is the only new runtime dependency. Charts use accessible SVG/CSS and include a data table.

## Interactions

- Choose a product from **Manage Your Inspection Profiles**.
- Upload JPG, PNG, or WebP reference images (10 MB maximum per image). File acceptance means a readable image, not verified product quality.
- Adding samples invalidates that product's simulated normal profile. **Learn Normal** rebuilds it using simulated progress.
- Upload an inspection image, use a built-in illustrative sample, or open the camera. Camera access requires HTTPS or localhost and browser permission; the stream stops when its dialog closes.
- Choose **Pass example** or **Anomaly example**, then run the demo inspection.
- A completed inspection adds a record to history and updates the analytics. Original, heatmap, and overlay views are available.
- Result-state preview buttons do not change the saved history record. Selecting a history record restores its logged result.
- The guided demo is an independent educational replay.
- Uploads and new records are held in memory, not uploaded to a server or persisted across reloads.

## Source map

- `src/pages/VisionExperience.tsx`: landing/workspace composition.
- `src/components/experience/`: reusable sections, controls, charts, camera, and guided demo.
- `src/hooks/useVisionDemo.ts`: shared workflow, timers, product state, and object URL cleanup.
- `src/data/demoData.ts`: example products, records, metrics, and narrative data.
- `src/lib/demoLogic.ts`: filtering, metrics, and upload validation.
- `src/styles/experience.css`: styles scoped to `.vqc-root`, including stacked mobile panels, table cards, and reduced motion.
- `public/demo/`: lightweight original SVG product illustrations and corresponding review examples.
- `tests/demo.test.mjs`: dependency-free Node tests, TypeScript transpilation, workflow harness, and React server-render checks.

## Protected hero

The following files were preserved byte-for-byte during this implementation:

- `src/components/Hero.tsx`
- `src/components/HeroSequence.tsx`
- `src/components/Navigation.tsx`
- `src/index.css`

No hero DOM, animation, CSS, frame, or navigation changes were made.

## Verification and limits

TypeScript, ESLint, production build, and nine automated tests pass. The tests exercise filtering, analytics consistency, input validation, product-specific uploads, simulated training/inspection, cleanup, route rendering without React warnings, section order, anchors, assets, and CSS isolation.

An interactive browser was unavailable in the implementation session. Desktop/mobile screenshots, measured horizontal overflow, real camera permission behavior, and browser-console verification remain manual checks. Responsive rules and reduced-motion behavior are implemented, but server rendering is not a substitute for these visual checks.

All training, anomaly maps, scores, and confidence values are simulated. They are not measured model outputs, including when a user supplies an image. Backend integration, persistent storage, configurable retention, and calibrated model performance are outside this frontend demo.
