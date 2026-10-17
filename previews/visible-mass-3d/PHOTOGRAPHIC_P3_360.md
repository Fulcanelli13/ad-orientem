# The Visible Mass — Photographic P3 / Brompton and Newman 360°

## Scope and acceptance
Visitor-facing **standalone HTML** has been created and locally browser-tested:
`The_Visible_Mass_P3_Brompton_Newman_360.html` (approximately 17.8 MiB, generated as a conversation attachment, not committed to this repo).

This is a **review prototype**, not a newly published production route. Preserve the existing P2 photographic baseline and native Mass Explorer/LIVE/Simple/Missal readers. Keep draft PR #1309 unmerged until approved.

## Distinct authentic church environments
1. **Brompton Oratory, London**: actual 360° interior image by **David Iliff**. It is the primary traditional Roman Mass learning environment. A visitor rotates within the true panoramic capture and deliberately advances into the existing authentic high-altar photograph, canonical glossary discovery and formation/moment teaching.
2. **Newman University Church, Dublin**: separate actual 360° interior image by **David Iliff**. It is an architectural/symbolic Catholic church visit, **not a photographic representation of a TLM celebration**. Three distinct real close-up records by **Zairon** cover its altar from two viewpoints and its apse. Do not show a fictitious physical connection to Brompton or claim that Newman celebrates the 1962 Mass.
3. Documented TLM-action photographs from other venues remain explicitly labelled as different celebrations; keep their separate source and licences.

## Legal sources, with no payment or individual permission request
- Brompton 360: https://commons.wikimedia.org/wiki/File:Brompton_Oratory_360x180,_London,_UK_-_Diliff.jpg — CC BY-SA 3.0.
- Newman 360: https://commons.wikimedia.org/wiki/File:Newman_University_Church_Interior_360x180,_Dublin,_Ireland_-_Diliff.jpg — CC BY-SA 3.0.
- Newman main altar 1: https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Main_Altar_1.jpg — CC BY 4.0.
- Newman main altar 2: https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Main_Altar_2.jpg — CC BY 4.0.
- Newman apse: https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Apse_1.jpg — CC BY 4.0.

The images were downloaded through a verified, batched Wikimedia Commons image API acquisition script (committed at `tools/acquire-visible-mass-360-panorama.py`) and passed thumbnail aspect-ratio/metadata checks using `.github/workflows/visible-mass-360-panorama.yml`. The Commons metadata records original creators, licences, source URLs and alteration disclosure.

The prototype derives six 1024×1024 rectilinear cube-face JPG views from each genuine equirectangular panorama and uses browser-native CSS 3D to display an inside-the-cube view. This permits **true 360° rotation at a fixed photographed camera position**, including vertical looking and zoom. It does **not** fabricate walkable parallax or geometry. The adapted cube-face photographs remain subject to the underlying CC BY-SA licence conditions, with visible attribution and licensing.

## UX verified
- Desktop Chromium 1366×900, mobile Chromium 390×844.
- Genuine panorama faces loaded; rotate/yaw changes and horizontal views checked visually (including 95° and 180° views).
- Switch London↔Dublin; Newman altar gallery with three images; return to Brompton; high altar close-up; 8 existing Mass formation stages; photo source/photographer information; no JavaScript errors.
- Offline single HTML; no CDN requests, no local GLB import, no AI-generated images.
- Controls: pointer/touch drag to look, zoom buttons/mouse wheel, keyboard arrow keys. The current review build is ~18 MB due to 11 retained photographic images + panorama cube faces. A production build should use image-level caching or tiled compression for memory/network efficiency.
- A single 360° capture cannot move the camera through the nave; deliberate transitions to different real photographs must remain identified, not disguised.

## Integration constraints
Read-only projection of canonical `data/glossary/concepts-*.v1.json` and `data/learn/mass-formation-campion.v1.json` via the existing P2 layer. Do not duplicate owners, invent 1962 rubrics, or merge the existing Mass Formation/Mystery modules without Ultra Master parity. Preserve the native Mass reader card map.
