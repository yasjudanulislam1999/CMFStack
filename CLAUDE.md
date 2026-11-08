# CMFStack 3D

CMFStack is a Colour/Material/Finish (CMF) decision tool for car interior design teams. `cmfstack-3d.html` is a single-file prototype that adds a 3D configurator. It extends the 2D demo in `dash9410/CMFStack_Demo`, which has fake data. Everything here is sample data, including the "Aurora EV" car, suppliers and costs.

## Repo map
- `index.html`: the original 2D demo (by dash9410).
- `cmfstack-3d.html`: the 3D configurator. It is vanilla JS with no build step, and the sections below describe it.
- `models/`: GLB files for the configurator. `honda-e.glb` is the optimised one that gets loaded.
- `landing/`: the marketing landing page. It is a separate Vite + React app (see "Landing page" below).
- `.claude/skills/` and `.claude/agents/`: project skills for design and testing (see "Skills" below).

## Stack
- Vanilla JS in one HTML file, no build step.
- Three.js r128 from cdnjs (UMD global `THREE`). `GLTFLoader` and `DRACOLoader` come from jsDelivr (`three@0.128.0/examples/js/`). The Draco decoder also loads from jsDelivr.
- It must be served over HTTP to load the GLB, for example `python3 -m http.server` in this folder. Opened as a file, it falls back to the procedural car.
- Fonts: Saira Semi Condensed, IBM Plex Sans, IBM Plex Mono (Google Fonts).
- Light and dark themes via CSS tokens on `:root`.

## Layout of the code
- **Page:** 3 columns (rail, 3D stage, panel). Stacks below 1000px.
- **Data:** `ZONES` (z1 to z5: seats, door panels, headliner, console, steering wheel), `MATS` (16 materials), `PRESETS` (3 combinations), `PAINTS` (5 exterior colours). `state` holds selection, current zone and view, and paint.
- **Detailed model:** `MODEL` (data section) points at `models/honda-e.glb`. `loadModel()` and `fitModel()` load it after the procedural scene is up, then hide the procedural car (`root`, `gShell`). Set `MODEL=null` to use only the procedural car.
  - `fitModel` removes the Sketchfab shadow and watermark planes, turns the bonnet (`Capo`) toward -z, scales cm to m, and centres the car on the ground using exact vertex bounds.
  - `zoneOf(name, material)` maps meshes to zones by Spanish node names and material names: seats are `Asiento*`/`Reposacabezas*` cloth, doors are `*Puerta*` cloth, the headliner is `RoofCloth`, the console is `InteriorWood`, and the wheel is `*CueroVolante*`. Zone meshes get world-space box UVs, so material `tile` still means metres.
  - `MODEL.paint` (`CarPaintWhite`) materials follow the paint swatch. `CarPaintBlack` (the roof and trims) stays black.
  - `VIEWS`/`ZVIEWS` are recomputed from the model's own landmarks (steering wheel, front and rear seats, door, wood trim).
  - The cutaway uses 4 clipping planes (`CLIP`) on every model material, set in `updateCam()`. They are off when orbiting far (d > 5) or sitting inside the cabin. A plane is switched off by a huge constant, so shaders never recompile. Raycast hits on clipped geometry are filtered out.
  - The model credit (CC BY 4.0) is written into `#credit`. It must stay visible.
  - To rebuild `models/honda-e.glb` from the 208 MB source, run `gltf-transform optimize SRC mid.glb --compress false --texture-compress webp --texture-size 2048 --instance false --palette false --join false --flatten false`, then `gltf-transform draco mid.glb models/honda-e.glb --quantize-normal 12 --quantize-position 16`. Keep instancing, join and palette off: r128 can't read GPU instancing, and zone mapping needs the node and material names. Use Draco, not meshopt: meshopt stores normals at 8 bits, which makes the clearcoat paint blotchy.
- **3D:** `init3D()` builds the whole scene.
  - Interior: cabin built from rounded boxes (`rbox`), registered per zone in `ZM[zone]`. `applySel(zoneId)` swaps the material on a zone's meshes.
  - Exterior: the `gShell` group holds a premium-SUV body (4.84 × 1.95 × 1.7 m, 2.9 m wheelbase), glass, wheels and lamps. It is modelled with the ground at y=0 and lowered by `LIFT` (0.24) so the cabin sits at ride height. It is not a child of `root`.
    - The shape is defined by smooth curves of z (`curve()`): `HW` half-width, `YT` hood and belt height, `YB` sill, `RT` top radius, plus `RY`/`RW` for the roof and glass. `prof(z)` and `halfPts()` turn them into cross-sections with tumblehome above the shoulder and a tuck at the sill. `rake()` leans the nose and tail faces.
    - Wheel arches are notched into the outer part of each section (`archY`, axles in `AX`) and lined with dark cladding. The well's inner wall sits at x 0.79, just outside the cabin door panels.
    - Front and rear details are placed on the raked faces with `FZ(y)`/`RZ(y)`.
  - Materials: `matFor()` builds a `MeshPhysicalMaterial` per CMF material from canvas-generated colour and bump textures (leather, fabric, suede, wood, burl, metal, carbon). UVs are box-projected, so each material's `tile` is a size in metres. `bumpScale` is the grain depth in metres (about 0.0001 to 0.0006). Larger values look like pebbles up close.
  - Colours: r128 treats material hex colours as linear. After the scene is built, every material's colour is converted from sRGB once, and `gl.paint` converts too, so the 3D matches the swatches. New flat-coloured materials created later need `.convertSRGBToLinear()`.
  - Reflections come from a procedural studio environment built with PMREM.
- **Camera:** one state object `{px,py,pz,yaw,pitch,d,fov}`. `d=0` is look-around from inside, `d>0` is orbit. It tweens toward `goal` and renders only when something changes (`dirty`). Views are in `VIEWS` and `ZVIEWS`.
- **Visibility trick (procedural car only):** the shell hides when the camera is within about 4.4 m of the car. The interior groups `gL`, `gR`, `gTop` and `gRear` hide by camera position so orbit views can look inside. See `updateCam()`.
- **Interaction:** drag to orbit, wheel and pinch to zoom, arrow keys to rotate. Clicking a part selects its zone by raycast. The opaque body blocks clicks (`shellBlock`).

## Known limits
- The detailed model is a Honda e, not the fictional "Aurora EV" in the sample data, and it carries Honda logos. The procedural fallback is still a concept-style model.
- The cutaway exposes the inside of the body shell (hollow panels, seat belts) because it slices a real model.
- The original `models/free__honda_e_detailed_interior_2021.glb` is 208 MB, which is over GitHub's 100 MB file limit. Don't commit it.
- Rendering has been checked on Apple GPU (Metal) in Chromium. Software WebGL looks different: it is darker and hides bump noise.
- Sign-off status (approve, shortlist, reject) is in memory only and is lost on reload.
- The underside is simple. The shell pops in and out at the zoom threshold with no fade. In a portrait viewport the exterior view crops the car.

## Next steps
1. Done for the Honda e (CC BY). To add another model, give `MODEL` a new entry and extend `zoneOf()` for its mesh names.
2. Persist selections and statuses (localStorage first, then a backend) and add a shareable link for a design state.
3. Merge into the repo's 2D demo: reuse the real material library and AI suggestions, add compare and sign-off history.
4. Add before/after comparison between presets, and spec sheet export (PDF or CSV).
5. Add PBR texture upload and swatch library import in place of procedural textures.
6. Performance: cap pixel ratio, add a texture loading state, test on mobile.

## Landing page (`landing/`)
- Vite 8, React 19 and TypeScript, with `framer-motion` 14 for animation. `npm run dev` serves it at http://localhost:5173.
- Design: a single-viewport, full-bleed video page, built from a design spec the user supplied (dark, white pill nav, dot-matrix display headline, glow CTA, count-up stats, burger menu at 720px and below). The brief overrides taste-skill's house rules here. The earlier split-stage design is kept in `landing/archive/split-stage/`.
  - Fonts: Inter (Google), BubbledotICG-FinePos (OnlineWebFonts CDN, which asks for the CC BY credit shown on the page), and the fallback `public/fonts/GeistPixel-Circle.woff2` (OFL, from the `geist` npm package).
  - Background: `public/media/cabin-orbit.webm` (24 s seamless 360° loop, 1600×800) plus a poster image. It was recorded from the configurator with playwright-cli `recordVideo` and trimmed with Playwright's ffmpeg at the frame where the end matches the start. The CSS dims it and adds a neutral scrim so the copy stays readable over the white car.
  - Honest content only. The spec's enterprise logos and AI copy were replaced with real swatches (`swatch-m*.png`) and real sample-data figures (16 materials, 5 zones, 4 views, 94% top preset).
  - Layering: overlay z2, header z3, sheet z4, so the burger's X stays clickable above the overlay.
- `src/data.ts` copies the sample data from `cmfstack-3d.html`. If the configurator's `MATS` change, update it too.
- Playwright's iPhone 15 viewport is 393×659, not 852 tall, so keep test clicks inside that height.
- `public/configurator/` and `public/demo/` are symlinks to `cmfstack-3d.html`, `models/honda-e.glb` and `index.html`, so the build ships them. Link to `/configurator/index.html`, not `/configurator/`.
- Testing: drive it with playwright-cli at 1440×900 and on an iPhone 15. Check that the fonts load, the video plays, the stats count up, there is no overflow, and the menu opens and closes (X, Escape, overlay) and its links work.
- It is separate from the configurator. Don't add a build step or npm dependencies to `cmfstack-3d.html`.
- `@playwright/cli` is a dev dependency, used for testing (see "Skills").
- npm 10.8.2, the global version on this machine, crashes in this project with `Cannot read properties of null (reading 'edgesOut')`, a peer resolver bug. Use npm 11 through npx instead, for example `npx -y npm@11 install <pkg>`. npm 11 blocks install scripts by default. `fsevents` is blocked, which is harmless.

## Skills
These are project skills in `.claude/skills/`, reviewed and copied from their source repos. To update one, re-clone the repo, read the diff and copy it in again. Don't run remote installers.
- `design-taste-frontend` (taste-skill v2, Leonxlnx/taste-skill, MIT) gives art direction for pages: researched directions, type, palette and sections, plus a screenshot-and-fix loop. Its scripts (`draw.mjs`, `inspect.mjs`, `lint.mjs`) need Node 22+, and this machine has Node 20.19.5, so for now only its written guidance applies. Its working files go in `.taste-skill/` at the project root.
- `impeccable` (v4.7.1, pbakaus/impeccable, Apache 2.0) handles design craft and commands (shape, audit, critique, polish, animate…). Its helper agents are `.claude/agents/impeccable-*.md`. Its launcher `scripts/impeccable` downloads a native binary on first use and checks it against `engine-checksums.txt`. Impeccable's optional hooks (run its checker after every Edit/Write and on Stop) are not installed, because they change every session. Ask the user before adding them to `.claude/settings.json`.
- `playwright-cli` (Microsoft `@playwright/cli`) drives a browser from the terminal. Run it from `landing/` with `npx playwright-cli open <url>`, then `snapshot`, `click`, `screenshot` and `close`. Session output goes to `landing/.playwright-cli/`, which is gitignored.
- For the landing page, use taste-skill for direction and Impeccable for craft and audits, then check the result with playwright-cli at desktop and phone widths.

## Working rules
- Keep the configurator dependency-free and single-file unless there is a good reason not to.
- Don't change data shapes without updating `renderRail`, `renderPanel` and the presets.
- Check changes visually with screenshots in headless Chromium. For the configurator, serve the folder (`python3 -m http.server 8765`) and wait until `#loading` is hidden before taking a screenshot (the procedural car stays hidden until the GLB has loaded). For the landing page, use playwright-cli. Serve three.min.js locally if the CDN is blocked.
